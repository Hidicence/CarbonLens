import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { emissionRoutes } from './routes/emissions';
import { statisticsRoutes } from './routes/statistics';
import { reportRoutes } from './routes/reports';
import { setupDatabase } from './database/setup';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : [
        'http://localhost:3000', 
        'http://localhost:19006', 
        'http://localhost:8090',
        'http://localhost:8080',
        'null'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 額外的CORS處理中間件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/reports', reportRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路由 ${req.originalUrl} 不存在`
  });
});

// 錯誤處理中間件
app.use(errorHandler);

// 啟動服務器
async function startServer() {
  try {
    // 設置數據庫
    await setupDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 CarbonLens 後端服務已啟動`);
      console.log(`📍 端口: ${PORT}`);
      console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ 啟動時間: ${new Date().toLocaleString('zh-TW')}`);
    });
  } catch (error) {
    console.error('❌ 服務器啟動失敗:', error);
    process.exit(1);
  }
}

startServer();

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('🔄 收到 SIGTERM 信號，正在關閉服務器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 收到 SIGINT 信號，正在關閉服務器...');
  process.exit(0);
}); 