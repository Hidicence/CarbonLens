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
  },
  {
    id: 'scope1-stationary-combustion',
    name: 'Scope 1 - 固定燃燒源',
    icon: 'flame',
    color: '#F97316',
    isOperational: true,
    scope: 1,
  },
  {
    id: 'scope1-refrigerant',
    name: 'Scope 1 - 冷氣冷媒逸散',
    icon: 'snowflake',
    color: '#3B82F6',
    isOperational: true,
    scope: 1,
  },
  {
    id: 'scope1-fire-extinguisher',
    name: 'Scope 1 - 滅火器逸散',
    icon: 'shield',
    color: '#DC2626',
    isOperational: true,
    scope: 1,
  },
  
  // Scope 2 - 間接能源排放
  {
    id: 'scope2-electricity',
    name: 'Scope 2 - 辦公室電費',
    icon: 'zap',
    color: '#F59E0B',
    isOperational: true,
    scope: 2,
  },
  
  // Scope 3 - 其他間接排放
  {
    id: 'scope3-commuting',
    name: 'Scope 3 - 員工通勤',
    icon: 'users',
    color: '#10B981',
    isOperational: true,
    scope: 3,
    },
    {
    id: 'scope3-paper',
    name: 'Scope 3 - 影印用紙',
    icon: 'file-text',
    color: '#8B5CF6',
    isOperational: true,
    scope: 3,
    },
    {
    id: 'scope3-waste',
    name: 'Scope 3 - 辦公垃圾',
    icon: 'trash-2',
    color: '#06B6D4',
    isOperational: true,
    scope: 3,
    },
    {
    id: 'scope3-food-waste',
    name: 'Scope 3 - 餐飲廢棄物',
    icon: 'coffee',
    color: '#84CC16',
    isOperational: true,
    scope: 3,
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
    },
    {
    id: 'equipment-pre',
    name: '設備器材',
    icon: 'camera',
    color: '#60A5FA',
    stage: 'pre-production',
    },
    {
    id: 'accommodation-pre',
      name: '住宿',
    icon: 'home',
    color: '#34D399',
    stage: 'pre-production',
    },
    {
    id: 'transport-prod',
    name: '交通運輸',
    icon: 'truck',
    color: '#F87171',
    stage: 'production',
  },
  {
    id: 'energy-prod',
    name: '能源消耗',
    icon: 'zap',
    color: '#FBBF24',
    stage: 'production',
  },
  {
    id: 'catering-prod',
    name: '餐飲',
    icon: 'utensils',
    color: '#A78BFA',
    stage: 'production',
  },
  {
    id: 'waste-prod',
    name: '廢棄物',
    icon: 'trash-2',
    color: '#FB7185',
    stage: 'production',
  },
  {
    id: 'editing-post',
    name: '後期製作',
    icon: 'edit',
    color: '#10B981',
    stage: 'post-production',
  },
  {
    id: 'distribution-post',
    name: '發行配送',
    icon: 'package',
    color: '#8B5CF6',
    stage: 'post-production',
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
  },
  {
    id: 'company-car-diesel',
    name: '公司車輛 - 柴油',
    categoryId: 'scope1-vehicles',
    unit: '公升',
    emissionFactor: 2.68, // 公斤CO2e/公升柴油
    isOperational: true,
    description: '公司自有車輛柴油消耗',
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
  },
  {
    id: 'lpg-tank',
    name: '液化石油氣（瓦斯桶）',
    categoryId: 'scope1-stationary-combustion',
    unit: '公斤',
    emissionFactor: 3.0, // 公斤CO2e/公斤LPG
    isOperational: true,
    description: '瓦斯桶燃燒排放',
  },
  {
    id: 'heating-oil',
    name: '燃料油（暖氣用）',
    categoryId: 'scope1-stationary-combustion',
    unit: '公升',
    emissionFactor: 2.52, // 公斤CO2e/公升燃料油
    isOperational: true,
    description: '燃料油燃燒排放',
  },
  {
    id: 'biomass-wood',
    name: '木材燃燒',
    categoryId: 'scope1-stationary-combustion',
    unit: '公斤',
    emissionFactor: 0, // 生質燃料CO2排放不計入Scope 1
    isOperational: true,
    description: '木材燃燒（CO2排放需另計生質燃料）',
  },
  
  // Scope 1 - 冷氣冷媒逸散
  {
    id: 'refrigerant-r410a',
    name: '冷媒逸散 - R-410A',
    categoryId: 'scope1-refrigerant',
    unit: '公斤',
    emissionFactor: 2088, // 公斤CO2e/公斤冷媒 (R-410A的GWP值)
    isOperational: true,
    description: 'R-410A冷媒洩漏排放',
  },
  {
    id: 'refrigerant-r134a',
    name: '冷媒逸散 - R-134a',
    categoryId: 'scope1-refrigerant',
    unit: '公斤',
    emissionFactor: 1430, // 公斤CO2e/公斤冷媒 (R-134a的GWP值)
    isOperational: true,
    description: 'R-134a冷媒洩漏排放',
  },
  
  // Scope 1 - 滅火器逸散
  {
    id: 'fire-extinguisher-co2',
    name: '滅火器逸散 - CO2滅火器',
    categoryId: 'scope1-fire-extinguisher',
    unit: '公斤',
    emissionFactor: 1, // 公斤CO2e/公斤CO2
    isOperational: true,
    description: 'CO2滅火器洩漏排放',
  },
  
  // Scope 2 - 間接能源排放：辦公室電費
  {
    id: 'office-electricity-full',
    name: '辦公室用電 - 全租',
    categoryId: 'scope2-electricity',
    unit: '度',
    emissionFactor: 0.502, // 公斤CO2e/度 (台灣電力排放係數)
    isOperational: true,
    description: '辦公室電力消耗（全租）',
  },
  {
    id: 'office-electricity-shared',
    name: '辦公室用電 - 分租',
    categoryId: 'scope2-electricity',
    unit: '度',
    emissionFactor: 0.502, // 公斤CO2e/度 (需要乘以佔比)
    isOperational: true,
    description: '辦公室電力消耗（分租）',
  },
  
  // Scope 3 - 其他間接排放
  {
    id: 'employee-commuting-car',
    name: '員工通勤 - 汽車',
    categoryId: 'scope3-commuting',
    unit: '公里',
    emissionFactor: 0.192, // 公斤CO2e/公里
    isOperational: true,
    description: '員工汽車通勤',
  },
  {
    id: 'employee-commuting-public',
    name: '員工通勤 - 大眾運輸',
    categoryId: 'scope3-commuting',
    unit: '公里',
    emissionFactor: 0.089, // 公斤CO2e/公里
    isOperational: true,
    description: '員工大眾運輸通勤',
  },
  {
    id: 'employee-commuting-motorcycle',
    name: '員工通勤 - 機車',
    categoryId: 'scope3-commuting',
    unit: '公里',
    emissionFactor: 0.067, // 公斤CO2e/公里
    isOperational: true,
    description: '員工機車通勤',
  },
  {
    id: 'office-paper-a4',
    name: 'A4影印紙',
    categoryId: 'scope3-paper',
    unit: '張',
    emissionFactor: 0.0048, // 公斤CO2e/張
    isOperational: true,
    description: 'A4影印紙使用',
  },
  {
    id: 'office-paper-a3',
    name: 'A3影印紙',
    categoryId: 'scope3-paper',
    unit: '張',
    emissionFactor: 0.0096, // 公斤CO2e/張 (約A4的2倍)
    isOperational: true,
    description: 'A3影印紙使用',
  },
  {
    id: 'office-waste-general',
    name: '一般垃圾',
    categoryId: 'scope3-waste',
    unit: '公斤',
    emissionFactor: 0.45, // 公斤CO2e/公斤
    isOperational: true,
    description: '辦公室一般垃圾處理',
  },
  {
    id: 'office-waste-recycle',
    name: '回收垃圾',
    categoryId: 'scope3-waste',
    unit: '公斤',
    emissionFactor: 0.12, // 公斤CO2e/公斤
    isOperational: true,
    description: '辦公室回收垃圾處理',
  },
  {
    id: 'food-waste-kitchen',
    name: '廚餘',
    categoryId: 'scope3-food-waste',
    unit: '公斤',
    emissionFactor: 0.18, // 公斤CO2e/公斤
    isOperational: true,
    description: '辦公室廚餘處理',
  },
];

// 專案排放源
export const PROJECT_SOURCES: EmissionSource[] = [
  // 前期製作
  {
    id: 'van-transport',
    name: '廂型車運輸',
    stage: 'pre-production',
    categoryId: 'transport-pre',
    unit: '公里',
    emissionFactor: 0.251,
    description: '廂型車運輸排放',
  },
  {
    id: 'camera-equipment',
    name: '攝影設備',
    stage: 'pre-production',
    categoryId: 'equipment-pre',
    unit: '台',
    emissionFactor: 2.5,
    description: '攝影設備使用排放',
  },
  {
    id: 'hotel-accommodation',
    name: '飯店住宿',
    stage: 'pre-production',
    categoryId: 'accommodation-pre',
    unit: '房夜',
    emissionFactor: 14.2,
    description: '飯店住宿排放',
  },
  // 製作期
  {
    id: 'truck-transport',
    name: '卡車運輸',
    stage: 'production',
    categoryId: 'transport-prod',
    unit: '公里',
    emissionFactor: 0.82,
    description: '卡車運輸排放',
  },
  {
    id: 'generator-diesel',
    name: '發電機柴油',
    stage: 'production',
    categoryId: 'energy-prod',
    unit: '公升',
    emissionFactor: 2.68,
    description: '發電機柴油排放',
  },
  {
    id: 'film-crew-catering',
    name: '劇組餐飲',
    stage: 'production',
    categoryId: 'catering-prod',
    unit: '人餐',
    emissionFactor: 3.2,
    description: '劇組餐飲排放',
  },
  {
    id: 'production-waste',
    name: '製作廢料',
    stage: 'production',
    categoryId: 'waste-prod',
    unit: '公斤',
    emissionFactor: 0.45,
    description: '製作廢料處理排放',
  },
  // 後期製作
  {
    id: 'editing-station',
    name: '剪輯工作站',
    stage: 'post-production',
    categoryId: 'editing-post',
    unit: '小時',
    emissionFactor: 0.8,
    description: '剪輯工作站用電排放',
  },
  {
    id: 'dvd-production',
    name: 'DVD製作',
    stage: 'post-production',
    categoryId: 'distribution-post',
    unit: '片',
    emissionFactor: 0.15,
    description: 'DVD製作排放',
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