import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// 條件導入AsyncStorage避免類型錯誤
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  // Web環境下的後備存儲
  AsyncStorage = {
    getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
  };
}

interface FloatingAIState {
  isVisible: boolean;
  mode: 'project' | 'operational';
  showFloatingAI: (mode?: 'project' | 'operational') => void;
  hideFloatingAI: () => void;
  toggleFloatingAI: () => void;
}

export const useFloatingAIStore = create<FloatingAIState>()(
  persist(
    (set) => ({
      isVisible: false,
      mode: 'project',
      
      showFloatingAI: (mode?: string) => {
        const validMode = mode === 'project' || mode === 'operational' ? mode : 'project';
        set({ isVisible: true, mode: validMode });
      },
      
      hideFloatingAI: () => {
        set({ isVisible: false });
      },
      
      toggleFloatingAI: () => {
        set((state) => ({ isVisible: !state.isVisible }));
      },
    }),
    {
      name: 'floating-ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 