require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Проверка
app.get("/", (req, res) => {
  res.status(200).send("✅ gaishnik-miniapp backend is working");
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "gaishnik-backend",
    time: new Date().toISOString(),
  });
});

// ⚠️ ВАЖНО: НИКАКОГО app.listen()
// Vercel сам запускает функцию

module.exports = app;
