/**
 * CarbonLens 統一配置管理
 * 所有環境變數和配置的中央管理
 */

import { Platform } from 'react-native';

interface AppConfig {
  // AI 服務配置
  deepseekApiKey: string;
  
  // Google OAuth 配置
  googleClientId: string;
  
  // Firebase 配置
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  
  // API 配置
  apiBaseUrl: string;
  
  // 應用配置
  isDevelopment: boolean;
  enableDebug: boolean;
}

/**
 * 獲取環境變數，如果不存在則返回空字符串並記錄警告
 */
const getEnvVar = (key: string, required: boolean = true): string => {
  try {
    const value = process.env[key] || '';
    
    if (required && !value) {
      console.warn(`⚠️  環境變數 ${key} 未設置或為空`);
    }
    
    return value;
  } catch (error) {
    console.warn(`⚠️  讀取環境變數 ${key} 時發生錯誤:`, error);
    return '';
  }
};

/**
 * 根據平台獲取API基礎URL
 */
const getApiBaseUrl = (): string => {
  const envUrl = Platform.OS === 'web' 
    ? getEnvVar('EXPO_PUBLIC_WEB_API_BASE_URL', false)
    : getEnvVar('EXPO_PUBLIC_API_BASE_URL', false);
    
  if (envUrl) {
    return envUrl;
  }
  
  // 開發環境的後備配置
  return Platform.OS === 'web' 
    ? 'http://localhost:5173' 
    : 'http://10.0.2.2:3000';
};

/**
 * 應用配置對象
 */
export const config: AppConfig = {
  // AI 服務配置 - 暫時使用空值，避免啟動錯誤
  deepseekApiKey: getEnvVar('EXPO_PUBLIC_DEEPSEEK_API_KEY', false),
  
  // Google OAuth 配置 - 暫時使用空值，避免啟動錯誤
  googleClientId: getEnvVar('EXPO_PUBLIC_GOOGLE_CLIENT_ID', false),
  
  // Firebase 配置 - 暫時使用空值，避免啟動錯誤
  firebase: {
    apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY', false),
    authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', false),
    projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID', false),
    storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', false),
    messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', false),
    appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID', false),
  },
  
  // API 配置
  apiBaseUrl: getApiBaseUrl(),
  
  // 應用配置
  isDevelopment: getEnvVar('NODE_ENV', false) === 'development',
  enableDebug: getEnvVar('DEBUG', false) === 'true',
};

/**
 * 配置驗證函數
 */
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // 檢查關鍵配置
  if (!config.firebase.projectId) {
    errors.push('Firebase Project ID 未設置');
  }
  
  if (!config.googleClientId) {
    errors.push('Google Client ID 未設置');
  }
  
  if (!config.deepseekApiKey) {
    errors.push('DeepSeek API Key 未設置 (AI 功能將不可用)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 打印配置摘要 (不包含敏感信息)
 */
export const printConfigSummary = (): void => {
  const { isValid, errors } = validateConfig();
  
  console.log('📋 CarbonLens 配置摘要:');
  console.log(`├── 環境: ${config.isDevelopment ? '開發' : '生產'}`);
  console.log(`├── 除錯模式: ${config.enableDebug ? '啟用' : '停用'}`);
  console.log(`├── API 基礎URL: ${config.apiBaseUrl}`);
  console.log(`├── Firebase Project: ${config.firebase.projectId || '未設置'}`);
  console.log(`├── Google OAuth: ${config.googleClientId ? '已設置' : '未設置'}`);
  console.log(`├── DeepSeek AI: ${config.deepseekApiKey ? '已設置' : '未設置'}`);
  console.log(`└── 配置狀態: ${isValid ? '✅ 正常' : '❌ 有問題'}`);
  
  if (!isValid) {
    console.warn('⚠️  配置問題:');
    errors.forEach(error => console.warn(`   - ${error}`));
  }
};

export default config;