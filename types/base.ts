/**
 * 基礎類型定義 - 整個應用的核心類型
 */

// ===== 基礎實體類型 =====

/**
 * 基礎實體介面 - 所有實體的共同字段
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 可軟刪除的實體
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: string;
  isDeleted?: boolean;
}

/**
 * 有創建者的實體
 */
export interface CreatedEntity extends BaseEntity {
  createdBy?: string;
}

/**
 * 完整實體類型（包含所有基礎字段）
 */
export interface FullEntity extends CreatedEntity, SoftDeletableEntity {}

// ===== 語言和地區 =====

/**
 * 支持的語言類型（統一定義）
 */
export type Language = 'zh' | 'en';

/**
 * 語言配置
 */
export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

/**
 * 多語言文本
 */
export interface LocalizedText {
  zh: string;
  en?: string;
}

// ===== 主題和樣式 =====

/**
 * 主題模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 顏色主題
 */
export interface ColorTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
  disabled: string;
  placeholder: string;
  // 狀態顏色
  success: string;
  warning: string;
  error: string;
  info: string;
  // 語意顏色
  carbon: string;
  energy: string;
  transport: string;
  waste: string;
}

// ===== API 和狀態管理 =====

/**
 * API 狀態枚舉
 */
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  REFRESHING = 'refreshing',
}

/**
 * 統一的API響應格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API 錯誤類型
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // 字段級錯誤
}

/**
 * API 元數據
 */
export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  version?: string;
  pagination?: PaginationMeta;
}

/**
 * 分頁元數據
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 分頁數據結構
 */
export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

// ===== 查詢和篩選 =====

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 排序參數
 */
export interface SortParams<T = string> {
  field: T;
  direction: SortDirection;
}

/**
 * 篩選運算符
 */
export type FilterOperator = 
  | 'eq'        // 等於
  | 'neq'       // 不等於
  | 'gt'        // 大於
  | 'gte'       // 大於等於
  | 'lt'        // 小於
  | 'lte'       // 小於等於
  | 'in'        // 包含於
  | 'nin'       // 不包含於
  | 'contains'  // 字符串包含
  | 'startsWith' // 字符串開始於
  | 'endsWith'   // 字符串結束於
  | 'between'    // 範圍內
  | 'exists'     // 存在
  | 'null'       // 為空
  | 'notNull';   // 非空

/**
 * 篩選參數
 */
export interface FilterParams<T = any> {
  field: string;
  operator: FilterOperator;
  value: T;
}

/**
 * 搜索參數
 */
export interface SearchParams {
  query: string;
  fields?: string[]; // 搜索的字段
  fuzzy?: boolean;   // 模糊搜索
}

/**
 * 查詢參數（統一所有查詢）
 */
export interface QueryParams<T = string> {
  // 分頁
  page?: number;
  pageSize?: number;
  // 排序
  sort?: SortParams<T>[];
  // 篩選
  filters?: FilterParams[];
  // 搜索
  search?: SearchParams;
  // 包含關聯數據
  include?: string[];
  // 選擇字段
  select?: string[];
}

// ===== 日期和時間 =====

/**
 * 日期範圍
 */
export interface DateRange {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

/**
 * 時間週期類型
 */
export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * 時間分組參數
 */
export interface TimeGrouping {
  period: TimePeriod;
  timezone?: string;
}

// ===== 地理位置 =====

/**
 * 地理坐標
 */
export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
}

/**
 * 地址信息
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: GeoCoordinate;
}

// ===== 文件和媒體 =====

/**
 * 文件類型
 */
export type FileType = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'document' 
  | 'spreadsheet' 
  | 'presentation'
  | 'archive'
  | 'other';

/**
 * 文件信息
 */
export interface FileInfo {
  id: string;
  name: string;
  type: FileType;
  mimeType: string;
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

// ===== 權限和角色 =====

/**
 * 基礎權限操作
 */
export type Permission = 'read' | 'write' | 'delete' | 'manage';

/**
 * 資源權限映射
 */
export interface ResourcePermissions {
  [resource: string]: Permission[];
}

/**
 * 角色定義
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: ResourcePermissions;
  isSystemRole?: boolean;
}

// ===== 狀態管理 =====

/**
 * 加載狀態
 */
export interface LoadingState {
  isLoading: boolean;
  isRefreshing?: boolean;
  loadingMessage?: string;
}

/**
 * 錯誤狀態
 */
export interface ErrorState {
  hasError: boolean;
  error?: ApiError;
  errorMessage?: string;
}

/**
 * 完整的異步狀態
 */
export interface AsyncState<T = any> extends LoadingState, ErrorState {
  data?: T;
  lastUpdated?: string;
}

// ===== 通知和提示 =====

/**
 * 通知類型
 */
export type NotificationType = 'success' | 'warning' | 'error' | 'info';

/**
 * 通知信息
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // 毫秒，undefined 表示不自動消失
  actions?: NotificationAction[];
  createdAt: string;
}

/**
 * 通知操作
 */
export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// ===== 設定和配置 =====

/**
 * 應用設定
 */
export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  // 碳足跡相關設定
  defaultUnit: 'kg' | 'tonnes';
  precision: number; // 小數點位數
  showEstimatedData: boolean;
  enableOfflineMode: boolean;
}

/**
 * 用戶偏好設定
 */
export interface UserPreferences extends AppSettings {
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
}

// ===== 導出所有類型 =====

export * from './common-legacy'; // 暫時保留舊的 common.ts 以避免破壞性變更

// 類型工具函數
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;
export type ID = string;
export type Timestamp = string; // ISO 8601 格式 