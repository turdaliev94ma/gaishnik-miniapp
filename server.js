app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <title>Карманный ГАИшник</title>
      </head>
      <body style="font-family: sans-serif; padding: 40px;">
        <h1>🚗 Карманный ГАИшник</h1>
        <p>Мини-приложение Telegram</p>
      </body>
    </html>
  `);
});

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3000;

// ====== ПРОСТАЯ ПРОВЕРКА: сервер жив ======
app.get("/", (req, res) => {
  res.status(200).send("✅ API is working");
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "gaishnik-backend", time: new Date().toISOString() });
});

// ====== ОСНОВНОЙ ЭНДПОИНТ ДЛЯ БОТА/МИНИ-АППЫ ======
// Туда будем слать { mode: "tickets"|"trainer"|"dtp", text: "..." }
app.post("/ask", async (req, res) => {
  try {
    const { mode = "tickets", text = "" } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ ok: false, error: "Передай text строкой" });
    }

    // === РЕЖИМ БЕЗ ИИ (чтобы всё работало уже сейчас) ===
    // Если нет ключа или включен MOCK_MODE — отвечаем заглушкой
    const mockMode = (process.env.MOCK_MODE || "").toLowerCase() === "true";
    const hasKey = !!process.env.OPENAI_API_KEY;

    if (mockMode || !hasKey) {
      return res.json({
        ok: true,
        ai: false,
        answer:
          `✅ Принял: "${text}"\n` +
          `Режим: ${mode}\n\n` +
          `Я пока без ИИ. Но backend жив, и Mini App/бот уже могут общаться с сервером.\n` +
          `Чтобы включить ИИ позже — добавим ключ и выключим MOCK_MODE.`
      });
    }

    // === РЕЖИМ С ИИ (включим позже, когда решим вопрос 403) ===
    const OpenAI = require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system =
      mode === "dtp"
        ? "Ты помощник по действиям при ДТП. Дай четкие шаги, без воды."
        : mode === "trainer"
        ? "Ты тренер по ПДД, задавай вопросы и объясняй коротко и понятно."
        : "Ты помощник по разбору билетов ПДД. Объясняй по шагам, как преподаватель.";

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: text }
      ]
    });

    const answer = response.output_text || "Не смог сформировать ответ.";

    return res.json({ ok: true, ai: true, answer });
  } catch (e) {
    // сюда упадет и 403, и всё что угодно — покажем нормально
    return res.status(500).json({
      ok: false,
      error: e?.message || "Unknown error",
      hint: "Если ошибка 403 Country not supported — это про IP/регион. Mini App тут ни при чем."
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend запущен на http://localhost:${PORT}`);
  console.log(`✅ Проверка: открой http://localhost:${PORT}/health`);
});


