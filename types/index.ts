/**
 * 統一的類型定義導出入口
 * 
 * 此文件提供所有類型定義的統一導入接口，
 * 使其他模塊可以從單一位置導入所需的類型。
 */

// ===== 基礎類型 =====
export * from './base';

// ===== 核心功能類型 =====
export * from './auth';
export * from './project';
export * from './equipment';
export * from './certification';

// ===== 語言和本地化 =====
export * from './language';

// ===== 數據庫相關 =====
export * from './database';

// ===== 常用類型重新導出 =====

// 基礎類型別名
export type {
  ID,
  Timestamp,
  Language,
  ThemeMode,
  ApiResponse,
  PaginatedData,
  QueryParams,
  DateRange,
} from './base';

// 認證相關別名
export type {
  User,
  AuthState,
  LoginCredentials,
} from './auth';

// 專案相關別名
export type {
  Project,
  ProjectStatus,
  ProductionStage,
  ProjectEmissionRecord,
  NonProjectEmissionRecord,
  Collaborator,
  CollaboratorRole,
} from './project';

// 設備相關別名
export type {
  EquipmentType,
  CameraEquipment,
  LightingEquipment,
  TransportEquipment,
} from './equipment';

// 認證標準別名
export type {
  CertificationStandard,
  CarbonLabel,
} from './certification';

// 向後兼容的類型導出
export type {
  LegacyLanguages,
  EquipmentTypeToCategory,
  LegacyColorTheme,
} from './common'; 