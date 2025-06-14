import { Project, NonProjectEmissionRecord, ProjectEmissionRecord } from '@/types/project';
import { generateId } from './helpers';
import { Languages } from '@/types/common';

// 測試數據文字內容
const testDataContent = {
  zh: {
    projects: [
      {
        name: '測試影集 - 愛在台北',
        description: '描述兩位年輕人在台北相遇的浪漫愛情故事',
        location: '台北市'
      },
      {
        name: '測試廣告 - 綠色環保',
        description: '推廣環保理念的30秒電視廣告',
        location: '新北市'
      },
      {
        name: '測試紀錄片 - 台灣山林',
        description: '探索台灣山林生態的紀錄片',
        location: '南投縣'
      }
    ],
    operationalDescriptions: {
      electricity: '辦公室電費',
      commuting: '員工通勤排放',
      vehicle: '公司車輛加油',
      paper: '影印紙採購'
    },
    projectDescriptions: {
      transport: '拍攝日交通運輸',
      catering: '劇組餐飲'
    }
  },
  en: {
    projects: [
      {
        name: 'Test Series - Love in Taipei',
        description: 'A romantic story about two young people meeting in Taipei',
        location: 'Taipei City'
      },
      {
        name: 'Test Commercial - Green Environment',
        description: 'A 30-second TV commercial promoting environmental awareness',
        location: 'New Taipei City'
      },
      {
        name: 'Test Documentary - Taiwan Forests',
        description: 'A documentary exploring Taiwan\'s forest ecosystems',
        location: 'Nantou County'
      }
    ],
    operationalDescriptions: {
      electricity: 'Office Electricity Bill',
      commuting: 'Employee Commuting Emissions',
      vehicle: 'Company Vehicle Fuel',
      paper: 'Printing Paper Purchase'
    },
    projectDescriptions: {
      transport: 'Filming Day Transportation',
      catering: 'Crew Catering'
    }
  }
};

// 生成測試專案數據
export const generateTestProjects = (language: Languages = 'zh'): Project[] => {
  const now = new Date();
  const content = testDataContent[language];
  
  return content.projects.map((project, index) => {
    const statuses = ['active', 'active', 'planning'] as const;
    const budgets = [2500000, 800000, 1200000]; // 250萬、80萬、120萬預算
    const startDays = [-30, -20, 30]; // 相對於今天的開始天數
    const endDays = [60, 40, 120]; // 相對於今天的結束天數
    
    return {
      id: generateId(),
      name: project.name,
      description: project.description,
      status: statuses[index],
      startDate: new Date(now.getTime() + startDays[index] * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() + endDays[index] * 24 * 60 * 60 * 1000).toISOString(),
      budget: budgets[index],
      location: project.location,
      createdAt: startDays[index] < 0 
        ? new Date(now.getTime() + startDays[index] * 24 * 60 * 60 * 1000).toISOString()
        : new Date().toISOString(),
      collaborators: [],
      totalEmissions: 0,
      emissionSummary: {
        projectId: '',
        directEmissions: 0,
        allocatedEmissions: 0,
        totalEmissions: 0,
        directRecordCount: 0,
        allocatedRecordCount: 0,
      }
    };
  });
};

// 生成測試日常營運排放記錄
export const generateTestOperationalRecords = (language: Languages = 'zh'): NonProjectEmissionRecord[] => {
  const now = new Date();
  const records: NonProjectEmissionRecord[] = [];
  const content = testDataContent[language];
  
  // 過去3個月的記錄
  for (let i = 0; i < 90; i += 7) { // 每週一筆記錄
    const recordDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // 辦公室電費 (Scope 2)
    records.push({
      id: generateId(),
      categoryId: 'scope2-electricity',
      sourceId: 'office-electricity',
      amount: Math.floor(Math.random() * 500) + 800, // 800-1300 kgCO2e
      quantity: Math.floor(Math.random() * 800) + 1200, // 1200-2000 度電
      date: recordDate.toISOString().split('T')[0],
      description: `${content.operationalDescriptions.electricity} - ${recordDate.getFullYear()}${language === 'zh' ? '年' : '/'}${recordDate.getMonth() + 1}${language === 'zh' ? '月' : ''}`,
      isAllocated: true,
      allocationRule: {
        method: 'budget',
        targetProjects: [], // 會在添加專案後自動更新
      },
      createdAt: recordDate.toISOString(),
      updatedAt: recordDate.toISOString()
    });
    
    // 員工通勤 (Scope 3)
    records.push({
      id: generateId(),
      categoryId: 'scope3-commuting',
      sourceId: 'employee-commuting-car',
      amount: Math.floor(Math.random() * 300) + 200, // 200-500 kgCO2e
      quantity: Math.floor(Math.random() * 150) + 100, // 100-250 人次
      date: recordDate.toISOString().split('T')[0],
      description: `${content.operationalDescriptions.commuting} - ${recordDate.getFullYear()}${language === 'zh' ? '年' : '/'}${recordDate.getMonth() + 1}${language === 'zh' ? '月' : ''}`,
      isAllocated: true,
      allocationRule: {
        method: 'equal',
        targetProjects: [], // 會在添加專案後自動更新
      },
      createdAt: recordDate.toISOString(),
      updatedAt: recordDate.toISOString()
    });
    
    // 公司車輛汽油 (Scope 1) - 隔週記錄
    if (i % 14 === 0) {
      records.push({
        id: generateId(),
        categoryId: 'scope1-vehicles',
        sourceId: 'company-car-gasoline',
        amount: Math.floor(Math.random() * 200) + 150, // 150-350 kgCO2e
        quantity: Math.floor(Math.random() * 80) + 60, // 60-140 公升
        date: recordDate.toISOString().split('T')[0],
        description: `${content.operationalDescriptions.vehicle} - ${recordDate.getFullYear()}${language === 'zh' ? '年' : '/'}${recordDate.getMonth() + 1}${language === 'zh' ? '月' : ''}`,
        isAllocated: true,
        allocationRule: {
          method: 'duration',
          targetProjects: [], // 會在添加專案後自動更新
        },
        createdAt: recordDate.toISOString(),
        updatedAt: recordDate.toISOString()
      });
    }
    
    // 影印用紙 (Scope 3) - 每月記錄
    if (i % 30 === 0) {
      records.push({
        id: generateId(),
        categoryId: 'scope3-paper',
        sourceId: 'office-paper-a4',
        amount: Math.floor(Math.random() * 50) + 30, // 30-80 kgCO2e
        quantity: Math.floor(Math.random() * 10) + 5, // 5-15 箱
        date: recordDate.toISOString().split('T')[0],
        description: `${content.operationalDescriptions.paper} - ${recordDate.getFullYear()}${language === 'zh' ? '年' : '/'}${recordDate.getMonth() + 1}${language === 'zh' ? '月' : ''}`,
        isAllocated: true,
        allocationRule: {
          method: 'equal',
          targetProjects: [], // 會在添加專案後自動更新
        },
        createdAt: recordDate.toISOString(),
        updatedAt: recordDate.toISOString()
      });
    }
  }
  
  return records;
};

// 生成測試專案排放記錄
export const generateTestProjectRecords = (projectIds: string[], language: Languages = 'zh'): ProjectEmissionRecord[] => {
  const records: ProjectEmissionRecord[] = [];
  const now = new Date();
  const content = testDataContent[language];
  
  projectIds.forEach((projectId, index) => {
    // 為每個專案生成一些拍攝記錄
    const recordCount = Math.floor(Math.random() * 5) + 3; // 3-7筆記錄
    
    for (let i = 0; i < recordCount; i++) {
      const recordDate = new Date(now.getTime() - (index * 10 + i * 3) * 24 * 60 * 60 * 1000);
      
      // 交通運輸記錄
      records.push({
        id: generateId(),
        projectId,
        categoryId: 'transport-prod',
        sourceId: 'car-rental',
        amount: Math.floor(Math.random() * 300) + 200, // 200-500 kgCO2e
        quantity: Math.floor(Math.random() * 500) + 300, // 300-800 公里
        date: recordDate.toISOString().split('T')[0],
        description: `${content.projectDescriptions.transport} - ${language === 'zh' ? '第' : 'Day '}${i + 1}${language === 'zh' ? '天' : ''}`,
        stage: 'production',
        createdAt: recordDate.toISOString(),
        updatedAt: recordDate.toISOString()
      });
      
      // 餐飲記錄
      records.push({
        id: generateId(),
        projectId,
        categoryId: 'catering-prod',
        sourceId: 'catering-local',
        amount: Math.floor(Math.random() * 150) + 100, // 100-250 kgCO2e
        quantity: Math.floor(Math.random() * 30) + 20, // 20-50 人次
        date: recordDate.toISOString().split('T')[0],
        description: `${content.projectDescriptions.catering} - ${language === 'zh' ? '第' : 'Day '}${i + 1}${language === 'zh' ? '天' : ''}`,
        stage: 'production',
        createdAt: recordDate.toISOString(),
        updatedAt: recordDate.toISOString()
      });
      
      // 能源消耗（不是每天都有）
      if (Math.random() > 0.3) {
        records.push({
          id: generateId(),
          projectId,
          categoryId: 'energy-prod',
          sourceId: 'generator-diesel',
          amount: Math.floor(Math.random() * 200) + 100, // 100-300 kgCO2e
          quantity: Math.floor(Math.random() * 80) + 40, // 40-120 公升
          date: recordDate.toISOString().split('T')[0],
          description: `${language === 'zh' ? '發電機燃油' : 'Generator Fuel'} - ${language === 'zh' ? '第' : 'Day '}${i + 1}${language === 'zh' ? '天' : ''}`,
          stage: 'production',
          createdAt: recordDate.toISOString(),
          updatedAt: recordDate.toISOString()
        });
      }
    }
  });
  
  return records;
};

// 修復分攤邏輯：更新營運記錄的目標專案
const updateAllocationTargets = (
  operationalRecords: NonProjectEmissionRecord[], 
  activeProjectIds: string[]
): NonProjectEmissionRecord[] => {
  return operationalRecords.map(record => {
    if (record.isAllocated && record.allocationRule) {
      return {
        ...record,
        allocationRule: {
          ...record.allocationRule,
          targetProjects: activeProjectIds // 設定為活躍專案的ID
        }
      };
    }
    return record;
  });
};

// 主要的測試數據生成函數
export const generateAllTestData = (language: Languages = 'zh') => {
  const projects = generateTestProjects(language);
  const activeProjectIds = projects.filter(p => p.status === 'active').map(p => p.id);
  
  // 生成營運記錄並正確設定分攤目標
  const rawOperationalRecords = generateTestOperationalRecords(language);
  const operationalRecords = updateAllocationTargets(rawOperationalRecords, activeProjectIds);
  
  const projectRecords = generateTestProjectRecords(projects.map(p => p.id), language);
  
  console.log('測試數據生成完成:');
  console.log(`- 專案數量: ${projects.length}`);
  console.log(`- 活躍專案數量: ${activeProjectIds.length}`);
  console.log(`- 營運記錄數量: ${operationalRecords.length}`);
  console.log(`- 需要分攤的營運記錄: ${operationalRecords.filter(r => r.isAllocated).length}`);
  console.log(`- 專案記錄數量: ${projectRecords.length}`);
  
  return {
    projects,
    operationalRecords,
    projectRecords
  };
}; 