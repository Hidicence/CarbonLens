import { EmissionCategory, EmissionSource } from '@/types/project';
import { OPERATIONAL_CATEGORIES, OPERATIONAL_SOURCES, PROJECT_CATEGORIES, PROJECT_SOURCES } from '@/mocks/projects';
import { useLanguageStore } from '@/store/languageStore';

/**
 * 獲取帶翻譯的排放類別
 * @param t 翻譯函數
 * @returns 包含翻譯名稱的排放類別數組
 */
export const getTranslatedOperationalCategories = (t: (key: string) => string): EmissionCategory[] => {
  return OPERATIONAL_CATEGORIES.map(category => ({
    ...category,
    name: t(`category.${category.id}`)
  }));
};

/**
 * 獲取帶翻譯的專案排放類別
 * @param t 翻譯函數
 * @returns 包含翻譯名稱的專案排放類別數組
 */
export const getTranslatedProjectCategories = (t: (key: string) => string): EmissionCategory[] => {
  return PROJECT_CATEGORIES.map(category => ({
    ...category,
    name: t(`category.${category.id}`)
  }));
};

/**
 * 獲取帶翻譯的營運排放源
 * @param t 翻譯函數
 * @returns 包含翻譯名稱的營運排放源數組
 */
export const getTranslatedOperationalSources = (t: (key: string) => string): EmissionSource[] => {
  return OPERATIONAL_SOURCES.map(source => ({
    ...source,
    name: t(`source.${source.id}`)
  }));
};

/**
 * 獲取帶翻譯的專案排放源
 * @param t 翻譯函數
 * @returns 包含翻譯名稱的專案排放源數組
 */
export const getTranslatedProjectSources = (t: (key: string) => string): EmissionSource[] => {
  return PROJECT_SOURCES.map(source => ({
    ...source,
    name: t(`source.${source.id}`)
  }));
};

/**
 * 根據ID獲取翻譯後的類別名稱
 * @param categoryId 類別ID
 * @param t 翻譯函數
 * @returns 翻譯後的類別名稱
 */
export const getTranslatedCategoryName = (categoryId: string, t: (key: string) => string): string => {
  return t(`category.${categoryId}`);
};

/**
 * 根據ID獲取翻譯後的排放源名稱
 * @param sourceId 排放源ID
 * @param t 翻譯函數
 * @returns 翻譯後的排放源名稱
 */
export const getTranslatedSourceName = (sourceId: string, t: (key: string) => string): string => {
  return t(`source.${sourceId}`);
};

/**
 * 獲取按階段分組的翻譯類別
 * @param t 翻譯函數
 * @returns 按階段分組的翻譯類別
 */
export const getTranslatedStageCategories = (t: (key: string) => string) => {
  const translatedCategories = getTranslatedProjectCategories(t);
  
  return {
    'pre-production': translatedCategories.filter(cat => cat.stage === 'pre-production'),
    'production': translatedCategories.filter(cat => cat.stage === 'production'),
    'post-production': translatedCategories.filter(cat => cat.stage === 'post-production'),
  };
}; 