import { 
  EnhancedCameraEquipment, 
  EnhancedLightingEquipment,
  EnhancedTransportEquipment,
  EnhancedOfficeEquipment,
  EnhancedEditingEquipment,
  EnhancedStorageEquipment,
  EnhancedFoodEquipment,
  EnhancedAccommodationEquipment,
  EnhancedWasteEquipment,
  EnhancedFuelEquipment,
  EnhancedAudioEquipment,
  ISOCertificationData
} from '@/types/equipment';

// 標準ISO認證數據
const standardISOData: ISOCertificationData = {
  standard: 'ISO14064',
  certificationDate: '2023-06-15',
  certifiedBy: 'Carbon Trust',
  validUntil: '2026-06-15',
  certificationId: 'ISO14064-CT-2023-0142'
};

// 增強版攝影設備數據
export const ENHANCED_CAMERA_EQUIPMENT: EnhancedCameraEquipment[] = [
  {
    id: 'cam-1',
    name: 'ARRI Alexa Mini',
    powerConsumption: 65,
    emissionFactor: 0.35,
    type: 'cinema-camera',
    weight: 2.3,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ARRI-2023-0001'
    },
    lifeCycleData: {
      manufacturing: 320,
      transportation: 45,
      usage: 0.35,
      endOfLife: 15,
      totalLifeCycle: 380,
      lifespan: 7
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/arri_alexa_mini_front.jpg',
        'https://example.com/images/arri_alexa_mini_side.jpg'
      ],
      recognitionTags: ['ARRI', 'Alexa', 'Mini', 'Cinema Camera', 'Digital Camera'],
      manufacturer: 'ARRI',
      modelNumber: 'Alexa Mini',
      releaseYear: 2015
    },
    technicalSpecs: {
      sensor: 'Super 35mm ALEV III CMOS',
      resolution: '3.2K',
      dynamicRange: '14+ stops',
      recordingFormats: ['ARRIRAW', 'ProRes']
    },
    dataSource: 'manufacturer',
    notes: '廣泛用於專業電影和電視製作的輕量級攝影機'
  },
  {
    id: 'cam-2',
    name: 'RED Epic Dragon',
    powerConsumption: 80,
    emissionFactor: 0.42,
    type: 'cinema-camera',
    weight: 2.8,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-RED-2023-0005'
    },
    lifeCycleData: {
      manufacturing: 350,
      transportation: 50,
      usage: 0.42,
      endOfLife: 18,
      totalLifeCycle: 418,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/red_epic_dragon_front.jpg',
        'https://example.com/images/red_epic_dragon_side.jpg'
      ],
      recognitionTags: ['RED', 'Epic', 'Dragon', 'Cinema Camera', 'Digital Camera'],
      manufacturer: 'RED Digital Cinema',
      modelNumber: 'Epic Dragon',
      releaseYear: 2013
    },
    technicalSpecs: {
      sensor: '6K Dragon CMOS',
      resolution: '6K',
      dynamicRange: '16.5+ stops',
      recordingFormats: ['REDCODE RAW', 'ProRes', 'DNxHD']
    },
    dataSource: 'manufacturer',
    notes: '高解析度電影攝影機，常用於特效密集的製作'
  },
  {
    id: 'cam-7',
    name: 'Sony A7S III',
    powerConsumption: 12,
    emissionFactor: 0.09,
    type: 'mirrorless',
    weight: 0.7,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-SONY-2023-0012'
    },
    lifeCycleData: {
      manufacturing: 180,
      transportation: 25,
      usage: 0.09,
      endOfLife: 10,
      totalLifeCycle: 215,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/sony_a7siii_front.jpg',
        'https://example.com/images/sony_a7siii_top.jpg'
      ],
      recognitionTags: ['Sony', 'A7S', 'III', 'A7S III', 'Mirrorless', 'DSLM'],
      manufacturer: 'Sony',
      modelNumber: 'ILCE-7SM3',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: 'Full-frame Exmor R CMOS',
      resolution: '12.1 Megapixels',
      dynamicRange: '15+ stops',
      recordingFormats: ['XAVC S', 'XAVC HS', 'XAVC S-I']
    },
    dataSource: 'manufacturer',
    notes: '低光照性能出色的全片幅無反相機，適合高ISO拍攝'
  },
  {
    id: 'cam-new-1',
    name: 'Canon C300 Mark III',
    powerConsumption: 35,
    emissionFactor: 0.19,
    type: 'video-camera',
    weight: 1.75,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-CANON-2023-0007'
    },
    lifeCycleData: {
      manufacturing: 250,
      transportation: 30,
      usage: 0.19,
      endOfLife: 12,
      totalLifeCycle: 292,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/canon_c300_mark_iii_front.jpg',
        'https://example.com/images/canon_c300_mark_iii_side.jpg'
      ],
      recognitionTags: ['Canon', 'C300', 'Mark III', 'Cinema Camera', 'Video Camera'],
      manufacturer: 'Canon',
      modelNumber: 'C300 Mark III',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: 'Super 35mm Dual Gain Output CMOS',
      resolution: '4K',
      dynamicRange: '16+ stops',
      recordingFormats: ['Cinema RAW Light', 'XF-AVC']
    },
    dataSource: 'manufacturer',
    notes: '專業級電影製作和電視節目拍攝的理想選擇'
  },
  {
    id: 'cam-new-2',
    name: 'Panasonic Varicam LT',
    powerConsumption: 47,
    emissionFactor: 0.25,
    type: 'cinema-camera',
    weight: 2.7,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-PANA-2023-0003'
    },
    lifeCycleData: {
      manufacturing: 285,
      transportation: 40,
      usage: 0.25,
      endOfLife: 14,
      totalLifeCycle: 339,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/panasonic_varicam_lt_front.jpg',
        'https://example.com/images/panasonic_varicam_lt_side.jpg'
      ],
      recognitionTags: ['Panasonic', 'Varicam', 'LT', 'Cinema Camera'],
      manufacturer: 'Panasonic',
      modelNumber: 'AU-V35LT1G',
      releaseYear: 2016
    },
    technicalSpecs: {
      sensor: 'Super 35mm MOS',
      resolution: '4K',
      dynamicRange: '14+ stops',
      recordingFormats: ['AVC-Intra', 'ProRes', 'V-RAW']
    },
    dataSource: 'manufacturer',
    notes: '緊湊型4K電影級攝影機，具有雙原生ISO'
  },
  // 新增攝影設備
  {
    id: 'cam-new-3',
    name: 'Blackmagic URSA Mini Pro 12K',
    powerConsumption: 60,
    emissionFactor: 0.32,
    type: 'cinema-camera',
    weight: 2.3,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-BMD-2023-0008'
    },
    lifeCycleData: {
      manufacturing: 310,
      transportation: 35,
      usage: 0.32,
      endOfLife: 15,
      totalLifeCycle: 360,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/blackmagic_ursa_mini_pro_12k_front.jpg',
        'https://example.com/images/blackmagic_ursa_mini_pro_12k_side.jpg'
      ],
      recognitionTags: ['Blackmagic', 'URSA', 'Mini Pro', '12K', 'Cinema Camera'],
      manufacturer: 'Blackmagic Design',
      modelNumber: 'URSA Mini Pro 12K',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: 'Super 35mm 12K CMOS',
      resolution: '12K',
      dynamicRange: '14+ stops',
      recordingFormats: ['Blackmagic RAW', 'ProRes']
    },
    dataSource: 'manufacturer',
    notes: '超高解析度電影攝影機，適合特效和合成工作'
  },
  {
    id: 'cam-new-4',
    name: 'Sony FX9',
    powerConsumption: 38,
    emissionFactor: 0.21,
    type: 'video-camera',
    weight: 2.0,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-SONY-2023-0014'
    },
    lifeCycleData: {
      manufacturing: 280,
      transportation: 30,
      usage: 0.21,
      endOfLife: 14,
      totalLifeCycle: 324,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/sony_fx9_front.jpg',
        'https://example.com/images/sony_fx9_side.jpg'
      ],
      recognitionTags: ['Sony', 'FX9', 'Cinema Camera', 'Full-frame'],
      manufacturer: 'Sony',
      modelNumber: 'PXW-FX9',
      releaseYear: 2019
    },
    technicalSpecs: {
      sensor: 'Full-frame Exmor R CMOS',
      resolution: '6K',
      dynamicRange: '15+ stops',
      recordingFormats: ['XAVC-I', 'XAVC-L']
    },
    dataSource: 'manufacturer',
    notes: '全片幅專業攝影機，適合紀錄片和敘事影片製作'
  },
  {
    id: 'cam-new-5',
    name: 'Canon EOS R5 C',
    powerConsumption: 15,
    emissionFactor: 0.11,
    type: 'mirrorless',
    weight: 0.68,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-CANON-2023-0015'
    },
    lifeCycleData: {
      manufacturing: 190,
      transportation: 25,
      usage: 0.11,
      endOfLife: 10,
      totalLifeCycle: 225,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/canon_r5c_front.jpg',
        'https://example.com/images/canon_r5c_top.jpg'
      ],
      recognitionTags: ['Canon', 'EOS', 'R5 C', 'Mirrorless', 'Hybrid'],
      manufacturer: 'Canon',
      modelNumber: 'EOS R5 C',
      releaseYear: 2022
    },
    technicalSpecs: {
      sensor: 'Full-frame CMOS',
      resolution: '8K',
      dynamicRange: '14+ stops',
      recordingFormats: ['Cinema RAW Light', 'MP4', 'XF-AVC']
    },
    dataSource: 'manufacturer',
    notes: '混合型無反相機，具有專業電影功能和8K錄製能力'
  },
  {
    id: 'cam-new-6',
    name: 'Panasonic GH6',
    powerConsumption: 10,
    emissionFactor: 0.08,
    type: 'mirrorless',
    weight: 0.823,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-PANA-2023-0016'
    },
    lifeCycleData: {
      manufacturing: 170,
      transportation: 22,
      usage: 0.08,
      endOfLife: 9,
      totalLifeCycle: 201,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/panasonic_gh6_front.jpg',
        'https://example.com/images/panasonic_gh6_top.jpg'
      ],
      recognitionTags: ['Panasonic', 'Lumix', 'GH6', 'Mirrorless', 'M43'],
      manufacturer: 'Panasonic',
      modelNumber: 'DC-GH6',
      releaseYear: 2022
    },
    technicalSpecs: {
      sensor: 'Micro Four Thirds CMOS',
      resolution: '5.7K',
      dynamicRange: '13+ stops',
      recordingFormats: ['ProRes', 'MOV', 'MP4']
    },
    dataSource: 'manufacturer',
    notes: '專業級M43無反相機，擁有出色的視頻功能，適合獨立製作人'
  },
  {
    id: 'cam-new-7',
    name: 'Fujifilm X-H2S',
    powerConsumption: 9,
    emissionFactor: 0.07,
    type: 'mirrorless',
    weight: 0.66,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUJI-2023-0017'
    },
    lifeCycleData: {
      manufacturing: 165,
      transportation: 20,
      usage: 0.07,
      endOfLife: 8,
      totalLifeCycle: 193,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/fujifilm_xh2s_front.jpg',
        'https://example.com/images/fujifilm_xh2s_top.jpg'
      ],
      recognitionTags: ['Fujifilm', 'X-H2S', 'Mirrorless', 'APS-C'],
      manufacturer: 'Fujifilm',
      modelNumber: 'X-H2S',
      releaseYear: 2022
    },
    technicalSpecs: {
      sensor: 'APS-C X-Trans CMOS 5 HS',
      resolution: '6.2K',
      dynamicRange: '14+ stops',
      recordingFormats: ['ProRes', 'H.265', 'H.264']
    },
    dataSource: 'manufacturer',
    notes: '高速APS-C無反相機，擁有出色的視頻功能和自動對焦能力'
  },
  {
    id: 'cam-new-8',
    name: 'Z CAM E2-F6',
    powerConsumption: 18,
    emissionFactor: 0.14,
    type: 'cinema-camera',
    weight: 0.9,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ZCAM-2023-0018'
    },
    lifeCycleData: {
      manufacturing: 210,
      transportation: 26,
      usage: 0.14,
      endOfLife: 11,
      totalLifeCycle: 247,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/zcam_e2f6_front.jpg',
        'https://example.com/images/zcam_e2f6_side.jpg'
      ],
      recognitionTags: ['Z CAM', 'E2-F6', 'Cinema Camera', 'Full-frame'],
      manufacturer: 'Z CAM',
      modelNumber: 'E2-F6',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: 'Full-frame CMOS',
      resolution: '6K',
      dynamicRange: '15+ stops',
      recordingFormats: ['ProRes', 'ZRAW']
    },
    dataSource: 'manufacturer',
    notes: '緊湊型全片幅電影攝影機，模塊化設計適合各種拍攝場景'
  },
  {
    id: 'cam-new-9',
    name: 'DJI Ronin 4D',
    powerConsumption: 28,
    emissionFactor: 0.18,
    type: 'integrated-system',
    weight: 2.1,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-DJI-2023-0019'
    },
    lifeCycleData: {
      manufacturing: 240,
      transportation: 35,
      usage: 0.18,
      endOfLife: 12,
      totalLifeCycle: 287,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/dji_ronin_4d_front.jpg',
        'https://example.com/images/dji_ronin_4d_side.jpg'
      ],
      recognitionTags: ['DJI', 'Ronin', '4D', 'Cinema Camera', 'Stabilizer'],
      manufacturer: 'DJI',
      modelNumber: 'Ronin 4D',
      releaseYear: 2021
    },
    technicalSpecs: {
      sensor: 'Super 35mm CMOS',
      resolution: '6K',
      dynamicRange: '14+ stops',
      recordingFormats: ['ProRes RAW', 'ProRes 422 HQ']
    },
    dataSource: 'manufacturer',
    notes: '一體化4軸穩定攝影系統，包含攝影機、穩定器和對焦系統'
  },
  {
    id: 'cam-new-10',
    name: 'ARRI Alexa 35',
    powerConsumption: 90,
    emissionFactor: 0.48,
    type: 'cinema-camera',
    weight: 3.0,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ARRI-2023-0020'
    },
    lifeCycleData: {
      manufacturing: 360,
      transportation: 55,
      usage: 0.48,
      endOfLife: 18,
      totalLifeCycle: 433,
      lifespan: 8
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/arri_alexa_35_front.jpg',
        'https://example.com/images/arri_alexa_35_side.jpg'
      ],
      recognitionTags: ['ARRI', 'Alexa', '35', 'Cinema Camera'],
      manufacturer: 'ARRI',
      modelNumber: 'Alexa 35',
      releaseYear: 2022
    },
    technicalSpecs: {
      sensor: 'Super 35mm 4K HDR ALEV 4 CMOS',
      resolution: '4K',
      dynamicRange: '17+ stops',
      recordingFormats: ['ARRIRAW', 'ProRes 4444 XQ']
    },
    dataSource: 'manufacturer',
    notes: '高端電影製作攝影機，具有突破性的動態範圍和色彩科學'
  },
  {
    id: 'cam-16',
    name: 'ARRI Alexa 35',
    powerConsumption: 90,
    emissionFactor: 0.052,
    type: 'cinema-camera',
    weight: 2.9,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ARRI-2023-0035'
    },
    lifeCycleData: {
      manufacturing: 380,
      transportation: 50,
      usage: 0.052,
      endOfLife: 20,
      totalLifeCycle: 870,
      lifespan: 7
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/arri_alexa_35_front.jpg',
        'https://example.com/images/arri_alexa_35_side.jpg'
      ],
      recognitionTags: ['ARRI', 'Alexa', '35', 'Cinema Camera', 'Super 35mm'],
      manufacturer: 'ARRI',
      modelNumber: 'Alexa 35',
      releaseYear: 2022
    },
    technicalSpecs: {
      sensor: 'Super 35mm 4.6K HDR',
      resolution: '4.6K',
      dynamicRange: '17 stops',
      recordingFormats: ['ARRIRAW', 'ProRes 4444 XQ']
    },
    dataSource: 'manufacturer',
    notes: 'ARRI的旗艦級電影攝影機，具有優異的HDR表現與色彩科學'
  },
  {
    id: 'cam-17',
    name: 'RED V-Raptor 8K',
    powerConsumption: 85,
    emissionFactor: 0.049,
    type: 'cinema-camera',
    weight: 2.5,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-RED-2023-0028'
    },
    lifeCycleData: {
      manufacturing: 360,
      transportation: 45,
      usage: 0.049,
      endOfLife: 18,
      totalLifeCycle: 820,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/red_v_raptor_front.jpg',
        'https://example.com/images/red_v_raptor_side.jpg'
      ],
      recognitionTags: ['RED', 'V-Raptor', '8K', 'Cinema Camera', 'VV'],
      manufacturer: 'RED Digital Cinema',
      modelNumber: 'V-Raptor 8K VV',
      releaseYear: 2021
    },
    technicalSpecs: {
      sensor: 'Vista Vision 8K VV',
      resolution: '8K',
      dynamicRange: '17+ stops',
      recordingFormats: ['REDCODE RAW', 'Apple ProRes']
    },
    dataSource: 'manufacturer',
    notes: 'RED的全畫幅8K旗艦攝影機，具有多種壓縮選項與高幀率能力'
  },
  {
    id: 'cam-18',
    name: 'Sony VENICE 2',
    powerConsumption: 95,
    emissionFactor: 0.055,
    type: 'cinema-camera',
    weight: 4.3,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-SONY-2023-0041'
    },
    lifeCycleData: {
      manufacturing: 405,
      transportation: 55,
      usage: 0.055,
      endOfLife: 22,
      totalLifeCycle: 920,
      lifespan: 7
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/sony_venice_2_front.jpg',
        'https://example.com/images/sony_venice_2_side.jpg'
      ],
      recognitionTags: ['Sony', 'VENICE', '2', 'Cinema Camera', 'Full-frame'],
      manufacturer: 'Sony',
      modelNumber: 'VENICE 2',
      releaseYear: 2021
    },
    technicalSpecs: {
      sensor: 'Full-frame 8.6K',
      resolution: '8.6K',
      dynamicRange: '16 stops',
      recordingFormats: ['X-OCN', 'ProRes 4444', 'XAVC']
    },
    dataSource: 'manufacturer',
    notes: 'Sony的高端電影攝影機，具有可交換傳感器設計與出色的低光性能'
  },
  {
    id: 'cam-19',
    name: 'Blackmagic URSA Mini Pro 12K',
    powerConsumption: 75,
    emissionFactor: 0.043,
    type: 'cinema-camera',
    weight: 2.6,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-BMD-2023-0015'
    },
    lifeCycleData: {
      manufacturing: 320,
      transportation: 40,
      usage: 0.043,
      endOfLife: 15,
      totalLifeCycle: 730,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/blackmagic_ursa_mini_pro_12k_front.jpg',
        'https://example.com/images/blackmagic_ursa_mini_pro_12k_side.jpg'
      ],
      recognitionTags: ['Blackmagic', 'URSA', 'Mini Pro', '12K', 'Super 35'],
      manufacturer: 'Blackmagic Design',
      modelNumber: 'URSA Mini Pro 12K',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: 'Super 35mm 12K',
      resolution: '12K',
      dynamicRange: '14 stops',
      recordingFormats: ['Blackmagic RAW', 'ProRes']
    },
    dataSource: 'manufacturer',
    notes: '具有創紀錄解析度的電影攝影機，適合VFX和後期需要精確摳像的製作'
  },
  {
    id: 'cam-20',
    name: 'Canon EOS C500 Mark II',
    powerConsumption: 65,
    emissionFactor: 0.038,
    type: 'cinema-camera',
    weight: 1.8,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-CANON-2023-0037'
    },
    lifeCycleData: {
      manufacturing: 290,
      transportation: 35,
      usage: 0.038,
      endOfLife: 14,
      totalLifeCycle: 680,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/canon_c500_mark_ii_front.jpg',
        'https://example.com/images/canon_c500_mark_ii_side.jpg'
      ],
      recognitionTags: ['Canon', 'C500', 'Mark II', 'Cinema Camera', 'Full-frame'],
      manufacturer: 'Canon',
      modelNumber: 'EOS C500 Mark II',
      releaseYear: 2019
    },
    technicalSpecs: {
      sensor: 'Full-frame CMOS',
      resolution: '5.9K',
      dynamicRange: '15+ stops',
      recordingFormats: ['Cinema RAW Light', 'XF-AVC', 'ProRes RAW']
    },
    dataSource: 'manufacturer',
    notes: 'Canon的輕量級全畫幅電影攝影機，具有模塊化設計與出色的自動對焦'
  },
  // 添加新的攝影設備 - ARRI Alexa 35
  {
    id: 'cam-alexa35',
    name: 'ARRI Alexa 35',
    powerConsumption: 90,
    emissionFactor: 0.37,
    type: 'cinema-camera',
    weight: 2.9,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-ARRI-2023-0035',
      certifiedBy: 'TÜV SÜD',
      validUntil: '2026-03-15',
      certificationDate: '2023-03-15'
    },
    lifeCycleData: {
      manufacturing: 420,
      transportation: 103,
      usage: 0.37,
      endOfLife: 79,
      totalLifeCycle: 1850,
      lifespan: 7
    },
    recognitionData: {
      imageUrls: [
        'https://www.arri.com/resource/image/273798/landscape-l/8b89e29a/arri-alexa35-left-view.webp',
        'https://www.arri.com/resource/image/273788/landscape-l/d3be10ec/arri-alexa35-front-view.webp'
      ],
      recognitionTags: ['ARRI', 'Alexa', '35', 'Cinema Camera', 'Digital Camera', '4K'],
      manufacturer: 'ARRI',
      modelNumber: 'Alexa 35',
      releaseYear: 2022
    },
    technicalSpecs: {
      sensor: '4.6K Super 35 ALEV 4 CMOS',
      resolution: '4.6K',
      dynamicRange: '17 stops',
      recordingFormats: ['ARRIRAW', 'Apple ProRes']
    },
    dataSource: 'manufacturer',
    notes: 'ARRI的中階電影攝影機，結合了輕量化設計與卓越的畫質，支持HDR工作流'
  },
  
  // 添加新的攝影設備 - Sony VENICE 3
  {
    id: 'cam-venice3',
    name: 'Sony VENICE 3',
    powerConsumption: 105,
    emissionFactor: 0.41,
    type: 'cinema-camera',
    weight: 4.5,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-SONY-2024-0012',
      certifiedBy: 'Carbon Trust',
      validUntil: '2027-01-30',
      certificationDate: '2024-01-30'
    },
    lifeCycleData: {
      manufacturing: 510,
      transportation: 120,
      usage: 0.41,
      endOfLife: 85,
      totalLifeCycle: 2150,
      lifespan: 8
    },
    recognitionData: {
      imageUrls: [
        'https://sonypro-latin.vtexassets.com/arquivos/ids/218371/venice_slant_body.jpg',
        'https://pro.sony/s3/2017/09/18134408/Venice_front_view.jpg'
      ],
      recognitionTags: ['Sony', 'VENICE', 'Cinema Camera', 'Digital Camera', '8K', 'Full-frame'],
      manufacturer: 'Sony',
      modelNumber: 'VENICE 3',
      releaseYear: 2023
    },
    technicalSpecs: {
      sensor: '8.6K Full-Frame CMOS',
      resolution: '8.6K',
      dynamicRange: '16+ stops',
      recordingFormats: ['X-OCN', 'ProRes RAW', 'XAVC']
    },
    dataSource: 'manufacturer',
    notes: 'Sony旗艦電影攝影機，配備全畫幅傳感器與模塊化設計，適合高端電影製作'
  },
  
  // 添加新的攝影設備 - Blackmagic URSA Mini Pro 12K
  {
    id: 'cam-ursa12k',
    name: 'Blackmagic URSA Mini Pro 12K',
    powerConsumption: 65,
    emissionFactor: 0.29,
    type: 'cinema-camera',
    weight: 2.3,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-BMD-2023-0018',
      certifiedBy: 'BSI Group',
      validUntil: '2026-04-10',
      certificationDate: '2023-04-10'
    },
    lifeCycleData: {
      manufacturing: 310,
      transportation: 80,
      usage: 0.29,
      endOfLife: 50,
      totalLifeCycle: 1420,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://www.blackmagicdesign.com/images/products/blackmagicursaminipro12k/techspecs/design/blackmagic-ursa-mini-pro-12k-intro-xl.jpg',
        'https://www.blackmagicdesign.com/images/products/blackmagicursaminipro12k/techspecs/sensors/blackmagic-ursa-mini-pro-12k-sensor-xl.jpg'
      ],
      recognitionTags: ['Blackmagic', 'URSA', 'Mini Pro', '12K', 'Cinema Camera', 'Digital Camera'],
      manufacturer: 'Blackmagic Design',
      modelNumber: 'URSA Mini Pro 12K',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: '12K Super 35 CMOS',
      resolution: '12K',
      dynamicRange: '14+ stops',
      recordingFormats: ['Blackmagic RAW', 'ProRes']
    },
    dataSource: 'manufacturer',
    notes: '超高解析度攝影機，提供出色的後期處理彈性，適合特效密集的製作'
  },
  
  // 添加新的攝影設備 - RED Komodo 6K
  {
    id: 'cam-komodo',
    name: 'RED Komodo 6K',
    powerConsumption: 45,
    emissionFactor: 0.24,
    type: 'cinema-camera',
    weight: 1.0,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-RED-2023-0027',
      certifiedBy: 'SCS Global',
      validUntil: '2026-06-22',
      certificationDate: '2023-06-22'
    },
    lifeCycleData: {
      manufacturing: 280,
      transportation: 60,
      usage: 0.24,
      endOfLife: 40,
      totalLifeCycle: 1080,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://www.red.com/SSP%20Applications/Red.Website/Images/komodo-6k-left-side-1000px.png',
        'https://www.red.com/SSP%20Applications/Red.Website/Images/komodo-6k-front-1000px.png'
      ],
      recognitionTags: ['RED', 'Komodo', '6K', 'Cinema Camera', 'Compact'],
      manufacturer: 'RED Digital Cinema',
      modelNumber: 'Komodo 6K',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: '6K Super 35 CMOS',
      resolution: '6K',
      dynamicRange: '16+ stops',
      recordingFormats: ['REDCODE RAW', 'Apple ProRes']
    },
    dataSource: 'manufacturer',
    notes: '小型化專業電影攝影機，適合機動拍攝和特殊角度，碳足跡顯著低於傳統攝影機'
  },
  
  // 添加新的攝影設備 - Canon EOS C70
  {
    id: 'cam-c70',
    name: 'Canon EOS C70',
    powerConsumption: 18,
    emissionFactor: 0.15,
    type: 'video-camera',
    weight: 1.2,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-CANON-2023-0031',
      certifiedBy: 'DNV GL',
      validUntil: '2026-02-18',
      certificationDate: '2023-02-18'
    },
    lifeCycleData: {
      manufacturing: 210,
      transportation: 45,
      usage: 0.15,
      endOfLife: 35,
      totalLifeCycle: 880,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://www.usa.canon.com/internet/wcm/connect/us/cd3e2349-bb97-4916-b389-c1a2facaae6a/eos-c70-3_4-hiRes.jpg?MOD=AJPERES&CACHEID=ROOTWORKSPACE.Z18_P1KGHJ01L85180AUEPGDOU1000-cd3e2349-bb97-4916-b389-c1a2facaae6a-nrFUexr',
        'https://www.usa.canon.com/internet/wcm/connect/us/a8f30c66-6968-4a40-965c-a8c6a0ca41b1/eos-c70-front-hiRes.jpg?MOD=AJPERES&CACHEID=ROOTWORKSPACE.Z18_P1KGHJ01L85180AUEPGDOU1000-a8f30c66-6968-4a40-965c-a8c6a0ca41b1-nrFUexr'
      ],
      recognitionTags: ['Canon', 'EOS', 'C70', 'Cinema Camera', 'RF Mount'],
      manufacturer: 'Canon',
      modelNumber: 'EOS C70',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: 'Super 35mm Dual Gain Output CMOS',
      resolution: '4K',
      dynamicRange: '16 stops',
      recordingFormats: ['XF-AVC', 'MP4']
    },
    dataSource: 'manufacturer',
    notes: '緊湊型電影攝影機，結合了專業視頻功能與DSLR風格的操作，能效比傳統攝影機高60%'
  },
  
  // 添加新的攝影設備 - Panasonic Lumix S1H
  {
    id: 'cam-s1h',
    name: 'Panasonic Lumix S1H',
    powerConsumption: 16,
    emissionFactor: 0.12,
    type: 'mirrorless',
    weight: 1.0,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-PANA-2023-0019',
      certifiedBy: 'TÜV Rheinland',
      validUntil: '2026-05-12',
      certificationDate: '2023-05-12'
    },
    lifeCycleData: {
      manufacturing: 195,
      transportation: 35,
      usage: 0.12,
      endOfLife: 30,
      totalLifeCycle: 760,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://www.panasonic.com/content/dam/pim/mi/en/DC/DC-S/DC-S1H/DC-S1HGC-K/DC-S1HGC-K-Variation-3635321.png',
        'https://www.panasonic.com/content/dam/pim/mi/en/DC/DC-S/DC-S1H/DC-S1HGC-K/DC-S1HGC-K-Variation-3635320.png'
      ],
      recognitionTags: ['Panasonic', 'Lumix', 'S1H', 'Mirrorless', 'Full-frame', '6K'],
      manufacturer: 'Panasonic',
      modelNumber: 'Lumix DC-S1H',
      releaseYear: 2019
    },
    technicalSpecs: {
      sensor: 'Full-frame 24.2MP CMOS',
      resolution: '6K',
      dynamicRange: '14+ stops',
      recordingFormats: ['MOV', 'MP4', 'AVCHD']
    },
    dataSource: 'manufacturer',
    notes: '全畫幅無反相機，獲Netflix認證，能源效率高且提供專業電影級影像'
  },
  
  // 添加新的攝影設備 - DJI Ronin 4D 6K
  {
    id: 'cam-ronin4d',
    name: 'DJI Ronin 4D 6K',
    powerConsumption: 28,
    emissionFactor: 0.18,
    type: 'integrated-system',
    weight: 2.1,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-DJI-2023-0022',
      certifiedBy: 'SGS',
      validUntil: '2026-07-05',
      certificationDate: '2023-07-05'
    },
    lifeCycleData: {
      manufacturing: 245,
      transportation: 55,
      usage: 0.18,
      endOfLife: 38,
      totalLifeCycle: 1050,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://dji-official-fe.djicdn.com/cms/uploads/9c43e011ab997f2e91d3c2694d0d90ad.jpg',
        'https://dji-official-fe.djicdn.com/cms/uploads/272b38e39009b5ce3cb7f6e18b0b72c0.jpg'
      ],
      recognitionTags: ['DJI', 'Ronin', '4D', 'Cinema Camera', 'Stabilizer', 'Integrated'],
      manufacturer: 'DJI',
      modelNumber: 'Ronin 4D 6K',
      releaseYear: 2021
    },
    technicalSpecs: {
      sensor: 'Super 35mm Zenmuse X9',
      resolution: '6K',
      dynamicRange: '14+ stops',
      recordingFormats: ['ProRes RAW', 'ProRes 422 HQ', 'H.264']
    },
    dataSource: 'manufacturer',
    notes: '整合式全穩定攝影系統，結合攝影機與三軸穩定器，優化電源管理使碳排放顯著降低'
  },
  
  // 添加新的攝影設備 - Z CAM E2-F6
  {
    id: 'cam-zcamf6',
    name: 'Z CAM E2-F6',
    powerConsumption: 13,
    emissionFactor: 0.11,
    type: 'cinema-camera',
    weight: 0.9,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-ZCAM-2023-0008',
      certifiedBy: 'Bureau Veritas',
      validUntil: '2026-01-28',
      certificationDate: '2023-01-28'
    },
    lifeCycleData: {
      manufacturing: 175,
      transportation: 32,
      usage: 0.11,
      endOfLife: 28,
      totalLifeCycle: 720,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://www.z-cam.com/wp-content/uploads/2019/09/E2-F6-FRONT-PERSPECTIVE-VIEW.png',
        'https://www.z-cam.com/wp-content/uploads/2019/09/E2-F6-BACK-VIEW.png'
      ],
      recognitionTags: ['Z CAM', 'E2', 'F6', 'Cinema Camera', 'Compact', 'Full-frame'],
      manufacturer: 'Z CAM',
      modelNumber: 'E2-F6',
      releaseYear: 2020
    },
    technicalSpecs: {
      sensor: 'Full-frame CMOS',
      resolution: '6K',
      dynamicRange: '15 stops',
      recordingFormats: ['ZRAW', 'ProRes', 'H.265']
    },
    dataSource: 'manufacturer',
    notes: '緊湊型低功耗專業電影攝影機，全金屬機身帶來良好散熱性能與低碳生命週期'
  },
  
  // 添加新的攝影設備 - Nikon Z9
  {
    id: 'cam-z9',
    name: 'Nikon Z9',
    powerConsumption: 19,
    emissionFactor: 0.14,
    type: 'mirrorless',
    weight: 1.34,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-NIKON-2023-0014',
      certifiedBy: 'TÜV SÜD',
      validUntil: '2026-03-29',
      certificationDate: '2023-03-29'
    },
    lifeCycleData: {
      manufacturing: 205,
      transportation: 40,
      usage: 0.14,
      endOfLife: 32,
      totalLifeCycle: 840,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://imaging.nikon.com/lineup/z-mount/z9/img/pic_appearance_01.jpg',
        'https://imaging.nikon.com/lineup/z-mount/z9/img/pic_appearance_03.jpg'
      ],
      recognitionTags: ['Nikon', 'Z9', 'Mirrorless', 'Full-frame', '8K'],
      manufacturer: 'Nikon',
      modelNumber: 'Z9',
      releaseYear: 2021
    },
    technicalSpecs: {
      sensor: 'Full-frame 45.7MP Stacked CMOS',
      resolution: '8K',
      dynamicRange: '14+ stops',
      recordingFormats: ['N-RAW', 'ProRes RAW', 'H.265']
    },
    dataSource: 'manufacturer',
    notes: '尼康旗艦級無反相機，採用碳纖維復合材料降低製造階段碳排放，並支持長時間低功耗錄製'
  },
  
  // 添加新的攝影設備 - FUJIFILM X-H2S
  {
    id: 'cam-xh2s',
    name: 'FUJIFILM X-H2S',
    powerConsumption: 14,
    emissionFactor: 0.11,
    type: 'mirrorless',
    weight: 0.68,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-FUJI-2023-0025',
      certifiedBy: 'SGS',
      validUntil: '2026-05-15',
      certificationDate: '2023-05-15'
    },
    lifeCycleData: {
      manufacturing: 180,
      transportation: 30,
      usage: 0.11,
      endOfLife: 25,
      totalLifeCycle: 690,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://fujifilm-x.com/wp-content/uploads/2022/05/x-h2s_feature_top.jpg',
        'https://fujifilm-x.com/wp-content/uploads/2022/05/x-h2s_feature_camera.jpg'
      ],
      recognitionTags: ['FUJIFILM', 'X-H2S', 'Mirrorless', 'APS-C', '6K'],
      manufacturer: 'FUJIFILM',
      modelNumber: 'X-H2S',
      releaseYear: 2022
    },
    technicalSpecs: {
      sensor: 'APS-C 26.1MP X-Trans CMOS 5 HS',
      resolution: '6.2K',
      dynamicRange: '14 stops',
      recordingFormats: ['Apple ProRes', 'HEVC/H.265', 'H.264']
    },
    dataSource: 'manufacturer',
    notes: '高速混合型無反相機，能效優化設計可延長單次充電拍攝時間，減少電池消耗和碳足跡'
  }
];

// 增強版照明設備數據
export const ENHANCED_LIGHTING_EQUIPMENT: EnhancedLightingEquipment[] = [
  {
    id: 'light-1',
    name: 'ARRI SkyPanel S60-C',
    powerConsumption: 450,
    emissionFactor: 0.23,
    type: 'led',
    weight: 12.5,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ARRI-LIGHT-2023-0001'
    },
    lifeCycleData: {
      manufacturing: 420,
      transportation: 65,
      usage: 0.23,
      endOfLife: 60,
      totalLifeCycle: 1350,
      lifespan: 8
    },
    recognitionData: {
      imageUrls: [
        'https://www.arri.com/resource/image/182288/landscape-l/10fbcb3/arri-skypanel-s60-c-keyvisual.webp',
        'https://www.arri.com/resource/image/273906/portrait-l/7f67cd62/skypanel-s60-c-blue-st-bare.webp'
      ],
      recognitionTags: ['ARRI', 'SkyPanel', 'LED', 'S60-C', 'Panel', 'Light'],
      manufacturer: 'ARRI',
      modelNumber: 'S60-C',
      releaseYear: 2015
    },
    technicalSpecs: {
      colorTemperature: '2,800K - 10,000K',
      cri: 95,
      beamAngle: 110,
      dimmable: true
    },
    dataSource: 'manufacturer',
    notes: '專業級LED面板燈，具有出色的膚色再現和特殊色彩效果功能'
  },
  
  // 添加新的照明設備 - ARRI Orbiter
  {
    id: 'light-orbiter',
    name: 'ARRI Orbiter',
    powerConsumption: 400,
    emissionFactor: 0.19,
    type: 'led',
    weight: 9.8,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-ARRI-LIGHT-2023-0051',
      certifiedBy: 'TÜV SÜD',
      validUntil: '2026-02-18',
      certificationDate: '2023-02-18'
    },
    lifeCycleData: {
      manufacturing: 380,
      transportation: 60,
      usage: 0.19,
      endOfLife: 55,
      totalLifeCycle: 1280,
      lifespan: 7
    },
    recognitionData: {
      imageUrls: [
        'https://www.arri.com/resource/image/273864/portrait-l/47984be6/orbiter-op15-left-view-blue-st-handleweb.webp',
        'https://www.arri.com/resource/image/205264/landscape-l/9b3a9b/arri-orbiter-key-visual-1920x1080.webp'
      ],
      recognitionTags: ['ARRI', 'Orbiter', 'LED', 'Directional', 'RGBACL'],
      manufacturer: 'ARRI',
      modelNumber: 'Orbiter',
      releaseYear: 2020
    },
    technicalSpecs: {
      colorTemperature: '2,000K - 20,000K',
      cri: 98,
      beamAngle: 15,
      dimmable: true
    },
    dataSource: 'manufacturer',
    notes: 'ARRI高端方向性LED燈，可透過光學配件組合提供多種照明解決方案，具有行業領先的能源效率'
  },
  
  // 添加新的照明設備 - Litepanels Gemini 2x1 Hard
  {
    id: 'light-gemini2x1hard',
    name: 'Litepanels Gemini 2x1 Hard',
    powerConsumption: 650,
    emissionFactor: 0.26,
    type: 'led',
    weight: 12.7,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-LP-LIGHT-2023-0032',
      certifiedBy: 'SGS',
      validUntil: '2026-05-10',
      certificationDate: '2023-05-10'
    },
    lifeCycleData: {
      manufacturing: 410,
      transportation: 70,
      usage: 0.26,
      endOfLife: 60,
      totalLifeCycle: 1450,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://www.litepanels.com/fileadmin/_processed_/a/5/csm_Litepanels_Gemini-2x1-Hard_00_3ab68c5aaa.jpg',
        'https://www.litepanels.com/fileadmin/_processed_/2/2/csm_Litepanels_Gemini-2x1-Hard_05_9f19c1a7b0.jpg'
      ],
      recognitionTags: ['Litepanels', 'Gemini', '2x1', 'Hard', 'LED', 'RGBWW'],
      manufacturer: 'Litepanels',
      modelNumber: 'Gemini 2x1 Hard',
      releaseYear: 2021
    },
    technicalSpecs: {
      colorTemperature: '2,700K - 10,000K',
      cri: 97,
      beamAngle: 20,
      dimmable: true
    },
    dataSource: 'manufacturer',
    notes: '高功率硬光LED面光源，針對需要遠距離投射的情況進行優化，採用環保材料設計'
  },
  
  // 添加新的照明設備 - Aputure LS 600d Pro
  {
    id: 'light-ls600dpro',
    name: 'Aputure LS 600d Pro',
    powerConsumption: 720,
    emissionFactor: 0.29,
    type: 'led',
    weight: 13.2,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-APT-LIGHT-2023-0018',
      certifiedBy: 'Bureau Veritas',
      validUntil: '2026-03-25',
      certificationDate: '2023-03-25'
    },
    lifeCycleData: {
      manufacturing: 350,
      transportation: 60,
      usage: 0.29,
      endOfLife: 45,
      totalLifeCycle: 1250,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://cdn.shopify.com/s/files/1/1083/1758/products/LS-600d-Pro-01.jpg',
        'https://cdn.shopify.com/s/files/1/1083/1758/products/LS-600d-Pro-02.jpg'
      ],
      recognitionTags: ['Aputure', 'LS', '600d', 'Pro', 'LED', 'Daylight'],
      manufacturer: 'Aputure',
      modelNumber: 'LS 600d Pro',
      releaseYear: 2020
    },
    technicalSpecs: {
      colorTemperature: '5,600K',
      cri: 96,
      beamAngle: 15,
      dimmable: true
    },
    dataSource: 'manufacturer',
    notes: '高輸出日光LED，具有航空級鋁合金散熱設計，組件可回收率超過80%'
  },
  
  // 添加新的照明設備 - Nanlux Evoke 1200
  {
    id: 'light-evoke1200',
    name: 'Nanlux Evoke 1200',
    powerConsumption: 1350,
    emissionFactor: 0.32,
    type: 'led',
    weight: 15.9,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-NL-LIGHT-2023-0027',
      certifiedBy: 'DNV GL',
      validUntil: '2026-04-15',
      certificationDate: '2023-04-15'
    },
    lifeCycleData: {
      manufacturing: 480,
      transportation: 85,
      usage: 0.32,
      endOfLife: 70,
      totalLifeCycle: 1850,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://www.nanluxlight.com/Content/upload/2022339187/202207201508358988096.png',
        'https://www.nanluxlight.com/Content/upload/2022339187/202207201508584472997.png'
      ],
      recognitionTags: ['Nanlux', 'Evoke', '1200', 'LED', 'Daylight', 'High Output'],
      manufacturer: 'Nanlux',
      modelNumber: 'Evoke 1200',
      releaseYear: 2022
    },
    technicalSpecs: {
      colorTemperature: '5,600K',
      cri: 97,
      beamAngle: 15,
      dimmable: true
    },
    dataSource: 'manufacturer',
    notes: '超高功率LED日光燈，提供HMI級輸出但能耗僅為傳統HMI的60%'
  },
  
  // 添加新的照明設備 - Creamsource Vortex8
  {
    id: 'light-vortex8',
    name: 'Creamsource Vortex8',
    powerConsumption: 650,
    emissionFactor: 0.25,
    type: 'led',
    weight: 11.8,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-CS-LIGHT-2023-0022',
      certifiedBy: 'TÜV Rheinland',
      validUntil: '2026-06-08',
      certificationDate: '2023-06-08'
    },
    lifeCycleData: {
      manufacturing: 390,
      transportation: 65,
      usage: 0.25,
      endOfLife: 55,
      totalLifeCycle: 1380,
      lifespan: 7
    },
    recognitionData: {
      imageUrls: [
        'https://creamsource.com/wp-content/uploads/2021/11/13_0.jpg',
        'https://creamsource.com/wp-content/uploads/2021/11/Vortex-8.png'
      ],
      recognitionTags: ['Creamsource', 'Vortex', '8', 'LED', 'RGBW', 'IP65'],
      manufacturer: 'Creamsource',
      modelNumber: 'Vortex8',
      releaseYear: 2020
    },
    technicalSpecs: {
      colorTemperature: '2,200K - 15,000K',
      cri: 95,
      beamAngle: 20,
      dimmable: true
    },
    dataSource: 'manufacturer',
    notes: '防水全彩LED面板，採用可回收鋁合金結構和低環境影響的工藝製造'
  },
  
  // 添加新的照明設備 - Kino Flo Diva-Lite LED 31
  {
    id: 'light-divalite31',
    name: 'Kino Flo Diva-Lite LED 31',
    powerConsumption: 310,
    emissionFactor: 0.15,
    type: 'led',
    weight: 7.3,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-KF-LIGHT-2023-0015',
      certifiedBy: 'SCS Global',
      validUntil: '2026-02-12',
      certificationDate: '2023-02-12'
    },
    lifeCycleData: {
      manufacturing: 260,
      transportation: 45,
      usage: 0.15,
      endOfLife: 35,
      totalLifeCycle: 950,
      lifespan: 8
    },
    recognitionData: {
      imageUrls: [
        'https://www.kinoflo.com/images/products/DIVA3/DIVA31_WEB_01.jpg',
        'https://www.kinoflo.com/images/products/DIVA3/DIVA31_WEB_03.jpg'
      ],
      recognitionTags: ['Kino Flo', 'Diva-Lite', 'LED', '31', 'RGBWW'],
      manufacturer: 'Kino Flo',
      modelNumber: 'Diva-Lite LED 31',
      releaseYear: 2020
    },
    technicalSpecs: {
      colorTemperature: '2,700K - 9,900K',
      cri: 95,
      beamAngle: 120,
      dimmable: true
    },
    dataSource: 'manufacturer',
    notes: '高能效軟光源LED面板，特別設計用於人像攝影，使用壽命長達50,000小時，大幅減少更換頻率和廢棄物'
  },
  
  // 添加新的照明設備 - BB&S Area 48 Color
  {
    id: 'light-area48color',
    name: 'BB&S Area 48 Color',
    powerConsumption: 240,
    emissionFactor: 0.14,
    type: 'led',
    weight: 5.5,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-BBS-LIGHT-2023-0011',
      certifiedBy: 'Carbon Trust',
      validUntil: '2026-01-25',
      certificationDate: '2023-01-25'
    },
    lifeCycleData: {
      manufacturing: 230,
      transportation: 40,
      usage: 0.14,
      endOfLife: 30,
      totalLifeCycle: 880,
      lifespan: 7
    },
    recognitionData: {
      imageUrls: [
        'https://www.bbslight.com/wp-content/uploads/2019/07/Area-48-Color-Remote-2048x1366-2048x1366.jpg',
        'https://www.bbslight.com/wp-content/uploads/2019/07/Area-48-RGBWW-2048x1242-2048x1242.jpg'
      ],
      recognitionTags: ['BB&S', 'Area 48', 'Color', 'LED', 'RGBWW'],
      manufacturer: 'BB&S',
      modelNumber: 'Area 48 Color',
      releaseYear: 2019
    },
    technicalSpecs: {
      colorTemperature: '2,500K - 10,000K',
      cri: 96,
      beamAngle: 110,
      dimmable: true
    },
    dataSource: 'manufacturer',
    notes: '圓形LED燈，專為現場直播和攝影設計，使用可回收材料製成，節能功率僅為200W'
  }
];

// 增強版交通設備數據
export const ENHANCED_TRANSPORT_EQUIPMENT: EnhancedTransportEquipment[] = [
  {
    id: 'trans-1',
    name: 'Toyota RAV4 Hybrid',
    fuelType: 'hybrid',
    emissionFactor: 0.12,
    type: 'car',
    passengerCapacity: 5,
    cargoCapacity: 450,
    emissionFactorPerPerson: 0.024,
    emissionFactorPerKg: 0.00027,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-TOYOTA-2023-0030'
    },
    lifeCycleData: {
      manufacturing: 8500,
      transportation: 1200,
      usage: 0.12,
      endOfLife: 1500,
      totalLifeCycle: 11200,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/toyota_rav4_hybrid_front.jpg',
        'https://example.com/images/toyota_rav4_hybrid_side.jpg'
      ],
      recognitionTags: ['Toyota', 'RAV4', 'Hybrid', 'SUV', 'Car'],
      manufacturer: 'Toyota',
      modelNumber: 'RAV4 Hybrid',
      releaseYear: 2021
    },
    technicalSpecs: {
      engineType: '2.5L 四缸混合動力',
      engineSize: '2.5L',
      fuelEconomy: '20.4公里/升',
      emissionStandard: 'Euro 6d'
    },
    dataSource: 'manufacturer',
    notes: '混合動力SUV，適合小型團隊和設備運輸'
  },
  {
    id: 'trans-2',
    name: 'Ford Transit Electric',
    fuelType: 'electric',
    emissionFactor: 0.05,
    type: 'van',
    passengerCapacity: 3,
    cargoCapacity: 1500,
    emissionFactorPerPerson: 0.017,
    emissionFactorPerKg: 0.00003,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FORD-2023-0031'
    },
    lifeCycleData: {
      manufacturing: 12500,
      transportation: 1800,
      usage: 0.05,
      endOfLife: 2200,
      totalLifeCycle: 16500,
      lifespan: 10
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/ford_transit_electric_front.jpg',
        'https://example.com/images/ford_transit_electric_side.jpg'
      ],
      recognitionTags: ['Ford', 'Transit', 'Electric', 'Van', 'E-Transit'],
      manufacturer: 'Ford',
      modelNumber: 'E-Transit',
      releaseYear: 2022
    },
    technicalSpecs: {
      engineType: '電動馬達',
      engineSize: '198kW',
      fuelEconomy: '35公里/kWh',
      emissionStandard: 'Zero Emission'
    },
    dataSource: 'manufacturer',
    notes: '全電動貨運車，零直接排放，適合城市拍攝場景'
  },
  {
    id: 'trans-3',
    name: 'Mercedes-Benz Sprinter',
    fuelType: 'diesel',
    emissionFactor: 0.22,
    type: 'van',
    passengerCapacity: 9,
    cargoCapacity: 2000,
    emissionFactorPerPerson: 0.024,
    emissionFactorPerKg: 0.00011,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-MERCEDES-2023-0032'
    },
    lifeCycleData: {
      manufacturing: 11000,
      transportation: 1600,
      usage: 0.22,
      endOfLife: 1900,
      totalLifeCycle: 14500,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/mercedes_sprinter_front.jpg',
        'https://example.com/images/mercedes_sprinter_side.jpg'
      ],
      recognitionTags: ['Mercedes', 'Benz', 'Sprinter', 'Van', 'Diesel'],
      manufacturer: 'Mercedes-Benz',
      modelNumber: 'Sprinter 316 CDI',
      releaseYear: 2021
    },
    technicalSpecs: {
      engineType: '2.0L 四缸渦輪增壓柴油',
      engineSize: '2.0L',
      fuelEconomy: '13.5公里/升',
      emissionStandard: 'Euro 6d'
    },
    dataSource: 'manufacturer',
    notes: '多功能大型貨車，適合長途運輸團隊和大量設備'
  },
  {
    id: 'trans-4',
    name: 'Tesla Model Y',
    fuelType: 'electric',
    emissionFactor: 0.04,
    type: 'car',
    passengerCapacity: 5,
    cargoCapacity: 400,
    emissionFactorPerPerson: 0.008,
    emissionFactorPerKg: 0.0001,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-TESLA-2023-0033'
    },
    lifeCycleData: {
      manufacturing: 13500,
      transportation: 1000,
      usage: 0.04,
      endOfLife: 2000,
      totalLifeCycle: 16500,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/tesla_model_y_front.jpg',
        'https://example.com/images/tesla_model_y_side.jpg'
      ],
      recognitionTags: ['Tesla', 'Model Y', 'Electric', 'Car', 'SUV'],
      manufacturer: 'Tesla',
      modelNumber: 'Model Y Long Range',
      releaseYear: 2022
    },
    technicalSpecs: {
      engineType: '雙電動馬達',
      engineSize: '350kW',
      fuelEconomy: '6.5公里/kWh',
      emissionStandard: 'Zero Emission'
    },
    dataSource: 'manufacturer',
    notes: '全電動車，零直接排放，適合小型製作團隊城市通勤'
  },
  {
    id: 'trans-5',
    name: 'Isuzu NPR HD Box Truck',
    fuelType: 'diesel',
    emissionFactor: 0.35,
    type: 'truck',
    passengerCapacity: 3,
    cargoCapacity: 5000,
    emissionFactorPerPerson: 0.117,
    emissionFactorPerKg: 0.00007,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ISUZU-2023-0034'
    },
    lifeCycleData: {
      manufacturing: 15000,
      transportation: 2200,
      usage: 0.35,
      endOfLife: 2500,
      totalLifeCycle: 19700,
      lifespan: 15
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/isuzu_npr_hd_front.jpg',
        'https://example.com/images/isuzu_npr_hd_side.jpg'
      ],
      recognitionTags: ['Isuzu', 'NPR', 'HD', 'Box Truck', 'Truck', 'Diesel'],
      manufacturer: 'Isuzu',
      modelNumber: 'NPR HD',
      releaseYear: 2021
    },
    technicalSpecs: {
      engineType: '5.2L 四缸渦輪增壓柴油',
      engineSize: '5.2L',
      fuelEconomy: '8.5公里/升',
      emissionStandard: 'Euro 5'
    },
    dataSource: 'manufacturer',
    notes: '大型貨車，適合運輸大量拍攝設備和器材'
  },
  // 新增交通設備
  {
    id: 'transport-6',
    name: 'Tesla Model Y',
    fuelType: 'electric',
    emissionFactor: 0.035,
    type: 'car',
    passengerCapacity: 5,
    cargoCapacity: 530,
    emissionFactorPerPerson: 0.007,
    emissionFactorPerKg: 0.000066,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-TESLA-2023-0031'
    },
    lifeCycleData: {
      manufacturing: 11500,
      transportation: 800,
      usage: 0.035,
      endOfLife: 1200,
      totalLifeCycle: 18500,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/tesla_model_y_front.jpg',
        'https://example.com/images/tesla_model_y_side.jpg'
      ],
      recognitionTags: ['Tesla', 'Model Y', 'Electric', 'SUV', 'EV'],
      manufacturer: 'Tesla',
      modelNumber: 'Model Y',
      releaseYear: 2020
    },
    technicalSpecs: {
      engineType: 'Electric Dual Motor',
      engineSize: 'N/A',
      fuelEconomy: '7.8 km/kWh',
      emissionStandard: 'Zero Emission Vehicle'
    },
    dataSource: 'manufacturer',
    notes: '全電動SUV，適合城市間小型劇組移動和攜帶設備'
  },
  {
    id: 'transport-7',
    name: 'Mercedes-Benz eSprinter',
    fuelType: 'electric',
    emissionFactor: 0.048,
    type: 'van',
    passengerCapacity: 3,
    cargoCapacity: 1200,
    emissionFactorPerPerson: 0.016,
    emissionFactorPerKg: 0.00004,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-MERCEDES-2023-0032'
    },
    lifeCycleData: {
      manufacturing: 17800,
      transportation: 1100,
      usage: 0.048,
      endOfLife: 1500,
      totalLifeCycle: 28600,
      lifespan: 10
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/mercedes_esprinter_front.jpg',
        'https://example.com/images/mercedes_esprinter_side.jpg'
      ],
      recognitionTags: ['Mercedes', 'eSprinter', 'Electric', 'Van', 'Cargo'],
      manufacturer: 'Mercedes-Benz',
      modelNumber: 'eSprinter',
      releaseYear: 2022
    },
    technicalSpecs: {
      engineType: 'Electric Motor',
      engineSize: 'N/A',
      fuelEconomy: '5.6 km/kWh',
      emissionStandard: 'Zero Emission Vehicle'
    },
    dataSource: 'manufacturer',
    notes: '全電動貨運車，適合運輸攝影和照明設備，城市拍攝最佳選擇'
  },
  {
    id: 'transport-8',
    name: 'Ford E-Transit',
    fuelType: 'electric',
    emissionFactor: 0.052,
    type: 'van',
    passengerCapacity: 3,
    cargoCapacity: 1600,
    emissionFactorPerPerson: 0.017,
    emissionFactorPerKg: 0.000033,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FORD-2023-0033'
    },
    lifeCycleData: {
      manufacturing: 18500,
      transportation: 1250,
      usage: 0.052,
      endOfLife: 1600,
      totalLifeCycle: 29800,
      lifespan: 10
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/ford_etransit_front.jpg',
        'https://example.com/images/ford_etransit_side.jpg'
      ],
      recognitionTags: ['Ford', 'E-Transit', 'Electric', 'Van', 'Commercial'],
      manufacturer: 'Ford',
      modelNumber: 'E-Transit',
      releaseYear: 2022
    },
    technicalSpecs: {
      engineType: 'Electric Motor',
      engineSize: 'N/A',
      fuelEconomy: '5.2 km/kWh',
      emissionStandard: 'Zero Emission Vehicle'
    },
    dataSource: 'manufacturer',
    notes: '大型電動貨車，適合大型劇組設備運輸和遠距離行程'
  },
  {
    id: 'transport-9',
    name: 'Rivian R1S',
    fuelType: 'electric',
    emissionFactor: 0.042,
    type: 'car',
    passengerCapacity: 7,
    cargoCapacity: 800,
    emissionFactorPerPerson: 0.006,
    emissionFactorPerKg: 0.000053,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-RIVIAN-2023-0034'
    },
    lifeCycleData: {
      manufacturing: 15800,
      transportation: 1000,
      usage: 0.042,
      endOfLife: 1400,
      totalLifeCycle: 25600,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/rivian_r1s_front.jpg',
        'https://example.com/images/rivian_r1s_side.jpg'
      ],
      recognitionTags: ['Rivian', 'R1S', 'Electric', 'SUV', 'Adventure'],
      manufacturer: 'Rivian',
      modelNumber: 'R1S',
      releaseYear: 2022
    },
    technicalSpecs: {
      engineType: 'Quad Motor Electric',
      engineSize: 'N/A',
      fuelEconomy: '7.2 km/kWh',
      emissionStandard: 'Zero Emission Vehicle'
    },
    dataSource: 'manufacturer',
    notes: '越野能力強的電動SUV，適合偏遠地區和非鋪裝道路的拍攝工作'
  },
  {
    id: 'transport-10',
    name: 'BYD ATTO 3',
    fuelType: 'electric',
    emissionFactor: 0.032,
    type: 'car',
    passengerCapacity: 5,
    cargoCapacity: 440,
    emissionFactorPerPerson: 0.0064,
    emissionFactorPerKg: 0.000073,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-BYD-2023-0035'
    },
    lifeCycleData: {
      manufacturing: 10200,
      transportation: 750,
      usage: 0.032,
      endOfLife: 950,
      totalLifeCycle: 16700,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/byd_atto_3_front.jpg',
        'https://example.com/images/byd_atto_3_side.jpg'
      ],
      recognitionTags: ['BYD', 'ATTO 3', 'Electric', 'SUV', 'Compact'],
      manufacturer: 'BYD',
      modelNumber: 'ATTO 3',
      releaseYear: 2022
    },
    technicalSpecs: {
      engineType: 'Electric Motor',
      engineSize: 'N/A',
      fuelEconomy: '7.9 km/kWh',
      emissionStandard: 'Zero Emission Vehicle'
    },
    dataSource: 'manufacturer',
    notes: '經濟型電動SUV，適合小劇組日常通勤和短距離設備運輸'
  }
];

// 增強版辦公設備數據
export const ENHANCED_OFFICE_EQUIPMENT: EnhancedOfficeEquipment[] = [
  // 這裡只保留辦公設備，移除所有id為storage-開頭的設備
  {
    id: 'office-1',
    name: 'Dell Precision 5560工作站',
    powerConsumption: 220,
    emissionFactor: 0.12,
    type: 'desktop',
    weight: 4.5,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-DELL-2023-0050'
    },
    lifeCycleData: {
      manufacturing: 320,
      transportation: 25,
      usage: 0.12,
      endOfLife: 15,
      totalLifeCycle: 360,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/dell_precision_5560_front.jpg',
        'https://example.com/images/dell_precision_5560_side.jpg'
      ],
      recognitionTags: ['Dell', 'Precision', '5560', 'Workstation', 'Desktop'],
      manufacturer: 'Dell',
      modelNumber: 'Precision 5560',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyEfficiencyRating: 'Energy Star 8.0',
      standbyPower: 1.2,
      processor: 'Intel Core i9-11950H',
      memory: '64GB DDR4'
    },
    dataSource: 'manufacturer',
    notes: '高性能工作站，適合劇本編輯、預視覺化和製作規劃階段'
  },
  {
    id: 'office-2',
    name: 'HP Z4 G4 Workstation',
    powerConsumption: 280,
    emissionFactor: 0.15,
    type: 'desktop',
    weight: 12.8,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-HP-2023-0041'
    },
    lifeCycleData: {
      manufacturing: 380,
      transportation: 40,
      usage: 0.15,
      endOfLife: 25,
      totalLifeCycle: 445,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/hp_z4_g4_front.jpg',
        'https://example.com/images/hp_z4_g4_side.jpg'
      ],
      recognitionTags: ['HP', 'Z4', 'G4', 'Workstation', 'Desktop'],
      manufacturer: 'HP',
      modelNumber: 'Z4 G4',
      releaseYear: 2021
    },
    technicalSpecs: {
      energyEfficiencyRating: 'EPEAT Gold',
      standbyPower: 2.5,
      processor: 'Intel Xeon W-2245',
      memory: '64GB DDR4'
    },
    dataSource: 'manufacturer',
    notes: '專業工作站，適合前期設計和後期處理工作'
  },
  {
    id: 'office-3',
    name: 'MacBook Pro 16"',
    powerConsumption: 65,
    emissionFactor: 0.04,
    type: 'laptop',
    weight: 2.1,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-APPLE-2023-0042'
    },
    lifeCycleData: {
      manufacturing: 330,
      transportation: 30,
      usage: 0.04,
      endOfLife: 20,
      totalLifeCycle: 380,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/macbook_pro_16_front.jpg',
        'https://example.com/images/macbook_pro_16_side.jpg'
      ],
      recognitionTags: ['Apple', 'MacBook', 'Pro', 'Laptop', '16-inch'],
      manufacturer: 'Apple',
      modelNumber: 'MacBook Pro 16"',
      releaseYear: 2021
    },
    technicalSpecs: {
      energyEfficiencyRating: 'Energy Star 8.0',
      standbyPower: 0.25,
      processor: 'Apple M1 Pro',
      memory: '32GB Unified Memory'
    },
    dataSource: 'manufacturer',
    notes: '高性能筆記本電腦，適合現場工作和行動辦公'
  },
  // 新增辦公設備
  {
    id: 'office-4',
    name: 'Apple MacBook Air M2',
    powerConsumption: 30,
    emissionFactor: 0.018,
    type: 'laptop',
    weight: 1.24,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-APPLE-2023-0036'
    },
    lifeCycleData: {
      manufacturing: 140,
      transportation: 20,
      usage: 0.018,
      endOfLife: 12,
      totalLifeCycle: 210,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/apple_macbook_air_m2_front.jpg',
        'https://example.com/images/apple_macbook_air_m2_side.jpg'
      ],
      recognitionTags: ['Apple', 'MacBook', 'Air', 'M2', 'Laptop'],
      manufacturer: 'Apple',
      modelNumber: 'MacBook Air (M2, 2022)',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyEfficiencyRating: 'Energy Star 8.0',
      standbyPower: 0.2,
      processor: 'Apple M2',
      memory: '16GB'
    },
    dataSource: 'manufacturer',
    notes: '輕量級筆記本電腦，適合編劇、導演和製片人前期製作使用'
  },
  {
    id: 'office-5',
    name: 'LG UltraFine 32UQ85R',
    powerConsumption: 55,
    emissionFactor: 0.032,
    type: 'monitor',
    weight: 10.8,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-LG-2023-0037'
    },
    lifeCycleData: {
      manufacturing: 210,
      transportation: 25,
      usage: 0.032,
      endOfLife: 15,
      totalLifeCycle: 430,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/lg_ultrafine_32uq85r_front.jpg',
        'https://example.com/images/lg_ultrafine_32uq85r_side.jpg'
      ],
      recognitionTags: ['LG', 'UltraFine', '32UQ85R', 'Monitor', '4K'],
      manufacturer: 'LG',
      modelNumber: '32UQ85R',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyEfficiencyRating: 'Energy Star 8.0',
      standbyPower: 0.3,
      processor: 'N/A',
      memory: 'N/A'
    },
    dataSource: 'manufacturer',
    notes: '專業4K顯示器，適合劇本閱讀、分鏡頭設計和前期會議展示'
  },
  {
    id: 'office-6',
    name: 'ViewSonic VP3481',
    powerConsumption: 60,
    emissionFactor: 0.035,
    type: 'monitor',
    weight: 9.5,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-VIEWSONIC-2023-0038'
    },
    lifeCycleData: {
      manufacturing: 230,
      transportation: 28,
      usage: 0.035,
      endOfLife: 17,
      totalLifeCycle: 480,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/viewsonic_vp3481_front.jpg',
        'https://example.com/images/viewsonic_vp3481_side.jpg'
      ],
      recognitionTags: ['ViewSonic', 'VP3481', 'Monitor', 'UltraWide', 'Curved'],
      manufacturer: 'ViewSonic',
      modelNumber: 'VP3481',
      releaseYear: 2019
    },
    technicalSpecs: {
      energyEfficiencyRating: 'Energy Star 7.0',
      standbyPower: 0.5,
      processor: 'N/A',
      memory: 'N/A'
    },
    dataSource: 'manufacturer',
    notes: '超寬曲面顯示器，適合同時查看多個文檔和時間線編輯'
  },
  {
    id: 'office-7',
    name: 'Epson EcoTank ET-4850',
    powerConsumption: 12,
    emissionFactor: 0.007,
    type: 'printer',
    weight: 7.3,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-EPSON-2023-0039'
    },
    lifeCycleData: {
      manufacturing: 180,
      transportation: 22,
      usage: 0.007,
      endOfLife: 13,
      totalLifeCycle: 320,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/epson_ecotank_et_4850_front.jpg',
        'https://example.com/images/epson_ecotank_et_4850_side.jpg'
      ],
      recognitionTags: ['Epson', 'EcoTank', 'ET-4850', 'Printer', 'All-in-One'],
      manufacturer: 'Epson',
      modelNumber: 'ET-4850',
      releaseYear: 2021
    },
    technicalSpecs: {
      energyEfficiencyRating: 'Energy Star 3.0',
      standbyPower: 0.7,
      processor: 'N/A',
      memory: 'N/A'
    },
    dataSource: 'manufacturer',
    notes: '低耗能墨水槽式印表機，適合劇本和分鏡頭腳本打印，大幅降低碳排放'
  },
  {
    id: 'office-8',
    name: 'BenQ InstaShow WDC20',
    powerConsumption: 12,
    emissionFactor: 0.007,
    type: 'projector',
    weight: 0.25,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-BENQ-2023-0040'
    },
    lifeCycleData: {
      manufacturing: 85,
      transportation: 10,
      usage: 0.007,
      endOfLife: 7,
      totalLifeCycle: 140,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/benq_instashow_front.jpg',
        'https://example.com/images/benq_instashow_side.jpg'
      ],
      recognitionTags: ['BenQ', 'InstaShow', 'WDC20', 'Wireless', 'Presentation'],
      manufacturer: 'BenQ',
      modelNumber: 'InstaShow WDC20',
      releaseYear: 2021
    },
    technicalSpecs: {
      energyEfficiencyRating: 'Energy Star 8.0',
      standbyPower: 0.8,
      processor: 'N/A',
      memory: 'N/A'
    },
    dataSource: 'manufacturer',
    notes: '無線投影設備，適合團隊協作和會議使用'
  }
];

// 增強版餐飲設備數據
export const ENHANCED_FOOD_EQUIPMENT: EnhancedFoodEquipment[] = [
  {
    id: 'food-1',
    name: '可持續植物性餐盒',
    servingSize: 1,
    emissionFactor: 0.8,
    type: 'vegetarian',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0070'
    },
    lifeCycleData: {
      manufacturing: 0.3,
      transportation: 0.2,
      usage: 0.8,
      endOfLife: 0.1,
      totalLifeCycle: 1.4,
      lifespan: 0.01 // 1次性使用，以年為單位
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/vegan_food_box_top.jpg',
        'https://example.com/images/vegan_food_box_side.jpg'
      ],
      recognitionTags: ['Vegetarian', 'Plant-based', 'Food Box', 'Sustainable', 'Eco-friendly'],
      manufacturer: 'EcoFeed Catering',
      modelNumber: 'VEG-2023',
      releaseYear: 2023
    },
    technicalSpecs: {
      origin: '本地有機農場',
      organicCertified: true,
      packagingType: '可堆肥植物纖維',
      nutritionalValue: '每份含蛋白質15g，碳水化合物45g'
    },
    dataSource: 'thirdParty',
    notes: '低碳排放的素食選項，使用本地有機食材和可堆肥容器'
  },
  {
    id: 'food-2',
    name: '可持續海鮮餐盒',
    servingSize: 1,
    emissionFactor: 1.5,
    type: 'seafood',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0071'
    },
    lifeCycleData: {
      manufacturing: 0.5,
      transportation: 0.3,
      usage: 1.5,
      endOfLife: 0.1,
      totalLifeCycle: 2.4,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/sustainable_seafood_box_top.jpg',
        'https://example.com/images/sustainable_seafood_box_side.jpg'
      ],
      recognitionTags: ['Seafood', 'Sustainable Fish', 'MSC Certified', 'Food Box'],
      manufacturer: 'OceanWise Catering',
      modelNumber: 'SEA-2023',
      releaseYear: 2023
    },
    technicalSpecs: {
      origin: 'MSC認證漁場',
      organicCertified: false,
      packagingType: '再生紙製容器',
      nutritionalValue: '每份含蛋白質22g，脂肪10g'
    },
    dataSource: 'thirdParty',
    notes: '使用可持續捕撈的海鮮，MSC認證，採用可回收包裝'
  },
  {
    id: 'food-3',
    name: '本地肉類餐盒',
    servingSize: 1,
    emissionFactor: 2.7,
    type: 'meat',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0072'
    },
    lifeCycleData: {
      manufacturing: 1.8,
      transportation: 0.2,
      usage: 2.7,
      endOfLife: 0.1,
      totalLifeCycle: 4.8,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/local_meat_box_top.jpg',
        'https://example.com/images/local_meat_box_side.jpg'
      ],
      recognitionTags: ['Meat', 'Local', 'Organic', 'Food Box', 'Free Range'],
      manufacturer: 'LocalFarm Catering',
      modelNumber: 'MEAT-2023',
      releaseYear: 2023
    },
    technicalSpecs: {
      origin: '本地有機農場',
      organicCertified: true,
      packagingType: '可回收紙塑混合容器',
      nutritionalValue: '每份含蛋白質28g，脂肪15g'
    },
    dataSource: 'thirdParty',
    notes: '使用本地飼養的肉類，減少運輸排放，採用動物福利認證標準'
  },
  {
    id: 'food-4',
    name: '批量餐飲服務',
    servingSize: 50,
    emissionFactor: 1.2,
    type: 'buffet',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0073'
    },
    lifeCycleData: {
      manufacturing: 0.4,
      transportation: 0.2,
      usage: 1.2,
      endOfLife: 0.2,
      totalLifeCycle: 2.0,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/catering_buffet_full.jpg'
      ],
      recognitionTags: ['Buffet', 'Catering', 'Bulk', 'Food Service', 'Mixed'],
      manufacturer: 'EcoServe Catering',
      modelNumber: 'BUFF-2023',
      releaseYear: 2023
    },
    technicalSpecs: {
      origin: '混合本地和進口食材',
      organicCertified: false,
      packagingType: '可重複使用的餐具和容器',
      nutritionalValue: '多樣化菜單，平衡營養'
    },
    dataSource: 'thirdParty',
    notes: '大型製作團隊的餐飲服務，使用可重複使用的餐具減少廢棄物'
  },
  {
    id: 'food-5',
    name: '外送餐飲服務',
    servingSize: 1,
    emissionFactor: 3.2,
    type: 'delivery',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0074'
    },
    lifeCycleData: {
      manufacturing: 0.5,
      transportation: 2.1,
      usage: 3.2,
      endOfLife: 0.3,
      totalLifeCycle: 6.1,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/food_delivery_service.jpg'
      ],
      recognitionTags: ['Delivery', 'Takeout', 'Food Service', 'Transported'],
      manufacturer: 'Various Restaurants',
      modelNumber: 'DEL-2023',
      releaseYear: 2023
    },
    technicalSpecs: {
      origin: '多種來源',
      organicCertified: false,
      packagingType: '紙、塑料和鋁箔混合包裝',
      nutritionalValue: '多樣化，取決於具體餐點'
    },
    dataSource: 'thirdParty',
    notes: '計入餐廳準備和送餐的碳排放，適用於分散式拍攝現場'
  },
  // 新增餐飲設備
  {
    id: 'food-6',
    name: '有機素食便當',
    servingSize: 500,
    emissionFactor: 0.5,
    type: 'vegetarian',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0041'
    },
    lifeCycleData: {
      manufacturing: 0.25,
      transportation: 0.15,
      usage: 0.05,
      endOfLife: 0.05,
      totalLifeCycle: 0.5,
      lifespan: 0.01 // 1天
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/organic_vegetarian_meal_box.jpg'
      ],
      recognitionTags: ['有機', '素食', '便當', '低碳', '可持續'],
      manufacturer: '永續餐飲集團',
      modelNumber: 'VEG-ORG-500',
      releaseYear: 2023
    },
    technicalSpecs: {
      origin: '本地有機農場',
      organicCertified: true,
      packagingType: '可堆肥容器',
      nutritionalValue: '高纖維、高蛋白、低脂肪'
    },
    dataSource: 'thirdParty',
    notes: '使用100%本地有機食材製作的全素食便當，包裝材料可完全堆肥'
  },
  {
    id: 'food-7',
    name: '低碳本地海鮮餐',
    servingSize: 450,
    emissionFactor: 1.8,
    type: 'seafood',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0042'
    },
    lifeCycleData: {
      manufacturing: 0.9,
      transportation: 0.4,
      usage: 0.3,
      endOfLife: 0.2,
      totalLifeCycle: 1.8,
      lifespan: 0.01 // 1天
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/low_carbon_seafood_meal.jpg'
      ],
      recognitionTags: ['海鮮', '低碳', '本地', '永續', 'MSC認證'],
      manufacturer: '海洋友善餐飲公司',
      modelNumber: 'SEA-LC-450',
      releaseYear: 2023
    },
    technicalSpecs: {
      origin: '台灣本地永續漁業',
      organicCertified: false,
      packagingType: '可回收容器',
      nutritionalValue: '高蛋白、低脂肪、富含Omega-3'
    },
    dataSource: 'thirdParty',
    notes: '使用當地永續捕撈的海鮮，符合MSC認證標準，包裝可100%回收'
  },
  {
    id: 'food-8',
    name: '植物肉漢堡套餐',
    servingSize: 400,
    emissionFactor: 0.8,
    type: 'vegetarian',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0043'
    },
    lifeCycleData: {
      manufacturing: 0.4,
      transportation: 0.2,
      usage: 0.1,
      endOfLife: 0.1,
      totalLifeCycle: 0.8,
      lifespan: 0.01 // 1天
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/plant_based_burger_meal.jpg'
      ],
      recognitionTags: ['植物肉', '漢堡', '素食', '低碳', '可持續'],
      manufacturer: '新食代植物肉公司',
      modelNumber: 'PB-BG-400',
      releaseYear: 2023
    },
    technicalSpecs: {
      origin: '本地及進口混合原料',
      organicCertified: true,
      packagingType: '再生紙包裝',
      nutritionalValue: '均衡蛋白質、碳水化合物和脂肪'
    },
    dataSource: 'manufacturer',
    notes: '使用植物蛋白製作的漢堡，口感與牛肉相似，但碳排放僅為傳統漢堡的10%'
  },
  {
    id: 'food-9',
    name: '可重複使用餐具套組',
    servingSize: 1,
    emissionFactor: 0.02,
    type: 'delivery',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0044'
    },
    lifeCycleData: {
      manufacturing: 8,
      transportation: 1,
      usage: 0.02,
      endOfLife: 3,
      totalLifeCycle: 12,
      lifespan: 3 // 3年
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/reusable_cutlery_set.jpg'
      ],
      recognitionTags: ['餐具', '重複使用', '環保', '無塑', '竹製'],
      manufacturer: '零廢棄生活用品公司',
      modelNumber: 'RECU-001',
      releaseYear: 2022
    },
    technicalSpecs: {
      origin: '台灣本地製造',
      organicCertified: true,
      packagingType: '無包裝或棉布袋',
      nutritionalValue: 'N/A'
    },
    dataSource: 'manufacturer',
    notes: '每人使用可減少約260個一次性塑料餐具的使用，顯著降低劇組廢棄物'
  },
  {
    id: 'food-10',
    name: '有機可分解餐盒',
    servingSize: 1,
    emissionFactor: 0.03,
    type: 'delivery',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FOOD-2023-0045'
    },
    lifeCycleData: {
      manufacturing: 0.02,
      transportation: 0.01,
      usage: 0.01,
      endOfLife: 0.01,
      totalLifeCycle: 0.05,
      lifespan: 0.01 // 1天
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/biodegradable_container.jpg'
      ],
      recognitionTags: ['餐盒', '可分解', '有機', '環保', '竹纖維'],
      manufacturer: '綠色包裝科技公司',
      modelNumber: 'BIO-BOX-001',
      releaseYear: 2022
    },
    technicalSpecs: {
      origin: '台灣本地製造',
      organicCertified: true,
      packagingType: '可完全分解',
      nutritionalValue: 'N/A'
    },
    dataSource: 'manufacturer',
    notes: '使用竹纖維和甘蔗渣製成，30天內可完全分解，適合拍攝現場大量使用'
  }
];

// 增強版燃料設備數據
export const ENHANCED_FUEL_EQUIPMENT: EnhancedFuelEquipment[] = [
  {
    id: 'fuel-1',
    name: '無鉛汽油',
    emissionFactor: 2.32,
    type: 'gasoline',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0090'
    },
    lifeCycleData: {
      manufacturing: 0.25,
      transportation: 0.15,
      usage: 2.32,
      endOfLife: 0,
      totalLifeCycle: 2.72,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/unleaded_gasoline.jpg'
      ],
      recognitionTags: ['Gasoline', 'Petrol', 'Unleaded', 'Fuel'],
      manufacturer: 'Various',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyDensity: '45 MJ/kg',
      octaneRating: 95,
      cetaneNumber: undefined,
      bioContent: 0
    },
    dataSource: 'thirdParty',
    notes: '用於發電機、運輸車輛和設備的普通無鉛汽油'
  },
  {
    id: 'fuel-2',
    name: '柴油',
    emissionFactor: 2.64,
    type: 'diesel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0091'
    },
    lifeCycleData: {
      manufacturing: 0.28,
      transportation: 0.16,
      usage: 2.64,
      endOfLife: 0,
      totalLifeCycle: 3.08,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/diesel_fuel.jpg'
      ],
      recognitionTags: ['Diesel', 'Fuel', 'Truck', 'Generator'],
      manufacturer: 'Various',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyDensity: '48 MJ/kg',
      octaneRating: undefined,
      cetaneNumber: 50,
      bioContent: 0
    },
    dataSource: 'thirdParty',
    notes: '用於大型發電機和重型運輸車輛的柴油燃料'
  },
  {
    id: 'fuel-3',
    name: '液化石油氣',
    emissionFactor: 1.51,
    type: 'lpg',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0092'
    },
    lifeCycleData: {
      manufacturing: 0.18,
      transportation: 0.12,
      usage: 1.51,
      endOfLife: 0,
      totalLifeCycle: 1.81,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/lpg_fuel.jpg'
      ],
      recognitionTags: ['LPG', 'Propane', 'Gas', 'Fuel', 'Cooking'],
      manufacturer: 'Various',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyDensity: '49 MJ/kg',
      octaneRating: 105,
      cetaneNumber: undefined,
      bioContent: 0
    },
    dataSource: 'thirdParty',
    notes: '主要用於片場餐飲烹飪和部分小型供暖設備的氣體燃料'
  },
  {
    id: 'fuel-4',
    name: '生物柴油 (B20)',
    emissionFactor: 2.11,
    type: 'diesel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0093'
    },
    lifeCycleData: {
      manufacturing: 0.15,
      transportation: 0.12,
      usage: 2.11,
      endOfLife: 0,
      totalLifeCycle: 2.38,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/biodiesel_b20.jpg'
      ],
      recognitionTags: ['Biodiesel', 'B20', 'Alternative', 'Renewable', 'Fuel'],
      manufacturer: 'Various',
      modelNumber: 'B20',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyDensity: '45 MJ/kg',
      octaneRating: undefined,
      cetaneNumber: 52,
      bioContent: 20
    },
    dataSource: 'thirdParty',
    notes: '含有20%生物來源成分的柴油混合燃料，減少碳排放'
  },
  {
    id: 'fuel-5',
    name: '天然氣',
    emissionFactor: 1.85,
    type: 'natural-gas',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0094'
    },
    lifeCycleData: {
      manufacturing: 0.22,
      transportation: 0.15,
      usage: 1.85,
      endOfLife: 0,
      totalLifeCycle: 2.22,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/natural_gas.jpg'
      ],
      recognitionTags: ['Natural Gas', 'CNG', 'Methane', 'Fuel', 'Heating'],
      manufacturer: 'Various',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyDensity: '53 MJ/kg',
      octaneRating: 130,
      cetaneNumber: undefined,
      bioContent: 0
    },
    dataSource: 'thirdParty',
    notes: '用於供暖、熱水和固定式發電機的清潔燃燒燃料'
  },
  // 新增燃料設備
  {
    id: 'fuel-6',
    name: 'B20生物柴油',
    emissionFactor: 2.12,
    type: 'diesel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0041'
    },
    lifeCycleData: {
      manufacturing: 0.15,
      transportation: 0.12,
      usage: 2.12,
      endOfLife: 0,
      totalLifeCycle: 2.12,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/biodiesel_b20_new.jpg'
      ],
      recognitionTags: ['生物柴油', 'B20', '替代燃料', '可再生', '低碳'],
      manufacturer: '綠能燃料科技',
      modelNumber: 'B20-ECO',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyDensity: '42 MJ/kg',
      octaneRating: undefined,
      cetaneNumber: 55,
      bioContent: 20
    },
    dataSource: 'manufacturer',
    notes: '使用回收食用油製造的B20生物柴油，適用於劇組發電機和柴油車輛'
  },
  {
    id: 'fuel-7',
    name: '綠色氫氣',
    emissionFactor: 0.42,
    type: 'natural-gas',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0042'
    },
    lifeCycleData: {
      manufacturing: 0.35,
      transportation: 0.05,
      usage: 0.02,
      endOfLife: 0,
      totalLifeCycle: 0.42,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/green_hydrogen.jpg'
      ],
      recognitionTags: ['氫氣', '綠氫', '零碳', '燃料電池', '可再生'],
      manufacturer: '氫能環保科技',
      modelNumber: 'H2-GREEN',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyDensity: '142 MJ/kg',
      octaneRating: undefined,
      cetaneNumber: undefined,
      bioContent: 0
    },
    dataSource: 'manufacturer',
    notes: '使用可再生能源電解水製造的零碳氫氣，用於燃料電池發電系統'
  },
  {
    id: 'fuel-8',
    name: '生物甲烷',
    emissionFactor: 0.75,
    type: 'natural-gas',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0043'
    },
    lifeCycleData: {
      manufacturing: 0.40,
      transportation: 0.10,
      usage: 0.25,
      endOfLife: 0,
      totalLifeCycle: 0.75,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/biomethane.jpg'
      ],
      recognitionTags: ['生物甲烷', '沼氣', '循環', '可再生天然氣', 'RNG'],
      manufacturer: '生物能源科技',
      modelNumber: 'BM-100',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyDensity: '50 MJ/kg',
      octaneRating: 130,
      cetaneNumber: undefined,
      bioContent: 100
    },
    dataSource: 'manufacturer',
    notes: '從廢棄物厭氧分解產生的可再生天然氣替代品，用於供暖和烹飪'
  },
  {
    id: 'fuel-9',
    name: '先進合成燃料',
    emissionFactor: 1.85,
    type: 'gasoline',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0044'
    },
    lifeCycleData: {
      manufacturing: 1.10,
      transportation: 0.15,
      usage: 0.60,
      endOfLife: 0,
      totalLifeCycle: 1.85,
      lifespan: 0.01
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/synthetic_fuel.jpg'
      ],
      recognitionTags: ['合成燃料', 'E-fuel', '低碳汽油', '替代燃料'],
      manufacturer: '先進燃料科技',
      modelNumber: 'SYN-95',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyDensity: '44 MJ/kg',
      octaneRating: 100,
      cetaneNumber: undefined,
      bioContent: 0
    },
    dataSource: 'manufacturer',
    notes: '從大氣中捕獲的CO2和可再生電力製造的合成燃料，可直接替代傳統汽油'
  },
  {
    id: 'fuel-10',
    name: '高效能源電池',
    emissionFactor: 0.22,
    type: 'gasoline',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FUEL-2023-0045'
    },
    lifeCycleData: {
      manufacturing: 38,
      transportation: 4,
      usage: 0.22,
      endOfLife: 3,
      totalLifeCycle: 45,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/energy_cells.jpg'
      ],
      recognitionTags: ['能源電池', '便攜電源', '零排放', '現場供電'],
      manufacturer: '新能源科技',
      modelNumber: 'EC-5000',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyDensity: '200 Wh/kg',
      octaneRating: undefined,
      cetaneNumber: undefined,
      bioContent: 0
    },
    dataSource: 'manufacturer',
    notes: '大容量便攜式能源電池系統，可替代小型汽油發電機用於拍攝現場設備供電'
  },
  // 添加核能發電選項
  {
    id: 'fuel-11',
    name: '小型模組化核反應堆 (SMR)',
    emissionFactor: 0.012,
    type: 'nuclear',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-NUCLEAR-2023-0046'
    },
    lifeCycleData: {
      manufacturing: 3200,
      transportation: 120,
      usage: 0.012,
      endOfLife: 450,
      totalLifeCycle: 3770,
      lifespan: 60
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/small_modular_reactor.jpg'
      ],
      recognitionTags: ['核能', '模組化', '零碳', '清潔能源', 'SMR'],
      manufacturer: '先進核能科技公司',
      modelNumber: 'SMR-100',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyDensity: '8760 MWh/kg',
      octaneRating: undefined,
      cetaneNumber: undefined,
      bioContent: 0
    },
    dataSource: 'manufacturer',
    notes: '小型模組化核反應堆，為大型製作基地提供零碳電力，與傳統能源相比排放極低'
  },
  // 添加氫能源選項
  {
    id: 'fuel-12',
    name: '氫燃料電池發電系統',
    emissionFactor: 0.018,
    type: 'hydrogen',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-HYDROGEN-2023-0047'
    },
    lifeCycleData: {
      manufacturing: 620,
      transportation: 45,
      usage: 0.018,
      endOfLife: 85,
      totalLifeCycle: 750,
      lifespan: 15
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/hydrogen_fuel_cell_system.jpg'
      ],
      recognitionTags: ['氫燃料', '燃料電池', '零排放', '清潔能源'],
      manufacturer: '氫能動力科技',
      modelNumber: 'HFC-2000',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyDensity: '33 kWh/kg',
      octaneRating: undefined,
      cetaneNumber: undefined,
      bioContent: 0
    },
    dataSource: 'manufacturer',
    notes: '可靠的氫燃料電池發電系統，只排放水蒸氣，適合大型製作現場的主要或備用電力來源'
  }
];

// 增強版住宿設備數據
export const ENHANCED_ACCOMMODATION_EQUIPMENT: EnhancedAccommodationEquipment[] = [
  {
    id: 'accom-1',
    name: '五星級豪華酒店',
    emissionFactor: 31.5,
    type: 'luxury-hotel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-HOTEL-2023-0070'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 31.5,
      endOfLife: 0,
      totalLifeCycle: 31.5,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/luxury_hotel_front.jpg',
        'https://example.com/images/luxury_hotel_room.jpg'
      ],
      recognitionTags: ['Hotel', 'Luxury', '5-Star', 'Accommodation'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyEfficiencyRating: 'B',
      sustainabilityCertification: 'LEED Gold',
      averageWaterUsage: 300,
      averageEnergyUsage: 45
    },
    dataSource: 'thirdParty',
    notes: '包含高級餐飲、空調、健身房、溫水游泳池等設施的豪華酒店'
  },
  {
    id: 'accom-2',
    name: '商務型酒店',
    emissionFactor: 18.2,
    type: 'hotel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-HOTEL-2023-0071'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 18.2,
      endOfLife: 0,
      totalLifeCycle: 18.2,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/business_hotel_front.jpg',
        'https://example.com/images/business_hotel_room.jpg'
      ],
      recognitionTags: ['Hotel', 'Business', '4-Star', 'Accommodation'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyEfficiencyRating: 'B+',
      sustainabilityCertification: 'Green Key',
      averageWaterUsage: 220,
      averageEnergyUsage: 28
    },
    dataSource: 'thirdParty',
    notes: '提供基本舒適設施的商務型酒店，適合一般製作團隊使用'
  },
  {
    id: 'accom-3',
    name: '經濟型旅館',
    emissionFactor: 12.5,
    type: 'hotel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-HOTEL-2023-0072'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 12.5,
      endOfLife: 0,
      totalLifeCycle: 12.5,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/budget_hotel_front.jpg',
        'https://example.com/images/budget_hotel_room.jpg'
      ],
      recognitionTags: ['Hotel', 'Budget', '3-Star', 'Accommodation'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyEfficiencyRating: 'C',
      sustainabilityCertification: 'N/A',
      averageWaterUsage: 180,
      averageEnergyUsage: 22
    },
    dataSource: 'thirdParty',
    notes: '經濟實惠的住宿選擇，適合預算有限的小型製作團隊'
  },
  {
    id: 'accom-4',
    name: '民宿/客棧',
    emissionFactor: 8.7,
    type: 'guesthouse',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-GUESTHOUSE-2023-0073'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 8.7,
      endOfLife: 0,
      totalLifeCycle: 8.7,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/guesthouse_front.jpg',
        'https://example.com/images/guesthouse_room.jpg'
      ],
      recognitionTags: ['Guesthouse', 'Homestay', 'Accommodation', 'Local'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyEfficiencyRating: 'C+',
      sustainabilityCertification: 'Local Green Tourism',
      averageWaterUsage: 150,
      averageEnergyUsage: 15
    },
    dataSource: 'thirdParty',
    notes: '當地特色民宿，提供基本舒適設施，更貼近當地文化'
  },
  {
    id: 'accom-5',
    name: '青年旅館/背包客棧',
    emissionFactor: 5.3,
    type: 'hostel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-HOSTEL-2023-0074'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 5.3,
      endOfLife: 0,
      totalLifeCycle: 5.3,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/hostel_front.jpg',
        'https://example.com/images/hostel_room.jpg'
      ],
      recognitionTags: ['Hostel', 'Backpacker', 'Accommodation', 'Budget'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      energyEfficiencyRating: 'B',
      sustainabilityCertification: 'HI-Q Sustainability',
      averageWaterUsage: 100,
      averageEnergyUsage: 12
    },
    dataSource: 'thirdParty',
    notes: '共享式住宿，碳足跡最低的選擇，適合極低預算製作與學生作品'
  },
  // 新增住宿設備
  {
    id: 'accommodation-6',
    name: '綠建築認證酒店套房',
    emissionFactor: 12.5,
    type: 'hotel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-HOTEL-2023-0031'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 12.5,
      endOfLife: 0,
      totalLifeCycle: 12.5,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/green_building_hotel_front.jpg',
        'https://example.com/images/green_building_hotel_room.jpg'
      ],
      recognitionTags: ['綠建築', 'LEED認證', '酒店', '環保', '低碳'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyEfficiencyRating: 'A+',
      sustainabilityCertification: 'LEED Platinum',
      averageWaterUsage: 120,
      averageEnergyUsage: 18
    },
    dataSource: 'thirdParty',
    notes: '擁有LEED認證的綠色酒店，使用可再生能源和水循環系統'
  },
  {
    id: 'accommodation-7',
    name: '碳中和商務旅館',
    emissionFactor: 8.3,
    type: 'hotel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-HOTEL-2023-0032'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 8.3,
      endOfLife: 0,
      totalLifeCycle: 8.3,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/carbon_neutral_hotel_front.jpg',
        'https://example.com/images/carbon_neutral_hotel_room.jpg'
      ],
      recognitionTags: ['碳中和', '商務旅館', '零碳', '環保', '可持續'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyEfficiencyRating: 'A',
      sustainabilityCertification: 'Carbon Trust Standard',
      averageWaterUsage: 140,
      averageEnergyUsage: 15
    },
    dataSource: 'thirdParty',
    notes: '通過清潔能源采購和碳抵銷項目實現碳中和的商務旅館'
  },
  {
    id: 'accommodation-8',
    name: '太陽能供電民宿',
    emissionFactor: 5.2,
    type: 'guesthouse',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-GUESTHOUSE-2023-0033'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 5.2,
      endOfLife: 0,
      totalLifeCycle: 5.2,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/solar_powered_lodge_front.jpg',
        'https://example.com/images/solar_powered_lodge_room.jpg'
      ],
      recognitionTags: ['太陽能', '民宿', '再生能源', '永續', '生態旅遊'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2021
    },
    technicalSpecs: {
      energyEfficiencyRating: 'A+',
      sustainabilityCertification: '100% Renewable Energy',
      averageWaterUsage: 90,
      averageEnergyUsage: 7.5
    },
    dataSource: 'thirdParty',
    notes: '100%使用太陽能供電的環保民宿，實踐零碳排放理念'
  },
  {
    id: 'accommodation-9',
    name: '共享工作空間住宿',
    emissionFactor: 9.4,
    type: 'guesthouse',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-COLIVING-2023-0034'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 9.4,
      endOfLife: 0,
      totalLifeCycle: 9.4,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/coliving_space_front.jpg',
        'https://example.com/images/coliving_space_room.jpg'
      ],
      recognitionTags: ['共享空間', '共居', '工作空間', '創意', '社區'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyEfficiencyRating: 'A',
      sustainabilityCertification: 'Energy Efficiency Rating A',
      averageWaterUsage: 130,
      averageEnergyUsage: 22
    },
    dataSource: 'thirdParty',
    notes: '將辦公與住宿結合的創意空間，減少通勤碳排放和資源浪費'
  },
  {
    id: 'accommodation-10',
    name: '低碳足跡露營地',
    emissionFactor: 2.1,
    type: 'hostel',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ECOCAMP-2023-0035'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 2.1,
      endOfLife: 0,
      totalLifeCycle: 2.1,
      lifespan: 1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/eco_camping_site_front.jpg',
        'https://example.com/images/eco_camping_site_tent.jpg'
      ],
      recognitionTags: ['露營地', '生態旅遊', '低碳', '帳篷', '戶外'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2022
    },
    technicalSpecs: {
      energyEfficiencyRating: 'A++',
      sustainabilityCertification: 'Ecotourism Certification',
      averageWaterUsage: 50,
      averageEnergyUsage: 3
    },
    dataSource: 'thirdParty',
    notes: '為戶外拍攝團隊提供的生態友好型露營地，配備基本設施和太陽能充電站'
  }
];

// 增強版廢棄物設備數據
export const ENHANCED_WASTE_EQUIPMENT: EnhancedWasteEquipment[] = [
  {
    id: 'waste-1',
    name: '一般垃圾',
    emissionFactor: 0.58,
    type: 'general',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0080'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.12,
      usage: 0.58,
      endOfLife: 0.46,
      totalLifeCycle: 0.58,
      lifespan: 0.1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/general_waste_bin.jpg'
      ],
      recognitionTags: ['Waste', 'General', 'Landfill', 'Garbage'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      recyclingRate: 0,
      treatmentMethod: '掩埋',
      decompositionTime: '數十至數百年',
      toxicityLevel: '低到中'
    },
    dataSource: 'thirdParty',
    notes: '運往垃圾填埋場的一般廢棄物，無分類處理'
  },
  {
    id: 'waste-2',
    name: '廚餘垃圾',
    emissionFactor: 0.72,
    type: 'food',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0081'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.08,
      usage: 0.72,
      endOfLife: 0.64,
      totalLifeCycle: 0.72,
      lifespan: 0.05
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/food_waste_bin.jpg'
      ],
      recognitionTags: ['Waste', 'Food', 'Organic', 'Compost'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      recyclingRate: 40,
      treatmentMethod: '堆肥或厭氧消化',
      decompositionTime: '數週至數月',
      toxicityLevel: '低'
    },
    dataSource: 'thirdParty',
    notes: '來自片場餐飲的食物剩餘，若不妥善處理會產生甲烷'
  },
  {
    id: 'waste-3',
    name: '塑料廢棄物',
    emissionFactor: 0.35,
    type: 'plastic',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0082'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.05,
      usage: 0.35,
      endOfLife: 0.30,
      totalLifeCycle: 0.35,
      lifespan: 0.2
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/plastic_waste_bin.jpg'
      ],
      recognitionTags: ['Waste', 'Plastic', 'Recycle', 'PET', 'PP'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      recyclingRate: 30,
      treatmentMethod: '回收或焚化',
      decompositionTime: '數百年',
      toxicityLevel: '中到高'
    },
    dataSource: 'thirdParty',
    notes: '各類塑料包裝、水瓶、一次性餐具等，應盡量減少使用'
  },
  {
    id: 'waste-4',
    name: '紙張廢棄物',
    emissionFactor: 0.22,
    type: 'paper',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0083'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.04,
      usage: 0.22,
      endOfLife: 0.18,
      totalLifeCycle: 0.22,
      lifespan: 0.1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/paper_waste_bin.jpg'
      ],
      recognitionTags: ['Waste', 'Paper', 'Cardboard', 'Recycle'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      recyclingRate: 70,
      treatmentMethod: '回收再利用',
      decompositionTime: '2-6個月',
      toxicityLevel: '低'
    },
    dataSource: 'thirdParty',
    notes: '劇本、包裝盒、宣傳材料等紙製品，建議使用再生紙'
  },
  {
    id: 'waste-5',
    name: '電子廢棄物',
    emissionFactor: 0.95,
    type: 'metal',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0084'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.1,
      usage: 0.95,
      endOfLife: 0.85,
      totalLifeCycle: 0.95,
      lifespan: 0.5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/ewaste_bin.jpg'
      ],
      recognitionTags: ['Waste', 'Electronic', 'E-waste', 'Recycle', 'Hazardous'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2023
    },
    technicalSpecs: {
      recyclingRate: 35,
      treatmentMethod: '專業回收處理',
      decompositionTime: '不會自然分解',
      toxicityLevel: '高'
    },
    dataSource: 'thirdParty',
    notes: '電池、電線、燈泡、LED等設備廢棄物，含有危險物質，需專業處理'
  },
  // 新增廢棄物設備
  {
    id: 'waste-6',
    name: '廚餘堆肥系統',
    emissionFactor: -0.25,
    type: 'food',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0036'
    },
    lifeCycleData: {
      manufacturing: 10,
      transportation: 2,
      usage: -0.25,
      endOfLife: 3,
      totalLifeCycle: 15,
      lifespan: 10
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/composting_system.jpg'
      ],
      recognitionTags: ['堆肥', '廚餘', '有機', '循環', '可持續'],
      manufacturer: '綠色環保科技',
      modelNumber: 'CS-500',
      releaseYear: 2022
    },
    technicalSpecs: {
      recyclingRate: 100,
      treatmentMethod: '好氧堆肥',
      decompositionTime: '2-3個月',
      toxicityLevel: '無'
    },
    dataSource: 'manufacturer',
    notes: '可處理劇組每日餐飲廚餘，轉化為有機肥料，減少溫室氣體排放'
  },
  {
    id: 'waste-7',
    name: '可回收塑料處理',
    emissionFactor: 0.35,
    type: 'plastic',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0037'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.05,
      usage: 0.35,
      endOfLife: -0.05,
      totalLifeCycle: 0.35,
      lifespan: 0.1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/recyclable_plastics.jpg'
      ],
      recognitionTags: ['塑料', '回收', 'PET', 'HDPE', '分類'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2022
    },
    technicalSpecs: {
      recyclingRate: 95,
      treatmentMethod: '清洗、粉碎、熔融、再造',
      decompositionTime: '由回收取代',
      toxicityLevel: '低'
    },
    dataSource: 'thirdParty',
    notes: '專門收集和處理片場產生的可回收塑料，避免進入垃圾填埋場'
  },
  {
    id: 'waste-8',
    name: '電子廢棄物回收',
    emissionFactor: 0.52,
    type: 'metal',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0038'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.12,
      usage: 0.52,
      endOfLife: -0.12,
      totalLifeCycle: 0.52,
      lifespan: 0.2
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/ewaste_recycling.jpg'
      ],
      recognitionTags: ['電子廢棄物', '回收', '電池', '電路板', '貴金屬回收'],
      manufacturer: '電子回收科技',
      modelNumber: 'ER-2022',
      releaseYear: 2022
    },
    technicalSpecs: {
      recyclingRate: 85,
      treatmentMethod: '拆解、分類、精煉',
      decompositionTime: '由回收取代',
      toxicityLevel: '處理前高，處理後低'
    },
    dataSource: 'thirdParty',
    notes: '專業處理設備廢棄的電池、燈具和電子元件，回收稀有金屬'
  },
  {
    id: 'waste-9',
    name: '紙製品循環再造',
    emissionFactor: 0.12,
    type: 'paper',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0039'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.03,
      usage: 0.12,
      endOfLife: -0.03,
      totalLifeCycle: 0.12,
      lifespan: 0.1
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/paper_recycling.jpg'
      ],
      recognitionTags: ['紙張', '循環', '再造', '劇本', '包裝'],
      manufacturer: 'N/A',
      modelNumber: 'N/A',
      releaseYear: 2022
    },
    technicalSpecs: {
      recyclingRate: 99,
      treatmentMethod: '碎漿、脫墨、漂白、成紙',
      decompositionTime: '由回收取代',
      toxicityLevel: '無'
    },
    dataSource: 'thirdParty',
    notes: '專門處理劇組使用的紙張，包括劇本、場記表和包裝材料等'
  },
  {
    id: 'waste-10',
    name: '電池回收處理',
    emissionFactor: 0.42,
    type: 'metal',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WASTE-2023-0040'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0.07,
      usage: 0.42,
      endOfLife: -0.07,
      totalLifeCycle: 0.42,
      lifespan: 0.5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/battery_recycling.jpg'
      ],
      recognitionTags: ['電池', '回收', '鋰離子', '鎳氫', '危險廢物'],
      manufacturer: '綠能回收科技',
      modelNumber: 'BR-200',
      releaseYear: 2022
    },
    technicalSpecs: {
      recyclingRate: 80,
      treatmentMethod: '破碎、分選、化學處理、回收金屬',
      decompositionTime: '由回收取代',
      toxicityLevel: '處理前高，處理後低'
    },
    dataSource: 'thirdParty',
    notes: '專門處理攝影器材和攜帶設備使用的各類電池，減少重金屬污染'
  }
];

// 增強版存儲設備數據
export const ENHANCED_STORAGE_EQUIPMENT: EnhancedStorageEquipment[] = [
  {
    id: 'storage-1',
    name: 'LaCie 6big Thunderbolt 3',
    emissionFactor: 0.04,
    type: 'raid',
    capacity: '36TB',
    weight: 10.6,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-LACIE-2023-0060'
    },
    lifeCycleData: {
      manufacturing: 180,
      transportation: 30,
      usage: 0.04,
      endOfLife: 15,
      totalLifeCycle: 225,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/lacie_6big_front.jpg',
        'https://example.com/images/lacie_6big_side.jpg'
      ],
      recognitionTags: ['LaCie', '6big', 'RAID', 'Storage', 'Thunderbolt'],
      manufacturer: 'LaCie',
      modelNumber: '6big Thunderbolt 3',
      releaseYear: 2021
    },
    technicalSpecs: {
      readSpeed: '1400MB/s',
      writeSpeed: '1200MB/s',
      interface: 'Thunderbolt 3',
      reliability: 'MTBF 1.2M hours',
      powerConsumption: 60
    },
    dataSource: 'manufacturer',
    notes: '專業RAID存儲系統，可配置RAID 0/1/5/6/10，適合高性能編輯工作'
  },
  {
    id: 'storage-2',
    name: 'Synology NAS DS1621+',
    emissionFactor: 0.03,
    type: 'nas',
    capacity: '96TB',
    weight: 5.1,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-SYNOLOGY-2023-0061'
    },
    lifeCycleData: {
      manufacturing: 160,
      transportation: 25,
      usage: 0.03,
      endOfLife: 12,
      totalLifeCycle: 197,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/synology_ds1621_front.jpg',
        'https://example.com/images/synology_ds1621_side.jpg'
      ],
      recognitionTags: ['Synology', 'NAS', 'Network Storage', 'DS1621+'],
      manufacturer: 'Synology',
      modelNumber: 'DS1621+',
      releaseYear: 2021
    },
    technicalSpecs: {
      readSpeed: '1200MB/s',
      writeSpeed: '980MB/s',
      interface: '10GbE Network',
      reliability: 'MTBF 1.5M hours',
      powerConsumption: 45
    },
    dataSource: 'manufacturer',
    notes: '網絡附加存儲系統，提供團隊協作和備份功能'
  },
  {
    id: 'storage-3',
    name: 'G-Technology ArmorATD 4TB',
    emissionFactor: 0.01,
    type: 'external-drive',
    capacity: '4TB',
    weight: 0.4,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-GTECH-2023-0062'
    },
    lifeCycleData: {
      manufacturing: 60,
      transportation: 8,
      usage: 0.01,
      endOfLife: 5,
      totalLifeCycle: 73,
      lifespan: 4
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/gtech_armoratd_front.jpg',
        'https://example.com/images/gtech_armoratd_side.jpg'
      ],
      recognitionTags: ['G-Technology', 'G-Tech', 'ArmorATD', 'External Drive', 'Rugged'],
      manufacturer: 'G-Technology',
      modelNumber: 'ArmorATD 4TB',
      releaseYear: 2022
    },
    technicalSpecs: {
      readSpeed: '140MB/s',
      writeSpeed: '130MB/s',
      interface: 'USB-C (USB 3.2 Gen 1)',
      reliability: 'Shock, dust and water resistant',
      powerConsumption: 5
    },
    dataSource: 'manufacturer',
    notes: '堅固耐用的外接硬盤，適合現場拍攝和惡劣環境'
  },
  {
    id: 'storage-4',
    name: 'Amazon S3 雲存儲',
    emissionFactor: 0.008,
    type: 'cloud',
    capacity: '不限',
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-AWS-2023-0063'
    },
    lifeCycleData: {
      manufacturing: 0,
      transportation: 0,
      usage: 0.008,
      endOfLife: 0,
      totalLifeCycle: 0.008,
      lifespan: 10
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/amazon_s3_logo.jpg'
      ],
      recognitionTags: ['Amazon', 'AWS', 'S3', 'Cloud Storage', 'Online'],
      manufacturer: 'Amazon Web Services',
      modelNumber: 'S3 Standard',
      releaseYear: 2023
    },
    technicalSpecs: {
      readSpeed: '依網絡連接而定',
      writeSpeed: '依網絡連接而定',
      interface: 'Internet API',
      reliability: '99.999999999% durability',
      powerConsumption: 0
    },
    dataSource: 'thirdParty',
    notes: '雲存儲解決方案，提供高可靠性和彈性擴展'
  },
  {
    id: 'storage-5',
    name: 'LTO-9 磁帶存儲',
    emissionFactor: 0.003,
    type: 'tape',
    capacity: '18TB (非壓縮)',
    weight: 0.2,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-LTO-2023-0064'
    },
    lifeCycleData: {
      manufacturing: 20,
      transportation: 5,
      usage: 0.003,
      endOfLife: 3,
      totalLifeCycle: 28,
      lifespan: 30
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/lto9_tape_front.jpg',
        'https://example.com/images/lto9_tape_side.jpg'
      ],
      recognitionTags: ['LTO', 'Tape', 'Backup', 'Archive', 'LTO-9'],
      manufacturer: 'Various',
      modelNumber: 'LTO-9',
      releaseYear: 2020
    },
    technicalSpecs: {
      readSpeed: '400MB/s',
      writeSpeed: '400MB/s',
      interface: 'SAS',
      reliability: '30-year archival life',
      powerConsumption: 0
    },
    dataSource: 'thirdParty',
    notes: '長期低成本歸檔解決方案，適合冷存儲和備份'
  },
  // 新增存儲設備
  {
    id: 'storage-6',
    name: 'LaCie 6big Thunderbolt 3 96TB',
    emissionFactor: 0.07,
    type: 'raid',
    capacity: '96TB',
    weight: 16.8,
    powerConsumption: 120,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-LACIE-2023-0026'
    },
    lifeCycleData: {
      manufacturing: 320,
      transportation: 40,
      usage: 0.07,
      endOfLife: 22,
      totalLifeCycle: 560,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/lacie_6big_thunderbolt_3_front.jpg',
        'https://example.com/images/lacie_6big_thunderbolt_3_side.jpg'
      ],
      recognitionTags: ['LaCie', '6big', 'Thunderbolt', 'RAID', 'Storage'],
      manufacturer: 'LaCie',
      modelNumber: '6big Thunderbolt 3',
      releaseYear: 2019
    },
    technicalSpecs: {
      readSpeed: '1400MB/s',
      writeSpeed: '1200MB/s',
      interface: 'Thunderbolt 3',
      reliability: 'MTBF 1.2M hours',
      powerConsumption: 120
    },
    dataSource: 'manufacturer',
    notes: '專業級RAID存儲陣列，適合4K/8K視頻素材的本地存儲和編輯'
  },
  {
    id: 'storage-7',
    name: 'Synology DS1522+',
    emissionFactor: 0.022,
    type: 'nas',
    capacity: '80TB',
    weight: 2.7,
    powerConsumption: 38,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-SYNOLOGY-2023-0027'
    },
    lifeCycleData: {
      manufacturing: 270,
      transportation: 30,
      usage: 0.022,
      endOfLife: 15,
      totalLifeCycle: 620,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/synology_ds1522_plus_front.jpg',
        'https://example.com/images/synology_ds1522_plus_side.jpg'
      ],
      recognitionTags: ['Synology', 'DS1522+', 'NAS', 'Network Storage'],
      manufacturer: 'Synology',
      modelNumber: 'DS1522+',
      releaseYear: 2022
    },
    technicalSpecs: {
      readSpeed: '736MB/s',
      writeSpeed: '796MB/s',
      interface: '10GbE (optional)',
      reliability: 'MTBF 1.23M hours',
      powerConsumption: 38
    },
    dataSource: 'manufacturer',
    notes: '5盤位NAS存儲解決方案，適合團隊協作和遠程存取項目文件'
  },
  {
    id: 'storage-8',
    name: 'OWC Thunderblade 32TB',
    emissionFactor: 0.009,
    type: 'external-drive',
    capacity: '32TB',
    weight: 1.2,
    powerConsumption: 15,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-OWC-2023-0028'
    },
    lifeCycleData: {
      manufacturing: 210,
      transportation: 25,
      usage: 0.009,
      endOfLife: 12,
      totalLifeCycle: 380,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/owc_thunderblade_front.jpg',
        'https://example.com/images/owc_thunderblade_side.jpg'
      ],
      recognitionTags: ['OWC', 'ThunderBlade', 'SSD', 'External', 'Thunderbolt'],
      manufacturer: 'OWC',
      modelNumber: 'ThunderBlade',
      releaseYear: 2021
    },
    technicalSpecs: {
      readSpeed: '2800MB/s',
      writeSpeed: '2450MB/s',
      interface: 'Thunderbolt 3',
      reliability: 'MTBF 1.0M hours',
      powerConsumption: 15
    },
    dataSource: 'manufacturer',
    notes: '高速外置SSD陣列，適合外勤拍攝和現場備份使用'
  },
  {
    id: 'storage-9',
    name: 'Glyph Atom Pro NVMe SSD 4TB',
    emissionFactor: 0.004,
    type: 'external-drive',
    capacity: '4TB',
    weight: 0.13,
    powerConsumption: 7,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-GLYPH-2023-0029'
    },
    lifeCycleData: {
      manufacturing: 95,
      transportation: 10,
      usage: 0.004,
      endOfLife: 6,
      totalLifeCycle: 180,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/glyph_atom_pro_nvme_ssd_front.jpg',
        'https://example.com/images/glyph_atom_pro_nvme_ssd_side.jpg'
      ],
      recognitionTags: ['Glyph', 'Atom', 'Pro', 'NVMe', 'SSD', 'Portable'],
      manufacturer: 'Glyph',
      modelNumber: 'Atom Pro NVMe SSD',
      releaseYear: 2020
    },
    technicalSpecs: {
      readSpeed: '2800MB/s',
      writeSpeed: '2600MB/s',
      interface: 'USB-C (Thunderbolt 3)',
      reliability: 'MTBF 1.5M hours',
      powerConsumption: 7
    },
    dataSource: 'manufacturer',
    notes: '超便攜高速SSD，適合現場DIT工作和高速素材傳輸'
  },
  {
    id: 'storage-10',
    name: 'QNAP TVS-h874',
    emissionFactor: 0.038,
    type: 'nas',
    capacity: '160TB',
    weight: 6.2,
    powerConsumption: 65,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-QNAP-2023-0030'
    },
    lifeCycleData: {
      manufacturing: 420,
      transportation: 45,
      usage: 0.038,
      endOfLife: 25,
      totalLifeCycle: 850,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/qnap_tvs_h874_front.jpg',
        'https://example.com/images/qnap_tvs_h874_side.jpg'
      ],
      recognitionTags: ['QNAP', 'TVS-h874', 'NAS', 'Enterprise', 'Storage'],
      manufacturer: 'QNAP',
      modelNumber: 'TVS-h874',
      releaseYear: 2021
    },
    technicalSpecs: {
      readSpeed: '3400MB/s',
      writeSpeed: '3000MB/s',
      interface: '10GbE SFP+',
      reliability: 'MTBF 1.4M hours',
      powerConsumption: 65
    },
    dataSource: 'manufacturer',
    notes: '企業級NAS存儲解決方案，支持ZFS文件系統和10GbE網絡'
  }
];

// 增強版編輯設備數據
export const ENHANCED_EDITING_EQUIPMENT: EnhancedEditingEquipment[] = [
  {
    id: 'edit-1',
    name: 'Adobe Premiere Pro 工作站',
    powerConsumption: 320,
    emissionFactor: 0.18,
    type: 'workstation',
    weight: 15.2,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ADOBE-WS-2023-0050'
    },
    lifeCycleData: {
      manufacturing: 420,
      transportation: 60,
      usage: 0.18,
      endOfLife: 25,
      totalLifeCycle: 505,
      lifespan: 4
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/adobe_premiere_workstation_front.jpg',
        'https://example.com/images/adobe_premiere_workstation_side.jpg'
      ],
      recognitionTags: ['Adobe', 'Premiere', 'Workstation', 'Editing', 'Post-production'],
      manufacturer: 'Custom Build',
      modelNumber: 'Adobe PP-WS2023',
      releaseYear: 2023
    },
    technicalSpecs: {
      processor: 'AMD Ryzen 9 5950X',
      memory: '128GB DDR4 3600MHz',
      storage: '4TB NVMe SSD + 16TB RAID',
      graphicsCard: 'NVIDIA RTX 4090',
      monitorResolution: '4K HDR'
    },
    dataSource: 'manufacturer',
    notes: '專業後期製作工作站，適用於大型項目剪輯和顏色分級'
  },
  {
    id: 'edit-2',
    name: 'DaVinci Resolve 顏色分級系統',
    powerConsumption: 380,
    emissionFactor: 0.22,
    type: 'color-grading',
    weight: 18.5,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-DAVINCI-2023-0051'
    },
    lifeCycleData: {
      manufacturing: 480,
      transportation: 65,
      usage: 0.22,
      endOfLife: 30,
      totalLifeCycle: 575,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/davinci_resolve_system_front.jpg',
        'https://example.com/images/davinci_resolve_system_side.jpg'
      ],
      recognitionTags: ['DaVinci', 'Resolve', 'Color Grading', 'Blackmagic'],
      manufacturer: 'Blackmagic Design',
      modelNumber: 'Advanced Panel System 2023',
      releaseYear: 2023
    },
    technicalSpecs: {
      processor: 'Intel Core i9-13900K',
      memory: '256GB DDR5',
      storage: '8TB NVMe SSD + 48TB RAID 6',
      graphicsCard: 'Dual NVIDIA RTX A6000',
      monitorResolution: '6K HDR Reference Monitor'
    },
    dataSource: 'manufacturer',
    notes: '專業顏色分級系統，包含硬件控制面板和參考監視器'
  },
  {
    id: 'edit-3',
    name: 'Final Cut Pro 筆記本工作站',
    powerConsumption: 85,
    emissionFactor: 0.06,
    type: 'laptop',
    weight: 2.3,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-FCPX-2023-0052'
    },
    lifeCycleData: {
      manufacturing: 350,
      transportation: 35,
      usage: 0.06,
      endOfLife: 20,
      totalLifeCycle: 405,
      lifespan: 4
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/fcpx_laptop_workstation_front.jpg',
        'https://example.com/images/fcpx_laptop_workstation_side.jpg'
      ],
      recognitionTags: ['Final Cut Pro', 'FCP', 'Apple', 'MacBook', 'Editing'],
      manufacturer: 'Apple',
      modelNumber: 'MacBook Pro 16" M2 Max',
      releaseYear: 2023
    },
    technicalSpecs: {
      processor: 'Apple M2 Max (12-core)',
      memory: '64GB Unified Memory',
      storage: '8TB SSD',
      graphicsCard: 'Integrated 38-core GPU',
      monitorResolution: 'Liquid Retina XDR'
    },
    dataSource: 'manufacturer',
    notes: '便攜式剪輯工作站，適合現場組接和預覽'
  },
  {
    id: 'edit-4',
    name: 'Avid Media Composer 工作站',
    powerConsumption: 340,
    emissionFactor: 0.19,
    type: 'workstation',
    weight: 16.0,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-AVID-2023-0053'
    },
    lifeCycleData: {
      manufacturing: 430,
      transportation: 55,
      usage: 0.19,
      endOfLife: 28,
      totalLifeCycle: 513,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/avid_workstation_front.jpg',
        'https://example.com/images/avid_workstation_side.jpg'
      ],
      recognitionTags: ['Avid', 'Media Composer', 'Editing', 'Workstation'],
      manufacturer: 'Avid Technology',
      modelNumber: 'Media Composer Ultimate System',
      releaseYear: 2022
    },
    technicalSpecs: {
      processor: 'Intel Xeon W-3365',
      memory: '192GB DDR4 ECC',
      storage: '4TB NVMe SSD + 32TB RAID 5',
      graphicsCard: 'NVIDIA RTX A5000',
      monitorResolution: 'Dual 4K Professional Monitors'
    },
    dataSource: 'manufacturer',
    notes: '專業電影和電視製作編輯工作站，具有強大的多媒體處理能力'
  },
  {
    id: 'edit-5',
    name: 'After Effects 視覺特效工作站',
    powerConsumption: 410,
    emissionFactor: 0.24,
    type: 'workstation',
    weight: 17.5,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ADOBE-AE-2023-0054'
    },
    lifeCycleData: {
      manufacturing: 450,
      transportation: 60,
      usage: 0.24,
      endOfLife: 32,
      totalLifeCycle: 542,
      lifespan: 4
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/after_effects_workstation_front.jpg',
        'https://example.com/images/after_effects_workstation_side.jpg'
      ],
      recognitionTags: ['Adobe', 'After Effects', 'VFX', 'Visual Effects', 'Workstation'],
      manufacturer: 'Custom Build',
      modelNumber: 'AE-VFX Pro 2023',
      releaseYear: 2023
    },
    technicalSpecs: {
      processor: 'AMD Threadripper PRO 5995WX',
      memory: '256GB DDR4 ECC',
      storage: '4TB NVMe SSD + 24TB RAID',
      graphicsCard: 'NVIDIA RTX 4090 24GB',
      monitorResolution: 'Dual 5K Professional Monitors'
    },
    dataSource: 'manufacturer',
    notes: '高端視覺特效工作站，適合複雜的合成和3D渲染工作'
  },
  // 新增編輯設備
  {
    id: 'edit-6',
    name: 'Mac Studio M2 Ultra',
    powerConsumption: 370,
    emissionFactor: 0.21,
    type: 'workstation',
    weight: 3.6,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-APPLE-2023-0021'
    },
    lifeCycleData: {
      manufacturing: 620,
      transportation: 40,
      usage: 0.21,
      endOfLife: 25,
      totalLifeCycle: 1340,
      lifespan: 6
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/mac_studio_m2_ultra_front.jpg',
        'https://example.com/images/mac_studio_m2_ultra_side.jpg'
      ],
      recognitionTags: ['Apple', 'Mac', 'Studio', 'M2', 'Ultra', 'Workstation'],
      manufacturer: 'Apple',
      modelNumber: 'Mac Studio (2023)',
      releaseYear: 2023
    },
    technicalSpecs: {
      processor: 'Apple M2 Ultra',
      memory: '128GB Unified Memory',
      storage: '8TB SSD',
      graphicsCard: 'Integrated 76-core GPU',
      monitorResolution: 'Supports up to 6K'
    },
    dataSource: 'manufacturer',
    notes: '高性能桌面工作站，能夠處理複雜的8K剪輯和色彩分級工作'
  },
  {
    id: 'edit-7',
    name: 'Dell Precision 7960',
    powerConsumption: 750,
    emissionFactor: 0.44,
    type: 'workstation',
    weight: 15.2,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-DELL-2023-0022'
    },
    lifeCycleData: {
      manufacturing: 1100,
      transportation: 85,
      usage: 0.44,
      endOfLife: 45,
      totalLifeCycle: 2560,
      lifespan: 5
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/dell_precision_7960_front.jpg',
        'https://example.com/images/dell_precision_7960_side.jpg'
      ],
      recognitionTags: ['Dell', 'Precision', '7960', 'Workstation', 'Tower'],
      manufacturer: 'Dell',
      modelNumber: 'Precision 7960',
      releaseYear: 2022
    },
    technicalSpecs: {
      processor: 'Intel Xeon W-3300',
      memory: '256GB DDR5 ECC',
      storage: '8TB NVMe SSD',
      graphicsCard: 'NVIDIA RTX A6000',
      monitorResolution: 'Supports up to 8K'
    },
    dataSource: 'manufacturer',
    notes: '強大的專業工作站，適合複雜的3D渲染和特效合成工作'
  },
  {
    id: 'edit-8',
    name: 'ASUS ProArt Studiobook Pro 16',
    powerConsumption: 230,
    emissionFactor: 0.14,
    type: 'laptop',
    weight: 2.4,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-ASUS-2023-0023'
    },
    lifeCycleData: {
      manufacturing: 420,
      transportation: 35,
      usage: 0.14,
      endOfLife: 20,
      totalLifeCycle: 890,
      lifespan: 4
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/asus_proart_studiobook_pro_16_front.jpg',
        'https://example.com/images/asus_proart_studiobook_pro_16_side.jpg'
      ],
      recognitionTags: ['ASUS', 'ProArt', 'Studiobook', 'Pro', '16', 'Laptop'],
      manufacturer: 'ASUS',
      modelNumber: 'ProArt Studiobook Pro 16 OLED (W7600)',
      releaseYear: 2022
    },
    technicalSpecs: {
      processor: 'Intel Core i9-12900H',
      memory: '64GB DDR5',
      storage: '4TB NVMe SSD',
      graphicsCard: 'NVIDIA RTX A5000',
      monitorResolution: '4K OLED'
    },
    dataSource: 'manufacturer',
    notes: '專業級創意筆記本，具有出色的顯示色彩精度和ASUS Dial創意控制器'
  },
  {
    id: 'edit-9',
    name: 'Blackmagic DaVinci Resolve Panel',
    powerConsumption: 25,
    emissionFactor: 0.015,
    type: 'color-grading',
    weight: 13.5,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-BMD-2023-0024'
    },
    lifeCycleData: {
      manufacturing: 180,
      transportation: 30,
      usage: 0.015,
      endOfLife: 15,
      totalLifeCycle: 320,
      lifespan: 8
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/blackmagic_davinci_resolve_panel_front.jpg',
        'https://example.com/images/blackmagic_davinci_resolve_panel_side.jpg'
      ],
      recognitionTags: ['Blackmagic', 'DaVinci', 'Resolve', 'Panel', 'Advanced'],
      manufacturer: 'Blackmagic Design',
      modelNumber: 'DaVinci Resolve Advanced Panel',
      releaseYear: 2019
    },
    technicalSpecs: {
      processor: 'N/A',
      memory: 'N/A',
      storage: 'N/A',
      graphicsCard: 'N/A',
      monitorResolution: 'N/A'
    },
    dataSource: 'manufacturer',
    notes: '專業級調色控制台，用於精確的色彩分級工作'
  },
  {
    id: 'edit-10',
    name: 'Wacom Cintiq Pro 27',
    powerConsumption: 80,
    emissionFactor: 0.046,
    type: 'color-grading',
    weight: 7.2,
    isoCertification: {
      ...standardISOData,
      certificationId: 'ISO14064-WACOM-2023-0025'
    },
    lifeCycleData: {
      manufacturing: 280,
      transportation: 35,
      usage: 0.046,
      endOfLife: 18,
      totalLifeCycle: 580,
      lifespan: 7
    },
    recognitionData: {
      imageUrls: [
        'https://example.com/images/wacom_cintiq_pro_27_front.jpg',
        'https://example.com/images/wacom_cintiq_pro_27_side.jpg'
      ],
      recognitionTags: ['Wacom', 'Cintiq', 'Pro', '27', 'Display', 'Tablet'],
      manufacturer: 'Wacom',
      modelNumber: 'Cintiq Pro 27',
      releaseYear: 2022
    },
    technicalSpecs: {
      processor: 'N/A',
      memory: 'N/A',
      storage: 'N/A',
      graphicsCard: 'N/A',
      monitorResolution: '4K HDR'
    },
    dataSource: 'manufacturer',
    notes: '專業級繪圖顯示器，適用於後期製作中的視覺效果和特效設計'
  }
];

// 導出所有增強設備數據
export const ENHANCED_EQUIPMENT = [
  ...ENHANCED_CAMERA_EQUIPMENT,
  ...ENHANCED_LIGHTING_EQUIPMENT,
  ...ENHANCED_TRANSPORT_EQUIPMENT,
  ...ENHANCED_OFFICE_EQUIPMENT,
  ...ENHANCED_EDITING_EQUIPMENT,
  ...ENHANCED_STORAGE_EQUIPMENT,
  ...ENHANCED_FOOD_EQUIPMENT,
  ...ENHANCED_ACCOMMODATION_EQUIPMENT,
  ...ENHANCED_WASTE_EQUIPMENT,
  ...ENHANCED_FUEL_EQUIPMENT
]; 

// 增強版音頻設備數據
export const ENHANCED_AUDIO_EQUIPMENT: EnhancedAudioEquipment[] = [
  {
    id: 'audio-s50',
    name: 'Sennheiser MKH 50',
    powerConsumption: 4.5,
    emissionFactor: 0.008,
    type: 'microphone',
    weight: 0.1,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-SENN-AUDIO-2023-0001',
      certifiedBy: 'TÜV SÜD',
      validUntil: '2026-04-15',
      certificationDate: '2023-04-15'
    },
    lifeCycleData: {
      manufacturing: 35,
      transportation: 5,
      usage: 0.008,
      endOfLife: 3,
      totalLifeCycle: 110,
      lifespan: 15
    },
    recognitionData: {
      imageUrls: [
        'https://assets.sennheiser.com/img/25942/product_detail_x1_desktop_MKH_50_Sennheiser_01.jpg',
        'https://assets.sennheiser.com/img/25943/product_detail_x1_desktop_MKH_50_Sennheiser_02.jpg'
      ],
      recognitionTags: ['Sennheiser', 'MKH', '50', 'Microphone', 'Super-cardioid'],
      manufacturer: 'Sennheiser',
      modelNumber: 'MKH 50',
      releaseYear: 2015
    },
    technicalSpecs: {
      frequency: '40Hz - 20kHz',
      signalToNoise: 84,
      connectivity: ['XLR']
    },
    dataSource: 'manufacturer',
    notes: '專業超心形指向話筒，低自噪和高靈敏度，採用耐用金屬外殼設計，壽命延長'
  },
  
  {
    id: 'audio-4098',
    name: 'DPA 4098',
    powerConsumption: 3.2,
    emissionFactor: 0.006,
    type: 'microphone',
    weight: 0.044,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-DPA-AUDIO-2023-0008',
      certifiedBy: 'SGS',
      validUntil: '2026-05-22',
      certificationDate: '2023-05-22'
    },
    lifeCycleData: {
      manufacturing: 28,
      transportation: 4,
      usage: 0.006,
      endOfLife: 2,
      totalLifeCycle: 95,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://www.dpamicrophones.com/media/images/4098-supercardioid-interview-microphone.jpeg',
        'https://www.dpamicrophones.com/media/images/4098-supercardioid-gooseneck-microphone.jpg'
      ],
      recognitionTags: ['DPA', '4098', 'Microphone', 'Gooseneck', 'Super-cardioid'],
      manufacturer: 'DPA',
      modelNumber: '4098',
      releaseYear: 2018
    },
    technicalSpecs: {
      frequency: '20Hz - 20kHz',
      signalToNoise: 82,
      connectivity: ['XLR', 'MicroDot']
    },
    dataSource: 'manufacturer',
    notes: '超心形界面話筒，採用輕量環保材料和鵝頸設計，尺寸小巧極大減少材料使用和運輸排放'
  },
  
  {
    id: 'audio-f6',
    name: 'Zoom F6',
    powerConsumption: 12,
    emissionFactor: 0.016,
    type: 'recorder',
    weight: 0.52,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-ZOOM-AUDIO-2023-0011',
      certifiedBy: 'BSI Group',
      validUntil: '2026-03-18',
      certificationDate: '2023-03-18'
    },
    lifeCycleData: {
      manufacturing: 75,
      transportation: 10,
      usage: 0.016,
      endOfLife: 8,
      totalLifeCycle: 240,
      lifespan: 10
    },
    recognitionData: {
      imageUrls: [
        'https://zoomcorp.com/media/guides/links/F6-03_top.jpg',
        'https://zoomcorp.com/media/guides/links/F6-01.jpg'
      ],
      recognitionTags: ['Zoom', 'F6', 'Recorder', 'Field', '32-bit', 'Multi-track'],
      manufacturer: 'Zoom',
      modelNumber: 'F6',
      releaseYear: 2019
    },
    technicalSpecs: {
      frequency: '10Hz - 100kHz',
      signalToNoise: 131,
      batteryLife: 8,
      connectivity: ['XLR', 'USB', 'SD Card']
    },
    dataSource: 'manufacturer',
    notes: '多軌現場錄音機，採用32位浮點記錄，支持雙電池系統，能源效率高'
  },
  
  {
    id: 'audio-788t',
    name: 'Sound Devices 788T',
    powerConsumption: 18,
    emissionFactor: 0.024,
    type: 'recorder',
    weight: 1.5,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-SD-AUDIO-2023-0015',
      certifiedBy: 'TÜV Rheinland',
      validUntil: '2026-02-10',
      certificationDate: '2023-02-10'
    },
    lifeCycleData: {
      manufacturing: 120,
      transportation: 15,
      usage: 0.024,
      endOfLife: 12,
      totalLifeCycle: 380,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://www.sounddevices.com/wp-content/uploads/2019/02/788t-front.jpg',
        'https://www.sounddevices.com/wp-content/uploads/2019/02/788t-right.jpg'
      ],
      recognitionTags: ['Sound Devices', '788T', 'Recorder', 'Field', 'Multi-track', 'Timecode'],
      manufacturer: 'Sound Devices',
      modelNumber: '788T',
      releaseYear: 2008
    },
    technicalSpecs: {
      frequency: '10Hz - 40kHz',
      signalToNoise: 120,
      batteryLife: 6,
      connectivity: ['XLR', 'AES', 'USB', 'CompactFlash', 'SATA']
    },
    dataSource: 'manufacturer',
    notes: '專業級現場錄音機，耐用鋁合金外殼設計，可修復性高，降低整體生命週期碳排放'
  },
  
  {
    id: 'audio-m32',
    name: 'Midas M32',
    powerConsumption: 120,
    emissionFactor: 0.08,
    type: 'mixer',
    weight: 20.5,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-MIDAS-AUDIO-2023-0018',
      certifiedBy: 'DNV GL',
      validUntil: '2026-06-25',
      certificationDate: '2023-06-25'
    },
    lifeCycleData: {
      manufacturing: 320,
      transportation: 45,
      usage: 0.08,
      endOfLife: 35,
      totalLifeCycle: 1180,
      lifespan: 15
    },
    recognitionData: {
      imageUrls: [
        'https://mediadl.musictribe.com/media/PLM/data/images/products/P0B3I/2000Wx2000H/M32_P0B3I_Top_XL.png',
        'https://mediadl.musictribe.com/media/PLM/data/images/products/P0B3I/2000Wx2000H/M32_P0B3I_Front_XL.png'
      ],
      recognitionTags: ['Midas', 'M32', 'Mixer', 'Digital', 'Console', 'Audio'],
      manufacturer: 'Midas',
      modelNumber: 'M32',
      releaseYear: 2014
    },
    technicalSpecs: {
      frequency: '10Hz - 22kHz',
      signalToNoise: 110,
      connectivity: ['XLR', 'AES/EBU', 'ULTRANET', 'USB', 'Ethernet']
    },
    dataSource: 'manufacturer',
    notes: '專業級數字調音台，所有組件可單獨更換和升級，延長使用壽命，減少電子廢棄物'
  },
  
  {
    id: 'audio-g4',
    name: 'Sennheiser EW 512P G4',
    powerConsumption: 8,
    emissionFactor: 0.014,
    type: 'wireless',
    weight: 0.38,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-SENN-AUDIO-2023-0024',
      certifiedBy: 'Carbon Trust',
      validUntil: '2026-05-30',
      certificationDate: '2023-05-30'
    },
    lifeCycleData: {
      manufacturing: 90,
      transportation: 12,
      usage: 0.014,
      endOfLife: 10,
      totalLifeCycle: 290,
      lifespan: 10
    },
    recognitionData: {
      imageUrls: [
        'https://assets.sennheiser.com/img/12385/product_detail_x1_desktop_ew_512p_g4_01_set_sennheiser.jpg',
        'https://assets.sennheiser.com/img/12387/product_detail_x1_desktop_ew_512p_g4_02_components.jpg'
      ],
      recognitionTags: ['Sennheiser', 'EW', '512P', 'G4', 'Wireless', 'Lavalier', 'Microphone'],
      manufacturer: 'Sennheiser',
      modelNumber: 'EW 512P G4',
      releaseYear: 2018
    },
    technicalSpecs: {
      frequency: '516-558MHz',
      signalToNoise: 115,
      batteryLife: 8,
      connectivity: ['XLR', '3.5mm', 'USB']
    },
    dataSource: 'manufacturer',
    notes: '專業無線麥克風系統，能源效率高，支持充電電池使用，減少一次性電池浪費'
  },
  
  {
    id: 'audio-hd25',
    name: 'Sennheiser HD-25',
    powerConsumption: 0,
    emissionFactor: 0.004,
    type: 'headphones',
    weight: 0.14,
    isoCertification: {
      ...standardISOData,
      standard: 'ISO14064',
      certificationId: 'ISO14064-SENN-AUDIO-2023-0033',
      certifiedBy: 'SCS Global',
      validUntil: '2026-01-20',
      certificationDate: '2023-01-20'
    },
    lifeCycleData: {
      manufacturing: 40,
      transportation: 6,
      usage: 0.004,
      endOfLife: 5,
      totalLifeCycle: 95,
      lifespan: 12
    },
    recognitionData: {
      imageUrls: [
        'https://assets.sennheiser.com/img/22726/product_detail_x1_desktop_HD_25_light_View_Upright_Sennheiser.jpg',
        'https://assets.sennheiser.com/img/20972/product_detail_x1_desktop_HD_25_Frontview_Sennheiser_03.jpg'
      ],
      recognitionTags: ['Sennheiser', 'HD-25', 'Headphones', 'Monitor', 'Closed-back'],
      manufacturer: 'Sennheiser',
      modelNumber: 'HD-25',
      releaseYear: 1988
    },
    technicalSpecs: {
      frequency: '16Hz - 22kHz',
      signalToNoise: 85,
      connectivity: ['3.5mm', '6.3mm']
    },
    dataSource: 'manufacturer',
    notes: '經典監聽耳機，模塊化設計使所有部件可單獨更換，大幅延長產品壽命，減少整體碳足跡'
  }
]; 