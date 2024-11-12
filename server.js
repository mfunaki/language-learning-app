// server.js
require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const app = express();

app.use(express.json());

// OpenAI APIの設定
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// エンドポイントの作成
app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `Translate the following text to ${targetLanguage}: ${text}` }
      ],
      max_tokens: 100,
    });

    const translatedText = response.choices[0].message.content.trim();
    res.json({ translatedText });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error translating text');
  }
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.static('public'));
