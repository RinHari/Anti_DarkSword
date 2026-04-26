```
project/
├── app/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── vendor/
│   ├── external-recommendation.js
│   └── campaign-widget.js
└── attacker/
    ├── external-recommendation.js
    └── campaign-widget.js
```

ターミナル1でメインサイトを起動
```
cd project/app
python3 -m http.server 3000
```

```
cd project/vendor
python3 -m http.server 4000
```

そのあと、ブラウザでこれを開く

http://localhost:3000/index.html


memo

今日は攻撃シナリオを１つに絞ってより具体化した

ベースのサイトにユーザ登録機能を作成して、攻撃シナリオとして、インライン実行によって描画ページを変更し、ログインしていないような状態のページにしてログインするように誘導、その後、そのログイン情報が描画されるというような攻撃方法で進めてみる


次はvendorを編集し、攻撃をより具体化していく

それが出来次第、CSPとSRIを組み込んだシステムを導入していこうと思う

CSP は、
「許可していない配信元から読むのを止める」
ためのもの

たとえば attacker を http://localhost:5000 にして、CSP では http://localhost:4000 だけ許すなら、5000番からの差し替えは止められる

SRI は、
「許可している配信元から来たファイルでも、中身が変わっていたら止める」
ためのもの

MDN でも、ドメインだけを信頼するより、SRI でファイルのハッシュを確認する方が安全で、配信元が侵害されていても改ざんファイルを防げると説明されている

attacker を 5000番 に置く場合
→ CSP が効く

attacker が 4000番の正規配信元そのものを侵害した場合
→ CSP だけでは通る
→ SRI が必要

CSPとSRIを導入
SRIはハッシュをつけることで特定のファイル以外は通さないように設定した。

それによって攻撃ファイルが実行されそうになるとリジェクトを食らわせるようになった。

次は具体的な処理の理解と、仕組みの整理、攻撃シナリオをより加えて、今回であればCSPは使っていないので、使った場合の処理等も加えてみる

**サーバーを利用したニュース情報の取得を実装**

moduleの追加
- express: Node.jsのための軽量で柔軟なwebアプリケーションフレームワーク(npm startで起動するのはこれを使っているおかげ)

    ルーティングなんかもできる
    GETリクエストのルートは
    ```
    app.get('/user/:id', function (req, res){
        const id = req.params.id; // /user/123 の 123 を取得
        const user = findUserById(id); // 123番のユーザをデータベースから取得
        res.send(user); // 取得したユーザ情報を返す
    })
    ```
    みたいな感じで書く。
    reqは受け取ったデータが全部入っている箱
    resはサーバからどう返すかを操作するリモコン

    今回使っているapp.use(express.static(path.join(__dirname)))
    これは、path.join(__dirname)/index.htmlで配信する形に宣言

    `__dirname` は「この `index.js` ファイルが置かれているディレクトリの絶対パス

    つまりは、/Users/〇〇/DarkSword/app/index.htmlで配信する形に宣言

    まとめると、app配下にあるhtmlやcss、jsをURLでアクセス可能にしている

    まだまだ使い方はあるが基本だけ残しておく(参照：https://qiita.com/ryome/items/16659012ed8aa0aa1fac)

- axios: HTTP通信を簡単に行うことができるJava Scriptのライブラリ

    APIを利用するクラウドサービスに対して、データを送受信することができる
    （今回はAPIを取得する形だから、これは必須）

    今回の場合、axios.getを使っている
    これは正しく、APIでサーバからデータを取得するのに利用

    const url = axios.post("http://localhost:3000/user/123", data)
    とすることで、データを送信することも可能

- dotenv:DBの機密情報やそれこそAPIkeyなど、外部に漏らしちゃダメなやつを守るために利用するやつ

    .envファイルに書いて、それを読み込む

    dotenv.config()を利用することで、.envファイルに書いた情報を読み込むことができちゃう

- path:Node.jsの組み込みモジュールで、ファイルパスを操作するための関数が提供されている


```
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); // .envファイルを読み込む

const app = express(); // expressを起動
const PORT = 3000; // ポート番号を設定

app.use(express.static(path.join(__dirname)));
// appディレクトリ内のファイルをURLでアクセス可能にする

// NewsAPI を中継
app.get("/news", async (req, res) => {//GETリクエストの設計
    try {
        const country = req.query.country || "us";
        const pageSize = Number(req.query.pageSize || 12);

        const response = await axios.get("https://newsapi.org/v2/top-headlines", {// NewsAPIから記事を取得
            params: {
                country,
                pageSize,
                apiKey: process.env.NEWS_API_KEY
            }// NewsAPIから取得するためのパラメータおよび条件の設定
        });

        res.json(response.data);
        //ちゃんと取得できていたらデータをくっつけて返す
    } catch (error) {
        console.error("NewsAPI error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

app.listen(PORT, () => {//サーバを起動
    console.log(`Server is running on http://localhost:${PORT}`);
});
```