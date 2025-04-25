// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const DATA_FILE = path.join(__dirname, 'data.json');

// 配置中间件
app.use(express.json());

// 静态文件服务配置
const staticDir = isProduction ? 
  path.join(__dirname, 'dist/public') : 
  path.join(__dirname, 'public');
app.use(express.static(staticDir));

// API 路由
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
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '读取数据失败' });
  }
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
    return res.status(400).json({ error: '无效的数据格式' });
  }

  try {
    saveData(buttons);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '保存数据失败' });
  }
});

// HTML 路由
app.get(['/', '/admin'], (req, res) => {
  const filePath = req.path === '/' ? 'index.html' : 'admin.html';
  res.sendFile(path.join(staticDir, filePath));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('服务器内部错误');
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 ${isProduction ? '生产' : '开发'}模式`);
  console.log(`访问地址: http://localhost:${PORT}`);
  
  // 生产环境提示
  if (isProduction) {
    console.log('静态文件目录:', staticDir);
    console.log('数据文件位置:', DATA_FILE);
  }
});