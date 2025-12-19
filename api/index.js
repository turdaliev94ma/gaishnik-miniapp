require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ===== ПРОВЕРКА, ЧТО СЕРВЕР ЖИВ =====
app.get("/", (req, res) => {
  res.status(200).send("✅ gaishnik-miniapp backend is working");
});

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "gaishnik-backend",
    time: new Date().toISOString(),
  });
});

// ===== ПРИМЕР ОСНОВНОГО ЭНДПОИНТА =====
// сюда потом будет стучаться Telegram Mini App
app.post("/ask", async (req, res) => {
  try {
    const { mode = "tickets", text = "" } = req.body || {};

    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    res.json({
      ok: true,
      mode,
      answer: `Ты спросил: "${text}"`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

// ❗ ВАЖНО: НИКАКОГО app.listen НА VERCEL
module.exports = (req, res) => app(req, res);

