const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static('public'));

// API Anahtarlarını Al
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    const { message, model } = req.body;

    try {
        if (model.includes("Gemini")) {
            const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await geminiModel.generateContent(message);
            res.json({ text: result.response.text() });
        } 
        else if (model.includes("Claude")) {
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                messages: [{ role: "user", content: message }]
            }, {
                headers: {
                    'x-api-key': process.env.CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                }
            });
            res.json({ text: response.data.content[0].text });
        }
        else if (model.includes("GPT")) {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4o",
                messages: [{ role: "user", content: message }]
            }, {
                headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
            });
            res.json({ text: response.data.choices[0].message.content });
        }
    } catch (error) {
        console.error("API Hatası:", error.response ? error.response.data : error.message);
        res.status(500).json({ text: "Model şu an uykuda, anahtarları veya bağlantıyı kontrol et!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Çağan AI http://localhost:${PORT} adresinde yayında!`));
