// server.js
require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// OpenAI APIの設定
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// エンドポイントの作成
app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;

  try {
    // 言語検出のリクエスト
    const languageDetectionResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: `Detect the language code of the following text that can be used in speech synthesis API (e.g., en-US, ja-JP). Only provide the language code: ${text}` }
      ],
      max_tokens: 10,
    });

    let detectedLanguage = languageDetectionResponse.choices[0].message.content.trim();

    // 言語コードの正規化
    const languageCodeMatch = detectedLanguage.match(/([a-z]{2}-[A-Z]{2})/);
    if (languageCodeMatch) {
      detectedLanguage = languageCodeMatch[1];
    } else {
      // デフォルトの言語コードにフォールバック
      detectedLanguage = 'en-US';
    }

    // 翻訳のリクエスト
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: `Translate the following text to ${targetLanguage}: ${text}` }
      ],
      max_tokens: Math.min(100 + Math.floor(text.length / 2), 2048),
    });

    const translatedText = translationResponse.choices[0].message.content.trim();

    // 単語リストの生成リクエスト
    const wordListResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: `Extract a list of unique, non-repeated base forms of important words from the following text. Ignore plural forms, verb conjugations, and focus on significant words only. Do not include repeated forms or provide numbers. Output only the words, separated by commas. Text: ${text}` }
      ],
      max_tokens: Math.min(200 + Math.floor(text.length / 4), 2048),
    });

    const wordList = wordListResponse.choices[0].message.content.trim().split(/[\n,]/).map(word => word.trim()).filter(word => word && !['list', 'unique', 'base', 'forms', 'important', 'words'].includes(word.toLowerCase()));

    // 単語ごとに意味と例文を取得
    const wordsWithDefinitions = await Promise.all(wordList.map(async (word, index) => {
      const definitionResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "user", content: `Translate the word "${word}" to ${targetLanguage} and provide its concise definition. Only provide the translation without any extra information. Do not include numbers or explanations.` }
        ],
        max_tokens: Math.min(50 + Math.floor(word.length / 2), 2048),
      });

      // 定義の取得とフィルタリング
      const definitionContent = definitionResponse.choices[0].message.content.trim();
      let definition;
      if (definitionContent.includes('\n')) {
        definition = definitionContent.split('\n')[0].trim();
      } else if (definitionContent.includes('「') && definitionContent.includes('」')) {
        definition = definitionContent.match(/「(.+?)」/)[1].trim();
      } else if (definitionContent.includes('"')) {
        definition = definitionContent.match(/"(.+?)"/)[1].trim();
      } else {
        definition = definitionContent;
      }

      // 例文の取得
      const exampleResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "user", content: `Provide an example sentence using the word "${word}" in ${detectedLanguage}.` }
        ],
        max_tokens: 100,
      });

      let example = exampleResponse.choices[0].message.content.trim();
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 正規表現のエスケープ処理
      example = example.replace(new RegExp(escapedWord, 'g'), '<strong>$&</strong>');

      // 例文の翻訳取得
      const exampleTranslationResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "user", content: `Translate the following sentence to ${targetLanguage}: ${example}` }
        ],
        max_tokens: 150,
      });
      const exampleTranslation = exampleTranslationResponse.choices[0].message.content.trim();

      return { index: index + 1, word, definition, example, exampleTranslation, language: detectedLanguage };
    }));

    // レスポンスの構成
    const formattedWordsWithDefinitions = wordsWithDefinitions.map(({ index, word, definition, example, exampleTranslation, language }) => ({
      number: index,
      word,
      definition,
      example: `${example}<br><em>${exampleTranslation}</em>`,
      language
    }));
        
    res.json({ translatedText, wordsWithDefinitions: formattedWordsWithDefinitions });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
