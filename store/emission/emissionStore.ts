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
import { firebaseService } from '@/services/firebaseService';
import { withFirebaseErrorHandling } from '@/utils/errorHandling';
import { 
  ProjectEmissionRecord, 
  NonProjectEmissionRecord, 
  ShootingDayEmission,
  ShootingDayStats,
  CrewStats,
  FilmCrew,
  ProductionStage 
} from '@/types/project';
import { generateId } from '@/utils/helpers';

interface EmissionState {
  // 排放記錄數據
  projectEmissionRecords: ProjectEmissionRecord[];
  nonProjectEmissionRecords: NonProjectEmissionRecord[];
  shootingDayRecords: Record<string, ShootingDayEmission[]>;
  
  // 專案排放記錄管理
  addProjectEmissionRecord: (record: Omit<ProjectEmissionRecord, 'id'>) => Promise<void>;
  updateProjectEmissionRecord: (id: string, updates: Partial<ProjectEmissionRecord>) => Promise<void>;
  deleteProjectEmissionRecord: (id: string) => Promise<void>;
  getProjectEmissionRecords: (projectId: string) => ProjectEmissionRecord[];
  
  // 營運排放記錄管理
  addNonProjectEmissionRecord: (record: Omit<NonProjectEmissionRecord, 'id'>) => Promise<void>;
  updateNonProjectEmissionRecord: (id: string, updates: Partial<NonProjectEmissionRecord>) => Promise<void>;
  deleteNonProjectEmissionRecord: (id: string) => Promise<void>;
  getNonProjectEmissionRecords: () => NonProjectEmissionRecord[];
  
  // 拍攝日記錄管理
  addShootingDayRecord: (record: Omit<ShootingDayEmission, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateShootingDayRecord: (id: string, updates: Partial<ShootingDayEmission>) => Promise<void>;
  deleteShootingDayRecord: (id: string) => Promise<void>;
  getShootingDayRecords: (projectId: string) => ShootingDayEmission[];
  getShootingDayStats: (projectId: string) => ShootingDayStats[];
  getCrewStats: (projectId: string) => CrewStats[];
  
  // 查詢和統計方法
  getEmissionsByProjectAndStage: (projectId: string, stage: ProductionStage) => ProjectEmissionRecord[];
  getEmissionsByDateRange: (startDate: string, endDate: string) => (ProjectEmissionRecord | NonProjectEmissionRecord)[];
  getTotalEmissionsByProject: (projectId: string) => number;
  getTotalOperationalEmissions: () => number;
  
  // 初始化
  initializeEmissions: () => Promise<void>;
  clearAllEmissions: () => void;
}

export const useEmissionStore = create<EmissionState>()(
  persist(
    (set, get) => ({
      // 初始狀態
      projectEmissionRecords: [],
      nonProjectEmissionRecords: [],
      shootingDayRecords: {},
      
      // 新增專案排放記錄
      addProjectEmissionRecord: async (record) => {
        const id = generateId();
        const newRecord: ProjectEmissionRecord = {
          ...record,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // 本地狀態更新
        set((state) => ({
          projectEmissionRecords: [...state.projectEmissionRecords, newRecord]
        }));
        
        // Firebase同步
        await withFirebaseErrorHandling(
          () => firebaseService.saveProjectEmissionRecord(newRecord),
          'saveProjectEmissionRecord'
        );
        
        console.log(`✅ 專案排放記錄已新增 (${newRecord.amount} kg CO₂e)`);
      },
      
      // 更新專案排放記錄
      updateProjectEmissionRecord: async (id, updates) => {
        const updatedRecord = {
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // 本地狀態更新
        set((state) => ({
          projectEmissionRecords: state.projectEmissionRecords.map(record =>
            record.id === id ? { ...record, ...updatedRecord } : record
          )
        }));
        
        // Firebase同步
        const record = get().projectEmissionRecords.find(r => r.id === id);
        if (record) {
          await withFirebaseErrorHandling(
            () => firebaseService.saveProjectEmissionRecord({ ...record, ...updatedRecord }),
            'saveProjectEmissionRecord'
          );
        }
        
        console.log(`✅ 專案排放記錄 ${id} 已更新`);
      },
      
      // 刪除專案排放記錄
      deleteProjectEmissionRecord: async (id) => {
        // 本地狀態更新
        set((state) => ({
          projectEmissionRecords: state.projectEmissionRecords.filter(record => record.id !== id)
        }));
        
        // Firebase同步
        await withFirebaseErrorHandling(
          () => firebaseService.deleteProjectEmissionRecord(id),
          'deleteProjectEmissionRecord'
        );
        
        console.log(`🗑️ 專案排放記錄 ${id} 已刪除`);
      },
      
      // 獲取專案排放記錄
      getProjectEmissionRecords: (projectId) => {
        return get().projectEmissionRecords.filter(record => record.projectId === projectId);
      },
      
      // 新增營運排放記錄
      addNonProjectEmissionRecord: async (record) => {
        const id = generateId();
        const newRecord: NonProjectEmissionRecord = {
          ...record,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isAllocated: record.isAllocated || false,
        };
        
        // 本地狀態更新
        set((state) => ({
          nonProjectEmissionRecords: [...state.nonProjectEmissionRecords, newRecord]
        }));
        
        // Firebase同步
        await withFirebaseErrorHandling(
          () => firebaseService.saveOperationalEmissionRecord(newRecord),
          'saveOperationalEmissionRecord'
        );
        
        console.log(`✅ 營運排放記錄已新增 (${newRecord.amount} kg CO₂e)`);
      },
      
      // 更新營運排放記錄
      updateNonProjectEmissionRecord: async (id, updates) => {
        const updatedRecord = {
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // 本地狀態更新
        set((state) => ({
          nonProjectEmissionRecords: state.nonProjectEmissionRecords.map(record =>
            record.id === id ? { ...record, ...updatedRecord } : record
          )
        }));
        
        // Firebase同步
        const record = get().nonProjectEmissionRecords.find(r => r.id === id);
        if (record) {
          await withFirebaseErrorHandling(
            () => firebaseService.saveOperationalEmissionRecord({ ...record, ...updatedRecord }),
            'saveOperationalEmissionRecord'
          );
        }
        
        console.log(`✅ 營運排放記錄 ${id} 已更新`);
      },
      
      // 刪除營運排放記錄
      deleteNonProjectEmissionRecord: async (id) => {
        // 本地狀態更新
        set((state) => ({
          nonProjectEmissionRecords: state.nonProjectEmissionRecords.filter(record => record.id !== id)
        }));
        
        // Firebase同步
        await withFirebaseErrorHandling(
          () => firebaseService.deleteOperationalEmissionRecord(id),
          'deleteOperationalEmissionRecord'
        );
        
        console.log(`🗑️ 營運排放記錄 ${id} 已刪除`);
      },
      
      // 獲取營運排放記錄
      getNonProjectEmissionRecords: () => {
        return get().nonProjectEmissionRecords;
      },
      
      // 新增拍攝日記錄
      addShootingDayRecord: async (record) => {
        const id = generateId();
        const newRecord: ShootingDayEmission = {
          ...record,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // 本地狀態更新
        set((state) => ({
          shootingDayRecords: {
            ...state.shootingDayRecords,
            [record.projectId]: [
              ...(state.shootingDayRecords[record.projectId] || []),
              newRecord
            ]
          }
        }));
        
        // Firebase同步
        await withFirebaseErrorHandling(
          () => firebaseService.saveShootingDayRecord(newRecord),
          'saveShootingDayRecord'
        );
        
        console.log(`✅ 拍攝日記錄已新增 (${newRecord.amount} kg CO₂e)`);
      },
      
      // 更新拍攝日記錄
      updateShootingDayRecord: async (id, updates) => {
        const updatedRecord = {
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // 本地狀態更新
        set((state) => {
          const newRecords = { ...state.shootingDayRecords };
          Object.keys(newRecords).forEach(projectId => {
            newRecords[projectId] = newRecords[projectId].map(record =>
              record.id === id ? { ...record, ...updatedRecord } : record
            );
          });
          return { shootingDayRecords: newRecords };
        });
        
        // Firebase同步 - 需要找到完整記錄
        const allRecords = Object.values(get().shootingDayRecords).flat();
        const record = allRecords.find(r => r.id === id);
        if (record) {
          await withFirebaseErrorHandling(
            () => firebaseService.saveShootingDayRecord({ ...record, ...updatedRecord }),
            'saveShootingDayRecord'
          );
        }
        
        console.log(`✅ 拍攝日記錄 ${id} 已更新`);
      },
      
      // 刪除拍攝日記錄
      deleteShootingDayRecord: async (id) => {
        // 本地狀態更新
        set((state) => {
          const newRecords = { ...state.shootingDayRecords };
          Object.keys(newRecords).forEach(projectId => {
            newRecords[projectId] = newRecords[projectId].filter(record => record.id !== id);
          });
          return { shootingDayRecords: newRecords };
        });
        
        // Firebase同步 - 由於firebaseService沒有對應方法，暫時跳過
        // TODO: 實現deleteShootingDayRecord方法
        
        console.log(`🗑️ 拍攝日記錄 ${id} 已刪除`);
      },
      
      // 獲取拍攝日記錄
      getShootingDayRecords: (projectId) => {
        return get().shootingDayRecords[projectId] || [];
      },
      
      // 獲取拍攝日統計
      getShootingDayStats: (projectId) => {
        const records = get().getShootingDayRecords(projectId);
        const statsByDate: Record<string, ShootingDayStats> = {};
        
        records.forEach(record => {
          const key = `${record.shootingDate}_${record.location}`;
          if (!statsByDate[key]) {
            statsByDate[key] = {
              date: record.shootingDate,
              location: record.location,
              totalEmissions: 0,
              crewEmissions: {} as Record<FilmCrew, number>,
              sceneCount: 0,
              recordCount: 0,
            };
          }
          
          const stats = statsByDate[key];
          stats.totalEmissions += record.amount;
          stats.crewEmissions[record.crew] = (stats.crewEmissions[record.crew] || 0) + record.amount;
          stats.recordCount += 1;
          
          // 簡單的場次計算（基於不同的sceneNumber）
          if (record.sceneNumber) {
            stats.sceneCount = Math.max(stats.sceneCount, parseInt(record.sceneNumber) || 0);
          }
        });
        
        return Object.values(statsByDate);
      },
      
      // 獲取劇組統計
      getCrewStats: (projectId) => {
        const records = get().getShootingDayRecords(projectId);
        const crewStatsMap: Record<FilmCrew, CrewStats> = {} as Record<FilmCrew, CrewStats>;
        
        records.forEach(record => {
          if (!crewStatsMap[record.crew]) {
            crewStatsMap[record.crew] = {
              crew: record.crew,
              totalEmissions: 0,
              recordCount: 0,
              averagePerDay: 0,
              percentage: 0,
            };
          }
          
          const stats = crewStatsMap[record.crew];
          stats.totalEmissions += record.amount;
          stats.recordCount += 1;
        });
        
        const totalEmissions = Object.values(crewStatsMap).reduce((sum, stats) => sum + stats.totalEmissions, 0);
        const uniqueDays = new Set(records.map(r => r.shootingDate)).size || 1;
        
        return Object.values(crewStatsMap).map(stats => ({
          ...stats,
          averagePerDay: stats.totalEmissions / uniqueDays,
          percentage: totalEmissions > 0 ? (stats.totalEmissions / totalEmissions) * 100 : 0,
        }));
      },
      
      // 查詢和統計方法
      getEmissionsByProjectAndStage: (projectId, stage) => {
        return get().projectEmissionRecords.filter(
          record => record.projectId === projectId && record.stage === stage
        );
      },
      
      getEmissionsByDateRange: (startDate, endDate) => {
        const projectRecords = get().projectEmissionRecords.filter(
          record => record.date >= startDate && record.date <= endDate
        );
        const nonProjectRecords = get().nonProjectEmissionRecords.filter(
          record => record.date >= startDate && record.date <= endDate
        );
        return [...projectRecords, ...nonProjectRecords];
      },
      
      getTotalEmissionsByProject: (projectId) => {
        return get().projectEmissionRecords
          .filter(record => record.projectId === projectId)
          .reduce((total, record) => total + record.amount, 0);
      },
      
      getTotalOperationalEmissions: () => {
        return get().nonProjectEmissionRecords
          .reduce((total, record) => total + record.amount, 0);
      },
      
      // 初始化
      initializeEmissions: async () => {
        try {
          // 初始化專案排放記錄
          const projectRecords = await withFirebaseErrorHandling(
            () => firebaseService.getProjectEmissionRecords(),
            'getProjectEmissionRecords'
          );
          
          // 初始化營運排放記錄
          const operationalRecords = await withFirebaseErrorHandling(
            () => firebaseService.getOperationalEmissionRecords(),
            'getOperationalEmissionRecords'
          );
          
          // 初始化拍攝日記錄
          const shootingRecords = await withFirebaseErrorHandling(
            () => firebaseService.getShootingDayRecords(),
            'getShootingDayRecords'
          );
          
          // 將拍攝日記錄按專案分組
          const groupedShootingRecords: Record<string, ShootingDayEmission[]> = {};
          shootingRecords.forEach(record => {
            if (!groupedShootingRecords[record.projectId]) {
              groupedShootingRecords[record.projectId] = [];
            }
            groupedShootingRecords[record.projectId].push(record);
          });
          
          set({
            projectEmissionRecords: projectRecords,
            nonProjectEmissionRecords: operationalRecords,
            shootingDayRecords: groupedShootingRecords,
          });
          
          console.log(`📊 載入排放記錄 - 專案:${projectRecords.length}, 營運:${operationalRecords.length}, 拍攝:${shootingRecords.length}`);
        } catch (error) {
          console.error('初始化排放記錄失敗:', error);
        }
      },
      
      // 清除所有排放記錄
      clearAllEmissions: () => {
        set({
          projectEmissionRecords: [],
          nonProjectEmissionRecords: [],
          shootingDayRecords: {},
        });
      },
    }),
    {
      name: 'emission-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        projectEmissionRecords: state.projectEmissionRecords,
        nonProjectEmissionRecords: state.nonProjectEmissionRecords,
        shootingDayRecords: state.shootingDayRecords,
      }),
    }
  )
);

// 導出便利函數
export const getProjectEmissions = (projectId: string) => 
  useEmissionStore.getState().getProjectEmissionRecords(projectId);

export const getOperationalEmissions = () => 
  useEmissionStore.getState().getNonProjectEmissionRecords();

export const getShootingDayEmissions = (projectId: string) => 
  useEmissionStore.getState().getShootingDayRecords(projectId);

export default useEmissionStore; 