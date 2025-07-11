import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toastManager, type ToastMessage } from '@/components/ErrorToast';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'auth' | 'firebase' | 'validation' | 'ui' | 'system' | 'unknown';

export interface AppError {
  id: string;
  message: string;
  code?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
  userAgent?: string;
  userId?: string;
  resolved?: boolean;
}

interface ErrorState {
  // 錯誤記錄
  errors: AppError[];
  lastError: AppError | null;
  
  // 統計
  errorCount: number;
  sessionErrorCount: number;
  
  // 配置
  enableErrorReporting: boolean;
  enableToastNotifications: boolean;
  maxStoredErrors: number;
  
  // 方法
  logError: (error: Error | string, category?: ErrorCategory, context?: Record<string, any>) => string;
  logNetworkError: (error: any, url?: string, method?: string) => string;
  logAuthError: (error: any, action?: string) => string;
  logFirebaseError: (error: any, operation?: string) => string;
  logValidationError: (field: string, message: string, value?: any) => string;
  resolveError: (errorId: string) => void;
  clearErrors: () => void;
  clearSessionErrors: () => void;
  getErrorsByCategory: (category: ErrorCategory) => AppError[];
  getErrorsBySeverity: (severity: ErrorSeverity) => AppError[];
  
  // Toast 相關
  showErrorToast: (title: string, message: string, action?: ToastMessage['action']) => void;
  showWarningToast: (title: string, message: string, action?: ToastMessage['action']) => void;
  showSuccessToast: (title: string, message: string, action?: ToastMessage['action']) => void;
  showInfoToast: (title: string, message: string, action?: ToastMessage['action']) => void;
}

// 錯誤分類邏輯
const categorizeError = (error: Error | string): { category: ErrorCategory; severity: ErrorSeverity } => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();
  
  // 網絡錯誤
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || 
      lowerMessage.includes('timeout') || lowerMessage.includes('connection')) {
    return { category: 'network', severity: 'medium' };
  }
  
  // 認證錯誤
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || 
      lowerMessage.includes('forbidden') || lowerMessage.includes('login')) {
    return { category: 'auth', severity: 'high' };
  }
  
  // Firebase錯誤
  if (lowerMessage.includes('firebase') || lowerMessage.includes('firestore') || 
      lowerMessage.includes('permission-denied')) {
    return { category: 'firebase', severity: 'high' };
  }
  
  // 驗證錯誤
  if (lowerMessage.includes('validation') || lowerMessage.includes('required') || 
      lowerMessage.includes('invalid')) {
    return { category: 'validation', severity: 'low' };
  }
  
  // 系統錯誤
  if (lowerMessage.includes('out of memory') || lowerMessage.includes('crash') || 
      lowerMessage.includes('fatal')) {
    return { category: 'system', severity: 'critical' };
  }
  
  return { category: 'unknown', severity: 'medium' };
};

// 生成用戶友好的錯誤消息
const generateUserFriendlyMessage = (error: AppError): { title: string; message: string } => {
  switch (error.category) {
    case 'network':
      return {
        title: '網路連線問題',
        message: '請檢查您的網路連線，然後重試'
      };
    case 'auth':
      return {
        title: '登入問題',
        message: '您的登入狀態可能已過期，請重新登入'
      };
    case 'firebase':
      return {
        title: '資料同步問題',
        message: '與雲端資料庫的連線出現問題，請稍後再試'
      };
    case 'validation':
      return {
        title: '輸入驗證',
        message: error.message || '請檢查您的輸入內容'
      };
    case 'system':
      return {
        title: '系統錯誤',
        message: '應用程式遇到系統問題，請重新啟動應用程式'
      };
    default:
      return {
        title: '應用程式錯誤',
        message: '遇到未預期的問題，請重試或聯繫技術支援'
      };
  }
};

export const useErrorStore = create<ErrorState>()(
  persist(
    (set, get) => ({
      // 初始狀態
      errors: [],
      lastError: null,
      errorCount: 0,
      sessionErrorCount: 0,
      enableErrorReporting: true,
      enableToastNotifications: true,
      maxStoredErrors: 100,

      // 通用錯誤記錄
      logError: (error: Error | string, category?: ErrorCategory, context?: Record<string, any>) => {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        const auto = categorizeError(errorObj);
        const finalCategory = category || auto.category;
        
        const appError: AppError = {
          id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: errorObj.message,
          code: (errorObj as any).code,
          category: finalCategory,
          severity: auto.severity,
          timestamp: new Date().toISOString(),
          context,
          stack: errorObj.stack,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        };
        
        set((state) => ({
          errors: [appError, ...state.errors].slice(0, state.maxStoredErrors),
          lastError: appError,
          errorCount: state.errorCount + 1,
          sessionErrorCount: state.sessionErrorCount + 1,
        }));
        
        // 顯示Toast通知
        if (get().enableToastNotifications && appError.severity !== 'low') {
          const { title, message } = generateUserFriendlyMessage(appError);
          
          if (appError.severity === 'critical' || appError.severity === 'high') {
            toastManager.error(title, message);
          } else {
            toastManager.warning(title, message);
          }
        }
        
        // 輸出到控制台
        console.error(`[${finalCategory.toUpperCase()}] ${appError.message}`, {
          id: appError.id,
          context,
          stack: errorObj.stack
        });
        
        return appError.id;
      },

      // 網絡錯誤
      logNetworkError: (error: any, url?: string, method?: string) => {
        const context = { url, method, status: error.status };
        return get().logError(error, 'network', context);
      },

      // 認證錯誤
      logAuthError: (error: any, action?: string) => {
        const context = { action, code: error.code };
        return get().logError(error, 'auth', context);
      },

      // Firebase錯誤
      logFirebaseError: (error: any, operation?: string) => {
        const context = { operation, code: error.code };
        return get().logError(error, 'firebase', context);
      },

      // 驗證錯誤
      logValidationError: (field: string, message: string, value?: any) => {
        const context = { field, value };
        return get().logError(new Error(message), 'validation', context);
      },

      // 解決錯誤
      resolveError: (errorId: string) => {
        set((state) => ({
          errors: state.errors.map(error =>
            error.id === errorId ? { ...error, resolved: true } : error
          ),
        }));
      },

      // 清除所有錯誤
      clearErrors: () => {
        set({
          errors: [],
          lastError: null,
          errorCount: 0,
        });
      },

      // 清除會話錯誤
      clearSessionErrors: () => {
        set({ sessionErrorCount: 0 });
      },

      // 按類別獲取錯誤
      getErrorsByCategory: (category: ErrorCategory) => {
        return get().errors.filter(error => error.category === category);
      },

      // 按嚴重程度獲取錯誤
      getErrorsBySeverity: (severity: ErrorSeverity) => {
        return get().errors.filter(error => error.severity === severity);
      },

      // Toast快捷方法
      showErrorToast: (title: string, message: string, action?: ToastMessage['action']) => {
        if (get().enableToastNotifications) {
          toastManager.error(title, message, action);
        }
      },

      showWarningToast: (title: string, message: string, action?: ToastMessage['action']) => {
        if (get().enableToastNotifications) {
          toastManager.warning(title, message, action);
        }
      },

      showSuccessToast: (title: string, message: string, action?: ToastMessage['action']) => {
        if (get().enableToastNotifications) {
          toastManager.success(title, message, action);
        }
      },

      showInfoToast: (title: string, message: string, action?: ToastMessage['action']) => {
        if (get().enableToastNotifications) {
          toastManager.info(title, message, action);
        }
      },
    }),
    {
      name: 'error-store',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化錯誤記錄和配置，不包括會話數據
      partialize: (state) => ({
        errors: state.errors.slice(0, 50), // 只保存最近50個錯誤
        errorCount: state.errorCount,
        enableErrorReporting: state.enableErrorReporting,
        enableToastNotifications: state.enableToastNotifications,
        maxStoredErrors: state.maxStoredErrors,
      }),
    }
  )
);

// 導出工具函數，方便在其他地方使用
export const logError = (error: Error | string, category?: ErrorCategory, context?: Record<string, any>) => {
  return useErrorStore.getState().logError(error, category, context);
};

export const logNetworkError = (error: any, url?: string, method?: string) => {
  return useErrorStore.getState().logNetworkError(error, url, method);
};

export const logAuthError = (error: any, action?: string) => {
  return useErrorStore.getState().logAuthError(error, action);
};

export const logFirebaseError = (error: any, operation?: string) => {
  return useErrorStore.getState().logFirebaseError(error, operation);
};

export const logValidationError = (field: string, message: string, value?: any) => {
  return useErrorStore.getState().logValidationError(field, message, value);
};

export default useErrorStore; 