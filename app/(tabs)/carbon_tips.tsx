import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, TextInput, Modal, Alert, Linking, Platform } from 'react-native';
import { Lightbulb, Car, Laptop, Utensils, Hotel, Trash, Fuel, Droplet, Wind, Zap, Search, TreeDeciduous, Calculator, X, ArrowRight, Check, MapPin, Navigation, Building, Phone, ShoppingBag, Leaf, Recycle, Coffee, Sun, Salad, Activity, BarChart3, TrendingDown, Target, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useDimensions } from '@/hooks/useDimensions';
import PageTitle from '@/components/PageTitle';
import Button from '@/components/Button';

// 碳抵消提供商數據
const CARBON_OFFSET_PROVIDERS = [
  {
    id: '1',
    name: '綠色未來基金會',
    description: '專注於台灣本地森林保育和再生能源項目',
    price: 300, // 每噸CO2e價格（新台幣）
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013',
    website: 'https://www.greenfuture.org.tw',
    projects: ['台灣山區造林計劃', '離岸風電支持計劃']
  },
  {
    id: '2',
    name: '碳中和聯盟',
    description: '支持國際認證的碳抵消項目，包括森林保育和可再生能源',
    price: 450, // 每噸CO2e價格（新台幣）
    image: 'https://images.unsplash.com/photo-1569097387546-9015f4603efc?q=80&w=2070',
    website: 'https://www.carbonneutral.org',
    projects: ['亞馬遜雨林保護', '印度太陽能發電']
  },
  {
    id: '3',
    name: '海洋碳匯計劃',
    description: '專注於海洋生態系統恢復，如紅樹林和海草床保育',
    price: 380, // 每噸CO2e價格（新台幣）
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=1974',
    website: 'https://www.oceancarbon.org',
    projects: ['台灣紅樹林復育', '珊瑚礁保護計劃']
  }
];

// 低碳攝影棚數據
const GREEN_STUDIOS = [
  {
    id: 's1',
    name: '綠能影視中心',
    location: '台北市內湖區',
    description: '台灣首家100%使用綠電的攝影棚，配備太陽能板和雨水回收系統',
    features: ['100%綠電供應', '節能LED燈光', '雨水回收系統', '廢棄物分類回收'],
    image: 'https://images.unsplash.com/photo-1604514813560-1e4f5726db65?q=80&w=2071',
    contact: '02-2789-5678',
    website: 'https://www.greenstudio.tw',
    carbonReduction: '比傳統攝影棚減少75%碳排放'
  },
  {
    id: 's2',
    name: '永續影視基地',
    location: '新北市林口區',
    description: '採用智能能源管理系統的現代化攝影棚，專為大型製作設計',
    features: ['智能能源管理', '高效隔熱材料', '電動車充電站', '有機餐飲服務'],
    image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070',
    contact: '02-2633-8901',
    website: 'https://www.sustainablestudio.com.tw',
    carbonReduction: '比傳統攝影棚減少60%碳排放'
  },
  {
    id: 's3',
    name: '藍天綠地影視城',
    location: '桃園市龜山區',
    description: '結合室內外場景的綜合影視基地，使用地熱能源和自然採光',
    features: ['地熱能源系統', '自然採光設計', '生態友善環境', '低碳交通接駁'],
    image: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=2072',
    contact: '03-3278-4567',
    website: 'https://www.blueskygreenland.com.tw',
    carbonReduction: '比傳統攝影棚減少65%碳排放'
  }
];

// 電動車租賃服務
const EV_RENTAL_SERVICES = [
  {
    id: 'ev1',
    name: '綠動出行',
    description: '專業電動車租賃服務，提供各類型電動車輛',
    vehicles: [
      { type: '特斯拉 Model 3', price: 3500, range: '450公里', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2071' },
      { type: '特斯拉 Model Y', price: 4000, range: '420公里', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2071' },
      { type: '福斯 ID.4', price: 3000, range: '400公里', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2071' }
    ],
    contact: '02-2345-6789',
    website: 'https://www.greenmotion.com.tw',
    locations: ['台北市', '新北市', '桃園市', '台中市', '高雄市']
  },
  {
    id: 'ev2',
    name: '電馳租車',
    description: '專注於影視製作的電動車租賃，提供設備運輸車輛',
    vehicles: [
      { type: '賓士 EQV', price: 4500, range: '350公里', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2071' },
      { type: '福特 E-Transit', price: 3800, range: '300公里', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2071' },
      { type: '日產 e-NV200', price: 2800, range: '280公里', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2071' }
    ],
    contact: '02-8765-4321',
    website: 'https://www.electricdrive.com.tw',
    locations: ['台北市', '新北市', '台中市', '高雄市']
  }
];

// 節能設備供應商
const ENERGY_EFFICIENT_EQUIPMENT = [
  {
    id: 'ee1',
    name: '綠光影視器材',
    description: '專業影視節能設備供應商，提供LED燈光和低能耗攝影設備',
    products: [
      { name: 'EcoLight LED燈組', price: 25000, description: '節能LED燈光系統，比傳統燈光節省80%能源', image: 'https://images.unsplash.com/photo-1533656339787-1fc2e9e52fe3?q=80&w=1974' },
      { name: '太陽能充電站', price: 18000, description: '便攜式太陽能充電站，適合外景拍攝使用', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072' },
      { name: '節能攝影機冷卻系統', price: 12000, description: '減少攝影機散熱能耗的專業冷卻系統', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2070' }
    ],
    contact: '02-2345-6789',
    website: 'https://www.greenlight.com.tw',
    locations: ['台北市', '台中市', '高雄市']
  },
  {
    id: 'ee2',
    name: '永續影視科技',
    description: '提供全系列節能影視製作設備，包括攝影機、錄音和後期設備',
    products: [
      { name: '低功耗專業攝影機', price: 120000, description: '節能設計的專業攝影機，比傳統機型節省40%能源', image: 'https://images.unsplash.com/photo-1589872307379-0ffdf9829123?q=80&w=2043' },
      { name: '太陽能音響系統', price: 35000, description: '太陽能供電的專業音響系統，適合外景拍攝', image: 'https://images.unsplash.com/photo-1558392204-ac78741f4abf?q=80&w=2070' },
      { name: '節能剪輯工作站', price: 85000, description: '低能耗高效能的後期製作工作站', image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2070' }
    ],
    contact: '02-8765-4321',
    website: 'https://www.sustainabletech.com.tw',
    locations: ['台北市', '新北市', '台中市']
  }
];

// 減少食物浪費服務
const FOOD_WASTE_REDUCTION = [
  {
    id: 'fw1',
    name: '剩食零浪費',
    description: '專為影視製作提供精確餐飲計算和剩食處理服務',
    services: [
      { name: '精確餐飲需求評估', price: '依專案規模定價', description: '根據劇組人數和拍攝時間精確計算餐飲需求', image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=1964' },
      { name: '剩食回收再分配', price: '免費服務', description: '將剩餘食物捐贈給慈善機構或轉化為堆肥', image: 'https://images.unsplash.com/photo-1605493725784-56d225c63cc8?q=80&w=2070' },
      { name: '可堆肥餐具供應', price: '每人每餐50元起', description: '提供100%可堆肥的環保餐具', image: 'https://images.unsplash.com/photo-1584473457493-17c4c24290c5?q=80&w=2070' }
    ],
    contact: '02-2345-6789',
    website: 'https://www.zerofoodwaste.com.tw',
    clients: ['公共電視台', '福斯傳媒', '華納影業台灣分公司']
  },
  {
    id: 'fw2',
    name: '綠色餐飲規劃',
    description: '提供影視製作的永續餐飲解決方案，從菜單設計到廚餘處理',
    services: [
      { name: '低碳菜單設計', price: '每個專案15000元起', description: '設計低碳足跡的季節性菜單，使用當地食材', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070' },
      { name: '食物追蹤系統', price: '每月5000元', description: '追蹤食物消耗和浪費情況的數字化系統', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070' },
      { name: '廚餘堆肥服務', price: '每公斤100元', description: '將廚餘轉化為有機堆肥，可用於社區花園', image: 'https://images.unsplash.com/photo-1580852300654-2d5a0a7b5705?q=80&w=2070' }
    ],
    contact: '02-8765-4321',
    website: 'https://www.greencatering.com.tw',
    clients: ['Netflix台灣製作團隊', '中華電視公司', '獨立電影製作聯盟']
  }
];

// 綠色住宿選項
const GREEN_ACCOMMODATIONS = [
  {
    id: 'ga1',
    name: '綠葉生態酒店',
    location: '台北市信義區',
    description: '台灣首家獲得LEED白金認證的生態酒店，100%使用再生能源',
    features: ['100%綠電供應', '雨水回收系統', '有機餐廳', '零廢棄物政策', '電動車充電站'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
    contact: '02-2345-6789',
    website: 'https://www.greenleafhotel.com.tw',
    carbonReduction: '比傳統酒店減少85%碳排放',
    price: '每晚3500元起'
  },
  {
    id: 'ga2',
    name: '永續商旅',
    location: '新北市板橋區',
    description: '專為商務和影視工作者設計的綠色住宿，提供共享工作空間和會議室',
    features: ['節能建築設計', '智能溫控系統', '低碳餐飲選擇', '可回收備品', '共享交通工具'],
    image: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=2074',
    contact: '02-8765-4321',
    website: 'https://www.sustainablestay.com.tw',
    carbonReduction: '比傳統商旅減少65%碳排放',
    price: '每晚2800元起'
  },
  {
    id: 'ga3',
    name: '藍海生態度假村',
    location: '宜蘭縣頭城鎮',
    description: '海濱生態度假村，結合自然保育和豪華住宿體驗',
    features: ['海洋保育計劃', '太陽能和風能供電', '有機農場', '生態旅遊活動', '海灘清潔計劃'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
    contact: '03-9876-5432',
    website: 'https://www.blueoceanresort.com.tw',
    carbonReduction: '比傳統度假村減少70%碳排放',
    price: '每晚4500元起'
  }
];

// 廢棄物管理服務
const WASTE_MANAGEMENT_SERVICES = [
  {
    id: 'wm1',
    name: '循環資源管理',
    description: '專為影視製作提供全方位的廢棄物管理和回收服務',
    services: [
      { name: '片場廢棄物分類系統', price: '每個專案20000元起', description: '提供完整的廢棄物分類站和培訓', image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070' },
      { name: '道具和材料回收', price: '依材料類型定價', description: '回收和再利用片場道具和建築材料', image: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=2070' },
      { name: '危險廢棄物處理', price: '每公斤200元起', description: '專業處理電池、化學品等危險廢棄物', image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2070' }
    ],
    contact: '02-2345-6789',
    website: 'https://www.circularresources.com.tw',
    clients: ['華納兄弟', '迪士尼', '福斯傳媒']
  },
  {
    id: 'wm2',
    name: '綠色製作廢棄物顧問',
    description: '提供影視製作的廢棄物減量和管理諮詢服務',
    services: [
      { name: '廢棄物審計和減量計劃', price: '每個專案30000元起', description: '評估當前廢棄物產生情況並制定減量策略', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013' },
      { name: '零廢棄物認證輔導', price: '每個專案50000元起', description: '協助影視製作獲得零廢棄物認證', image: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?q=80&w=2029' },
      { name: '廢棄物追蹤報告', price: '每月10000元', description: '提供詳細的廢棄物產生和處理報告，用於ESG報告', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070' }
    ],
    contact: '02-8765-4321',
    website: 'https://www.greenproductionconsulting.com.tw',
    clients: ['Netflix', '公共電視台', '中央電影公司']
  }
];

// 可再生能源提供商
const RENEWABLE_ENERGY_PROVIDERS = [
  {
    id: 're1',
    name: '陽光電力',
    description: '專為影視製作提供太陽能解決方案，包括便攜式太陽能發電站',
    products: [
      { name: '便攜式太陽能發電站', price: 85000, description: '可提供5kW電力的便攜式太陽能系統，適合外景拍攝', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072' },
      { name: '太陽能充電車', price: 150000, description: '移動式太陽能充電車，可為設備提供持續電力', image: 'https://images.unsplash.com/photo-1564088436906-d8d4960d2a0a?q=80&w=2070' },
      { name: '太陽能燈光系統', price: 65000, description: '完全由太陽能供電的專業燈光系統', image: 'https://images.unsplash.com/photo-1611373755990-fedf1deab926?q=80&w=2070' }
    ],
    contact: '02-2345-6789',
    website: 'https://www.sunpowerfilm.com.tw',
    locations: ['台北市', '新北市', '台中市', '高雄市']
  },
  {
    id: 're2',
    name: '綠能影視電力',
    description: '提供影視製作的綠電解決方案，包括綠電認證和碳中和服務',
    services: [
      { name: '綠電認證', price: '每度電加收0.5元', description: '為您的製作提供100%綠電認證', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070' },
      { name: '混合能源發電車', price: '每天租金15000元', description: '結合太陽能、風能和生物燃料的混合能源發電車', image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=2059' },
      { name: '碳中和製作認證', price: '每個專案50000元起', description: '為您的製作提供碳中和認證和標誌使用權', image: 'https://images.unsplash.com/photo-1569097387546-9015f4603efc?q=80&w=2070' }
    ],
    contact: '02-8765-4321',
    website: 'https://www.greenpowerfilm.com.tw',
    clients: ['HBO', 'Netflix', '迪士尼']
  }
];

// 植物性餐飲服務
const PLANT_BASED_CATERING = [
  {
    id: 'pb1',
    name: '綠色盛宴',
    description: '專業的植物性餐飲服務，為影視製作提供美味健康的素食選擇',
    services: [
      { name: '標準植物性餐飲套餐', price: '每人每餐250元起', description: '營養均衡的植物性餐點，適合日常拍攝', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070' },
      { name: '豪華植物性自助餐', price: '每人每餐450元起', description: '高級植物性自助餐，適合重要場合和特殊活動', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2067' },
      { name: '客製化植物性餐盒', price: '每人每餐350元起', description: '根據個人需求定制的植物性餐盒，考慮過敏和特殊飲食需求', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080' }
    ],
    contact: '02-2345-6789',
    website: 'https://www.greenfeast.com.tw',
    clients: ['華納兄弟', 'Netflix', '公共電視台']
  },
  {
    id: 'pb2',
    name: '植物力量餐飲',
    description: '結合美食和環保的植物性餐飲服務，專注於當地食材和零廢棄理念',
    services: [
      { name: '當季植物性菜單', price: '每人每餐300元起', description: '使用當季當地食材的植物性菜單，減少食物里程', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=1978' },
      { name: '零廢棄植物性餐飲', price: '每人每餐380元起', description: '採用零廢棄理念的植物性餐飲，所有包裝可堆肥', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=2069' },
      { name: '植物性餐飲工作坊', price: '每場15000元起', description: '為劇組提供植物性飲食教育和烹飪工作坊', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=2080' }
    ],
    contact: '02-8765-4321',
    website: 'https://www.plantpowercatering.com.tw',
    clients: ['迪士尼', '中央電影公司', '獨立電影製作聯盟']
  }
];

export default function CarbonTipsScreen() {
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { width } = useDimensions();
  const cardWidth = width - 40;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // 碳抵消計算器狀態
  const [showOffsetCalculator, setShowOffsetCalculator] = useState(false);
  const [emissionAmount, setEmissionAmount] = useState('');
  const [calculatedOffset, setCalculatedOffset] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<any>(null);

  // 低碳攝影棚狀態
  const [showStudioDetails, setShowStudioDetails] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState<any>(null);

  // 電動車租賃狀態
  const [showEVRentalDetails, setShowEVRentalDetails] = useState(false);
  const [selectedEVService, setSelectedEVService] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  // 節能設備狀態
  const [showEnergyEfficientEquipment, setShowEnergyEfficientEquipment] = useState(false);
  
  // 減少食物浪費狀態
  const [showFoodWasteReduction, setShowFoodWasteReduction] = useState(false);
  
  // 綠色住宿狀態
  const [showGreenAccommodations, setShowGreenAccommodations] = useState(false);
  
  // 廢棄物管理狀態
  const [showWasteManagement, setShowWasteManagement] = useState(false);
  
  // 可再生能源狀態
  const [showRenewableEnergy, setShowRenewableEnergy] = useState(false);
  
  // 植物性餐飲狀態
  const [showPlantBasedCatering, setShowPlantBasedCatering] = useState(false);

  // 模擬獲取用戶位置
  useEffect(() => {
    // 在實際應用中，這裡應該使用地理位置API
    // 這裡只是模擬
    setTimeout(() => {
      setUserLocation('台北市信義區');
    }, 1000);
  }, []);

  // 添加缺失的函數定義
  const showEVRentalOptions = () => {
    setShowEVRentalDetails(true);
  };

  const showGreenStudios = () => {
    setSelectedStudio(GREEN_STUDIOS[0]);
    setShowStudioDetails(true);
  };

  // 計算碳抵消
  const calculateOffset = () => {
    const amount = parseFloat(emissionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('錯誤', '請輸入有效的碳排放量');
      return;
    }
    setCalculatedOffset(amount);
  };

  // 選擇抵消提供商
  const selectProvider = (providerId: string) => {
    const provider = CARBON_OFFSET_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(providerId);
      setCurrentProvider(provider);
      setShowProviderDetails(true);
    }
  };

  // 處理購買抵消
  const handlePurchaseOffset = () => {
    if (!currentProvider || !calculatedOffset) return;
    
    const totalCost = calculatedOffset * currentProvider.price;
    Alert.alert(
      '確認購買',
      `您將花費 NT$${totalCost.toLocaleString()} 購買 ${calculatedOffset} 噸 CO₂e 的碳抵消。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確認購買', 
          onPress: () => {
            Alert.alert('成功', '碳抵消購買成功！感謝您對環保的貢獻。');
            setShowOffsetCalculator(false);
            setEmissionAmount('');
            setCalculatedOffset(null);
            setSelectedProvider(null);
            setShowProviderDetails(false);
            setCurrentProvider(null);
          }
        }
      ]
    );
  };

  // 打開網站
  const openWebsite = (url: string) => {
    Linking.openURL(url);
  };

  // 聯繫服務商
  const contactProvider = (phone: string) => {
    const phoneUrl = Platform.OS === 'ios' ? `tel:${phone}` : `tel:${phone}`;
    Linking.openURL(phoneUrl);
  };

  const categories = [
    { id: 'all', name: '全部', icon: <Lightbulb size={20} color={theme.primary} /> },
    { id: 'transport', name: '交通', icon: <Car size={20} color="#FF6B6B" /> },
    { id: 'equipment', name: '設備', icon: <Laptop size={20} color="#4ECDC4" /> },
    { id: 'food', name: '餐飲', icon: <Utensils size={20} color="#FFD166" /> },
    { id: 'accommodation', name: '住宿', icon: <Hotel size={20} color="#6C63FF" /> },
    { id: 'waste', name: '廢棄物', icon: <Trash size={20} color="#F8A48F" /> },
  ];

  const tips = [
    {
      id: '1',
      category: 'transport',
      title: '使用低碳交通工具',
      description: '盡可能使用電動車、共乘或公共交通工具，減少拍攝過程中的碳排放。電動車比傳統燃油車可減少高達70%的碳排放。',
      icon: <Car size={24} color="#FF6B6B" />,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071',
      color: '#FF6B6B',
      gradient: ['#FF6B6B20', '#FF6B6B05'] as const,
      saving: '可減少30-70%的交通碳排放',
      action: () => showEVRentalOptions()
    },
    {
      id: '2',
      category: 'equipment',
      title: '採用節能設備',
      description: '選擇能源效率高的攝影設備和LED燈光，減少用電量。LED燈比傳統燈光可節省高達80%的能源消耗。',
      icon: <Zap size={24} color="#4ECDC4" />,
      image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070',
      color: '#4ECDC4',
      gradient: ['#4ECDC420', '#4ECDC405'] as const,
      saving: '可減少50-80%的照明能源消耗',
      action: () => setShowEnergyEfficientEquipment(true)
    },
    {
      id: '3',
      category: 'food',
      title: '減少食物浪費',
      description: '精確計算片場餐飲需求，選擇當地食材，減少食物浪費。食物浪費佔全球碳排放的8%，減少浪費是簡單有效的減碳方式。',
      icon: <Utensils size={24} color="#FFD166" />,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074',
      color: '#FFD166',
      gradient: ['#FFD16620', '#FFD16605'] as const,
      saving: '可減少8-10%的餐飲相關碳排放',
      action: () => setShowFoodWasteReduction(true)
    },
    {
      id: '4',
      category: 'accommodation',
      title: '選擇綠色住宿',
      description: '優先考慮具有環保認證的酒店或住宿設施，這些場所通常採用節能措施和可再生能源。',
      icon: <Hotel size={24} color="#6C63FF" />,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070',
      color: '#6C63FF',
      gradient: ['#6C63FF20', '#6C63FF05'] as const,
      saving: '可減少15-25%的住宿相關碳排放',
      action: () => setShowGreenAccommodations(true)
    },
    {
      id: '5',
      category: 'waste',
      title: '實施廢棄物分類回收',
      description: '在片場設置明確的回收站，對塑料、紙張、金屬等進行分類回收。適當的廢棄物管理可大幅減少碳排放。',
      icon: <Trash size={24} color="#F8A48F" />,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070',
      color: '#F8A48F',
      gradient: ['#F8A48F20', '#F8A48F05'] as const,
      saving: '可減少20-30%的廢棄物相關碳排放',
      action: () => setShowWasteManagement(true)
    },
    {
      id: '6',
      category: 'equipment',
      title: '使用可再生能源',
      description: '考慮使用太陽能發電板或其他可再生能源為設備供電，特別是在戶外拍攝時。',
      icon: <Wind size={24} color="#88D498" />,
      image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=2072',
      color: '#88D498',
      gradient: ['#88D49820', '#88D49805'] as const,
      saving: '可減少60-100%的發電相關碳排放',
      action: () => setShowRenewableEnergy(true)
    },
    {
      id: '7',
      category: 'equipment',
      title: '使用低碳攝影棚',
      description: '選擇使用綠電、節能設計和可持續材料建造的攝影棚，大幅減少室內拍攝的碳足跡。',
      icon: <Building size={24} color="#6C63FF" />,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070',
      color: '#6C63FF',
      gradient: ['#6C63FF20', '#6C63FF05'] as const,
      saving: '可減少60-75%的攝影棚相關碳排放',
      action: () => showGreenStudios()
    },
    {
      id: '8',
      category: 'food',
      title: '提供植物性餐點選擇',
      description: '增加植物性餐點選擇，減少肉類消耗。植物性飲食的碳足跡比肉類飲食低50-80%。',
      icon: <Salad size={24} color="#FFD166" />,
      image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=2074',
      color: '#FFD166',
      gradient: ['#FFD16620', '#FFD16605'] as const,
      saving: '可減少50-80%的餐飲相關碳排放',
      action: () => setShowPlantBasedCatering(true)
    }
  ];

  // 過濾建議
  const filteredTips = selectedCategory && selectedCategory !== 'all' 
    ? tips.filter(tip => tip.category === selectedCategory)
    : tips;

  // 圖片渲染函數
  const renderTipImage = (image: string, gradient: readonly [string, string]) => {
    return (
      <View style={styles.tipImageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.tipImage}
          onError={() => {
            // 使用漸變色作為後備
          }}
        />
        <LinearGradient
          colors={gradient}
          style={styles.tipImageOverlay}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <PageTitle 
        title={t('carbon_tips.title')} 
        subtitle={t('carbon_tips.subtitle')} 
        centered
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 統計概覽卡片 */}
        <View style={[styles.overviewCard, { backgroundColor: theme.card }]}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewIconContainer}>
              <Leaf size={24} color="#22C55E" />
            </View>
            <Text style={[styles.overviewTitle, { color: theme.text }]}>減碳策略概覽</Text>
          </View>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStatItem}>
              <Text style={[styles.overviewStatValue, { color: theme.primary }]}>8</Text>
              <Text style={[styles.overviewStatLabel, { color: theme.secondaryText }]}>策略數量</Text>
            </View>
            <View style={styles.overviewStatItem}>
              <Text style={[styles.overviewStatValue, { color: '#FF6B47' }]}>45-65%</Text>
              <Text style={[styles.overviewStatLabel, { color: theme.secondaryText }]}>平均減碳效果</Text>
            </View>
            <View style={styles.overviewStatItem}>
              <Text style={[styles.overviewStatValue, { color: '#10B981' }]}>高</Text>
              <Text style={[styles.overviewStatLabel, { color: theme.secondaryText }]}>實施可行性</Text>
            </View>
            <View style={styles.overviewStatItem}>
              <Text style={[styles.overviewStatValue, { color: '#3B82F6' }]}>中</Text>
              <Text style={[styles.overviewStatLabel, { color: theme.secondaryText }]}>預期成本</Text>
            </View>
          </View>
        </View>

        {/* 類別選擇器 */}
        <View style={styles.categorySelector}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { 
                    backgroundColor: selectedCategory === category.id ? theme.primary : theme.card,
                    shadowColor: selectedCategory === category.id ? theme.primary : '#000',
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[
                  styles.categoryIconContainer,
                  { backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : theme.primary + '15' }
                ]}>
                  {category.icon}
                </View>
                <Text style={[
                  styles.categoryName,
                  { color: selectedCategory === category.id ? 'white' : theme.text }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 碳抵消計算器卡片 */}
        <View style={[styles.offsetCard, { backgroundColor: theme.card }]}>
          <View style={styles.offsetHeader}>
            <View style={styles.offsetIconContainer}>
              <Calculator size={20} color="#22C55E" />
            </View>
            <View style={styles.offsetHeaderText}>
              <Text style={[styles.offsetTitle, { color: theme.text }]}>碳抵消計算器</Text>
              <Text style={[styles.offsetSubtitle, { color: theme.secondaryText }]}>植樹造林 · 可再生能源</Text>
            </View>
          </View>
          
          <View style={styles.offsetImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071' }}
              style={styles.offsetImage}
            />
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.7)', 'rgba(34, 197, 94, 0.2)']}
              style={styles.offsetImageOverlay}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.offsetButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowOffsetCalculator(true)}
          >
            <Calculator size={16} color="white" />
            <Text style={styles.offsetButtonText}>計算碳抵消</Text>
          </TouchableOpacity>
        </View>

        {/* 減碳建議列表 */}
        <View style={styles.tipsContainer}>
          {filteredTips.map((tip, index) => (
            <TouchableOpacity
              key={tip.id}
              style={[styles.tipCard, { backgroundColor: theme.card }]}
              onPress={tip.action}
            >
              <View style={styles.tipHeader}>
                <View style={styles.tipLeft}>
                  <View style={[styles.tipIconContainer, { backgroundColor: tip.color + '20' }]}>
                    {tip.icon}
                  </View>
                  <View style={styles.tipInfo}>
                    <View style={styles.tipTitleRow}>
                      <Text style={[styles.tipNumber, { color: theme.secondaryText }]}>#{index + 1}</Text>
                      <Text style={[styles.tipTitle, { color: theme.text }]}>{tip.title}</Text>
                    </View>
                    <View style={[styles.tipSavingBadge, { backgroundColor: tip.color + '15' }]}>
                      <Text style={[styles.tipSavingText, { color: tip.color }]}>{tip.saving}</Text>
                    </View>
                  </View>
                </View>
                {renderTipImage(tip.image, tip.gradient)}
              </View>
              
              <Text style={[styles.tipDescription, { color: theme.secondaryText }]}>
                {tip.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 碳抵消計算器模態 */}
      <Modal
        visible={showOffsetCalculator}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOffsetCalculator(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>碳抵消計算器</Text>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: theme.background }]}
                onPress={() => setShowOffsetCalculator(false)}
              >
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={[styles.modalScrollView, { backgroundColor: theme.background }]}
              contentContainerStyle={styles.modalScrollViewContent}
            >
              <View style={styles.calculatorContent}>
                <Text style={[styles.calculatorLabel, { color: theme.text }]}>
                  請輸入您想要抵消的碳排放量（公噸 CO₂e）：
                </Text>
                
                <TextInput
                  style={[styles.calculatorInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={emissionAmount}
                  onChangeText={setEmissionAmount}
                  placeholder="例如：10.5"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                />
                
                <View style={styles.calculatorButtons}>
                  <TouchableOpacity
                    style={[styles.calculateButton, { backgroundColor: theme.primary }]}
                    onPress={calculateOffset}
                  >
                    <Text style={styles.calculateButtonText}>計算抵消費用</Text>
                  </TouchableOpacity>
                </View>
                
                {calculatedOffset && (
                  <View style={[styles.offsetResults, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.offsetResultTitle, { color: theme.text }]}>
                      抵消 {calculatedOffset} 公噸 CO₂e 的費用選項：
                    </Text>
                    
                    {CARBON_OFFSET_PROVIDERS.map((provider) => (
                      <TouchableOpacity
                        key={provider.id}
                        style={[
                          styles.providerOption,
                          { 
                            backgroundColor: selectedProvider === provider.id ? theme.primary + '20' : theme.card,
                            borderColor: selectedProvider === provider.id ? theme.primary : theme.border
                          }
                        ]}
                        onPress={() => selectProvider(provider.id)}
                      >
                        <Text style={[styles.providerName, { color: theme.text }]}>{provider.name}</Text>
                        <Text style={[styles.providerPrice, { color: theme.primary }]}>
                          NT${(calculatedOffset * provider.price).toLocaleString()}
                        </Text>
                        <Text style={[styles.providerDescription, { color: theme.secondaryText }]}>
                          {provider.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
            
            {selectedProvider && calculatedOffset && (
              <View style={[styles.modalButtons, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary, flex: 1 }]}
                  onPress={handlePurchaseOffset}
                >
                  <Text style={[styles.modalButtonText, { color: 'white' }]}>前往購買</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 電動車租賃服務模態 */}
      <Modal
        visible={showEVRentalDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEVRentalDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>電動車租賃服務</Text>
              <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.background }]} onPress={() => setShowEVRentalDetails(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalScrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.modalScrollViewContent}>
              {EV_RENTAL_SERVICES.map((service) => (
                <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceDescription, { color: theme.secondaryText }]}>
                    {service.description}
                  </Text>
                  
                  <View style={styles.vehicleList}>
                    {service.vehicles.map((vehicle, index) => (
                      <View key={index} style={[styles.vehicleItem, { backgroundColor: theme.card }]}>
                        <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
                        <View style={styles.vehicleInfo}>
                          <Text style={[styles.vehicleType, { color: theme.text }]}>{vehicle.type}</Text>
                          <Text style={[styles.vehiclePrice, { color: theme.primary }]}>
                            每日 NT${vehicle.price.toLocaleString()}
                          </Text>
                          <Text style={[styles.vehicleRange, { color: theme.secondaryText }]}>
                            續航里程：{vehicle.range}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.serviceContact}>
                    <TouchableOpacity
                      style={[styles.contactButton, { backgroundColor: theme.primary }]}
                      onPress={() => contactProvider(service.contact)}
                    >
                      <Phone size={16} color="white" />
                      <Text style={styles.contactButtonText}>聯繫租賃</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.websiteButton, { backgroundColor: theme.background }]}
                      onPress={() => openWebsite(service.website)}
                    >
                      <Text style={[styles.websiteButtonText, { color: theme.primary }]}>官方網站</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 節能設備模態 */}
      <Modal
        visible={showEnergyEfficientEquipment}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEnergyEfficientEquipment(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>節能設備供應商</Text>
              <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.background }]} onPress={() => setShowEnergyEfficientEquipment(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalScrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.modalScrollViewContent}>
              {ENERGY_EFFICIENT_EQUIPMENT.map((supplier) => (
                <View key={supplier.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{supplier.name}</Text>
                  <Text style={[styles.serviceDescription, { color: theme.secondaryText }]}>
                    {supplier.description}
                  </Text>
                  
                  <View style={styles.productList}>
                    {supplier.products.map((product, index) => (
                      <View key={index} style={[styles.productItem, { backgroundColor: theme.card }]}>
                        <Image source={{ uri: product.image }} style={styles.productImage} />
                        <View style={styles.productInfo}>
                          <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
                          <Text style={[styles.productPrice, { color: theme.primary }]}>
                            NT${product.price.toLocaleString()}
                          </Text>
                          <Text style={[styles.productDescription, { color: theme.secondaryText }]}>
                            {product.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.serviceContact}>
                    <TouchableOpacity
                      style={[styles.contactButton, { backgroundColor: theme.primary }]}
                      onPress={() => contactProvider(supplier.contact)}
                    >
                      <Phone size={16} color="white" />
                      <Text style={styles.contactButtonText}>聯繫供應商</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.websiteButton, { backgroundColor: theme.background }]}
                      onPress={() => openWebsite(supplier.website)}
                    >
                      <Text style={[styles.websiteButtonText, { color: theme.primary }]}>官方網站</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 減少食物浪費模態 */}
      <Modal
        visible={showFoodWasteReduction}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFoodWasteReduction(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>減少食物浪費服務</Text>
              <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.background }]} onPress={() => setShowFoodWasteReduction(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalScrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.modalScrollViewContent}>
              {FOOD_WASTE_REDUCTION.map((service) => (
                <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceDescription, { color: theme.secondaryText }]}>
                    {service.description}
                  </Text>
                  
                  <View style={styles.serviceList}>
                    {service.services.map((item, index) => (
                      <View key={index} style={[styles.serviceItem, { backgroundColor: theme.card }]}>
                        <Image source={{ uri: item.image }} style={styles.serviceImage} />
                        <View style={styles.serviceInfo}>
                          <Text style={[styles.serviceItemName, { color: theme.text }]}>{item.name}</Text>
                          <Text style={[styles.servicePrice, { color: theme.primary }]}>
                            {item.price}
                          </Text>
                          <Text style={[styles.serviceItemDescription, { color: theme.secondaryText }]}>
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.serviceContact}>
                    <TouchableOpacity
                      style={[styles.contactButton, { backgroundColor: theme.primary }]}
                      onPress={() => contactProvider(service.contact)}
                    >
                      <Phone size={16} color="white" />
                      <Text style={styles.contactButtonText}>聯繫服務商</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.websiteButton, { backgroundColor: theme.background }]}
                      onPress={() => openWebsite(service.website)}
                    >
                      <Text style={[styles.websiteButtonText, { color: theme.primary }]}>官方網站</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 綠色住宿模態 */}
      <Modal
        visible={showGreenAccommodations}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGreenAccommodations(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>綠色住宿選項</Text>
              <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.background }]} onPress={() => setShowGreenAccommodations(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalScrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.modalScrollViewContent}>
              {GREEN_ACCOMMODATIONS.map((accommodation) => (
                <View key={accommodation.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <Image source={{ uri: accommodation.image }} style={styles.accommodationImage} />
                  <Text style={[styles.serviceName, { color: theme.text }]}>{accommodation.name}</Text>
                  <Text style={[styles.serviceLocation, { color: theme.primary }]}>
                    📍 {accommodation.location}
                  </Text>
                  <Text style={[styles.serviceDescription, { color: theme.secondaryText }]}>
                    {accommodation.description}
                  </Text>
                  
                  <View style={styles.featuresList}>
                    {accommodation.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Check size={16} color={theme.success} />
                        <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.accommodationStats}>
                    <Text style={[styles.carbonReduction, { color: theme.success }]}>
                      🌱 {accommodation.carbonReduction}
                    </Text>
                    <Text style={[styles.accommodationPrice, { color: theme.primary }]}>
                      {accommodation.price}
                    </Text>
                  </View>
                  
                  <View style={styles.serviceContact}>
                    <TouchableOpacity
                      style={[styles.contactButton, { backgroundColor: theme.primary }]}
                      onPress={() => contactProvider(accommodation.contact)}
                    >
                      <Phone size={16} color="white" />
                      <Text style={styles.contactButtonText}>預訂住宿</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.websiteButton, { backgroundColor: theme.background }]}
                      onPress={() => openWebsite(accommodation.website)}
                    >
                      <Text style={[styles.websiteButtonText, { color: theme.primary }]}>官方網站</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 廢棄物管理模態 */}
      <Modal
        visible={showWasteManagement}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWasteManagement(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>廢棄物管理服務</Text>
              <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.background }]} onPress={() => setShowWasteManagement(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalScrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.modalScrollViewContent}>
              {WASTE_MANAGEMENT_SERVICES.map((service) => (
                <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceDescription, { color: theme.secondaryText }]}>
                    {service.description}
                  </Text>
                  
                  <View style={styles.serviceList}>
                    {service.services.map((item, index) => (
                      <View key={index} style={[styles.serviceItem, { backgroundColor: theme.card }]}>
                        <Image source={{ uri: item.image }} style={styles.serviceImage} />
                        <View style={styles.serviceInfo}>
                          <Text style={[styles.serviceItemName, { color: theme.text }]}>{item.name}</Text>
                          <Text style={[styles.servicePrice, { color: theme.primary }]}>
                            {item.price}
                          </Text>
                          <Text style={[styles.serviceItemDescription, { color: theme.secondaryText }]}>
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.serviceContact}>
                    <TouchableOpacity
                      style={[styles.contactButton, { backgroundColor: theme.primary }]}
                      onPress={() => contactProvider(service.contact)}
                    >
                      <Phone size={16} color="white" />
                      <Text style={styles.contactButtonText}>聯繫服務商</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.websiteButton, { backgroundColor: theme.background }]}
                      onPress={() => openWebsite(service.website)}
                    >
                      <Text style={[styles.websiteButtonText, { color: theme.primary }]}>官方網站</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 可再生能源模態 */}
      <Modal
        visible={showRenewableEnergy}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRenewableEnergy(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>可再生能源提供商</Text>
              <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.background }]} onPress={() => setShowRenewableEnergy(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalScrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.modalScrollViewContent}>
              {RENEWABLE_ENERGY_PROVIDERS.map((provider) => (
                <View key={provider.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{provider.name}</Text>
                  <Text style={[styles.serviceDescription, { color: theme.secondaryText }]}>
                    {provider.description}
                  </Text>
                  
                  <View style={styles.productList}>
                    {provider.products?.map((product, index) => (
                      <View key={index} style={[styles.productItem, { backgroundColor: theme.card }]}>
                        <Image source={{ uri: product.image }} style={styles.productImage} />
                        <View style={styles.productInfo}>
                          <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
                          <Text style={[styles.productPrice, { color: theme.primary }]}>
                            NT${product.price.toLocaleString()}
                          </Text>
                          <Text style={[styles.productDescription, { color: theme.secondaryText }]}>
                            {product.description}
                          </Text>
                        </View>
                      </View>
                    )) || provider.services?.map((service, index) => (
                      <View key={index} style={[styles.serviceItem, { backgroundColor: theme.card }]}>
                        <Image source={{ uri: service.image }} style={styles.serviceImage} />
                        <View style={styles.serviceInfo}>
                          <Text style={[styles.serviceItemName, { color: theme.text }]}>{service.name}</Text>
                          <Text style={[styles.servicePrice, { color: theme.primary }]}>
                            {service.price}
                          </Text>
                          <Text style={[styles.serviceItemDescription, { color: theme.secondaryText }]}>
                            {service.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.serviceContact}>
                    <TouchableOpacity
                      style={[styles.contactButton, { backgroundColor: theme.primary }]}
                      onPress={() => contactProvider(provider.contact)}
                    >
                      <Phone size={16} color="white" />
                      <Text style={styles.contactButtonText}>聯繫供應商</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.websiteButton, { backgroundColor: theme.background }]}
                      onPress={() => openWebsite(provider.website)}
                    >
                      <Text style={[styles.websiteButtonText, { color: theme.primary }]}>官方網站</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 植物性餐飲模態 */}
      <Modal
        visible={showPlantBasedCatering}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlantBasedCatering(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>植物性餐飲服務</Text>
              <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.background }]} onPress={() => setShowPlantBasedCatering(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalScrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.modalScrollViewContent}>
              {PLANT_BASED_CATERING.map((service) => (
                <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceDescription, { color: theme.secondaryText }]}>
                    {service.description}
                  </Text>
                  
                  <View style={styles.serviceList}>
                    {service.services.map((item, index) => (
                      <View key={index} style={[styles.serviceItem, { backgroundColor: theme.card }]}>
                        <Image source={{ uri: item.image }} style={styles.serviceImage} />
                        <View style={styles.serviceInfo}>
                          <Text style={[styles.serviceItemName, { color: theme.text }]}>{item.name}</Text>
                          <Text style={[styles.servicePrice, { color: theme.primary }]}>
                            {item.price}
                          </Text>
                          <Text style={[styles.serviceItemDescription, { color: theme.secondaryText }]}>
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.serviceContact}>
                    <TouchableOpacity
                      style={[styles.contactButton, { backgroundColor: theme.primary }]}
                      onPress={() => contactProvider(service.contact)}
                    >
                      <Phone size={16} color="white" />
                      <Text style={styles.contactButtonText}>聯繫餐飲商</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.websiteButton, { backgroundColor: theme.background }]}
                      onPress={() => openWebsite(service.website)}
                    >
                      <Text style={[styles.websiteButtonText, { color: theme.primary }]}>官方網站</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 低碳攝影棚模態 */}
      <Modal
        visible={showStudioDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStudioDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalGrabber, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>低碳攝影棚</Text>
              <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.background }]} onPress={() => setShowStudioDetails(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalScrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.modalScrollViewContent}>
              {GREEN_STUDIOS.map((studio) => (
                <View key={studio.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <Image source={{ uri: studio.image }} style={styles.accommodationImage} />
                  <Text style={[styles.serviceName, { color: theme.text }]}>{studio.name}</Text>
                  <Text style={[styles.serviceLocation, { color: theme.primary }]}>
                    📍 {studio.location}
                  </Text>
                  <Text style={[styles.serviceDescription, { color: theme.secondaryText }]}>
                    {studio.description}
                  </Text>
                  
                  <View style={styles.featuresList}>
                    {studio.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Check size={16} color={theme.success} />
                        <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={[styles.carbonReduction, { color: theme.success }]}>
                    🌱 {studio.carbonReduction}
                  </Text>
                  
                  <View style={styles.serviceContact}>
                    <TouchableOpacity
                      style={[styles.contactButton, { backgroundColor: theme.primary }]}
                      onPress={() => contactProvider(studio.contact)}
                    >
                      <Phone size={16} color="white" />
                      <Text style={styles.contactButtonText}>預約攝影棚</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.websiteButton, { backgroundColor: theme.background }]}
                      onPress={() => openWebsite(studio.website)}
                    >
                      <Text style={[styles.websiteButtonText, { color: theme.primary }]}>官方網站</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tipImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tipImage: {
    width: '100%',
    height: '100%',
  },
  tipImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // 統計概覽卡片
  overviewCard: {
    margin: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22C55E15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  // 類別選擇器
  categorySelector: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryCard: {
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // 碳抵消卡片
  offsetCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  offsetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offsetIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  offsetHeaderText: {
    flex: 1,
  },
  offsetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  offsetSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  offsetImageContainer: {
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  offsetImage: {
    width: '100%',
    height: '100%',
  },
  offsetImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offsetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  offsetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // 建議卡片
  tipsContainer: {
    paddingHorizontal: 20,
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipNumber: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  tipSavingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  tipSavingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  // 模態樣式
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 0,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  modalGrabber: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: {},
  modalScrollViewContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  
  // 服務卡片樣式
  serviceCard: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 0,
    marginBottom: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  serviceLocation: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  serviceDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#6B7280',
    fontWeight: '400',
  },
  
  // 功能列表樣式
  featuresList: {
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    color: '#374151',
  },
  
  // 圖片樣式
  accommodationImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // 統計資訊樣式
  accommodationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  carbonReduction: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  accommodationPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },
  
  // 聯繫按鈕樣式
  serviceContact: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  websiteButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  
  // 車輛/產品列表樣式
  vehicleList: {
    marginBottom: 24,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleImage: {
    width: 90,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1F2937',
  },
  vehiclePrice: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    color: '#3B82F6',
  },
  vehicleRange: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // 產品列表樣式
  productList: {
    marginBottom: 24,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 90,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1F2937',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    color: '#3B82F6',
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    fontWeight: '400',
  },
  
  // 服務列表樣式
  serviceList: {
    marginBottom: 24,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceImage: {
    width: 90,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceItemName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1F2937',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    color: '#3B82F6',
  },
  serviceItemDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    fontWeight: '400',
  },
  
  // 計算器樣式
  calculatorContent: {
    paddingHorizontal: 0,
    paddingBottom: 24,
  },
  calculatorLabel: {
    fontSize: 17,
    marginBottom: 20,
    lineHeight: 26,
    color: '#374151',
    fontWeight: '600',
  },
  calculatorInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    fontWeight: '500',
  },
  calculatorButtons: {
    marginBottom: 24,
  },
  calculateButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  
  // 抵消結果樣式
  offsetResults: {
    borderRadius: 16,
    padding: 24,
    marginTop: 0,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  offsetResultTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  providerOption: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  providerName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
  },
  providerPrice: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
    color: '#059669',
    letterSpacing: -0.5,
  },
  providerDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '400',
  },
  
  // 模態按鈕樣式
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    gap: 16,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  // 卡片樣式
  card: {
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardGradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.9,
  },
  cardBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  benefitTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cardIcon: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});