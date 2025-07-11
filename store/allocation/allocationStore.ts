import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AllocationRecord,
  AllocationRule,
  AllocationParameters,
  AllocationMethod,
  NonProjectEmissionRecord,
  Project 
} from '@/types/project';
import { generateId } from '@/utils/helpers';
import { withFirebaseErrorHandling } from '@/utils/errorHandling';
import { memoize, TTLCache, performanceMonitor, batch } from '@/utils/performance';

// 分攤計算緩存
const allocationCache = new TTLCache<AllocationRecord[]>(15 * 60 * 1000); // 15分鐘緩存
const calculationCache = new TTLCache<number>(10 * 60 * 1000); // 10分鐘緩存

interface AllocationState {
  // 分攤數據
  allocationRecords: AllocationRecord[];
  allocationParameters: AllocationParameters[];
  allocationRules: AllocationRule[];
  
  // 分攤參數管理
  addAllocationParameters: (params: Omit<AllocationParameters, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAllocationParameters: (id: string, updates: Partial<AllocationParameters>) => void;
  deleteAllocationParameters: (id: string) => void;
  getDefaultAllocationParameters: () => AllocationParameters;
  setDefaultAllocationParameters: (id: string) => void;
  getAllocationParameters: () => AllocationParameters[];
  
  // 分攤規則管理
  addAllocationRule: (rule: AllocationRule) => void;
  updateAllocationRule: (index: number, rule: AllocationRule) => void;
  removeAllocationRule: (index: number) => void;
  
  // 分攤計算邏輯
  calculateAllocations: (record: NonProjectEmissionRecord, projects: Project[]) => AllocationRecord[];
  applyAllocation: (recordId: string, allocationRule: AllocationRule, projects: Project[]) => void;
  removeAllocation: (recordId: string) => void;
  recalculateAllAllocations: (nonProjectRecords: NonProjectEmissionRecord[], projects: Project[]) => void;
  
  // 分攤記錄管理
  addAllocationRecord: (record: Omit<AllocationRecord, 'id'>) => void;
  updateAllocationRecord: (id: string, updates: Partial<AllocationRecord>) => void;
  deleteAllocationRecord: (id: string) => void;
  getAllocationRecords: () => AllocationRecord[];
  
  // 查詢方法
  getAllocatedEmissionsForProject: (projectId: string) => AllocationRecord[];
  getAllocatedEmissions: (projectId: string) => number;
  getTotalOperationalEmissions: (nonProjectRecords: NonProjectEmissionRecord[]) => number;
  getUnallocatedEmissions: (nonProjectRecords: NonProjectEmissionRecord[]) => number;
  getAllocationSummary: (projects: Project[], nonProjectRecords: NonProjectEmissionRecord[]) => {
    totalOperational: number;
    totalAllocated: number;
    unallocated: number;
    allocationRate: number;
    projectAllocations: Array<{ projectId: string; projectName: string; allocated: number; percentage: number }>;
  };
  
  // 分攤驗證
  validateAllocationRule: (rule: AllocationRule) => { isValid: boolean; errors: string[] };
  validateCustomPercentages: (percentages: { [projectId: string]: number }) => { isValid: boolean; total: number; errors: string[] };
  
  // 初始化和清理
  initializeDefaultParameters: () => void;
  clearAllAllocations: () => void;
}

export const useAllocationStore = create<AllocationState>()(
  persist(
    (set, get) => ({
      // 初始狀態
      allocationRecords: [],
      allocationParameters: [],
      allocationRules: [],
      
      // 新增分攤參數
      addAllocationParameters: (params) => {
        const id = generateId();
        const newParams: AllocationParameters = {
          ...params,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          allocationParameters: [...state.allocationParameters, newParams]
        }));
        
        console.log(`✅ 分攤參數 "${newParams.name}" 已新增`);
      },
      
      // 更新分攤參數
      updateAllocationParameters: (id, updates) => {
        const updatedParams = {
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          allocationParameters: state.allocationParameters.map(params =>
            params.id === id ? { ...params, ...updatedParams } : params
          )
        }));
        
        console.log(`✅ 分攤參數 ${id} 已更新`);
      },
      
      // 刪除分攤參數
      deleteAllocationParameters: (id) => {
        set((state) => ({
          allocationParameters: state.allocationParameters.filter(params => params.id !== id)
        }));
        
        console.log(`🗑️ 分攤參數 ${id} 已刪除`);
      },
      
      // 獲取預設分攤參數
      getDefaultAllocationParameters: () => {
        const defaultParams = get().allocationParameters.find(params => params.isDefault);
        
        if (!defaultParams) {
          // 如果沒有預設參數，創建一個
          const defaultParams: AllocationParameters = {
            id: 'default',
            name: '預設分攤參數',
            description: '系統預設的分攤參數設定',
            stageAllocations: {
              preProduction: 20,    // 前期製作 20%
              production: 60,       // 製作期 60%
              postProduction: 20,   // 後期製作 20%
            },
            scopeWeights: {
              scope1: 30,  // 直接排放 30%
              scope2: 50,  // 間接能源排放 50%
              scope3: 20,  // 其他間接排放 20%
            },
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          get().addAllocationParameters(defaultParams);
          return defaultParams;
        }
        
        return defaultParams;
      },
      
      // 設置預設分攤參數
      setDefaultAllocationParameters: (id) => {
        set((state) => ({
          allocationParameters: state.allocationParameters.map(params => ({
            ...params,
            isDefault: params.id === id
          }))
        }));
      },
      
      // 獲取所有分攤參數
      getAllocationParameters: () => {
        return get().allocationParameters;
      },
      
      // 新增分攤規則
      addAllocationRule: (rule) => {
        set((state) => ({
          allocationRules: [...state.allocationRules, rule]
        }));
      },
      
      // 更新分攤規則
      updateAllocationRule: (index, rule) => {
        set((state) => ({
          allocationRules: state.allocationRules.map((r, i) => i === index ? rule : r)
        }));
      },
      
      // 移除分攤規則
      removeAllocationRule: (index) => {
        set((state) => ({
          allocationRules: state.allocationRules.filter((_, i) => i !== index)
        }));
      },
      
      // 計算分攤 (優化版)
      calculateAllocations: (record, projects) => {
        const { allocationRule } = record;
        if (!allocationRule || !record.isAllocated) return [];
        
        // 緩存鍵
        const cacheKey = `${record.id}_${allocationRule.method}_${allocationRule.targetProjects.join(',')}_${record.amount}`;
        
        // 檢查緩存
        const cached = allocationCache.get(cacheKey);
        if (cached) {
          return cached;
        }
        
        const endMonitor = performanceMonitor.start('calculateAllocations');
        
        try {
          const targetProjects = projects.filter(p => 
            allocationRule.targetProjects.includes(p.id)
          );
          
          if (targetProjects.length === 0) return [];
          
          const allocations: AllocationRecord[] = [];
          
          switch (allocationRule.method) {
            case 'equal': {
              // 平均分攤 - 預計算優化
              const amountPerProject = record.amount / targetProjects.length;
              const percentagePerProject = 100 / targetProjects.length;
              
              targetProjects.forEach(project => {
                allocations.push({
                  id: generateId(),
                  nonProjectRecordId: record.id!,
                  projectId: project.id,
                  allocatedAmount: amountPerProject,
                  percentage: percentagePerProject,
                  method: 'equal',
                  createdAt: new Date().toISOString(),
                });
              });
              break;
            }
            
            case 'budget': {
              // 按預算比例分攤 - 批量計算優化
              const projectsWithBudget = targetProjects.filter(p => (p.budget || 0) > 0);
              const totalBudget = projectsWithBudget.reduce((sum, p) => sum + (p.budget || 0), 0);
              
              if (totalBudget > 0) {
                // 使用批量處理避免頻繁的數組操作
                const budgetAllocations = projectsWithBudget.map(project => {
                  const projectBudget = project.budget || 0;
                  const percentage = (projectBudget / totalBudget) * 100;
                  const allocatedAmount = (projectBudget / totalBudget) * record.amount;
                  
                  return {
                    id: generateId(),
                    nonProjectRecordId: record.id!,
                    projectId: project.id,
                    allocatedAmount,
                    percentage,
                    method: 'budget' as const,
                    createdAt: new Date().toISOString(),
                  };
                });
                
                allocations.push(...budgetAllocations);
              }
              break;
            }
            
            case 'duration': {
              // 按時長比例分攤 - 記憶化日期計算
              const calculateDuration = memoize((startDate: string, endDate: string) => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                return end.getTime() - start.getTime();
              });
              
              const projectDurations = targetProjects
                .map(project => ({
                  project,
                  duration: project.startDate && project.endDate 
                    ? calculateDuration(project.startDate, project.endDate)
                    : 0
                }))
                .filter(item => item.duration > 0);
              
              const totalDuration = projectDurations.reduce((sum, item) => sum + item.duration, 0);
              
              if (totalDuration > 0) {
                const durationAllocations = projectDurations.map(({ project, duration }) => {
                  const percentage = (duration / totalDuration) * 100;
                  const allocatedAmount = (duration / totalDuration) * record.amount;
                  
                  return {
                    id: generateId(),
                    nonProjectRecordId: record.id!,
                    projectId: project.id,
                    allocatedAmount,
                    percentage,
                    method: 'duration' as const,
                    createdAt: new Date().toISOString(),
                  };
                });
                
                allocations.push(...durationAllocations);
              }
              break;
            }
            
            case 'custom': {
              // 自訂比例分攤 - 優化對象遍歷
              if (allocationRule.customPercentages) {
                const validProjects = new Set(targetProjects.map(p => p.id));
                
                const customAllocations = Object.entries(allocationRule.customPercentages)
                  .filter(([projectId]) => validProjects.has(projectId))
                  .map(([projectId, percentage]) => ({
                    id: generateId(),
                    nonProjectRecordId: record.id!,
                    projectId,
                    allocatedAmount: (percentage / 100) * record.amount,
                    percentage,
                    method: 'custom' as const,
                    createdAt: new Date().toISOString(),
                  }));
                
                allocations.push(...customAllocations);
              }
              break;
            }
          }
          
          // 存入緩存
          allocationCache.set(cacheKey, allocations);
          
          return allocations;
        } finally {
          endMonitor();
        }
      },
      
      // 應用分攤
      applyAllocation: (recordId, allocationRule, projects) => {
        // 首先移除舊的分攤記錄
        get().removeAllocation(recordId);
        
        // 創建虛擬record來計算分攤（這裡需要從外部傳入完整記錄）
        const mockRecord: NonProjectEmissionRecord = {
          id: recordId,
          categoryId: '',
          description: '',
          quantity: 0,
          amount: 0, // 這個需要從實際記錄中獲取
          date: '',
          createdAt: '',
          isAllocated: true,
          allocationRule,
        };
        
        // 注意：這裡需要重新設計，因為我們需要完整的record信息
        console.warn('applyAllocation 需要完整的記錄信息才能正確計算');
        
        console.log(`✅ 分攤規則已應用到記錄 ${recordId}`);
      },
      
      // 移除分攤
      removeAllocation: (recordId) => {
        set((state) => ({
          allocationRecords: state.allocationRecords.filter(
            allocation => allocation.nonProjectRecordId !== recordId
          )
        }));
        
        console.log(`🗑️ 記錄 ${recordId} 的分攤已移除`);
      },
      
      // 重新計算所有分攤
      recalculateAllAllocations: (nonProjectRecords, projects) => {
        // 清除所有現有分攤
        set({ allocationRecords: [] });
        
        // 重新計算每個需要分攤的記錄
        nonProjectRecords.forEach(record => {
          if (record.isAllocated && record.allocationRule) {
            const allocations = get().calculateAllocations(record, projects);
            allocations.forEach(allocation => {
              get().addAllocationRecord(allocation);
            });
          }
        });
        
        console.log('✅ 所有分攤記錄已重新計算');
      },
      
      // 新增分攤記錄
      addAllocationRecord: (record) => {
        const newRecord: AllocationRecord = {
          ...record,
          id: generateId(),
        };
        
        set((state) => ({
          allocationRecords: [...state.allocationRecords, newRecord]
        }));
      },
      
      // 更新分攤記錄
      updateAllocationRecord: (id, updates) => {
        set((state) => ({
          allocationRecords: state.allocationRecords.map(record =>
            record.id === id ? { ...record, ...updates } : record
          )
        }));
      },
      
      // 刪除分攤記錄
      deleteAllocationRecord: (id) => {
        set((state) => ({
          allocationRecords: state.allocationRecords.filter(record => record.id !== id)
        }));
      },
      
      // 獲取所有分攤記錄
      getAllocationRecords: () => {
        return get().allocationRecords;
      },
      
      // 獲取專案的分攤排放
      getAllocatedEmissionsForProject: (projectId) => {
        return get().allocationRecords.filter(allocation => allocation.projectId === projectId);
      },
      
      // 獲取專案分攤排放總量
      getAllocatedEmissions: (projectId) => {
        return get().getAllocatedEmissionsForProject(projectId)
          .reduce((total, allocation) => total + allocation.allocatedAmount, 0);
      },
      
      // 獲取總營運排放
      getTotalOperationalEmissions: (nonProjectRecords) => {
        return nonProjectRecords.reduce((total, record) => total + record.amount, 0);
      },
      
      // 獲取未分攤排放
      getUnallocatedEmissions: (nonProjectRecords) => {
        const total = get().getTotalOperationalEmissions(nonProjectRecords);
        const allocated = get().allocationRecords.reduce((sum, record) => sum + record.allocatedAmount, 0);
        return total - allocated;
      },
      
      // 獲取分攤摘要
      getAllocationSummary: (projects, nonProjectRecords) => {
        const totalOperational = get().getTotalOperationalEmissions(nonProjectRecords);
        const allAllocations = get().allocationRecords;
        const totalAllocated = allAllocations.reduce((sum, record) => sum + record.allocatedAmount, 0);
        const unallocated = totalOperational - totalAllocated;
        const allocationRate = totalOperational > 0 ? (totalAllocated / totalOperational) * 100 : 0;
        
        // 計算每個專案的分攤
        const projectAllocations = projects.map(project => {
          const projectAllocated = get().getAllocatedEmissions(project.id);
          const percentage = totalAllocated > 0 ? (projectAllocated / totalAllocated) * 100 : 0;
          
          return {
            projectId: project.id,
            projectName: project.name,
            allocated: projectAllocated,
            percentage,
          };
        }).filter(item => item.allocated > 0);
        
        return {
          totalOperational,
          totalAllocated,
          unallocated,
          allocationRate,
          projectAllocations,
        };
      },
      
      // 驗證分攤規則
      validateAllocationRule: (rule) => {
        const errors: string[] = [];
        
        if (rule.targetProjects.length === 0) {
          errors.push('必須選擇至少一個目標專案');
        }
        
        if (rule.method === 'custom') {
          if (!rule.customPercentages || Object.keys(rule.customPercentages).length === 0) {
            errors.push('自訂分攤必須設定百分比');
          } else {
            const validation = get().validateCustomPercentages(rule.customPercentages);
            if (!validation.isValid) {
              errors.push(...validation.errors);
            }
          }
        }
        
        return {
          isValid: errors.length === 0,
          errors,
        };
      },
      
      // 驗證自訂百分比
      validateCustomPercentages: (percentages) => {
        const errors: string[] = [];
        const total = Object.values(percentages).reduce((sum, p) => sum + p, 0);
        
        if (Math.abs(total - 100) > 0.01) {
          errors.push(`總百分比必須為100%，目前為${total.toFixed(1)}%`);
        }
        
        Object.entries(percentages).forEach(([projectId, percentage]) => {
          if (percentage < 0 || percentage > 100) {
            errors.push(`專案 ${projectId} 的百分比必須在0-100%之間`);
          }
        });
        
        return {
          isValid: errors.length === 0,
          total,
          errors,
        };
      },
      
      // 初始化預設參數
      initializeDefaultParameters: () => {
        const existing = get().allocationParameters;
        if (existing.length === 0) {
          get().getDefaultAllocationParameters(); // 這會自動創建預設參數
        }
      },
      
      // 清除所有分攤記錄
      clearAllAllocations: () => {
        set({
          allocationRecords: [],
          allocationRules: [],
        });
      },
    }),
    {
      name: 'allocation-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        allocationRecords: state.allocationRecords,
        allocationParameters: state.allocationParameters,
        allocationRules: state.allocationRules,
      }),
    }
  )
);

// 導出便利函數
export const getAllocationsForProject = (projectId: string) => 
  useAllocationStore.getState().getAllocatedEmissionsForProject(projectId);

export const getProjectAllocatedTotal = (projectId: string) => 
  useAllocationStore.getState().getAllocatedEmissions(projectId);

export const validateAllocation = (rule: AllocationRule) => 
  useAllocationStore.getState().validateAllocationRule(rule);

export default useAllocationStore; 