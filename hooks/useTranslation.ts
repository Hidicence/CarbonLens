import { useLanguageStore } from '@/store/languageStore';
import translations, { TranslationKey } from '@/constants/translations';
import { Languages } from '@/types/common';

/**
 * 用於處理多語言翻譯的Hook
 * @returns 獲取翻譯文本的函數
 */
export const useTranslation = () => {
  const { language } = useLanguageStore();
  
  /**
   * 根據鍵名獲取對應語言的翻譯文本
   * @param key 翻譯鍵名
   * @returns 翻譯後的文本
   */
  const t = (key: TranslationKey | string): string => {
    try {
      const currentLanguage = language as Languages;
      
      // 檢查輸入參數
      if (!key || typeof key !== 'string') {
        console.warn(`翻譯鍵不是有效字符串:`, key);
        return '';
      }
      
      // 獲取對應語言的翻譯
      const translation = translations[currentLanguage]?.[key];
      
      // 如果找不到翻譯，返回鍵名並在控制台警告
      if (!translation || typeof translation !== 'string') {
        console.warn(`翻譯鍵 "${key}" 在 "${currentLanguage}" 語言中不存在或不是字符串`);
        // 返回一個安全的默認值
        return key || '';
      }
      
      return translation;
    } catch (error) {
      console.error('翻譯函數發生錯誤:', error, 'key:', key);
      return String(key || '');
    }
  };
  
  return { t };
};

export default useTranslation; 