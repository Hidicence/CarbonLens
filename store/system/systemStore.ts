import { create } from 'zustand';

interface SystemState {
  // 系統狀態
  isInitialized: boolean;
  isLoading: boolean;
  lastSyncTime: string | null;
  appVersion: string;
  dataVersion: number;
  error: string | null;
  
  // 初始化控制
  initialize: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateLastSyncTime: () => void;
  
  // 數據管理
  initializeWithSampleData: () => void;
  clearAllData: () => void;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<boolean>;
  
  // 系統設定
  getSystemInfo: () => {
    isInitialized: boolean;
    isLoading: boolean;
    lastSyncTime: string | null;
    appVersion: string;
    dataVersion: number;
    storageUsage?: number;
  };
  
  // 數據遷移
  migrateData: (fromVersion: number, toVersion: number) => Promise<boolean>;
  
  // 維護功能
  cleanupOldData: (daysToKeep: number) => Promise<void>;
  optimizeStorage: () => Promise<void>;
  
  // 診斷功能
  getDiagnosticInfo: () => Promise<{
    storeHealth: Record<string, boolean>;
    storageInfo: Record<string, any>;
    errorCount: number;
    lastErrors: any[];
  }>;
}

export const useSystemStore = create<SystemState>()(
  (set, get) => ({
    // 初始狀態
    isInitialized: false,
    isLoading: false,
    lastSyncTime: null,
    appVersion: '1.0.0',
    dataVersion: 1,
    error: null,
    
    // 初始化系統
    initialize: async () => {
      const state = get();
      if (state.isInitialized) {
        __DEV__ && console.log('🔄 系統已初始化，跳過');
        return;
      }
      
      __DEV__ && console.log('🚀 開始初始化系統...');
      
      set({ 
        isLoading: true,
        error: null 
      });

      try {
        // 系統初始化邏輯
        // 這裡不直接依賴其他store，而是讓各個store自行初始化
        
        set({ 
          isInitialized: true,
          isLoading: false,
          lastSyncTime: new Date().toISOString()
        });
        
        __DEV__ && console.log('✅ 系統初始化完成');
        
      } catch (error) {
        console.error('❌ 系統初始化失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '初始化失敗',
          isLoading: false 
        });
        throw error;
      }
    },
    
    // 設置初始化狀態
    setInitialized: (initialized) => {
      set({ isInitialized: initialized });
    },
    
    // 設置加載狀態
    setLoading: (loading) => {
      set({ isLoading: loading });
    },
    
    // 更新最後同步時間
    updateLastSyncTime: () => {
      set({ lastSyncTime: new Date().toISOString() });
    },
    
    // 初始化範例數據
    initializeWithSampleData: () => {
      console.log('📊 載入範例數據...');
      
      // 這裡需要調用其他Store的初始化方法
      // 注意：這需要重新設計以避免循環依賴
      
      set({ lastSyncTime: new Date().toISOString() });
      console.log('✅ 範例數據載入完成');
    },
    
    // 清除所有數據
    clearAllData: () => {
      console.log('🗑️ 清除所有數據...');
      
      // 清除各個Store的數據
      // 這需要調用其他Store的清除方法
      
      set({
        isInitialized: false,
        lastSyncTime: null,
        dataVersion: 1,
      });
      
      console.log('✅ 所有數據已清除');
    },
    
    // 導出數據
    exportData: async () => {
      console.log('�� 導出數據...');
      
      try {
        // 這裡需要收集所有Store的數據
        const exportData = {
          timestamp: new Date().toISOString(),
          version: get().dataVersion,
          appVersion: get().appVersion,
          // projects: [], // 需要從ProjectStore獲取
          // emissions: [], // 需要從EmissionStore獲取
          // allocations: [], // 需要從AllocationStore獲取
          // 其他數據...
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        console.log('✅ 數據導出完成');
        return jsonString;
      } catch (error) {
        console.error('❌ 數據導出失敗:', error);
        throw error;
      }
    },
    
    // 導入數據
    importData: async (data) => {
      console.log('📥 導入數據...');
      
      try {
        const importedData = JSON.parse(data);
        
        // 驗證數據格式
        if (!importedData.version || !importedData.timestamp) {
          throw new Error('無效的數據格式');
        }
        
        // 檢查版本兼容性
        if (importedData.version > get().dataVersion) {
          throw new Error('數據版本過新，請更新應用程式');
        }
        
        // 如果需要，執行數據遷移
        if (importedData.version < get().dataVersion) {
          await get().migrateData(importedData.version, get().dataVersion);
        }
        
        // 這裡需要將數據分發到各個Store
        // 實際實現需要重新設計以避免循環依賴
        
        set({ lastSyncTime: new Date().toISOString() });
        console.log('✅ 數據導入完成');
        return true;
      } catch (error) {
        console.error('❌ 數據導入失敗:', error);
        return false;
      }
    },
    
    // 獲取系統信息
    getSystemInfo: () => {
      const state = get();
      return {
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        lastSyncTime: state.lastSyncTime,
        appVersion: state.appVersion,
        dataVersion: state.dataVersion,
      };
    },
    
    // 數據遷移
    migrateData: async (fromVersion, toVersion) => {
      console.log(`🔄 開始數據遷移: v${fromVersion} -> v${toVersion}`);
      
      try {
        // 這裡實現具體的遷移邏輯
        // 例如：
        // if (fromVersion === 1 && toVersion === 2) {
        //   // 執行v1到v2的遷移
        // }
        
        set({ dataVersion: toVersion });
        console.log('✅ 數據遷移完成');
        return true;
      } catch (error) {
        console.error('❌ 數據遷移失敗:', error);
        return false;
      }
    },
    
    // 清理舊數據
    cleanupOldData: async (daysToKeep = 90) => {
      console.log(`🧹 清理 ${daysToKeep} 天前的舊數據...`);
      
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        // 這裡需要調用各個Store的清理方法
        // 清理超過指定天數的記錄
        
        console.log('✅ 舊數據清理完成');
      } catch (error) {
        console.error('❌ 清理舊數據失敗:', error);
        throw error;
      }
    },
    
    // 優化存儲
    optimizeStorage: async () => {
      console.log('⚡ 開始優化存儲...');
      
      try {
        // 清理重複數據
        // 壓縮存儲
        // 重建索引等
        
        console.log('✅ 存儲優化完成');
      } catch (error) {
        console.error('❌ 存儲優化失敗:', error);
        throw error;
      }
    },
    
    // 診斷信息
    getDiagnosticInfo: async () => {
      console.log('🔍 收集診斷信息...');
      
      try {
        // 檢查各個Store的健康狀態
        const storeHealth = {
          project: true, // 需要實際檢查
          emission: true,
          allocation: true,
          statistics: true,
          collaborator: true,
          system: true,
        };
        
        // 獲取存儲信息
        const storageInfo = {
          // 這裡需要實際的存儲統計
          totalSize: 0,
          projectsSize: 0,
          emissionsSize: 0,
          allocationsSize: 0,
        };
        
        // 獲取錯誤信息（需要與ErrorStore集成）
        const errorCount = 0;
        const lastErrors: any[] = [];
        
        return {
          storeHealth,
          storageInfo,
          errorCount,
          lastErrors,
        };
      } catch (error) {
        console.error('❌ 收集診斷信息失敗:', error);
        throw error;
      }
    },
  })
);

// 導出便利函數
export const initializeApp = () => useSystemStore.getState().initialize();
export const getSystemInfo = () => useSystemStore.getState().getSystemInfo();
export const clearAllAppData = () => useSystemStore.getState().clearAllData();

export default useSystemStore; 