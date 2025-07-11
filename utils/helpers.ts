import { ProjectEmissionRecord, Project, ProductionStage, ProjectStatus } from '@/types/project';
import { EmissionCategory } from '@/types/database';
import { TransportCalculationParams, TransportEquipment, SelectedEquipmentItem } from '@/types/equipment';
import Colors from '@/constants/colors';

// Format emissions to display with units
export const formatEmissions = (amount: number, t?: any): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)} ${t ? t('units.tonnes') : '噸'}CO₂e`;
  }
  return `${amount.toFixed(2)} ${t ? t('units.kg') : '公斤'}CO₂e`;
};

// Format currency to display with units
export const formatCurrency = (amount: number): string => {
  if (amount >= 10000) {
    return `NT$${(amount / 10000).toFixed(1)}萬`;
  }
  return `NT$${amount.toLocaleString()}`;
};

// Group emission records by category
export const groupByCategory = (records: ProjectEmissionRecord[], categories: EmissionCategory[]): any[] => {
  const categoryMap = new Map();
  
  // Initialize with all categories
  categories.forEach(category => {
    categoryMap.set(category.id, {
      id: category.id,
      name: category.name,
      color: category.color,
      value: 0,
      count: 0
    });
  });
  
  // Sum up emissions by category
  records.forEach(record => {
    if (categoryMap.has(record.categoryId)) {
      const category = categoryMap.get(record.categoryId);
      category.value += record.amount || 0;
      category.count += 1;
    }
  });
  
  // Convert to array and sort by value (descending)
  return Array.from(categoryMap.values())
    .filter(category => category.value > 0)
    .sort((a, b) => b.value - a.value);
};

// Group emission records by project
export const groupByProject = (records: ProjectEmissionRecord[], projects: Project[]): any[] => {
  const projectMap = new Map();
  
  // Initialize with all projects
  projects.forEach(project => {
    projectMap.set(project.id, {
      id: project.id,
      name: project.name,
      color: project.color || '#10B981', // Default color if not specified
      value: 0,
      recordCount: 0
    });
  });
  
  // Sum up emissions by project
  records.forEach(record => {
    if (projectMap.has(record.projectId)) {
      const project = projectMap.get(record.projectId);
      project.value += record.amount || 0;
      project.recordCount += 1;
    }
  });
  
  // Convert to array and sort by value (descending)
  return Array.from(projectMap.values())
    .filter(project => project.value > 0)
    .sort((a, b) => b.value - a.value);
};

// Group emission records by month
export const groupByMonth = (records: ProjectEmissionRecord[]): any[] => {
  const monthMap = new Map();
  
  // Sum up emissions by month
  records.forEach(record => {
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthLabel = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        key: monthKey,
        label: monthLabel,
        value: 0,
        count: 0
      });
    }
    
    const month = monthMap.get(monthKey);
    month.value += record.amount || 0;
    month.count += 1;
  });
  
  // Convert to array and sort by month (ascending)
  return Array.from(monthMap.values())
    .sort((a, b) => a.key.localeCompare(b.key));
};

// Group emission records by stage
export const groupByStage = (records: ProjectEmissionRecord[]): any[] => {
  const stageMap = new Map();
  const totalEmissions = records.reduce((sum, record) => sum + (record.amount || 0), 0);
  
  // Initialize with all stages
  const stages: ProductionStage[] = ['pre-production', 'production', 'post-production'];
  stages.forEach(stage => {
    stageMap.set(stage, {
      stage,
      emissions: 0,
      count: 0,
      percentage: 0
    });
  });
  
  // Sum up emissions by stage
  records.forEach(record => {
    const stage = stageMap.get(record.stage);
    stage.emissions += record.amount || 0;
    stage.count += 1;
  });
  
  // Calculate percentages
  stageMap.forEach(stage => {
    stage.percentage = totalEmissions > 0 ? (stage.emissions / totalEmissions) * 100 : 0;
  });
  
  // Convert to array
  return Array.from(stageMap.values());
};

// Get most recent record date
export const getMostRecentDate = (records: ProjectEmissionRecord[]): string => {
  if (records.length === 0) {
    return '';
  }
  
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const date = new Date(sortedRecords[0].date);
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

// Get stage label
export const getStageLabel = (stage: ProductionStage, t?: any): string => {
  switch(stage) {
    case 'pre-production':
      return t ? t('stage.pre-production') : '前期製作';
    case 'production':
      return t ? t('stage.production') : '拍攝製作';
    case 'post-production':
      return t ? t('stage.post-production') : '後期製作';
    default:
      return '';
  }
};

// Get stage color
export const getStageColor = (stage: ProductionStage): string => {
  switch(stage) {
    case 'pre-production':
      return '#6C63FF'; // Purple
    case 'production':
      return '#4ECDC4'; // Teal
    case 'post-production':
      return '#FF6B6B'; // Red
    default:
      return '#AAAAAA';
  }
};

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 計算設備總重量
export const calculateTotalEquipmentWeight = (selectedEquipment: SelectedEquipmentItem[]): number => {
  return selectedEquipment.reduce((total, item) => {
    // 檢查設備是否有weight屬性
    if ('weight' in item.equipment && item.equipment.weight) {
      return total + (item.equipment.weight * item.quantity);
    }
    return total;
  }, 0);
};

// 計算交通碳排放量
export const calculateTransportEmissions = (params: TransportCalculationParams): number => {
  const { distance, peopleCount, equipmentWeight, transport } = params;
  
  // 基本排放量 (距離 * 基本排放因子)
  const baseEmissions = distance * transport.emissionFactor;
  
  // 若乘客數量超過1，計算人員額外排放量
  // 超出的每位乘客才會乘以emissionFactorPerPerson
  const extraPeople = Math.max(0, peopleCount - 1);
  const peopleEmissions = distance * extraPeople * transport.emissionFactorPerPerson;
  
  // 設備排放量 (距離 * 設備重量 * 每公斤排放因子)
  const equipmentEmissions = distance * equipmentWeight * transport.emissionFactorPerKg;
  
  // 總排放量
  const totalEmissions = baseEmissions + peopleEmissions + equipmentEmissions;
  
  // 返回至少保留兩位小數的結果
  return parseFloat(totalEmissions.toFixed(2));
};

// 格式化設備列表為顯示文本
export const formatEquipmentList = (selectedEquipment: SelectedEquipmentItem[]): string => {
  if (!selectedEquipment || selectedEquipment.length === 0) {
    return '';
  }
  
  return selectedEquipment.map(item => 
    `${item.equipment.name} x ${item.quantity}`
  ).join(', ');
};

// 計算多個設備的總碳排放量
export const calculateMultipleEquipmentEmissions = (selectedEquipment: SelectedEquipmentItem[]): number => {
  return selectedEquipment.reduce((total, item) => {
    let itemEmission = 0;
    
    // 根據設備類型計算排放量
    if ('powerConsumption' in item.equipment && item.hours) {
      // 用電設備 - 使用時間
      itemEmission = item.hours * item.equipment.emissionFactor * item.quantity;
    } 
    else if ('fuelType' in item.equipment && item.distance) {
      // 交通設備 - 行駛距離
      itemEmission = item.distance * item.equipment.emissionFactor * item.quantity;
    }
    else if ('servingSize' in item.equipment) {
      // 餐飲 - 份數
      itemEmission = item.equipment.emissionFactor * item.quantity;
    }
    else if ('capacity' in item.equipment) {
      // 存儲設備 - 容量
      itemEmission = item.equipment.emissionFactor * item.quantity;
    }
    else if ('unit' in item.equipment) {
      // 印刷紙張 - 張數
      itemEmission = item.equipment.emissionFactor * item.quantity;
    }
    else {
      // 其他設備
      itemEmission = item.equipment.emissionFactor * item.quantity;
    }
    
    return total + itemEmission;
  }, 0);
};