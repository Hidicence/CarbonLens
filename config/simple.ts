/**
 * 簡化的配置文件 - 避免複雜的模組導入問題
 */

// 簡單的配置對象，支援環境變數但有後備值
export const simpleConfig = {
  // AI 服務配置
  getDeepSeekApiKey: () => {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || null;
    }
    return null;
  },
  
  // Google OAuth 配置
  getGoogleClientId: () => {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_WEB_CLIENT_ID || null;
    }
    return null;
  },
  
  // API 配置
  getApiBaseUrl: () => {
    if (typeof process !== 'undefined' && process.env) {
      // 使用平台檢測需要先確保 Platform 可用
      try {
        const Platform = require('react-native').Platform;
        const envUrl = Platform.OS === 'web' 
          ? process.env.EXPO_PUBLIC_WEB_API_BASE_URL 
          : process.env.EXPO_PUBLIC_API_BASE_URL;
          
        if (envUrl) {
          return envUrl;
        }
        
        return Platform.OS === 'web' 
          ? 'http://localhost:5173' 
          : 'http://10.0.2.2:3000';
      } catch (error) {
        return 'http://localhost:3000';
      }
    }
    return 'http://localhost:3000';
  }
};

export default simpleConfig;