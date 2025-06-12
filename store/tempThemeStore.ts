import { create } from 'zustand';

interface TempThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useTempThemeStore = create<TempThemeState>()((set) => ({
  isDarkMode: true, // 預設為深色模式
  
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
})); 