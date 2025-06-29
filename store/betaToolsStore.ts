import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BetaToolsState {
  showBetaTools: boolean;
  toggleBetaTools: () => void;
  setBetaTools: (show: boolean) => void;
}

export const useBetaToolsStore = create<BetaToolsState>()(
  persist(
    (set) => ({
      showBetaTools: false, // 預設隱藏Beta工具
      
      toggleBetaTools: () => set((state) => ({ 
        showBetaTools: !state.showBetaTools 
      })),
      
      setBetaTools: (show: boolean) => set({ showBetaTools: show }),
    }),
    {
      name: 'beta-tools-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 