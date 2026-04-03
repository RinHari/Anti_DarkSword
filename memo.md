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
