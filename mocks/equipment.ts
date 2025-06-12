import { 
  CameraEquipment, 
  TransportEquipment, 
  LightingEquipment,
  FoodEquipment,
  AccommodationEquipment,
  WasteEquipment,
  FuelEquipment,
  OfficeEquipment,
  ComputerEquipment,
  PrintingEquipment,
  EditingEquipment,
  StorageEquipment
} from '@/types/equipment';

// 拍攝階段 - 攝影設備
export const CAMERA_EQUIPMENT: CameraEquipment[] = [
  {
    id: 'cam-1',
    name: 'ARRI Alexa Mini',
    powerConsumption: 65,
    emissionFactor: 0.35,
    type: 'cinema-camera',
    weight: 2.3
  },
  {
    id: 'cam-2',
    name: 'RED Epic Dragon',
    powerConsumption: 80,
    emissionFactor: 0.42,
    type: 'cinema-camera',
    weight: 2.8
  },
  {
    id: 'cam-3',
    name: 'Sony FS7',
    powerConsumption: 35,
    emissionFactor: 0.18,
    type: 'video-camera',
    weight: 2.0
  },
  {
    id: 'cam-4',
    name: 'Canon C300',
    powerConsumption: 25,
    emissionFactor: 0.15,
    type: 'video-camera',
    weight: 1.8
  },
  {
    id: 'cam-5',
    name: 'Blackmagic URSA Mini',
    powerConsumption: 45,
    emissionFactor: 0.25,
    type: 'cinema-camera',
    weight: 2.2
  },
  {
    id: 'cam-6',
    name: 'Panasonic GH5',
    powerConsumption: 10,
    emissionFactor: 0.08,
    type: 'mirrorless',
    weight: 0.7
  },
  {
    id: 'cam-7',
    name: 'Sony A7S III',
    powerConsumption: 12,
    emissionFactor: 0.09,
    type: 'mirrorless',
    weight: 0.7
  },
  {
    id: 'cam-8',
    name: 'DJI Ronin 4D',
    powerConsumption: 30,
    emissionFactor: 0.16,
    type: 'integrated-system',
    weight: 4.8
  }
];

// 拍攝階段 - 照明設備
export const LIGHTING_EQUIPMENT: LightingEquipment[] = [
  {
    id: 'light-1',
    name: 'ARRI SkyPanel S60-C',
    powerConsumption: 450,
    emissionFactor: 0.23,
    type: 'led',
    weight: 12.5
  },
  {
    id: 'light-2',
    name: 'ARRI M18 HMI',
    powerConsumption: 1800,
    emissionFactor: 0.90,
    type: 'hmi',
    weight: 22.0
  },
  {
    id: 'light-3',
    name: 'Aputure 300d II',
    powerConsumption: 300,
    emissionFactor: 0.15,
    type: 'led',
    weight: 7.5
  },
  {
    id: 'light-4',
    name: 'Kino Flo Diva-Lite',
    powerConsumption: 110,
    emissionFactor: 0.06,
    type: 'fluorescent',
    weight: 6.8
  },
  {
    id: 'light-5',
    name: 'ARRI Tungsten 1K',
    powerConsumption: 1000,
    emissionFactor: 0.50,
    type: 'tungsten',
    weight: 5.2
  },
  {
    id: 'light-6',
    name: 'Litepanels Gemini 2x1',
    powerConsumption: 350,
    emissionFactor: 0.18,
    type: 'led',
    weight: 11.3
  }
];

// 拍攝階段 - 交通設備
export const TRANSPORT_EQUIPMENT: TransportEquipment[] = [
  {
    id: 'trans-1',
    name: '小型貨車',
    fuelType: 'gasoline',
    emissionFactor: 0.23,
    type: 'van',
    passengerCapacity: 3,
    cargoCapacity: 800,
    emissionFactorPerPerson: 0.08,
    emissionFactorPerKg: 0.0003
  },
  {
    id: 'trans-2',
    name: '中型貨車',
    fuelType: 'diesel',
    emissionFactor: 0.27,
    type: 'truck',
    passengerCapacity: 3,
    cargoCapacity: 2000,
    emissionFactorPerPerson: 0.09,
    emissionFactorPerKg: 0.0002
  },
  {
    id: 'trans-3',
    name: '小客車',
    fuelType: 'gasoline',
    emissionFactor: 0.19,
    type: 'car',
    passengerCapacity: 5,
    cargoCapacity: 400,
    emissionFactorPerPerson: 0.04,
    emissionFactorPerKg: 0.0005
  },
  {
    id: 'trans-4',
    name: '電動車',
    fuelType: 'electric',
    emissionFactor: 0.05,
    type: 'car',
    passengerCapacity: 5,
    cargoCapacity: 400,
    emissionFactorPerPerson: 0.01,
    emissionFactorPerKg: 0.0001
  },
  {
    id: 'trans-5',
    name: '混合動力車',
    fuelType: 'hybrid',
    emissionFactor: 0.12,
    type: 'car',
    passengerCapacity: 5,
    cargoCapacity: 400,
    emissionFactorPerPerson: 0.025,
    emissionFactorPerKg: 0.0003
  },
  {
    id: 'trans-6',
    name: '大型貨車',
    fuelType: 'diesel',
    emissionFactor: 0.35,
    type: 'truck',
    passengerCapacity: 3,
    cargoCapacity: 5000,
    emissionFactorPerPerson: 0.12,
    emissionFactorPerKg: 0.0001
  },
  {
    id: 'trans-7',
    name: '汽油機車',
    fuelType: 'gasoline',
    emissionFactor: 0.10,
    type: 'motorcycle',
    passengerCapacity: 2,
    cargoCapacity: 20,
    emissionFactorPerPerson: 0.05,
    emissionFactorPerKg: 0.001
  },
  {
    id: 'trans-8',
    name: '電動機車',
    fuelType: 'electric',
    emissionFactor: 0.03,
    type: 'motorcycle',
    passengerCapacity: 2,
    cargoCapacity: 20,
    emissionFactorPerPerson: 0.015,
    emissionFactorPerKg: 0.0003
  },
  {
    id: 'trans-9',
    name: '重型機車',
    fuelType: 'gasoline',
    emissionFactor: 0.15,
    type: 'motorcycle',
    passengerCapacity: 2,
    cargoCapacity: 30,
    emissionFactorPerPerson: 0.075,
    emissionFactorPerKg: 0.0015
  }
];

// 拍攝階段 - 餐飲選項
export const FOOD_OPTIONS: FoodEquipment[] = [
  {
    id: 'food-1',
    name: '肉類餐點',
    servingSize: 1,
    emissionFactor: 3.5,
    type: 'meat'
  },
  {
    id: 'food-2',
    name: '素食餐點',
    servingSize: 1,
    emissionFactor: 1.2,
    type: 'vegetarian'
  },
  {
    id: 'food-3',
    name: '海鮮餐點',
    servingSize: 1,
    emissionFactor: 2.8,
    type: 'seafood'
  },
  {
    id: 'food-4',
    name: '外送餐點',
    servingSize: 1,
    emissionFactor: 4.2,
    type: 'delivery'
  },
  {
    id: 'food-5',
    name: '自助餐',
    servingSize: 1,
    emissionFactor: 5.0,
    type: 'buffet'
  }
];

// 拍攝階段 - 住宿選項
export const ACCOMMODATION_OPTIONS: AccommodationEquipment[] = [
  {
    id: 'accom-1',
    name: '五星級飯店',
    emissionFactor: 25.0,
    type: 'luxury-hotel'
  },
  {
    id: 'accom-2',
    name: '四星級飯店',
    emissionFactor: 18.0,
    type: 'hotel'
  },
  {
    id: 'accom-3',
    name: '三星級飯店',
    emissionFactor: 12.0,
    type: 'hotel'
  },
  {
    id: 'accom-4',
    name: '民宿',
    emissionFactor: 8.0,
    type: 'guesthouse'
  },
  {
    id: 'accom-5',
    name: '青年旅館',
    emissionFactor: 5.0,
    type: 'hostel'
  }
];

// 拍攝階段 - 廢棄物選項
export const WASTE_OPTIONS: WasteEquipment[] = [
  {
    id: 'waste-1',
    name: '一般垃圾',
    emissionFactor: 0.5,
    type: 'general'
  },
  {
    id: 'waste-2',
    name: '廚餘',
    emissionFactor: 0.7,
    type: 'food'
  },
  {
    id: 'waste-3',
    name: '塑膠',
    emissionFactor: 0.3,
    type: 'plastic'
  },
  {
    id: 'waste-4',
    name: '紙類',
    emissionFactor: 0.2,
    type: 'paper'
  },
  {
    id: 'waste-5',
    name: '金屬',
    emissionFactor: 0.1,
    type: 'metal'
  }
];

// 拍攝階段 - 燃料選項
export const FUEL_OPTIONS: FuelEquipment[] = [
  {
    id: 'fuel-1',
    name: '汽油',
    emissionFactor: 2.3,
    type: 'gasoline'
  },
  {
    id: 'fuel-2',
    name: '柴油',
    emissionFactor: 2.7,
    type: 'diesel'
  },
  {
    id: 'fuel-3',
    name: '天然氣',
    emissionFactor: 1.9,
    type: 'natural-gas'
  },
  {
    id: 'fuel-4',
    name: '液化石油氣',
    emissionFactor: 1.5,
    type: 'lpg'
  }
];

// 前期製作 - 辦公設備
export const OFFICE_EQUIPMENT: OfficeEquipment[] = [
  {
    id: 'office-1',
    name: '桌上型電腦',
    powerConsumption: 120,
    emissionFactor: 0.06,
    type: 'desktop',
    weight: 8.0
  },
  {
    id: 'office-2',
    name: '筆記型電腦',
    powerConsumption: 50,
    emissionFactor: 0.025,
    type: 'laptop',
    weight: 2.0
  },
  {
    id: 'office-3',
    name: '顯示器',
    powerConsumption: 30,
    emissionFactor: 0.015,
    type: 'monitor',
    weight: 5.0
  },
  {
    id: 'office-4',
    name: '投影機',
    powerConsumption: 300,
    emissionFactor: 0.15,
    type: 'projector',
    weight: 3.5
  },
  {
    id: 'office-5',
    name: '多功能事務機',
    powerConsumption: 80,
    emissionFactor: 0.04,
    type: 'printer',
    weight: 12.0
  },
  {
    id: 'office-6',
    name: '空調系統',
    powerConsumption: 1500,
    emissionFactor: 0.75,
    type: 'hvac'
  }
];

// 前期製作 - 電腦設備
export const COMPUTER_EQUIPMENT: ComputerEquipment[] = [
  {
    id: 'comp-1',
    name: 'MacBook Pro',
    powerConsumption: 60,
    emissionFactor: 0.03,
    type: 'laptop',
    weight: 2.0
  },
  {
    id: 'comp-2',
    name: 'iMac',
    powerConsumption: 100,
    emissionFactor: 0.05,
    type: 'desktop',
    weight: 9.5
  },
  {
    id: 'comp-3',
    name: 'Mac Pro',
    powerConsumption: 250,
    emissionFactor: 0.125,
    type: 'workstation',
    weight: 18.0
  },
  {
    id: 'comp-4',
    name: 'Windows 筆電',
    powerConsumption: 45,
    emissionFactor: 0.0225,
    type: 'laptop',
    weight: 1.8
  },
  {
    id: 'comp-5',
    name: 'Windows 工作站',
    powerConsumption: 200,
    emissionFactor: 0.1,
    type: 'workstation',
    weight: 15.0
  }
];

// 前期製作 - 印刷設備
export const PRINTING_EQUIPMENT: PrintingEquipment[] = [
  {
    id: 'print-1',
    name: 'A4紙張',
    emissionFactor: 0.005,
    type: 'paper',
    unit: '張',
    weight: 0.005
  },
  {
    id: 'print-2',
    name: 'A3紙張',
    emissionFactor: 0.01,
    type: 'paper',
    unit: '張',
    weight: 0.01
  },
  {
    id: 'print-3',
    name: '彩色印刷',
    emissionFactor: 0.015,
    type: 'printing',
    unit: '張'
  },
  {
    id: 'print-4',
    name: '黑白印刷',
    emissionFactor: 0.008,
    type: 'printing',
    unit: '張'
  },
  {
    id: 'print-5',
    name: '大型海報',
    emissionFactor: 0.05,
    type: 'large-format',
    unit: '張',
    weight: 0.1
  }
];

// 後期製作 - 編輯設備
export const EDITING_EQUIPMENT: EditingEquipment[] = [
  {
    id: 'edit-1',
    name: 'Mac Pro 工作站',
    powerConsumption: 250,
    emissionFactor: 0.125,
    type: 'workstation',
    weight: 18.0
  },
  {
    id: 'edit-2',
    name: 'Windows 剪輯工作站',
    powerConsumption: 300,
    emissionFactor: 0.15,
    type: 'workstation',
    weight: 20.0
  },
  {
    id: 'edit-3',
    name: 'MacBook Pro',
    powerConsumption: 60,
    emissionFactor: 0.03,
    type: 'laptop',
    weight: 2.0
  },
  {
    id: 'edit-4',
    name: '專業顯示器',
    powerConsumption: 80,
    emissionFactor: 0.04,
    type: 'monitor',
    weight: 6.5
  },
  {
    id: 'edit-5',
    name: '渲染伺服器',
    powerConsumption: 500,
    emissionFactor: 0.25,
    type: 'server',
    weight: 25.0
  },
  {
    id: 'edit-6',
    name: '調色工作站',
    powerConsumption: 350,
    emissionFactor: 0.175,
    type: 'color-grading',
    weight: 22.0
  }
];

// 後期製作 - 存儲設備
export const STORAGE_EQUIPMENT: StorageEquipment[] = [
  {
    id: 'storage-1',
    name: '外接硬碟',
    emissionFactor: 0.02,
    type: 'external-drive',
    capacity: 'TB',
    weight: 0.3
  },
  {
    id: 'storage-2',
    name: 'NAS 存儲系統',
    emissionFactor: 0.05,
    type: 'nas',
    capacity: 'TB',
    weight: 5.0
  },
  {
    id: 'storage-3',
    name: 'RAID 存儲陣列',
    emissionFactor: 0.08,
    type: 'raid',
    capacity: 'TB',
    weight: 12.0
  },
  {
    id: 'storage-4',
    name: '雲端存儲',
    emissionFactor: 0.01,
    type: 'cloud',
    capacity: 'GB'
  },
  {
    id: 'storage-5',
    name: 'LTO 磁帶',
    emissionFactor: 0.005,
    type: 'tape',
    capacity: 'TB',
    weight: 0.1
  }
];