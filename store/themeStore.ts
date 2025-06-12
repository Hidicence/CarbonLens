import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 碳排放趋势类型
export type EmissionTrend = 'decreasing' | 'stable' | 'increasing' | 'unknown';

interface ThemeState {
  isDarkMode: boolean;
  emissionTrend: EmissionTrend;
  customColorIntensity: number; // 0-100 范围内的强度值
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
  setEmissionTrend: (trend: EmissionTrend) => void;
  setColorIntensity: (intensity: number) => void;
  getThemeColors: () => {
    primary: string;
    secondary: string;
    gradientFrom: string;
    gradientTo: string;
  };
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: true, // Default to dark mode
      emissionTrend: 'unknown', // 默认为未知趋势
      customColorIntensity: 50, // 默认中等强度
      
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
      
      // 设置排放趋势
      setEmissionTrend: (trend: EmissionTrend) => set({ emissionTrend: trend }),
      
      // 设置颜色强度
      setColorIntensity: (intensity: number) => set({ 
        customColorIntensity: Math.max(0, Math.min(100, intensity)) 
      }),
      
      // 获取动态调整后的主题颜色
      getThemeColors: () => {
        const { emissionTrend, customColorIntensity, isDarkMode } = get();
        const intensity = customColorIntensity / 100; // 转换为0-1范围
        
        // 默认绿色主题（稳定趋势）
        let primary = '#10B981';
        let secondary = '#059669';
        let gradientFrom = isDarkMode ? '#064E3B' : '#10B981';
        let gradientTo = isDarkMode ? '#065F46' : '#059669';
        
        // 基于趋势调整颜色
        if (emissionTrend === 'decreasing') {
          // 减排趋势 - 更强的绿色/蓝色
          const blueShift = Math.round(80 * intensity);
          primary = `hsl(160, 84%, ${40 + intensity * 10}%)`;
          secondary = `hsl(165, 84%, ${30 + intensity * 8}%)`;
          gradientFrom = isDarkMode 
            ? `hsl(170, 84%, ${20 + intensity * 6}%)` 
            : `hsl(160, 84%, ${40 + intensity * 10}%)`;
          gradientTo = isDarkMode 
            ? `hsl(175, 84%, ${25 + intensity * 5}%)` 
            : `hsl(165, 84%, ${30 + intensity * 8}%)`;
        } 
        else if (emissionTrend === 'increasing') {
          // 增排趋势 - 偏向黄色/红色
          const redShift = Math.round(60 * intensity);
          primary = `hsl(${160 - redShift}, 84%, ${40 + intensity * 5}%)`;
          secondary = `hsl(${165 - redShift}, 84%, ${30 + intensity * 5}%)`;
          gradientFrom = isDarkMode 
            ? `hsl(${170 - redShift}, 84%, ${20 + intensity * 5}%)` 
            : `hsl(${160 - redShift}, 84%, ${40 + intensity * 5}%)`;
          gradientTo = isDarkMode 
            ? `hsl(${175 - redShift}, 84%, ${25 + intensity * 5}%)` 
            : `hsl(${165 - redShift}, 84%, ${30 + intensity * 5}%)`;
        }
        
        return { primary, secondary, gradientFrom, gradientTo };
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);