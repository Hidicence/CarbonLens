import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

interface WindowDimensions {
  width: number;
  height: number;
}

// Web 環境下的默認尺寸
const DEFAULT_DIMENSIONS: WindowDimensions = {
  width: 375, // iPhone 標準寬度
  height: 812, // iPhone 標準高度
};

export const useDimensions = (): WindowDimensions => {
  const [dimensions, setDimensions] = useState<WindowDimensions>(() => {
    // 安全地獲取初始尺寸
    try {
      if (Platform.OS === 'web') {
        // Web 環境下使用 window 對象
        if (typeof window !== 'undefined') {
          return {
            width: window.innerWidth || DEFAULT_DIMENSIONS.width,
            height: window.innerHeight || DEFAULT_DIMENSIONS.height,
          };
        }
        return DEFAULT_DIMENSIONS;
      } else {
        // 原生環境下使用 Dimensions API
        return Dimensions.get('window');
      }
    } catch (error) {
      console.warn('無法獲取窗口尺寸，使用默認值:', error);
      return DEFAULT_DIMENSIONS;
    }
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web 環境下監聽 resize 事件
      const handleResize = () => {
        if (typeof window !== 'undefined') {
          setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } else {
      // 原生環境下監聽 Dimensions 變化
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setDimensions(window);
      });

      return () => subscription?.remove();
    }
  }, []);

  return dimensions;
};

// 靜態方法，用於在組件外部安全地獲取尺寸
export const getDimensions = (): WindowDimensions => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return {
          width: window.innerWidth || DEFAULT_DIMENSIONS.width,
          height: window.innerHeight || DEFAULT_DIMENSIONS.height,
        };
      }
      return DEFAULT_DIMENSIONS;
    } else {
      return Dimensions.get('window');
    }
  } catch (error) {
    console.warn('無法獲取窗口尺寸，使用默認值:', error);
    return DEFAULT_DIMENSIONS;
  }
};

export default useDimensions; 