import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseService } from '@/services/firebaseService';
import { withFirebaseErrorHandling } from '@/utils/errorHandling';
import { Project } from '@/types/project';
import { generateId } from '@/utils/helpers';

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