import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
  Pressable,
  Dimensions,
  Keyboard
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  X, MapPin, Info, Check, ChevronDown, ChevronUp, 
  AlertCircle, Search, Camera, Zap, Clock, Car, Utensils, 
  Hotel, Trash, Fuel, Lightbulb, Laptop, FileText, HardDrive, Printer,
  Users, Weight, Plus, Minus, Camera as CameraIcon, Video, Mic,
  Palette, Shirt, Package, Truck
} from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { EMISSION_CATEGORIES, EMISSION_SOURCES } from '@/mocks/projects';
import { getTranslatedProjectCategories, getTranslatedProjectSources } from '@/utils/translations';
import { 
  // 移除舊版設備數據的導入
  /*
  CAMERA_EQUIPMENT, 
  TRANSPORT_EQUIPMENT, 
  LIGHTING_EQUIPMENT,
  FOOD_OPTIONS,
  ACCOMMODATION_OPTIONS,
  WASTE_OPTIONS,
  FUEL_OPTIONS,
  OFFICE_EQUIPMENT,
  COMPUTER_EQUIPMENT,
  PRINTING_EQUIPMENT,
  EDITING_EQUIPMENT,
  STORAGE_EQUIPMENT
  */
} from '@/mocks/equipment';
import { 
  // 只使用增強版設備數據
  ENHANCED_CAMERA_EQUIPMENT,
  ENHANCED_LIGHTING_EQUIPMENT,
  ENHANCED_TRANSPORT_EQUIPMENT,
  ENHANCED_OFFICE_EQUIPMENT,
  ENHANCED_EDITING_EQUIPMENT,
  ENHANCED_STORAGE_EQUIPMENT,
  ENHANCED_FOOD_EQUIPMENT,
  ENHANCED_ACCOMMODATION_EQUIPMENT,
  ENHANCED_WASTE_EQUIPMENT,
  ENHANCED_FUEL_EQUIPMENT
} from '@/mocks/enhancedEquipment';
import { 
  ProductionStage, EmissionSource
} from '@/types/project';
import { 
  // 更新設備類型的導入
  EquipmentType,
  SelectedEquipmentItem,
  TransportCalculationParams,
  EnhancedTransportEquipment
} from '@/types/equipment';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { LinearGradient } from 'expo-linear-gradient';
import DatePickerField from '@/components/DatePickerField';
import { 
  calculateTotalEquipmentWeight, 
  calculateTransportEmissions as calcTransportEmissions, 
  formatEquipmentList,
  calculateMultipleEquipmentEmissions
} from '@/utils/helpers';
import ARScanner from '@/components/ARScanner';
import { useLanguageStore } from '@/store/languageStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AddRecordScreen() {
  const router = useRouter();
  const { projectId, stage: initialStage, crew } = useLocalSearchParams<{ 
    projectId: string, 
    stage?: ProductionStage,
    crew?: string 
  }>();
  const { addEmissionRecord, projects } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 組別信息與圖標
  const getCrewIcon = (crewType: string, size: number = 20, color: string = '#6B7280') => {
    switch (crewType) {
      case 'director':
        return <Video size={size} color={color} />;
      case 'camera':
        return <Camera size={size} color={color} />;
      case 'lighting':
        return <Zap size={size} color={color} />;
      case 'sound':
        return <Mic size={size} color={color} />;
      case 'makeup':
        return <Palette size={size} color={color} />;
      case 'costume':
        return <Shirt size={size} color={color} />;
      case 'props':
        return <Package size={size} color={color} />;
      case 'transport':
        return <Truck size={size} color={color} />;
      default:
        return <Users size={size} color={color} />;
    }
  };

  const CREW_DEPARTMENTS: Record<string, { name: string; color: string; bgColor: string }> = {
    director: { name: '導演組', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    camera: { name: '攝影組', color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.1)' },
    lighting: { name: '燈光組', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
    sound: { name: '收音組', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    makeup: { name: '化妝組', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
    costume: { name: '服裝組', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    props: { name: '道具組', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
    transport: { name: '交通組', color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.1)' }
  };
  
  const [stage, setStage] = useState<ProductionStage>('production'); // 固定為拍攝階段
  const [selectedCrew, setSelectedCrew] = useState(crew || 'director');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // 設備選擇相關狀態
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [equipmentHours, setEquipmentHours] = useState('');
  const [equipmentDistance, setEquipmentDistance] = useState('');
  const [equipmentQuantity, setEquipmentQuantity] = useState('');
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [equipmentType, setEquipmentType] = useState<string | null>(null);
  const [currentEquipmentCategory, setCurrentEquipmentCategory] = useState<string>('');
  
  // 多設備選擇相關狀態
  const [multipleEquipmentMode, setMultipleEquipmentMode] = useState(false);
  const [selectedEquipmentItems, setSelectedEquipmentItems] = useState<SelectedEquipmentItem[]>([]);
  const [showMultipleEquipmentSelector, setShowMultipleEquipmentSelector] = useState(false);
  
  // 交通相關狀態
  const [peopleCount, setPeopleCount] = useState('1');
  const [showTransportCalculator, setShowTransportCalculator] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<EnhancedTransportEquipment | null>(null);
  const [transportDistance, setTransportDistance] = useState('');
  
  // 展開/收起區段的狀態
  const [expandedSections, setExpandedSections] = useState({
    crew: true,
    category: true,
    source: true,
    details: true,
    optional: true,
    equipment: true,
    transport: true
  });
  
  const [stageError, setStageError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [sourceError, setSourceError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [dateError, setDateError] = useState('');
  const [equipmentError, setEquipmentError] = useState('');
  const [transportError, setTransportError] = useState('');
  
  // 獲取翻譯後的類別和排放源
  const translatedCategories = getTranslatedProjectCategories(t);
  const translatedSources = getTranslatedProjectSources(t);

  // 簡化組別類別映射 - 每個組別只顯示最相關的類別
  const getCrewCategories = () => {
    const crewCategoryMapping = {
      director: ['transport-prod', 'catering-prod'], // 交通、餐飲
      camera: ['equipment-pre', 'energy-prod'], // 攝影設備、照明設備
      lighting: ['energy-prod', 'equipment-pre'], // 照明設備、燃料
      sound: ['equipment-pre', 'energy-prod'], // 攝影設備、燃料
      makeup: ['catering-prod', 'waste-prod'], // 餐飲、廢棄物
      costume: ['catering-prod', 'waste-prod'], // 餐飲、廢棄物
      props: ['transport-prod', 'waste-prod'], // 交通、廢棄物
      transport: ['transport-prod', 'energy-prod'], // 交通、燃料
    };
    
    // 根據選擇的組別，只顯示相關的類別
    const relevantCategoryIds = crewCategoryMapping[selectedCrew as keyof typeof crewCategoryMapping] || [];
    
    return translatedCategories.filter(cat => 
      relevantCategoryIds.includes(cat.id) &&
      translatedSources.some(source => source.stage === 'production' && source.categoryId === cat.id)
    );
  };
  
  const stageCategories = getCrewCategories();

  // 快速輸入預設選項
  const getQuickInputOptions = () => {
    const quickOptions = {
      director: [
        { label: '交通往返', categoryId: 'prod-1', sourceId: 'prod-1-car', quantity: '50', unit: '公里' },
        { label: '現場餐飲', categoryId: 'prod-3', sourceId: 'prod-3-lunch', quantity: '10', unit: '份' }
      ],
      camera: [
        { label: '攝影機使用', categoryId: 'prod-2', sourceId: 'prod-2-camera', quantity: '8', unit: '小時' },
        { label: '照明設備', categoryId: 'prod-7', sourceId: 'prod-7-led', quantity: '6', unit: '小時' }
      ],
      lighting: [
        { label: 'LED燈具', categoryId: 'prod-7', sourceId: 'prod-7-led', quantity: '8', unit: '小時' },
        { label: '發電機燃料', categoryId: 'prod-6', sourceId: 'prod-6-petrol', quantity: '20', unit: '公升' }
      ],
      sound: [
        { label: '收音設備', categoryId: 'prod-2', sourceId: 'prod-2-audio', quantity: '8', unit: '小時' },
        { label: '供電燃料', categoryId: 'prod-6', sourceId: 'prod-6-petrol', quantity: '10', unit: '公升' }
      ],
      makeup: [
        { label: '梳化用餐', categoryId: 'prod-3', sourceId: 'prod-3-snack', quantity: '5', unit: '份' },
        { label: '化妝廢料', categoryId: 'prod-5', sourceId: 'prod-5-cosmetic', quantity: '2', unit: '公斤' }
      ],
      costume: [
        { label: '服裝用餐', categoryId: 'prod-3', sourceId: 'prod-3-lunch', quantity: '3', unit: '份' },
        { label: '布料廢料', categoryId: 'prod-5', sourceId: 'prod-5-fabric', quantity: '1', unit: '公斤' }
      ],
      props: [
        { label: '道具運輸', categoryId: 'prod-1', sourceId: 'prod-1-truck', quantity: '30', unit: '公里' },
        { label: '道具廢料', categoryId: 'prod-5', sourceId: 'prod-5-mixed', quantity: '3', unit: '公斤' }
      ],
      transport: [
        { label: '工作人員接送', categoryId: 'prod-1', sourceId: 'prod-1-van', quantity: '100', unit: '公里' },
        { label: '車輛燃料', categoryId: 'prod-6', sourceId: 'prod-6-petrol', quantity: '50', unit: '公升' }
      ]
    };
    
    return quickOptions[selectedCrew as keyof typeof quickOptions] || [];
  };
  
  // 獲取基於選擇階段和類別的排放源
  const [availableSources, setAvailableSources] = useState<EmissionSource[]>([]);
  
  // 選擇的排放源
  const [selectedSource, setSelectedSource] = useState<EmissionSource | null>(null);
  
  // 添加新的狀態來控制AR掃描器顯示
  const [showARScanner, setShowARScanner] = useState(false);
  const [quickInputMode, setQuickInputMode] = useState(true); // 預設開啟快速輸入模式
  
  // 監聽鍵盤顯示/隱藏事件
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // 獲取當前選擇的設備列表
  const getEquipmentList = () => {
    // 拍攝階段
    if (stage === 'production') {
      switch (currentEquipmentCategory) {
        case 'prod-1': // 拍攝交通
          return ENHANCED_TRANSPORT_EQUIPMENT;
        case 'prod-2': // 攝影設備
          return ENHANCED_CAMERA_EQUIPMENT;
        case 'prod-3': // 拍攝餐飲
          return ENHANCED_FOOD_EQUIPMENT;
        case 'prod-4': // 住宿
          return ENHANCED_ACCOMMODATION_EQUIPMENT;
        case 'prod-5': // 廢棄物
          return ENHANCED_WASTE_EQUIPMENT;
        case 'prod-6': // 燃料
          return ENHANCED_FUEL_EQUIPMENT;
        case 'prod-7': // 照明設備
          return ENHANCED_LIGHTING_EQUIPMENT;
        default:
          return [];
      }
    }
    // 前期製作設備
    else if (stage === 'pre-production') {
      switch (currentEquipmentCategory) {
        case 'pre-1': // 場勘交通
          return ENHANCED_TRANSPORT_EQUIPMENT;
        case 'pre-2': // 會議用電
          return ENHANCED_OFFICE_EQUIPMENT;
        case 'pre-3': // 文書作業
          return ENHANCED_OFFICE_EQUIPMENT; // 使用辦公設備
        case 'pre-4': // 前期餐飲
          return ENHANCED_FOOD_EQUIPMENT;
        case 'pre-5': // 影印紙張
          return ENHANCED_OFFICE_EQUIPMENT.filter(item => 
            item.type.toLowerCase().includes('print') || item.name.toLowerCase().includes('printer')
          ); // 篩選打印設備
        default:
          return [];
      }
    }
    // 後期製作設備
    else if (stage === 'post-production') {
      switch (currentEquipmentCategory) {
        case 'post-1': // 後製設備
          return ENHANCED_EDITING_EQUIPMENT;
        case 'post-2': // 後製用電
          return ENHANCED_OFFICE_EQUIPMENT;
        case 'post-3': // 後製交通
          return ENHANCED_TRANSPORT_EQUIPMENT;
        case 'post-4': // 後製餐飲
          return ENHANCED_FOOD_EQUIPMENT;
        case 'post-5': // 數據存儲
          return ENHANCED_STORAGE_EQUIPMENT;
        default:
          return [];
      }
    }
    
    return [];
  };
  
  // 過濾設備列表
  const filteredEquipment = getEquipmentList().filter(item => {
    const matchesSearch = equipmentSearchQuery === '' || 
      item.name.toLowerCase().includes(equipmentSearchQuery.toLowerCase());
    
    const matchesType = equipmentType === null || 
      'type' in item && item.type === equipmentType;
    
    return matchesSearch && matchesType;
  });
  
  // 獲取設備類型列表
  const getEquipmentTypes = () => {
    const equipmentList = getEquipmentList();
    if (equipmentList.length === 0) return [];
    
    return Array.from(new Set(equipmentList.map(item => 
      'type' in item ? item.type : ''
    ))).filter(type => type !== '');
  };
  
  const equipmentTypes = getEquipmentTypes();
  
  // 當類別改變時，更新可用的排放源
  useEffect(() => {
    if (categoryId) {
      const sources = translatedSources.filter(
        source => source.stage === stage && source.categoryId === categoryId
      );
      setAvailableSources(sources);
      
      // 如果沒有可用的排放源，清空選擇
      if (sources.length === 0) {
        setSourceId('');
        setSelectedSource(null);
      }
    } else {
      setAvailableSources([]);
      setSourceId('');
      setSelectedSource(null);
    }
  }, [categoryId, stage, translatedSources]);
  
  // 當排放源ID改變時，更新選擇的排放源
  useEffect(() => {
    if (sourceId) {
      const source = EMISSION_SOURCES.find(s => s.id === sourceId);
      setSelectedSource(source || null);
    } else {
      setSelectedSource(null);
    }
  }, [sourceId]);
  
  // 計算碳排放量
  const calculateEmission = () => {
    if (!sourceId || !quantity || isNaN(parseFloat(quantity))) {
      setQuantityError('請輸入有效的數量');
      return;
    }
    
    setQuantityError('');
    setIsCalculating(true);
    
    // 模擬計算過程
    setTimeout(() => {
      const source = EMISSION_SOURCES.find(s => s.id === sourceId);
      if (source) {
        const amount = parseFloat(quantity) * source.emissionFactor;
        setCalculatedAmount(amount);
      }
      setIsCalculating(false);
    }, 1000);
  };
  
  // 計算設備使用的碳排放量
  const calculateEquipmentEmission = () => {
    if (!selectedEquipment) {
      setEquipmentError('請選擇設備');
      return;
    }
    
    let amount = 0;
    let quantityValue = 0;
    let unit = '';
    let valid = false;
    
    // 根據不同類型的設備計算排放量
    if ('powerConsumption' in selectedEquipment) {
      // 用電設備 - 使用時間
      if (!equipmentHours || isNaN(parseFloat(equipmentHours))) {
        setEquipmentError('請輸入有效的使用時間');
        return;
      }
      quantityValue = parseFloat(equipmentHours);
      amount = quantityValue * selectedEquipment.emissionFactor;
      unit = '小時';
      valid = true;
    } 
    else if ('fuelType' in selectedEquipment) {
      // 交通設備 - 行駛距離
      if (!equipmentDistance || isNaN(parseFloat(equipmentDistance))) {
        setEquipmentError('請輸入有效的行駛距離');
        return;
      }
      quantityValue = parseFloat(equipmentDistance);
      amount = quantityValue * selectedEquipment.emissionFactor;
      unit = '公里';
      valid = true;
    }
    else if ('servingSize' in selectedEquipment) {
      // 餐飲 - 份數
      if (!equipmentQuantity || isNaN(parseFloat(equipmentQuantity))) {
        setEquipmentError('請輸入有效的份數');
        return;
      }
      quantityValue = parseFloat(equipmentQuantity);
      amount = quantityValue * selectedEquipment.emissionFactor;
      unit = '份';
      valid = true;
    }
    else if (currentEquipmentCategory === 'prod-4' || currentEquipmentCategory === 'post-4') {
      // 住宿 - 晚數
      if (!equipmentQuantity || isNaN(parseFloat(equipmentQuantity))) {
        setEquipmentError('請輸入有效的晚數');
        return;
      }
      quantityValue = parseFloat(equipmentQuantity);
      amount = quantityValue * selectedEquipment.emissionFactor;
      unit = '晚';
      valid = true;
    }
    else if (currentEquipmentCategory === 'prod-5') {
      // 廢棄物 - 公斤
      if (!equipmentQuantity || isNaN(parseFloat(equipmentQuantity))) {
        setEquipmentError('請輸入有效的重量');
        return;
      }
      quantityValue = parseFloat(equipmentQuantity);
      amount = quantityValue * selectedEquipment.emissionFactor;
      unit = '公斤';
      valid = true;
    }
    else if (currentEquipmentCategory === 'prod-6') {
      // 燃料 - 公升/立方米
      if (!equipmentQuantity || isNaN(parseFloat(equipmentQuantity))) {
        setEquipmentError('請輸入有效的數量');
        return;
      }
      quantityValue = parseFloat(equipmentQuantity);
      amount = quantityValue * selectedEquipment.emissionFactor;
      unit = selectedEquipment.type === 'natural-gas' ? '立方米' : '公升';
      valid = true;
    }
    else if (currentEquipmentCategory === 'pre-5' || 'unit' in selectedEquipment) {
      // 印刷紙張 - 張數
      if (!equipmentQuantity || isNaN(parseFloat(equipmentQuantity))) {
        setEquipmentError('請輸入有效的數量');
        return;
      }
      quantityValue = parseFloat(equipmentQuantity);
      amount = quantityValue * selectedEquipment.emissionFactor;
      unit = 'unit' in selectedEquipment ? selectedEquipment.unit : '張';
      valid = true;
    }
    else if (currentEquipmentCategory === 'post-5' || 'capacity' in selectedEquipment) {
      // 存儲設備 - 容量
      if (!equipmentQuantity || isNaN(parseFloat(equipmentQuantity))) {
        setEquipmentError('請輸入有效的容量');
        return;
      }
      quantityValue = parseFloat(equipmentQuantity);
      amount = quantityValue * selectedEquipment.emissionFactor;
      unit = 'capacity' in selectedEquipment ? selectedEquipment.capacity : 'GB';
      valid = true;
    }
    
    if (!valid) {
      setEquipmentError('無法計算此設備的碳排放量');
      return;
    }
    
    setEquipmentError('');
    setIsCalculating(true);
    
    // 模擬計算過程
    setTimeout(() => {
      setCalculatedAmount(amount);
      
      // 自動填充其他字段
      setCategoryId(currentEquipmentCategory);
      setDescription(`使用 ${selectedEquipment.name} ${quantityValue} ${unit}`);
      setQuantity(quantityValue.toString());
      
      // 關閉設備選擇器
      setShowEquipmentSelector(false);
      setIsCalculating(false);
    }, 1000);
  };
  
  // 添加設備到多設備列表
  const addEquipmentToList = () => {
    if (!selectedEquipment) {
      setEquipmentError('請選擇設備');
      return;
    }
    
    let valid = false;
    let quantity = 1;
    let hours: number | undefined = undefined;
    let distance: number | undefined = undefined;
    
    // 檢查是否是為交通計算選擇設備
    const isForTransport = categoryId === 'prod-1' && stage === 'production';
    
    // 根據不同類型的設備驗證輸入
    if ('powerConsumption' in selectedEquipment) {
      if (isForTransport) {
        // 如果是為交通計算選擇設備，只需要數量
        if (!equipmentQuantity || isNaN(parseFloat(equipmentQuantity))) {
          setEquipmentError('請輸入有效的數量');
          return;
        }
        quantity = parseFloat(equipmentQuantity);
        valid = true;
      } else {
        // 用電設備 - 使用時間
        if (!equipmentHours || isNaN(parseFloat(equipmentHours))) {
          setEquipmentError('請輸入有效的使用時間');
          return;
        }
        hours = parseFloat(equipmentHours);
        valid = true;
      }
    } 
    else if ('fuelType' in selectedEquipment) {
      // 交通設備 - 行駛距離
      if (!equipmentDistance || isNaN(parseFloat(equipmentDistance))) {
        setEquipmentError('請輸入有效的行駛距離');
        return;
      }
      distance = parseFloat(equipmentDistance);
      valid = true;
    }
    else {
      // 其他設備 - 數量
      if (!equipmentQuantity || isNaN(parseFloat(equipmentQuantity))) {
        setEquipmentError('請輸入有效的數量');
        return;
      }
      quantity = parseFloat(equipmentQuantity);
      valid = true;
    }
    
    if (!valid) {
      setEquipmentError('請輸入有效的數值');
      return;
    }
    
    // 添加到列表
    const newItem: SelectedEquipmentItem = {
      equipment: selectedEquipment,
      quantity: quantity,
      hours: hours,
      distance: distance
    };
    
    setSelectedEquipmentItems(prev => [...prev, newItem]);
    
    // 清空輸入
    setSelectedEquipment(null);
    setEquipmentHours('');
    setEquipmentDistance('');
    setEquipmentQuantity('');
    setEquipmentError('');
  };
  
  // 從多設備列表中移除設備
  const removeEquipmentFromList = (index: number) => {
    setSelectedEquipmentItems(prev => prev.filter((_, i) => i !== index));
  };
  
  // 計算多設備的碳排放量
  const calculateMultipleEquipmentEmissions = () => {
    if (selectedEquipmentItems.length === 0) {
      setEquipmentError('請至少選擇一個設備');
      return;
    }
    
    setEquipmentError('');
    setIsCalculating(true);
    
    // 模擬計算過程
    setTimeout(() => {
      // 計算總排放量
      const totalEmissions = selectedEquipmentItems.reduce((total, item) => {
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
      
      setCalculatedAmount(totalEmissions);
      
      // 自動填充其他字段
      setCategoryId(currentEquipmentCategory);
      
      // 生成設備列表描述
      const equipmentListText = selectedEquipmentItems.map(item => 
        `${item.equipment.name} x ${item.quantity}`
      ).join(', ');
      
      setDescription(`使用設備: ${equipmentListText}`);
      setQuantity('1'); // 設置為1，因為已經在計算中考慮了數量
      
      // 關閉設備選擇器
      setShowMultipleEquipmentSelector(false);
      setIsCalculating(false);
    }, 1000);
  };
  
  // 計算交通碳排放量
  const calculateTransportEmissions = () => {
    if (!selectedTransport) {
      setTransportError('請選擇交通工具');
      return;
    }
    
    if (!transportDistance || isNaN(Number(transportDistance)) || Number(transportDistance) <= 0) {
      setTransportError('請輸入有效的行駛距離');
      return;
    }
    
    setTransportError('');
    
    // 使用增強版交通設備類型
    const transport = selectedTransport as EnhancedTransportEquipment;
    
    const params: TransportCalculationParams = {
      transport: transport,
      distance: Number(transportDistance),
      peopleCount: Number(peopleCount) || 1,
      equipmentWeight: 0 // 設置默認值
    };
    
    setIsCalculating(true);
    
    try {
      const emissions = calcTransportEmissions(params);
      setCalculatedAmount(emissions);
      setQuantity(transportDistance);
    } catch (error) {
      console.error('Error calculating transport emissions:', error);
      Alert.alert('計算錯誤', '計算排放時發生錯誤，請確認數據後重試');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // 驗證表單
  const validateForm = () => {
    let isValid = true;
    
    if (!stage) {
      setStageError('請選擇製作階段');
      isValid = false;
    }
    
    if (!categoryId) {
      setCategoryError('請選擇排放類別');
      isValid = false;
    }
    
    if (!description.trim()) {
      setDescriptionError('請輸入描述');
      isValid = false;
    }
    
    if (!calculatedAmount && !sourceId) {
      setSourceError('請選擇排放源');
      isValid = false;
    }
    
    if (!calculatedAmount && (!quantity || isNaN(parseFloat(quantity)))) {
      setQuantityError('請輸入有效的數量');
      isValid = false;
    }
    
    if (!date) {
      setDateError('請選擇日期');
      isValid = false;
    }
    return isValid;
  };
  
  // 保存記錄
  const saveRecord = () => {
    if (!validateForm()) {
      return;
    }
    
    if (!calculatedAmount) {
      Alert.alert('錯誤', '請先計算碳排放量');
      return;
    }
    
    setIsSaving(true);
    
    // 創建記錄對象
    const record = {
      projectId: projectId || '',
      stage,
      category: 'transportation', // Default category for compatibility
      categoryId,
      description,
      title: description, // For compatibility
      sourceId: sourceId || '',
      quantity: quantity ? parseFloat(quantity) : 0,
      unit: selectedSource?.unit || '',
      amount: calculatedAmount,
      date: date.toISOString(),
      location,
      notes,
      createdAt: new Date().toISOString(),
      // 添加組別信息
      crew: selectedCrew,
      crewName: CREW_DEPARTMENTS[selectedCrew]?.name,
      // 添加設備列表和人數信息
      equipmentList: selectedEquipmentItems.length > 0 ? formatEquipmentList(selectedEquipmentItems) : undefined,
      peopleCount: peopleCount ? parseInt(peopleCount) : undefined
    };
    
    // 添加記錄
    setTimeout(() => {
      addEmissionRecord(record);
      setIsSaving(false);
      Alert.alert('成功', '碳排放記錄已添加', [
        { text: '確定', onPress: () => router.back() }
      ]);
    }, 1000);
  };
  
  // 切換區段展開/收起
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // 選擇設備
  const selectEquipment = (equipment) => {
    setSelectedEquipment(equipment);
  };
  
  // 打開設備選擇器
  const openEquipmentSelector = (categoryId: string) => {
    setCurrentEquipmentCategory(categoryId);
    setSelectedEquipment(null);
    setEquipmentHours('');
    setEquipmentDistance('');
    setEquipmentQuantity('');
    setEquipmentSearchQuery('');
    setEquipmentType(null);
    setEquipmentError('');
    
    // 檢查是否為攝影設備類別
    if (categoryId === 'prod-2') {
      // 攝影設備使用多設備模式
      setMultipleEquipmentMode(true);
      setSelectedEquipmentItems([]);
      setShowMultipleEquipmentSelector(true);
    } 
    // 檢查是否為交通類別
    else if (categoryId === 'prod-1' || categoryId === 'pre-1' || categoryId === 'post-3') {
      // 交通類別使用交通計算器
      setSelectedTransport(null);
      setTransportDistance('');
      setPeopleCount('1');
      
      // 只有拍攝階段的交通需要設備選擇
      if (stage === 'production' && categoryId === 'prod-1') {
        setSelectedEquipmentItems([]);
      } else {
        // 前期和後期的交通不需要設備選擇
        setSelectedEquipmentItems([]);
      }
      
      setShowTransportCalculator(true);
    }
    else {
      // 其他類別使用單設備模式
      setMultipleEquipmentMode(false);
      setShowEquipmentSelector(true);
    }
  };
  
  // 獲取設備選擇器標題
  const getEquipmentSelectorTitle = () => {
    // 拍攝階段
    if (stage === 'production') {
      switch (currentEquipmentCategory) {
        case 'prod-1':
          return '選擇交通工具';
        case 'prod-2':
          return '選擇攝影設備';
        case 'prod-3':
          return '選擇餐飲選項';
        case 'prod-4':
          return '選擇住宿選項';
        case 'prod-5':
          return '選擇廢棄物類型';
        case 'prod-6':
          return '選擇燃料類型';
        case 'prod-7':
          return '選擇照明設備';
        default:
          return '選擇設備';
      }
    }
    // 前期製作
    else if (stage === 'pre-production') {
      switch (currentEquipmentCategory) {
        case 'pre-1':
          return '選擇場勘交通工具';
        case 'pre-2':
          return '選擇會議用電設備';
        case 'pre-3':
          return '選擇文書作業設備';
        case 'pre-4':
          return '選擇餐飲選項';
        case 'pre-5':
          return '選擇印刷紙張';
        default:
          return '選擇設備';
      }
    }
    // 後期製作
    else if (stage === 'post-production') {
      switch (currentEquipmentCategory) {
        case 'post-1':
          return '選擇後製設備';
        case 'post-2':
          return '選擇後製用電設備';
        case 'post-3':
          return '選擇交通工具';
        case 'post-4':
          return '選擇餐飲選項';
        case 'post-5':
          return '選擇存儲設備';
        default:
          return '選擇設備';
      }
    }
    
    return '選擇設備';
  };
  
  // 獲取設備圖標
  const getEquipmentIcon = (categoryId) => {
    const size = 16;
    const color = theme.primary;
    
    // 拍攝階段
    if (categoryId.startsWith('prod-')) {
      switch (categoryId) {
        case 'prod-1':
          return <Car size={size} color={color} />;
        case 'prod-2':
          return <Camera size={size} color={color} />;
        case 'prod-3':
          return <Utensils size={size} color={color} />;
        case 'prod-4':
          return <Hotel size={size} color={color} />;
        case 'prod-5':
          return <Trash size={size} color={color} />;
        case 'prod-6':
          return <Fuel size={size} color={color} />;
        case 'prod-7':
          return <Zap size={size} color={color} />;
        default:
          return <Camera size={size} color={color} />;
      }
    }
    // 前期製作
    else if (categoryId.startsWith('pre-')) {
      switch (categoryId) {
        case 'pre-1':
          return <Car size={size} color={color} />;
        case 'pre-2':
          return <Lightbulb size={size} color={color} />;
        case 'pre-3':
          return <Laptop size={size} color={color} />;
        case 'pre-4':
          return <Utensils size={size} color={color} />;
        case 'pre-5':
          return <FileText size={size} color={color} />;
        default:
          return <Laptop size={size} color={color} />;
      }
    }
    // 後期製作
    else if (categoryId.startsWith('post-')) {
      switch (categoryId) {
        case 'post-1':
          return <Laptop size={size} color={color} />;
        case 'post-2':
          return <Lightbulb size={size} color={color} />;
        case 'post-3':
          return <Car size={size} color={color} />;
        case 'post-4':
          return <Utensils size={size} color={color} />;
        case 'post-5':
          return <HardDrive size={size} color={color} />;
        default:
          return <Laptop size={size} color={color} />;
      }
    }
    
    return <Camera size={size} color={color} />;
  };
  
  // 獲取設備輸入標籤
  const getEquipmentInputLabel = (): string => {
    // 拍攝階段
    if (stage === 'production') {
      switch (currentEquipmentCategory) {
        case 'prod-1':
          return '行駛距離 (公里)';
        case 'prod-2':
          return '使用時間 (小時)';
        case 'prod-3':
          return '份數';
        case 'prod-4':
          return '晚數';
        case 'prod-5':
          return '重量 (公斤)';
        case 'prod-6':
          return selectedEquipment && 'type' in selectedEquipment && selectedEquipment.type === 'natural-gas' 
            ? '數量 (立方米)' 
            : '數量 (公升)';
        case 'prod-7':
          return '使用時間 (小時)';
        default:
          return '數量';
      }
    }
    // 前期製作
    else if (stage === 'pre-production') {
      switch (currentEquipmentCategory) {
        case 'pre-1':
          return '行駛距離 (公里)';
        case 'pre-2':
          return '使用時間 (小時)';
        case 'pre-3':
          return '使用時間 (小時)';
        case 'pre-4':
          return '份數';
        case 'pre-5':
          return '數量 (張)';
        default:
          return '數量';
      }
    }
    // 後期製作
    else if (stage === 'post-production') {
      switch (currentEquipmentCategory) {
        case 'post-1':
          return '使用時間 (小時)';
        case 'post-2':
          return '使用時間 (小時)';
        case 'post-3':
          return '行駛距離 (公里)';
        case 'post-4':
          return '份數';
        case 'post-5':
          return selectedEquipment && 'capacity' in selectedEquipment 
            ? `容量 (${selectedEquipment.capacity})` 
            : '容量 (GB)';
        default:
          return '數量';
      }
    }
    
    return '數量';
  };
  
  // 渲染組別選擇
  // 快速輸入功能
  const handleQuickInput = (option: any) => {
    setCategoryId(option.categoryId);
    setSourceId(option.sourceId);
    setQuantity(option.quantity);
    setDescription(option.label);
    
    // 自動計算排放量
    setTimeout(() => {
      calculateEmission();
    }, 100);
  };

  // 渲染快速輸入選項
  const renderQuickInputSection = () => (
    <View style={[styles.section, { backgroundColor: theme.card }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>快速輸入</Text>
        <TouchableOpacity onPress={() => setQuickInputMode(!quickInputMode)}>
          <Text style={[styles.toggleText, { color: theme.primary }]}>
            {quickInputMode ? '詳細模式' : '快速模式'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {quickInputMode && (
        <View style={styles.sectionContent}>
          <Text style={[styles.quickInputDesc, { color: theme.secondaryText }]}>
            點擊常用選項快速記錄，或切換到詳細模式自訂輸入
          </Text>
          
          <View style={styles.quickOptionsGrid}>
            {getQuickInputOptions().map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickOptionCard, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => handleQuickInput(option)}
              >
                <Text style={[styles.quickOptionLabel, { color: theme.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.quickOptionValue, { color: theme.secondaryText }]}>
                  {option.quantity} {option.unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderCrewSection = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => toggleSection('crew')}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>拍攝組別</Text>
        {expandedSections.crew ? (
          <ChevronUp size={20} color={theme.secondaryText} />
        ) : (
          <ChevronDown size={20} color={theme.secondaryText} />
        )}
      </TouchableOpacity>
      
      {expandedSections.crew && (
        <View style={styles.sectionContent}>
          <View style={styles.crewGrid}>
            {Object.entries(CREW_DEPARTMENTS).map(([key, dept]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.crewCard,
                  { 
                    backgroundColor: selectedCrew === key ? dept.bgColor : theme.card,
                    borderColor: selectedCrew === key ? dept.color : theme.border
                  },
                  selectedCrew === key && styles.selectedCrewCard
                ]}
                onPress={() => {
                  setSelectedCrew(key);
                  setCategoryId('');
                }}
              >
                <View style={[
                  styles.crewIconContainer,
                  { 
                    backgroundColor: selectedCrew === key ? dept.color + '20' : theme.background 
                  }
                ]}>
                  {getCrewIcon(key, 20, selectedCrew === key ? dept.color : theme.secondaryText)}
                </View>
                <Text style={[
                  styles.crewName, 
                  { 
                    color: selectedCrew === key ? dept.color : theme.text,
                    fontWeight: selectedCrew === key ? '600' : '500'
                  }
                ]}>
                  {dept.name}
                </Text>
                {selectedCrew === key && (
                  <View style={[styles.selectedIndicator, { backgroundColor: dept.color }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={[styles.stageInfo, { 
            backgroundColor: theme.card,
            borderColor: theme.border 
          }]}>
            <View style={styles.stageInfoHeader}>
              <Video size={16} color={theme.primary} />
              <Text style={[styles.stageInfoTitle, { color: theme.text }]}>
                拍攝階段排放記錄
              </Text>
            </View>
            <Text style={[styles.stageInfoDesc, { color: theme.secondaryText }]}>
              記錄現場拍攝過程中各組別的碳排放數據
            </Text>
          </View>
        </View>
      )}
    </View>
  );
  
  // 渲染類別選擇
  const renderCategorySection = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => toggleSection('category')}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>排放類別</Text>
        {expandedSections.category ? (
          <ChevronUp size={20} color={theme.secondaryText} />
        ) : (
          <ChevronDown size={20} color={theme.secondaryText} />
        )}
      </TouchableOpacity>
      
      {expandedSections.category && (
        <View style={styles.sectionContent}>
          <View style={styles.categoriesGrid}>
            {stageCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  categoryId === category.id && styles.selectedCategoryCard,
                  categoryId === category.id && { borderColor: category.color }
                ]}
                onPress={() => {
                  setCategoryId(category.id);
                  setCategoryError('');
                }}
              >
                <LinearGradient
                  colors={[category.color + '20', category.color + '05']}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View 
                  style={[
                    styles.categoryIcon, 
                    { backgroundColor: category.color + '20' }
                  ]}
                >
                  <Text style={[styles.categoryIconText, { color: category.color }]}>
                    {category.name.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {category.name}
                </Text>
                <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
              </TouchableOpacity>
            ))}
          </View>
          
          {categoryError ? (
            <Text style={[styles.errorText, { color: theme.error }]}>{categoryError}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
  
  // 渲染描述輸入
  const renderDescriptionSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>描述</Text>
      </View>
      
      <View style={styles.sectionContent}>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: descriptionError ? theme.error : theme.border
            }
          ]}
          placeholder="簡短描述此排放活動..."
          placeholderTextColor={theme.secondaryText}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setDescriptionError('');
          }}
          multiline
        />
        
        {descriptionError ? (
          <Text style={[styles.errorText, { color: theme.error }]}>{descriptionError}</Text>
        ) : null}
      </View>
    </View>
  );
  
  // 渲染排放源選擇
  const renderSourceSection = () => {
    
    return (
      <View style={styles.section}>
        <TouchableOpacity 
          style={[
            styles.sectionHeader, 
            { backgroundColor: theme.card }
          ]} 
          onPress={() => toggleSection('source')}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            排放源
          </Text>
          {expandedSections.source ? 
            <ChevronUp color={theme.text} size={20} /> : 
            <ChevronDown color={theme.text} size={20} />
          }
        </TouchableOpacity>
        
        {expandedSections.source && (
          <View style={styles.sectionContent}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: theme.text }}>
              選擇碳排放源 {availableSources.length === 0 ? '(請先選擇階段和類別)' : ''}
            </Text>

            {/* 掃描與排放源選擇按鈕 */}
            {categoryId && (
              <View style={styles.sourceActions}>
                <TouchableOpacity
                  style={[styles.equipmentButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => openEquipmentSelector(categoryId)}
                >
                  {getEquipmentIcon(categoryId)}
                  <Text style={[styles.equipmentButtonText, { color: theme.primary }]}>
                    選擇{stageCategories.find(cat => cat.id === categoryId)?.name || '設備'}
                  </Text>
                  
                  {/* 掃描圖標按鈕 - 新設計 */}
                  <View style={styles.scanDivider} />
                  <TouchableOpacity
                    style={styles.scanIconButton}
                    onPress={() => setShowARScanner(true)}
                  >
                    <CameraIcon size={18} color={theme.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
            
            {categoryId ? (
              availableSources.length > 0 ? (
                <View style={styles.sourcesWrapper}>
                  <FlatList
                    data={availableSources}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.sourceCard,
                          sourceId === item.id && styles.selectedSourceCard,
                          { backgroundColor: theme.card }
                        ]}
                        onPress={() => {
                          setSourceId(item.id);
                          setSourceError('');
                        }}
                      >
                        <View style={styles.sourceHeader}>
                          <Text style={[styles.sourceName, { color: theme.text }]}>
                            {item.name}
                          </Text>
                          {sourceId === item.id && (
                            <Check size={16} color={theme.primary} />
                          )}
                        </View>
                        
                        <Text style={[styles.sourceEmissionFactor, { color: theme.primary }]}>
                          {item.emissionFactor} 公斤CO₂e/{item.unit}
                        </Text>
                        
                        {item.description && (
                          <Text style={[styles.sourceDescription, { color: theme.secondaryText }]}>
                            {item.description}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.sourcesListContent}
                    style={styles.sourcesList}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                  />
                  
                  {sourceError ? (
                    <Text style={[styles.errorText, { color: theme.error }]}>{sourceError}</Text>
                  ) : null}
                  
                  {sourceId && (
                    <View style={styles.quantityContainer}>
                      <Text style={[styles.quantityLabel, { color: theme.text }]}>
                        數量 ({selectedSource?.unit})
                      </Text>
                      <View style={styles.quantityInputContainer}>
                        <TextInput
                          style={[
                            styles.quantityInput,
                            { 
                              backgroundColor: theme.card,
                              color: theme.text,
                              borderColor: quantityError ? theme.error : theme.border
                            }
                          ]}
                          placeholder={`輸入${selectedSource?.unit}數量...`}
                          placeholderTextColor={theme.secondaryText}
                          value={quantity}
                          onChangeText={(text) => {
                            setQuantity(text);
                            setQuantityError('');
                          }}
                          keyboardType="numeric"
                        />
                        <TouchableOpacity
                          style={[styles.calculateButton, { backgroundColor: theme.primary }]}
                          onPress={calculateEmission}
                          disabled={isCalculating}
                        >
                          {isCalculating ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.calculateButtonText}>計算</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                      
                      {quantityError ? (
                        <Text style={[styles.errorText, { color: theme.error }]}>{quantityError}</Text>
                      ) : null}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptySourcesContainer}>
                  <Text style={[styles.emptySourcesText, { color: theme.secondaryText }]}>
                    此類別暫無可用的排放源，請使用設備選擇器
                  </Text>
                </View>
              )
            ) : (
              <Text style={[styles.selectCategoryText, { color: theme.secondaryText }]}>
                請先選擇排放類別
              </Text>
            )}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <Info size={14} color={theme.secondaryText} />
              <Text style={{ 
                fontSize: 12, 
                marginLeft: 8,
                color: theme.secondaryText 
              }}>
                選擇排放源計算碳排放量，或使用設備選擇器/掃描識別
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };
  
  // 渲染計算結果
  const renderCalculationResult = () => (
    calculatedAmount !== null && calculatedAmount !== undefined && (
      <View style={[styles.resultContainer, { backgroundColor: theme.primary + '20' }]}>
        <Text style={[styles.resultLabel, { color: theme.secondaryText }]}>
          計算結果
        </Text>
        <Text style={[styles.resultValue, { color: theme.primary }]}>
          {calculatedAmount.toFixed(2)} 公斤CO₂e
        </Text>
        <Text style={[styles.resultNote, { color: theme.secondaryText }]}>
          此數值將被記錄為此活動的碳排放量
        </Text>
      </View>
    )
  );
  
  // 渲染詳細信息
  const renderDetailsSection = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => toggleSection('details')}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>詳細信息</Text>
        {expandedSections.details ? (
          <ChevronUp size={20} color={theme.secondaryText} />
        ) : (
          <ChevronDown size={20} color={theme.secondaryText} />
        )}
      </TouchableOpacity>
      
      {expandedSections.details && (
        <View style={styles.sectionContent}>
          <View style={styles.detailItem}>
            <DatePickerField
              label="日期"
              value={date}
              onChange={(newDate) => {
                setDate(newDate);
                setDateError('');
              }}
              error={dateError}
              fieldStyle={[
                styles.datePickerField,
                { 
                  backgroundColor: theme.card,
                  borderColor: dateError ? theme.error : theme.border
                }
              ]}
            />
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <MapPin size={18} color={theme.secondaryText} />
              <Text style={[styles.detailLabel, { color: theme.text }]}>地點 (選填)</Text>
            </View>
            <TextInput
              style={[
                styles.detailInput,
                { 
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              placeholder="輸入地點..."
              placeholderTextColor={theme.secondaryText}
              value={location}
              onChangeText={setLocation}
            />
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Info size={18} color={theme.secondaryText} />
              <Text style={[styles.detailLabel, { color: theme.text }]}>備註 (選填)</Text>
            </View>
            <TextInput
              style={[
                styles.detailInput,
                styles.notesInput,
                { 
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              placeholder="輸入備註..."
              placeholderTextColor={theme.secondaryText}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      )}
    </View>
  );
  
  // 渲染設備選擇器
  const renderEquipmentSelector = () => (
    <Modal
      visible={showEquipmentSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowEquipmentSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {getEquipmentSelectorTitle()}
            </Text>
            <Pressable onPress={() => setShowEquipmentSelector(false)}>
              <X size={24} color={theme.text} />
            </Pressable>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputContainer, { backgroundColor: theme.card }]}>
              <Search size={20} color={theme.secondaryText} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="搜尋設備..."
                placeholderTextColor={theme.secondaryText}
                value={equipmentSearchQuery}
                onChangeText={setEquipmentSearchQuery}
              />
              {equipmentSearchQuery ? (
                <TouchableOpacity onPress={() => setEquipmentSearchQuery('')}>
                  <X size={16} color={theme.secondaryText} />
                </TouchableOpacity>
              ) : null}
            </View>
            
            {equipmentTypes.length > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeFiltersContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.typeFilterChip,
                    equipmentType === null && { backgroundColor: theme.primary + '20' }
                  ]}
                  onPress={() => setEquipmentType(null)}
                >
                  <Text 
                    style={[
                      styles.typeFilterText, 
                      { color: equipmentType === null ? theme.primary : theme.secondaryText }
                    ]}
                  >
                    全部
                  </Text>
                </TouchableOpacity>
                
                {equipmentTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeFilterChip,
                      equipmentType === type && { backgroundColor: theme.primary + '20' }
                    ]}
                    onPress={() => setEquipmentType(type)}
                  >
                    <Text 
                      style={[
                        styles.typeFilterText, 
                        { color: equipmentType === type ? theme.primary : theme.secondaryText }
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          
          <FlatList
            data={filteredEquipment}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.equipmentItem,
                  selectedEquipment?.id === item.id && styles.selectedEquipmentItem,
                  { backgroundColor: theme.card }
                ]}
                onPress={() => selectEquipment(item)}
              >
                <View style={styles.equipmentItemContent}>
                  <Text style={[styles.equipmentName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  
                  {'type' in item && (
                    <View style={[styles.equipmentTypeChip, { backgroundColor: theme.primary + '10' }]}>
                      <Text style={[styles.equipmentTypeText, { color: theme.primary }]}>
                        {item.type}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.equipmentDetails}>
                    {'powerConsumption' in item && (
                      <Text style={[styles.equipmentDetail, { color: theme.secondaryText }]}>
                        功率: {item.powerConsumption} 瓦
                      </Text>
                    )}
                    
                    {'fuelType' in item && (
                      <Text style={[styles.equipmentDetail, { color: theme.secondaryText }]}>
                        燃料: {item.fuelType}
                      </Text>
                    )}
                    
                    {'servingSize' in item && (
                      <Text style={[styles.equipmentDetail, { color: theme.secondaryText }]}>
                        份量: {item.servingSize}
                      </Text>
                    )}
                    
                    {'weight' in item && item.weight && (
                      <Text style={[styles.equipmentDetail, { color: theme.secondaryText }]}>
                        重量: {item.weight} 公斤
                      </Text>
                    )}
                    
                    <Text style={[styles.equipmentEmissionFactor, { color: theme.primary }]}>
                      排放因子: {item.emissionFactor} 公斤CO₂e/
                      {(() => {
                        if ('powerConsumption' in item) return '小時';
                        if ('fuelType' in item) return '公里';
                        if ('servingSize' in item) return '份';
                        if ('capacity' in item) return item.capacity as string;
                        if ('unit' in item) return item.unit as string;
                        return '單位';
                      })() as string}
                    </Text>
                  </View>
                </View>
                
                {selectedEquipment?.id === item.id && (
                  <View style={[styles.selectedCheckmark, { backgroundColor: theme.primary }]}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyEquipmentList}>
                <Text style={[styles.emptyEquipmentText, { color: theme.secondaryText }]}>
                  沒有找到符合條件的設備
                </Text>
              </View>
            }
            contentContainerStyle={styles.equipmentList}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
          
          {selectedEquipment && (
            <View style={[styles.equipmentInputSection, { borderTopColor: theme.border }]}>
              <Text style={[styles.equipmentInputLabel, { color: theme.text }]}>
                {getEquipmentInputLabel()}
              </Text>
              
              {'powerConsumption' in selectedEquipment ? (
                <TextInput
                  style={[styles.equipmentInputField, { backgroundColor: theme.card, color: theme.text }]}
                  placeholder="輸入使用時間..."
                  placeholderTextColor={theme.secondaryText}
                  value={equipmentHours}
                  onChangeText={setEquipmentHours}
                  keyboardType="numeric"
                />
              ) : 'fuelType' in selectedEquipment ? (
                <TextInput
                  style={[styles.equipmentInputField, { backgroundColor: theme.card, color: theme.text }]}
                  placeholder="輸入行駛距離..."
                  placeholderTextColor={theme.secondaryText}
                  value={equipmentDistance}
                  onChangeText={setEquipmentDistance}
                  keyboardType="numeric"
                />
              ) : (
                <TextInput
                  style={[styles.equipmentInputField, { backgroundColor: theme.card, color: theme.text }]}
                  placeholder="輸入數量..."
                  placeholderTextColor={theme.secondaryText}
                  value={equipmentQuantity}
                  onChangeText={setEquipmentQuantity}
                  keyboardType="numeric"
                />
              )}
              
              {equipmentError ? (
                <Text style={[styles.errorText, { marginTop: 4, color: theme.error }]}>{equipmentError}</Text>
              ) : null}
              
              <Button
                title="計算碳排放量"
                onPress={calculateEquipmentEmission}
                variant="primary"
                loading={isCalculating}
                style={{ marginTop: 12 }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
  
  // 渲染多設備選擇器
  const renderMultipleEquipmentSelector = () => {
    // 檢查是否是為交通計算選擇設備
    const isForTransport = categoryId === 'prod-1' && stage === 'production';
    
    return (
    <Modal
      visible={showMultipleEquipmentSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMultipleEquipmentSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {stage === 'production' && categoryId === 'prod-1' ? '選擇設備重量' : '選擇多個攝影設備'}
            </Text>
            <Pressable onPress={() => setShowMultipleEquipmentSelector(false)}>
              <X size={24} color={theme.text} />
            </Pressable>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputContainer, { backgroundColor: theme.card }]}>
              <Search size={20} color={theme.secondaryText} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="搜尋設備..."
                placeholderTextColor={theme.secondaryText}
                value={equipmentSearchQuery}
                onChangeText={setEquipmentSearchQuery}
              />
              {equipmentSearchQuery ? (
                <TouchableOpacity onPress={() => setEquipmentSearchQuery('')}>
                  <X size={16} color={theme.secondaryText} />
                </TouchableOpacity>
              ) : null}
            </View>
            
            {equipmentTypes.length > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeFiltersContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.typeFilterChip,
                    equipmentType === null && { backgroundColor: theme.primary + '20' }
                  ]}
                  onPress={() => setEquipmentType(null)}
                >
                  <Text 
                    style={[
                      styles.typeFilterText, 
                      { color: equipmentType === null ? theme.primary : theme.secondaryText }
                    ]}
                  >
                    全部
                  </Text>
                </TouchableOpacity>
                
                {equipmentTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeFilterChip,
                      equipmentType === type && { backgroundColor: theme.primary + '20' }
                    ]}
                    onPress={() => setEquipmentType(type)}
                  >
                    <Text 
                      style={[
                        styles.typeFilterText, 
                        { color: equipmentType === type ? theme.primary : theme.secondaryText }
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          
          <View style={styles.multiEquipmentContainer}>
            <View style={[styles.selectedEquipmentList, { backgroundColor: theme.card }]}>
              <Text style={[styles.selectedEquipmentTitle, { color: theme.text }]}>
                已選擇的設備 ({selectedEquipmentItems.length.toString()})
              </Text>
              
              {selectedEquipmentItems.length > 0 ? (
                <FlatList
                  data={selectedEquipmentItems}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View style={[styles.selectedEquipmentItem, { borderBottomColor: theme.border }]}>
                      <View style={styles.selectedEquipmentInfo}>
                        <Text style={[styles.selectedEquipmentName, { color: theme.text }]}>
                          {item.equipment.name}
                        </Text>
                        <Text style={[styles.selectedEquipmentQuantity, { color: theme.secondaryText }]}>
                          {item.quantity} {item.hours ? `× ${item.hours}小時` : ''}
                          {'weight' in item.equipment && item.equipment.weight ? 
                            ` (${(item.equipment.weight * item.quantity).toFixed(1)}公斤)` : ''}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.removeEquipmentButton, { backgroundColor: theme.error + '20' }]}
                        onPress={() => removeEquipmentFromList(index)}
                      >
                        <Minus size={16} color={theme.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                  style={styles.selectedEquipmentListContent}
                />
              ) : (
                <Text style={[styles.emptySelectedEquipment, { color: theme.secondaryText }]}>
                  尚未選擇任何設備
                </Text>
              )}
              
              {selectedEquipmentItems.length > 0 && (
                <View style={styles.totalWeightContainer}>
                  <Weight size={16} color={theme.primary} />
                  <Text style={[styles.totalWeightText, { color: theme.text }]}>
                    設備總重量: {calculateTotalEquipmentWeight(selectedEquipmentItems).toFixed(1)} 公斤
                  </Text>
                </View>
              )}
            </View>
            
            <View style={[styles.equipmentSelectorDivider, { backgroundColor: theme.border }]} />
            
            <View style={styles.availableEquipmentList}>
              <Text style={[styles.availableEquipmentTitle, { color: theme.text }]}>
                可用設備
              </Text>
              
              <FlatList
                data={filteredEquipment}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.equipmentItem,
                      selectedEquipment?.id === item.id && styles.selectedEquipmentItem,
                      { backgroundColor: theme.card }
                    ]}
                    onPress={() => selectEquipment(item)}
                  >
                    <View style={styles.equipmentItemContent}>
                      <Text style={[styles.equipmentName, { color: theme.text }]}>
                        {item.name}
                      </Text>
                      
                      {'type' in item && (
                        <View style={[styles.equipmentTypeChip, { backgroundColor: theme.primary + '10' }]}>
                          <Text style={[styles.equipmentTypeText, { color: theme.primary }]}>
                            {item.type}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.equipmentDetails}>
                        {'powerConsumption' in item && (
                          <Text style={[styles.equipmentDetail, { color: theme.secondaryText }]}>
                            功率: {item.powerConsumption} 瓦
                          </Text>
                        )}
                        
                        {'weight' in item && item.weight && (
                          <Text style={[styles.equipmentDetail, { color: theme.secondaryText }]}>
                            重量: {item.weight} 公斤
                          </Text>
                        )}
                        
                        <Text style={[styles.equipmentEmissionFactor, { color: theme.primary }]}>
                          排放因子: {item.emissionFactor} 公斤CO₂e/小時
                        </Text>
                      </View>
                    </View>
                    
                    {selectedEquipment?.id === item.id && (
                      <View style={[styles.selectedCheckmark, { backgroundColor: theme.primary }]}>
                        <Check size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyEquipmentList}>
                    <Text style={[styles.emptyEquipmentText, { color: theme.secondaryText }]}>
                      沒有找到符合條件的設備
                    </Text>
                  </View>
                }
                contentContainerStyle={styles.equipmentList}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              />
            </View>
          </View>
          
          {selectedEquipment && (
            <View style={[styles.equipmentInputSection, { borderTopColor: theme.border }]}>
              <View style={styles.multiInputRow}>
                <View style={styles.multiInputColumn}>
                  <Text style={[styles.equipmentInputLabel, { color: theme.text }]}>
                    數量
                  </Text>
                  <TextInput
                    style={[styles.equipmentInputField, { backgroundColor: theme.card, color: theme.text }]}
                    placeholder="輸入數量..."
                    placeholderTextColor={theme.secondaryText}
                    value={equipmentQuantity}
                    onChangeText={setEquipmentQuantity}
                    keyboardType="numeric"
                  />
                </View>
                
                {/* 只在非交通計算時顯示時間輸入 */}
                {'powerConsumption' in selectedEquipment && !isForTransport && (
                  <View style={styles.multiInputColumn}>
                    <Text style={[styles.equipmentInputLabel, { color: theme.text }]}>
                      使用時間 (小時)
                    </Text>
                    <TextInput
                      style={[styles.equipmentInputField, { backgroundColor: theme.card, color: theme.text }]}
                      placeholder="輸入使用時間..."
                      placeholderTextColor={theme.secondaryText}
                      value={equipmentHours}
                      onChangeText={setEquipmentHours}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>
              
              {equipmentError ? (
                <Text style={[styles.errorText, { marginTop: 4, color: theme.error }]}>{equipmentError}</Text>
              ) : null}
              
              <View style={styles.multiButtonRow}>
                <Button
                  title="添加到列表"
                  onPress={addEquipmentToList}
                  variant="outline"
                  icon={<Plus size={16} color={theme.primary} />}
                  style={styles.addToListButton}
                />
                
                <Button
                  title="計算碳排放量"
                  onPress={calculateMultipleEquipmentEmissions}
                  variant="primary"
                  loading={isCalculating}
                  disabled={selectedEquipmentItems.length === 0}
                  style={styles.calculateMultiButton}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
    );
  };
  
  // 渲染交通計算器
  const renderTransportCalculator = () => (
    <Modal
      visible={showTransportCalculator}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTransportCalculator(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              交通碳排放計算器
            </Text>
            <Pressable onPress={() => setShowTransportCalculator(false)}>
              <X size={24} color={theme.text} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.transportCalculatorContent}>
            <View style={styles.transportSection}>
              <Text style={[styles.transportSectionTitle, { color: theme.text }]}>
                選擇交通工具
              </Text>
              
              <FlatList
                data={ENHANCED_TRANSPORT_EQUIPMENT}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.transportItem,
                      selectedTransport?.id === item.id && styles.selectedTransportItem,
                      { backgroundColor: theme.card }
                    ]}
                    onPress={() => setSelectedTransport(item)}
                  >
                    <View style={styles.transportItemContent}>
                      <Text style={[styles.transportName, { color: theme.text }]}>
                        {item.name}
                      </Text>
                      
                      <View style={styles.transportDetails}>
                        <View style={[styles.transportTypeChip, { backgroundColor: theme.primary + '10' }]}>
                          <Text style={[styles.transportTypeText, { color: theme.primary }]}>
                            {item.type}
                          </Text>
                        </View>
                        
                        <View style={[styles.transportTypeChip, { backgroundColor: theme.secondary + '10' }]}>
                          <Text style={[styles.transportTypeText, { color: theme.secondary }]}>
                            {item.fuelType}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.transportSpecs}>
                        <Text style={[styles.transportSpec, { color: theme.secondaryText }]}>
                          載客: {item.passengerCapacity} 人
                        </Text>
                        <Text style={[styles.transportSpec, { color: theme.secondaryText }]}>
                          載重: {item.cargoCapacity} 公斤
                        </Text>
                      </View>
                      
                      <Text style={[styles.transportEmissionFactor, { color: theme.primary }]}>
                        排放因子: {item.emissionFactor} 公斤CO₂e/公里
                      </Text>
                    </View>
                    
                    {selectedTransport?.id === item.id && (
                      <View style={[styles.selectedCheckmark, { backgroundColor: theme.primary }]}>
                        <Check size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.transportList}
              />
            </View>
            
            <View style={styles.transportSection}>
              <Text style={[styles.transportSectionTitle, { color: theme.text }]}>
                行駛距離與人數
              </Text>
              
              <View style={styles.transportInputRow}>
                <View style={styles.transportInputColumn}>
                  <Text style={[styles.transportInputLabel, { color: theme.text }]}>
                    行駛距離 (公里)
                  </Text>
                  <TextInput
                    style={[styles.transportInputField, { backgroundColor: theme.card, color: theme.text }]}
                    placeholder="輸入距離..."
                    placeholderTextColor={theme.secondaryText}
                    value={transportDistance}
                    onChangeText={setTransportDistance}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.transportInputColumn}>
                  <Text style={[styles.transportInputLabel, { color: theme.text }]}>
                    人數
                  </Text>
                  <TextInput
                    style={[styles.transportInputField, { backgroundColor: theme.card, color: theme.text }]}
                    placeholder="輸入人數..."
                    placeholderTextColor={theme.secondaryText}
                    value={peopleCount}
                    onChangeText={setPeopleCount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            {/* 只在拍攝階段的交通類別中顯示設備重量部分 */}
            {stage === 'production' && categoryId === 'prod-1' && (
              <View style={styles.transportSection}>
                <Text style={[styles.transportSectionTitle, { color: theme.text }]}>
                  設備重量
                </Text>
                
                {selectedEquipmentItems.length > 0 ? (
                  <View style={[styles.equipmentWeightCard, { backgroundColor: theme.card }]}>
                    <View style={styles.equipmentWeightHeader}>
                      <Weight size={18} color={theme.primary} />
                      <Text style={[styles.equipmentWeightTitle, { color: theme.text }]}>
                        已選擇的設備 ({selectedEquipmentItems.length.toString()})
                      </Text>
                    </View>
                    
                    <FlatList
                      data={selectedEquipmentItems}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <View style={[styles.equipmentWeightItem, { borderBottomColor: theme.border }]}>
                          <Text style={[styles.equipmentWeightName, { color: theme.text }]}>
                            {item.equipment.name} × {item.quantity}
                          </Text>
                          {'weight' in item.equipment && item.equipment.weight ? (
                            <Text style={[styles.equipmentWeightValue, { color: theme.primary }]}>
                              {(item.equipment.weight * item.quantity).toFixed(1)} 公斤
                            </Text>
                          ) : (
                            <Text style={[styles.equipmentWeightValue, { color: theme.secondaryText }]}>
                              無重量數據
                            </Text>
                          )}
                        </View>
                      )}
                      style={styles.equipmentWeightList}
                    />
                    
                    <View style={styles.equipmentWeightTotal}>
                      <Text style={[styles.equipmentWeightTotalLabel, { color: theme.text }]}>
                        總重量:
                      </Text>
                      <Text style={[styles.equipmentWeightTotalValue, { color: theme.primary }]}>
                        {calculateTotalEquipmentWeight(selectedEquipmentItems).toFixed(1)} 公斤
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.noEquipmentCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.noEquipmentText, { color: theme.secondaryText }]}>
                      尚未選擇任何設備
                    </Text>
                    <TouchableOpacity
                      style={[styles.selectEquipmentButton, { backgroundColor: theme.primary + '20' }]}
                      onPress={() => {
                        setShowTransportCalculator(false);
                        // 將這裡改為明確設置為攝影設備類別
                        const tempCategory = 'prod-2';
                        setCurrentEquipmentCategory(tempCategory);
                        setMultipleEquipmentMode(true);
                        setShowMultipleEquipmentSelector(true);
                        console.log('切換到設備選擇器，使用類別:', tempCategory);
                      }}
                    >
                      <Plus size={16} color={theme.primary} />
                      <Text style={[styles.selectEquipmentButtonText, { color: theme.primary }]}>
                        選擇設備
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            
            {transportError ? (
              <Text style={[styles.errorText, { color: theme.error }]}>{transportError}</Text>
            ) : null}
            
            <View style={styles.transportInfo}>
              <Info size={16} color={theme.secondary} />
              <Text style={[styles.transportInfoText, { color: theme.secondary }]}>
                {stage === 'production' && currentEquipmentCategory === 'prod-1' 
                  ? "交通碳排放計算會考慮行駛距離、人數和設備重量，提供更準確的排放估算。"
                  : "交通碳排放計算會考慮行駛距離和人數，提供更準確的排放估算。"}
              </Text>
            </View>
          </ScrollView>
          
          <View style={[styles.transportCalculatorFooter, { borderTopColor: theme.border }]}>
            <Button
              title="計算碳排放量"
              onPress={calculateTransportEmissions}
              variant="primary"
              loading={isCalculating}
              style={styles.transportCalculateButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
  
  // 添加處理設備掃描結果的方法
  const handleEquipmentDetected = (equipment: EquipmentType, confidence: number) => {
    console.log('Detected equipment:', equipment, 'with confidence:', confidence);
    
    // 關閉掃描器
    setShowARScanner(false);
    
    // 設置選中的設備
    setSelectedEquipment(equipment);
    
    // 自動設置相關類別
    if ('powerConsumption' in equipment) {
      // 根據設備類型設置相應的類別
      const equipType = equipment.type || '';
      if (equipType.includes('camera')) {
        setCurrentEquipmentCategory('prod-2');
      } else if (equipType.includes('led') || equipType.includes('hmi') || equipType.includes('tungsten')) {
        setCurrentEquipmentCategory('prod-7');
      } else if (equipType.includes('laptop') || equipType.includes('workstation')) {
        setCurrentEquipmentCategory('post-1');
      }
    }
    
    // 顯示設備選擇器以便輸入時間或數量
    setShowEquipmentSelector(true);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <Header 
          title={`${CREW_DEPARTMENTS[selectedCrew]?.name || '拍攝組別'} - 排放記錄`}
          showBackButton={true}
          onBackPress={() => router.back()} 
        />
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 組別選擇 */}
          {renderCrewSection()}
          
          {/* 快速輸入 */}
          {renderQuickInputSection()}
          
          {/* 詳細模式 */}
          {!quickInputMode && (
            <>
              {/* 類別選擇 */}
              {renderCategorySection()}
              
              {/* 描述輸入 */}
              {renderDescriptionSection()}
              
              {/* 排放源選擇 */}
              {renderSourceSection()}
            </>
          )}
          
          {/* 計算結果 */}
          {renderCalculationResult()}
          
          {/* 詳細信息 */}
          {renderDetailsSection()}
          
          {/* 保存記錄 */}
          <Button
            title="儲存記錄"
            onPress={saveRecord}
            variant="primary"
            loading={isSaving}
            disabled={!calculatedAmount}
            style={styles.saveButton}
          />
        </ScrollView>
        
        {/* 設備選擇器 */}
        {renderEquipmentSelector()}
        
        {/* 多設備選擇器 */}
        {renderMultipleEquipmentSelector()}
        
        {/* 交通計算器 */}
        {renderTransportCalculator()}
        
        {/* AR掃描器 */}
        {showARScanner && (
          <ARScanner 
            onClose={() => setShowARScanner(false)}
            onEquipmentDetected={handleEquipmentDetected}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  stageButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    minWidth: 90,
  },
  selectedStageButton: {
    borderColor: 'transparent',
  },
  stageButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  categoryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectedCategoryCard: {
    borderWidth: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // 新的排放源列表容器
  sourcesWrapper: {
    width: '100%',
  },
  sourcesList: {
    width: '100%',
    maxHeight: 300, // 限制高度，確保可以滾動
  },
  sourcesListContent: {
    paddingBottom: 8,
    width: '100%',
  },
  sourceCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '100%', // 確保卡片佔據整個寬度
  },
  selectedSourceCard: {
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%', // 確保標題行佔據整個寬度
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  sourceEmissionFactor: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 12,
  },
  quantityContainer: {
    marginTop: 8,
    width: '100%', // 確保數量容器佔據整個寬度
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // 確保輸入容器佔據整個寬度
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  calculateButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resultContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultNote: {
    fontSize: 12,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  datePickerField: {
    height: 48,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  emptySourcesContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptySourcesText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  selectCategoryText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  equipmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    paddingRight: 8,
    borderRadius: 8,
    minWidth: 200,
    position: 'relative',
  },
  equipmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  typeFiltersContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  typeFilterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  typeFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  equipmentList: {
    padding: 16,
    paddingTop: 0,
  },
  equipmentItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedEquipmentItem: {
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  equipmentItemContent: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  equipmentTypeChip: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  equipmentTypeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  equipmentDetails: {
    marginTop: 4,
  },
  equipmentDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  equipmentEmissionFactor: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  selectedCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEquipmentList: {
    alignItems: 'center',
    padding: 24,
  },
  emptyEquipmentText: {
    fontSize: 14,
    textAlign: 'center',
  },
  equipmentInputSection: {
    padding: 16,
    borderTopWidth: 1,
  },
  equipmentInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  equipmentInputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  // 多設備選擇器樣式
  multiEquipmentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  selectedEquipmentList: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  selectedEquipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedEquipmentListContent: {
    maxHeight: 150,
  },
  selectedEquipmentInfo: {
    flex: 1,
  },
  selectedEquipmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedEquipmentQuantity: {
    fontSize: 12,
  },
  removeEquipmentButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptySelectedEquipment: {
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
  totalWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalWeightText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  equipmentSelectorDivider: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  availableEquipmentList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  availableEquipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  multiInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  multiInputColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  multiButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addToListButton: {
    flex: 1,
    marginRight: 8,
  },
  calculateMultiButton: {
    flex: 1,
    marginLeft: 8,
  },
  // 交通計算器樣式
  transportCalculatorContent: {
    flex: 1,
    padding: 16,
  },
  transportSection: {
    marginBottom: 20,
  },
  transportSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  transportList: {
    paddingBottom: 8,
  },
  transportItem: {
    width: 250,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
  },
  selectedTransportItem: {
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  transportItemContent: {
    flex: 1,
  },
  transportName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  transportDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  transportTypeChip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  transportTypeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  transportSpecs: {
    marginBottom: 8,
  },
  transportSpec: {
    fontSize: 12,
    marginBottom: 2,
  },
  transportEmissionFactor: {
    fontSize: 12,
    fontWeight: '500',
  },
  transportInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transportInputColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  transportInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  transportInputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  equipmentWeightCard: {
    borderRadius: 8,
    padding: 12,
  },
  equipmentWeightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  equipmentWeightTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  equipmentWeightList: {
    maxHeight: 150,
  },
  equipmentWeightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  equipmentWeightName: {
    fontSize: 14,
    flex: 1,
  },
  equipmentWeightValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  equipmentWeightTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  equipmentWeightTotalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  equipmentWeightTotalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  noEquipmentCard: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  noEquipmentText: {
    fontSize: 14,
    marginBottom: 12,
  },
  selectEquipmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectEquipmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  transportInfo: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  transportInfoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  transportCalculatorFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  transportCalculateButton: {
    width: '100%',
  },
  sourceActions: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 8,
  },
  scanIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceList: {
    width: '100%',
    marginBottom: 16
  },
  // 組別選擇樣式
  crewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  crewCard: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 10,
    position: 'relative',
  },
  selectedCrewCard: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  crewIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  crewName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 13,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stageInfo: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  stageInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  stageInfoDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  // 快速輸入樣式
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickInputDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  quickOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickOptionCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  quickOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickOptionValue: {
    fontSize: 12,
  },
});