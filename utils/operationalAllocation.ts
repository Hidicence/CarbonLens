// 營運排放分攤邏輯 - 專業碳足跡管理

import { Project, NonProjectEmissionRecord, AllocationMethod, AllocationRecord } from '@/types/project';

/**
 * 專業分攤邏輯類
 * 符合 ISO 14064-1 和 GHG Protocol 標準
 */
export class OperationalAllocationManager {
  
  /**
   * 確定合格的分攤目標專案
   * 符合時間邊界和狀態原則
   */
  static getEligibleProjects(
    projects: Project[], 
    allocationDate: Date
  ): Project[] {
    return projects.filter(project => {
      // 1. 排除已完成的專案 (正確做法!)
      if (project.status === 'completed') {
        return false;
      }
      
      // 2. 時間邊界檢查
      const projectStart = project.startDate ? new Date(project.startDate) : null;
      const projectEnd = project.endDate ? new Date(project.endDate) : null;
      
      // 專案必須在營運排放發生時處於活躍狀態
      if (projectStart && allocationDate < projectStart) {
        return false; // 專案還未開始
      }
      
      if (projectEnd && allocationDate > projectEnd) {
        return false; // 專案已結束
      }
      
      // 3. 只分攤給進行中和規劃中的專案
      return ['active', 'planning'].includes(project.status);
    });
  }

  /**
   * 計算預算分攤比例
   */
  static calculateBudgetAllocation(
    eligibleProjects: Project[], 
    totalAmount: number
  ): Array<{ projectId: string; amount: number; percentage: number }> {
    const totalBudget = eligibleProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    if (totalBudget === 0) {
      console.warn('總預算為 0，無法進行預算分攤');
      return [];
    }
    
    return eligibleProjects.map(project => {
      const budget = project.budget || 0;
      const percentage = (budget / totalBudget) * 100;
      const amount = (budget / totalBudget) * totalAmount;
      
      return {
        projectId: project.id,
        amount,
        percentage
      };
    });
  }

  /**
   * 計算時間分攤比例
   * 根據專案在分攤月份的活躍天數
   */
  static calculateDurationAllocation(
    eligibleProjects: Project[], 
    totalAmount: number,
    allocationDate: Date
  ): Array<{ projectId: string; amount: number; percentage: number }> {
    const allocationMonth = allocationDate.getMonth();
    const allocationYear = allocationDate.getFullYear();
    
    // 計算該月份的總天數
    const daysInMonth = new Date(allocationYear, allocationMonth + 1, 0).getDate();
    
    const projectDays = eligibleProjects.map(project => {
      const startDate = project.startDate ? new Date(project.startDate) : new Date(allocationYear, allocationMonth, 1);
      const endDate = project.endDate ? new Date(project.endDate) : new Date(allocationYear, allocationMonth, daysInMonth);
      
      // 計算專案在該月的活躍天數
      const monthStart = new Date(allocationYear, allocationMonth, 1);
      const monthEnd = new Date(allocationYear, allocationMonth, daysInMonth);
      
      const effectiveStart = startDate > monthStart ? startDate : monthStart;
      const effectiveEnd = endDate < monthEnd ? endDate : monthEnd;
      
      const activeDays = Math.max(0, Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      return {
        projectId: project.id,
        activeDays
      };
    });
    
    const totalDays = projectDays.reduce((sum, p) => sum + p.activeDays, 0);
    
    if (totalDays === 0) {
      console.warn('總活躍天數為 0，無法進行時間分攤');
      return [];
    }
    
    return projectDays.map(({ projectId, activeDays }) => {
      const percentage = (activeDays / totalDays) * 100;
      const amount = (activeDays / totalDays) * totalAmount;
      
      return {
        projectId,
        amount,
        percentage
      };
    });
  }

  /**
   * 計算平均分攤
   */
  static calculateEqualAllocation(
    eligibleProjects: Project[], 
    totalAmount: number
  ): Array<{ projectId: string; amount: number; percentage: number }> {
    if (eligibleProjects.length === 0) {
      return [];
    }
    
    const amountPerProject = totalAmount / eligibleProjects.length;
    const percentagePerProject = 100 / eligibleProjects.length;
    
    return eligibleProjects.map(project => ({
      projectId: project.id,
      amount: amountPerProject,
      percentage: percentagePerProject
    }));
  }

  /**
   * 根據階段分攤營運排放
   * 營運排放通常分攤給前期製作(60%)和後期製作(40%)
   */
  static allocateByStage(
    totalAmount: number,
    stageRatio: { preProduction: number; postProduction: number } = { preProduction: 0.6, postProduction: 0.4 }
  ): { preProduction: number; postProduction: number } {
    return {
      preProduction: totalAmount * stageRatio.preProduction,
      postProduction: totalAmount * stageRatio.postProduction
    };
  }

  /**
   * 主要分攤邏輯
   */
  static allocateOperationalEmission(
    record: NonProjectEmissionRecord,
    allProjects: Project[],
    method: AllocationMethod = 'budget',
    customPercentages?: { [projectId: string]: number }
  ): AllocationRecord[] {
    const allocationDate = new Date(record.date);
    const eligibleProjects = this.getEligibleProjects(allProjects, allocationDate);
    
    if (eligibleProjects.length === 0) {
      console.warn(`記錄 ${record.id} 沒有合格的分攤目標專案`);
      return [];
    }

    let allocations: Array<{ projectId: string; amount: number; percentage: number }> = [];

    switch (method) {
      case 'budget':
        allocations = this.calculateBudgetAllocation(eligibleProjects, record.amount);
        break;
      
      case 'duration':
        allocations = this.calculateDurationAllocation(eligibleProjects, record.amount, allocationDate);
        break;
      
      case 'equal':
        allocations = this.calculateEqualAllocation(eligibleProjects, record.amount);
        break;
      
      case 'custom':
        if (customPercentages) {
          const totalPercentage = Object.values(customPercentages).reduce((sum, p) => sum + p, 0);
          if (Math.abs(totalPercentage - 100) > 0.01) {
            console.warn('自訂百分比總和不等於 100%');
          }
          
          allocations = Object.entries(customPercentages)
            .filter(([projectId]) => eligibleProjects.some(p => p.id === projectId))
            .map(([projectId, percentage]) => ({
              projectId,
              amount: (percentage / 100) * record.amount,
              percentage
            }));
        }
        break;
      
      default:
        console.warn(`不支援的分攤方法: ${method}`);
        return [];
    }

    // 生成分攤記錄
    return allocations.map(allocation => ({
      id: `${record.id}-${allocation.projectId}-${Date.now()}`,
      nonProjectRecordId: record.id!,
      projectId: allocation.projectId,
      allocatedAmount: allocation.amount,
      percentage: allocation.percentage,
      method,
      createdAt: new Date().toISOString()
    }));
  }

  /**
   * 驗證分攤規則完整性
   */
  static validateAllocationRule(
    record: NonProjectEmissionRecord,
    allProjects: Project[]
  ): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const allocationDate = new Date(record.date);
    const eligibleProjects = this.getEligibleProjects(allProjects, allocationDate);

    // 檢查是否有合格專案
    if (eligibleProjects.length === 0) {
      warnings.push('在該日期沒有合格的專案可供分攤');
    }

    // 檢查排放類別是否適合分攤
    if (!record.isAllocated) {
      warnings.push('記錄未標記為需要分攤');
    }

    // 檢查 Scope 3 排放的合理性
    if (record.categoryId.startsWith('scope3')) {
      warnings.push('Scope 3 排放的分攤需要特別注意邊界定義');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * 生成分攤報告
   */
  static generateAllocationReport(
    records: NonProjectEmissionRecord[],
    allocationRecords: AllocationRecord[],
    projects: Project[]
  ) {
    const allocatedRecords = records.filter(r => r.isAllocated);
    const totalAllocatedAmount = allocatedRecords.reduce((sum, r) => sum + r.amount, 0);
    
    const projectSummary = projects.map(project => {
      const projectAllocations = allocationRecords.filter(a => a.projectId === project.id);
      const totalAllocated = projectAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      
      return {
        projectId: project.id,
        projectName: project.name,
        totalAllocated,
        allocationCount: projectAllocations.length,
        percentage: totalAllocatedAmount > 0 ? (totalAllocated / totalAllocatedAmount) * 100 : 0
      };
    }).filter(p => p.totalAllocated > 0);

    return {
      summary: {
        totalRecords: records.length,
        allocatedRecords: allocatedRecords.length,
        unallocatedRecords: records.length - allocatedRecords.length,
        totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
        totalAllocatedAmount,
        unallocatedAmount: records.reduce((sum, r) => sum + r.amount, 0) - totalAllocatedAmount
      },
      projectSummary,
      lastUpdated: new Date().toISOString()
    };
  }
} 