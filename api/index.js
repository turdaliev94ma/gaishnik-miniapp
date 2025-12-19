const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.status(200).send("✅ gaishnik-miniapp backend is working");
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "gaishnik-miniapp", time: new Date().toISOString() });
});

app.post("/ask", async (req, res) => {
  try {
    const { mode = "tickets", text = "" } = req.body || {};
    res.status(200).json({ ok: true, mode, text });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

module.exports = (req, res) => app(req, res);
