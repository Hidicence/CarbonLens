import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 项目相关接口
export interface Project {
  id: string
  name: string
  description?: string
  location?: string
  status: 'planning' | 'active' | 'paused' | 'completed'
  startDate: string
  endDate?: string
  budget?: number
  category?: string
  createdAt: string
  carbonBudget?: {
    total: number
    stages?: {
      'pre-production'?: number
      production?: number
      'post-production'?: number
    }
  }
  emissionSummary: {
    projectId: string
    directEmissions: number
    allocatedEmissions: number
    totalEmissions: number
    directRecordCount: number
    allocatedRecordCount: number
  }
}

export interface EmissionRecord {
  id: string
  projectId?: string
  amount: number
  category: string
  subcategory?: string
  description: string
  date: string
  stage?: 'pre-production' | 'production' | 'post-production'
  equipment?: string
  location?: string
  createdAt: string
}

export interface ProjectEmissionSummary {
  projectId: string
  directEmissions: number
  allocatedEmissions: number
  totalEmissions: number
  directRecordCount: number
  allocatedRecordCount: number
  stageEmissions?: {
    'pre-production': number
    'production': number
    'post-production': number
  }
  categoryBreakdown?: {
    [category: string]: number
  }
}

// API functions
export const projectApi = {
  // 获取所有项目
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get('/projects')
      // 处理后端返回的数据格式
      return response.data.data || response.data || []
    } catch (error) {
      console.error('获取项目失败:', error)
      return []
    }
  },

  // 创建项目
  createProject: async (project: Omit<Project, 'id' | 'createdAt' | 'emissionSummary'>): Promise<Project> => {
    const response = await apiClient.post('/projects', project)
    return response.data
  },

  // 更新项目
  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const response = await apiClient.put(`/projects/${id}`, updates)
    return response.data
  },

  // 删除项目
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`)
  },

  // 获取项目排放汇总
  getProjectEmissions: async (projectId: string): Promise<ProjectEmissionSummary> => {
    const response = await apiClient.get(`/projects/${projectId}/emissions`)
    return response.data
  },
}

export const emissionApi = {
  // 获取排放记录
  getEmissionRecords: async (projectId?: string): Promise<EmissionRecord[]> => {
    try {
      const url = projectId ? `/emissions?project_id=${projectId}` : '/emissions'
      const response = await apiClient.get(url)
      // 后端返回的是 { success: true, data: [...], pagination: {...} }
      // 我们需要返回 data 数组
      return response.data.data || []
    } catch (error) {
      console.error('获取排放记录失败:', error)
      return []
    }
  },

  // 创建排放记录
  createEmissionRecord: async (record: Omit<EmissionRecord, 'id' | 'createdAt'>): Promise<EmissionRecord> => {
    const response = await apiClient.post('/emissions', record)
    return response.data.data || response.data
  },

  // 更新排放记录
  updateEmissionRecord: async (id: string, updates: Partial<EmissionRecord>): Promise<EmissionRecord> => {
    const response = await apiClient.put(`/emissions/${id}`, updates)
    return response.data.data || response.data
  },

  // 删除排放记录
  deleteEmissionRecord: async (id: string): Promise<void> => {
    await apiClient.delete(`/emissions/${id}`)
  },
}

export const analyticsApi = {
  // 获取统计概览
  getOverviewStats: async () => {
    const response = await apiClient.get('/analytics/overview')
    return response.data
  },

  // 获取项目排名
  getProjectRanking: async (period: string = '30d') => {
    const response = await apiClient.get(`/analytics/projects/ranking?period=${period}`)
    return response.data
  },

  // 获取趋势数据
  getTrendData: async (projectId?: string, granularity: string = 'day') => {
    const url = projectId 
      ? `/analytics/timeline?projectId=${projectId}&granularity=${granularity}`
      : `/analytics/timeline?granularity=${granularity}`
    const response = await apiClient.get(url)
    return response.data
  },

  // 获取分类分析
  getCategoryAnalysis: async (projectId?: string) => {
    const url = projectId 
      ? `/analytics/categories?projectId=${projectId}`
      : '/analytics/categories'
    const response = await apiClient.get(url)
    return response.data
  },

  // 获取阶段分析
  getStageAnalysis: async (projectId?: string) => {
    const url = projectId 
      ? `/analytics/stages?projectId=${projectId}`
      : '/analytics/stages'
    const response = await apiClient.get(url)
    return response.data
  },

  // 获取效率分析
  getEfficiencyAnalysis: async () => {
    const response = await apiClient.get('/analytics/efficiency')
    return response.data
  },
}

// 統計相關 API
export const getStatisticsOverview = async () => {
  try {
    const response = await apiClient.get('/statistics/overview')
    return response.data.data || response.data
  } catch (error) {
    console.error('獲取統計概覽失敗:', error)
    return {
      projects: { total: 0, byStatus: [] },
      emissions: { total: 0, monthly: [], byCategory: [], byStage: [] }
    }
  }
}

export const getProjectsRanking = async (params: { period?: string, limit?: string } = {}) => {
  try {
    const { period = '30', limit = '10' } = params
    const response = await apiClient.get(`/statistics/projects/ranking?period=${period}&limit=${limit}`)
    return response.data.data || response.data
  } catch (error) {
    console.error('獲取專案排行失敗:', error)
    return { ranking: [] }
  }
}

export const reportApi = {
  // 生成报告
  generateReport: async (options: any) => {
    const response = await apiClient.post('/reports/generate', options)
    return response.data
  },

  // 导出CSV
  exportCsv: async (projectId?: string) => {
    const url = projectId ? `/reports/export/csv?projectId=${projectId}` : '/reports/export/csv'
    const response = await apiClient.get(url, { responseType: 'blob' })
    return response.data
  },
}

// 统一的 API 对象，方便导入使用
export const api = {
  // 项目相关
  getProjects: projectApi.getProjects,
  createProject: projectApi.createProject,
  updateProject: projectApi.updateProject,
  deleteProject: projectApi.deleteProject,
  getProjectEmissions: projectApi.getProjectEmissions,
  
  // 排放记录相关
  getEmissionRecords: emissionApi.getEmissionRecords,
  createEmissionRecord: emissionApi.createEmissionRecord,
  updateEmissionRecord: emissionApi.updateEmissionRecord,
  deleteEmissionRecord: emissionApi.deleteEmissionRecord,
  
  // 分析相关
  getOverviewStats: analyticsApi.getOverviewStats,
  getProjectRanking: analyticsApi.getProjectRanking,
  getTrendData: analyticsApi.getTrendData,
  getCategoryAnalysis: analyticsApi.getCategoryAnalysis,
  getStageAnalysis: analyticsApi.getStageAnalysis,
  getEfficiencyAnalysis: analyticsApi.getEfficiencyAnalysis,
  
  // 统计相关
  getStatisticsOverview,
  getProjectsRanking,
  
  // 报告相关
  generateReport: reportApi.generateReport,
  exportCsv: reportApi.exportCsv,
}

export default apiClient 