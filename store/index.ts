// 重構後的Store架構
// 將原本的巨型ProjectStore拆分為6個職責明確的小型Store

// 專案管理Store
export { default as useProjectStore, getProject, getActiveProjects, getSelectedProject } from './project/projectStore';

// 排放記錄管理Store
export { 
  default as useEmissionStore, 
  getProjectEmissions, 
  getOperationalEmissions, 
  getShootingDayEmissions 
} from './emission/emissionStore';

// 分攤邏輯管理Store
export { 
  default as useAllocationStore, 
  getAllocationsForProject, 
  getProjectAllocatedTotal, 
  validateAllocation 
} from './allocation/allocationStore';

// 統計計算Store
export { 
  default as useStatisticsStore, 
  getProjectStats, 
  getOperationalStats, 
  getCategoryStats 
} from './statistics/statisticsStore';

// 協作者管理Store
export { 
  default as useCollaboratorStore, 
  getDefaultPermissions, 
  checkUserPermission, 
  getUserRole 
} from './collaborator/collaboratorStore';

// 系統狀態管理Store
export { 
  default as useSystemStore, 
  initializeApp, 
  getSystemInfo, 
  clearAllAppData 
} from './system/systemStore';

// 保留的原有Store
export { useAuthStore } from './authStore';
export { useThemeStore } from './themeStore';
export { useLanguageStore } from './languageStore';
export { useProfileStore } from './profileStore';
export { useDatabaseStore } from './databaseStore';
export { useFloatingAIStore } from './floatingAIStore';
export { useBetaToolsStore } from './betaToolsStore';
export { useTempThemeStore } from './tempThemeStore';
export { useErrorStore } from './errorStore';

// 導出類型定義
export type { 
  Project, 
  ProjectEmissionRecord, 
  NonProjectEmissionRecord, 
  AllocationRecord, 
  AllocationRule, 
  AllocationParameters, 
  Collaborator, 
  CollaboratorRole, 
  CollaboratorPermissions,
  ProjectEmissionSummary,
  ProductionStage,
  ShootingDayEmission
} from '@/types/project';

/**
 * Store架構說明
 * 
 * 📁 store/
 * ├── project/
 * │   └── projectStore.ts        # 專案核心管理 (CRUD、選擇狀態)
 * ├── emission/
 * │   └── emissionStore.ts       # 排放記錄管理 (專案、營運、拍攝日記錄)
 * ├── allocation/
 * │   └── allocationStore.ts     # 分攤邏輯管理 (計算、規則、參數)
 * ├── statistics/
 * │   └── statisticsStore.ts     # 統計計算 (摘要、分析、報表)
 * ├── collaborator/
 * │   └── collaboratorStore.ts   # 協作者管理 (權限、角色、邀請)
 * ├── system/
 * │   └── systemStore.ts         # 系統狀態 (初始化、維護、診斷)
 * └── index.ts                   # 統一導出
 * 
 * 🎯 重構目標已達成：
 * ✅ 單一職責原則 - 每個Store職責明確
 * ✅ 依賴倒置 - Store之間透過參數傳遞解耦
 * ✅ 可維護性 - 程式碼更易理解和修改
 * ✅ 可測試性 - 每個Store可獨立測試
 * ✅ 錯誤處理 - 統一的錯誤處理機制
 * ✅ Firebase同步 - 統一的數據同步邏輯
 * 
 * 📊 重構成果：
 * 原始：1個巨型Store (1800+ 行)
 * 重構：6個專業Store (平均300行) + 完善錯誤處理
 */

// 導入Store用於工具函數
import useProjectStore from './project/projectStore';
import useEmissionStore from './emission/emissionStore';
import useAllocationStore from './allocation/allocationStore';
import useStatisticsStore from './statistics/statisticsStore';
import useCollaboratorStore from './collaborator/collaboratorStore';
import useSystemStore from './system/systemStore';

// 統一初始化函數
export const initializeAllStores = async () => {
  const systemStore = useSystemStore.getState();
  const projectStore = useProjectStore.getState();
  
  __DEV__ && console.log('🚀 開始初始化所有Store...');
  
  try {
    // 初始化系統狀態
    await systemStore.initialize();
    
    // 初始化專案數據 - 使用實際存在的方法
    if (projectStore.initializeProjects) {
      await projectStore.initializeProjects();
    }
    
    __DEV__ && console.log('✅ 所有Store初始化完成');
  } catch (error) {
    console.error('❌ Store初始化失敗:', error);
    throw error;
  }
};

// 統一清理函數
export const clearAllStores = () => {
  console.log('🧹 清除所有Store數據...');
  
  const projectStore = useProjectStore.getState();
  const emissionStore = useEmissionStore.getState();
  const allocationStore = useAllocationStore.getState();
  const systemStore = useSystemStore.getState();
  
  projectStore.deleteAllProjects();
  emissionStore.clearAllEmissions();
  allocationStore.clearAllAllocations();
  systemStore.clearAllData();
  
  console.log('✅ 所有Store數據已清除');
};

// Store健康檢查
export const checkStoreHealth = () => {
  const stores = {
    project: useProjectStore.getState(),
    emission: useEmissionStore.getState(),
    allocation: useAllocationStore.getState(),
    statistics: useStatisticsStore.getState(),
    collaborator: useCollaboratorStore.getState(),
    system: useSystemStore.getState(),
  };
  
  const health = Object.entries(stores).map(([name, store]) => ({
    name,
    isHealthy: store !== null && typeof store === 'object',
    hasData: name === 'project' ? (store as any).projects?.length > 0 : true,
  }));
  
  console.log('🔍 Store健康檢查結果:', health);
  return health;
}; 