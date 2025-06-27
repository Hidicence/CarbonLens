import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

export const authRoutes = Router();

// 健康檢查 (臨時用於測試)
authRoutes.get('/health', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
}));

// 登錄 (未來實現)
authRoutes.post('/login', asyncHandler(async (req: Request, res: Response) => {
  // TODO: 實現登錄邏輯
  res.json({
    success: false,
    message: '登錄功能尚未實現'
  });
}));

// 註冊 (未來實現)
authRoutes.post('/register', asyncHandler(async (req: Request, res: Response) => {
  // TODO: 實現註冊邏輯
  res.json({
    success: false,
    message: '註冊功能尚未實現'
  });
}));

// 登出 (未來實現)
authRoutes.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // TODO: 實現登出邏輯
  res.json({
    success: true,
    message: '登出成功'
  });
}));

// 獲取用戶資料 (未來實現)
authRoutes.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  // TODO: 實現獲取用戶資料邏輯
  res.json({
    success: false,
    message: '用戶資料功能尚未實現'
  });
})); 