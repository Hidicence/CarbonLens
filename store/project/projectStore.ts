import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseService } from '@/services/firebaseService';
import { withFirebaseErrorHandling } from '@/utils/errorHandling';
import { Project, Collaborator } from '@/types/project';
import { generateId } from '@/utils/helpers';
import { memoize, createSelector, TTLCache, performanceMonitor } from '@/utils/performance';

// 選擇器緩存
const projectSelectorCache = new TTLCache<any>(5 * 60 * 1000); // 5分鐘緩存

interface ProjectState {
  // 專案數據
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  
  // 專案管理
  addProject: (project: Partial<Project> & { id?: string }) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  removeProject: (id: string) => void;
  deleteAllProjects: () => void;
  reorderProjects: (projects: Project[]) => void;
  
  // 查詢方法
  getProjectById: (id: string) => Project | undefined;
  getActiveProjects: () => Project[];
  getProjectsByStatus: (status: Project['status']) => Project[];
  
  // 優化的選擇器方法
  getOptimizedProjects: (filters?: {
    status?: Project['status'][];
    searchTerm?: string;
    sortBy?: keyof Project;
    sortOrder?: 'asc' | 'desc';
  }) => Project[];
  getProjectsWithCollaborators: () => Project[];
  getProjectsByDateRange: (startDate: string, endDate: string) => Project[];
  getRecentProjects: (limit?: number) => Project[];
  
  // 緩存管理
  clearProjectCache: () => void;
  
  // 選擇狀態
  setSelectedProject: (id: string | null) => void;
  
  // 初始化
  initializeProjects: () => Promise<void>;
  
  // 專案統計
  getProjectCount: () => number;
  getActiveProjectCount: () => number;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // 初始狀態
      projects: [],
      selectedProjectId: null,
      selectedProject: null,
      
      // 新增專案
      addProject: async (project) => {
        const id = project.id || generateId();
        const newProject: Project = {
          id,
          name: project.name || '未命名專案',
          description: project.description || '',
          status: project.status || 'planning',
          startDate: project.startDate,
          endDate: project.endDate,
          location: project.location || '',
          budget: project.budget,
          carbonBudget: project.carbonBudget,
          createdAt: project.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          collaborators: project.collaborators || [],
          totalEmissions: 0,
          emissionSummary: project.emissionSummary || {
            projectId: id,
            directEmissions: 0,
            allocatedEmissions: 0,
            totalEmissions: 0,
            directRecordCount: 0,
            allocatedRecordCount: 0,
          }
        };
        
        // 本地狀態更新
        set((state) => ({
          projects: [...state.projects, newProject]
        }));
        
        // Firebase同步
        await withFirebaseErrorHandling(
          () => firebaseService.saveProject(newProject),
          'saveProject'
        );
        
        console.log(`✅ 專案 "${newProject.name}" 已新增`);
      },
      
      // 更新專案
      updateProject: async (id, updates) => {
        const updatedProject = {
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // 本地狀態更新
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === id ? { ...project, ...updatedProject } : project
          ),
          selectedProject: state.selectedProject?.id === id 
            ? { ...state.selectedProject, ...updatedProject }
            : state.selectedProject
        }));
        
        // Firebase同步
        const projectToUpdate = get().getProjectById(id);
        if (projectToUpdate) {
          await withFirebaseErrorHandling(
            () => firebaseService.saveProject({ ...projectToUpdate, ...updatedProject }),
            'saveProject'
          );
        }
        
        console.log(`✅ 專案 ${id} 已更新`);
      },
      
      // 刪除專案
      deleteProject: async (id) => {
        const project = get().getProjectById(id);
        if (!project) return;
        
        // 本地狀態更新
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
          selectedProject: state.selectedProject?.id === id ? null : state.selectedProject
        }));
        
        // Firebase同步
        await withFirebaseErrorHandling(
          () => firebaseService.deleteProject(id),
          'deleteProject'
        );
        
        console.log(`🗑️ 專案 "${project.name}" 已刪除`);
      },
      
      // 移除專案（僅本地）
      removeProject: (id) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
          selectedProject: state.selectedProject?.id === id ? null : state.selectedProject
        }));
      },
      
      // 刪除所有專案
      deleteAllProjects: () => {
        set({
          projects: [],
          selectedProjectId: null,
          selectedProject: null
        });
      },
      
      // 重新排序專案
      reorderProjects: (projects) => {
        set({ projects });
      },
      
      // 根據ID獲取專案
      getProjectById: (id) => {
        return get().projects.find(project => project.id === id);
      },
      
      // 獲取活躍專案
      getActiveProjects: () => {
        return get().projects.filter(project => project.status === 'active');
      },
      
      // 根據狀態獲取專案
      getProjectsByStatus: (status) => {
        return get().projects.filter(project => project.status === status);
      },
      
      // 優化的專案篩選 (記憶化)
      getOptimizedProjects: memoize((filters = {}) => {
        const { status, searchTerm, sortBy, sortOrder = 'asc' } = filters;
        const cacheKey = `optimized_${JSON.stringify(filters)}`;
        
        // 檢查緩存
        const cached = projectSelectorCache.get(cacheKey);
        if (cached) {
          return cached;
        }
        
        const endMonitor = performanceMonitor.start('getOptimizedProjects');
        
        try {
          let result = [...get().projects];
          
          // 狀態篩選
          if (status && status.length > 0) {
            result = result.filter(project => status.includes(project.status));
          }
          
          // 搜索篩選
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(project => 
              project.name.toLowerCase().includes(searchLower) ||
              (project.description || '').toLowerCase().includes(searchLower) ||
              (project.location || '').toLowerCase().includes(searchLower)
            );
          }
          
          // 排序
          if (sortBy) {
            result.sort((a, b) => {
              const aValue = a[sortBy];
              const bValue = b[sortBy];
              
              if (aValue == null && bValue == null) return 0;
              if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
              if (bValue == null) return sortOrder === 'asc' ? -1 : 1;
              
              if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
              if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
              return 0;
            });
          }
          
          // 存入緩存
          projectSelectorCache.set(cacheKey, result);
          
          return result;
        } finally {
          endMonitor();
        }
      }),
      
      // 獲取有協作者的專案
      getProjectsWithCollaborators: () => {
        const cacheKey = 'projects_with_collaborators';
        const cached = projectSelectorCache.get(cacheKey);
        if (cached) return cached;
        
        const result = get().projects.filter(project => 
          project.collaborators && project.collaborators.length > 0
        );
        
        projectSelectorCache.set(cacheKey, result);
        return result;
      },
      
      // 按日期範圍獲取專案
      getProjectsByDateRange: (startDate, endDate) => {
        const cacheKey = `projects_date_range_${startDate}_${endDate}`;
        const cached = projectSelectorCache.get(cacheKey);
        if (cached) return cached;
        
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        const result = get().projects.filter(project => {
          if (!project.startDate) return false;
          
          const projectStart = new Date(project.startDate!).getTime();
          const projectEnd = project.endDate ? new Date(project.endDate).getTime() : projectStart;
          
          // 檢查是否有重疊
          return projectStart <= end && projectEnd >= start;
        });
        
        projectSelectorCache.set(cacheKey, result);
        return result;
      },
      
      // 獲取最近的專案
      getRecentProjects: (limit = 10) => {
        const cacheKey = `recent_projects_${limit}`;
        const cached = projectSelectorCache.get(cacheKey);
        if (cached) return cached;
        
        const result = [...get().projects]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
          .slice(0, limit);
        
        projectSelectorCache.set(cacheKey, result);
        return result;
      },
      
      // 清除專案緩存
      clearProjectCache: () => {
        projectSelectorCache.clear();
        console.log('🧹 專案選擇器緩存已清除');
      },
      
      // 設置選擇的專案
      setSelectedProject: (id) => {
        const project = id ? get().getProjectById(id) : null;
        set({
          selectedProjectId: id,
          selectedProject: project
        });
      },
      
      // 初始化專案數據
      initializeProjects: async () => {
        try {
          const projects = await withFirebaseErrorHandling(
            () => firebaseService.getProjects(),
            'getProjects'
          );
          
          set({ projects });
          console.log(`📋 載入 ${projects.length} 個專案`);
        } catch (error) {
          console.error('初始化專案失敗:', error);
          // 使用本地數據作為fallback
        }
      },
      
      // 獲取專案總數
      getProjectCount: () => {
        return get().projects.length;
      },
      
      // 獲取活躍專案數量
      getActiveProjectCount: () => {
        return get().getActiveProjects().length;
      },
    }),
    {
      name: 'project-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        projects: state.projects,
        selectedProjectId: state.selectedProjectId,
      }),
    }
  )
);

// 導出便利函數
export const getProject = (id: string) => useProjectStore.getState().getProjectById(id);
export const getActiveProjects = () => useProjectStore.getState().getActiveProjects();
export const getSelectedProject = () => useProjectStore.getState().selectedProject;

export default useProjectStore; 