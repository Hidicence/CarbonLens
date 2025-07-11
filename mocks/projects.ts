import { Project, ProjectEmissionRecord, NonProjectEmissionRecord, EmissionCategory, EmissionSource, ProductionStage } from '@/types/project';

// 日常營運類別 - 按照碳排放範疇組織
export const OPERATIONAL_CATEGORIES: EmissionCategory[] = [
  // Scope 1 - 直接排放
  {
    id: 'scope1-vehicles',
    name: 'Scope 1 - 公司自有車輛',
    icon: 'car',
    color: '#EF4444',
    isOperational: true,
    scope: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scope1-stationary-combustion',
    name: 'Scope 1 - 固定燃燒源',
    icon: 'flame',
    color: '#F97316',
    isOperational: true,
    scope: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scope1-refrigerant',
    name: 'Scope 1 - 冷氣冷媒逸散',
    icon: 'snowflake',
    color: '#3B82F6',
    isOperational: true,
    scope: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scope1-fire-extinguisher',
    name: 'Scope 1 - 滅火器逸散',
    icon: 'shield',
    color: '#DC2626',
    isOperational: true,
    scope: 1,
    createdAt: new Date().toISOString(),
  },
  
  // Scope 2 - 間接能源排放
  {
    id: 'scope2-electricity',
    name: 'Scope 2 - 辦公室電費',
    icon: 'zap',
    color: '#F59E0B',
    isOperational: true,
    scope: 2,
    createdAt: new Date().toISOString(),
  },
  
  // Scope 3 - 其他間接排放
  {
    id: 'scope3-commuting',
    name: 'Scope 3 - 員工通勤',
    icon: 'users',
    color: '#10B981',
    isOperational: true,
    scope: 3,
    createdAt: new Date().toISOString(),
    },
    {
    id: 'scope3-paper',
    name: 'Scope 3 - 影印用紙',
    icon: 'file-text',
    color: '#8B5CF6',
    isOperational: true,
    scope: 3,
    createdAt: new Date().toISOString(),
    },
    {
    id: 'scope3-waste',
    name: 'Scope 3 - 辦公垃圾',
    icon: 'trash-2',
    color: '#06B6D4',
    isOperational: true,
    scope: 3,
    createdAt: new Date().toISOString(),
    },
    {
    id: 'scope3-food-waste',
    name: 'Scope 3 - 餐飲廢棄物',
    icon: 'coffee',
    color: '#84CC16',
    isOperational: true,
    scope: 3,
    createdAt: new Date().toISOString(),
  },
];

// 專案類別
export const PROJECT_CATEGORIES: EmissionCategory[] = [
    {
    id: 'transport-pre',
    name: '交通運輸',
    icon: 'truck',
    color: '#F87171',
    stage: 'pre-production',
    createdAt: new Date().toISOString(),
    },
    {
    id: 'equipment-pre',
    name: '設備器材',
    icon: 'camera',
    color: '#60A5FA',
    stage: 'pre-production',
    createdAt: new Date().toISOString(),
    },
    {
    id: 'accommodation-pre',
      name: '住宿',
    icon: 'home',
    color: '#34D399',
    stage: 'pre-production',
    createdAt: new Date().toISOString(),
    },
    {
    id: 'transport-prod',
    name: '交通運輸',
    icon: 'truck',
    color: '#F87171',
    stage: 'production',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'energy-prod',
    name: '能源消耗',
    icon: 'zap',
    color: '#FBBF24',
    stage: 'production',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'catering-prod',
    name: '餐飲',
    icon: 'utensils',
    color: '#A78BFA',
    stage: 'production',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waste-prod',
    name: '廢棄物',
    icon: 'trash-2',
    color: '#FB7185',
    stage: 'production',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'editing-post',
    name: '後期製作',
    icon: 'edit',
    color: '#10B981',
    stage: 'post-production',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'distribution-post',
    name: '發行配送',
    icon: 'package',
    color: '#8B5CF6',
    stage: 'post-production',
    createdAt: new Date().toISOString(),
  },
];

// 按階段組織的專案類別
export const STAGE_CATEGORIES = {
  'pre-production': PROJECT_CATEGORIES.filter(cat => cat.stage === 'pre-production'),
  'production': PROJECT_CATEGORIES.filter(cat => cat.stage === 'production'),
  'post-production': PROJECT_CATEGORIES.filter(cat => cat.stage === 'post-production'),
};

// 合併所有類別
export const EMISSION_CATEGORIES: EmissionCategory[] = [
  ...OPERATIONAL_CATEGORIES,
  ...PROJECT_CATEGORIES,
];

// 日常營運排放源 - 按照碳排放範疇組織
export const OPERATIONAL_SOURCES: EmissionSource[] = [
  // Scope 1 - 直接排放：公司自有車輛
  {
    id: 'company-car-gasoline',
    name: '公司車輛 - 汽油',
    categoryId: 'scope1-vehicles',
    unit: '公升',
    emissionFactor: 2.31, // 公斤CO2e/公升汽油
    isOperational: true,
    description: '公司自有車輛汽油消耗',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'company-car-diesel',
    name: '公司車輛 - 柴油',
    categoryId: 'scope1-vehicles',
    unit: '公升',
    emissionFactor: 2.68, // 公斤CO2e/公升柴油
    isOperational: true,
    description: '公司自有車輛柴油消耗',
    createdAt: new Date().toISOString(),
  },
  
  // Scope 1 - 固定燃燒源：天然氣、瓦斯桶等
  {
    id: 'natural-gas-piped',
    name: '管線天然氣',
    categoryId: 'scope1-stationary-combustion',
    unit: '立方公尺',
    emissionFactor: 1.96, // 公斤CO2e/立方公尺天然氣
    isOperational: true,
    description: '辦公室管線天然氣燃燒',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lpg-tank',
    name: '液化石油氣（瓦斯桶）',
    categoryId: 'scope1-stationary-combustion',
    unit: '公斤',
    emissionFactor: 2.94, // 公斤CO2e/公斤LPG
    isOperational: true,
    description: '瓦斯桶燃燒排放',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'heating-oil',
    name: '燃料油',
    categoryId: 'scope1-stationary-combustion',
    unit: '公升',
    emissionFactor: 2.52, // 公斤CO2e/公升燃料油
    isOperational: true,
    description: '燃料油燃燒排放',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'biomass-wood',
    name: '木材燃燒',
    categoryId: 'scope1-stationary-combustion',
    unit: '公斤',
    emissionFactor: 0.39, // 公斤CO2e/公斤木材（生質燃料）
    isOperational: true,
    description: '木材燃燒（CO2排放需另計生質燃料）',
    createdAt: new Date().toISOString(),
  },
  
  // Scope 1 - 冷媒逸散
  {
    id: 'refrigerant-r410a',
    name: 'R-410A冷媒',
    categoryId: 'scope1-refrigerant',
    unit: '公斤',
    emissionFactor: 2088, // 公斤CO2e/公斤R-410A
    isOperational: true,
    description: 'R-410A冷媒洩漏排放',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'refrigerant-r134a',
    name: 'R-134a冷媒',
    categoryId: 'scope1-refrigerant',
    unit: '公斤',
    emissionFactor: 1430, // 公斤CO2e/公斤R-134a
    isOperational: true,
    description: 'R-134a冷媒洩漏排放',
    createdAt: new Date().toISOString(),
  },
  
  // Scope 1 - 滅火器逸散
  {
    id: 'fire-extinguisher-co2',
    name: 'CO2滅火器',
    categoryId: 'scope1-fire-extinguisher',
    unit: '公斤',
    emissionFactor: 1, // 公斤CO2e/公斤CO2
    isOperational: true,
    description: 'CO2滅火器洩漏排放',
    createdAt: new Date().toISOString(),
  },
  
  // Scope 2 - 間接能源：電力
  {
    id: 'office-electricity-full',
    name: '辦公室用電（全租）',
    categoryId: 'scope2-electricity',
    unit: '度',
    emissionFactor: 0.502, // 公斤CO2e/度電（台灣電網排放係數2022年）
    isOperational: true,
    description: '辦公室電力消耗（全租）',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'office-electricity-shared',
    name: '辦公室用電（分租）',
    categoryId: 'scope2-electricity',
    unit: '坪',
    emissionFactor: 20.08, // 公斤CO2e/坪·月（假設辦公室每坪每月用電40度）
    isOperational: true,
    description: '辦公室電力消耗（分租）',
    createdAt: new Date().toISOString(),
  },
  
  // Scope 3 - 其他間接排放：員工通勤
  {
    id: 'employee-commuting-car',
    name: '員工通勤 - 汽車',
    categoryId: 'scope3-commuting',
    unit: '人·公里',
    emissionFactor: 0.14, // 公斤CO2e/人·公里
    isOperational: true,
    description: '員工汽車通勤',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'employee-commuting-public',
    name: '員工通勤 - 大眾運輸',
    categoryId: 'scope3-commuting',
    unit: '人·公里',
    emissionFactor: 0.05, // 公斤CO2e/人·公里
    isOperational: true,
    description: '員工大眾運輸通勤',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'employee-commuting-motorcycle',
    name: '員工通勤 - 機車',
    categoryId: 'scope3-commuting',
    unit: '人·公里',
    emissionFactor: 0.09, // 公斤CO2e/人·公里
    isOperational: true,
    description: '員工機車通勤',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'office-paper-a4',
    name: 'A4影印紙',
    categoryId: 'scope3-paper',
    unit: '包',
    emissionFactor: 12.5, // 公斤CO2e/包（500張）
    isOperational: true,
    description: 'A4影印紙使用',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'office-paper-a3',
    name: 'A3影印紙',
    categoryId: 'scope3-paper',
    unit: '包',
    emissionFactor: 25, // 公斤CO2e/包（500張）
    isOperational: true,
    description: 'A3影印紙使用',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'office-waste-general',
    name: '一般垃圾',
    categoryId: 'scope3-waste',
    unit: '公斤',
    emissionFactor: 0.49, // 公斤CO2e/公斤垃圾
    isOperational: true,
    description: '辦公室一般垃圾處理',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'office-waste-recycle',
    name: '回收垃圾',
    categoryId: 'scope3-waste',
    unit: '公斤',
    emissionFactor: 0.15, // 公斤CO2e/公斤回收垃圾
    isOperational: true,
    description: '辦公室回收垃圾處理',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'office-food-waste',
    name: '廚餘垃圾',
    categoryId: 'scope3-food-waste',
    unit: '公斤',
    emissionFactor: 0.31, // 公斤CO2e/公斤廚餘
    isOperational: true,
    description: '辦公室廚餘處理',
    createdAt: new Date().toISOString(),
  },
];

// 專案排放源
export const PROJECT_SOURCES: EmissionSource[] = [
  // 前期製作 - 交通運輸
  {
    id: 'crew-transport-car',
    name: '工作人員汽車交通',
    categoryId: 'transport-pre',
    unit: '公里',
    emissionFactor: 0.21, // 公斤CO2e/公里
    description: '工作人員使用汽車往返交通',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'equipment-transport-truck',
    name: '設備運輸卡車',
    categoryId: 'transport-pre',
    unit: '公里',
    emissionFactor: 0.95, // 公斤CO2e/公里
    description: '大型設備運輸車輛',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'flight-domestic',
    name: '國內航班',
    categoryId: 'transport-pre',
    unit: '人·公里',
    emissionFactor: 0.25, // 公斤CO2e/人·公里
    description: '國內航班交通',
    createdAt: new Date().toISOString(),
  },
  
  // 前期製作 - 設備器材
  {
    id: 'camera-equipment',
    name: '攝影設備',
    categoryId: 'equipment-pre',
    unit: '天',
    emissionFactor: 15.2, // 公斤CO2e/天
    description: '攝影機、鏡頭等攝影設備能耗',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lighting-equipment',
    name: '燈光設備',
    categoryId: 'equipment-pre',
    unit: 'kWh',
    emissionFactor: 0.502, // 公斤CO2e/kWh
    description: 'LED燈、鎢絲燈等燈光設備',
    createdAt: new Date().toISOString(),
  },
  
  // 前期製作 - 住宿
  {
    id: 'hotel-stay',
    name: '飯店住宿',
    categoryId: 'accommodation-pre',
    unit: '人·夜',
    emissionFactor: 28.5, // 公斤CO2e/人·夜
    description: '工作人員飯店住宿',
    createdAt: new Date().toISOString(),
  },
  
  // 製作期 - 交通運輸
  {
    id: 'daily-commute-car',
    name: '拍攝現場通勤汽車',
    categoryId: 'transport-prod',
    unit: '人·公里',
    emissionFactor: 0.14, // 公斤CO2e/人·公里
    description: '拍攝期間每日通勤交通',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'location-shuttle',
    name: '拍攝現場接駁車',
    categoryId: 'transport-prod',
    unit: '公里',
    emissionFactor: 0.75, // 公斤CO2e/公里
    description: '拍攝現場接駁巴士',
    createdAt: new Date().toISOString(),
  },
  
  // 製作期 - 能源消耗
  {
    id: 'generator-diesel',
    name: '柴油發電機',
    categoryId: 'energy-prod',
    unit: '公升',
    emissionFactor: 2.68, // 公斤CO2e/公升柴油
    description: '外景拍攝柴油發電機',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'location-electricity',
    name: '拍攝現場用電',
    categoryId: 'energy-prod',
    unit: 'kWh',
    emissionFactor: 0.502, // 公斤CO2e/kWh
    description: '拍攝現場電力消耗',
    createdAt: new Date().toISOString(),
  },
  
  // 製作期 - 餐飲
  {
    id: 'catering-local',
    name: '當地餐飲',
    categoryId: 'catering-prod',
    unit: '人·餐',
    emissionFactor: 3.2, // 公斤CO2e/人·餐
    description: '拍攝期間餐飲服務',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'catering-imported',
    name: '外地餐飲',
    categoryId: 'catering-prod',
    unit: '人·餐',
    emissionFactor: 5.8, // 公斤CO2e/人·餐
    description: '外地運送餐飲服務',
    createdAt: new Date().toISOString(),
  },
  
  // 製作期 - 廢棄物
  {
    id: 'production-waste',
    name: '拍攝現場垃圾',
    categoryId: 'waste-prod',
    unit: '公斤',
    emissionFactor: 0.49, // 公斤CO2e/公斤垃圾
    description: '拍攝現場一般垃圾處理',
    createdAt: new Date().toISOString(),
  },
  
  // 後期製作 - 編輯
  {
    id: 'editing-workstation',
    name: '後期編輯工作站',
    categoryId: 'editing-post',
    unit: '小時',
    emissionFactor: 0.35, // 公斤CO2e/小時
    description: '高性能後期編輯電腦',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rendering-farm',
    name: '渲染農場',
    categoryId: 'editing-post',
    unit: '小時',
    emissionFactor: 12.5, // 公斤CO2e/小時
    description: '大型渲染運算農場',
    createdAt: new Date().toISOString(),
  },
  
  // 後期製作 - 發行配送
  {
    id: 'digital-distribution',
    name: '數位發行',
    categoryId: 'distribution-post',
    unit: 'GB',
    emissionFactor: 0.004, // 公斤CO2e/GB
    description: '線上平台數位發行',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dvd-production',
    name: 'DVD製作',
    categoryId: 'distribution-post',
    unit: '片',
    emissionFactor: 0.15, // 公斤CO2e/片
    description: 'DVD製作排放',
    createdAt: new Date().toISOString(),
  },
];

// 合併所有排放源
export const EMISSION_SOURCES: EmissionSource[] = [
  ...OPERATIONAL_SOURCES,
  ...PROJECT_SOURCES,
];

// 示例專案
export const PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: '環保紀錄片製作',
    description: '關於台灣海洋保育的紀錄片專案',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    location: '台北',
    status: 'active',
    budget: 500000,
    color: '#10B981',
    emissionSummary: {
      projectId: 'project-1',
      directEmissions: 0,
      allocatedEmissions: 0,
      totalEmissions: 0,
      directRecordCount: 0,
      allocatedRecordCount: 0,
    },
    totalEmissions: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    collaborators: [],
  },
  {
    id: 'project-2',
    name: '品牌形象廣告',
    description: '永續品牌的形象廣告拍攝',
    startDate: '2024-02-01',
    endDate: '2024-04-15',
    location: '台中',
    status: 'active',
    budget: 300000,
    color: '#3B82F6',
    emissionSummary: {
      projectId: 'project-2',
      directEmissions: 0,
      allocatedEmissions: 0,
      totalEmissions: 0,
      directRecordCount: 0,
      allocatedRecordCount: 0,
    },
    totalEmissions: 0,
    createdAt: '2024-01-15T00:00:00.000Z',
    collaborators: [],
  },
  {
    id: 'project-3',
    name: '音樂MV製作',
    description: '獨立音樂人的MV拍攝專案',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    location: '高雄',
    status: 'active',
    budget: 200000,
    color: '#F59E0B',
    emissionSummary: {
      projectId: 'project-3',
      directEmissions: 0,
      allocatedEmissions: 0,
      totalEmissions: 0,
      directRecordCount: 0,
      allocatedRecordCount: 0,
    },
    totalEmissions: 0,
    createdAt: '2024-02-01T00:00:00.000Z',
    collaborators: [],
  },
];

// 示例專案排放記錄
export const EMISSION_RECORDS: ProjectEmissionRecord[] = [
  {
    id: 'record-1',
    projectId: 'project-1',
    stage: 'pre-production',
    categoryId: 'transport-pre',
    sourceId: 'van-transport',
    description: '設備運送至拍攝地點',
    quantity: 150,
    unit: '公里',
    amount: 37.65,
    date: '2024-01-20',
    location: '台北-花蓮',
    createdAt: '2024-01-20T10:00:00.000Z',
  },
  {
    id: 'record-2',
    projectId: 'project-1',
    stage: 'production',
    categoryId: 'energy-prod',
    sourceId: 'generator-diesel',
    description: '外景拍攝發電機用油',
    quantity: 25,
    unit: '公升',
    amount: 67.0,
    date: '2024-02-15',
    location: '花蓮海邊',
    createdAt: '2024-02-15T14:30:00.000Z',
  },
  {
    id: 'record-3',
    projectId: 'project-2',
    stage: 'production',
    categoryId: 'catering-prod',
    sourceId: 'film-crew-catering',
    description: '劇組午餐',
    quantity: 12,
    unit: '人餐',
    amount: 38.4,
    date: '2024-02-10',
    location: '台中攝影棚',
    createdAt: '2024-02-10T12:00:00.000Z',
  },
];

// 示例非專案排放記錄
export const SAMPLE_NON_PROJECT_EMISSION_RECORDS: NonProjectEmissionRecord[] = [
  {
    id: 'non-project-1',
    categoryId: 'scope2-electricity',
    sourceId: 'office-electricity-full',
    description: '1月份辦公室電費',
    quantity: 800,
    unit: '度',
    amount: 401.6,
    date: '2024-01-31',
    location: '台北辦公室',
    notes: '包含所有辦公設備用電，全租辦公室',
    createdAt: '2024-01-31T17:00:00.000Z',
    isAllocated: true,
    allocationRule: {
      method: 'budget',
      targetProjects: ['project-1', 'project-2', 'project-3'],
    },
  },
  {
    id: 'non-project-2',
    categoryId: 'scope1-vehicles',
    sourceId: 'company-car-gasoline',
    description: '公司車輛汽油消耗（1月）',
    quantity: 120,
    unit: '公升',
    amount: 277.2,
    date: '2024-01-31',
    location: '台北',
    notes: '包含業務拜訪和外勤用車',
    createdAt: '2024-01-31T18:00:00.000Z',
    isAllocated: true,
    allocationRule: {
      method: 'budget',
      targetProjects: ['project-1', 'project-2', 'project-3'],
    },
  },
  {
    id: 'non-project-3',
    categoryId: 'scope3-paper',
    sourceId: 'office-paper-a4',
    description: '影印紙消耗',
    quantity: 2000,
    unit: '張',
    amount: 9.6,
    date: '2024-02-15',
    location: '台北辦公室',
    notes: '各部門影印用紙',
    createdAt: '2024-02-15T16:00:00.000Z',
    isAllocated: false,
  },
  {
    id: 'non-project-4',
    categoryId: 'scope3-food-waste',
    sourceId: 'food-waste-kitchen',
    description: '辦公室廚餘處理',
    quantity: 15,
    unit: '公斤',
    amount: 2.7,
    date: '2024-02-20',
    location: '台北辦公室',
    notes: '員工午餐廚餘',
    createdAt: '2024-02-20T15:30:00.000Z',
    isAllocated: true,
    allocationRule: {
      method: 'equal',
      targetProjects: ['project-1', 'project-2'],
    },
  },
  {
    id: 'non-project-5',
    categoryId: 'scope3-commuting',
    sourceId: 'employee-commuting-car',
    description: '員工通勤碳排放（2月）',
    quantity: 2400,
    unit: '公里',
    amount: 460.8,
    date: '2024-02-29',
    location: '各員工住所至辦公室',
    notes: '統計所有員工汽車通勤里程',
    createdAt: '2024-02-29T18:00:00.000Z',
    isAllocated: true,
    allocationRule: {
      method: 'budget',
      targetProjects: ['project-1', 'project-2', 'project-3'],
    },
  },
];

// 工具函數
export const getProjectCategories = () => PROJECT_CATEGORIES;
export const getOperationalCategories = () => OPERATIONAL_CATEGORIES;
export const getAllCategories = () => EMISSION_CATEGORIES;

export const getProjectSources = () => PROJECT_SOURCES;
export const getOperationalSources = () => OPERATIONAL_SOURCES;
export const getAllSources = () => EMISSION_SOURCES;

export const getCategoryById = (id: string) => 
  EMISSION_CATEGORIES.find(category => category.id === id);

export const getSourceById = (id: string) => 
  EMISSION_SOURCES.find(source => source.id === id);

export const getSourcesByCategory = (categoryId: string) => 
  EMISSION_SOURCES.filter(source => source.categoryId === categoryId);

export const getCategoriesByStage = (stage: ProductionStage) => 
  PROJECT_CATEGORIES.filter(category => category.stage === stage);

export const getOperationalCategories2 = () => 
  EMISSION_CATEGORIES.filter(category => category.isOperational); 
  EMISSION_CATEGORIES.filter(category => category.isOperational); 