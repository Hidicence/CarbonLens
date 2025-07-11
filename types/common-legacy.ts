/**
 * 應用支持的語言類型
 */
export type Languages = 'zh' | 'en';

/**
 * 主題模式類型
 */
export type ThemeMode = 'light' | 'dark';

/**
 * API響應狀態
 */
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * 通用響應數據結構
 */
export interface ApiResponse<T> {
  status: ApiStatus;
  data: T | null;
  error: string | null;
}

/**
 * 分頁數據結構
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 排序參數
 */
export interface SortParams {
  field: string;
  direction: SortDirection;
}

/**
 * 過濾參數
 */
export interface FilterParams {
  field: string;
  value: string | number | boolean | null;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
}

/**
 * 查詢參數
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: SortParams[];
  filters?: FilterParams[];
  search?: string;
}

/**
 * 設備類型和分類之間的對應關係
 */
export interface EquipmentTypeToCategory {
  [key: string]: string;
}

/**
 * 顏色主題類型
 */
export interface ColorTheme {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  textSecondary: string;
  disabled: string;
  placeholder: string;
} 