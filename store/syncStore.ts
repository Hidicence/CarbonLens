import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncManager, SyncStatus, SyncResult, SyncConfig } from '@/services/syncManager';
import { projectApi, emissionApi, operationalApi } from '@/services/apiService';
import { useProjectStore } from './projectStore';

interface SyncState {
  // 同步狀態
  syncStatus: SyncStatus;
  lastSyncResult: SyncResult | null;
  isSyncing: boolean;
  syncProgress: number; // 0-100
  
  // 連接狀態
  isOnline: boolean;
  isConnectedToServer: boolean;
  
  // 同步配置
  syncConfig: SyncConfig;
  
  // 操作方法
  startSync: (force?: boolean) => Promise<SyncResult>;
  stopSync: () => void;
  updateSyncConfig: (config: Partial<SyncConfig>) => Promise<void>;
  
  // 手動同步方法
  syncProjects: () => Promise<void>;
  syncEmissions: () => Promise<void>;
  syncOperational: () => Promise<void>;
  
  // 狀態檢查
  checkConnection: () => Promise<boolean>;
  getSyncStatus: () => {
    lastSyncTime: string | null;
    config: SyncConfig;
    isAutoSyncEnabled: boolean;
  };
  
  // 初始化
  initialize: () => Promise<void>;
  
  // 重置
  resetSync: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      // 初始狀態
      syncStatus: SyncStatus.IDLE,
      lastSyncResult: null,
      isSyncing: false,
      syncProgress: 0,
      isOnline: false,
      isConnectedToServer: false,
      syncConfig: {
        autoSync: true,
        syncInterval: 15,
        maxRetries: 3,
        conflictResolution: 'server'
      },

      // 開始同步
      startSync: async (force = false) => {
        const state = get();
        
        if (state.isSyncing) {
          return {
            status: SyncStatus.ERROR,
            message: '同步正在進行中',
            timestamp: new Date().toISOString()
          };
        }

        set({ isSyncing: true, syncStatus: SyncStatus.SYNCING, syncProgress: 0 });

        try {
          // 檢查連接
          const isConnected = await syncManager.checkConnection();
          set({ isConnectedToServer: isConnected });

          if (!isConnected) {
            const result: SyncResult = {
              status: SyncStatus.OFFLINE,
              message: '無法連接到服務器',
              timestamp: new Date().toISOString()
            };
            set({ 
              syncStatus: SyncStatus.OFFLINE, 
              lastSyncResult: result, 
              isSyncing: false 
            });
            return result;
          }

          // 執行同步
          set({ syncProgress: 25 });
          const result = await syncManager.sync(force);
          
          set({ syncProgress: 100 });
          
          // 更新狀態
          set({
            syncStatus: result.status,
            lastSyncResult: result,
            isSyncing: false,
            syncProgress: 0
          });

          return result;

        } catch (error) {
          const result: SyncResult = {
            status: SyncStatus.ERROR,
            message: error instanceof Error ? error.message : '同步失敗',
            timestamp: new Date().toISOString()
          };

          set({
            syncStatus: SyncStatus.ERROR,
            lastSyncResult: result,
            isSyncing: false,
            syncProgress: 0
          });

          return result;
        }
      },

      // 停止同步
      stopSync: () => {
        syncManager.stopAutoSync();
        set({ isSyncing: false, syncStatus: SyncStatus.IDLE, syncProgress: 0 });
      },

      // 更新同步配置
      updateSyncConfig: async (config) => {
        const newConfig = { ...get().syncConfig, ...config };
        set({ syncConfig: newConfig });
        await syncManager.updateConfig(config);
        
        // 如果啟用了自動同步，重新開始
        if (newConfig.autoSync) {
          syncManager.startAutoSync();
        } else {
          syncManager.stopAutoSync();
        }
      },

      // 手動同步專案
      syncProjects: async () => {
        set({ syncProgress: 10 });
        
        try {
          // 從服務器獲取專案
          const serverProjects = await projectApi.getProjects();
          set({ syncProgress: 50 });
          
          // 更新本地store
          const projectStore = useProjectStore.getState();
          serverProjects.forEach(project => {
            const existingProject = projectStore.getProjectById(project.id);
            if (existingProject) {
              projectStore.updateProject(project.id, project);
            } else {
              projectStore.addProject(project);
            }
          });
          
          set({ syncProgress: 100 });
          
        } catch (error) {
          console.error('同步專案失敗:', error);
          throw error;
        } finally {
          set({ syncProgress: 0 });
        }
      },

      // 手動同步排放記錄
      syncEmissions: async () => {
        set({ syncProgress: 10 });
        
        try {
          // 從服務器獲取排放記錄
          const serverEmissions = await emissionApi.getEmissionRecords();
          set({ syncProgress: 50 });
          
          // 更新本地store
          const projectStore = useProjectStore.getState();
          serverEmissions.forEach(emission => {
            if (emission.id) {
              const existing = projectStore.projectEmissionRecords.find(e => e.id === emission.id);
              if (existing) {
                projectStore.updateProjectEmissionRecord(emission.id, emission);
              } else {
                projectStore.addProjectEmissionRecord(emission);
              }
            }
          });
          
          set({ syncProgress: 100 });
          
        } catch (error) {
          console.error('同步排放記錄失敗:', error);
          throw error;
        } finally {
          set({ syncProgress: 0 });
        }
      },

      // 手動同步營運記錄
      syncOperational: async () => {
        set({ syncProgress: 10 });
        
        try {
          // 從服務器獲取營運記錄
          const serverOperational = await operationalApi.getOperationalRecords();
          set({ syncProgress: 50 });
          
          // 更新本地store
          const projectStore = useProjectStore.getState();
          serverOperational.forEach(record => {
            if (record.id) {
              const existing = projectStore.nonProjectEmissionRecords.find(r => r.id === record.id);
              if (existing) {
                projectStore.updateNonProjectEmissionRecord(record.id, record);
              } else {
                projectStore.addNonProjectEmissionRecord(record);
              }
            }
          });
          
          set({ syncProgress: 100 });
          
        } catch (error) {
          console.error('同步營運記錄失敗:', error);
          throw error;
        } finally {
          set({ syncProgress: 0 });
        }
      },

      // 檢查連接狀態
      checkConnection: async () => {
        try {
          const isConnected = await syncManager.checkConnection();
          set({ 
            isConnectedToServer: isConnected,
            isOnline: isConnected 
          });
          return isConnected;
        } catch (error) {
          set({ 
            isConnectedToServer: false,
            isOnline: false 
          });
          return false;
        }
      },

      // 獲取同步狀態
      getSyncStatus: () => {
        return syncManager.getSyncStatus();
      },

      // 初始化
      initialize: async () => {
        try {
          // 檢查連接狀態
          await get().checkConnection();
          
          // 如果啟用了自動同步，開始自動同步
          if (get().syncConfig.autoSync) {
            syncManager.startAutoSync();
          }
          
          // 執行首次同步
          await get().startSync();
          
        } catch (error) {
          console.error('同步初始化失敗:', error);
        }
      },

      // 重置同步
      resetSync: async () => {
        // 停止自動同步
        syncManager.stopAutoSync();
        
        // 清除同步數據
        await syncManager.clearSyncData();
        
        // 重置狀態
        set({
          syncStatus: SyncStatus.IDLE,
          lastSyncResult: null,
          isSyncing: false,
          syncProgress: 0,
          isOnline: false,
          isConnectedToServer: false
        });
      }
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化配置，不持久化狀態
      partialize: (state) => ({
        syncConfig: state.syncConfig
      }),
    }
  )
); 