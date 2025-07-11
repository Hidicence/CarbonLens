/**
 * 數據庫相關類型定義
 * 
 * 此文件重新導出排放相關的類型定義，以保持向後兼容性
 */

// 重新導出排放類別定義（來自project.ts，避免重複定義）
export type { EmissionCategory } from './project';

/**
 * 數據庫查詢選項
 */
export interface DatabaseQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * 數據庫連接狀態
 */
export type DatabaseStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

/**
 * 數據庫配置
 */
export interface DatabaseConfig {
  provider: 'firebase' | 'sqlite' | 'postgresql';
  connectionString?: string;
  apiKey?: string;
  projectId?: string;
  options?: Record<string, any>;
}