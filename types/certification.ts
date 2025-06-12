// 國際碳標籤和認證標準類型定義

export type CertificationStandard = 
  | 'albert'          // Albert (英國影視)
  | 'adgreen'         // AdGreen (英國廣告)
  | 'iso14064'        // ISO 14064 組織標準
  | 'ghg-protocol'    // GHG Protocol
  | 'carbon-trust'    // Carbon Trust
  | 'pas2060'         // PAS 2060 碳中和
  | 'sbti'            // Science Based Targets
  | 'custom';         // 自定義標準

export type CalculationMode = 
  | 'full-lifecycle'    // 完整生命週期（包含營運分攤）
  | 'project-only'      // 僅專案直接排放
  | 'hybrid';           // 混合模式

export interface CertificationConfig {
  standard: CertificationStandard;
  mode: CalculationMode;
  includeOperational: boolean;
  scope1Required: boolean;
  scope2Required: boolean;
  scope3Required: boolean;
  evidenceRequired: boolean;
  thirdPartyVerification: boolean;
}

// 預設的認證配置
export const CERTIFICATION_CONFIGS: Record<CertificationStandard, CertificationConfig> = {
  'albert': {
    standard: 'albert',
    mode: 'project-only',
    includeOperational: false,
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    evidenceRequired: false,
    thirdPartyVerification: false
  },
  'adgreen': {
    standard: 'adgreen',
    mode: 'project-only',
    includeOperational: false,
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    evidenceRequired: false,
    thirdPartyVerification: false
  },
  'iso14064': {
    standard: 'iso14064',
    mode: 'full-lifecycle',
    includeOperational: true,
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    evidenceRequired: true,
    thirdPartyVerification: true
  },
  'ghg-protocol': {
    standard: 'ghg-protocol',
    mode: 'full-lifecycle',
    includeOperational: true,
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    evidenceRequired: true,
    thirdPartyVerification: false
  },
  'carbon-trust': {
    standard: 'carbon-trust',
    mode: 'hybrid',
    includeOperational: true,
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    evidenceRequired: true,
    thirdPartyVerification: true
  },
  'pas2060': {
    standard: 'pas2060',
    mode: 'full-lifecycle',
    includeOperational: true,
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    evidenceRequired: true,
    thirdPartyVerification: true
  },
  'sbti': {
    standard: 'sbti',
    mode: 'full-lifecycle',
    includeOperational: true,
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    evidenceRequired: true,
    thirdPartyVerification: true
  },
  'custom': {
    standard: 'custom',
    mode: 'hybrid',
    includeOperational: true,
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    evidenceRequired: false,
    thirdPartyVerification: false
  }
};

// 碳標籤等級
export type CarbonLabelLevel = 
  | 'measured'      // 已測量
  | 'reduced'       // 已減排  
  | 'offset'        // 已抵消
  | 'neutral';      // 碳中和

export interface CarbonLabel {
  id: string;
  projectId: string;
  standard: CertificationStandard;
  level: CarbonLabelLevel;
  totalEmissions: number;
  reducedEmissions?: number;
  offsetEmissions?: number;
  certificationDate: string;
  validUntil: string;
  verifier?: string;
  certificateNumber?: string;
  qrCode?: string;
  badgeUrl?: string;
}

// 國際報告格式
export interface InternationalReport {
  id: string;
  projectId: string;
  standard: CertificationStandard;
  format: 'albert' | 'adgreen' | 'iso14064' | 'ghg-protocol';
  data: any; // 根據不同標準有不同的數據結構
  generatedAt: string;
  language: 'en' | 'zh-tw' | 'zh-cn' | 'ja' | 'ko';
}

// Albert 格式報告
export interface AlbertReport {
  projectName: string;
  productionCompany: string;
  startDate: string;
  endDate: string;
  location: string;
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
  totalEmissions: number;
  emissionSources: {
    transport: number;
    energy: number;
    travel: number;
    accommodation: number;
    catering: number;
    materials: number;
    waste: number;
  };
  reductionMeasures: string[];
  offsetDetails?: {
    provider: string;
    projects: string[];
    amount: number;
    verificationStandard: string;
  };
}

// AdGreen 格式報告
export interface AdGreenReport {
  campaignName: string;
  agency: string;
  client: string;
  productionCompany: string;
  shootDates: string[];
  locations: string[];
  crewSize: number;
  travelEmissions: number;
  accommodationEmissions: number;
  cateringEmissions: number;
  energyEmissions: number;
  materialEmissions: number;
  wasteEmissions: number;
  totalEmissions: number;
  emissionsPerCrewDay: number;
  greenActions: string[];
}

// 競爭力評估
export interface CompetitivenessScore {
  projectId: string;
  carbonIntensity: number;      // kg CO2e per budget unit
  industryAverage: number;      // 行業平均值
  percentile: number;           // 在行業中的百分位
  competitivenessLevel: 'excellent' | 'good' | 'average' | 'needs-improvement';
  recommendations: string[];
  certificationSuggestions: CertificationStandard[];
} 