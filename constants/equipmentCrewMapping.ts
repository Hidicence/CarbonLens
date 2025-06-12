import { FilmCrew } from '@/types/project';

// 器材對組別碳排放的影響係數
export interface EquipmentCrewImpact {
  equipmentId: string;
  equipmentName: string;
  impacts: {
    crew: FilmCrew;
    impactFactor: number; // 影響係數 (1.0 = 基準, >1.0 = 增加碳排, <1.0 = 減少碳排)
    description: string;
  }[];
}

// 器材類別對組別的基本影響
export interface EquipmentCategoryImpact {
  category: string;
  categoryName: string;
  baseImpacts: {
    crew: FilmCrew;
    impactFactor: number;
    description: string;
  }[];
}

// 器材類別影響映射
export const EQUIPMENT_CATEGORY_IMPACTS: EquipmentCategoryImpact[] = [
  {
    category: 'camera',
    categoryName: '攝影設備',
    baseImpacts: [
      {
        crew: 'camera',
        impactFactor: 1.5, // 攝影組需要更多電力和操作
        description: '攝影設備增加電力消耗和操作複雜度'
      },
      {
        crew: 'grip',
        impactFactor: 1.3, // 器材組需要更多支撐和安裝工作
        description: '需要更多器材支撐和安裝工作'
      },
      {
        crew: 'gaffer',
        impactFactor: 1.2, // 燈光師組需要配合攝影設備調整燈光
        description: '需要配合攝影設備進行燈光調整'
      }
    ]
  },
  {
    category: 'lighting',
    categoryName: '燈光設備',
    baseImpacts: [
      {
        crew: 'lighting',
        impactFactor: 1.8, // 燈光組主要負責，影響最大
        description: '燈光設備大幅增加電力消耗'
      },
      {
        crew: 'gaffer',
        impactFactor: 1.6, // 燈光師組密切相關
        description: '燈光師組需要操作和調整燈光設備'
      },
      {
        crew: 'grip',
        impactFactor: 1.4, // 器材組需要架設和移動
        description: '需要架設、移動和維護燈光器材'
      }
    ]
  },
  {
    category: 'audio',
    categoryName: '音響設備',
    baseImpacts: [
      {
        crew: 'sound',
        impactFactor: 1.6, // 收音組主要負責
        description: '音響設備增加電力消耗和操作需求'
      },
      {
        crew: 'grip',
        impactFactor: 1.1, // 器材組需要協助架設
        description: '需要協助音響設備的架設和連接'
      }
    ]
  },
  {
    category: 'transport',
    categoryName: '運輸設備',
    baseImpacts: [
      {
        crew: 'transport',
        impactFactor: 2.0, // 交通組直接負責，影響最大
        description: '運輸設備直接影響交通組的燃料消耗'
      },
      {
        crew: 'grip',
        impactFactor: 1.2, // 器材組需要協助裝卸
        description: '需要協助器材的裝卸和搬運'
      }
    ]
  },
  {
    category: 'editing',
    categoryName: '後期設備',
    baseImpacts: [
      {
        crew: 'post',
        impactFactor: 1.4, // 後期組主要使用
        description: '後期設備增加電力消耗和處理時間'
      }
    ]
  },
  {
    category: 'storage',
    categoryName: '儲存設備',
    baseImpacts: [
      {
        crew: 'post',
        impactFactor: 1.3, // 後期組主要使用
        description: '儲存設備增加電力消耗和數據處理負載'
      },
      {
        crew: 'camera',
        impactFactor: 1.1, // 攝影組需要現場存儲
        description: '現場拍攝需要即時數據存儲'
      }
    ]
  },
  {
    category: 'office',
    categoryName: '辦公設備',
    baseImpacts: [
      {
        crew: 'production',
        impactFactor: 1.2, // 製片組主要使用
        description: '辦公設備增加製片組的工作負載'
      },
      {
        crew: 'director',
        impactFactor: 1.1, // 導演組需要監看和溝通
        description: '需要設備進行現場監看和溝通協調'
      }
    ]
  }
];

// 特定器材的精確影響 (覆蓋類別的基本影響)
export const SPECIFIC_EQUIPMENT_IMPACTS: EquipmentCrewImpact[] = [
  {
    equipmentId: 'cam-1', // ARRI Alexa Mini
    equipmentName: 'ARRI Alexa Mini',
    impacts: [
      {
        crew: 'camera',
        impactFactor: 1.8, // 專業攝影機對攝影組影響更大
        description: '專業電影攝影機需要更多專業操作和電力'
      },
      {
        crew: 'grip',
        impactFactor: 1.5, // 需要更多支撐設備
        description: '重型攝影機需要更多支撐和穩定設備'
      },
      {
        crew: 'gaffer',
        impactFactor: 1.3, // 需要專業燈光配合
        description: '專業攝影機需要精確的燈光配合'
      }
    ]
  },
  {
    equipmentId: 'cam-2', // RED Epic Dragon
    equipmentName: 'RED Epic Dragon',
    impacts: [
      {
        crew: 'camera',
        impactFactor: 2.0, // 高端攝影機影響最大
        description: '高解析度攝影機需要更多電力和專業操作'
      },
      {
        crew: 'grip',
        impactFactor: 1.6, // 需要更多器材支援
        description: '高端設備需要更多專業器材支援'
      },
      {
        crew: 'post',
        impactFactor: 1.4, // 高解析度數據需要更多後期處理
        description: '高解析度影像增加後期處理負荷'
      }
    ]
  },
  {
    equipmentId: 'light-led-1000w',
    equipmentName: '1000W LED燈',
    impacts: [
      {
        crew: 'lighting',
        impactFactor: 2.2, // 大功率燈光對燈光組影響很大
        description: '大功率LED燈大幅增加電力消耗和操作複雜度'
      },
      {
        crew: 'gaffer',
        impactFactor: 1.8, // 燈光師需要精確控制
        description: '需要燈光師進行精確的亮度和色溫控制'
      },
      {
        crew: 'grip',
        impactFactor: 1.5, // 需要更多架設工作
        description: '大型燈光設備需要更多架設和移動工作'
      }
    ]
  }
];

// 組別基礎碳排放因子 (kg CO₂e per person per hour)
export const CREW_BASE_EMISSION_FACTORS: Record<FilmCrew, number> = {
  'director': 0.8,      // 導演組 - 主要是人力和通訊設備
  'camera': 1.2,        // 攝影組 - 設備用電較多
  'lighting': 2.5,      // 燈光組 - 電力消耗最大
  'sound': 0.9,         // 收音組 - 中等設備用電
  'makeup': 0.6,        // 梳化組 - 主要是人力和材料
  'costume': 0.5,       // 服裝組 - 主要是人力
  'props': 0.7,         // 道具組 - 製作和運輸材料
  'art': 0.8,           // 美術組 - 設計和材料
  'gaffer': 1.8,        // 燈光師組 - 操作燈光設備
  'grip': 1.0,          // 器材組 - 器材搬運和架設
  'production': 0.9,    // 製片組 - 協調和辦公設備
  'transport': 3.5,     // 交通組 - 車輛燃料消耗最大
  'catering': 1.5,      // 餐飲組 - 食材和烹飪設備
  'location': 0.6,      // 場地組 - 主要是人力和通訊
  'post': 1.1,          // 後期組 - 電腦設備用電
  'other': 0.7          // 其他 - 一般水平
};

// 計算器材對組別碳排放的影響
export const calculateEquipmentImpactOnCrew = (
  equipmentIds: string[],
  crewType: FilmCrew,
  baseDuration: number = 8, // 基礎工作時間(小時)
  crewSize: number = 1      // 組別人數
): number => {
  let totalImpactFactor = 1.0; // 基礎影響係數
  const processedCategories = new Set<string>();
  
  // 1. 處理特定器材的影響
  equipmentIds.forEach(equipmentId => {
    const specificImpact = SPECIFIC_EQUIPMENT_IMPACTS.find(
      impact => impact.equipmentId === equipmentId
    );
    
    if (specificImpact) {
      const crewImpact = specificImpact.impacts.find(
        impact => impact.crew === crewType
      );
      
      if (crewImpact) {
        totalImpactFactor *= crewImpact.impactFactor;
      }
    }
  });
  
  // 2. 處理器材類別的基本影響（如果沒有特定器材影響）
  equipmentIds.forEach(equipmentId => {
    // 根據器材ID推斷類別（這裡簡化處理，實際可能需要更複雜的映射）
    let category = '';
    if (equipmentId.startsWith('cam-')) category = 'camera';
    else if (equipmentId.startsWith('light-')) category = 'lighting';
    else if (equipmentId.startsWith('audio-')) category = 'audio';
    else if (equipmentId.startsWith('transport-')) category = 'transport';
    else if (equipmentId.startsWith('edit-')) category = 'editing';
    else if (equipmentId.startsWith('storage-')) category = 'storage';
    else if (equipmentId.startsWith('office-')) category = 'office';
    
    if (category && !processedCategories.has(category)) {
      processedCategories.add(category);
      
      // 檢查是否已有特定器材影響，避免重複計算
      const hasSpecificImpact = SPECIFIC_EQUIPMENT_IMPACTS.some(
        impact => impact.equipmentId === equipmentId &&
        impact.impacts.some(i => i.crew === crewType)
      );
      
      if (!hasSpecificImpact) {
        const categoryImpact = EQUIPMENT_CATEGORY_IMPACTS.find(
          impact => impact.category === category
        );
        
        if (categoryImpact) {
          const crewImpact = categoryImpact.baseImpacts.find(
            impact => impact.crew === crewType
          );
          
          if (crewImpact) {
            totalImpactFactor *= crewImpact.impactFactor;
          }
        }
      }
    }
  });
  
  // 3. 計算最終碳排放量
  const baseEmissionFactor = CREW_BASE_EMISSION_FACTORS[crewType] || 0.7;
  const finalEmission = baseEmissionFactor * totalImpactFactor * baseDuration * crewSize;
  
  return parseFloat(finalEmission.toFixed(3));
};

// 獲取器材對組別的影響說明
export const getEquipmentImpactDescription = (
  equipmentIds: string[],
  crewType: FilmCrew
): string[] => {
  const descriptions: string[] = [];
  
  // 特定器材影響說明
  equipmentIds.forEach(equipmentId => {
    const specificImpact = SPECIFIC_EQUIPMENT_IMPACTS.find(
      impact => impact.equipmentId === equipmentId
    );
    
    if (specificImpact) {
      const crewImpact = specificImpact.impacts.find(
        impact => impact.crew === crewType
      );
      
      if (crewImpact) {
        descriptions.push(`${specificImpact.equipmentName}: ${crewImpact.description}`);
      }
    }
  });
  
  return descriptions;
};

// 計算所有組別受器材影響的碳排放
export const calculateAllCrewEmissionsWithEquipment = (
  equipmentIds: string[],
  crewSizes: Partial<Record<FilmCrew, number>> = {},
  baseDuration: number = 8
): Record<FilmCrew, { emission: number; impactFactor: number; descriptions: string[] }> => {
  const results: Record<string, { emission: number; impactFactor: number; descriptions: string[] }> = {};
  
  Object.keys(CREW_BASE_EMISSION_FACTORS).forEach(crew => {
    const crewType = crew as FilmCrew;
    const crewSize = crewSizes[crewType] || 1;
    
    // 計算無器材影響的基礎排放
    const baseEmission = CREW_BASE_EMISSION_FACTORS[crewType] * baseDuration * crewSize;
    
    // 計算有器材影響的排放
    const impactedEmission = calculateEquipmentImpactOnCrew(
      equipmentIds, 
      crewType, 
      baseDuration, 
      crewSize
    );
    
    // 計算影響係數
    const impactFactor = baseEmission > 0 ? impactedEmission / baseEmission : 1;
    
    // 獲取影響說明
    const descriptions = getEquipmentImpactDescription(equipmentIds, crewType);
    
    results[crewType] = {
      emission: impactedEmission,
      impactFactor: parseFloat(impactFactor.toFixed(2)),
      descriptions
    };
  });
  
  return results as Record<FilmCrew, { emission: number; impactFactor: number; descriptions: string[] }>;
}; 