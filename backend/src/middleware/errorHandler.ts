import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // 處理常見的數據庫錯誤
  if (error.message?.includes('UNIQUE constraint failed')) {
    statusCode = 409;
    message = '數據已存在，請檢查是否重複提交';
  } else if (error.message?.includes('FOREIGN KEY constraint failed')) {
    statusCode = 400;
    message = '關聯數據不存在，請檢查相關參數';
  } else if (error.message?.includes('NOT NULL constraint failed')) {
    statusCode = 400;
    message = '必填欄位不能為空';
  }

  // 處理 JWT 錯誤
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '無效的認證令牌';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '認證令牌已過期';
  }

  // 處理 Joi 驗證錯誤
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = `參數驗證失敗: ${error.message}`;
  }

  // 記錄錯誤
  if (statusCode >= 500) {
    console.error('❌ 服務器錯誤:', error);
  } else {
    console.warn('⚠️  客戶端錯誤:', message);
  }

  // 返回錯誤響應
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error
      })
    }
  });
};

// 創建自定義錯誤
export class CustomError extends Error implements AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 異步錯誤捕獲包裝器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 