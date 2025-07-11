import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseService } from '@/services/firebaseService';
import { 
  Project, 
  ProjectEmissionRecord, 
  NonProjectEmissionRecord,
  AllocationRecord,
  AllocationRule,
  AllocationMethod,
  AllocationParameters,
  ProjectEmissionSummary,
  ProductionStage, 
  Collaborator, 
  CollaboratorRole, 
  CollaboratorPermissions,
  EmissionRecord,
  ShootingDayEmission,
  ShootingDayStats,
  CrewStats,
  FilmCrew
} from '@/types/project';
import { generateId } from '@/utils/helpers';
import { PROJECTS, EMISSION_RECORDS, SAMPLE_NON_PROJECT_EMISSION_RECORDS } from '@/mocks/projects';

interface ProjectState {
  projects: Project[];
  projectEmissionRecords: ProjectEmissionRecord[];
  nonProjectEmissionRecords: NonProjectEmissionRecord[];
  allocationRecords: AllocationRecord[];
  allocationParameters: AllocationParameters[];
  selectedProjectId: string | null;
  isInitialized: boolean;
  emissionRecords: Record<string, EmissionRecord[]>;
  shootingDayRecords: Record<string, ShootingDayEmission[]>;
  selectedProject: Project | null;
  allocationRules: AllocationRule[];
  
  // 專案管理
  addProject: (project: Partial<Project> & { id?: string }) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  removeProject: (id: string) => void;
  deleteAllProjects: () => void;
  reorderProjects: (projects: Project[]) => void;
  
  // 專案直接排放記錄管理
  addProjectEmissionRecord: (record: Omit<ProjectEmissionRecord, 'id'>) => Promise<void>;
  updateProjectEmissionRecord: (id: string, updates: Partial<ProjectEmissionRecord>) => void;
  deleteProjectEmissionRecord: (id: string) => Promise<void>;
  
  // 非專案排放記錄管理
  addNonProjectEmissionRecord: (record: Omit<NonProjectEmissionRecord, 'id'>) => Promise<void>;
  updateNonProjectEmissionRecord: (id: string, updates: Partial<NonProjectEmissionRecord>) => void;
  deleteNonProjectEmissionRecord: (id: string) => Promise<void>;
  
  // 分攤參數管理
  addAllocationParameters: (params: Omit<AllocationParameters, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAllocationParameters: (id: string, updates: Partial<AllocationParameters>) => void;
  deleteAllocationParameters: (id: string) => void;
  getDefaultAllocationParameters: () => AllocationParameters;
  setDefaultAllocationParameters: (id: string) => void;
  
  // 分攤邏輯
  calculateAllocations: (record: NonProjectEmissionRecord) => AllocationRecord[];
  applyAllocation: (recordId: string, allocationRule: AllocationRule) => void;
  removeAllocation: (recordId: string) => void;
  recalculateAllAllocations: () => void;
  
  // 協作者管理
  addCollaborator: (projectId: string, collaborator: Omit<Collaborator, 'id'>) => void;
  updateCollaborator: (projectId: string, collaboratorId: string, updates: Partial<Collaborator>) => void;
  removeCollaborator: (projectId: string, collaboratorId: string) => void;
  
  // 查詢方法
  getProjectById: (id: string) => Project | undefined;
  getProjectEmissionSummary: (projectId: string) => ProjectEmissionSummary;
  getProjectEmissionRecords: (projectId: string) => ProjectEmissionRecord[];
  getAllocatedEmissionsForProject: (projectId: string) => AllocationRecord[];
  getActiveProjects: () => Project[];
  getCollaboratorsByProjectId: (projectId: string) => Collaborator[];
  
  // 設定
  setSelectedProject: (id: string | null) => void;
  
  // 初始化和清理
  initializeWithSampleData: () => void;
  clearAllData: () => void;
  
  // 權限相關
  getDefaultPermissions: (role: CollaboratorRole) => CollaboratorPermissions;
  getUserRoleInProject: (projectId: string, userId: string) => CollaboratorRole | null;

  // 拍攝日記錄
  addShootingDayRecord: (record: Omit<ShootingDayEmission, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateShootingDayRecord: (id: string, updates: Partial<ShootingDayEmission>) => void;
  deleteShootingDayRecord: (id: string) => void;
  getShootingDayRecords: (projectId: string) => ShootingDayEmission[];
  getShootingDayStats: (projectId: string) => ShootingDayStats[];
  getCrewStats: (projectId: string) => CrewStats[];

  // 新增排放記錄方法
  addEmissionRecord: (record: Omit<EmissionRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmissionRecord: (id: string, updates: Partial<EmissionRecord>) => void;
  deleteEmissionRecord: (id: string) => void;
  calculateProjectEmissions: (projectId: string) => ProjectEmissionSummary;
  
  // 非專案記錄方法
  addNonProjectRecord: (record: Omit<NonProjectEmissionRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNonProjectRecord: (id: string, updates: Partial<NonProjectEmissionRecord>) => void;
  deleteNonProjectRecord: (id: string) => void;
  
  // 分攤記錄方法
  addAllocationRecord: (record: Omit<AllocationRecord, 'id'>) => void;
  getAllocatedEmissions: (projectId: string) => number;
  getTotalOperationalEmissions: () => number;
  getUnallocatedEmissions: () => number;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      projectEmissionRecords: [],
      nonProjectEmissionRecords: [],
      allocationRecords: [],
      allocationParameters: [],
      selectedProjectId: null,
      isInitialized: false,
      emissionRecords: {},
      shootingDayRecords: {},
      selectedProject: null,
      allocationRules: [],
      
      addProject: async (project) => {
        const id = project.id || generateId();
        const newProject: Project = {
            ...project, 
            id, 
            name: project.name || '未命名專案',
            status: project.status || 'planning',
          createdAt: project.createdAt || new Date().toISOString(),
          collaborators: project.collaborators || [],
          emissionSummary: {
            projectId: id,
            directEmissions: 0,
            allocatedEmissions: 0,
            totalEmissions: 0,
            directRecordCount: 0,
            allocatedRecordCount: 0,
          }
        } as Project;
        
        set((state) => {
          const updatedProjects = [...state.projects, newProject];
          
          // 檢查是否有需要重新分攤的營運排放記錄
          const recordsNeedingReallocation = state.nonProjectEmissionRecords.filter(record => {
            return record.isAllocated && record.allocationRule && (
              record.allocationRule.method === 'equal' ||  // 平均分攤需要重新計算
              record.allocationRule.method === 'budget' ||  // 預算分攤需要重新計算
              record.allocationRule.method === 'duration'   // 時長分攤需要重新計算
            );
          });

          // 更新分攤規則，將新專案加入到應該包含它的分攤規則中
          const updatedNonProjectRecords = state.nonProjectEmissionRecords.map(record => {
            if (record.isAllocated && record.allocationRule && 
                (record.allocationRule.method === 'equal' || 
                 record.allocationRule.method === 'budget' || 
                 record.allocationRule.method === 'duration')) {
              
              // 如果新專案狀態是 active 且不在 targetProjects 中，則加入
              if (newProject.status === 'active' && 
                  !record.allocationRule.targetProjects.includes(newProject.id)) {
                return {
                  ...record,
                  allocationRule: {
                    ...record.allocationRule,
                    targetProjects: [...record.allocationRule.targetProjects, newProject.id]
                  }
                };
              }
            }
            return record;
          });
          
          if (recordsNeedingReallocation.length > 0) {
            console.log(`新增專案 ${newProject.name}，重新計算 ${recordsNeedingReallocation.length} 筆營運分攤...`);
            
            let updatedAllocationRecords = state.allocationRecords;
            let finalProjects = updatedProjects;
            
            recordsNeedingReallocation.forEach(record => {
              // 移除舊分攤記錄
              const oldAllocations = updatedAllocationRecords.filter(a => a.nonProjectRecordId === record.id);
              updatedAllocationRecords = updatedAllocationRecords.filter(a => a.nonProjectRecordId !== record.id);
              
              // 更新專案統計 - 移除舊分攤
              finalProjects = finalProjects.map((project) => {
                const oldAllocation = oldAllocations.find(a => a.projectId === project.id);
                if (oldAllocation) {
                  const newSummary = {
                    ...project.emissionSummary,
                    allocatedEmissions: project.emissionSummary.allocatedEmissions - oldAllocation.allocatedAmount,
                    totalEmissions: project.emissionSummary.totalEmissions - oldAllocation.allocatedAmount,
                    allocatedRecordCount: Math.max(0, project.emissionSummary.allocatedRecordCount - 1),
                  };
                  return { ...project, emissionSummary: newSummary };
                }
                return project;
              });
              
              // 重新計算分攤
              const newAllocations = get().calculateAllocations(record);
              updatedAllocationRecords = [...updatedAllocationRecords, ...newAllocations];
              
              // 更新專案統計 - 添加新分攤
              finalProjects = finalProjects.map((project) => {
                const newAllocation = newAllocations.find(a => a.projectId === project.id);
                if (newAllocation) {
                  const newSummary = {
                    ...project.emissionSummary,
                    allocatedEmissions: project.emissionSummary.allocatedEmissions + newAllocation.allocatedAmount,
                    totalEmissions: project.emissionSummary.totalEmissions + newAllocation.allocatedAmount,
                    allocatedRecordCount: project.emissionSummary.allocatedRecordCount + 1,
                  };
                  return { ...project, emissionSummary: newSummary };
                }
                return project;
              });
            });
            
            return {
              projects: finalProjects,
              allocationRecords: updatedAllocationRecords,
              nonProjectEmissionRecords: updatedNonProjectRecords,
            };
          }
          
          return {
            projects: updatedProjects,
            nonProjectEmissionRecords: updatedNonProjectRecords,
          };
        });

        // 同步到 Firebase
        try {
          await firebaseService.saveProject(newProject);
        } catch (error) {
          console.error('❌ Firebase 同步失敗:', error);
          // 不拋出錯誤，確保本地保存成功
        }
      },
      
      updateProject: (id, updates) => {
        set((state) => {
          const updatedProjects = state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          );
          
          // 檢查是否更新了影響分攤計算的欄位
          const needsBudgetReallocation = updates.budget !== undefined;
          const needsDurationReallocation = updates.startDate !== undefined || updates.endDate !== undefined;
          const needsStatusReallocation = updates.status !== undefined;
          
          if (needsBudgetReallocation || needsDurationReallocation || needsStatusReallocation) {
            const changedFields: string[] = [];
            if (needsBudgetReallocation) changedFields.push('預算');
            if (needsDurationReallocation) changedFields.push('日期');
            if (needsStatusReallocation) changedFields.push('狀態');
            
            console.log(`專案 ${id} ${changedFields.join('、')}更新，重新計算分攤...`);
            
            // 找到所有需要重新計算的記錄
            const recordsNeedingReallocation = state.nonProjectEmissionRecords.filter(record => {
              if (!record.isAllocated || !record.allocationRule?.targetProjects.includes(id)) {
                return false;
              }
              
              const method = record.allocationRule.method;
              return (
                (method === 'budget' && needsBudgetReallocation) ||
                (method === 'duration' && needsDurationReallocation) ||
                ((method === 'budget' || method === 'duration' || method === 'equal') && needsStatusReallocation)
              );
            });
            
            let updatedAllocationRecords = state.allocationRecords;
            let finalProjects = updatedProjects;
            
            // 重新計算每個需要重新分攤的記錄
            recordsNeedingReallocation.forEach(record => {
              // 移除舊分攤記錄
              const oldAllocations = updatedAllocationRecords.filter(a => a.nonProjectRecordId === record.id);
              updatedAllocationRecords = updatedAllocationRecords.filter(a => a.nonProjectRecordId !== record.id);
              
              // 更新專案統計 - 移除舊分攤
              finalProjects = finalProjects.map((project) => {
                const oldAllocation = oldAllocations.find(a => a.projectId === project.id);
                if (oldAllocation) {
                  const newSummary = {
                    ...project.emissionSummary,
                    allocatedEmissions: project.emissionSummary.allocatedEmissions - oldAllocation.allocatedAmount,
                    totalEmissions: project.emissionSummary.totalEmissions - oldAllocation.allocatedAmount,
                    allocatedRecordCount: Math.max(0, project.emissionSummary.allocatedRecordCount - 1),
                  };
                  return { ...project, emissionSummary: newSummary };
                }
                return project;
              });
              
                             // 使用新的專案資料重新計算分攤
               const calculateAllocationWithNewProjects = (record: NonProjectEmissionRecord) => {
                 if (!record.allocationRule) return [];
                 
                 const { method, targetProjects, customPercentages } = record.allocationRule;
                 const activeProjects = finalProjects.filter(p => 
                   targetProjects.includes(p.id) && p.status === 'active'
                 );
                 
                 if (activeProjects.length === 0) return [];
                 
                 const allocations: any[] = [];
                 
                 switch (method) {
                   case 'equal':
                     const equalAmount = record.amount / activeProjects.length;
                     const equalPercentage = 100 / activeProjects.length;
                     
                     activeProjects.forEach(project => {
                       allocations.push({
                         id: generateId(),
                         nonProjectRecordId: record.id!,
                         projectId: project.id,
                         allocatedAmount: equalAmount,
                         percentage: equalPercentage,
                         method: 'equal',
                         createdAt: new Date().toISOString(),
                       });
                     });
                     break;
                     
                   case 'budget':
                     const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
                     if (totalBudget > 0) {
                       activeProjects.forEach(project => {
                         const percentage = ((project.budget || 0) / totalBudget) * 100;
                         const allocatedAmount = record.amount * (percentage / 100);
                         
                         allocations.push({
                           id: generateId(),
                           nonProjectRecordId: record.id!,
                           projectId: project.id,
                           allocatedAmount,
                           percentage,
                           method: 'budget',
                           createdAt: new Date().toISOString(),
                         });
                       });
                     }
                     break;
                     
                   case 'duration':
                     // 計算專案持續天數
                     const projectDurations = activeProjects.map(project => {
                       if (project.startDate && project.endDate) {
                         const start = new Date(project.startDate);
                         const end = new Date(project.endDate);
                         const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                         return { projectId: project.id, duration };
                       }
                       return { projectId: project.id, duration: 1 };
                     });
                     
                     const totalDuration = projectDurations.reduce((sum, p) => sum + p.duration, 0);
                     if (totalDuration > 0) {
                       projectDurations.forEach(({ projectId, duration }) => {
                         const percentage = (duration / totalDuration) * 100;
                         const allocatedAmount = record.amount * (percentage / 100);
                         
                         allocations.push({
                           id: generateId(),
                           nonProjectRecordId: record.id!,
                           projectId,
                           allocatedAmount,
                           percentage,
                           method: 'duration',
                           createdAt: new Date().toISOString(),
                         });
                       });
                     }
                     break;
                     
                   case 'custom':
                     if (customPercentages) {
                       activeProjects.forEach(project => {
                         const percentage = customPercentages[project.id] || 0;
                         const allocatedAmount = record.amount * (percentage / 100);
                         
                         if (percentage > 0) {
                           allocations.push({
                             id: generateId(),
                             nonProjectRecordId: record.id!,
                             projectId: project.id,
                             allocatedAmount,
                             percentage,
                             method: 'custom',
                             createdAt: new Date().toISOString(),
                           });
                         }
                       });
                     }
                     break;
                 }
                 
                 return allocations;
               };
              
              // 重新計算並添加新分攤
              const newAllocations = calculateAllocationWithNewProjects(record);
              updatedAllocationRecords = [...updatedAllocationRecords, ...newAllocations];
              
              // 更新專案統計 - 添加新分攤
              finalProjects = finalProjects.map((project) => {
                const newAllocation = newAllocations.find(a => a.projectId === project.id);
                if (newAllocation) {
                  const newSummary = {
                    ...project.emissionSummary,
                    allocatedEmissions: project.emissionSummary.allocatedEmissions + newAllocation.allocatedAmount,
                    totalEmissions: project.emissionSummary.totalEmissions + newAllocation.allocatedAmount,
                    allocatedRecordCount: project.emissionSummary.allocatedRecordCount + 1,
                  };
                  return { ...project, emissionSummary: newSummary };
                }
                return project;
              });
            });
            
            console.log(`已重新計算 ${recordsNeedingReallocation.length} 個預算分攤記錄`);
            
            return {
              ...state,
              projects: finalProjects,
              allocationRecords: updatedAllocationRecords,
            };
          }
          
          return {
            ...state,
            projects: updatedProjects,
          };
        });
      },
      
      deleteProject: (id) => {
        set((state) => {
          const deletedProject = state.projects.find(p => p.id === id);
          if (!deletedProject) return state;
          
          const updatedProjects = state.projects.filter((project) => project.id !== id);
          const updatedProjectEmissionRecords = state.projectEmissionRecords.filter((record) => record.projectId !== id);
          const deletedAllocationRecords = state.allocationRecords.filter((allocation) => allocation.projectId === id);
          let updatedAllocationRecords = state.allocationRecords.filter((allocation) => allocation.projectId !== id);
          
          console.log(`刪除專案 ${deletedProject.name}，需要重新分攤相關的營運排放...`);
          
          // 找到需要重新分攤的營運排放記錄（原本包含被刪除專案的記錄）
          const recordsNeedingReallocation = state.nonProjectEmissionRecords.filter(record => {
            return record.isAllocated && 
                   record.allocationRule && 
                   deletedAllocationRecords.some(allocation => allocation.nonProjectRecordId === record.id);
          });
          
          let finalProjects = updatedProjects;
          
          // 重新計算每個需要重新分攤的記錄
          recordsNeedingReallocation.forEach(record => {
            // 移除該記錄的所有舊分攤
            const oldAllocations = updatedAllocationRecords.filter(a => a.nonProjectRecordId === record.id);
            updatedAllocationRecords = updatedAllocationRecords.filter(a => a.nonProjectRecordId !== record.id);
            
            // 更新剩餘專案的統計 - 移除舊分攤
            finalProjects = finalProjects.map((project) => {
              const oldAllocation = oldAllocations.find(a => a.projectId === project.id);
              if (oldAllocation) {
                const newSummary = {
                  ...project.emissionSummary,
                  allocatedEmissions: project.emissionSummary.allocatedEmissions - oldAllocation.allocatedAmount,
                  totalEmissions: project.emissionSummary.totalEmissions - oldAllocation.allocatedAmount,
                  allocatedRecordCount: Math.max(0, project.emissionSummary.allocatedRecordCount - 1),
                };
                return { ...project, emissionSummary: newSummary };
              }
              return project;
            });
            
            // 重新計算分攤（使用剩餘的專案）
            const newAllocations = get().calculateAllocations(record);
            updatedAllocationRecords = [...updatedAllocationRecords, ...newAllocations];
            
            // 更新剩餘專案的統計 - 添加新分攤
            finalProjects = finalProjects.map((project) => {
              const newAllocation = newAllocations.find(a => a.projectId === project.id);
              if (newAllocation) {
                const newSummary = {
                  ...project.emissionSummary,
                  allocatedEmissions: project.emissionSummary.allocatedEmissions + newAllocation.allocatedAmount,
                  totalEmissions: project.emissionSummary.totalEmissions + newAllocation.allocatedAmount,
                  allocatedRecordCount: project.emissionSummary.allocatedRecordCount + 1,
                };
                return { ...project, emissionSummary: newSummary };
              }
              return project;
            });
          });
          
          console.log(`已重新分攤 ${recordsNeedingReallocation.length} 筆營運排放記錄至剩餘專案`);
          
          return {
            projects: finalProjects,
            projectEmissionRecords: updatedProjectEmissionRecords,
            allocationRecords: updatedAllocationRecords,
            // 清除相關的排放記錄
            emissionRecords: Object.fromEntries(
              Object.entries(state.emissionRecords).filter(([projectId]) => projectId !== id)
            ),
            shootingDayRecords: Object.fromEntries(
              Object.entries(state.shootingDayRecords).filter(([projectId]) => projectId !== id)
            ),
          };
        });
      },
      
      removeProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },
      
      deleteAllProjects: () => {
        set({
          projects: [],
          projectEmissionRecords: [],
          nonProjectEmissionRecords: [],
          allocationRecords: [],
        });
      },
      
      reorderProjects: (projects) => {
        set((state) => ({
          projects: projects,
        }));
      },
      
      addProjectEmissionRecord: async (record) => {
        const id = generateId();
        const newRecord = { ...record, id };
        
        set((state) => {
          const updatedProjects = state.projects.map((project) => {
            if (project.id === record.projectId) {
              const newSummary = {
                ...project.emissionSummary,
                directEmissions: project.emissionSummary.directEmissions + record.amount,
                totalEmissions: project.emissionSummary.totalEmissions + record.amount,
                directRecordCount: project.emissionSummary.directRecordCount + 1,
              };
              return { ...project, emissionSummary: newSummary };
            }
            return project;
          });
          
          return {
            projects: updatedProjects,
            projectEmissionRecords: [...state.projectEmissionRecords, newRecord],
          };
        });

        // 同步到 Firebase
        try {
          await firebaseService.saveProjectEmissionRecord(newRecord);
        } catch (error) {
          console.error('❌ Firebase 同步失敗:', error);
          // 不拋出錯誤，確保本地保存成功
        }
      },
      
      updateProjectEmissionRecord: (id, updates) => {
        set((state) => {
          const oldRecord = state.projectEmissionRecords.find((record) => record.id === id);
          if (!oldRecord) return state;
          
          const newAmount = updates.amount !== undefined ? updates.amount : oldRecord.amount;
          const amountDifference = newAmount - oldRecord.amount;
          
          const updatedProjects = amountDifference !== 0
            ? state.projects.map((project) => {
                if (project.id === oldRecord.projectId) {
                  const newSummary = {
                    ...project.emissionSummary,
                    directEmissions: project.emissionSummary.directEmissions + amountDifference,
                    totalEmissions: project.emissionSummary.totalEmissions + amountDifference,
                  };
                  return { ...project, emissionSummary: newSummary };
                }
                return project;
              })
            : state.projects;
          
          return {
            projects: updatedProjects,
            projectEmissionRecords: state.projectEmissionRecords.map((record) =>
              record.id === id ? { ...record, ...updates } : record
            ),
          };
        });
      },
      
      deleteProjectEmissionRecord: async (id) => {
        const currentState = get();
        const recordToDelete = currentState.projectEmissionRecords.find((record) => record.id === id);
        
        set((state) => {
          if (!recordToDelete) return state;
          
          const updatedProjects = state.projects.map((project) => {
            if (project.id === recordToDelete.projectId) {
              const newSummary = {
                ...project.emissionSummary,
                directEmissions: project.emissionSummary.directEmissions - recordToDelete.amount,
                totalEmissions: project.emissionSummary.totalEmissions - recordToDelete.amount,
                directRecordCount: project.emissionSummary.directRecordCount - 1,
              };
              return { ...project, emissionSummary: newSummary };
            }
            return project;
          });
          
          return {
            projects: updatedProjects,
            projectEmissionRecords: state.projectEmissionRecords.filter((record) => record.id !== id),
          };
        });

        // 同步到 Firebase
        if (recordToDelete) {
          try {
            await firebaseService.deleteProjectEmissionRecord(id);
          } catch (error) {
            console.error('❌ Firebase 刪除失敗:', error);
            // 不拋出錯誤，確保本地刪除成功
          }
        }
      },
      
      addNonProjectEmissionRecord: async (record) => {
        const id = generateId();
        const newRecord = { ...record, id };
        
        set((state) => {
          let updatedAllocationRecords = state.allocationRecords;
          let updatedProjects = state.projects;
          
          // 如果需要分攤，立即計算並應用分攤
          if (record.isAllocated && record.allocationRule) {
            const allocations = get().calculateAllocations({ ...record, id });
            updatedAllocationRecords = [...state.allocationRecords, ...allocations];
            
            // 更新專案排放統計
            updatedProjects = state.projects.map((project) => {
              const allocation = allocations.find(a => a.projectId === project.id);
              if (allocation) {
                const newSummary = {
                  ...project.emissionSummary,
                  allocatedEmissions: project.emissionSummary.allocatedEmissions + allocation.allocatedAmount,
                  totalEmissions: project.emissionSummary.totalEmissions + allocation.allocatedAmount,
                  allocatedRecordCount: project.emissionSummary.allocatedRecordCount + 1,
                };
                return { ...project, emissionSummary: newSummary };
              }
              return project;
            });
          }
          
          return {
            projects: updatedProjects,
            nonProjectEmissionRecords: [...state.nonProjectEmissionRecords, newRecord],
            allocationRecords: updatedAllocationRecords,
          };
        });

        // 同步到 Firebase
        try {
          await firebaseService.saveOperationalEmissionRecord(newRecord);
        } catch (error) {
          console.error('❌ Firebase 同步失敗:', error);
          // 不拋出錯誤，確保本地保存成功
        }
      },
      
      updateNonProjectEmissionRecord: (id, updates) => {
        set((state) => {
          const oldRecord = state.nonProjectEmissionRecords.find((record) => record.id === id);
          if (!oldRecord) return state;
          
          // 如果分攤規則變更，需要重新計算分攤
          const needsReallocation = updates.allocationRule || updates.isAllocated !== undefined;
          
          let updatedAllocationRecords = state.allocationRecords;
          let updatedProjects = state.projects;
          
          if (needsReallocation) {
            // 移除舊分攤
            const oldAllocations = state.allocationRecords.filter(a => a.nonProjectRecordId === id);
            updatedAllocationRecords = state.allocationRecords.filter(a => a.nonProjectRecordId !== id);
            
            // 更新專案統計 - 移除舊分攤
            updatedProjects = state.projects.map((project) => {
              const oldAllocation = oldAllocations.find(a => a.projectId === project.id);
              if (oldAllocation) {
                const newSummary = {
                  ...project.emissionSummary,
                  allocatedEmissions: project.emissionSummary.allocatedEmissions - oldAllocation.allocatedAmount,
                  totalEmissions: project.emissionSummary.totalEmissions - oldAllocation.allocatedAmount,
                  allocatedRecordCount: project.emissionSummary.allocatedRecordCount - 1,
                };
                return { ...project, emissionSummary: newSummary };
              }
              return project;
            });
            
            // 如果仍需分攤，添加新分攤
            const updatedRecord = { ...oldRecord, ...updates };
            if (updatedRecord.isAllocated && updatedRecord.allocationRule) {
              const newAllocations = get().calculateAllocations(updatedRecord);
              updatedAllocationRecords = [...updatedAllocationRecords, ...newAllocations];
              
              // 更新專案統計 - 添加新分攤
              updatedProjects = updatedProjects.map((project) => {
                const newAllocation = newAllocations.find(a => a.projectId === project.id);
                if (newAllocation) {
                  const newSummary = {
                    ...project.emissionSummary,
                    allocatedEmissions: project.emissionSummary.allocatedEmissions + newAllocation.allocatedAmount,
                    totalEmissions: project.emissionSummary.totalEmissions + newAllocation.allocatedAmount,
                    allocatedRecordCount: project.emissionSummary.allocatedRecordCount + 1,
                  };
                  return { ...project, emissionSummary: newSummary };
                }
                return project;
              });
            }
          }
          
              return {
            projects: updatedProjects,
            nonProjectEmissionRecords: state.nonProjectEmissionRecords.map((record) =>
              record.id === id ? { ...record, ...updates } : record
            ),
            allocationRecords: updatedAllocationRecords,
          };
        });
      },
      
      deleteNonProjectEmissionRecord: async (id) => {
        console.log('Store: 準備刪除記錄，ID:', id);
        
        const currentState = get();
        const recordToDelete = currentState.nonProjectEmissionRecords.find((record) => record.id === id);
        
        set((state) => {
          console.log('Store: 當前記錄數量:', state.nonProjectEmissionRecords.length);
          console.log('Store: 記錄ID列表:', state.nonProjectEmissionRecords.map(r => r.id));
          
          console.log('Store: 找到記錄:', recordToDelete ? '是' : '否');
          
          if (!recordToDelete) {
            console.log('Store: 記錄不存在，取消刪除');
            return state;
          }
          
          // 移除相關的分攤記錄
          const allocationsToRemove = state.allocationRecords.filter(a => a.nonProjectRecordId === id);
          console.log('Store: 要移除的分攤記錄數量:', allocationsToRemove.length);
          
          const updatedAllocationRecords = state.allocationRecords.filter(a => a.nonProjectRecordId !== id);
          
          // 更新專案統計
          const updatedProjects = state.projects.map((project) => {
            const allocation = allocationsToRemove.find(a => a.projectId === project.id);
            if (allocation) {
              const newSummary = {
                ...project.emissionSummary,
                allocatedEmissions: project.emissionSummary.allocatedEmissions - allocation.allocatedAmount,
                totalEmissions: project.emissionSummary.totalEmissions - allocation.allocatedAmount,
                allocatedRecordCount: project.emissionSummary.allocatedRecordCount - 1,
              };
              return { ...project, emissionSummary: newSummary };
            }
            return project;
          });
          
          const updatedRecords = state.nonProjectEmissionRecords.filter((record) => record.id !== id);
          console.log('Store: 刪除後記錄數量:', updatedRecords.length);
          
          return {
            projects: updatedProjects,
            nonProjectEmissionRecords: updatedRecords,
            allocationRecords: updatedAllocationRecords,
          };
        });
        
        console.log('Store: 刪除操作完成');

        // 同步到 Firebase
        if (recordToDelete) {
          try {
            const currentUser = auth.currentUser;
            if (currentUser) {
              const recordRef = doc(db, 'users', currentUser.uid, 'operationalRecords', id);
              await deleteDoc(recordRef);
              console.log(`✅ 營運記錄 "${recordToDelete.description}" 已從 Firebase 刪除`);
            } else {
              console.log('⚠️ 用戶未登入，營運記錄僅從本地刪除');
            }
          } catch (error) {
            console.error('❌ Firebase 刪除失敗:', error);
            // 不拋出錯誤，確保本地刪除成功
          }
        }
      },
      
      calculateAllocations: (record: NonProjectEmissionRecord): AllocationRecord[] => {
        if (!record.allocationRule) return [];
        
        const { method, targetProjects, customPercentages } = record.allocationRule;
        const state = get();
        const activeProjects = state.projects.filter(p => 
          targetProjects.includes(p.id) && p.status === 'active'
        );
        
        if (activeProjects.length === 0) return [];
        
        const allocations: AllocationRecord[] = [];
        
        switch (method) {
          case 'equal':
            const equalAmount = record.amount / activeProjects.length;
            const equalPercentage = 100 / activeProjects.length;
            
            activeProjects.forEach(project => {
              allocations.push({
                id: generateId(),
                nonProjectRecordId: record.id!,
                projectId: project.id,
                allocatedAmount: equalAmount,
                percentage: equalPercentage,
                method: 'equal',
                createdAt: new Date().toISOString(),
              });
            });
            break;
            
          case 'budget':
            const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
            if (totalBudget > 0) {
              activeProjects.forEach(project => {
                const percentage = ((project.budget || 0) / totalBudget) * 100;
                const allocatedAmount = record.amount * (percentage / 100);
                
                allocations.push({
                  id: generateId(),
                  nonProjectRecordId: record.id!,
                  projectId: project.id,
                  allocatedAmount,
                  percentage,
                  method: 'budget',
                  createdAt: new Date().toISOString(),
                });
              });
            }
            break;
            
          case 'duration':
            // 計算專案持續天數
            const projectDurations = activeProjects.map(project => {
              if (project.startDate && project.endDate) {
                const start = new Date(project.startDate);
                const end = new Date(project.endDate);
                const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                return { projectId: project.id, duration };
              }
              return { projectId: project.id, duration: 1 };
            });
            
            const totalDuration = projectDurations.reduce((sum, p) => sum + p.duration, 0);
            if (totalDuration > 0) {
              projectDurations.forEach(({ projectId, duration }) => {
                const percentage = (duration / totalDuration) * 100;
                const allocatedAmount = record.amount * (percentage / 100);
                
                allocations.push({
                  id: generateId(),
                  nonProjectRecordId: record.id!,
                  projectId,
                  allocatedAmount,
                  percentage,
                  method: 'duration',
                  createdAt: new Date().toISOString(),
                });
              });
            }
            break;
            
          case 'custom':
            if (customPercentages) {
              activeProjects.forEach(project => {
                const percentage = customPercentages[project.id] || 0;
                const allocatedAmount = record.amount * (percentage / 100);
                
                if (percentage > 0) {
                  allocations.push({
                    id: generateId(),
                    nonProjectRecordId: record.id!,
                    projectId: project.id,
                    allocatedAmount,
                    percentage,
                    method: 'custom',
                    createdAt: new Date().toISOString(),
                  });
                }
              });
            }
            break;
        }
        
        return allocations;
      },
      
      applyAllocation: (recordId: string, allocationRule: AllocationRule) => {
        get().updateNonProjectEmissionRecord(recordId, {
          isAllocated: true,
          allocationRule,
        });
      },
      
      removeAllocation: (recordId: string) => {
        get().updateNonProjectEmissionRecord(recordId, {
          isAllocated: false,
          allocationRule: undefined,
        });
      },
      
      recalculateAllAllocations: () => {
        console.log('手動重新計算所有分攤...');
        
        set((state) => {
          // 獲取所有活躍專案的ID
          const activeProjectIds = state.projects.filter(p => p.status === 'active').map(p => p.id);
          
          // 找到所有已分攤的記錄，並更新它們的 targetProjects
          const allocatedRecords = state.nonProjectEmissionRecords.filter(record => 
            record.isAllocated && record.allocationRule
          );
          
          // 更新分攤記錄的 targetProjects 以包含所有活躍專案
          const updatedNonProjectRecords = state.nonProjectEmissionRecords.map(record => {
            if (record.isAllocated && record.allocationRule && 
                (record.allocationRule.method === 'equal' || 
                 record.allocationRule.method === 'budget' || 
                 record.allocationRule.method === 'duration')) {
              return {
                ...record,
                allocationRule: {
                  ...record.allocationRule,
                  targetProjects: activeProjectIds
                }
              };
            }
            return record;
          });
          
          let updatedAllocationRecords: any[] = [];
          let updatedProjects = state.projects.map(p => ({
            ...p,
            emissionSummary: {
              ...p.emissionSummary,
              allocatedEmissions: 0,
              allocatedRecordCount: 0,
              totalEmissions: p.emissionSummary.directEmissions, // 重置為只有直接排放
            }
          }));
          
          // 重新計算每個記錄的分攤（使用更新後的記錄）
          const updatedAllocatedRecords = updatedNonProjectRecords.filter(record => 
            record.isAllocated && record.allocationRule
          );
          
          updatedAllocatedRecords.forEach(record => {
            const allocations = get().calculateAllocations(record);
            updatedAllocationRecords = [...updatedAllocationRecords, ...allocations];
            
            // 更新專案統計
            updatedProjects = updatedProjects.map((project) => {
              const allocation = allocations.find(a => a.projectId === project.id);
              if (allocation) {
                const newSummary = {
                  ...project.emissionSummary,
                  allocatedEmissions: project.emissionSummary.allocatedEmissions + allocation.allocatedAmount,
                  totalEmissions: project.emissionSummary.totalEmissions + allocation.allocatedAmount,
                  allocatedRecordCount: project.emissionSummary.allocatedRecordCount + 1,
                };
                return { ...project, emissionSummary: newSummary };
              }
              return project;
            });
          });
          
          console.log(`已重新計算 ${updatedAllocatedRecords.length} 個分攤記錄`);
          console.log(`活躍專案ID: [${activeProjectIds.join(', ')}]`);
          
          return {
            ...state,
            projects: updatedProjects,
            allocationRecords: updatedAllocationRecords,
            nonProjectEmissionRecords: updatedNonProjectRecords,
          };
        });
      },
      
      // 協作者管理
      addCollaborator: (projectId, collaborator) => {
        const collaboratorId = generateId();
        const role = collaborator.role || 'viewer';
        const defaultPermissions = get().getDefaultPermissions(role);
        const joinedAt = new Date().toISOString();
        
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId) {
              const currentCollaborators = project.collaborators || [];
              return {
                ...project,
                collaborators: [
                  ...currentCollaborators,
                  { 
                    ...collaborator, 
                    id: collaboratorId,
                    joinedAt,
                    permissions: {
                      ...defaultPermissions,
                      ...(collaborator.permissions || {})
                    }
                  }
                ]
              };
            }
            return project;
          }),
        }));
      },
      
      updateCollaborator: (projectId, collaboratorId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId && project.collaborators) {
              return {
                ...project,
                collaborators: project.collaborators.map((collaborator) =>
                  collaborator.id === collaboratorId
                    ? { ...collaborator, ...updates }
                    : collaborator
                )
              };
            }
            return project;
          }),
        }));
      },
      
      removeCollaborator: (projectId, collaboratorId) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId && project.collaborators) {
              return {
                ...project,
                collaborators: project.collaborators.filter(
                  (collaborator) => collaborator.id !== collaboratorId
                )
              };
            }
            return project;
          }),
        }));
      },
      
      // 查詢方法
      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id);
      },
      
      getProjectEmissionSummary: (projectId) => {
        const project = get().projects.find(p => p.id === projectId);
        return project?.emissionSummary || {
          projectId,
          directEmissions: 0,
          allocatedEmissions: 0,
          totalEmissions: 0,
          directRecordCount: 0,
          allocatedRecordCount: 0,
        };
      },
      
      getProjectEmissionRecords: (projectId) => {
        return get().projectEmissionRecords.filter(record => record.projectId === projectId);
      },
      
      getAllocatedEmissionsForProject: (projectId) => {
        return get().allocationRecords.filter(allocation => allocation.projectId === projectId);
      },
      
      getActiveProjects: () => {
        return get().projects.filter(project => project.status === 'active');
      },
      
      getCollaboratorsByProjectId: (projectId) => {
        const project = get().projects.find(p => p.id === projectId);
        return project?.collaborators || [];
      },
      
      setSelectedProject: (id) => {
        set({ selectedProjectId: id });
      },
      
      initializeWithSampleData: () => {
        set((state) => {
          console.log('開始初始化示例數據...');
          
          // 導入示例數據
          const sampleProjects = PROJECTS.map(project => ({
            ...project,
            emissionSummary: {
              projectId: project.id,
              directEmissions: 0,
              allocatedEmissions: 0,
              totalEmissions: 0,
              directRecordCount: 0,
              allocatedRecordCount: 0,
            }
          }));

          // 計算專案直接排放
          const projectEmissionRecords = EMISSION_RECORDS.map(record => ({
            ...record,
            id: record.id || generateId()
          }));
          const projectEmissionSummaries: { [projectId: string]: any } = {};

          projectEmissionRecords.forEach(record => {
            if (!projectEmissionSummaries[record.projectId]) {
              projectEmissionSummaries[record.projectId] = {
                directEmissions: 0,
                directRecordCount: 0,
              };
            }
            projectEmissionSummaries[record.projectId].directEmissions += record.amount;
            projectEmissionSummaries[record.projectId].directRecordCount += 1;
          });

          // 確保非專案排放記錄都有ID
          const nonProjectEmissionRecords = SAMPLE_NON_PROJECT_EMISSION_RECORDS.map(record => ({
            ...record,
            id: record.id || generateId()
          }));
          
          console.log('初始化專案數量:', sampleProjects.length);
          console.log('初始化專案記錄數量:', projectEmissionRecords.length);
          console.log('初始化非專案記錄數量:', nonProjectEmissionRecords.length);
          
          // 計算分攤和生成分攤記錄
          const allocationRecords: AllocationRecord[] = [];
          const allocatedSummaries: { [projectId: string]: any } = {};

          nonProjectEmissionRecords.forEach(record => {
            if (record.isAllocated && record.allocationRule) {
              const allocations = get().calculateAllocations(record);
              allocationRecords.push(...allocations);
              
              allocations.forEach(allocation => {
                if (!allocatedSummaries[allocation.projectId]) {
                  allocatedSummaries[allocation.projectId] = {
                    allocatedEmissions: 0,
                    allocatedRecordCount: 0,
                  };
                }
                allocatedSummaries[allocation.projectId].allocatedEmissions += allocation.allocatedAmount;
                allocatedSummaries[allocation.projectId].allocatedRecordCount += 1;
              });
            }
          });

          // 更新專案摘要
          const finalProjects = sampleProjects.map(project => {
            const directSummary = projectEmissionSummaries[project.id] || {
              directEmissions: 0,
              directRecordCount: 0,
            };
            const allocatedSummary = allocatedSummaries[project.id] || {
              allocatedEmissions: 0,
              allocatedRecordCount: 0,
            };

            return {
              ...project,
              emissionSummary: {
                projectId: project.id,
                directEmissions: directSummary.directEmissions,
                allocatedEmissions: allocatedSummary.allocatedEmissions,
                totalEmissions: directSummary.directEmissions + allocatedSummary.allocatedEmissions,
                directRecordCount: directSummary.directRecordCount,
                allocatedRecordCount: allocatedSummary.allocatedRecordCount,
              },
              totalEmissions: directSummary.directEmissions + allocatedSummary.allocatedEmissions,
            };
          });
          
          console.log('初始化完成，記錄數量:', nonProjectEmissionRecords.length);
          
          return {
            ...state,
            projects: finalProjects,
            projectEmissionRecords: projectEmissionRecords,
            nonProjectEmissionRecords: nonProjectEmissionRecords,
            allocationRecords: allocationRecords,
            isInitialized: true,
          };
        });
      },
      
      clearAllData: async () => {
        // 先停止Firebase同步，避免重複下載
        try {
          const { firebaseSync } = await import('@/services/firebaseDataSync');
          firebaseSync.stopSync();
          console.log('⏹️ Firebase同步已停止');
        } catch (error) {
          console.error('停止Firebase同步失敗:', error);
        }

        // 清除本地數據
        set({
          projects: [],
          projectEmissionRecords: [],
          nonProjectEmissionRecords: [],
          allocationRecords: [],
          selectedProjectId: null,
          isInitialized: false,
          emissionRecords: {},
          shootingDayRecords: {},
          selectedProject: null,
          allocationRules: [],
          allocationParameters: [],
        });

        // 同步清除 Firebase 數據
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            console.log('🔄 開始清除 Firebase 雲端數據...');
            
            // 清除所有專案
            const projectsRef = collection(db, 'users', currentUser.uid, 'projects');
            const projectsSnapshot = await getDocs(projectsRef);
            const projectDeletePromises = projectsSnapshot.docs.map(doc => 
              deleteDoc(doc.ref)
            );
            
            // 清除所有排放記錄
            const emissionRecordsRef = collection(db, 'users', currentUser.uid, 'emissionRecords');
            const emissionSnapshot = await getDocs(emissionRecordsRef);
            const emissionDeletePromises = emissionSnapshot.docs.map(doc => 
              deleteDoc(doc.ref)
            );
            
            // 清除所有營運記錄
            const operationalRecordsRef = collection(db, 'users', currentUser.uid, 'operationalRecords');
            const operationalSnapshot = await getDocs(operationalRecordsRef);
            const operationalDeletePromises = operationalSnapshot.docs.map(doc => 
              deleteDoc(doc.ref)
            );
            
            // 清除所有拍攝日記錄
            const shootingRecordsRef = collection(db, 'users', currentUser.uid, 'shootingDayRecords');
            const shootingSnapshot = await getDocs(shootingRecordsRef);
            const shootingDeletePromises = shootingSnapshot.docs.map(doc => 
              deleteDoc(doc.ref)
            );
            
            // 執行所有刪除操作
            await Promise.all([
              ...projectDeletePromises,
              ...emissionDeletePromises,
              ...operationalDeletePromises,
              ...shootingDeletePromises
            ]);
            
            console.log('✅ Firebase 雲端數據已清除');
          } else {
            console.log('⚠️ 用戶未登入，僅清除本地數據');
          }
        } catch (error) {
          console.error('❌ 清除 Firebase 數據失敗:', error);
          // 不拋出錯誤，確保本地清除成功
        }
      },
      
      // 權限管理
      getDefaultPermissions: (role: CollaboratorRole): CollaboratorPermissions => {
        switch (role) {
          case 'owner':
            return {
              canEdit: true,
              canDelete: true,
              canInvite: true,
              canViewReports: true,
              canManageCollaborators: true,
            };
          case 'editor':
            return {
              canEdit: true,
              canDelete: false,
              canInvite: false,
              canViewReports: true,
              canManageCollaborators: false,
            };
          case 'viewer':
          default:
            return {
              canEdit: false,
              canDelete: false,
              canInvite: false,
              canViewReports: true,
              canManageCollaborators: false,
            };
        }
      },
      
      getUserRoleInProject: (projectId: string, userId: string): CollaboratorRole | null => {
        const project = get().projects.find(p => p.id === projectId);
        const collaborator = project?.collaborators?.find(c => c.id === userId);
        return collaborator?.role || null;
      },

      // 新增拍攝日記錄
      addShootingDayRecord: (record) => {
        const id = Date.now().toString();
        const timestamp = new Date().toISOString();
        
        const newRecord: ShootingDayEmission = {
          ...record,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          shootingDayRecords: {
            ...state.shootingDayRecords,
            [record.projectId]: [
              ...(state.shootingDayRecords[record.projectId] || []),
              newRecord
            ]
          }
        }));
      },

      // 更新拍攝日記錄
      updateShootingDayRecord: (id, updates) => {
        set((state) => {
          const newShootingDayRecords = { ...state.shootingDayRecords };
          
          Object.keys(newShootingDayRecords).forEach(projectId => {
            newShootingDayRecords[projectId] = newShootingDayRecords[projectId].map(record =>
              record.id === id ? { ...record, ...updates, updatedAt: new Date().toISOString() } : record
            );
          });
          
          return { shootingDayRecords: newShootingDayRecords };
        });
      },

      // 刪除拍攝日記錄
      deleteShootingDayRecord: (id) => {
        set((state) => {
          const newShootingDayRecords = { ...state.shootingDayRecords };
          
          Object.keys(newShootingDayRecords).forEach(projectId => {
            newShootingDayRecords[projectId] = newShootingDayRecords[projectId].filter(record => record.id !== id);
          });
          
          return { shootingDayRecords: newShootingDayRecords };
        });
      },

      // 獲取項目的拍攝日記錄
      getShootingDayRecords: (projectId) => {
        const state = get();
        return state.shootingDayRecords[projectId] || [];
      },

      // 獲取拍攝日統計
      getShootingDayStats: (projectId) => {
        const state = get();
        const records = state.shootingDayRecords[projectId] || [];
        
        const statsByDate = records.reduce((acc, record) => {
          const date = record.shootingDate;
          if (!acc[date]) {
            acc[date] = {
              date,
              location: record.location,
              totalEmissions: 0,
              crewEmissions: {} as Record<FilmCrew, number>,
              sceneCount: new Set<string>(),
              recordCount: 0
            };
            
            // 初始化所有組別的排放量為0
            const crews: FilmCrew[] = ['director', 'camera', 'lighting', 'sound', 'makeup', 'costume', 'props', 'art', 'gaffer', 'grip', 'production', 'transport', 'catering', 'location', 'post', 'other'];
            crews.forEach(crew => {
              acc[date].crewEmissions[crew] = 0;
            });
          }
          
          acc[date].totalEmissions += record.amount;
          acc[date].crewEmissions[record.crew] += record.amount;
          acc[date].recordCount += 1;
          
          if (record.sceneNumber) {
            acc[date].sceneCount.add(record.sceneNumber);
          }
          
          return acc;
        }, {} as Record<string, any>);

        return Object.values(statsByDate).map(stat => ({
          ...stat,
          sceneCount: stat.sceneCount.size
        })) as ShootingDayStats[];
      },

      // 獲取組別統計
      getCrewStats: (projectId) => {
        const state = get();
        const records = state.shootingDayRecords[projectId] || [];
        
        if (records.length === 0) return [];
        
        const totalEmissions = records.reduce((sum, record) => sum + record.amount, 0);
        const shootingDays = new Set(records.map(r => r.shootingDate)).size;
        
        const statsByCrew = records.reduce((acc, record) => {
          if (!acc[record.crew]) {
            acc[record.crew] = {
              totalEmissions: 0,
              recordCount: 0
            };
          }
          
          acc[record.crew].totalEmissions += record.amount;
          acc[record.crew].recordCount += 1;
          
          return acc;
        }, {} as Record<FilmCrew, { totalEmissions: number; recordCount: number }>);

        return Object.entries(statsByCrew).map(([crew, stats]) => ({
          crew: crew as FilmCrew,
          totalEmissions: stats.totalEmissions,
          recordCount: stats.recordCount,
          averagePerDay: shootingDays > 0 ? stats.totalEmissions / shootingDays : 0,
          percentage: totalEmissions > 0 ? (stats.totalEmissions / totalEmissions) * 100 : 0
        })) as CrewStats[];
      },

      // 新增方法實現
      addEmissionRecord: (record) => {
        const id = Date.now().toString();
        const timestamp = new Date().toISOString();
        
        const newRecord: EmissionRecord = {
          ...record,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          emissionRecords: {
            ...state.emissionRecords,
            [record.projectId]: [
              ...(state.emissionRecords[record.projectId] || []),
              newRecord
            ]
          }
        }));
      },
      
      updateEmissionRecord: (id, updates) => {
        set((state) => {
          const newEmissionRecords = { ...state.emissionRecords };
          
          Object.keys(newEmissionRecords).forEach(projectId => {
            newEmissionRecords[projectId] = newEmissionRecords[projectId].map(record =>
              record.id === id ? { ...record, ...updates, updatedAt: new Date().toISOString() } : record
            );
          });
          
          return { emissionRecords: newEmissionRecords };
        });
      },
      
      deleteEmissionRecord: (id) => {
        set((state) => {
          const newEmissionRecords = { ...state.emissionRecords };
          
          Object.keys(newEmissionRecords).forEach(projectId => {
            newEmissionRecords[projectId] = newEmissionRecords[projectId].filter(record => record.id !== id);
          });
          
          return { emissionRecords: newEmissionRecords };
        });
      },
      
      calculateProjectEmissions: (projectId) => {
        const state = get();
        const directRecords = state.projectEmissionRecords.filter(r => r.projectId === projectId);
        const emissionRecords = state.emissionRecords[projectId] || [];
        const shootingDayRecords = state.shootingDayRecords[projectId] || [];
        const allocatedRecords = state.allocationRecords.filter(r => r.projectId === projectId);
        
        const directEmissions = directRecords.reduce((sum, r) => sum + r.amount, 0);
        const additionalEmissions = emissionRecords.reduce((sum, r) => sum + r.amount, 0);
        const shootingEmissions = shootingDayRecords.reduce((sum, r) => sum + r.amount, 0);
        const allocatedEmissions = allocatedRecords.reduce((sum, r) => sum + r.allocatedAmount, 0);
        
        // 按生命週期階段分析排放量
        const stageEmissions = {
          'pre-production': 0,
          'production': 0,
          'post-production': 0
        };
        
        // 分析直接排放記錄的階段分佈
        directRecords.forEach(record => {
          if (record.stage && stageEmissions.hasOwnProperty(record.stage)) {
            stageEmissions[record.stage] += record.amount;
          } else {
            // 如果沒有明確階段，歸類為製作期
            stageEmissions['production'] += record.amount;
          }
        });
        
        // 分析其他排放記錄的階段分佈
        emissionRecords.forEach(record => {
          if (record.stage && stageEmissions.hasOwnProperty(record.stage)) {
            stageEmissions[record.stage] += record.amount;
          } else {
            stageEmissions['production'] += record.amount;
          }
        });
        
        // 拍攝日記錄全部歸類為製作期
        stageEmissions['production'] += shootingEmissions;
        
        // 營運分攤排放按照 60% 前期製作、40% 後期製作分配
        const operationalAllocationToPreProduction = allocatedEmissions * 0.6;
        const operationalAllocationToPostProduction = allocatedEmissions * 0.4;
        
        stageEmissions['pre-production'] += operationalAllocationToPreProduction;
        stageEmissions['post-production'] += operationalAllocationToPostProduction;
        
        return {
          projectId,
          directEmissions: directEmissions + additionalEmissions + shootingEmissions,
          allocatedEmissions,
          totalEmissions: directEmissions + additionalEmissions + shootingEmissions + allocatedEmissions,
          directRecordCount: directRecords.length + emissionRecords.length + shootingDayRecords.length,
          allocatedRecordCount: allocatedRecords.length,
          // 新增：生命週期階段分析
          stageEmissions,
          // 新增：營運分攤到各階段的詳細分配
          operationalAllocation: {
            'pre-production': operationalAllocationToPreProduction,
            'post-production': operationalAllocationToPostProduction,
            total: allocatedEmissions
          }
        };
      },
      
      addNonProjectRecord: (record) => {
        const id = Date.now().toString();
        const timestamp = new Date().toISOString();
        
        const newRecord: NonProjectEmissionRecord = {
          ...record,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          nonProjectEmissionRecords: [...state.nonProjectEmissionRecords, newRecord]
        }));
      },
      
      updateNonProjectRecord: (id, updates) => {
        set((state) => ({
          nonProjectEmissionRecords: state.nonProjectEmissionRecords.map(record =>
            record.id === id ? { ...record, ...updates, updatedAt: new Date().toISOString() } : record
          )
        }));
      },
      
      deleteNonProjectRecord: (id) => {
        set((state) => ({
          nonProjectEmissionRecords: state.nonProjectEmissionRecords.filter(record => record.id !== id)
        }));
      },
      
      addAllocationRecord: (record) => {
        const id = Date.now().toString();
        const timestamp = new Date().toISOString();
        
        const newRecord: AllocationRecord = {
          ...record,
          id,
          createdAt: timestamp,
        };

        set((state) => ({
          allocationRecords: [...state.allocationRecords, newRecord]
        }));
      },
      
      getAllocatedEmissions: (projectId) => {
        const state = get();
        return state.allocationRecords
          .filter(r => r.projectId === projectId)
          .reduce((sum, r) => sum + r.allocatedAmount, 0);
      },
      
      getTotalOperationalEmissions: () => {
        const state = get();
        return state.nonProjectEmissionRecords.reduce((sum, r) => sum + r.amount, 0);
      },
      
      getUnallocatedEmissions: () => {
        const state = get();
        const totalOperational = state.nonProjectEmissionRecords.reduce((sum, r) => sum + r.amount, 0);
        const totalAllocated = state.allocationRecords.reduce((sum, r) => sum + r.allocatedAmount, 0);
        return totalOperational - totalAllocated;
      },
      
      // 分攤參數管理方法
      addAllocationParameters: (params) => {
        const id = generateId();
        const timestamp = new Date().toISOString();
        
        const newParams: AllocationParameters = {
          ...params,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          allocationParameters: [...state.allocationParameters, newParams]
        }));
      },
      
      updateAllocationParameters: (id, updates) => {
        set((state) => ({
          allocationParameters: state.allocationParameters.map(param =>
            param.id === id ? { ...param, ...updates, updatedAt: new Date().toISOString() } : param
          )
        }));
      },
      
      deleteAllocationParameters: (id) => {
        set((state) => ({
          allocationParameters: state.allocationParameters.filter(param => param.id !== id)
        }));
      },
      
      getDefaultAllocationParameters: () => {
        const state = get();
        const defaultParam = state.allocationParameters.find(p => p.isDefault);
        
        if (defaultParam) {
          return defaultParam;
        }
        
        // 如果沒有預設參數，返回系統預設值
        return {
          id: 'default',
          name: '系統預設分攤',
          description: '前期60%，後期40%的預設分攤比例',
          stageAllocations: {
            preProduction: 60,
            production: 0,
            postProduction: 40,
          },
          scopeWeights: {
            scope1: 1,
            scope2: 1,
            scope3: 1,
          },
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
      
      setDefaultAllocationParameters: (id) => {
        set((state) => ({
          allocationParameters: state.allocationParameters.map(param => ({
            ...param,
            isDefault: param.id === id,
            updatedAt: new Date().toISOString(),
          }))
        }));
      },
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3, // 增加版本號以清除舊數據
      migrate: (persistedState: any, version: number) => {
        // 如果是舊版本或數據結構不匹配，直接返回初始狀態
        if (version < 3 || !persistedState) {
          console.log('遷移到新版本，清除舊數據');
          return {
            projects: [],
            projectEmissionRecords: [],
            nonProjectEmissionRecords: [],
            allocationRecords: [],
            allocationParameters: [],
            selectedProjectId: null,
            isInitialized: false,
            emissionRecords: {},
            shootingDayRecords: {},
            selectedProject: null,
            allocationRules: [],
          };
        }
        
        // 檢查必要的屬性是否存在
        if (
          !Array.isArray(persistedState.projects) ||
          !Array.isArray(persistedState.projectEmissionRecords) ||
          !Array.isArray(persistedState.nonProjectEmissionRecords) ||
          !Array.isArray(persistedState.allocationRecords)
        ) {
          console.log('數據格式不正確，重置為初始狀態');
          return {
            projects: [],
            projectEmissionRecords: [],
            nonProjectEmissionRecords: [],
            allocationRecords: [],
            allocationParameters: [],
            selectedProjectId: null,
            isInitialized: false,
            emissionRecords: {},
            shootingDayRecords: {},
            selectedProject: null,
            allocationRules: [],
          };
        }
        
        return persistedState;
      },
    }
  )
);