import { useThemeStore } from '../store/themeStore';

const generateColors = (isDarkMode: boolean, dynamicColors?: { 
  primary: string, 
  secondary: string, 
  gradientFrom: string, 
  gradientTo: string 
}) => {
  const baseColors = {
    light: {
      primary: dynamicColors?.primary || '#10B981', // Green
      secondary: dynamicColors?.secondary || '#059669', // Darker Green
      background: '#FFFFFF',
      card: '#F3F4F6',
      text: '#1F2937',
      secondaryText: '#6B7280',
      border: '#E5E7EB',
      inactive: '#9CA3AF',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      placeholder: '#9CA3AF',
      highlight: '#ECFDF5', // Light green highlight
      divider: '#E5E7EB',
      icon: '#6B7280',
      shadow: 'rgba(0, 0, 0, 0.1)',
      gradientFrom: dynamicColors?.gradientFrom || '#10B981',
      gradientTo: dynamicColors?.gradientTo || '#059669',
    },
    dark: {
      primary: dynamicColors?.primary || '#10B981', // Green
      secondary: dynamicColors?.secondary || '#059669', // Darker Green
      background: '#0F172A', // Very dark blue-black
      card: '#1E293B', // Dark slate
      text: '#F9FAFB',
      secondaryText: '#9CA3AF',
      border: '#334155', // Darker border
      inactive: '#64748B',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      placeholder: '#64748B',
      highlight: '#064E3B', // Dark green highlight
      divider: '#334155',
      icon: '#9CA3AF',
      shadow: 'rgba(0, 0, 0, 0.3)',
      cardAlt: '#293548', // Slightly lighter card for contrast
      gradientFrom: dynamicColors?.gradientFrom || '#064E3B', // Dark green for gradients
      gradientTo: dynamicColors?.gradientTo || '#065F46', // Medium green for gradients
    },
  };

  return isDarkMode ? baseColors.dark : baseColors.light;
};

// 创建静态颜色以供初始导入使用
const staticColors = {
  light: generateColors(false),
  dark: generateColors(true),
};

// 添加动态获取颜色的方法
export const getDynamicColors = () => {
  // 从主题存储中获取当前主题和动态颜色
  const themeStore = useThemeStore.getState();
  const isDarkMode = themeStore.isDarkMode;
  const dynamicColors = themeStore.getThemeColors();
  
  // 使用当前主题状态和动态颜色生成颜色方案
  return generateColors(isDarkMode, dynamicColors);
};

export default staticColors;