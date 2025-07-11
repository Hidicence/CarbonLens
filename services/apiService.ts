import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Project, 
  ProjectEmissionRecord, 
  NonProjectEmissionRecord,
  ProjectEmissionSummary,
  AllocationRecord 
} from '@/types/project';

// API配置
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3001/api' 
  : 'http://10.0.2.2:3001/api'; // Android模擬器使用10.0.2.2，iOS模擬器使用localhost

// 創建axios實例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超時
});

// 請求攔截器 - 添加認證token (暫時禁用 - 使用Firebase認證)
api.interceptors.request.use(
  async (config) => {
    try {
      // 暫時禁用API token認證，目前使用Firebase認證
      // const token = await AsyncStorage.getItem('auth_token');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
    } catch (error) {
      console.warn('獲取認證token失敗:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理錯誤 (認證錯誤處理已禁用)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API請求錯誤:', error.response?.data || error.message);
    
    // 處理網絡錯誤
    if (!error.response) {
      throw new Error('網絡連接失敗，請檢查網絡設置');
    }
    
    // 處理認證錯誤 (暫時禁用 - 使用Firebase認證)
    // if (error.response.status === 401) {
    //   // 清除本地認證信息
    //   AsyncStorage.removeItem('auth_token');
    //   throw new Error('認證已過期，請重新登入');
    // }
    
    throw error;
  }
);

// 專案API
export const projectApi = {
  // 獲取所有專案
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get('/projects');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('獲取專案失敗:', error);
      throw error;
    }
  },

  // 創建專案
  createProject: async (project: Omit<Project, 'id' | 'createdAt' | 'emissionSummary'>): Promise<Project> => {
    try {
      const response = await api.post('/projects', project);
      return response.data.data || response.data;
    } catch (error) {
      console.error('創建專案失敗:', error);
      throw error;
    }
  },

  // 更新專案
  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    try {
      const response = await api.put(`/projects/${id}`, updates);
      return response.data.data || response.data;
    } catch (error) {
      console.error('更新專案失敗:', error);
      throw error;
    }
  },

  // 刪除專案
  deleteProject: async (id: string): Promise<void> => {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error('刪除專案失敗:', error);
      throw error;
    }
  },

  // 獲取專案排放摘要
  getProjectEmissions: async (projectId: string): Promise<ProjectEmissionSummary> => {
    try {
      const response = await api.get(`/projects/${projectId}/emissions`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('獲取專案排放摘要失敗:', error);
      throw error;
    }
  },
};

// 排放記錄API
export const emissionApi = {
  // 獲取排放記錄
  getEmissionRecords: async (projectId?: string): Promise<ProjectEmissionRecord[]> => {
    try {
      const url = projectId ? `/emissions?project_id=${projectId}` : '/emissions';
      const response = await api.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('獲取排放記錄失敗:', error);
      throw error;
    }
  },

  // 創建排放記錄
  createEmissionRecord: async (record: Omit<ProjectEmissionRecord, 'id' | 'createdAt'>): Promise<ProjectEmissionRecord> => {
    try {
      const response = await api.post('/emissions', record);
      return response.data.data || response.data;
    } catch (error) {
      console.error('創建排放記錄失敗:', error);
      throw error;
    }
  },

  // 更新排放記錄
  updateEmissionRecord: async (id: string, updates: Partial<ProjectEmissionRecord>): Promise<ProjectEmissionRecord> => {
    try {
      const response = await api.put(`/emissions/${id}`, updates);
      return response.data.data || response.data;
    } catch (error) {
      console.error('更新排放記錄失敗:', error);
      throw error;
    }
  },

  // 刪除排放記錄
  deleteEmissionRecord: async (id: string): Promise<void> => {
    try {
      await api.delete(`/emissions/${id}`);
    } catch (error) {
      console.error('刪除排放記錄失敗:', error);
      throw error;
    }
  },
};

// 營運排放記錄API
export const operationalApi = {
  // 獲取營運排放記錄
  getOperationalRecords: async (): Promise<NonProjectEmissionRecord[]> => {
    try {
      const response = await api.get('/emissions/operational');
      return response.data.data || [];
    } catch (error) {
      console.error('獲取營運排放記錄失敗:', error);
      throw error;
    }
  },

  // 創建營運排放記錄
  createOperationalRecord: async (record: Omit<NonProjectEmissionRecord, 'id' | 'createdAt'>): Promise<NonProjectEmissionRecord> => {
    try {
      const response = await api.post('/emissions/operational', record);
      return response.data.data || response.data;
    } catch (error) {
      console.error('創建營運排放記錄失敗:', error);
      throw error;
    }
  },

  // 更新營運排放記錄
  updateOperationalRecord: async (id: string, updates: Partial<NonProjectEmissionRecord>): Promise<NonProjectEmissionRecord> => {
    try {
      const response = await api.put(`/emissions/operational/${id}`, updates);
      return response.data.data || response.data;
    } catch (error) {
      console.error('更新營運排放記錄失敗:', error);
      throw error;
    }
  },

  // 刪除營運排放記錄
  deleteOperationalRecord: async (id: string): Promise<void> => {
    try {
      await api.delete(`/emissions/operational/${id}`);
    } catch (error) {
      console.error('刪除營運排放記錄失敗:', error);
      throw error;
    }
  },
};

// 統計API
export const statisticsApi = {
  // 獲取統計概覽
  getOverview: async () => {
    try {
      const response = await api.get('/statistics/overview');
      return response.data.data || response.data;
    } catch (error) {
      console.error('獲取統計概覽失敗:', error);
      throw error;
    }
  },

  // 獲取專案排行
  getProjectRanking: async (params: { period?: string, limit?: string } = {}) => {
    try {
      const { period = '30', limit = '10' } = params;
      const response = await api.get(`/statistics/projects/ranking?period=${period}&limit=${limit}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('獲取專案排行失敗:', error);
      throw error;
    }
  },

  // 獲取時間線數據
  getTimeline: async (params: { start_date?: string, end_date?: string, granularity?: string } = {}) => {
    try {
      const queryParams = new URLSearchParams(params as any).toString();
      const response = await api.get(`/statistics/timeline?${queryParams}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('獲取時間線數據失敗:', error);
      throw error;
    }
  },
};

// 同步API
export const syncApi = {
  // 檢查連接狀態
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  // 同步本地數據到服務器
  syncToServer: async (data: {
    projects: Project[];
    projectEmissions: ProjectEmissionRecord[];
    operationalEmissions: NonProjectEmissionRecord[];
  }) => {
    try {
      const response = await api.post('/sync/upload', data);
      return response.data;
    } catch (error) {
      console.error('同步數據到服務器失敗:', error);
      throw error;
    }
  },

  // 從服務器同步數據
  syncFromServer: async () => {
    try {
      const response = await api.get('/sync/download');
      return response.data.data || response.data;
    } catch (error) {
      console.error('從服務器同步數據失敗:', error);
      throw error;
    }
  },
};

// 認證API (未實現 - 目前使用Firebase認證)
// export const authApi = {
//   // 登入
//   login: async (email: string, password: string) => {
//     try {
//       const response = await api.post('/auth/login', { email, password });
//       const { token, user } = response.data.data || response.data;
//       
//       // 保存認證token
//       if (token) {
//         await AsyncStorage.setItem('auth_token', token);
//       }
//       
//       return { token, user };
//     } catch (error) {
//       console.error('登入失敗:', error);
//       throw error;
//     }
//   },

//   // 登出
//   logout: async () => {
//     try {
//       await api.post('/auth/logout');
//       await AsyncStorage.removeItem('auth_token');
//     } catch (error) {
//       console.error('登出失敗:', error);
//       // 即使API調用失敗，也要清除本地token
//       await AsyncStorage.removeItem('auth_token');
//     }
//   },

//   // 註冊
//   register: async (name: string, email: string, password: string) => {
//     try {
//       const response = await api.post('/auth/register', { name, email, password });
//       return response.data.data || response.data;
//     } catch (error) {
//       console.error('註冊失敗:', error);
//       throw error;
//     }
//   },
// };

// 導出配置
export { API_BASE_URL };
export default api; 