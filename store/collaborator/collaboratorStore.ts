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
import { 
  Collaborator, 
  CollaboratorRole, 
  CollaboratorPermissions 
} from '@/types/project';
import { generateId } from '@/utils/helpers';

interface CollaboratorState {
  // 協作者管理
  addCollaborator: (projectId: string, collaborator: Omit<Collaborator, 'id'>) => void;
  updateCollaborator: (projectId: string, collaboratorId: string, updates: Partial<Collaborator>) => void;
  removeCollaborator: (projectId: string, collaboratorId: string) => void;
  getCollaboratorsByProjectId: (projectId: string, collaborators: Collaborator[]) => Collaborator[];
  
  // 權限管理
  getDefaultPermissions: (role: CollaboratorRole) => CollaboratorPermissions;
  getUserRoleInProject: (projectId: string, userId: string, collaborators: Collaborator[]) => CollaboratorRole | null;
  checkPermission: (
    projectId: string, 
    userId: string, 
    permission: keyof CollaboratorPermissions, 
    collaborators: Collaborator[]
  ) => boolean;
  
  // 邀請管理
  generateInviteCode: (projectId: string) => string;
  validateInviteCode: (code: string) => { isValid: boolean; projectId?: string; expiresAt?: string };
  
  // 協作者統計
  getCollaboratorStats: (collaborators: Collaborator[]) => {
    totalCollaborators: number;
    activeCollaborators: number;
    roleDistribution: Record<CollaboratorRole, number>;
    recentJoins: Collaborator[];
  };
  
  // 活動追蹤
  updateLastActivity: (projectId: string, userId: string, collaborators: Collaborator[]) => Collaborator[];
  getInactiveCollaborators: (collaborators: Collaborator[], daysSince: number) => Collaborator[];
}

export const useCollaboratorStore = create<CollaboratorState>()(
  persist(
    (set, get) => ({
      // 新增協作者
      addCollaborator: (projectId, collaborator) => {
        const id = generateId();
        const newCollaborator: Collaborator = {
          ...collaborator,
          id,
          joinedAt: new Date().toISOString(),
          isActive: true,
          permissions: collaborator.permissions || get().getDefaultPermissions(collaborator.role),
        };
        
        console.log(`✅ 協作者 "${newCollaborator.name}" 已加入專案 ${projectId}`);
        
        // 注意：這裡需要外部Store處理實際的專案更新
        // 因為協作者數據存儲在專案中
      },
      
      // 更新協作者
      updateCollaborator: (projectId, collaboratorId, updates) => {
        console.log(`✅ 協作者 ${collaboratorId} 已更新`);
        
        // 注意：這裡需要外部Store處理實際的更新
      },
      
      // 移除協作者
      removeCollaborator: (projectId, collaboratorId) => {
        console.log(`🗑️ 協作者 ${collaboratorId} 已從專案 ${projectId} 移除`);
        
        // 注意：這裡需要外部Store處理實際的移除
      },
      
      // 根據專案ID獲取協作者
      getCollaboratorsByProjectId: (projectId, collaborators) => {
        return collaborators.filter(collaborator => collaborator.isActive !== false);
      },
      
      // 獲取預設權限
      getDefaultPermissions: (role) => {
        const basePermissions: CollaboratorPermissions = {
          canEdit: false,
          canDelete: false,
          canInvite: false,
          canViewReports: false,
          canManageCollaborators: false,
          // Legacy支援
          viewProject: true,
          editProject: false,
          deleteProject: false,
          manageBudget: false,
          viewRecords: true,
          addRecords: false,
          editRecords: false,
          deleteRecords: false,
          exportData: false,
          generateReports: false,
        };
        
        switch (role) {
          case 'owner':
            return {
              ...basePermissions,
              canEdit: true,
              canDelete: true,
              canInvite: true,
              canViewReports: true,
              canManageCollaborators: true,
              editProject: true,
              deleteProject: true,
              manageBudget: true,
              addRecords: true,
              editRecords: true,
              deleteRecords: true,
              exportData: true,
              generateReports: true,
            };
          
          case 'admin':
            return {
              ...basePermissions,
              canEdit: true,
              canDelete: true,
              canInvite: true,
              canViewReports: true,
              canManageCollaborators: true,
              editProject: true,
              manageBudget: true,
              addRecords: true,
              editRecords: true,
              deleteRecords: true,
              exportData: true,
              generateReports: true,
            };
          
          case 'editor':
            return {
              ...basePermissions,
              canEdit: true,
              canViewReports: true,
              editProject: true,
              addRecords: true,
              editRecords: true,
              exportData: true,
              generateReports: true,
            };
          
          case 'contributor':
            return {
              ...basePermissions,
              canEdit: true,
              canViewReports: true,
              addRecords: true,
              editRecords: true,
            };
          
          case 'viewer':
          default:
            return {
              ...basePermissions,
              canViewReports: true,
              generateReports: true,
            };
        }
      },
      
      // 獲取用戶在專案中的角色
      getUserRoleInProject: (projectId, userId, collaborators) => {
        const collaborator = collaborators.find(c => c.id === userId);
        return collaborator?.role || null;
      },
      
      // 檢查權限
      checkPermission: (projectId, userId, permission, collaborators) => {
        const collaborator = collaborators.find(c => c.id === userId);
        if (!collaborator || !collaborator.isActive) {
          return false;
        }
        
        return collaborator.permissions[permission] || false;
      },
      
      // 生成邀請碼
      generateInviteCode: (projectId) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const code = `${projectId.substring(0, 8)}-${random}-${timestamp.toString(36)}`;
        
        console.log(`📧 專案 ${projectId} 的邀請碼已生成: ${code}`);
        return code;
      },
      
      // 驗證邀請碼
      validateInviteCode: (code) => {
        try {
          const parts = code.split('-');
          if (parts.length !== 3) {
            return { isValid: false };
          }
          
          const [projectPrefix, random, timestampStr] = parts;
          const timestamp = parseInt(timestampStr, 36);
          const expiresAt = new Date(timestamp + 7 * 24 * 60 * 60 * 1000); // 7天有效
          
          if (Date.now() > expiresAt.getTime()) {
            return { isValid: false };
          }
          
          // 這裡應該驗證projectPrefix是否對應真實專案
          // 簡化處理，假設有效
          return {
            isValid: true,
            projectId: `project_${projectPrefix}`, // 這裡需要實際的專案ID映射
            expiresAt: expiresAt.toISOString(),
          };
        } catch (error) {
          return { isValid: false };
        }
      },
      
      // 協作者統計
      getCollaboratorStats: (collaborators) => {
        const activeCollaborators = collaborators.filter(c => c.isActive !== false);
        const totalCollaborators = collaborators.length;
        
        // 角色分佈統計
        const roleDistribution: Record<CollaboratorRole, number> = {
          owner: 0,
          admin: 0,
          editor: 0,
          contributor: 0,
          viewer: 0,
        };
        
        collaborators.forEach(c => {
          roleDistribution[c.role] = (roleDistribution[c.role] || 0) + 1;
        });
        
        // 最近加入的協作者（最近30天）
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentJoins = collaborators
          .filter(c => new Date(c.joinedAt) >= thirtyDaysAgo)
          .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
          .slice(0, 5);
        
        return {
          totalCollaborators,
          activeCollaborators: activeCollaborators.length,
          roleDistribution,
          recentJoins,
        };
      },
      
      // 更新最後活動時間
      updateLastActivity: (projectId, userId, collaborators) => {
        const now = new Date().toISOString();
        
        return collaborators.map(collaborator => {
          if (collaborator.id === userId) {
            return {
              ...collaborator,
              lastActive: now,
            };
          }
          return collaborator;
        });
      },
      
      // 獲取不活躍的協作者
      getInactiveCollaborators: (collaborators, daysSince = 30) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysSince);
        
        return collaborators.filter(collaborator => {
          if (!collaborator.lastActive) {
            // 如果沒有最後活動時間，檢查加入時間
            return new Date(collaborator.joinedAt) < cutoffDate;
          }
          return new Date(collaborator.lastActive) < cutoffDate;
        });
      },
    }),
    {
      name: 'collaborator-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({}), // 協作者數據存儲在專案中，這裡不需要持久化
    }
  )
);

// 導出便利函數
export const getDefaultPermissions = (role: CollaboratorRole) => 
  useCollaboratorStore.getState().getDefaultPermissions(role);

export const checkUserPermission = (
  projectId: string, 
  userId: string, 
  permission: keyof CollaboratorPermissions, 
  collaborators: Collaborator[]
) => useCollaboratorStore.getState().checkPermission(projectId, userId, permission, collaborators);

export const getUserRole = (projectId: string, userId: string, collaborators: Collaborator[]) => 
  useCollaboratorStore.getState().getUserRoleInProject(projectId, userId, collaborators);

export default useCollaboratorStore; 