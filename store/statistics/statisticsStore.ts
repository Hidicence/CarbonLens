import { create } from 'zustand';
import { 
  Project,
  ProjectEmissionRecord,
  NonProjectEmissionRecord,
  AllocationRecord,
  ProjectEmissionSummary,
  ProductionStage,
  ShootingDayEmission 
} from '@/types/project';
import { memoize, TTLCache, performanceMonitor, groupBy } from '@/utils/performance';

// 緩存管理
const summaryCache = new TTLCache<ProjectEmissionSummary>(10 * 60 * 1000); // 10分鐘緩存
const trendsCache = new TTLCache<Array<{ period: string; emissions: number; recordCount: number }>>(5 * 60 * 1000);
const categoryCache = new TTLCache<Array<{ categoryId: string; categoryName: string; emissions: number; percentage: number; recordCount: number }>>(5 * 60 * 1000);

interface StatisticsState {
  // 緩存管理
  clearCache: () => void;
  getCacheStats: () => Record<string, any>;
  
  // 專案排放摘要計算
  calculateProjectEmissions: (
    projectId: string,
    projectRecords: ProjectEmissionRecord[],
    allocationRecords: AllocationRecord[]
  ) => ProjectEmissionSummary;
  
  getProjectEmissionSummary: (
    projectId: string,
    projectRecords: ProjectEmissionRecord[],
    allocationRecords: AllocationRecord[]
  ) => ProjectEmissionSummary;
  
  // 專案統計分析
  getProjectTotalEmissions: (projectId: string, projectRecords: ProjectEmissionRecord[], allocationRecords: AllocationRecord[]) => number;
  getProjectDirectEmissions: (projectId: string, projectRecords: ProjectEmissionRecord[]) => number;
  getProjectAllocatedEmissions: (projectId: string, allocationRecords: AllocationRecord[]) => number;
  getProjectEmissionsByStage: (projectId: string, projectRecords: ProjectEmissionRecord[]) => Record<ProductionStage, number>;
  
  // 跨專案統計
  getTotalEmissionsAcrossProjects: (projects: Project[], projectRecords: ProjectEmissionRecord[], allocationRecords: AllocationRecord[]) => number;
  getEmissionsByProject: (projects: Project[], projectRecords: ProjectEmissionRecord[], allocationRecords: AllocationRecord[]) => Array<{
    project: Project;
    directEmissions: number;
    allocatedEmissions: number;
    totalEmissions: number;
    percentage: number;
  }>;
  
  // 營運排放統計
  getOperationalEmissionsSummary: (nonProjectRecords: NonProjectEmissionRecord[], allocationRecords: AllocationRecord[]) => {
    totalEmissions: number;
    allocatedEmissions: number;
    unallocatedEmissions: number;
    allocationRate: number;
    recordCount: number;
  };
  
  // 時間趨勢分析
  getEmissionTrends: (
    records: (ProjectEmissionRecord | NonProjectEmissionRecord)[],
    groupBy: 'day' | 'week' | 'month' | 'year'
  ) => Array<{ period: string; emissions: number; recordCount: number }>;
  
  // 拍攝日統計
  getShootingDayEmissionsSummary: (projectId: string, shootingRecords: ShootingDayEmission[]) => {
    totalEmissions: number;
    averagePerDay: number;
    totalDays: number;
    totalRecords: number;
    peakDay: { date: string; emissions: number } | null;
  };
  
  // 類別分析
  getEmissionsByCategory: (
    records: (ProjectEmissionRecord | NonProjectEmissionRecord)[],
    categoryMapping?: Record<string, string>
  ) => Array<{ categoryId: string; categoryName: string; emissions: number; percentage: number; recordCount: number }>;
  
  // 效率指標
  getEfficiencyMetrics: (projects: Project[], projectRecords: ProjectEmissionRecord[], allocationRecords: AllocationRecord[]) => {
    emissionsPerProject: number;
    emissionsPerBudget: number; // kg CO₂e per dollar
    emissionsPerDay: number;
    activeProjectsCount: number;
  };
  
  // 預算對比分析
  getCarbonBudgetAnalysis: (
    project: Project,
    projectRecords: ProjectEmissionRecord[],
    allocationRecords: AllocationRecord[]
  ) => {
    budgetTotal: number;
    actualTotal: number;
    variance: number;
    utilizationRate: number;
    stageAnalysis: Record<ProductionStage, {
      budget: number;
      actual: number;
      variance: number;
      utilizationRate: number;
    }>;
  } | null;
}

export const useStatisticsStore = create<StatisticsState>()((set, get) => ({
  // 緩存管理
  clearCache: () => {
    summaryCache.clear();
    trendsCache.clear();
    categoryCache.clear();
    console.log('🧹 統計緩存已清除');
  },
  
  getCacheStats: () => {
    return {
      summary: summaryCache.getStats(),
      trends: trendsCache.getStats(),
      category: categoryCache.getStats(),
    };
  },
  
  // 計算專案排放摘要 (帶緩存)
  calculateProjectEmissions: (projectId, projectRecords, allocationRecords) => {
    const cacheKey = `${projectId}_${projectRecords.length}_${allocationRecords.length}`;
    
    // 檢查緩存
    const cached = summaryCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 性能監控
    const endMonitor = performanceMonitor.start('calculateProjectEmissions');
    
    try {
      const directRecords = projectRecords.filter(record => record.projectId === projectId);
      const allocatedRecords = allocationRecords.filter(record => record.projectId === projectId);
      
      const directEmissions = directRecords.reduce((sum, record) => sum + record.amount, 0);
      const allocatedEmissions = allocatedRecords.reduce((sum, record) => sum + record.allocatedAmount, 0);
      const totalEmissions = directEmissions + allocatedEmissions;
      
      // 使用groupBy優化階段分組
      const stageGroups = groupBy(directRecords, record => record.stage);
      const stageEmissions: Record<ProductionStage, number> = {
        'pre-production': (stageGroups['pre-production'] || []).reduce((sum, record) => sum + record.amount, 0),
        'production': (stageGroups['production'] || []).reduce((sum, record) => sum + record.amount, 0),
        'post-production': (stageGroups['post-production'] || []).reduce((sum, record) => sum + record.amount, 0),
      };
      
      // 計算營運分攤到各階段（簡化處理，平均分配）
      const operationalAllocation = {
        'pre-production': allocatedEmissions * 0.2, // 20%
        'post-production': allocatedEmissions * 0.2, // 20%
        total: allocatedEmissions,
      };
      
      const result = {
        projectId,
        directEmissions,
        allocatedEmissions,
        totalEmissions,
        directRecordCount: directRecords.length,
        allocatedRecordCount: allocatedRecords.length,
        stageEmissions,
        operationalAllocation,
      };
      
      // 存入緩存
      summaryCache.set(cacheKey, result);
      
      return result;
    } finally {
      endMonitor();
    }
  },
  
  getProjectEmissionSummary: (projectId, projectRecords, allocationRecords) => {
    return get().calculateProjectEmissions(projectId, projectRecords, allocationRecords);
  },
  
  // 獲取專案總排放
  getProjectTotalEmissions: (projectId, projectRecords, allocationRecords) => {
    const summary = get().calculateProjectEmissions(projectId, projectRecords, allocationRecords);
    return summary.totalEmissions;
  },
  
  // 獲取專案直接排放
  getProjectDirectEmissions: (projectId, projectRecords) => {
    return projectRecords
      .filter(record => record.projectId === projectId)
      .reduce((sum, record) => sum + record.amount, 0);
  },
  
  // 獲取專案分攤排放
  getProjectAllocatedEmissions: (projectId, allocationRecords) => {
    return allocationRecords
      .filter(record => record.projectId === projectId)
      .reduce((sum, record) => sum + record.allocatedAmount, 0);
  },
  
  // 按階段獲取專案排放
  getProjectEmissionsByStage: (projectId, projectRecords) => {
    const stageEmissions: Record<ProductionStage, number> = {
      'pre-production': 0,
      'production': 0,
      'post-production': 0,
    };
    
    projectRecords
      .filter(record => record.projectId === projectId)
      .forEach(record => {
        stageEmissions[record.stage] += record.amount;
      });
      
    return stageEmissions;
  },
  
  // 獲取跨專案總排放
  getTotalEmissionsAcrossProjects: (projects, projectRecords, allocationRecords) => {
    return projects.reduce((total, project) => {
      const projectTotal = get().getProjectTotalEmissions(project.id, projectRecords, allocationRecords);
      return total + projectTotal;
    }, 0);
  },
  
  // 獲取各專案排放分佈
  getEmissionsByProject: (projects, projectRecords, allocationRecords) => {
    const totalEmissions = get().getTotalEmissionsAcrossProjects(projects, projectRecords, allocationRecords);
    
    return projects.map(project => {
      const directEmissions = get().getProjectDirectEmissions(project.id, projectRecords);
      const allocatedEmissions = get().getProjectAllocatedEmissions(project.id, allocationRecords);
      const projectTotalEmissions = directEmissions + allocatedEmissions;
      const percentage = totalEmissions > 0 ? (projectTotalEmissions / totalEmissions) * 100 : 0;
      
      return {
        project,
        directEmissions,
        allocatedEmissions,
        totalEmissions: projectTotalEmissions,
        percentage,
      };
    }).sort((a, b) => b.totalEmissions - a.totalEmissions);
  },
  
  // 營運排放摘要
  getOperationalEmissionsSummary: (nonProjectRecords, allocationRecords) => {
    const totalEmissions = nonProjectRecords.reduce((sum, record) => sum + record.amount, 0);
    const allocatedEmissions = allocationRecords.reduce((sum, record) => sum + record.allocatedAmount, 0);
    const unallocatedEmissions = totalEmissions - allocatedEmissions;
    const allocationRate = totalEmissions > 0 ? (allocatedEmissions / totalEmissions) * 100 : 0;
    
    return {
      totalEmissions,
      allocatedEmissions,
      unallocatedEmissions,
      allocationRate,
      recordCount: nonProjectRecords.length,
    };
  },
  
  // 排放趨勢分析 (優化版)
  getEmissionTrends: (records, groupByPeriod) => {
    const cacheKey = `trends_${groupByPeriod}_${records.length}_${records[0]?.id || 'empty'}`;
    
    // 檢查緩存
    const cached = trendsCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const endMonitor = performanceMonitor.start('getEmissionTrends');
    
    try {
      // 使用groupBy優化日期分組
      const recordsByPeriod = groupByPeriod === 'month' 
        ? groupBy(records, record => {
            const date = new Date(record.date);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          })
        : groupByPeriod === 'year'
        ? groupBy(records, record => String(new Date(record.date).getFullYear()))
        : groupBy(records, record => {
            const date = new Date(record.date);
            if (groupByPeriod === 'week') {
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              return weekStart.toISOString().split('T')[0];
            }
            return date.toISOString().split('T')[0]; // day
          });
      
      const trends = Object.entries(recordsByPeriod).map(([period, periodRecords]) => ({
        period,
        emissions: (periodRecords as any[]).reduce((sum, record) => sum + record.amount, 0),
        recordCount: (periodRecords as any[]).length,
      })).sort((a, b) => a.period.localeCompare(b.period));
      
      // 存入緩存
      trendsCache.set(cacheKey, trends);
      
      return trends;
    } finally {
      endMonitor();
    }
  },
  
  // 拍攝日排放摘要
  getShootingDayEmissionsSummary: (projectId, shootingRecords) => {
    const projectRecords = shootingRecords.filter(record => record.projectId === projectId);
    
    if (projectRecords.length === 0) {
      return {
        totalEmissions: 0,
        averagePerDay: 0,
        totalDays: 0,
        totalRecords: 0,
        peakDay: null,
      };
    }
    
    const totalEmissions = projectRecords.reduce((sum, record) => sum + record.amount, 0);
    const uniqueDays = new Set(projectRecords.map(record => record.shootingDate));
    const totalDays = uniqueDays.size;
    const averagePerDay = totalDays > 0 ? totalEmissions / totalDays : 0;
    
    // 找出排放最高的日期
    const dailyEmissions = new Map<string, number>();
    projectRecords.forEach(record => {
      const current = dailyEmissions.get(record.shootingDate) || 0;
      dailyEmissions.set(record.shootingDate, current + record.amount);
    });
    
    let peakDay: { date: string; emissions: number } | null = null;
    dailyEmissions.forEach((emissions, date) => {
      if (!peakDay || emissions > peakDay.emissions) {
        peakDay = { date, emissions };
      }
    });
    
    return {
      totalEmissions,
      averagePerDay,
      totalDays,
      totalRecords: projectRecords.length,
      peakDay,
    };
  },
  
  // 按類別分析排放
  getEmissionsByCategory: (records, categoryMapping = {}) => {
    const cacheKey = `category_${records.length}_${records[0]?.id || 'empty'}`;
    
    // 檢查緩存
    const cached = categoryCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const endMonitor = performanceMonitor.start('getEmissionsByCategory');
    
    try {
      const categoryMap = new Map<string, { emissions: number; recordCount: number }>();
      
      records.forEach(record => {
        const categoryId = record.categoryId;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, { emissions: 0, recordCount: 0 });
        }
        
        const category = categoryMap.get(categoryId)!;
        category.emissions += record.amount;
        category.recordCount += 1;
      });
      
      const totalEmissions = records.reduce((sum, record) => sum + record.amount, 0);
      
      const result = Array.from(categoryMap.entries())
        .map(([categoryId, data]) => ({
          categoryId,
          categoryName: categoryMapping[categoryId] || categoryId,
          emissions: data.emissions,
          percentage: totalEmissions > 0 ? (data.emissions / totalEmissions) * 100 : 0,
          recordCount: data.recordCount,
        }))
        .sort((a, b) => b.emissions - a.emissions);
      
      // 存入緩存
      categoryCache.set(cacheKey, result);
      
      return result;
    } finally {
      endMonitor();
    }
  },
  
  // 效率指標
  getEfficiencyMetrics: (projects, projectRecords, allocationRecords) => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const activeProjectsCount = activeProjects.length;
    
    if (activeProjectsCount === 0) {
      return {
        emissionsPerProject: 0,
        emissionsPerBudget: 0,
        emissionsPerDay: 0,
        activeProjectsCount: 0,
      };
    }
    
    const totalEmissions = get().getTotalEmissionsAcrossProjects(activeProjects, projectRecords, allocationRecords);
    const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    // 計算總專案天數（簡化計算）
    const totalDays = activeProjects.reduce((sum, project) => {
      if (project.startDate && project.endDate) {
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }
      return sum + 30; // 預設30天
    }, 0);
    
    return {
      emissionsPerProject: totalEmissions / activeProjectsCount,
      emissionsPerBudget: totalBudget > 0 ? totalEmissions / totalBudget : 0,
      emissionsPerDay: totalDays > 0 ? totalEmissions / totalDays : 0,
      activeProjectsCount,
    };
  },
  
  // 碳預算分析
  getCarbonBudgetAnalysis: (project, projectRecords, allocationRecords) => {
    if (!project.carbonBudget?.total) {
      return null;
    }
    
    const actualEmissions = get().calculateProjectEmissions(project.id, projectRecords, allocationRecords);
    const budgetTotal = project.carbonBudget.total;
    const actualTotal = actualEmissions.totalEmissions;
    const variance = actualTotal - budgetTotal;
    const utilizationRate = budgetTotal > 0 ? (actualTotal / budgetTotal) * 100 : 0;
    
    // 階段分析
    const stageAnalysis: Record<ProductionStage, {
      budget: number;
      actual: number;
      variance: number;
      utilizationRate: number;
    }> = {
      'pre-production': {
        budget: project.carbonBudget.preProduction || 0,
        actual: actualEmissions.stageEmissions?.['pre-production'] || 0,
        variance: 0,
        utilizationRate: 0,
      },
      'production': {
        budget: project.carbonBudget.production || 0,
        actual: actualEmissions.stageEmissions?.['production'] || 0,
        variance: 0,
        utilizationRate: 0,
      },
      'post-production': {
        budget: project.carbonBudget.postProduction || 0,
        actual: actualEmissions.stageEmissions?.['post-production'] || 0,
        variance: 0,
        utilizationRate: 0,
      },
    };
    
    // 計算每個階段的差異和使用率
    Object.keys(stageAnalysis).forEach(stage => {
      const stageKey = stage as ProductionStage;
      const analysis = stageAnalysis[stageKey];
      analysis.variance = analysis.actual - analysis.budget;
      analysis.utilizationRate = analysis.budget > 0 ? (analysis.actual / analysis.budget) * 100 : 0;
    });
    
    return {
      budgetTotal,
      actualTotal,
      variance,
      utilizationRate,
      stageAnalysis,
    };
  },
}));

// 導出便利函數
export const getProjectStats = (projectId: string, projectRecords: ProjectEmissionRecord[], allocationRecords: AllocationRecord[]) =>
  useStatisticsStore.getState().getProjectEmissionSummary(projectId, projectRecords, allocationRecords);

export const getOperationalStats = (nonProjectRecords: NonProjectEmissionRecord[], allocationRecords: AllocationRecord[]) =>
  useStatisticsStore.getState().getOperationalEmissionsSummary(nonProjectRecords, allocationRecords);

export const getCategoryStats = (records: (ProjectEmissionRecord | NonProjectEmissionRecord)[], categoryMapping?: Record<string, string>) =>
  useStatisticsStore.getState().getEmissionsByCategory(records, categoryMapping);

export default useStatisticsStore; 