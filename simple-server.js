const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8090;

const server = http.createServer((req, res) => {
  // 設置CORS頭部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 處理OPTIONS請求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 提供測試頁面
  if (req.url === '/' || req.url === '/test') {
    try {
      const htmlContent = fs.readFileSync('test-sync.html', 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(htmlContent);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('測試頁面未找到');
    }
    return;
  }

  // 提供CORS測試頁面
  if (req.url === '/cors') {
    try {
      const corsContent = fs.readFileSync('test-cors.html', 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(corsContent);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('CORS測試頁面未找到');
    }
    return;
  }

  // 提供測試指南
  if (req.url === '/guide') {
    try {
      const guideContent = fs.readFileSync('sync-test-guide.md', 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(guideContent);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('測試指南未找到');
    }
    return;
  }

  // 健康檢查
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      message: 'CarbonLens 測試服務器運行正常',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('頁面未找到');
});

server.listen(PORT, () => {
  console.log('🧪 CarbonLens 測試服務器已啟動');
  console.log(`📍 同步測試: http://localhost:${PORT}/test`);
  console.log(`🔄 CORS測試: http://localhost:${PORT}/cors`);
  console.log(`📋 測試指南: http://localhost:${PORT}/guide`);
  console.log(`💚 健康檢查: http://localhost:${PORT}/health`);
  console.log(`⏰ 啟動時間: ${new Date().toLocaleString('zh-TW')}`);
});

// 優雅關閉
process.on('SIGINT', () => {
  console.log('\n🔄 正在關閉測試服務器...');
  server.close(() => {
    console.log('✅ 測試服務器已關閉');
    process.exit(0);
  });
}); 