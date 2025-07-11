/**
 * 語言相關類型定義 - 統一後的語言支援
 */

import type { Language, LanguageConfig, LocalizedText } from './base';

// 重新導出基礎語言類型
export type { Language, LanguageConfig, LocalizedText } from './base';

/**
 * 語言狀態（為了向後兼容保留）
 */
export interface LanguageState {
  currentLanguage: Language;
  t: (key: string) => string;
}

/**
 * 支援的語言列表
 */
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'zh',
    name: 'Chinese Traditional',
    nativeName: '繁體中文',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
];

/**
 * 預設語言
 */
export const DEFAULT_LANGUAGE: Language = 'zh';