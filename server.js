const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = 'data.json';

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (error) {
    return [];
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/buttons', (req, res) => {
  res.json(readData());
});

app.post('/api/buttons', (req, res) => {
  const buttons = req.body;
  
  const isValid = Array.isArray(buttons) && buttons.every(btn => {
    try {
      return (
        typeof btn.name === 'string' && 
        btn.name.trim().length > 0 &&
        typeof btn.url === 'string' &&
        btn.url.trim().length > 0 &&
        new URL(btn.url)
      );
    } catch (error) {
      return false;
    }
  });

  if (!isValid) {
    return res.status(400).json({ error: '数据校验失败' });
  }

  saveData(buttons);
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务运行中：http://localhost:${PORT}`);
});