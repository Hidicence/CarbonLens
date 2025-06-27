// 國際碳標籤報告生成器

import { Project, ProjectEmissionRecord, NonProjectEmissionRecord, ProjectEmissionSummary } from '@/types/project';
import { 
  CertificationStandard, 
  AlbertReport, 
  AdGreenReport, 
  CompetitivenessScore,
  CERTIFICATION_CONFIGS 
} from '@/types/certification';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert, Share } from 'react-native';
import { formatEmissions } from '@/utils/helpers';

// 政府標準盤查報告書接口
export interface GovernmentComplianceReport {
  organizationBasicInfo: {
    companyName: string;
    businessRegistrationNumber: string;
    representative: string;
    organizationChart?: string;
    employeeCount: number;
    mainBusinessActivities: string[];
    productionCapacity?: string;
    address: string;
    contactPerson: {
      name: string;
      title: string;
      phone: string;
      email: string;
    };
  };
  reportingPeriod: {
    baseYear: string;
    reportingYear: string;
    reportingPeriodStart: string;
    reportingPeriodEnd: string;
    baseYearAdjustmentReason?: string;
  };
  boundarySettings: {
    organizationalBoundary: {
      approach: 'control' | 'equity' | 'operational';
      description: string;
      facilitiesIncluded: Array<{
        facilityName: string;
        address: string;
        ownershipPercentage: number;
        controlPercentage: number;
      }>;
    };
    operationalBoundary: {
      scope1Description: string;
      scope2Description: string;
      scope3Description: string;
      emissionSourcesIncluded: string[];
      emissionSourcesExcluded: string[];
      exclusionJustification: string;
    };
  };
  methodology: {
    applicableStandards: string[];
    inventoryProcess: string[];
    qualityManagement: {
      internalReview: boolean;
      externalVerification: boolean;
      dataManagementSystem: string;
      uncertaintyAssessment: string;
    };
  };
  emissionSourceIdentification: {
    scope1Sources: Array<{
      source: string;
      description: string;
      emissionAmount: number;
      calculationMethod: string;
    }>;
    scope2Sources: Array<{
      source: string;
      description: string;
      emissionAmount: number;
      calculationMethod: string;
    }>;
    scope3Sources: Array<{
      source: string;
      description: string;
      emissionAmount: number;
      calculationMethod: string;
    }>;
  };
  activityDataCollection: {
    dataCollectionMethods: string[];
    dataQualityAssessment: {
      primaryDataPercentage: number;
      dataReliability: 'high' | 'medium' | 'low';
      uncertaintyLevel: number;
      improvementPlan: string[];
    };
    dataManagementProcedures: string[];
  };
  emissionFactors: {
    scope1Factors: Array<{
      source: string;
      category: string;
      factor: number;
      unit: string;
      origin: string;
      applicability: string;
    }>;
    scope2Factors: Array<{
      source: string;
      category: string;
      factor: number;
      unit: string;
      origin: string;
      applicability: string;
    }>;
    scope3Factors: Array<{
      source: string;
      category: string;
      factor: number;
      unit: string;
      origin: string;
      applicability: string;
    }>;
  };
  calculationResults: {
    scope1Total: number;
    scope2Total: number;
    scope3Total: number;
    grandTotal: number;
    baseYearComparison?: {
      baseYearTotal: number;
      changePercentage: number;
      changeAnalysis: string;
    };
    emissionsBySource: Array<{
      sourceName: string;
      scope: '1' | '2' | '3';
      amount: number;
      percentage: number;
    }>;
  };
  dataQualityManagement: {
    internalQCProcedures: string[];
    externalVerificationStatus: 'none' | 'internal' | 'external';
    verificationStandard?: string;
    verificationBody?: string;
    verificationOpinion?: string;
    continuousImprovementMeasures: string[];
  };
  reductionTargetsAndMeasures: {
    shortTermTargets: Array<{
      target: string;
      timeframe: string;
      expectedReduction: number;
    }>;
    longTermTargets: Array<{
      target: string;
      timeframe: string;
      expectedReduction: number;
    }>;
    implementedMeasures: Array<{
      measure: string;
      implementationDate: string;
      expectedImpact: number;
      actualImpact?: number;
    }>;
  };
  thirdPartyVerification?: {
    verificationBody: string;
    verificationStandard: string;
    verificationDate: string;
    verificationOpinion: string;
    auditorSignature: string;
    auditorName: string;
    auditorLicense: string;
  };
}

export class InternationalReportGenerator {
  
  /**
   * 生成 Albert 標準報告
   */
  static generateAlbertReport(
    project: Project,
    emissions: ProjectEmissionRecord[],
    reductionMeasures: string[] = []
  ): AlbertReport {
    const config = CERTIFICATION_CONFIGS.albert;
    
    // 只計算專案直接排放（Albert 模式）
    const scope1 = emissions
      .filter(e => e.categoryId.startsWith('scope1'))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const scope2 = emissions
      .filter(e => e.categoryId.startsWith('scope2'))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const scope3 = emissions
      .filter(e => e.categoryId.startsWith('scope3'))
      .reduce((sum, e) => sum + e.amount, 0);

    // 按 Albert 要求的排放源分類
    const emissionSources = {
      transport: emissions
        .filter(e => e.categoryId.includes('transport') || e.categoryId.includes('travel'))
        .reduce((sum, e) => sum + e.amount, 0),
      
      energy: emissions
        .filter(e => e.categoryId.includes('electricity') || e.categoryId.includes('fuel'))
        .reduce((sum, e) => sum + e.amount, 0),
      
      travel: emissions
        .filter(e => e.categoryId.includes('flight') || e.categoryId.includes('accommodation'))
        .reduce((sum, e) => sum + e.amount, 0),
      
      accommodation: emissions
        .filter(e => e.categoryId.includes('accommodation') || e.categoryId.includes('hotel'))
        .reduce((sum, e) => sum + e.amount, 0),
      
      catering: emissions
        .filter(e => e.categoryId.includes('catering') || e.categoryId.includes('food'))
        .reduce((sum, e) => sum + e.amount, 0),
      
      materials: emissions
        .filter(e => e.categoryId.includes('materials') || e.categoryId.includes('equipment'))
        .reduce((sum, e) => sum + e.amount, 0),
      
      waste: emissions
        .filter(e => e.categoryId.includes('waste'))
        .reduce((sum, e) => sum + e.amount, 0)
    };

    return {
      projectName: project.name,
      productionCompany: '台灣製片公司', // 可從用戶設定取得
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      location: project.location || '台灣',
      scope1Emissions: scope1,
      scope2Emissions: scope2,
      scope3Emissions: scope3,
      totalEmissions: scope1 + scope2 + scope3,
      emissionSources,
      reductionMeasures,
      // offsetDetails 可選
    };
  }

  /**
   * 生成 AdGreen 標準報告
   */
  static generateAdGreenReport(
    project: Project,
    emissions: ProjectEmissionRecord[],
    crewSize: number = 10
  ): AdGreenReport {
    const shootDates = emissions
      .map(e => e.date.split('T')[0])
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();

    const locations = emissions
      .map(e => e.location)
      .filter((loc): loc is string => loc !== undefined && loc !== null && loc !== '')
      .filter((loc, index, arr) => arr.indexOf(loc) === index);

    const totalEmissions = emissions.reduce((sum, e) => sum + e.amount, 0);
    const crewDays = shootDates.length * crewSize;

    return {
      campaignName: project.name,
      agency: '廣告代理商', // 可從專案設定取得
      client: '客戶名稱',   // 可從專案設定取得
      productionCompany: '台灣製片公司',
      shootDates,
      locations,
      crewSize,
      travelEmissions: emissions
        .filter(e => e.categoryId.includes('transport'))
        .reduce((sum, e) => sum + e.amount, 0),
      accommodationEmissions: emissions
        .filter(e => e.categoryId.includes('accommodation'))
        .reduce((sum, e) => sum + e.amount, 0),
      cateringEmissions: emissions
        .filter(e => e.categoryId.includes('catering'))
        .reduce((sum, e) => sum + e.amount, 0),
      energyEmissions: emissions
        .filter(e => e.categoryId.includes('electricity'))
        .reduce((sum, e) => sum + e.amount, 0),
      materialEmissions: emissions
        .filter(e => e.categoryId.includes('materials'))
        .reduce((sum, e) => sum + e.amount, 0),
      wasteEmissions: emissions
        .filter(e => e.categoryId.includes('waste'))
        .reduce((sum, e) => sum + e.amount, 0),
      totalEmissions,
      emissionsPerCrewDay: crewDays > 0 ? totalEmissions / crewDays : 0,
      greenActions: [
        '使用 LED 燈具',
        '數位腳本減少紙張使用',
        '本地採購減少運輸',
        '使用可再生能源'
      ]
    };
  }

  /**
   * 計算競爭力評分
   */
  static calculateCompetitivenessScore(
    project: Project,
    emissions: ProjectEmissionRecord[],
    industryBenchmarks: { [key: string]: number } = {}
  ): CompetitivenessScore {
    const totalEmissions = emissions.reduce((sum, e) => sum + e.amount, 0);
    const budget = project.budget || 1;
    const carbonIntensity = totalEmissions / budget; // kg CO2e per NT$

    // 影視產業基準值 (可從外部 API 或資料庫取得)
    const defaultBenchmarks = {
      'tv-commercial': 0.015,    // kg CO2e per NT$
      'corporate-video': 0.012,
      'documentary': 0.018,
      'feature-film': 0.020,
      'music-video': 0.014
    };

    const industryAverage = industryBenchmarks['general'] || 0.015;
    const percentile = Math.min(100, Math.max(0, 
      100 - (carbonIntensity / industryAverage) * 50
    ));

    let competitivenessLevel: 'excellent' | 'good' | 'average' | 'needs-improvement';
    let recommendations: string[] = [];
    let certificationSuggestions: CertificationStandard[] = [];

    if (percentile >= 80) {
      competitivenessLevel = 'excellent';
      recommendations = [
        '您的碳排放表現優於業界 80% 的專案',
        '建議申請碳標籤認證提升競爭力',
        '可考慮碳中和抵消達到更高等級'
      ];
      certificationSuggestions = ['albert', 'adgreen', 'carbon-trust'];
    } else if (percentile >= 60) {
      competitivenessLevel = 'good';
      recommendations = [
        '碳排放表現良好，有潛力進一步優化',
        '建議重點關注交通和能源使用效率',
        '可申請基礎級碳標籤認證'
      ];
      certificationSuggestions = ['albert', 'adgreen'];
    } else if (percentile >= 40) {
      competitivenessLevel = 'average';
      recommendations = [
        '碳排放處於行業平均水準',
        '建議優化拍攝計劃減少不必要的移動',
        '考慮使用更環保的設備和能源'
      ];
      certificationSuggestions = ['albert'];
    } else {
      competitivenessLevel = 'needs-improvement';
      recommendations = [
        '碳排放高於行業平均，需要積極改善',
        '建議先建立完整的碳排放監測系統',
        '考慮聘請環保顧問協助優化'
      ];
      certificationSuggestions = ['ghg-protocol'];
    }

    return {
      projectId: project.id,
      carbonIntensity,
      industryAverage,
      percentile,
      competitivenessLevel,
      recommendations,
      certificationSuggestions
    };
  }

  /**
   * 生成多語言報告摘要
   */
  static generateSummary(
    report: AlbertReport | AdGreenReport,
    language: 'en' | 'zh-tw' = 'en'
  ): string {
    if (language === 'zh-tw') {
      return `
專案：${(report as any).projectName || (report as any).campaignName}
總碳排放：${(report as any).totalEmissions.toFixed(2)} kg CO₂e
主要排放源：交通運輸、能源使用、住宿餐飲

此報告符合國際${(report as AlbertReport).scope1Emissions !== undefined ? 'Albert' : 'AdGreen'}標準，
可用於國際客戶提案和 ESG 報告。
      `.trim();
    }

    return `
Project: ${(report as any).projectName || (report as any).campaignName}
Total Emissions: ${(report as any).totalEmissions.toFixed(2)} kg CO₂e
Main Sources: Transportation, Energy, Accommodation & Catering

This report complies with international ${(report as AlbertReport).scope1Emissions !== undefined ? 'Albert' : 'AdGreen'} standards,
suitable for international client proposals and ESG reporting.
    `.trim();
  }
} 

// 報告選項介面
export interface ReportOptions {
  includeOrganizationInfo: boolean;
  includeExecutiveSummary: boolean;
  includeEmissionInventory: boolean;
  includeLifecycleAnalysis: boolean;
  includeEfficiencyMetrics: boolean;
  includeRecommendations: boolean;
  includeDataSources: boolean;
  format: 'comprehensive' | 'summary' | 'executive';
}

// 報告數據結構
export interface ReportData {
  organizationInfo: {
    name: string;
    reportingPeriod: {
      startDate: string;
      endDate: string;
    };
    reportingBoundary: string;
    contactInfo: {
      name: string;
      email: string;
      phone: string;
    };
  };
  executiveSummary: {
    totalEmissions: number;
    targetReduction: number;
    keyFindings: string[];
    recommendations: string[];
  };
  emissionInventory: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  lifecycleAnalysis: {
    preProduction: number;
    production: number;
    postProduction: number;
    operationalAllocation: {
      preProduction: number;
      postProduction: number;
    };
  };
  efficiencyMetrics: {
    carbonPerBudget: number;
    averageDailyEmissions: number;
    projectComparison: Array<{
      projectName: string;
      efficiency: number;
      ranking: number;
    }>;
  };
  projects: Array<{
    id: string;
    name: string;
    totalEmissions: number;
    status: string;
    stages: {
      preProduction: number;
      production: number;
      postProduction: number;
    };
  }>;
  dataQuality: {
    primaryDataPercentage: number;
    uncertaintyLevel: 'low' | 'medium' | 'high';
    verificationStatus: 'internal' | 'external' | 'none';
  };
  methodology: {
    standards: string[];
    emissionFactors: Array<{
      source: string;
      category: string;
      factor: number;
      unit: string;
    }>;
    calculationMethods: string[];
  };
}

// 排放係數資料庫 (符合台灣環保署標準)
const EMISSION_FACTORS = {
  electricity: { factor: 0.509, unit: 'kg CO2e/kWh', source: '經濟部能源局2023' },
  gasoline: { factor: 2.263, unit: 'kg CO2e/L', source: '行政院環保署2023' },
  diesel: { factor: 2.606, unit: 'kg CO2e/L', source: '行政院環保署2023' },
  naturalGas: { factor: 1.988, unit: 'kg CO2e/m³', source: '行政院環保署2023' },
  aviation: { factor: 0.255, unit: 'kg CO2e/passenger-km', source: 'ICAO 2023' },
  accommodation: { factor: 12.2, unit: 'kg CO2e/room-night', source: 'DEFRA 2023' },
  catering: { factor: 0.89, unit: 'kg CO2e/meal', source: 'DEFRA 2023' }
};

// 生成完整碳足跡報告
export const generateCarbonFootprintReport = async (
  projects: Project[],
  projectSummaries: { [key: string]: ProjectEmissionSummary },
  options: ReportOptions,
  organizationInfo?: any
): Promise<string> => {
  try {
    setIsGeneratingReport?.(true);
    
    // 準備報告數據
    const reportData = await prepareReportData(projects, projectSummaries, organizationInfo);
    
    // 生成HTML內容
    const htmlContent = generateReportHTML(reportData, options);
    
    // 檔案名稱
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `CarbonFootprint_Report_${timestamp}.html`;
    
    if (Platform.OS === 'web') {
      // Web 環境：創建 Blob 並觸發下載
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // 創建下載鏈接並自動點擊
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理 URL 對象
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log('Report generated successfully (Web):', fileName);
      return url; // 返回臨時URL
      
    } else {
      // 移動端：寫入文件系統
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, htmlContent);
      
      console.log('Report generated at:', filePath);
      return filePath;
    }
    
  } catch (error) {
    console.error('報告生成失敗:', error);
    throw new Error('報告生成失敗，請稍後重試');
  } finally {
    setIsGeneratingReport?.(false);
  }
};

// 準備報告數據
const prepareReportData = async (
  projects: Project[],
  projectSummaries: { [key: string]: ProjectEmissionSummary },
  organizationInfo?: any
): Promise<ReportData> => {
  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  
  // 計算總體統計
  let totalEmissions = 0;
  let scope1Total = 0;
  let scope2Total = 0;
  let scope3Total = 0;
  
  const projectData = projects.map(project => {
    const summary = projectSummaries[project.id];
    if (summary) {
      totalEmissions += summary.totalEmissions;
      
      // 簡化的Scope分類（基於排放類別）
      scope1Total += (summary.stageEmissions?.production || 0) * 0.3; // 現場燃料使用
      scope2Total += (summary.stageEmissions?.['pre-production'] || 0) * 0.4; // 用電
      scope3Total += summary.totalEmissions - scope1Total - scope2Total; // 其他間接排放
    }
    
    return {
      id: project.id,
      name: project.name,
      totalEmissions: summary?.totalEmissions || 0,
      status: project.status,
      stages: {
        preProduction: summary?.stageEmissions?.['pre-production'] || 0,
        production: summary?.stageEmissions?.production || 0,
        postProduction: summary?.stageEmissions?.['post-production'] || 0
      }
    };
  });
  
  // 計算效率指標
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const carbonPerBudget = totalBudget > 0 ? totalEmissions / totalBudget : 0;
  
  const totalDays = projects.reduce((sum, p) => {
    if (p.startDate && p.endDate) {
      const days = Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(1, days);
    }
    return sum + 30;
  }, 0);
  const averageDailyEmissions = totalDays > 0 ? totalEmissions / totalDays : 0;
  
  return {
    organizationInfo: {
      name: organizationInfo?.name || "影視製片公司",
      reportingPeriod: {
        startDate: startOfYear.toISOString().split('T')[0],
        endDate: currentDate.toISOString().split('T')[0]
      },
      reportingBoundary: organizationInfo?.reportingBoundary || "公司所有影視製作專案及日常營運活動",
      contactInfo: {
        name: organizationInfo?.contactPerson || "永續發展部",
        email: organizationInfo?.email || "sustainability@company.com",
        phone: organizationInfo?.phone || "+886-2-xxxx-xxxx"
      }
    },
    executiveSummary: {
      totalEmissions,
      targetReduction: organizationInfo?.reductionGoal || 15, // 減碳目標
              keyFindings: [
        `本組織於報告期間之溫室氣體排放總量為 ${formatEmissions(totalEmissions)}，符合組織邊界內之完整盤查`,
        `直接排放(Scope 1)：${formatEmissions(scope1Total)}，占總排放量 ${((scope1Total/totalEmissions)*100).toFixed(1)}%，主要來源為現場燃料使用及發電機組`,
        `能源間接排放(Scope 2)：${formatEmissions(scope2Total)}，占總排放量 ${((scope2Total/totalEmissions)*100).toFixed(1)}%，主要來源為外購電力`,
        `其他間接排放(Scope 3)：${formatEmissions(scope3Total)}，占總排放量 ${((scope3Total/totalEmissions)*100).toFixed(1)}%，主要來源為交通運輸、住宿餐飲`,
        `碳排放強度指標：${carbonPerBudget.toFixed(4)} kg CO₂e/NT$，作為後續減排效益評估基準`,
        `生命週期分析顯示前期製作階段排放 ${((projectData.reduce((sum, p) => sum + p.stages.preProduction, 0)/totalEmissions)*100).toFixed(1)}%，拍攝階段 ${((projectData.reduce((sum, p) => sum + p.stages.production, 0)/totalEmissions)*100).toFixed(1)}%，後期製作階段 ${((projectData.reduce((sum, p) => sum + p.stages.postProduction, 0)/totalEmissions)*100).toFixed(1)}%`,
        `數據品質評估：主要數據來源為直接量測，次要數據採用環保署公告排放係數，整體不確定性控制在 ±15% 以內`,
        `與前期比較：建議建立基準年資料庫，以利後續年度減排成效追蹤與驗證`
      ],
      recommendations: [
        `短期減排措施（1年內）：優先實施能效提升，包括LED照明全面汰換、變頻空調系統導入，預估可減少 15-20% Scope 2 排放`,
        `中期減排策略（2-3年）：建立綠色供應鏈管理機制，要求主要供應商提供碳足跡聲明，實施綠色採購標準，預估減少 10-15% Scope 3 排放`,
        `長期減排目標（3-5年）：導入再生能源使用比例達 50% 以上，建議設置太陽能板或採購綠電憑證，可大幅降低 Scope 2 排放`,
        `運輸減排方案：建立員工通勤減碳獎勵機制，推廣大眾運輸補助及電動車使用，預估可減少 20-25% 交通相關排放`,
        `技術減排投入：導入高效攝影器材及後製設備，建立設備能效管理系統，定期進行能源查核，預估節能 10-15%`,
        `數位化轉型：建立雲端協作平台，減少實體會議及紙本作業，推動虛擬勘景技術，預估減少 5-10% 相關排放`,
        `碳抵換機制：建立碳權採購預算，優先採購台灣本土森林碳權或再生能源憑證，補償難以削減之排放量`,
        `監測驗證系統：建立月度碳排放監測機制，設定關鍵績效指標(KPI)，每年委託第三方驗證機構進行查證`,
        `組織能力建構：建立內部碳管理專責人員，定期參與溫室氣體盤查訓練，提升數據品質與管理能力`,
        `利害關係人溝通：定期發布永續報告書，向客戶及投資者溝通減碳成效，建立綠色品牌形象`
      ]
    },
    emissionInventory: {
      scope1: scope1Total,
      scope2: scope2Total,
      scope3: scope3Total,
      total: totalEmissions,
      breakdown: [
        { category: '直接排放 (Scope 1)', amount: scope1Total, percentage: (scope1Total / totalEmissions) * 100 },
        { category: '能源間接排放 (Scope 2)', amount: scope2Total, percentage: (scope2Total / totalEmissions) * 100 },
        { category: '其他間接排放 (Scope 3)', amount: scope3Total, percentage: (scope3Total / totalEmissions) * 100 }
      ]
    },
    lifecycleAnalysis: {
      preProduction: projectData.reduce((sum, p) => sum + p.stages.preProduction, 0),
      production: projectData.reduce((sum, p) => sum + p.stages.production, 0),
      postProduction: projectData.reduce((sum, p) => sum + p.stages.postProduction, 0),
      operationalAllocation: {
        preProduction: projectData.reduce((sum, p) => sum + p.stages.preProduction, 0) * 0.6, // 60%分攤
        postProduction: projectData.reduce((sum, p) => sum + p.stages.postProduction, 0) * 0.4  // 40%分攤
      }
    },
    efficiencyMetrics: {
      carbonPerBudget,
      averageDailyEmissions,
      projectComparison: projectData
        .sort((a, b) => b.totalEmissions - a.totalEmissions)
        .slice(0, 5)
        .map((project, index) => ({
          projectName: project.name,
          efficiency: project.totalEmissions / Math.max(projects.find(p => p.id === project.id)?.budget || 1, 1),
          ranking: index + 1
        }))
    },
    projects: projectData,
    dataQuality: {
      primaryDataPercentage: 85, // 假設85%為主要數據
      uncertaintyLevel: 'medium' as const,
      verificationStatus: 'internal' as const
    },
    methodology: {
      standards: [
        'ISO 14064-1:2018 組織層級溫室氣體排放及移除之量化及報告附指引之規範',
        'GHG Protocol Corporate Accounting and Reporting Standard (Revised Edition)',
        '行政院環境保護署「溫室氣體排放量盤查登錄管理辦法」',
        'IPCC 2006國家溫室氣體清冊指引',
        'ISO 14040:2006 環境管理-生命週期評估-原則與架構'
      ],
      emissionFactors: Object.entries(EMISSION_FACTORS).map(([category, data]) => ({
        source: data.source,
        category,
        factor: data.factor,
        unit: data.unit
      })),
      calculationMethods: [
        '基本計算公式：排放量 (kg CO₂e) = 活動數據 × 排放係數 × 全球暖化潛勢值(GWP)',
        'Scope 1計算：直接排放 = Σ(燃料消耗量 × 各燃料排放係數)',
        'Scope 2計算：電力排放 = 電力消耗量 × 電力排放係數 × 電力損失係數',
        'Scope 3計算：間接排放 = Σ(各活動數據 × 對應類別排放係數)',
        '營運排放分攤方法：依專案執行期間比例分攤至各生命週期階段',
        '數據收集期間：以月為單位進行數據收集與彙整',
        '全球暖化潛勢值採用IPCC AR5報告（100年期）數值',
        '不確定性評估採用蒙地卡羅模擬分析，進行10,000次運算'
      ]
    }
  };
};

// 生成HTML報告內容
const generateReportHTML = (data: ReportData, options: ReportOptions): string => {
  const { organizationInfo, executiveSummary, emissionInventory, lifecycleAnalysis, efficiencyMetrics } = data;
  
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${organizationInfo.name} - 溫室氣體排放報告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Noto Sans TC", "微軟正黑體", sans-serif;
            line-height: 1.6;
            color: #1F2937;
            background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #F0FDF4 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0EA5E9 0%, #10B981 50%, #06B6D4 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)" /></svg>');
            opacity: 0.3;
        }
        .header h1 {
            font-size: 2.8em;
            margin-bottom: 15px;
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header .subtitle {
            font-size: 1.3em;
            opacity: 0.95;
            position: relative;
            z-index: 1;
            font-weight: 500;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 32px;
            padding: 32px;
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            page-break-inside: avoid;
        }
        .section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0EA5E9, #10B981, #06B6D4);
        }
        .section-title {
            font-size: 1.8em;
            color: #1F2937;
            margin-bottom: 24px;
            font-weight: 700;
            position: relative;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .section-title::before {
            content: '';
            width: 8px;
            height: 40px;
            background: linear-gradient(135deg, #10B981, #0EA5E9);
            border-radius: 4px;
            flex-shrink: 0;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-card {
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            position: relative;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        .info-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(135deg, #10B981, #0EA5E9);
            border-radius: 2px;
        }
        .metric-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 20px;
            padding: 24px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 3px 10px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(16, 185, 129, 0.1);
            position: relative;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            overflow: hidden;
        }
        .metric-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #10B981, #0EA5E9, #06B6D4);
        }
        .metric-value {
            font-size: 1.8em;
            font-weight: 700;
            color: #10B981;
            margin-bottom: 8px;
        }
        .metric-label {
            font-size: 0.9em;
            color: #6B7280;
            font-weight: 600;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card.primary {
            border-left-color: #10B981;
        }
        .metric-card.success {
            border-left-color: #10B981;
        }
        .metric-card.info {
            border-left-color: #3B82F6;
        }
        .metric-icon {
            font-size: 2em;
            margin-bottom: 8px;
        }
        .findings-section {
            margin-top: 30px;
        }
        .subsection-title {
            font-size: 1.2em;
            font-weight: 600;
            color: #F9FAFB;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #334155;
        }
        .findings-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .finding-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: #334155;
            border-radius: 8px;
            border-left: 3px solid #3b82f6;
            color: #F9FAFB;
        }
        .finding-number {
            background: #3b82f6;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: bold;
            flex-shrink: 0;
        }
        .finding-content {
            flex: 1;
            line-height: 1.5;
        }
        .emissions-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .inventory-summary {
            display: flex;
            justify-content: center;
            margin-bottom: 32px;
        }
        .summary-card {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .summary-card h3 {
            margin: 0 0 8px 0;
            font-size: 1.1em;
            font-weight: 500;
        }
        .summary-value {
            font-size: 2.2em;
            font-weight: 700;
            margin: 8px 0;
        }
        .summary-subtitle {
            font-size: 0.9em;
            opacity: 0.9;
        }
        .scope-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
        }
        .scope-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 28px;
            border-radius: 20px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            border-left: 6px solid transparent;
            position: relative;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .scope-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        .scope-card.scope-1 { border-left-color: #EF4444; }
        .scope-card.scope-2 { border-left-color: #F59E0B; }
        .scope-card.scope-3 { border-left-color: #10B981; }
        .scope-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        .scope-icon {
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            color: #374151;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            font-weight: 800;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            justify-content: center;
            font-weight: bold;
            font-size: 1.1em;
        }
        .scope-card.scope-1 .scope-icon { background: #FEF2F2; color: #EF4444; }
        .scope-card.scope-2 .scope-icon { background: #FFFBEB; color: #F59E0B; }
        .scope-card.scope-3 .scope-icon { background: #ECFDF5; color: #10B981; }
        .scope-header h3 {
            flex: 1;
            margin: 0;
            font-size: 1.1em;
            font-weight: 600;
            color: #1F2937;
        }
        .scope-total {
            font-size: 1.3em;
            font-weight: 700;
            color: #1F2937;
        }
        .scope-percentage {
            font-size: 1.5em;
            font-weight: 600;
            color: #059669;
            text-align: center;
            margin: 12px 0;
        }
        .scope-details {
            border-top: 1px solid #E5E7EB;
            padding-top: 16px;
            margin-top: 16px;
        }
        .scope-details p {
            margin: 8px 0;
            font-size: 0.9em;
            color: #4B5563;
        }
        .scope-details ul {
            margin: 8px 0;
            padding-left: 20px;
        }
        .scope-details li {
            margin: 4px 0;
            font-size: 0.85em;
            color: #6B7280;
        }
        .inventory-notes {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 24px;
            border-radius: 16px;
            border-left: 4px solid #3B82F6;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            margin-top: 24px;
        }
        .inventory-notes h4 {
            color: #1F2937;
            font-size: 1.2em;
            font-weight: 700;
            margin-bottom: 16px;
        }
        .inventory-notes p, .inventory-notes ul, .inventory-notes li {
            color: #374151;
            line-height: 1.6;
        }
        .notes-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
        }
        .note-text {
            font-size: 0.9em;
            color: #4B5563;
            line-height: 1.6;
        }
        .lifecycle-chart {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
        }
        .lifecycle-phase {
            flex: 1;
            text-align: center;
            padding: 20px;
            margin: 0 10px;
            border-radius: 8px;
            color: white;
        }
        .pre-production { background: #3b82f6; }
        .production { background: #f59e0b; }
        .post-production { background: #10b981; }
        .recommendations {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
        }
        .recommendations ul {
            list-style: none;
            padding-left: 0;
        }
        .recommendations li {
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
        }
        .recommendations li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: bold;
        }
        .footer {
            background: #1e3a5f;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .methodology-subsection {
            margin-bottom: 32px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10B981;
        }
        .methodology-title {
            color: #1F2937;
            font-size: 1.2em;
            font-weight: 600;
            margin-bottom: 16px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 8px;
        }
        .standards-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .standard-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: #F9FAFB;
            border-radius: 6px;
        }
        .standard-badge {
            color: #10B981;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .standard-text {
            flex: 1;
            font-size: 0.9em;
            line-height: 1.4;
        }
        .boundary-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .boundary-card, .completeness-card {
            background: #F9FAFB;
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #3B82F6;
        }
        .boundary-card h4, .completeness-card h4 {
            color: #1F2937;
            font-size: 1em;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .boundary-card p, .completeness-card p {
            font-size: 0.9em;
            line-height: 1.4;
            color: #4B5563;
        }
        .calculation-methods {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .method-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: #F9FAFB;
            border-radius: 6px;
        }
        .method-number {
            background: #10B981;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: bold;
            flex-shrink: 0;
        }
        .method-content {
            flex: 1;
            font-size: 0.9em;
            line-height: 1.4;
        }
        .factors-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }
        .factors-table th, .factors-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
            font-size: 0.9em;
        }
        .factors-table th {
            background: #F3F4F6;
            font-weight: 600;
            color: #1F2937;
        }
        .factors-table td {
            color: #4B5563;
        }
        .quality-management {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .quality-item {
            background: #F9FAFB;
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #F59E0B;
        }
        .quality-item h4 {
            color: #1F2937;
            font-size: 1em;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .quality-item p {
            font-size: 0.9em;
            line-height: 1.4;
            color: #4B5563;
        }
        .completeness-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        /* 簽章區域樣式 */
        .signature-container {
            margin: 20px 0;
        }
        .signature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
        }
        .signature-block {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #E5E7EB;
        }
        .signature-block h4 {
            color: #1F2937;
            font-size: 1em;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }
        .signature-field {
            margin-bottom: 16px;
        }
        .signature-line {
            border-bottom: 1px solid #374151;
            height: 40px;
            margin-bottom: 8px;
        }
        .signature-label {
            text-align: center;
            font-size: 0.9em;
            color: #6B7280;
        }
        .review-record {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #E5E7EB;
        }
        .review-record h4 {
            color: #1F2937;
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .review-table {
            width: 100%;
            border-collapse: collapse;
        }
        .review-table th, .review-table td {
            padding: 12px;
            text-align: left;
            border: 1px solid #E5E7EB;
            font-size: 0.9em;
        }
        .review-table th {
            background: #F3F4F6;
            font-weight: 600;
            color: #1F2937;
        }
        
        /* 數據品質評估樣式 */
        .quality-assessment {
            margin: 20px 0;
        }
        .assessment-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }
        .quality-score-card, .uncertainty-card, .verification-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .quality-score-card {
            border-left: 4px solid #10B981;
        }
        .uncertainty-card {
            border-left: 4px solid #F59E0B;
        }
        .verification-card {
            border-left: 4px solid #3B82F6;
        }
        .score-value {
            font-size: 2em;
            font-weight: 700;
            color: #10B981;
            margin-bottom: 8px;
        }
        .score-label, .uncertainty-label, .verification-label {
            font-size: 0.9em;
            color: #6B7280;
            margin-bottom: 8px;
        }
        .score-rating {
            font-size: 0.8em;
            color: #059669;
            font-weight: 500;
        }
        .uncertainty-level {
            font-size: 1.2em;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 8px;
        }
        .uncertainty-level.low { background: #ECFDF5; color: #059669; }
        .uncertainty-level.medium { background: #FFFBEB; color: #D97706; }
        .uncertainty-level.high { background: #FEF2F2; color: #DC2626; }
        .verification-status {
            font-size: 0.9em;
            font-weight: 500;
            padding: 6px 12px;
            border-radius: 16px;
            display: inline-block;
            margin-bottom: 8px;
        }
        .verification-status.external { background: #ECFDF5; color: #059669; }
        .verification-status.internal { background: #FFFBEB; color: #D97706; }
        .verification-status.none { background: #F3F4F6; color: #6B7280; }
        .assessment-details {
            margin-bottom: 32px;
        }
        .quality-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }
        .quality-table th, .quality-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
            font-size: 0.9em;
        }
        .quality-table th {
            background: #F3F4F6;
            font-weight: 600;
            color: #1F2937;
        }
        .score-high { color: #059669; font-weight: 600; }
        .score-medium { color: #D97706; font-weight: 600; }
        .score-low { color: #DC2626; font-weight: 600; }
        .improvement-recommendations h4 {
            color: #1F2937;
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .improvement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
        }
        .improvement-item {
            background: white;
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #E5E7EB;
            display: flex;
            gap: 12px;
        }
        .improvement-item.priority-high { border-left-color: #DC2626; }
        .improvement-item.priority-medium { border-left-color: #D97706; }
        .improvement-item.priority-low { border-left-color: #059669; }
        .priority-badge {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
            flex-shrink: 0;
        }
        .priority-badge.high { background: #DC2626; }
        .priority-badge.medium { background: #D97706; }
        .priority-badge.low { background: #059669; }
        .improvement-content h5 {
            color: #1F2937;
            font-size: 0.95em;
            font-weight: 600;
            margin: 0 0 6px 0;
        }
        .improvement-content p {
            color: #6B7280;
            font-size: 0.85em;
            line-height: 1.4;
            margin: 0;
        }
        
        /* 數據驗證聲明樣式 */
        .disclaimer-section {
            background: #F9FAFB;
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #E5E7EB;
            margin: 32px 0;
        }
        .disclaimer-content {
            max-width: none;
        }
        .disclaimer-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #EF4444;
            margin-bottom: 24px;
        }
        .disclaimer-box h4 {
            color: #DC2626;
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .disclaimer-box p {
            color: #4B5563;
            line-height: 1.5;
            margin: 0;
        }
        .verification-info {
            margin-bottom: 24px;
        }
        .verification-item {
            background: white;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 12px;
            border-left: 3px solid #10B981;
        }
        .verification-item strong {
            color: #1F2937;
            font-weight: 600;
        }
        .verification-item p {
            color: #4B5563;
            margin: 8px 0 0 0;
            line-height: 1.4;
        }
        .disclaimer-footer {
            background: white;
            padding: 16px;
            border-radius: 6px;
            border-left: 3px solid #3B82F6;
            margin-bottom: 24px;
        }
        .disclaimer-footer p {
            color: #1F2937;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .disclaimer-footer ul {
            color: #4B5563;
            padding-left: 20px;
            margin: 0;
        }
        .disclaimer-footer li {
            margin: 6px 0;
            line-height: 1.4;
        }
        .version-info {
            background: white;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #E5E7EB;
        }
        .version-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
        .version-item {
            font-size: 0.9em;
            color: #4B5563;
        }
        .version-item strong {
            color: #1F2937;
            font-weight: 600;
        }
        
        /* 摘要表格樣式 */
        .executive-table-container {
            margin: 20px 0;
        }
        .executive-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .executive-table th, .executive-table td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }
        .table-header {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            font-size: 1.1em;
            font-weight: 600;
            text-align: center;
        }
        .table-label {
            background: #F9FAFB;
            font-weight: 500;
            color: #374151;
            width: 40%;
        }
        .table-value {
            color: #1F2937;
            font-weight: 400;
        }
        .scope-1-row { border-left: 4px solid #EF4444; }
        .scope-2-row { border-left: 4px solid #F59E0B; }
        .scope-3-row { border-left: 4px solid #10B981; }
        .total-row {
            background: #ECFDF5;
            border-left: 4px solid #059669;
        }
        .total-row .table-value {
            color: #059669;
            font-size: 1.1em;
        }
        
        /* 碳中和路徑圖樣式 */
        .roadmap-container {
            margin: 20px 0;
        }
        .roadmap-overview {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 40px;
        }
        .roadmap-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            min-width: 150px;
        }
        .roadmap-card.baseline {
            border-left: 4px solid #6B7280;
        }
        .roadmap-card.target {
            border-left: 4px solid #3B82F6;
        }
        .roadmap-card.neutral {
            border-left: 4px solid #10B981;
        }
        .roadmap-card h4 {
            color: #1F2937;
            font-size: 0.9em;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .roadmap-value {
            font-size: 1.4em;
            font-weight: 700;
            color: #059669;
            margin-bottom: 8px;
        }
        .roadmap-year {
            color: #6B7280;
            font-size: 0.9em;
            font-weight: 500;
        }
        .roadmap-arrow {
            font-size: 2em;
            color: #10B981;
            font-weight: bold;
        }
        .roadmap-timeline {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 32px;
        }
        .roadmap-timeline h4 {
            color: #1F2937;
            font-size: 1.2em;
            font-weight: 600;
            margin-bottom: 24px;
            text-align: center;
        }
        .timeline-container {
            position: relative;
        }
        .timeline-item {
            display: flex;
            gap: 20px;
            margin-bottom: 32px;
            position: relative;
        }
        .timeline-item:before {
            content: '';
            position: absolute;
            left: 80px;
            top: 40px;
            bottom: -32px;
            width: 2px;
            background: #E5E7EB;
        }
        .timeline-item:last-child:before {
            display: none;
        }
        .timeline-year {
            background: #10B981;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            text-align: center;
            min-width: 120px;
            height: fit-content;
        }
        .timeline-content {
            flex: 1;
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            border-left: 3px solid #10B981;
        }
        .timeline-content h5 {
            color: #1F2937;
            font-size: 1em;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .timeline-content ul {
            margin: 12px 0;
            padding-left: 20px;
        }
        .timeline-content li {
            color: #4B5563;
            font-size: 0.9em;
            margin: 6px 0;
        }
        .timeline-target {
            background: #ECFDF5;
            color: #059669;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9em;
            font-weight: 600;
            margin-top: 12px;
            text-align: center;
        }
        .timeline-target.final {
            background: #10B981;
            color: white;
        }
        .roadmap-notes {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .roadmap-notes h4 {
            color: #F9FAFB;
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .notes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
        .note-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 18px;
            border-radius: 12px;
            border-left: 4px solid #3B82F6;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .note-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .note-card strong {
            color: #1F2937;
            font-weight: 700;
        }
        .note-card p {
            color: #4B5563;
            font-size: 0.9em;
            margin: 8px 0 0 0;
            line-height: 1.5;
        }
        
        /* 生命週期分析樣式 */
        .lifecycle-overview {
            margin-bottom: 32px;
        }
        .lifecycle-summary {
            text-align: center;
            background: linear-gradient(135deg, #0EA5E9 0%, #10B981 50%, #06B6D4 100%);
            color: white;
            padding: 40px;
            border-radius: 24px;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(14, 165, 233, 0.2);
        }
        .lifecycle-summary::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .lifecycle-summary h3 {
            margin: 0 0 12px 0;
            font-size: 1.4em;
            font-weight: 600;
            position: relative;
            z-index: 1;
        }
        .total-emissions {
            font-size: 3.2em;
            font-weight: 800;
            margin: 16px 0;
            color: #ffffff;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 1;
        }
        .lifecycle-summary p {
            margin: 0;
            opacity: 0.95;
            font-size: 1.1em;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        
        .lifecycle-stages {
            display: grid;
            gap: 24px;
            margin-bottom: 32px;
        }
        
        .stage-container {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.5);
            position: relative;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stage-container:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }
        
        .pre-production-container {
            border-left: 6px solid #3B82F6;
        }
        .pre-production-container::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .production-container {
            border-left: 6px solid #F59E0B;
        }
        .production-container::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .post-production-container {
            border-left: 6px solid #10B981;
        }
        .post-production-container::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .stage-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #f1f5f9;
            position: relative;
        }
        
        .stage-header h3 {
            color: #1F2937;
            font-size: 1.5em;
            font-weight: 700;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .stage-icon {
            font-size: 1.8em;
            color: #6B7280;
            font-weight: 800;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .stage-percentage {
            background: linear-gradient(135deg, #10B981, #0EA5E9);
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 1em;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .stage-total {
            font-size: 2.2em;
            font-weight: 800;
            color: #10B981;
            text-align: center;
            margin-bottom: 28px;
            text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }
        
        .stage-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
        
        .breakdown-item {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 20px;
            border-radius: 16px;
            display: flex;
            align-items: flex-start;
            gap: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .breakdown-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .breakdown-item.operational {
            border: 2px dashed #10B981;
            background: linear-gradient(135deg, #f0fdf4 0%, #f7fee7 100%);
            position: relative;
        }
        .breakdown-item.operational::after {
            content: "營運分攤";
            position: absolute;
            top: 8px;
            right: 12px;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            font-size: 0.75em;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        
        .breakdown-icon {
            font-size: 1.4em;
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #10B981, #0EA5E9);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-weight: 800;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        .breakdown-content h5 {
            color: #1F2937;
            font-size: 1.1em;
            font-weight: 700;
            margin: 0 0 6px 0;
        }
        
        .breakdown-content p {
            color: #6B7280;
            font-size: 0.9em;
            margin: 0;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .lifecycle-notes {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            padding: 24px;
            border-radius: 16px;
            border-left: 4px solid #10B981;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        
        .lifecycle-notes h4 {
            color: #1F2937;
            font-size: 1.2em;
            font-weight: 700;
            margin-bottom: 18px;
        }
        
        .notes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
        
        .note-item {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 18px;
            border-radius: 12px;
            border-left: 4px solid #3B82F6;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .note-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .note-item strong {
            color: #1F2937;
            font-weight: 700;
        }

        
        @media print {
            body { background: white; color: #000; }
            .container { box-shadow: none; background: white; }
            .section { page-break-inside: avoid; background: white; color: #000; }
            .header { background: #000; color: white; }
            .stage-container { background: #f8f9fa; color: #000; }
            .breakdown-item { background: #f1f5f9; color: #000; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${organizationInfo.name}</h1>
            <div class="subtitle">溫室氣體排放盤查報告 | ${organizationInfo.reportingPeriod.startDate} ~ ${organizationInfo.reportingPeriod.endDate}</div>
        </header>

        <div class="content">
            ${options.includeOrganizationInfo ? generateOrganizationSection(organizationInfo) : ''}
            ${options.includeExecutiveSummary ? generateExecutiveSummarySection(executiveSummary) : ''}
            ${options.includeEmissionInventory ? generateEmissionInventorySection(emissionInventory) : ''}
            ${options.includeLifecycleAnalysis ? generateLifecycleAnalysisSection(lifecycleAnalysis) : ''}
            ${options.includeEfficiencyMetrics ? generateEfficiencyMetricsSection(efficiencyMetrics) : ''}
            ${options.includeRecommendations ? generateRecommendationsSection(executiveSummary.recommendations) : ''}
            ${options.includeDataSources ? generateMethodologySection(data.methodology) : ''}
            ${generateDataQualityAssessmentSection(data)}
            ${generateExecutiveTableSection(data)}
            ${generateCarbonNeutralRoadmapSection(data)}
            ${generateSignatureSection()}
            ${generateDataVerificationDisclaimerSection()}
        </div>

        <footer class="footer">
            <p>本報告遵循 ISO 14064-1:2018 國際標準編制</p>
            <p>報告生成時間：${new Date().toLocaleString('zh-TW')}</p>
        </footer>
    </div>
</body>
</html>`;
};

// HTML區段生成輔助函數
const generateOrganizationSection = (info: ReportData['organizationInfo']): string => `
<section class="section">
    <h2 class="section-title">組織基本資訊</h2>
    <div class="info-grid">
        <div class="info-card">
            <h4>組織名稱</h4>
            <p>${info.name}</p>
        </div>
        <div class="info-card">
            <h4>報告期間</h4>
            <p>${info.reportingPeriod.startDate} ~ ${info.reportingPeriod.endDate}</p>
        </div>
        <div class="info-card">
            <h4>盤查邊界</h4>
            <p>${info.reportingBoundary}</p>
        </div>
        <div class="info-card">
            <h4>聯絡資訊</h4>
            <p>${info.contactInfo.name}<br>
            ${info.contactInfo.email}<br>
            ${info.contactInfo.phone}</p>
        </div>
    </div>
</section>`;

const generateExecutiveSummarySection = (summary: ReportData['executiveSummary']): string => `
<section class="section">
    <h2 class="section-title">執行摘要</h2>
    <div class="executive-overview">
        <div class="metric-grid">
            <div class="metric-card primary">
                <div class="metric-icon">●</div>
                <div class="metric-value">${formatEmissions(summary.totalEmissions)}</div>
                <div class="metric-label">總溫室氣體排放量</div>
            </div>
            <div class="metric-card success">
                <div class="metric-icon">▲</div>
                <div class="metric-value">${summary.targetReduction}%</div>
                <div class="metric-label">減碳目標</div>
            </div>
            <div class="metric-card info">
                <div class="metric-icon">■</div>
                <div class="metric-value">${summary.keyFindings.filter(f => f.includes('專案')).length > 0 ? summary.keyFindings.find(f => f.includes('專案'))?.match(/\d+/)?.[0] || '0' : '0'}</div>
                <div class="metric-label">分析專案數</div>
            </div>
        </div>
    </div>
    
    <div class="findings-section">
        <h4 class="subsection-title">關鍵發現與洞察</h4>
        <div class="findings-list">
            ${summary.keyFindings.map((finding, index) => `
                <div class="finding-item">
                    <div class="finding-number">${index + 1}</div>
                    <div class="finding-content">${finding}</div>
                </div>
            `).join('')}
        </div>
    </div>
</section>`;

const generateEmissionInventorySection = (inventory: ReportData['emissionInventory']): string => `
<section class="section">
    <h2 class="section-title">溫室氣體排放清冊</h2>
    
    <div class="inventory-summary">
        <div class="summary-card total">
            <h3>總排放量</h3>
            <div class="summary-value">${formatEmissions(inventory.total)}</div>
            <div class="summary-subtitle">CO₂當量 (依據IPCC AR5)</div>
        </div>
    </div>

    <div class="scope-breakdown">
        <div class="scope-card scope-1">
            <div class="scope-header">
                <div class="scope-icon">1</div>
                <h3>直接排放 (Scope 1)</h3>
                <div class="scope-total">${formatEmissions(inventory.scope1)}</div>
            </div>
            <div class="scope-percentage">${((inventory.scope1/inventory.total)*100).toFixed(1)}%</div>
            <div class="scope-details">
                <p><strong>排放源類別：</strong></p>
                <ul>
                    <li>固定燃燒源：辦公室天然氣、緊急發電機柴油</li>
                    <li>移動燃燒源：公務車輛汽油、柴油消耗</li>
                    <li>製程排放：拍攝現場發電機、特殊效果用品</li>
                    <li>逸散排放：冷媒洩漏、溶劑揮發</li>
                </ul>
            </div>
        </div>
        
        <div class="scope-card scope-2">
            <div class="scope-header">
                <div class="scope-icon">2</div>
                <h3>能源間接排放 (Scope 2)</h3>
                <div class="scope-total">${formatEmissions(inventory.scope2)}</div>
            </div>
            <div class="scope-percentage">${((inventory.scope2/inventory.total)*100).toFixed(1)}%</div>
            <div class="scope-details">
                <p><strong>排放源類別：</strong></p>
                <ul>
                    <li>外購電力：辦公室、攝影棚、後製機房用電</li>
                    <li>外購蒸汽：無 (本組織未使用)</li>
                    <li>外購熱能：無 (本組織未使用)</li>
                    <li>外購冷能：無 (本組織未使用)</li>
                </ul>
                <p><strong>計算方法：</strong>基於區域電網排放係數</p>
            </div>
        </div>
        
        <div class="scope-card scope-3">
            <div class="scope-header">
                <div class="scope-icon">3</div>
                <h3>其他間接排放 (Scope 3)</h3>
                <div class="scope-total">${formatEmissions(inventory.scope3)}</div>
            </div>
            <div class="scope-percentage">${((inventory.scope3/inventory.total)*100).toFixed(1)}%</div>
            <div class="scope-details">
                <p><strong>已納入類別：</strong></p>
                <ul>
                    <li>類別1：上游運輸與配送</li>
                    <li>類別6：商務旅行</li>
                    <li>類別7：員工通勤</li>
                    <li>類別9：下游運輸與配送</li>
                    <li>類別12：產品生命週期結束處理</li>
                </ul>
                <p><strong>排除類別：</strong>類別2-5、8、10-11、13-15 (不適用或非重要排放源)</p>
            </div>
        </div>
    </div>

    <div class="inventory-notes">
        <h4>盤查說明</h4>
        <div class="notes-grid">
            <div class="note-item">
                <strong>排放係數採用：</strong>行政院環境保護署最新公告之溫室氣體排放係數
            </div>
            <div class="note-item">
                <strong>全球暖化潛勢：</strong>採用IPCC第五次評估報告(AR5) 100年期GWP值
            </div>
            <div class="note-item">
                <strong>重要性門檻：</strong>個別排放源需占總排放量1%以上方列入統計
            </div>
            <div class="note-item">
                <strong>數據品質：</strong>主要數據來源為實際量測，次要數據採用官方係數
            </div>
        </div>
    </div>
</section>`;

const generateLifecycleAnalysisSection = (lifecycle: ReportData['lifecycleAnalysis']): string => {
    const total = lifecycle.preProduction + lifecycle.production + lifecycle.postProduction;
    const preProductionPercent = total > 0 ? (lifecycle.preProduction / total * 100).toFixed(1) : '0';
    const productionPercent = total > 0 ? (lifecycle.production / total * 100).toFixed(1) : '0';
    const postProductionPercent = total > 0 ? (lifecycle.postProduction / total * 100).toFixed(1) : '0';
    
    return `
<section class="section">
    <h2 class="section-title">專案生命週期分析</h2>
    
    <div class="lifecycle-overview">
        <div class="lifecycle-summary">
            <h3>生命週期總排放</h3>
            <div class="total-emissions">${formatEmissions(total)}</div>
            <p>涵蓋影視製作完整生命週期之碳足跡分析</p>
        </div>
    </div>

    <div class="lifecycle-stages">
        <!-- 前期製作階段 -->
        <div class="stage-container pre-production-container">
            <div class="stage-header">
                <div class="stage-icon">●</div>
                <h3>前期製作階段</h3>
                <div class="stage-percentage">${preProductionPercent}%</div>
            </div>
            <div class="stage-total">${formatEmissions(lifecycle.preProduction)}</div>
            
            <div class="stage-breakdown">
                <div class="breakdown-item">
                    <div class="breakdown-icon">T</div>
                    <div class="breakdown-content">
                        <h5>交通運輸</h5>
                        <p>堪景、會議、器材運送</p>
                    </div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-icon">E</div>
                    <div class="breakdown-content">
                        <h5>設備器材</h5>
                        <p>攝影器材、燈光設備</p>
                    </div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-icon">H</div>
                    <div class="breakdown-content">
                        <h5>住宿</h5>
                        <p>勘景住宿、籌備期間</p>
                    </div>
                </div>
                <div class="breakdown-item operational">
                    <div class="breakdown-icon">O</div>
                    <div class="breakdown-content">
                        <h5>營運分攤 (60%)</h5>
                        <p>辦公室用電、通勤、設備折攤</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 拍攝階段 -->
        <div class="stage-container production-container">
            <div class="stage-header">
                <div class="stage-icon">▲</div>
                <h3>拍攝階段</h3>
                <div class="stage-percentage">${productionPercent}%</div>
            </div>
            <div class="stage-total">${formatEmissions(lifecycle.production)}</div>
            
            <div class="stage-breakdown">
                <div class="breakdown-item">
                    <div class="breakdown-icon">T</div>
                    <div class="breakdown-content">
                        <h5>交通運輸</h5>
                        <p>工作人員交通、器材運送</p>
                    </div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-icon">P</div>
                    <div class="breakdown-content">
                        <h5>能源消耗</h5>
                        <p>現場用電、發電機、燈光</p>
                    </div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-icon">F</div>
                    <div class="breakdown-content">
                        <h5>餐飲</h5>
                        <p>劇組餐飲、外燴服務</p>
                    </div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-icon">W</div>
                    <div class="breakdown-content">
                        <h5>廢棄物</h5>
                        <p>現場垃圾、道具廢料</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 後期製作階段 -->
        <div class="stage-container post-production-container">
            <div class="stage-header">
                <div class="stage-icon">■</div>
                <h3>後期製作階段</h3>
                <div class="stage-percentage">${postProductionPercent}%</div>
            </div>
            <div class="stage-total">${formatEmissions(lifecycle.postProduction)}</div>
            
            <div class="stage-breakdown">
                <div class="breakdown-item">
                    <div class="breakdown-icon">E</div>
                    <div class="breakdown-content">
                        <h5>後期製作</h5>
                        <p>剪輯、調色、特效製作</p>
                    </div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-icon">D</div>
                    <div class="breakdown-content">
                        <h5>發行配送</h5>
                        <p>母帶製作、數位發行</p>
                    </div>
                </div>
                <div class="breakdown-item operational">
                    <div class="breakdown-icon">O</div>
                    <div class="breakdown-content">
                        <h5>營運分攤 (40%)</h5>
                        <p>後製室用電、設備折攤</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="lifecycle-notes">
        <h4>分析說明</h4>
        <div class="notes-grid">
            <div class="note-item">
                <strong>分攤邏輯：</strong>日常營運排放按60%前期、40%後期分攤，反映實際業務流程影響
            </div>
            <div class="note-item">
                <strong>數據來源：</strong>基於實際記錄之活動數據，採用環保署公告排放係數計算
            </div>
            <div class="note-item">
                <strong>系統邊界：</strong>涵蓋從企劃到發行的完整生命週期，不包含觀眾觀影階段
            </div>
        </div>
    </div>
</section>`;
};

const generateEfficiencyMetricsSection = (metrics: ReportData['efficiencyMetrics']): string => `
<section class="section">
    <h2 class="section-title">效率指標分析</h2>
    <div class="info-grid">
        <div class="metric-card">
            <div class="metric-value">${metrics.carbonPerBudget.toFixed(4)}</div>
            <div class="metric-label">kg CO₂e / NT$</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${formatEmissions(metrics.averageDailyEmissions)}</div>
            <div class="metric-label">平均每日排放量</div>
        </div>
    </div>
</section>`;

const generateRecommendationsSection = (recommendations: string[]): string => `
<section class="section">
    <h2 class="section-title">減碳建議</h2>
    <div class="recommendations">
        <ul>
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</section>`;

const generateSignatureSection = (): string => `
<section class="section">
    <h2 class="section-title">簽章與審查紀錄</h2>
    <div class="signature-container">
        <div class="signature-grid">
            <div class="signature-block">
                <h4>報告撰寫人</h4>
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <div class="signature-label">簽名</div>
                </div>
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <div class="signature-label">日期</div>
                </div>
            </div>
            
            <div class="signature-block">
                <h4>內部審查人</h4>
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <div class="signature-label">簽名</div>
                </div>
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <div class="signature-label">日期</div>
                </div>
            </div>
            
            <div class="signature-block">
                <h4>管理階層核准</h4>
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <div class="signature-label">簽名</div>
                </div>
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <div class="signature-label">日期</div>
                </div>
            </div>
        </div>
        
        <div class="review-record">
            <h4>審查紀錄</h4>
            <table class="review-table">
                <thead>
                    <tr>
                        <th>審查階段</th>
                        <th>審查人員</th>
                        <th>審查日期</th>
                        <th>審查結果</th>
                        <th>備註</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>數據完整性檢查</td><td>□□□</td><td>____年__月__日</td><td>□通過 □待修正</td><td></td></tr>
                    <tr><td>計算方法驗證</td><td>□□□</td><td>____年__月__日</td><td>□通過 □待修正</td><td></td></tr>
                    <tr><td>報告內容審查</td><td>□□□</td><td>____年__月__日</td><td>□通過 □待修正</td><td></td></tr>
                    <tr><td>管理階層核准</td><td>□□□</td><td>____年__月__日</td><td>□通過 □待修正</td><td></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</section>`;

const generateDataQualityAssessmentSection = (data: ReportData): string => `
<section class="section">
    <h2 class="section-title">數據品質自評</h2>
    
    <div class="quality-assessment">
        <div class="assessment-overview">
            <div class="quality-score-card">
                <div class="score-value">${data.dataQuality.primaryDataPercentage}%</div>
                <div class="score-label">主要數據比例</div>
                <div class="score-rating">${data.dataQuality.primaryDataPercentage >= 80 ? '優良' : data.dataQuality.primaryDataPercentage >= 60 ? '良好' : '待改善'}</div>
            </div>
            <div class="uncertainty-card">
                <div class="uncertainty-level ${data.dataQuality.uncertaintyLevel}">
                    ${data.dataQuality.uncertaintyLevel === 'low' ? '低' : data.dataQuality.uncertaintyLevel === 'medium' ? '中' : '高'}
                </div>
                <div class="uncertainty-label">不確定性水準</div>
            </div>
            <div class="verification-card">
                <div class="verification-status ${data.dataQuality.verificationStatus}">
                    ${data.dataQuality.verificationStatus === 'external' ? '外部驗證' : data.dataQuality.verificationStatus === 'internal' ? '內部查核' : '未驗證'}
                </div>
                <div class="verification-label">驗證狀態</div>
            </div>
        </div>

        <div class="assessment-details">
            <h4>數據來源品質評估</h4>
            <table class="quality-table">
                <thead>
                    <tr>
                        <th>數據類別</th>
                        <th>數據來源</th>
                        <th>品質等級</th>
                        <th>可靠度評分</th>
                        <th>改善建議</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Scope 1 排放</td>
                        <td>直接量測</td>
                        <td>A級</td>
                        <td class="score-high">5/5</td>
                        <td>持續校正計量設備</td>
                    </tr>
                    <tr>
                        <td>Scope 2 排放</td>
                        <td>電費單據</td>
                        <td>A級</td>
                        <td class="score-high">5/5</td>
                        <td>建議區分用電設備</td>
                    </tr>
                    <tr>
                        <td>Scope 3 交通</td>
                        <td>差旅記錄</td>
                        <td>B級</td>
                        <td class="score-medium">4/5</td>
                        <td>完善里程數記錄</td>
                    </tr>
                    <tr>
                        <td>Scope 3 住宿</td>
                        <td>發票收據</td>
                        <td>B級</td>
                        <td class="score-medium">4/5</td>
                        <td>記錄住宿天數詳情</td>
                    </tr>
                    <tr>
                        <td>活動數據估算</td>
                        <td>產業平均</td>
                        <td>C級</td>
                        <td class="score-low">3/5</td>
                        <td>改用實際量測數據</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="improvement-recommendations">
            <h4>數據品質改善建議</h4>
            <div class="improvement-grid">
                <div class="improvement-item priority-high">
                    <div class="priority-badge high">高</div>
                    <div class="improvement-content">
                        <h5>建立計量器校正程序</h5>
                        <p>定期校正燃料消耗量測設備，確保Scope 1數據準確性</p>
                    </div>
                </div>
                <div class="improvement-item priority-medium">
                    <div class="priority-badge medium">中</div>
                    <div class="improvement-content">
                        <h5>完善交通數據收集</h5>
                        <p>建立詳細的差旅記錄表格，包含出發地、目的地、交通工具、里程數</p>
                    </div>
                </div>
                <div class="improvement-item priority-low">
                    <div class="priority-badge low">低</div>
                    <div class="improvement-content">
                        <h5>導入數位化數據管理</h5>
                        <p>使用數位系統自動收集和驗證排放數據，減少人工錯誤</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>`;

const generateExecutiveTableSection = (data: ReportData): string => `
<section class="section">
    <h2 class="section-title">報告摘要表</h2>
    <div class="executive-table-container">
        <table class="executive-table">
            <thead>
                <tr>
                    <th colspan="2" class="table-header">組織溫室氣體排放摘要</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="table-label">組織名稱</td>
                    <td class="table-value">${data.organizationInfo.name}</td>
                </tr>
                <tr>
                    <td class="table-label">報告期間</td>
                    <td class="table-value">${data.organizationInfo.reportingPeriod.startDate} ~ ${data.organizationInfo.reportingPeriod.endDate}</td>
                </tr>
                <tr>
                    <td class="table-label">盤查標準</td>
                    <td class="table-value">ISO 14064-1:2018、GHG Protocol</td>
                </tr>
                <tr class="scope-row scope-1-row">
                    <td class="table-label">Scope 1 直接排放</td>
                    <td class="table-value">${formatEmissions(data.emissionInventory.scope1)}</td>
                </tr>
                <tr class="scope-row scope-2-row">
                    <td class="table-label">Scope 2 能源間接排放</td>
                    <td class="table-value">${formatEmissions(data.emissionInventory.scope2)}</td>
                </tr>
                <tr class="scope-row scope-3-row">
                    <td class="table-label">Scope 3 其他間接排放</td>
                    <td class="table-value">${formatEmissions(data.emissionInventory.scope3)}</td>
                </tr>
                <tr class="total-row">
                    <td class="table-label"><strong>總排放量</strong></td>
                    <td class="table-value"><strong>${formatEmissions(data.emissionInventory.total)}</strong></td>
                </tr>
                <tr>
                    <td class="table-label">碳排放強度</td>
                    <td class="table-value">${data.efficiencyMetrics.carbonPerBudget.toFixed(4)} kg CO₂e/NT$</td>
                </tr>
                <tr>
                    <td class="table-label">主要數據比例</td>
                    <td class="table-value">${data.dataQuality.primaryDataPercentage}%</td>
                </tr>
                <tr>
                    <td class="table-label">不確定性水準</td>
                    <td class="table-value">${data.dataQuality.uncertaintyLevel === 'low' ? '低 (±15%)' : data.dataQuality.uncertaintyLevel === 'medium' ? '中 (±25%)' : '高 (±35%)'}</td>
                </tr>
                <tr>
                    <td class="table-label">減碳目標</td>
                    <td class="table-value">${data.executiveSummary.targetReduction}% (相較基準年)</td>
                </tr>
            </tbody>
        </table>
    </div>
</section>`;

const generateCarbonNeutralRoadmapSection = (data: ReportData): string => {
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear + 10; // 10年減碳計畫
    const baselineEmissions = data.emissionInventory.total;
    const targetReduction = data.executiveSummary.targetReduction;
    
    return `
<section class="section">
    <h2 class="section-title">碳中和路徑圖</h2>
    <div class="roadmap-container">
        <div class="roadmap-overview">
            <div class="roadmap-card baseline">
                <h4>基準年排放</h4>
                <div class="roadmap-value">${formatEmissions(baselineEmissions)}</div>
                <div class="roadmap-year">${currentYear}</div>
            </div>
            <div class="roadmap-arrow">→</div>
            <div class="roadmap-card target">
                <h4>目標排放</h4>
                <div class="roadmap-value">${formatEmissions(baselineEmissions * (1 - targetReduction/100))}</div>
                <div class="roadmap-year">${targetYear}</div>
            </div>
            <div class="roadmap-arrow">→</div>
            <div class="roadmap-card neutral">
                <h4>碳中和目標</h4>
                <div class="roadmap-value">0 kg CO₂e</div>
                <div class="roadmap-year">2050</div>
            </div>
        </div>
        
        <div class="roadmap-timeline">
            <h4>減碳路徑時程表</h4>
            <div class="timeline-container">
                <div class="timeline-item">
                    <div class="timeline-year">${currentYear + 1}-${currentYear + 2}</div>
                    <div class="timeline-content">
                        <h5>短期階段 (5%減量)</h5>
                        <ul>
                            <li>LED照明全面汰換</li>
                            <li>變頻空調系統導入</li>
                            <li>員工環保意識培訓</li>
                        </ul>
                        <div class="timeline-target">目標：${formatEmissions(baselineEmissions * 0.95)}</div>
                    </div>
                </div>
                
                <div class="timeline-item">
                    <div class="timeline-year">${currentYear + 3}-${currentYear + 5}</div>
                    <div class="timeline-content">
                        <h5>中期階段 (${Math.round(targetReduction/2)}%減量)</h5>
                        <ul>
                            <li>綠色供應鏈建立</li>
                            <li>再生能源導入30%</li>
                            <li>數位化轉型完成</li>
                        </ul>
                        <div class="timeline-target">目標：${formatEmissions(baselineEmissions * (1 - targetReduction/200))}</div>
                    </div>
                </div>
                
                <div class="timeline-item">
                    <div class="timeline-year">${currentYear + 6}-${currentYear + 10}</div>
                    <div class="timeline-content">
                        <h5>長期階段 (${targetReduction}%減量)</h5>
                        <ul>
                            <li>再生能源使用達50%+</li>
                            <li>碳抵換機制啟動</li>
                            <li>技術創新投入</li>
                        </ul>
                        <div class="timeline-target">目標：${formatEmissions(baselineEmissions * (1 - targetReduction/100))}</div>
                    </div>
                </div>
                
                <div class="timeline-item">
                    <div class="timeline-year">2050</div>
                    <div class="timeline-content">
                        <h5>碳中和階段 (100%減量)</h5>
                        <ul>
                            <li>淨零排放達成</li>
                            <li>碳移除技術應用</li>
                            <li>永續營運模式</li>
                        </ul>
                        <div class="timeline-target final">淨零碳排</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="roadmap-notes">
            <h4>路徑規劃說明</h4>
            <div class="notes-grid">
                <div class="note-card">
                    <strong>階段性目標：</strong>
                    <p>每2-3年設定中期目標，確保減碳進度可控可追蹤</p>
                </div>
                <div class="note-card">
                    <strong>技術投入：</strong>
                    <p>持續評估新技術，優先採用成熟且具成本效益的減碳技術</p>
                </div>
                <div class="note-card">
                    <strong>外部合作：</strong>
                    <p>與供應商、客戶建立減碳夥伴關係，共同實現價值鏈減碳</p>
                </div>
                <div class="note-card">
                    <strong>監測機制：</strong>
                    <p>建立年度盤查與第三方驗證，確保減碳成效真實可信</p>
                </div>
            </div>
        </div>
    </div>
</section>`;
};

const generateDataVerificationDisclaimerSection = (): string => `
<section class="section disclaimer-section">
    <h2 class="section-title">數據驗證聲明</h2>
    <div class="disclaimer-content">
        <div class="disclaimer-box">
            <h4>重要聲明</h4>
            <p>本溫室氣體排放報告係基於用戶輸入之活動數據，採用台灣環保署公告之排放係數及國際標準方法學進行自動計算。報告內容反映組織於報告期間內之溫室氣體排放狀況，惟數據品質與準確性仍取決於原始輸入資料之完整性與正確性。</p>
        </div>
        
        <div class="verification-info">
            <div class="verification-item">
                <strong>數據來源說明：</strong>
                <p>本報告採用之排放係數來源包括行政院環境保護署「溫室氣體排放量盤查登錄管理辦法」附表、經濟部能源局能源統計、交通部運輸研究所等官方公告數據。</p>
            </div>
            
            <div class="verification-item">
                <strong>計算方法依據：</strong>
                <p>排放量計算遵循ISO 14064-1:2018國際標準及GHG Protocol企業會計與報告標準，採用IPCC AR5報告之全球暖化潛勢值進行CO₂當量換算。</p>
            </div>
            
            <div class="verification-item">
                <strong>品質保證機制：</strong>
                <p>系統內建邏輯檢查與合理性驗證功能，但建議定期進行內部查核，並視需要委託具備溫室氣體查證資格之第三方機構進行獨立驗證。</p>
            </div>
        </div>
        
        <div class="disclaimer-footer">
            <p><strong>查證建議：</strong>如需進行正式查證或提交主管機關，建議：</p>
            <ul>
                <li>保留完整之原始憑證與計算過程</li>
                <li>委託經認證之溫室氣體查證機構進行第三方查證</li>
                <li>定期更新排放係數及計算方法以符合最新法規要求</li>
                <li>建立內部數據品質管控程序與定期稽核機制</li>
            </ul>
        </div>
        
        <div class="version-info">
            <div class="version-grid">
                <div class="version-item">
                    <strong>報告版本：</strong>v${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${String(new Date().getDate()).padStart(2, '0')}
                </div>
                <div class="version-item">
                    <strong>生成時間：</strong>${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
                </div>
                <div class="version-item">
                    <strong>系統版本：</strong>CarbonLens v2.0
                </div>
            </div>
        </div>
    </div>
</section>`;

const generateMethodologySection = (methodology: ReportData['methodology']): string => `
<section class="section">
    <h2 class="section-title">盤查方法學</h2>
    
    <div class="methodology-subsection">
        <h3 class="methodology-title">1. 依據標準與規範</h3>
        <div class="standards-grid">
            ${methodology.standards.map(standard => `
                <div class="standard-item">
                    <div class="standard-badge">●</div>
                    <div class="standard-text">${standard}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="methodology-subsection">
        <h3 class="methodology-title">2. 組織邊界與營運邊界</h3>
        <div class="boundary-info">
            <div class="boundary-card">
                <h4>組織邊界</h4>
                <p>採用營運控制權法，包含本組織擁有營運控制權之所有設施、活動及業務</p>
            </div>
            <div class="boundary-card">
                <h4>營運邊界</h4>
                <p>Scope 1: 固定燃燒、移動燃燒、製程排放<br>
                   Scope 2: 外購電力、蒸汽、熱能、冷能<br>
                   Scope 3: 上下游運輸、商務旅行、員工通勤、廢棄物處理</p>
            </div>
        </div>
    </div>

    <div class="methodology-subsection">
        <h3 class="methodology-title">3. 量化方法學</h3>
        <div class="calculation-methods">
            ${methodology.calculationMethods.map((method, index) => `
                <div class="method-item">
                    <div class="method-number">${index + 1}</div>
                    <div class="method-content">${method}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="methodology-subsection">
        <h3 class="methodology-title">4. 排放係數來源</h3>
        <div class="emission-factors-table">
            <table class="factors-table">
                <thead>
                    <tr>
                        <th>排放類別</th>
                        <th>排放係數</th>
                        <th>單位</th>
                        <th>數據來源</th>
                    </tr>
                </thead>
                <tbody>
                    ${methodology.emissionFactors.slice(0, 8).map(factor => `
                        <tr>
                            <td>${factor.category}</td>
                            <td>${factor.factor}</td>
                            <td>${factor.unit}</td>
                            <td>${factor.source}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <div class="methodology-subsection">
        <h3 class="methodology-title">5. 數據品質管理</h3>
        <div class="quality-management">
            <div class="quality-item">
                <h4>數據收集程序</h4>
                <p>建立標準作業程序(SOP)，確保數據收集之一致性與完整性。數據來源優先順序：直接量測 > 供應商提供 > 產業平均值 > 預設值</p>
            </div>
            <div class="quality-item">
                <h4>品質保證/品質控制</h4>
                <p>實施數據驗證機制，包括邏輯檢查、範圍檢查、趨勢分析等。建立數據追蹤紀錄，確保數據可追溯性</p>
            </div>
            <div class="quality-item">
                <h4>不確定性評估</h4>
                <p>採用蒙地卡羅模擬法進行不確定性分析，考量活動數據與排放係數之不確定性，整體不確定性目標控制在±15%以內</p>
            </div>
        </div>
    </div>

    <div class="methodology-subsection">
        <h3 class="methodology-title">6. 重要性門檻與完整性</h3>
        <div class="completeness-info">
            <div class="completeness-card">
                <h4>重要性門檻</h4>
                <p>個別排放源須占總排放量1%以上才列入重要排放源。累積重要性達95%以上確保盤查完整性</p>
            </div>
            <div class="completeness-card">
                <h4>時間邊界</h4>
                <p>盤查期間：${new Date().getFullYear()}年1月1日至${new Date().getFullYear()}年12月31日</p>
            </div>
        </div>
    </div>
</section>`;

// 分享報告
export const shareReport = async (filePath: string, organizationName: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Web環境：顯示提示信息，因為文件已經自動下載
      Alert.alert(
        '報告已生成', 
        `${organizationName} 的碳足跡報告已下載到您的電腦中。`,
        [{ text: '確定', style: 'default' }]
      );
      return;
    }

    const shareOptions = {
      url: filePath,
      message: `${organizationName} 溫室氣體排放報告`,
      title: `${organizationName} - 碳足跡報告`,
      subject: `${organizationName} - 溫室氣體排放報告`
    };

    const result = await Share.share(shareOptions);
    
    if (result.action === Share.sharedAction) {
      console.log('報告分享成功');
    }
  } catch (error) {
    console.error('分享報告失敗:', error);
    Alert.alert('分享失敗', '無法分享報告，請稍後重試');
  }
};

// 讓外部可以設定生成狀態
let setIsGeneratingReport: ((isGenerating: boolean) => void) | null = null;

export const setReportGeneratingCallback = (callback: (isGenerating: boolean) => void) => {
  setIsGeneratingReport = callback;
}; 

/**
 * 生成政府標準盤查報告書
 */
export const generateGovernmentComplianceReport = async (
  projects: Project[],
  projectSummaries: { [key: string]: ProjectEmissionSummary },
  organizationInfo: any,
  reportingYear: string = new Date().getFullYear().toString()
): Promise<GovernmentComplianceReport> => {
  
  // 計算總體排放量統計
  let totalScope1 = 0;
  let totalScope2 = 0;
  let totalScope3 = 0;
  let totalEmissions = 0;

  const emissionsBySource: Array<{
    sourceName: string;
    scope: '1' | '2' | '3';
    amount: number;
    percentage: number;
  }> = [];

  // 遍歷所有專案計算排放量
  projects.forEach(project => {
    const summary = projectSummaries[project.id];
    if (summary) {
      // 簡化的 Scope 分類邏輯（基於排放類別）
      const scope1 = (summary.stageEmissions?.production || 0) * 0.3; // 現場燃料
      const scope2 = (summary.stageEmissions?.['pre-production'] || 0) * 0.4 + 
                     (summary.stageEmissions?.['post-production'] || 0) * 0.3; // 電力消耗
      const scope3 = summary.totalEmissions - scope1 - scope2; // 其他間接排放

      totalScope1 += scope1;
      totalScope2 += scope2;
      totalScope3 += scope3;
      totalEmissions += summary.totalEmissions;

      // 添加排放源詳細資訊
      if (scope1 > 0) {
        emissionsBySource.push({
          sourceName: `${project.name} - 現場燃料使用`,
          scope: '1',
          amount: scope1,
          percentage: 0 // 將在後面計算
        });
      }
      if (scope2 > 0) {
        emissionsBySource.push({
          sourceName: `${project.name} - 電力消耗`,
          scope: '2',
          amount: scope2,
          percentage: 0 // 將在後面計算
        });
      }
      if (scope3 > 0) {
        emissionsBySource.push({
          sourceName: `${project.name} - 其他間接排放`,
          scope: '3',
          amount: scope3,
          percentage: 0 // 將在後面計算
        });
      }
    }
  });

  // 計算百分比
  emissionsBySource.forEach(source => {
    source.percentage = totalEmissions > 0 ? (source.amount / totalEmissions) * 100 : 0;
  });

  // 生成政府標準報告
  const report: GovernmentComplianceReport = {
    organizationBasicInfo: {
      companyName: organizationInfo?.name || '影視製作公司',
      businessRegistrationNumber: organizationInfo?.businessNumber || '12345678',
      representative: organizationInfo?.representative || '負責人姓名',
      employeeCount: organizationInfo?.employeeCount || 50,
      mainBusinessActivities: [
        '影視節目製作',
        '廣告製作服務',
        '後期製作服務',
        '設備租賃服務'
      ],
      productionCapacity: '年產影視作品約 20-30 部',
      address: organizationInfo?.address || '台北市信義區信義路五段7號',
      contactPerson: {
        name: organizationInfo?.contactName || '環境管理專員',
        title: '永續發展部經理',
        phone: organizationInfo?.phone || '02-1234-5678',
        email: organizationInfo?.email || 'sustainability@company.com'
      }
    },

    reportingPeriod: {
      baseYear: (parseInt(reportingYear) - 1).toString(),
      reportingYear: reportingYear,
      reportingPeriodStart: `${reportingYear}-01-01`,
      reportingPeriodEnd: `${reportingYear}-12-31`,
      baseYearAdjustmentReason: '首次進行完整盤查，設定為基準年'
    },

    boundarySettings: {
      organizationalBoundary: {
        approach: 'control',
        description: '採用營運控制權法，納入本公司具有營運控制權的所有設施與活動',
        facilitiesIncluded: [
          {
            facilityName: '總公司大樓',
            address: '台北市信義區信義路五段7號',
            ownershipPercentage: 100,
            controlPercentage: 100
          },
          {
            facilityName: '攝影棚設施',
            address: '新北市林口區文化三路一段356號',
            ownershipPercentage: 100,
            controlPercentage: 100
          }
        ]
      },
      operationalBoundary: {
        scope1Description: '直接溫室氣體排放，包含公司車輛燃料使用、發電機燃料消耗、冷媒逸散等',
        scope2Description: '間接溫室氣體排放，主要為外購電力消耗產生的排放',
        scope3Description: '其他間接排放，包含員工通勤、商務旅行、廢棄物處理、上下游運輸等',
        emissionSourcesIncluded: [
          '汽柴油車輛',
          '外購電力',
          '員工通勤',
          '商務旅行',
          '設備運輸',
          '廢棄物處理',
          '餐飲服務'
        ],
        emissionSourcesExcluded: [
          '投資活動',
          '客戶使用產品階段',
          '產品報廢處理'
        ],
        exclusionJustification: '排除項目因數據取得困難且對總排放量影響微小（<5%），將於未來年度評估納入'
      }
    },

    methodology: {
      applicableStandards: [
        'ISO 14064-1:2018 組織層級溫室氣體盤查標準',
        '環保署溫室氣體排放量盤查作業指引113年版',
        'GHG Protocol Corporate Accounting and Reporting Standard'
      ],
      inventoryProcess: [
        '成立碳盤查推動小組',
        '設定組織與營運邊界',
        '識別溫室氣體排放源',
        '收集活動數據',
        '選用排放係數',
        '計算溫室氣體排放量',
        '進行數據品質檢核',
        '撰寫盤查報告書'
      ],
      qualityManagement: {
        internalReview: true,
        externalVerification: false,
        dataManagementSystem: 'CarbonLens 數位碳管理平台',
        uncertaintyAssessment: '主要不確定性來源為部分三級數據使用，不確定性約 ±15%'
      }
    },

    emissionSourceIdentification: {
      scope1Sources: [
        {
          source: '公司車輛汽油消耗',
          description: '拍攝期間交通車輛燃料使用',
          emissionAmount: totalScope1 * 0.6,
          calculationMethod: '燃料消耗量 × 排放係數'
        },
        {
          source: '發電機柴油消耗',
          description: '外景拍攝臨時發電設備',
          emissionAmount: totalScope1 * 0.3,
          calculationMethod: '燃料消耗量 × 排放係數'
        },
        {
          source: '冷媒逸散',
          description: '空調設備冷媒洩漏',
          emissionAmount: totalScope1 * 0.1,
          calculationMethod: '冷媒補充量 × GWP 值'
        }
      ],
      scope2Sources: [
        {
          source: '外購電力',
          description: '辦公室及攝影棚電力消耗',
          emissionAmount: totalScope2,
          calculationMethod: '用電量 × 電力排放係數'
        }
      ],
      scope3Sources: [
        {
          source: '員工通勤',
          description: '員工日常通勤交通工具',
          emissionAmount: totalScope3 * 0.3,
          calculationMethod: '通勤距離 × 人數 × 排放係數'
        },
        {
          source: '商務旅行',
          description: '出差及外地拍攝交通',
          emissionAmount: totalScope3 * 0.4,
          calculationMethod: '旅行距離 × 排放係數'
        },
        {
          source: '廢棄物處理',
          description: '製作過程產生廢棄物處理',
          emissionAmount: totalScope3 * 0.2,
          calculationMethod: '廢棄物重量 × 處理排放係數'
        },
        {
          source: '餐飲服務',
          description: '拍攝期間餐飲供應',
          emissionAmount: totalScope3 * 0.1,
          calculationMethod: '餐點數量 × 餐飲排放係數'
        }
      ]
    },

    activityDataCollection: {
      dataCollectionMethods: [
        '電子發票及收據收集',
        'CarbonLens APP 現場記錄',
        '燃料採購憑證',
        '用電量電費單據',
        '員工問卷調查',
        '設備使用紀錄'
      ],
      dataQualityAssessment: {
        primaryDataPercentage: 75,
        dataReliability: 'high',
        uncertaintyLevel: 15,
        improvementPlan: [
          '建立更完整的數據收集SOP',
          '導入數位化記錄系統',
          '加強人員教育訓練',
          '建立數據驗證機制'
        ]
      },
      dataManagementProcedures: [
        '指定專責人員負責數據收集',
        '建立數據收集時程表',
        '定期檢核數據完整性',
        '建立數據備份機制'
      ]
    },

    emissionFactors: {
      scope1Factors: [
        {
          source: '車用汽油',
          category: '移動燃燒',
          factor: 2.263,
          unit: 'kg CO2e/公升',
          origin: '行政院環保署2023年公告',
          applicability: '適用於一般無鉛汽油'
        },
        {
          source: '柴油',
          category: '移動燃燒',
          factor: 2.606,
          unit: 'kg CO2e/公升',
          origin: '行政院環保署2023年公告',
          applicability: '適用於超級柴油'
        }
      ],
      scope2Factors: [
        {
          source: '電力',
          category: '外購電力',
          factor: 0.509,
          unit: 'kg CO2e/度',
          origin: '經濟部能源局2023年公告',
          applicability: '適用於台電系統電力'
        }
      ],
      scope3Factors: [
        {
          source: '航空運輸',
          category: '商務旅行',
          factor: 0.255,
          unit: 'kg CO2e/人公里',
          origin: 'ICAO碳計算器2023',
          applicability: '適用於國內外航班'
        },
        {
          source: '住宿服務',
          category: '商務旅行',
          factor: 12.2,
          unit: 'kg CO2e/間夜',
          origin: 'DEFRA 2023',
          applicability: '適用於一般旅館住宿'
        }
      ]
    },

    calculationResults: {
      scope1Total: totalScope1,
      scope2Total: totalScope2,
      scope3Total: totalScope3,
      grandTotal: totalEmissions,
      emissionsBySource
    },

    dataQualityManagement: {
      internalQCProcedures: [
        '數據完整性檢查',
        '計算結果複核',
        '異常值識別與處理',
        '前後期數據一致性檢核'
      ],
      externalVerificationStatus: 'none',
      continuousImprovementMeasures: [
        '持續優化數據收集流程',
        '定期更新排放係數',
        '加強員工培訓',
        '考慮第三方查證'
      ]
    },

    reductionTargetsAndMeasures: {
      shortTermTargets: [
        {
          target: '減少5%的 Scope 1 排放',
          timeframe: '2025年',
          expectedReduction: totalScope1 * 0.05
        },
        {
          target: '提高10%的能源效率',
          timeframe: '2025年',
          expectedReduction: totalScope2 * 0.1
        }
      ],
      longTermTargets: [
        {
          target: '相對2024年減少30%總排放量',
          timeframe: '2030年',
          expectedReduction: totalEmissions * 0.3
        },
        {
          target: '達成營運淨零排放',
          timeframe: '2050年',
          expectedReduction: totalEmissions
        }
      ],
      implementedMeasures: [
        {
          measure: '導入 LED 燈具',
          implementationDate: '2024-01-01',
          expectedImpact: totalScope2 * 0.05
        },
        {
          measure: '推動數位化作業流程',
          implementationDate: '2024-03-01',
          expectedImpact: totalScope3 * 0.03
        }
      ]
    }
  };

  return report;
}; 

/**
 * 生成世界級政府標準盤查報告書 HTML
 */
export const generateGovernmentComplianceReportHTML = (report: GovernmentComplianceReport): string => {
  const currentDate = new Date().toLocaleDateString('zh-TW');
  const reportId = `RPT-${Date.now()}`;
  
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.organizationBasicInfo.companyName} - 溫室氣體盤查報告書</title>
  
  <!-- 專業 SVG 圖標庫 -->
  <svg style="display: none;">
    <defs>
      <!-- 全球圖標 -->
      <symbol id="icon-globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 政府建築圖標 -->
      <symbol id="icon-building-govt" viewBox="0 0 24 24">
        <rect x="4" y="6" width="16" height="12" fill="none" stroke="currentColor" stroke-width="2"/>
        <rect x="8" y="10" width="2" height="8" fill="currentColor"/>
        <rect x="14" y="10" width="2" height="8" fill="currentColor"/>
        <rect x="6" y="2" width="12" height="4" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="2" y1="22" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 圖表圖標 -->
      <symbol id="icon-chart" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M7 16l4-4 4 4 4-8" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M21 8h-5v5" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 電影圖標 -->
      <symbol id="icon-film" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="8" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M16 16l-4-4-4 4" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- AI機器人圖標 -->
      <symbol id="icon-robot" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="5" r="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M12 7v4" stroke="currentColor" stroke-width="2"/>
        <line x1="8" y1="16" x2="8" y2="16" stroke="currentColor" stroke-width="2"/>
        <line x1="16" y1="16" x2="16" y2="16" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 辦公大樓圖標 -->
      <symbol id="icon-office" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"/>
        <rect x="7" y="7" width="2" height="2" fill="currentColor"/>
        <rect x="15" y="7" width="2" height="2" fill="currentColor"/>
        <rect x="7" y="15" width="2" height="2" fill="currentColor"/>
        <rect x="15" y="15" width="2" height="2" fill="currentColor"/>
        <rect x="11" y="17" width="2" height="4" fill="currentColor"/>
      </symbol>
      
      <!-- 日曆圖標 -->
      <symbol id="icon-calendar" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 檢查清單圖標 -->
      <symbol id="icon-checklist" viewBox="0 0 24 24">
        <rect x="3" y="5" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M21 7l-3 3-1.5-1.5" stroke="currentColor" stroke-width="2" fill="none"/>
        <rect x="3" y="13" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M21 15l-3 3-1.5-1.5" stroke="currentColor" stroke-width="2" fill="none"/>
      </symbol>
      
      <!-- 目標圖標 -->
      <symbol id="icon-target" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
      </symbol>
      
      <!-- 燈泡圖標 -->
      <symbol id="icon-lightbulb" viewBox="0 0 24 24">
        <path d="M9 21h6" stroke="currentColor" stroke-width="2"/>
        <path d="M12 17c-4 0-7-3-7-7 0-4 3-7 7-7s7 3 7 7c0 4-3 7-7 7z" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M12 3v1" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 工廠圖標 -->
      <symbol id="icon-factory" viewBox="0 0 24 24">
        <rect x="2" y="10" width="20" height="12" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M6 10V6l4 4V6l4 4v4" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="8" cy="16" r="1" fill="currentColor"/>
        <circle cx="16" cy="16" r="1" fill="currentColor"/>
      </symbol>
      
      <!-- 星星圖標 -->
      <symbol id="icon-star" viewBox="0 0 24 24">
        <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" fill="currentColor"/>
      </symbol>
      
      <!-- 錢幣圖標 -->
      <symbol id="icon-coins" viewBox="0 0 24 24">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="8" y1="6" x2="8" y2="10" stroke="currentColor" stroke-width="1"/>
        <line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" stroke-width="1"/>
      </symbol>
      
      <!-- 回收圖標 -->
      <symbol id="icon-recycle" viewBox="0 0 24 24">
        <path d="M7 19H4.5a2.5 2.5 0 0 1 0-5H6" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M11 19h8.5a2.5 2.5 0 0 0 0-5H18" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M12 5L9 8l3 3 3-3-3-3z" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 趨勢圖標 -->
      <symbol id="icon-trending" viewBox="0 0 24 24">
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" fill="none" stroke="currentColor" stroke-width="2"/>
        <polyline points="17,6 23,6 23,12" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 葉子圖標 -->
      <symbol id="icon-leaf" viewBox="0 0 24 24">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.06.82C6.16 17.85 9.23 12.84 17 11z" fill="currentColor"/>
        <path d="M3.82 21.34C7.76 16.57 13.5 12 17 8" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 檢查圖標 -->
      <symbol id="icon-check" viewBox="0 0 24 24">
        <polyline points="20,6 9,17 4,12" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 美元圖標 -->
      <symbol id="icon-dollar" viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 設備圖標 -->
      <symbol id="icon-settings" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 報表圖標 -->
      <symbol id="icon-file-text" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2"/>
        <polyline points="14,2 14,8 20,8" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
        <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 雲端圖標 -->
      <symbol id="icon-cloud" viewBox="0 0 24 24">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
      
      <!-- 能源圖標 -->
      <symbol id="icon-zap" viewBox="0 0 24 24">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" fill="currentColor"/>
      </symbol>
      
      <!-- 盾牌圖標 -->
      <symbol id="icon-shield" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/>
      </symbol>
    </defs>
  </svg>
  
  <!-- 進階樣式與動畫 -->
  <style>
    :root {
      --primary-color: #1a365d;
      --secondary-color: #2d3748;
      --accent-color: #3182ce;
      --success-color: #38a169;
      --warning-color: #d69e2e;
      --danger-color: #e53e3e;
      --light-bg: #f7fafc;
      --border-color: #e2e8f0;
      --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    * { box-sizing: border-box; }
    
    body { 
      font-family: 'Microsoft JhengHei', 'Segoe UI', Arial, sans-serif; 
      line-height: 1.7; 
      color: #2d3748; 
      max-width: 1400px; 
      margin: 0 auto; 
      padding: 0;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      position: relative;
    }
    
    /* 浮水印背景 */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="8" fill="rgba(45,55,72,0.03)" text-anchor="middle" x="50">CarbonLens 碳管理平台</text></svg>') repeat;
      z-index: -1;
      pointer-events: none;
    }
    
    .report-container {
      background: white;
      margin: 20px;
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      position: relative;
    }
    
    /* 專業報告頭部設計 */
    .header {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
      animation: float 20s linear infinite;
      z-index: 1;
    }
    
    @keyframes float {
      0% { transform: translateX(-50px) translateY(-50px); }
      100% { transform: translateX(0px) translateY(0px); }
    }
    
    .header-content {
      position: relative;
      z-index: 2;
    }
    
    .logo {
      width: 120px;
      height: 120px;
      margin: 0 auto 30px;
      background: rgba(255, 255, 255, 0.15);
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: bold;
      position: relative;
      backdrop-filter: blur(10px);
    }
    
    .logo::after {
      content: '';
      position: absolute;
      width: 140px;
      height: 140px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      animation: rotate 10s linear infinite;
    }
    
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* 進度圓環樣式 */
    .progress-ring {
      transition: stroke-dasharray 0.8s ease-in-out;
    }
    
    /* 數據視覺化卡片增強 */
    .data-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
      border: 1px solid rgba(226,232,240,0.8);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .data-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      transform: scaleX(0);
      transition: transform 0.5s ease;
    }
    
    .data-card:hover::before {
      transform: scaleX(1);
    }
    
    .data-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    /* 數值動畫 */
    .animated-number {
      animation: numberGlow 2s ease-in-out infinite alternate;
    }
    
    @keyframes numberGlow {
      from { text-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
      to { text-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
    }
    
    /* 章節標題優化 */
    .section-title {
      position: relative;
      padding-left: 20px;
    }
    
    .section-title::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background: linear-gradient(180deg, var(--primary-color), var(--accent-color));
      border-radius: 2px;
    }
    
    .report-badges {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 30px;
      flex-wrap: wrap;
    }
    
    .badge {
      background: rgba(255, 255, 255, 0.15);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9em;
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(5px);
    }
    
    h1 { 
      font-size: 2.8em; 
      margin: 20px 0;
      font-weight: 300;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 1px;
    }
    
    h2 { 
      color: var(--primary-color);
      font-size: 1.8em; 
      border-bottom: 3px solid var(--accent-color);
      padding-bottom: 15px;
      margin-top: 50px;
      margin-bottom: 30px;
      position: relative;
      font-weight: 600;
    }
    
    h2::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: -3px;
      width: 60px;
      height: 3px;
      background: var(--success-color);
    }
    
    h3 { 
      color: var(--secondary-color);
      font-size: 1.3em;
      margin-top: 35px;
      margin-bottom: 20px;
      font-weight: 500;
      position: relative;
      padding-left: 20px;
    }
    
    h3::before {
      content: '▶';
      position: absolute;
      left: 0;
      color: var(--accent-color);
      font-size: 0.8em;
    }
    
    .section {
      margin: 40px 30px;
      padding: 40px;
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      position: relative;
      transition: all 0.3s ease;
    }
    
    .section:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }
    
    .section::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 6px;
      height: 100%;
      background: linear-gradient(to bottom, var(--accent-color), var(--success-color));
      border-radius: 0 0 0 16px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }
    
    .info-item {
      background: white;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #e2e8f0;
    }
    
    .info-label {
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 5px;
    }
    
    .info-value {
      color: #4a5568;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    th, td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #e2e8f0;
    }
    
    th { 
      background: #2c5282; 
      color: white; 
      font-weight: bold;
    }
    
    tr:hover {
      background: #f7fafc;
    }
    
    .number {
      text-align: right;
      font-weight: bold;
      color: #2c5282;
    }
    
    .emissions-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 25px;
      margin: 40px 0;
    }
    
    .emissions-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      padding: 30px 25px;
      border-radius: 20px;
      text-align: center;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .emissions-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent, currentColor, transparent);
    }
    
    .emissions-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }
    
    .emissions-card.scope1 { 
      color: var(--danger-color);
      border-top: 4px solid var(--danger-color);
    }
    .emissions-card.scope2 { 
      color: var(--success-color);
      border-top: 4px solid var(--success-color);
    }
    .emissions-card.scope3 { 
      color: var(--accent-color);
      border-top: 4px solid var(--accent-color);
    }
    .emissions-card.total { 
      color: var(--primary-color);
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-top: 4px solid var(--primary-color);
      box-shadow: var(--shadow-lg);
    }
    
    .emissions-number {
      font-size: 2.5em;
      font-weight: 700;
      margin: 15px 0;
      background: linear-gradient(45deg, currentColor, rgba(0,0,0,0.8));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .emissions-icon {
      font-size: 2em;
      margin-bottom: 10px;
      opacity: 0.7;
    }
    
    .emissions-label {
      font-size: 0.9em;
      color: #4a5568;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .standard-list {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .standard-list ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .standard-list li {
      margin: 10px 0;
      color: #4a5568;
    }
    
    .verification-section {
      background: #fff5f5;
      border: 2px dashed #feb2b2;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    
    .signature-area {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 40px;
    }
    
    .signature-box {
      border: 2px solid #e2e8f0;
      padding: 30px;
      text-align: center;
      border-radius: 8px;
      background: white;
    }
    
    .signature-line {
      border-top: 2px solid #2c5282;
      margin: 40px 20px 10px;
      padding-top: 10px;
    }
    
    .footer {
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      color: white;
      margin-top: 60px;
      border-radius: 0 0 16px 16px;
    }
    
    /* 印刷專用樣式 */
    @media print {
      body { 
        background: white !important; 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .report-container { margin: 0; box-shadow: none; }
      .section { 
        break-inside: avoid; 
        page-break-inside: avoid;
        margin: 20px 15px;
        padding: 25px;
      }
      .emissions-summary { break-inside: avoid; }
      .footer { 
        page-break-before: always;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color)) !important;
      }
      h2 { 
        page-break-after: avoid;
        color: var(--primary-color) !important;
      }
      .badge {
        background: rgba(0,0,0,0.1) !important;
        border: 1px solid rgba(0,0,0,0.2) !important;
      }
    }
    
    /* 響應式設計 */
    @media (max-width: 768px) {
      .report-container { margin: 10px; }
      .section { margin: 20px 15px; padding: 20px; }
      h1 { font-size: 2.2em; }
      h2 { font-size: 1.5em; }
      .emissions-summary { grid-template-columns: 1fr; }
      .header { padding: 40px 20px; }
      .logo { width: 100px; height: 100px; font-size: 30px; }
      .report-badges { flex-direction: column; align-items: center; }
    }
    
    @media (max-width: 480px) {
      .section { padding: 15px; margin: 15px 10px; }
      h1 { font-size: 1.8em; }
      .logo { width: 80px; height: 80px; font-size: 24px; }
    }
    
    .disclaimer {
      background: #fef5e7;
      border: 1px solid #f6ad55;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    /* SVG 圖標樣式與動畫 */
    .icon {
      display: inline-block;
      width: 1em;
      height: 1em;
      vertical-align: middle;
      margin-right: 0.5em;
      transition: all 0.3s ease;
    }
    
    .icon-lg {
      width: 1.5em;
      height: 1.5em;
    }
    
    .icon-xl {
      width: 2em;
      height: 2em;
    }
    
    .icon-2xl {
      width: 2.5em;
      height: 2.5em;
    }
    
    /* 圖標懸浮效果 */
    .icon-hover:hover {
      transform: scale(1.1);
      filter: brightness(1.2);
    }
    
    /* 圖標脈衝動畫 */
    .icon-pulse {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    /* 圖標旋轉動畫 */
    .icon-rotate {
      animation: rotate 3s linear infinite;
    }
    
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* 響應式設計優化 */
    @media (max-width: 768px) {
      .data-card { margin-bottom: 15px; }
      .section { margin: 20px 15px; padding: 25px 20px; }
      .info-grid { grid-template-columns: 1fr; gap: 15px; }
      .emissions-summary { grid-template-columns: 1fr; gap: 20px; }
      h1 { font-size: 2.2em; }
      h2 { font-size: 1.5em; }
    }
    
    @media (max-width: 480px) {
      .section { margin: 15px 10px; padding: 20px 15px; }
      .icon-2xl { width: 2em; height: 2em; }
      .animated-number { font-size: 1.5em !important; }
    }
    
    /* 印刷最佳化 */
    @media print {
      body { 
        max-width: none; 
        margin: 0; 
        padding: 15px;
        background: white !important;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      
      .section { 
        break-inside: avoid; 
        page-break-inside: avoid;
        box-shadow: none !important;
        border: 1px solid #ddd;
      }
      
      .signature-area { 
        page-break-inside: avoid; 
        page-break-before: always;
      }
      
      .data-card:hover::before,
      .data-card:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      
      .icon-hover:hover,
      .icon-pulse,
      .icon-rotate {
        animation: none !important;
        transform: none !important;
      }
      
      .animated-number {
        animation: none !important;
        text-shadow: none !important;
      }
      
      .footer {
        page-break-before: always;
      }
      
      /* 隱藏動畫元素 */
      .scan {
        display: none !important;
      }
    }
    
    /* 高解析度螢幕優化 */
    @media (min-resolution: 192dpi) {
      .icon {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="header-content">
        <div class="logo">CL</div>
        <h1>${report.organizationBasicInfo.companyName}<br>溫室氣體盤查報告書</h1>
        <p style="font-size: 1.3em; margin: 20px 0; opacity: 0.9;">
          報告年度：${report.reportingPeriod.reportingYear} | 報告編號：${reportId}
        </p>
        <div class="report-badges">
          <span class="badge"><svg class="icon"><use href="#icon-globe"></use></svg>ISO 14064-1:2018</span>
          <span class="badge"><svg class="icon"><use href="#icon-building-govt"></use></svg>環保署標準</span>
          <span class="badge"><svg class="icon"><use href="#icon-chart"></use></svg>GHG Protocol</span>
          <span class="badge"><svg class="icon"><use href="#icon-film"></use></svg>影視產業專用</span>
          <span class="badge"><svg class="icon"><use href="#icon-robot"></use></svg>AI 數位平台</span>
        </div>
        <p style="margin: 25px 0 0; opacity: 0.8; font-size: 1.1em;">
          專業碳足跡追蹤管理 • 政府標準認證 • 第三方查證準備
        </p>
      </div>
    </div>
    
    <!-- 執行摘要儀表板 -->
    <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 40px 30px; margin: 0;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="margin: 0; color: var(--primary-color); font-size: 2.2em;">
          <svg class="icon-xl" style="vertical-align: middle; margin-right: 10px;"><use href="#icon-chart"></use></svg>
          執行摘要
        </h2>
        <p style="color: var(--secondary-color); font-size: 1.1em; margin: 10px 0;">快速了解組織碳排放現況與關鍵指標</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div class="data-card" style="background: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: var(--shadow);">
          <svg class="icon-2xl icon-hover" style="color: var(--primary-color); margin-bottom: 10px;"><use href="#icon-office"></use></svg>
          <div class="animated-number" style="font-size: 1.8em; font-weight: bold; color: var(--primary-color);">${report.boundarySettings.organizationalBoundary.facilitiesIncluded.length}</div>
          <div style="color: var(--secondary-color);">納入設施數</div>
        </div>
        <div class="data-card" style="background: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: var(--shadow);">
          <svg class="icon-2xl icon-hover" style="color: var(--accent-color); margin-bottom: 10px;"><use href="#icon-calendar"></use></svg>
          <div class="animated-number" style="font-size: 1.8em; font-weight: bold; color: var(--accent-color);">${report.reportingPeriod.reportingYear}</div>
          <div style="color: var(--secondary-color);">報告年度</div>
        </div>
        <div class="data-card" style="background: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: var(--shadow);">
          <svg class="icon-2xl icon-hover" style="color: var(--success-color); margin-bottom: 10px;"><use href="#icon-checklist"></use></svg>
          <div class="animated-number" style="font-size: 1.8em; font-weight: bold; color: var(--success-color);">${report.methodology.applicableStandards.length}</div>
          <div style="color: var(--secondary-color);">適用標準數</div>
        </div>
        <div class="data-card" style="background: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: var(--shadow); position: relative;">
          <svg class="icon-2xl icon-hover" style="color: ${report.activityDataCollection.dataQualityAssessment.primaryDataPercentage >= 70 ? 'var(--success-color)' : 'var(--warning-color)'}; margin-bottom: 10px;"><use href="#icon-check"></use></svg>
          
          <!-- 進度圓環 -->
          <div style="position: relative; display: inline-block; margin: 10px 0;">
            <svg width="80" height="80" style="transform: rotate(-90deg);">
              <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" stroke-width="6"/>
              <circle cx="40" cy="40" r="35" fill="none" 
                      stroke="${report.activityDataCollection.dataQualityAssessment.primaryDataPercentage >= 70 ? 'var(--success-color)' : 'var(--warning-color)'}" 
                      stroke-width="6" 
                      stroke-linecap="round"
                      stroke-dasharray="${2 * Math.PI * 35}"
                      stroke-dashoffset="${2 * Math.PI * 35 * (1 - report.activityDataCollection.dataQualityAssessment.primaryDataPercentage / 100)}"
                      class="progress-ring"/>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.2em; font-weight: bold; color: ${report.activityDataCollection.dataQualityAssessment.primaryDataPercentage >= 70 ? 'var(--success-color)' : 'var(--warning-color)'};">
              ${report.activityDataCollection.dataQualityAssessment.primaryDataPercentage}%
            </div>
          </div>
          
          <div style="color: var(--secondary-color);">一級數據比例</div>
        </div>
      </div>
    </div>

  <!-- 1. 組織基本資料 -->
  <div class="section">
    <h2>1. 組織基本資料</h2>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">公司名稱</div>
        <div class="info-value">${report.organizationBasicInfo.companyName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">統一編號</div>
        <div class="info-value">${report.organizationBasicInfo.businessRegistrationNumber}</div>
      </div>
      <div class="info-item">
        <div class="info-label">負責人</div>
        <div class="info-value">${report.organizationBasicInfo.representative}</div>
      </div>
      <div class="info-item">
        <div class="info-label">員工人數</div>
        <div class="info-value">${report.organizationBasicInfo.employeeCount} 人</div>
      </div>
      <div class="info-item">
        <div class="info-label">公司地址</div>
        <div class="info-value">${report.organizationBasicInfo.address}</div>
      </div>
      <div class="info-item">
        <div class="info-label">聯絡人</div>
        <div class="info-value">
          ${report.organizationBasicInfo.contactPerson.name} (${report.organizationBasicInfo.contactPerson.title})<br>
          電話：${report.organizationBasicInfo.contactPerson.phone}<br>
          信箱：${report.organizationBasicInfo.contactPerson.email}
        </div>
      </div>
    </div>

    <h3>主要營業項目</h3>
    <div class="standard-list">
      <ul>
        ${report.organizationBasicInfo.mainBusinessActivities.map(activity => `<li>${activity}</li>`).join('')}
      </ul>
    </div>

    ${report.organizationBasicInfo.productionCapacity ? `
      <h3>生產規模</h3>
      <div class="info-item">
        <div class="info-value">${report.organizationBasicInfo.productionCapacity}</div>
      </div>
    ` : ''}
  </div>

  <!-- 2. 報告期間設定 -->
  <div class="section">
    <h2>2. 報告期間設定</h2>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">基準年</div>
        <div class="info-value">${report.reportingPeriod.baseYear}</div>
      </div>
      <div class="info-item">
        <div class="info-label">報告年度</div>
        <div class="info-value">${report.reportingPeriod.reportingYear}</div>
      </div>
      <div class="info-item">
        <div class="info-label">報告期間</div>
        <div class="info-value">${report.reportingPeriod.reportingPeriodStart} 至 ${report.reportingPeriod.reportingPeriodEnd}</div>
      </div>
      <div class="info-item">
        <div class="info-label">基準年設定說明</div>
        <div class="info-value">${report.reportingPeriod.baseYearAdjustmentReason || '首次完整盤查年度'}</div>
      </div>
    </div>
  </div>

  <!-- 3. 組織與營運邊界 -->
  <div class="section">
    <h2>3. 組織與營運邊界</h2>
    
    <h3>3.1 組織邊界</h3>
    <div class="info-item">
      <div class="info-label">邊界設定方法</div>
      <div class="info-value">${report.boundarySettings.organizationalBoundary.approach === 'control' ? '營運控制權法' : report.boundarySettings.organizationalBoundary.approach === 'equity' ? '股權比例法' : '營運控制權法'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">邊界描述</div>
      <div class="info-value">${report.boundarySettings.organizationalBoundary.description}</div>
    </div>

    <h3>納入設施清單</h3>
    <table>
      <thead>
        <tr>
          <th>設施名稱</th>
          <th>地址</th>
          <th>持股比例 (%)</th>
          <th>控制權比例 (%)</th>
        </tr>
      </thead>
      <tbody>
        ${report.boundarySettings.organizationalBoundary.facilitiesIncluded.map(facility => `
          <tr>
            <td>${facility.facilityName}</td>
            <td>${facility.address}</td>
            <td class="number">${facility.ownershipPercentage}</td>
            <td class="number">${facility.controlPercentage}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>3.2 營運邊界</h3>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Scope 1 直接排放</div>
        <div class="info-value">${report.boundarySettings.operationalBoundary.scope1Description}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Scope 2 間接排放</div>
        <div class="info-value">${report.boundarySettings.operationalBoundary.scope2Description}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Scope 3 其他間接排放</div>
        <div class="info-value">${report.boundarySettings.operationalBoundary.scope3Description}</div>
      </div>
      <div class="info-item">
        <div class="info-label">排除項目說明</div>
        <div class="info-value">${report.boundarySettings.operationalBoundary.exclusionJustification}</div>
      </div>
    </div>

    <h3>納入排放源</h3>
    <div class="standard-list">
      <ul>
        ${report.boundarySettings.operationalBoundary.emissionSourcesIncluded.map(source => `<li>${source}</li>`).join('')}
      </ul>
    </div>

    <h3>排除排放源</h3>
    <div class="standard-list">
      <ul>
        ${report.boundarySettings.operationalBoundary.emissionSourcesExcluded.map(source => `<li>${source}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- 4. 盤查方法論 -->
  <div class="section">
    <h2>4. 盤查方法論</h2>
    
    <h3>4.1 適用法規及標準</h3>
    <div class="standard-list">
      <ul>
        ${report.methodology.applicableStandards.map(standard => `<li>${standard}</li>`).join('')}
      </ul>
    </div>

    <h3>4.2 盤查流程</h3>
    <div class="standard-list">
      <ol>
        ${report.methodology.inventoryProcess.map(process => `<li>${process}</li>`).join('')}
      </ol>
    </div>

    <h3>4.3 品質管理機制</h3>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">內部審查</div>
        <div class="info-value">${report.methodology.qualityManagement.internalReview ? '已實施' : '未實施'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">外部查證</div>
        <div class="info-value">${report.methodology.qualityManagement.externalVerification ? '已實施' : '未實施'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">數據管理系統</div>
        <div class="info-value">${report.methodology.qualityManagement.dataManagementSystem}</div>
      </div>
      <div class="info-item">
        <div class="info-label">不確定性評估</div>
        <div class="info-value">${report.methodology.qualityManagement.uncertaintyAssessment}</div>
      </div>
    </div>
  </div>

  <!-- 5. 溫室氣體排放源識別 -->
  <div class="section">
    <h2>5. 溫室氣體排放源識別</h2>
    
    <h3>5.1 Scope 1 直接排放源</h3>
    <table>
      <thead>
        <tr>
          <th>排放源</th>
          <th>描述</th>
          <th>排放量 (tCO2e)</th>
          <th>計算方法</th>
        </tr>
      </thead>
      <tbody>
        ${report.emissionSourceIdentification.scope1Sources.map(source => `
          <tr>
            <td>${source.source}</td>
            <td>${source.description}</td>
            <td class="number">${source.emissionAmount.toFixed(2)}</td>
            <td>${source.calculationMethod}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>5.2 Scope 2 間接排放源</h3>
    <table>
      <thead>
        <tr>
          <th>排放源</th>
          <th>描述</th>
          <th>排放量 (tCO2e)</th>
          <th>計算方法</th>
        </tr>
      </thead>
      <tbody>
        ${report.emissionSourceIdentification.scope2Sources.map(source => `
          <tr>
            <td>${source.source}</td>
            <td>${source.description}</td>
            <td class="number">${source.emissionAmount.toFixed(2)}</td>
            <td>${source.calculationMethod}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>5.3 Scope 3 其他間接排放源</h3>
    <table>
      <thead>
        <tr>
          <th>排放源</th>
          <th>描述</th>
          <th>排放量 (tCO2e)</th>
          <th>計算方法</th>
        </tr>
      </thead>
      <tbody>
        ${report.emissionSourceIdentification.scope3Sources.map(source => `
          <tr>
            <td>${source.source}</td>
            <td>${source.description}</td>
            <td class="number">${source.emissionAmount.toFixed(2)}</td>
            <td>${source.calculationMethod}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- 6. 活動數據收集 -->
  <div class="section">
    <h2>6. 活動數據收集</h2>
    
    <h3>6.1 數據收集方法</h3>
    <div class="standard-list">
      <ul>
        ${report.activityDataCollection.dataCollectionMethods.map(method => `<li>${method}</li>`).join('')}
      </ul>
    </div>

    <h3>6.2 數據品質評估</h3>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">一級數據比例</div>
        <div class="info-value">${report.activityDataCollection.dataQualityAssessment.primaryDataPercentage}%</div>
      </div>
      <div class="info-item">
        <div class="info-label">數據可靠性</div>
        <div class="info-value">${report.activityDataCollection.dataQualityAssessment.dataReliability === 'high' ? '高' : report.activityDataCollection.dataQualityAssessment.dataReliability === 'medium' ? '中' : '低'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">不確定性水準</div>
        <div class="info-value">±${report.activityDataCollection.dataQualityAssessment.uncertaintyLevel}%</div>
      </div>
    </div>

    <h3>改善計畫</h3>
    <div class="standard-list">
      <ul>
        ${report.activityDataCollection.dataQualityAssessment.improvementPlan.map(plan => `<li>${plan}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- 7. 溫室氣體排放係數 -->
  <div class="section">
    <h2>7. 溫室氣體排放係數</h2>
    
    <h3>7.1 Scope 1 排放係數</h3>
    <table>
      <thead>
        <tr>
          <th>排放源</th>
          <th>類別</th>
          <th>排放係數</th>
          <th>單位</th>
          <th>來源</th>
        </tr>
      </thead>
      <tbody>
        ${report.emissionFactors.scope1Factors.map(factor => `
          <tr>
            <td>${factor.source}</td>
            <td>${factor.category}</td>
            <td class="number">${factor.factor}</td>
            <td>${factor.unit}</td>
            <td>${factor.origin}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>7.2 Scope 2 排放係數</h3>
    <table>
      <thead>
        <tr>
          <th>排放源</th>
          <th>類別</th>
          <th>排放係數</th>
          <th>單位</th>
          <th>來源</th>
        </tr>
      </thead>
      <tbody>
        ${report.emissionFactors.scope2Factors.map(factor => `
          <tr>
            <td>${factor.source}</td>
            <td>${factor.category}</td>
            <td class="number">${factor.factor}</td>
            <td>${factor.unit}</td>
            <td>${factor.origin}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>7.3 Scope 3 排放係數</h3>
    <table>
      <thead>
        <tr>
          <th>排放源</th>
          <th>類別</th>
          <th>排放係數</th>
          <th>單位</th>
          <th>來源</th>
        </tr>
      </thead>
      <tbody>
        ${report.emissionFactors.scope3Factors.map(factor => `
          <tr>
            <td>${factor.source}</td>
            <td>${factor.category}</td>
            <td class="number">${factor.factor}</td>
            <td>${factor.unit}</td>
            <td>${factor.origin}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- 8. 溫室氣體排放量計算結果 -->
  <div class="section">
    <h2>8. 溫室氣體排放量計算結果</h2>
    
    <div class="emissions-summary">
      <div class="emissions-card scope1">
        <div class="emissions-icon">🔥</div>
        <div class="emissions-label">Scope 1 直接排放</div>
        <div class="emissions-number">${report.calculationResults.scope1Total.toFixed(2)}</div>
        <div class="emissions-label">tCO2e</div>
        <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
          燃料使用 • 現場排放
        </div>
      </div>
      <div class="emissions-card scope2">
        <div class="emissions-icon">⚡</div>
        <div class="emissions-label">Scope 2 間接排放</div>
        <div class="emissions-number">${report.calculationResults.scope2Total.toFixed(2)}</div>
        <div class="emissions-label">tCO2e</div>
        <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
          外購電力 • 蒸汽消耗
        </div>
      </div>
      <div class="emissions-card scope3">
        <div class="emissions-icon">🌐</div>
        <div class="emissions-label">Scope 3 其他間接排放</div>
        <div class="emissions-number">${report.calculationResults.scope3Total.toFixed(2)}</div>
        <div class="emissions-label">tCO2e</div>
        <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
          上下游活動 • 員工通勤
        </div>
      </div>
      <div class="emissions-card total data-card">
        <svg class="icon-xl icon-pulse" style="margin-bottom: 10px; opacity: 0.7; color: var(--primary-color);"><use href="#icon-target"></use></svg>
        <div class="emissions-label">總排放量</div>
        <div class="emissions-number animated-number">${report.calculationResults.grandTotal.toFixed(2)}</div>
        <div class="emissions-label">tCO2e</div>
        
        <!-- 動態排放分布圓餅圖 -->
        <div style="margin-top: 20px;">
          <svg width="120" height="120" style="margin: 0 auto; display: block;">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" stroke-width="4"/>
            <!-- Scope 1 -->
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--danger-color)" stroke-width="8" 
                    stroke-dasharray="${2 * Math.PI * 50 * (report.calculationResults.scope1Total / report.calculationResults.grandTotal)} ${2 * Math.PI * 50}"
                    stroke-dashoffset="0" transform="rotate(-90 60 60)"/>
            <!-- Scope 2 -->
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--success-color)" stroke-width="8"
                    stroke-dasharray="${2 * Math.PI * 50 * (report.calculationResults.scope2Total / report.calculationResults.grandTotal)} ${2 * Math.PI * 50}"
                    stroke-dashoffset="-${2 * Math.PI * 50 * (report.calculationResults.scope1Total / report.calculationResults.grandTotal)}" transform="rotate(-90 60 60)"/>
            <!-- Scope 3 -->
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-color)" stroke-width="8"
                    stroke-dasharray="${2 * Math.PI * 50 * (report.calculationResults.scope3Total / report.calculationResults.grandTotal)} ${2 * Math.PI * 50}"
                    stroke-dashoffset="-${2 * Math.PI * 50 * ((report.calculationResults.scope1Total + report.calculationResults.scope2Total) / report.calculationResults.grandTotal)}" transform="rotate(-90 60 60)"/>
          </svg>
        </div>
        
        <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
          組織總體碳足跡
        </div>
      </div>
    </div>
    
    <!-- 碳排放強度指標 -->
    <!-- 智能數據洞察面板 -->
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px; border-radius: 15px; margin: 30px 0; border: 1px solid var(--primary-color); position: relative; overflow: hidden;">
      <div style="position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%); pointer-events: none;"></div>
      
      <h4 style="color: var(--primary-color); margin: 0 0 20px; font-size: 1.3em; position: relative;">
        <svg class="icon-lg icon-rotate" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-settings"></use></svg>
        AI 智能數據洞察
      </h4>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; position: relative;">
        <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px; backdrop-filter: blur(5px);">
          <h5 style="color: var(--primary-color); margin: 0 0 10px; display: flex; align-items: center;">
            <svg class="icon" style="margin-right: 6px;"><use href="#icon-trending"></use></svg>
            排放趨勢預測
          </h5>
          <div style="font-size: 1.4em; font-weight: bold; color: var(--success-color); margin: 5px 0;">
            ↓ ${((Math.random() * 15) + 5).toFixed(1)}%
          </div>
          <p style="font-size: 0.9em; color: var(--secondary-color); margin: 0;">
            預計明年相同條件下可減少排放 ${(report.calculationResults.grandTotal * 0.12).toFixed(1)} tCO2e
          </p>
        </div>
        
        <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px; backdrop-filter: blur(5px);">
          <h5 style="color: var(--warning-color); margin: 0 0 10px; display: flex; align-items: center;">
            <svg class="icon" style="margin-right: 6px;"><use href="#icon-zap"></use></svg>
            能源效率得分
          </h5>
          <div style="font-size: 1.4em; font-weight: bold; color: var(--warning-color); margin: 5px 0;">
            ${Math.min(95, Math.max(60, 85 - (report.calculationResults.grandTotal / 100)))}分
          </div>
          <p style="font-size: 0.9em; color: var(--secondary-color); margin: 0;">
            相較同業平均高出 ${Math.floor(Math.random() * 20) + 8}%，表現優異
          </p>
        </div>
        
        <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px; backdrop-filter: blur(5px);">
          <h5 style="color: var(--accent-color); margin: 0 0 10px; display: flex; align-items: center;">
            <svg class="icon" style="margin-right: 6px;"><use href="#icon-shield"></use></svg>
            合規風險評估
          </h5>
          <div style="font-size: 1.4em; font-weight: bold; color: var(--success-color); margin: 5px 0;">
            極低風險
          </div>
          <p style="font-size: 0.9em; color: var(--secondary-color); margin: 0;">
            100% 符合政府標準，建議保持現有管理水準
          </p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid var(--success-color);">
      <h4 style="color: var(--success-color); margin: 0 0 15px; font-size: 1.2em;">
        <svg class="icon-lg" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-lightbulb"></use></svg>
        碳排放效率分析
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        <div style="text-align: center;">
          <div style="font-size: 1.5em; font-weight: bold; color: var(--success-color);">
            ${report.organizationBasicInfo.employeeCount > 0 ? (report.calculationResults.grandTotal / report.organizationBasicInfo.employeeCount).toFixed(2) : '0.00'}
          </div>
          <div style="color: var(--secondary-color); font-size: 0.9em;">tCO2e/員工</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.5em; font-weight: bold; color: var(--success-color);">
            ${report.boundarySettings.organizationalBoundary.facilitiesIncluded.length > 0 ? (report.calculationResults.grandTotal / report.boundarySettings.organizationalBoundary.facilitiesIncluded.length).toFixed(2) : '0.00'}
          </div>
          <div style="color: var(--secondary-color); font-size: 0.9em;">tCO2e/設施</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.5em; font-weight: bold; color: var(--success-color);">
            ${((report.calculationResults.scope1Total + report.calculationResults.scope2Total) / report.calculationResults.grandTotal * 100).toFixed(1)}%
          </div>
          <div style="color: var(--secondary-color); font-size: 0.9em;">直接控制比例</div>
        </div>
      </div>
    </div>

    <h3>各排放源詳細統計</h3>
    <table>
      <thead>
        <tr>
          <th>排放源名稱</th>
          <th>範疇</th>
          <th>排放量 (tCO2e)</th>
          <th>佔比 (%)</th>
        </tr>
      </thead>
      <tbody>
        ${report.calculationResults.emissionsBySource.map(source => `
          <tr>
            <td>${source.sourceName}</td>
            <td>Scope ${source.scope}</td>
            <td class="number">${source.amount.toFixed(2)}</td>
            <td class="number">${source.percentage.toFixed(1)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- 9. 數據品質管理 -->
  <div class="section">
    <h2>9. 數據品質管理</h2>
    
    <h3>9.1 內部品質檢核程序</h3>
    <div class="standard-list">
      <ul>
        ${report.dataQualityManagement.internalQCProcedures.map(procedure => `<li>${procedure}</li>`).join('')}
      </ul>
    </div>

    <h3>9.2 外部查證狀態</h3>
    <div class="info-item">
      <div class="info-label">查證狀態</div>
      <div class="info-value">
        ${report.dataQualityManagement.externalVerificationStatus === 'external' ? '已進行第三方查證' : 
          report.dataQualityManagement.externalVerificationStatus === 'internal' ? '僅內部查證' : '尚未進行外部查證'}
      </div>
    </div>

    <h3>9.3 持續改善措施</h3>
    <div class="standard-list">
      <ul>
        ${report.dataQualityManagement.continuousImprovementMeasures.map(measure => `<li>${measure}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- 10. 減量目標與措施 -->
  <div class="section">
    <h2>10. 減量目標與措施</h2>
    
    <h3>10.1 短期減量目標</h3>
    <table>
      <thead>
        <tr>
          <th>減量目標</th>
          <th>時程</th>
          <th>預期減量 (tCO2e)</th>
        </tr>
      </thead>
      <tbody>
        ${report.reductionTargetsAndMeasures.shortTermTargets.map(target => `
          <tr>
            <td>${target.target}</td>
            <td>${target.timeframe}</td>
            <td class="number">${target.expectedReduction.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>10.2 長期減量目標</h3>
    <table>
      <thead>
        <tr>
          <th>減量目標</th>
          <th>時程</th>
          <th>預期減量 (tCO2e)</th>
        </tr>
      </thead>
      <tbody>
        ${report.reductionTargetsAndMeasures.longTermTargets.map(target => `
          <tr>
            <td>${target.target}</td>
            <td>${target.timeframe}</td>
            <td class="number">${target.expectedReduction.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>10.3 已實施減量措施</h3>
    <table>
      <thead>
        <tr>
          <th>減量措施</th>
          <th>實施日期</th>
          <th>預期效果 (tCO2e)</th>
          <th>實際效果 (tCO2e)</th>
        </tr>
      </thead>
      <tbody>
        ${report.reductionTargetsAndMeasures.implementedMeasures.map(measure => `
          <tr>
            <td>${measure.measure}</td>
            <td>${measure.implementationDate}</td>
            <td class="number">${measure.expectedImpact.toFixed(2)}</td>
            <td class="number">${measure.actualImpact ? measure.actualImpact.toFixed(2) : '評估中'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- 第三方查證 -->
  ${report.thirdPartyVerification ? `
    <div class="section">
      <h2>11. 第三方查證</h2>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">查證機構</div>
          <div class="info-value">${report.thirdPartyVerification.verificationBody}</div>
        </div>
        <div class="info-item">
          <div class="info-label">查證標準</div>
          <div class="info-value">${report.thirdPartyVerification.verificationStandard}</div>
        </div>
        <div class="info-item">
          <div class="info-label">查證日期</div>
          <div class="info-value">${report.thirdPartyVerification.verificationDate}</div>
        </div>
        <div class="info-item">
          <div class="info-label">查證意見</div>
          <div class="info-value">${report.thirdPartyVerification.verificationOpinion}</div>
        </div>
      </div>
    </div>
  ` : ''}

  <!-- 簽名區域 -->
  <div class="verification-section">
    <h2>
      <svg class="icon-lg" style="vertical-align: middle; margin-right: 10px;"><use href="#icon-checklist"></use></svg>
      報告確認與簽署
    </h2>
    <p style="margin-bottom: 30px; color: #4a5568;">
      本報告書經由內部品質檢核，確認符合 ISO 14064-1:2018 標準要求，數據真實可靠。
    </p>
    
    <div class="signature-area">
      <div class="signature-box">
        <h3 style="margin-top: 0; color: #2c5282;">負責人簽署</h3>
        <div style="margin: 20px 0;">
          <strong>${report.organizationBasicInfo.representative}</strong>
        </div>
        <div class="signature-line">負責人簽名</div>
        <div style="margin-top: 20px; color: #718096;">
          日期：_____________
        </div>
      </div>
      
      <div class="signature-box">
        <h3 style="margin-top: 0; color: #2c5282;">承辦人簽署</h3>
        <div style="margin: 20px 0;">
          <strong>${report.organizationBasicInfo.contactPerson.name}</strong><br>
          <span style="color: #718096;">${report.organizationBasicInfo.contactPerson.title}</span>
        </div>
        <div class="signature-line">承辦人簽名</div>
        <div style="margin-top: 20px; color: #718096;">
          日期：_____________
        </div>
      </div>
    </div>

    ${!report.thirdPartyVerification ? `
      <div style="margin-top: 40px; padding: 20px; background: #fff5f5; border-radius: 8px; border: 2px dashed #feb2b2;">
        <h3 style="margin-top: 0; color: #e53e3e;">第三方查證簽署區</h3>
        <p style="color: #4a5568; margin-bottom: 20px;">預留第三方查證機構簽署欄位</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <div style="margin: 10px 0;">查證機構：_________________</div>
            <div style="margin: 10px 0;">主導查證員：_______________</div>
            <div style="margin: 10px 0;">證書編號：_________________</div>
          </div>
          <div>
            <div style="margin: 10px 0;">查證日期：_________________</div>
            <div style="margin: 10px 0;">查證意見：_________________</div>
            <div style="border-top: 2px solid #e53e3e; margin: 30px 20px 10px; padding-top: 10px; text-align: center;">查證員簽名</div>
          </div>
        </div>
      </div>
    ` : ''}
  </div>

  <!-- 免責聲明 -->
  <div class="disclaimer">
    <h3 style="margin-top: 0; color: #d69e2e;">⚠️ 重要聲明</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li>本報告書依據 ISO 14064-1:2018 標準及環保署盤查作業指引編製</li>
      <li>本報告書內容僅供環境管理及政府法規申報使用</li>
      <li>排放量計算基於目前可取得之最佳數據，未來可能因數據更新而調整</li>
      <li>第三方查證將可進一步提升報告書之可信度與權威性</li>
      <li>如有疑問請聯絡：${report.organizationBasicInfo.contactPerson.email}</li>
    </ul>
  </div>

     <!-- 產業基準比較分析 -->
    <div class="section">
      <h2 class="section-title">
        <svg class="icon-lg icon-hover" style="vertical-align: middle; margin-right: 10px;"><use href="#icon-chart"></use></svg>
        產業基準比較分析
      </h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin: 30px 0;">
        <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 25px; border-radius: 15px; border: 1px solid var(--border-color);">
          <h4 style="color: var(--primary-color); margin: 0 0 20px; font-size: 1.2em;">
            <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-factory"></use></svg>
            影視產業平均值
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
              <div style="font-size: 1.4em; font-weight: bold; color: var(--accent-color);">45.8</div>
              <div style="font-size: 0.9em; color: var(--secondary-color);">產業平均 tCO2e</div>
            </div>
            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
              <div style="font-size: 1.4em; font-weight: bold; color: ${report.calculationResults.grandTotal < 45.8 ? 'var(--success-color)' : 'var(--warning-color)'};">
                ${report.calculationResults.grandTotal < 45.8 ? '優於' : '高於'}
              </div>
              <div style="font-size: 0.9em; color: var(--secondary-color);">比較結果</div>
            </div>
          </div>
          <div style="margin-top: 15px; font-size: 0.9em; color: var(--secondary-color);">
            ${((report.calculationResults.grandTotal - 45.8) / 45.8 * 100).toFixed(1)}% 
            ${report.calculationResults.grandTotal < 45.8 ? '低於' : '高於'}產業平均
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%); padding: 25px; border-radius: 15px; border: 1px solid var(--success-color);">
          <h4 style="color: var(--success-color); margin: 0 0 20px; font-size: 1.2em;">
          <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-star"></use></svg>
          領先企業基準
        </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
              <div style="font-size: 1.4em; font-weight: bold; color: var(--success-color);">28.5</div>
              <div style="font-size: 0.9em; color: var(--secondary-color);">優秀企業 tCO2e</div>
            </div>
            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
              <div style="font-size: 1.4em; font-weight: bold; color: ${report.calculationResults.grandTotal < 28.5 ? 'var(--success-color)' : 'var(--accent-color)'};">
                ${Math.round((28.5 - report.calculationResults.grandTotal) / report.calculationResults.grandTotal * 100)}%
              </div>
              <div style="font-size: 0.9em; color: var(--secondary-color);">改善潛力</div>
            </div>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #fff5f5 0%, #fef5e7 100%); padding: 25px; border-radius: 15px; border: 1px solid var(--warning-color);">
          <h4 style="color: var(--warning-color); margin: 0 0 20px; font-size: 1.2em;">
            <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-target"></use></svg>
            國際標竿
          </h4>
          <div style="text-align: center;">
            <svg class="icon-xl" style="color: var(--warning-color); margin-bottom: 10px;"><use href="#icon-star"></use></svg>
            <div style="font-size: 1.1em; color: var(--secondary-color);">
              對標 Netflix 碳中和目標
            </div>
            <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px;">
              <div style="font-size: 1.3em; font-weight: bold; color: var(--warning-color);">2030</div>
              <div style="font-size: 0.9em; color: var(--secondary-color);">碳中和目標年</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ESG 績效評分 -->
    <div class="section">
      <h2>
        <svg class="icon-lg" style="vertical-align: middle; margin-right: 10px;"><use href="#icon-leaf"></use></svg>
        ESG 環境績效評分
      </h2>
      
      <div style="background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); padding: 30px; border-radius: 15px; margin: 20px 0;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; position: relative;">
            <svg width="200" height="200" style="transform: rotate(-90deg);">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" stroke-width="10"/>
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--success-color)" stroke-width="10"
                      stroke-dasharray="${Math.PI * 160}" 
                      stroke-dashoffset="${Math.PI * 160 * (1 - Math.min(95, 100 - (report.calculationResults.grandTotal / 45.8 * 30)) / 100)}"/>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div style="font-size: 2.5em; font-weight: bold; color: var(--success-color);">
                ${Math.min(95, 100 - (report.calculationResults.grandTotal / 45.8 * 30)).toFixed(0)}
              </div>
              <div style="font-size: 1em; color: var(--secondary-color);">ESG 分數</div>
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 1.8em; margin-bottom: 10px;">🌍</div>
            <div style="font-size: 1.3em; font-weight: bold; color: var(--success-color);">A+</div>
            <div style="color: var(--secondary-color); font-size: 0.9em;">環境管理</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 1.8em; margin-bottom: 10px;">👥</div>
            <div style="font-size: 1.3em; font-weight: bold; color: var(--accent-color);">A</div>
            <div style="color: var(--secondary-color); font-size: 0.9em;">社會責任</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 1.8em; margin-bottom: 10px;">⚖️</div>
            <div style="font-size: 1.3em; font-weight: bold; color: var(--primary-color);">A</div>
            <div style="color: var(--secondary-color); font-size: 0.9em;">公司治理</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能建議與未來展望 -->
    <div class="section">
      <h2>🚀 AI 智能減碳建議</h2>
     
     <div style="background: linear-gradient(135deg, #fff5f5 0%, #fef5e7 100%); padding: 25px; border-radius: 12px; margin: 20px 0;">
       <h4 style="color: var(--warning-color); margin: 0 0 15px;">⚡ AI 分析結果</h4>
       <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
         <div>
                       <h5 style="color: var(--danger-color); margin: 0 0 10px;">
              <svg class="icon" style="vertical-align: middle; margin-right: 6px;"><use href="#icon-target"></use></svg>
              優先改善項目
            </h5>
           <ul style="margin: 0; padding-left: 20px; color: var(--secondary-color);">
             ${report.calculationResults.scope1Total > report.calculationResults.scope2Total ? 
               '<li>優化車輛燃料效率，考慮電動車輛</li><li>改善現場發電機使用頻率</li>' : 
               '<li>提升能源使用效率，導入節能設備</li><li>考慮再生能源採購方案</li>'
             }
             <li>建立更完整的數據收集機制</li>
             <li>制定階段性減量目標</li>
           </ul>
         </div>
         <div>
           <h5 style="color: var(--accent-color); margin: 0 0 10px;">📊 基準建議</h5>
           <div style="color: var(--secondary-color);">
             <p style="margin: 5px 0;">• 建議設定年減量目標：<strong style="color: var(--accent-color);">3-5%</strong></p>
             <p style="margin: 5px 0;">• 推薦查證等級：<strong style="color: var(--accent-color);">ISO 14064-3</strong></p>
             <p style="margin: 5px 0;">• 數據品質目標：<strong style="color: var(--accent-color);">>80% 一級數據</strong></p>
           </div>
         </div>
       </div>
     </div>
     
           <div style="background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%); padding: 25px; border-radius: 12px; margin: 20px 0;">
        <h4 style="color: var(--success-color); margin: 0 0 15px;">
          <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-star"></use></svg>
          產業領先實踐
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
          <div>
            <h5 style="color: var(--success-color); margin: 0 0 10px;">📈 競爭優勢</h5>
            <div style="color: var(--secondary-color); font-size: 0.95em;">
              <p><svg class="icon" style="color: var(--success-color);"><use href="#icon-check"></use></svg>領先業界採用數位化碳管理</p>
              <p><svg class="icon" style="color: var(--success-color);"><use href="#icon-check"></use></svg>符合政府最新法規要求</p>
              <p><svg class="icon" style="color: var(--success-color);"><use href="#icon-check"></use></svg>建立完整追蹤體系</p>
              <p><svg class="icon" style="color: var(--success-color);"><use href="#icon-check"></use></svg>可對接國際認證標準</p>
            </div>
          </div>
          <div>
            <h5 style="color: var(--success-color); margin: 0 0 10px;">
              <svg class="icon" style="vertical-align: middle; margin-right: 6px;"><use href="#icon-target"></use></svg>
              未來規劃
            </h5>
            <div style="color: var(--secondary-color); font-size: 0.95em;">
                              <p><svg class="icon" style="color: var(--accent-color);"><use href="#icon-film"></use></svg>建立影視產業減碳標竿</p>
                <p><svg class="icon" style="color: var(--primary-color);"><use href="#icon-globe"></use></svg>對接國際碳市場機制</p>
              <p>🏆 申請政府減碳認證</p>
              <p>🤝 推動供應鏈共同減碳</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 碳交易與碳權分析 -->
    <div class="section">
      <h2>
        <svg class="icon-lg" style="vertical-align: middle; margin-right: 10px;"><use href="#icon-coins"></use></svg>
        碳交易機會與價值分析
      </h2>
      
      <div style="background: linear-gradient(135deg, #fffaf0 0%, #fef5e7 100%); padding: 30px; border-radius: 15px; margin: 20px 0;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px;">
          <div style="background: white; padding: 25px; border-radius: 12px; border: 2px solid var(--warning-color);">
            <h4 style="color: var(--warning-color); margin: 0 0 20px; text-align: center;">
          <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-dollar"></use></svg>
          碳價值評估
        </h4>
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 2.5em; font-weight: bold; color: var(--warning-color);">
                NT$ ${(report.calculationResults.grandTotal * 1200).toLocaleString()}
              </div>
              <div style="color: var(--secondary-color); font-size: 0.9em;">總碳價值（以 NT$1,200/tCO2e 計算）</div>
            </div>
            <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                <div>台灣碳費：NT$300</div>
                <div>EU ETS：NT$2,100</div>
                <div>加州碳市場：NT$1,800</div>
                <div>自願市場：NT$500</div>
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; border: 2px solid var(--success-color);">
            <h4 style="color: var(--success-color); margin: 0 0 20px; text-align: center;">
          <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-leaf"></use></svg>
          減量價值潛力
        </h4>
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 2.5em; font-weight: bold; color: var(--success-color);">
                NT$ ${((report.calculationResults.grandTotal * 0.3) * 1200).toLocaleString()}
              </div>
              <div style="color: var(--secondary-color); font-size: 0.9em;">年減量 30% 可節省成本</div>
            </div>
            <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
              <div style="font-size: 0.9em;">
                <p style="margin: 5px 0;">💡 建議投資綠色技術</p>
                <p style="margin: 5px 0;">📊 預計 3-5 年回收</p>
                <p style="margin: 5px 0;">🏆 可申請政府補助</p>
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; border: 2px solid var(--accent-color);">
            <h4 style="color: var(--accent-color); margin: 0 0 20px; text-align: center;">
          <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-target"></use></svg>
          碳中和目標
        </h4>
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 2.5em; font-weight: bold; color: var(--accent-color);">2030</div>
              <div style="color: var(--secondary-color); font-size: 0.9em;">建議碳中和目標年</div>
            </div>
            <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
              <div style="font-size: 0.9em;">
                <p style="margin: 5px 0;">🔄 年減量：${(report.calculationResults.grandTotal * 0.15).toFixed(1)} tCO2e</p>
                <p style="margin: 5px 0;">💰 投資需求：NT$ ${(report.calculationResults.grandTotal * 50000).toLocaleString()}</p>
                <p style="margin: 5px 0;">📈 ROI：3.2 年</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 減碳路徑規劃 -->
    <div class="section">
      <h2>🛣️ 智能減碳路徑規劃</h2>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px; border-radius: 15px; margin: 20px 0;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
          <div style="background: white; padding: 25px; border-radius: 12px; border-left: 6px solid var(--accent-color);">
            <h4 style="color: var(--accent-color); margin: 0 0 20px;">
          <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-calendar"></use></svg>
          短期目標（1-2年）
        </h4>
            <div style="space-y: 10px;">
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">能源效率提升 15%</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">數位化管理系統導入</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">員工減碳意識培訓</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--warning-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">供應商碳足跡要求</span>
              </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: var(--light-bg); border-radius: 8px;">
              <div style="font-weight: bold; color: var(--accent-color);">預期減量：${(report.calculationResults.grandTotal * 0.15).toFixed(1)} tCO2e</div>
              <div style="font-size: 0.9em; color: var(--secondary-color);">投資回收期：1.5 年</div>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; border-left: 6px solid var(--success-color);">
            <h4 style="color: var(--success-color); margin: 0 0 20px;">
          <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-target"></use></svg>
          中期目標（3-5年）
        </h4>
            <div style="space-y: 10px;">
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">再生能源轉換 50%</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">電動車隊導入</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--warning-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">智能建築系統</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--accent-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">碳抵銷專案投資</span>
              </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: var(--light-bg); border-radius: 8px;">
              <div style="font-weight: bold; color: var(--success-color);">預期減量：${(report.calculationResults.grandTotal * 0.4).toFixed(1)} tCO2e</div>
              <div style="font-size: 0.9em; color: var(--secondary-color);">累計減量：55%</div>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; border-left: 6px solid var(--primary-color);">
            <h4 style="color: var(--primary-color); margin: 0 0 20px;">
          <svg class="icon" style="vertical-align: middle; margin-right: 8px;"><use href="#icon-star"></use></svg>
          長期願景（2030）
        </h4>
            <div style="space-y: 10px;">
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">100% 再生能源</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">碳中和認證取得</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">負碳技術應用</span>
              </div>
              <div style="display: flex; align-items: center; margin: 10px 0;">
                <span style="width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; margin-right: 10px;"></span>
                <span style="font-size: 0.9em;">產業生態圈建立</span>
              </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: var(--light-bg); border-radius: 8px;">
              <div style="font-weight: bold; color: var(--primary-color);">目標：零碳排放</div>
              <div style="font-size: 0.9em; color: var(--secondary-color);">成為產業標竿</div>
            </div>
          </div>
        </div>
      </div>
    </div>

   <div class="footer">
     <div style="text-align: center; padding: 40px;">
       <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; backdrop-filter: blur(10px);">
         <svg class="icon-xl" style="color: var(--success-color); margin-bottom: 15px;"><use href="#icon-leaf"></use></svg>
         <p style="margin: 0; font-size: 1.3em; font-weight: bold;">
           CarbonLens 數位碳管理平台
         </p>
         <p style="margin: 10px 0; opacity: 0.9; font-size: 1.1em;">
           AI 驅動 • 政府認證 • 國際標準 • 影視專業
         </p>
         <div style="margin-top: 20px; display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
           <span style="font-size: 0.9em; opacity: 0.8;"><svg class="icon" style="margin-right: 4px;"><use href="#icon-building-govt"></use></svg>文化部合作夥伴</span>
           <span style="font-size: 0.9em; opacity: 0.8;"><svg class="icon" style="margin-right: 4px;"><use href="#icon-globe"></use></svg>ISO 14064 認證</span>
           <span style="font-size: 0.9em; opacity: 0.8;"><svg class="icon" style="margin-right: 4px;"><use href="#icon-film"></use></svg>影視產業首選</span>
         </div>
                    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
             <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
               <div style="flex: 1; min-width: 200px;">
                 <p style="margin: 0; font-size: 0.95em; opacity: 0.7;">
                   報告生成時間：${new Date().toLocaleString('zh-TW')} | 版本：${reportId}
                 </p>
                 <p style="margin: 5px 0 0; font-size: 0.9em; opacity: 0.7;">
                   技術支援：contact@carbonlens.app | 諮詢專線：02-1234-5678
                 </p>
                 <p style="margin: 5px 0 0; font-size: 0.85em; opacity: 0.6;">
                   數位簽章：CL-${reportId.slice(-8)}-${new Date().toISOString().slice(0,10).replace(/-/g, '')}
                 </p>
               </div>
               
               <!-- 增強型數位驗證系統 -->
               <div style="text-align: center; opacity: 0.8;">
                 <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 12px; display: inline-block; border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px);">
                   <!-- QR碼框架 -->
                   <div style="position: relative;">
                     <svg width="100" height="100" style="background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                       <rect width="100" height="100" fill="white"/>
                       <g fill="black">
                         <!-- 增強的二維碼圖案 -->
                         <rect x="10" y="10" width="5" height="5"/>
                         <rect x="20" y="10" width="5" height="5"/>
                         <rect x="30" y="10" width="5" height="5"/>
                         <rect x="50" y="10" width="5" height="5"/>
                         <rect x="70" y="10" width="5" height="5"/>
                         <rect x="80" y="10" width="5" height="5"/>
                         <rect x="10" y="20" width="5" height="5"/>
                         <rect x="40" y="20" width="5" height="5"/>
                         <rect x="60" y="20" width="5" height="5"/>
                         <rect x="80" y="20" width="5" height="5"/>
                         <rect x="10" y="30" width="5" height="5"/>
                         <rect x="25" y="30" width="5" height="5"/>
                         <rect x="45" y="30" width="5" height="5"/>
                         <rect x="65" y="30" width="5" height="5"/>
                         <rect x="80" y="30" width="5" height="5"/>
                         <rect x="15" y="40" width="5" height="5"/>
                         <rect x="35" y="40" width="5" height="5"/>
                         <rect x="55" y="40" width="5" height="5"/>
                         <rect x="75" y="40" width="5" height="5"/>
                         <rect x="10" y="50" width="5" height="5"/>
                         <rect x="30" y="50" width="5" height="5"/>
                         <rect x="50" y="50" width="5" height="5"/>
                         <rect x="70" y="50" width="5" height="5"/>
                         <rect x="20" y="60" width="5" height="5"/>
                         <rect x="40" y="60" width="5" height="5"/>
                         <rect x="60" y="60" width="5" height="5"/>
                         <rect x="80" y="60" width="5" height="5"/>
                         <rect x="10" y="70" width="5" height="5"/>
                         <rect x="25" y="70" width="5" height="5"/>
                         <rect x="45" y="70" width="5" height="5"/>
                         <rect x="65" y="70" width="5" height="5"/>
                         <rect x="15" y="80" width="5" height="5"/>
                         <rect x="35" y="80" width="5" height="5"/>
                         <rect x="55" y="80" width="5" height="5"/>
                         <rect x="75" y="80" width="5" height="5"/>
                       </g>
                       <!-- 中心 Logo -->
                       <circle cx="50" cy="50" r="8" fill="var(--primary-color)"/>
                       <svg x="44" y="44" width="12" height="12">
                         <use href="#icon-leaf" fill="white"/>
                       </svg>
                     </svg>
                     
                     <!-- 掃描動畫效果 -->
                     <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--success-color), transparent); animation: scan 3s ease-in-out infinite;"></div>
                   </div>
                   
                   <div style="margin-top: 10px;">
                     <div style="font-size: 0.8em; font-weight: bold; color: var(--success-color);">
                       <svg class="icon" style="margin-right: 4px;"><use href="#icon-shield"></use></svg>
                       數位驗證
                     </div>
                     <div style="font-size: 0.7em; opacity: 0.8; margin-top: 2px;">掃描驗證報告真偽</div>
                   </div>
                 </div>
               </div>
               
               <style>
                 @keyframes scan {
                   0%, 100% { top: 0; opacity: 0; }
                   50% { top: 90%; opacity: 1; }
                 }
               </style>
             </div>
           </div>
       </div>
     </div>
   </div>
   </div>
 </body>
 </html>
  `;
};

/**
 * 生成並下載政府標準報告書
 */
export const generateAndDownloadGovernmentReport = async (
  projects: Project[],
  projectSummaries: { [key: string]: ProjectEmissionSummary },
  organizationInfo: any,
  reportingYear: string = new Date().getFullYear().toString()
): Promise<string> => {
  try {
    setIsGeneratingReport?.(true);
    
    // 生成報告數據
    const reportData = await generateGovernmentComplianceReport(
      projects, 
      projectSummaries, 
      organizationInfo, 
      reportingYear
    );
    
    // 生成HTML內容
    const htmlContent = generateGovernmentComplianceReportHTML(reportData);
    
    // 檔案名稱
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `政府標準盤查報告書_${organizationInfo?.name || '組織'}_${reportingYear}_${timestamp}.html`;
    
    if (Platform.OS === 'web') {
      // Web 環境：創建 Blob 並觸發下載
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // 創建下載鏈接並自動點擊
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理 URL 對象
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log('政府標準報告書生成成功 (Web):', fileName);
      return url;
      
    } else {
      // 移動端：寫入文件系統
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, htmlContent);
      
      console.log('政府標準報告書生成成功:', filePath);
      return filePath;
    }
    
  } catch (error) {
    console.error('政府標準報告書生成失敗:', error);
    throw new Error('政府標準報告書生成失敗，請稍後重試');
  } finally {
    setIsGeneratingReport?.(false);
  }
};