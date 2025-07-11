/**
 * 通用類型定義 - 統一的類型導出入口
 * 
 * 此文件重新導出所有基礎類型，並提供向後兼容性
 */

// 重新導出基礎類型
export * from './base';

// 重新導出舊的類型（向後兼容）
export type {
  Languages as LegacyLanguages,
  EquipmentTypeToCategory,
  ColorTheme as LegacyColorTheme,
} from './common-legacy';

// 為了兼容性，重新導出一些重命名的類型
export type Languages = import('./base').Language;  // 統一為 Language 