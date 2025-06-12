import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      
      showFloatingAI: (mode = 'project') => {
        console.log(`調用 showFloatingAI，模式: ${mode}，設置 isVisible 為 true`);
        set({ isVisible: true, mode });
      },
      
      hideFloatingAI: () => {
        console.log('調用 hideFloatingAI，設置 isVisible 為 false');
        set({ isVisible: false });
      },
      
      toggleFloatingAI: () => {
        console.log('調用 toggleFloatingAI');
        set((state) => ({ isVisible: !state.isVisible }));
      },
    }),
    {
      name: 'floating-ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 