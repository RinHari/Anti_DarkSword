const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 3000;

// appディレクトリ内の index.html / style.css / app.js を配信
app.use(express.static(path.join(__dirname)));

// NewsAPI を中継
app.get("/news", async (req, res) => {
    try {
        const country = req.query.country || "us";
        const pageSize = Number(req.query.pageSize || 12);

        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
            params: {
                country,
                pageSize,
                apiKey: process.env.NEWS_API_KEY
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("NewsAPI error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});