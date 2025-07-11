import { logError, logNetworkError, logAuthError, logFirebaseError, useErrorStore } from '@/store/errorStore';

// 重試配置
interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  retryCondition?: (error: any) => boolean;
}

// 預設重試配置
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  delay: 1000,
  backoff: true,
  retryCondition: (error: any) => {
    // 只重試網絡錯誤和超時錯誤
    const isNetworkError = !error.response;
    const isTimeoutError = error.code === 'NETWORK_ERROR' || error.message?.includes('timeout');
    const is5xxError = error.response?.status >= 500;
    
    return isNetworkError || isTimeoutError || is5xxError;
  }
};

// 延遲函數
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 帶重試機制的異步函數執行器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, delay: baseDelay, backoff, retryCondition } = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // 如果是最後一次嘗試，直接拋出錯誤
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 檢查是否應該重試
      if (!retryCondition(error)) {
        throw error;
      }
      
      // 計算延遲時間（支援指數退避）
      const delayTime = backoff ? baseDelay * Math.pow(2, attempt) : baseDelay;
      
      console.warn(`嘗試 ${attempt + 1}/${maxRetries + 1} 失敗，${delayTime}ms 後重試...`, error.message);
      
      await delay(delayTime);
    }
  }
  
  throw lastError;
}

/**
 * 網絡請求錯誤處理包裝器
 */
export async function withNetworkErrorHandling<T>(
  fn: () => Promise<T>,
  context?: { url?: string; method?: string; operation?: string }
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // 記錄網絡錯誤
    const errorId = logNetworkError(error, context?.url, context?.method);
    
    // 添加錯誤ID到錯誤對象，方便追蹤
    error.errorId = errorId;
    
    throw error;
  }
}

/**
 * Firebase錯誤處理包裝器
 */
export async function withFirebaseErrorHandling<T>(
  fn: () => Promise<T>,
  operation?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // 記錄Firebase錯誤
    const errorId = logFirebaseError(error, operation);
    
    // 添加錯誤ID到錯誤對象
    error.errorId = errorId;
    
    throw error;
  }
}

/**
 * 認證錯誤處理包裝器
 */
export async function withAuthErrorHandling<T>(
  fn: () => Promise<T>,
  action?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // 記錄認證錯誤
    const errorId = logAuthError(error, action);
    
    // 添加錯誤ID到錯誤對象
    error.errorId = errorId;
    
    throw error;
  }
}

/**
 * 通用異步操作錯誤處理
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options?: {
    fallback?: T;
    onError?: (error: any) => void;
    silent?: boolean;
    retry?: RetryConfig;
  }
): Promise<T | undefined> {
  try {
    if (options?.retry) {
      return await withRetry(fn, options.retry);
    } else {
      return await fn();
    }
  } catch (error: any) {
    if (!options?.silent) {
      console.error('safeAsync error:', error);
      
      // 記錄錯誤（如果還沒有記錄）
      if (!error.errorId) {
        logError(error);
      }
    }
    
    // 執行自定義錯誤處理
    if (options?.onError) {
      options.onError(error);
    }
    
    // 返回fallback值
    if (options?.fallback !== undefined) {
      return options.fallback;
    }
    
    return undefined;
  }
}

/**
 * 表單驗證錯誤處理
 */
export function handleValidationErrors(
  errors: Record<string, string>,
  showToast: boolean = true
): void {
  const errorStore = useErrorStore.getState();
  
  Object.entries(errors).forEach(([field, message]) => {
    errorStore.logValidationError(field, message);
  });
  
  if (showToast && Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    errorStore.showErrorToast('輸入驗證失敗', firstError);
  }
}

/**
 * 友好的錯誤消息生成器
 */
export function getFriendlyErrorMessage(error: any): { title: string; message: string } {
  if (typeof error === 'string') {
    return { title: '錯誤', message: error };
  }
  
  const errorMessage = error.message?.toLowerCase() || '';
  
  // 網絡錯誤
  if (!error.response || errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      title: '網路連線問題',
      message: '請檢查您的網路連線，然後重試'
    };
  }
  
  // HTTP狀態碼錯誤
  if (error.response?.status) {
    const status = error.response.status;
    
    if (status >= 500) {
      return {
        title: '伺服器錯誤',
        message: '伺服器目前無法處理您的請求，請稍後再試'
      };
    }
    
    if (status === 404) {
      return {
        title: '找不到資源',
        message: '請求的資源不存在或已被移除'
      };
    }
    
    if (status === 403) {
      return {
        title: '權限不足',
        message: '您沒有權限執行此操作'
      };
    }
    
    if (status === 401) {
      return {
        title: '認證失敗',
        message: '請重新登入後再試'
      };
    }
    
    if (status === 400) {
      return {
        title: '請求錯誤',
        message: '請檢查您的輸入內容'
      };
    }
  }
  
  // Firebase錯誤
  if (error.code?.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/user-not-found':
        return { title: '帳號不存在', message: '找不到此帳號，請檢查電子郵件或先註冊' };
      case 'auth/wrong-password':
        return { title: '密碼錯誤', message: '密碼不正確，請重新輸入' };
      case 'auth/invalid-email':
        return { title: '電子郵件格式錯誤', message: '請輸入有效的電子郵件地址' };
      case 'auth/too-many-requests':
        return { title: '嘗試次數過多', message: '登入嘗試次數過多，請稍後再試' };
      case 'auth/network-request-failed':
        return { title: '網路連線失敗', message: '請檢查網路設定並重試' };
      default:
        return { title: '認證錯誤', message: '登入過程中發生錯誤，請重試' };
    }
  }
  
  if (error.code?.startsWith('firestore/')) {
    return {
      title: '資料同步問題',
      message: '與雲端資料庫的連線出現問題，請稍後再試'
    };
  }
  
  // 預設錯誤
  return {
    title: '應用程式錯誤',
    message: error.message || '遇到未預期的問題，請重試或聯繫技術支援'
  };
}

/**
 * 全域未處理錯誤監聽器
 */
export function setupGlobalErrorHandlers(): void {
  // 處理未捕獲的Promise拒絕
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      logError(event.reason || new Error('Unhandled promise rejection'));
      event.preventDefault();
    });
    
    // 處理全域JavaScript錯誤
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      logError(event.error || new Error(event.message));
    });
  }
  
  // React Native錯誤處理
  const globalWithErrorUtils = global as any;
  if (typeof global !== 'undefined' && globalWithErrorUtils.ErrorUtils) {
    const originalHandler = globalWithErrorUtils.ErrorUtils.getGlobalHandler();
    
    globalWithErrorUtils.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      console.error('React Native global error:', error);
      logError(error);
      
      // 調用原始處理器
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
}

/**
 * 錯誤恢復建議
 */
export function getErrorRecoveryActions(error: any): Array<{ label: string; action: () => void }> {
  const actions: Array<{ label: string; action: () => void }> = [];
  
  // 網絡錯誤恢復
  if (!error.response || error.message?.includes('network')) {
    actions.push({
      label: '重試',
      action: () => {
        // 這裡需要重新執行失敗的操作
        console.log('重試操作');
      }
    });
  }
  
  // 認證錯誤恢復
  if (error.code?.startsWith('auth/') || error.response?.status === 401) {
    actions.push({
      label: '重新登入',
      action: () => {
        // 導航到登入頁面
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    });
  }
  
  // 通用恢復操作
  actions.push({
    label: '回到首頁',
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  });
  
  return actions;
}

// 導出常用的錯誤處理函數
export {
  logError,
  logNetworkError,
  logAuthError,
  logFirebaseError,
  useErrorStore
}; 