// 拍攝階段 - 攝影設備
export interface CameraEquipment {
  id: string;
  name: string;
  powerConsumption: number; // 瓦特
  emissionFactor: number; // kg CO2e per hour
  type: 'cinema-camera' | 'video-camera' | 'mirrorless' | 'integrated-system';
  weight: number; // 公斤
}

// 拍攝階段 - 照明設備
export interface LightingEquipment {
  id: string;
  name: string;
  powerConsumption: number; // 瓦特
  emissionFactor: number; // kg CO2e per hour
  type: 'led' | 'hmi' | 'tungsten' | 'fluorescent';
  weight: number; // 公斤
}

// 拍攝階段 - 交通設備
export interface TransportEquipment {
  id: string;
  name: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  emissionFactor: number; // kg CO2e per km
  type: 'car' | 'van' | 'truck' | 'motorcycle';
  passengerCapacity: number; // 最大載客數
  cargoCapacity: number; // 最大載重量(公斤)
  emissionFactorPerPerson: number; // kg CO2e per km per person
  emissionFactorPerKg: number; // kg CO2e per km per kg
}

// 拍攝階段 - 餐飲選項
export interface FoodEquipment {
  id: string;
  name: string;
  servingSize: number;
  emissionFactor: number; // kg CO2e per serving
  type: 'meat' | 'vegetarian' | 'seafood' | 'delivery' | 'buffet';
}

// 拍攝階段 - 住宿選項
export interface AccommodationEquipment {
  id: string;
  name: string;
  emissionFactor: number; // kg CO2e per night
  type: 'hotel' | 'luxury-hotel' | 'guesthouse' | 'hostel';
}

// 拍攝階段 - 廢棄物選項
export interface WasteEquipment {
  id: string;
  name: string;
  emissionFactor: number; // kg CO2e per kg
  type: 'general' | 'food' | 'plastic' | 'paper' | 'metal';
}

// 拍攝階段 - 燃料選項
export interface FuelEquipment {
  id: string;
  name: string;
  emissionFactor: number; // kg CO2e per liter
  type: 'gasoline' | 'diesel' | 'natural-gas' | 'lpg' | 'nuclear' | 'hydrogen';
}

// 前期製作 - 辦公設備
export interface OfficeEquipment {
  id: string;
  name: string;
  powerConsumption: number; // 瓦特
  emissionFactor: number; // kg CO2e per hour
  type: 'desktop' | 'laptop' | 'monitor' | 'projector' | 'printer' | 'hvac';
  weight?: number; // 公斤
}

// 前期製作 - 電腦設備
export interface ComputerEquipment {
  id: string;
  name: string;
  powerConsumption: number; // 瓦特
  emissionFactor: number; // kg CO2e per hour
  type: 'laptop' | 'desktop' | 'workstation';
  weight: number; // 公斤
}

// 前期製作 - 印刷設備
export interface PrintingEquipment {
  id: string;
  name: string;
  emissionFactor: number; // kg CO2e per unit
  type: 'paper' | 'printing' | 'large-format';
  unit: string;
  weight?: number; // 公斤
}

// 後期製作 - 編輯設備
export interface EditingEquipment {
  id: string;
  name: string;
  powerConsumption: number; // 瓦特
  emissionFactor: number; // kg CO2e per hour
  type: 'workstation' | 'laptop' | 'monitor' | 'server' | 'color-grading';
  weight: number; // 公斤
}

// 後期製作 - 存儲設備
export interface StorageEquipment {
  id: string;
  name: string;
  emissionFactor: number; // kg CO2e per capacity
  type: 'external-drive' | 'nas' | 'raid' | 'cloud' | 'tape';
  capacity: string;
  weight?: number; // 公斤
  powerConsumption?: number; // 瓦特
}

// 拍攝階段 - 音頻設備
export interface AudioEquipment {
  id: string;
  name: string;
  powerConsumption: number; // 瓦特
  emissionFactor: number; // kg CO2e per hour
  type: 'microphone' | 'recorder' | 'mixer' | 'wireless' | 'headphones' | 'speakers';
  weight: number; // 公斤
}

// 設備類型聯合類型
export type EquipmentType = 
  | CameraEquipment 
  | LightingEquipment 
  | TransportEquipment 
  | FoodEquipment 
  | AccommodationEquipment 
  | WasteEquipment 
  | FuelEquipment
  | OfficeEquipment
  | ComputerEquipment
  | PrintingEquipment
  | EditingEquipment
  | StorageEquipment
  | AudioEquipment;

// 多設備選擇類型
export interface SelectedEquipmentItem {
  equipment: EquipmentType;
  quantity: number;
  hours?: number;
  distance?: number;
}

// 交通計算參數
export interface TransportCalculationParams {
  distance: number;
  peopleCount: number;
  equipmentWeight: number;
  transport: TransportEquipment | EnhancedTransportEquipment;
}

// 添加ISO標準相關的通用字段
export interface ISOCertificationData {
  standard: 'ISO14064' | 'ISO14067' | 'Other';
  certificationDate?: string;
  certifiedBy?: string;
  validUntil?: string;
  certificationId?: string;
}

// 添加生命週期評估數據
export interface LifeCycleData {
  manufacturing?: number; // kgCO2e for manufacturing
  transportation?: number; // kgCO2e for transport to market
  usage: number; // kgCO2e during usage (same as current emissionFactor)
  endOfLife?: number; // kgCO2e for disposal
  totalLifeCycle?: number; // total lifecycle emissions
  lifespan?: number; // expected lifespan in years
}

// 添加圖像和識別數據
export interface RecognitionData {
  imageUrls?: string[]; // URLs for equipment images
  recognitionTags?: string[]; // Keywords for AR recognition
  modelFile?: string; // 3D model file path if available
  manufacturer?: string; // Equipment manufacturer
  modelNumber?: string; // Specific model number
  releaseYear?: number; // Year of release
}

// 增強現有的CameraEquipment類型
export interface EnhancedCameraEquipment extends CameraEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    sensor?: string;
    resolution?: string;
    dynamicRange?: string;
    recordingFormats?: string[];
  };
  alternativeModels?: string[]; // Similar models IDs
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的LightingEquipment類型
export interface EnhancedLightingEquipment extends LightingEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    colorTemperature?: string;
    cri?: number; // Color rendering index
    beamAngle?: number;
    dimmable?: boolean;
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的TransportEquipment類型
export interface EnhancedTransportEquipment extends TransportEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    engineType?: string;
    engineSize?: string;
    fuelEconomy?: string; // 燃油經濟性 (公里/升)
    emissionStandard?: string; // 排放標準 (例如: Euro 6)
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的OfficeEquipment類型
export interface EnhancedOfficeEquipment extends OfficeEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    energyEfficiencyRating?: string;
    standbyPower?: number; // 待機功率(瓦特)
    processor?: string;
    memory?: string;
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的FoodEquipment類型
export interface EnhancedFoodEquipment extends FoodEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    origin?: string; // 食材產地
    organicCertified?: boolean; // 有機認證
    packagingType?: string; // 包裝類型
    nutritionalValue?: string; // 營養價值
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的AccommodationEquipment類型
export interface EnhancedAccommodationEquipment extends AccommodationEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    energyEfficiencyRating?: string; // 能源效率評級
    sustainabilityCertification?: string; // 可持續發展認證
    averageWaterUsage?: number; // 平均用水量(升/晚)
    averageEnergyUsage?: number; // 平均能源使用量(kWh/晚)
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的WasteEquipment類型
export interface EnhancedWasteEquipment extends WasteEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    recyclingRate?: number; // 回收率(%)
    treatmentMethod?: string; // 處理方法
    decompositionTime?: string; // 降解時間
    toxicityLevel?: string; // 毒性水平
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的FuelEquipment類型
export interface EnhancedFuelEquipment extends FuelEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    energyDensity?: string; // 能量密度(MJ/L)
    octaneRating?: number | undefined; // 辛烷值(適用於汽油)
    cetaneNumber?: number | undefined; // 十六烷值(適用於柴油)
    bioContent?: number; // 生物成分百分比(%)
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的ComputerEquipment類型
export interface EnhancedComputerEquipment extends ComputerEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    processor?: string; // 處理器規格
    memory?: string; // 內存規格
    storage?: string; // 存儲規格
    graphicsCard?: string; // 顯卡規格
    energyEfficiencyRating?: string; // 能源效率評級
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的PrintingEquipment類型
export interface EnhancedPrintingEquipment extends PrintingEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    paperWeight?: string; // 紙張重量(克/平方米)
    printingMethod?: string; // 印刷方法
    inkType?: string; // 墨水類型
    recycledContent?: number; // 回收成分百分比(%)
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的EditingEquipment類型
export interface EnhancedEditingEquipment extends EditingEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    processor?: string; // 處理器規格
    memory?: string; // 內存規格
    storage?: string; // 存儲規格
    graphicsCard?: string; // 顯卡規格
    monitorResolution?: string; // 顯示器解析度
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的StorageEquipment類型
export interface EnhancedStorageEquipment extends StorageEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    readSpeed?: string; // 讀取速度
    writeSpeed?: string; // 寫入速度
    interface?: string; // 接口類型
    reliability?: string; // 可靠性指標(如MTBF)
    powerConsumption?: number; // 功耗(瓦特)
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 增強現有的AudioEquipment類型
export interface EnhancedAudioEquipment extends AudioEquipment {
  isoCertification?: ISOCertificationData;
  lifeCycleData?: LifeCycleData;
  recognitionData?: RecognitionData;
  technicalSpecs?: {
    frequency?: string; // 頻率範圍
    signalToNoise?: number; // 信噪比 (dB)
    batteryLife?: number; // 電池壽命 (小時)
    connectivity?: string[]; // 連接類型
  };
  alternativeModels?: string[];
  dataSource?: 'manufacturer' | 'thirdParty' | 'estimated';
  notes?: string;
}

// 用於遷移到新格式的增強設備類型
export type EnhancedEquipmentType = 
  | EnhancedCameraEquipment 
  | EnhancedLightingEquipment 
  | EnhancedTransportEquipment
  | EnhancedOfficeEquipment
  | EnhancedFoodEquipment
  | EnhancedAccommodationEquipment
  | EnhancedWasteEquipment
  | EnhancedFuelEquipment
  | EnhancedComputerEquipment
  | EnhancedPrintingEquipment
  | EnhancedEditingEquipment
  | EnhancedStorageEquipment
  | EnhancedAudioEquipment;