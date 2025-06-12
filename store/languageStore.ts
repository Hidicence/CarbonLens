import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/constants/translations';
import { Languages } from '@/types/common';

interface LanguageState {
  language: Languages;
  t: (key: string) => string;
  setLanguage: (language: Languages) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'zh' as Languages,
      t: (key: string) => {
        const currentLanguage = get().language;
        return translations[currentLanguage][key] || key;
      },
      setLanguage: (language: Languages) => set({ language }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);