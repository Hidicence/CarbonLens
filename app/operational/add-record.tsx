import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  FlatList,
  Modal,
  Dimensions,
  Animated,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Save,
  Calendar,
  MapPin,
  FileText,
  Building,
  ChevronDown,
  X,
  Plus,
  Settings,
  Car,
  Zap,
  Users,
  Calculator,
  AlertCircle,
  Upload,
  Award,
  Star,
  Shield,
  CheckCircle,
  Camera,
  Paperclip,
  Brain,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Bot
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { formatEmissions } from '@/utils/helpers';
import { 
  OPERATIONAL_CATEGORIES, 
  OPERATIONAL_SOURCES
} from '@/mocks/projects';
import { 
  NonProjectEmissionRecord, 
  AllocationMethod, 
  AllocationRule 
} from '@/types/project';

const { width } = Dimensions.get('window');

// 數據品質評分系統
export interface DataQualityScore {
  score: number; // 0-100
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  factors: {
    hasDocument: boolean;
    documentType: 'invoice' | 'receipt' | 'report' | 'photo' | 'other' | null;
    completeness: number; // 0-100, 基於填寫的字段完整度
    accuracy: number; // 0-100, 基於數據合理性
    traceability: number; // 0-100, 基於可追溯性
  };
  badge: {
    icon: string;
    color: string;
    animation: boolean;
  };
}

// 證明文件類型
export interface EvidenceDocument {
  id: string;
  type: 'invoice' | 'receipt' | 'report' | 'photo' | 'other';
  uri: string;
  name: string;
  size?: number;
  uploadDate: Date;
  verified: boolean;
  aiAnalysis?: AIAnalysisResult;
}

// AI 文件識別結果類型
export interface AIAnalysisResult {
  documentType: 'invoice' | 'receipt' | 'report' | 'photo' | 'unknown';
  confidence: number; // 0-100
  extractedData: {
    quantity?: number;
    unit?: string;
    amount?: number;
    date?: string;
    description?: string;
    vehicleInfo?: {
      licensePlate?: string;
      fuelType?: string;
      mileage?: number;
    };
    refrigerantInfo?: {
      type?: string;
      weight?: number;
      reason?: string;
    };
    electricityInfo?: {
      kwh?: number;
      address?: string;
      period?: string;
    };
  };
  suggestedCategory?: string;
  suggestedSource?: string;
  validationStatus: 'valid' | 'invalid' | 'needs_review';
  issues: string[];
}

// AI 處理狀態
interface AIProcessingState {
  isProcessing: boolean;
  stage: 'uploading' | 'ocr' | 'analysis' | 'validation' | 'completed';
  progress: number;
  result?: AIAnalysisResult;
}

// 數據品質評分算法
const calculateDataQuality = (
  formData: any,
  vehicleFields: any,
  electricityFields: any,
  documents: EvidenceDocument[]
): DataQualityScore => {
  let score = 0;
  
  // 基礎完整度評分 (40分)
  const requiredFields = ['categoryId', 'sourceId', 'quantity', 'description', 'date'];
  const filledRequired = requiredFields.filter(field => formData[field] && formData[field] !== '').length;
  const completenessScore = (filledRequired / requiredFields.length) * 40;
  score += completenessScore;
  
  // 額外詳細資訊評分 (20分)
  const optionalFields = ['location', 'notes'];
  const filledOptional = optionalFields.filter(field => formData[field] && formData[field] !== '').length;
  score += (filledOptional / optionalFields.length) * 20;
  
  // 專業字段評分 (20分)
  if (formData.categoryId === 'scope1-vehicles' && vehicleFields.vehicleType && vehicleFields.fuelEfficiency) {
    score += 20;
  } else if (formData.categoryId === 'scope2-electricity' && electricityFields.address && electricityFields.kwhUsage) {
    score += 20;
  } else if (formData.categoryId.startsWith('scope3') && formData.notes) {
    score += 15;
  }
  
  // 證明文件評分 (20分)
  if (documents.length > 0) {
    const primaryDoc = documents[0];
    let docScore = 10; // 基礎文件分數
    
    // 根據文件類型給分
    switch (primaryDoc.type) {
      case 'invoice':
        docScore += 10; // 發票最高分
        break;
      case 'receipt':
        docScore += 8;
        break;
      case 'report':
        docScore += 7;
        break;
      case 'photo':
        docScore += 5;
        break;
      default:
        docScore += 3;
    }
    
    score += Math.min(docScore, 20);
  }
  
  // 確保分數在 0-100 範圍
  score = Math.min(Math.max(score, 0), 100);
  
  // 確定等級
  let level: 'bronze' | 'silver' | 'gold' | 'platinum';
  let badgeColor: string;
  let badgeIcon: string;
  
  if (score >= 90) {
    level = 'platinum';
    badgeColor = '#E5E7EB'; // 鉑金色
    badgeIcon = 'shield';
  } else if (score >= 75) {
    level = 'gold';
    badgeColor = '#FCD34D'; // 金色
    badgeIcon = 'award';
  } else if (score >= 60) {
    level = 'silver';
    badgeColor = '#9CA3AF'; // 銀色
    badgeIcon = 'star';
  } else {
    level = 'bronze';
    badgeColor = '#F59E0B'; // 銅色
    badgeIcon = 'check-circle';
  }
  
  return {
    score: Math.round(score),
    level,
    factors: {
      hasDocument: documents.length > 0,
      documentType: documents.length > 0 ? documents[0].type : null,
      completeness: Math.round(completenessScore / 40 * 100),
      accuracy: Math.round((score - completenessScore) / 60 * 100),
      traceability: documents.length > 0 ? 100 : 0
    },
    badge: {
      icon: badgeIcon,
      color: badgeColor,
      animation: score >= 75
    }
  };
};

// 數據品質徽章組件
const DataQualityBadge: React.FC<{
  quality: DataQualityScore;
  animated?: boolean;
  theme: any;
}> = ({ quality, animated = true, theme }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (animated && quality.badge.animation) {
      // 脈衝動畫
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      
      // 旋轉動畫（鉑金徽章）
      const rotate = quality.level === 'platinum' ? Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ) : null;
      
      pulse.start();
      rotate?.start();
      
      return () => {
        pulse.stop();
        rotate?.stop();
      };
    }
  }, [quality.level, animated]);
  
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const IconComponent = quality.badge.icon === 'shield' ? Shield :
                       quality.badge.icon === 'award' ? Award :
                       quality.badge.icon === 'star' ? Star : CheckCircle;
  
  return (
    <View style={[styles.qualityBadgeContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Animated.View 
        style={[
          styles.qualityBadge,
          { 
            transform: [
              { scale: pulseAnim },
              ...(quality.level === 'platinum' ? [{ rotate: rotateInterpolate }] : [])
            ]
          }
        ]}
      >
        <LinearGradient
          colors={[
            quality.badge.color,
            quality.level === 'platinum' ? '#F8FAFC' :
            quality.level === 'gold' ? '#FFFBEB' :
            quality.level === 'silver' ? '#F8FAFC' : '#FEF3C7'
          ]}
          style={styles.badgeGradient}
        >
          <IconComponent size={18} color="#374151" />
          <Text style={[styles.badgeScore, { color: theme.text }]}>{quality.score}</Text>
        </LinearGradient>
      </Animated.View>
      
      <View style={styles.qualityInfo}>
        <Text style={[styles.qualityLevel, { color: theme.text }]}>
          {quality.level === 'platinum' ? '🏆 鉑金認證' :
           quality.level === 'gold' ? '🥇 黃金認證' :
           quality.level === 'silver' ? '🥈 白銀認證' : '🥉 銅級認證'}
        </Text>
        <Text style={[styles.qualityDescription, { color: theme.secondaryText }]}>
          資料可信度 {quality.score}% • {quality.factors.hasDocument ? '已附證明文件' : '建議上傳證明文件'}
        </Text>
      </View>
    </View>
  );
};

// 文件上傳組件
const DocumentUploader: React.FC<{
  documents: EvidenceDocument[];
  onDocumentsChange: (docs: EvidenceDocument[]) => void;
  theme: any;
  onAIAnalysis: (doc: EvidenceDocument) => Promise<void>;
  aiProcessing: AIProcessingState;
}> = ({ documents, onDocumentsChange, theme, onAIAnalysis, aiProcessing }) => {
  const [uploading, setUploading] = useState(false);
  
  const pickDocument = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newDoc: EvidenceDocument = {
          id: Date.now().toString(),
          type: determineDocumentType(asset.name),
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          uploadDate: new Date(),
          verified: false
        };
        
        // 先添加文件到列表
        onDocumentsChange([...documents, newDoc]);
        
        // 啟動 AI 分析
        console.log('開始AI分析(文件):', newDoc.name);
        await onAIAnalysis(newDoc);
        console.log('AI分析調用完成(文件)');
      }
    } catch (error) {
      console.error('文件上傳錯誤:', error);
      Alert.alert('錯誤', '文件上傳失敗: ' + (error instanceof Error ? error.message : '未知錯誤'));
    } finally {
      setUploading(false);
    }
  };
  
  const pickImage = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newDoc: EvidenceDocument = {
          id: Date.now().toString(),
          type: 'photo',
          uri: asset.uri,
          name: `照片_${new Date().toISOString().split('T')[0]}.jpg`,
          uploadDate: new Date(),
          verified: false
        };
        
        // 先添加文件到列表
        onDocumentsChange([...documents, newDoc]);
        
        // 啟動 AI 分析
        console.log('開始AI分析(照片):', newDoc.name);
        await onAIAnalysis(newDoc);
        console.log('AI分析調用完成(照片)');
      }
    } catch (error) {
      console.error('照片上傳錯誤:', error);
      Alert.alert('錯誤', '照片上傳失敗: ' + (error instanceof Error ? error.message : '未知錯誤'));
    } finally {
      setUploading(false);
    }
  };
  
  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };
  
  const getDocumentIcon = (type: EvidenceDocument['type']) => {
    switch (type) {
      case 'invoice': return '🧾';
      case 'receipt': return '🧾';
      case 'report': return '📄';
      case 'photo': return '📷';
      default: return '📎';
    }
  };
  
  return (
    <View style={[styles.documentUploader, { backgroundColor: theme.background, borderColor: theme.border }]}>
      {/* 上傳提示 */}
      <View style={styles.uploaderHeader}>
        <View style={[styles.uploaderIconContainer, { backgroundColor: theme.primary + '15' }]}>
          <Upload size={20} color={theme.primary} />
        </View>
        <View style={styles.uploaderHeaderText}>
          <Text style={[styles.uploaderTitle, { color: theme.text }]}>
            證明文件上傳
          </Text>
          <Text style={[styles.uploaderDescription, { color: theme.secondaryText }]}>
            上傳相關證明文件可大幅提升資料可信度評分
          </Text>
        </View>
      </View>
      
      {/* 上傳按鈕區域 */}
      <View style={styles.uploadActions}>
        <TouchableOpacity 
          style={[
            styles.uploadButton,
            { 
              backgroundColor: theme.background,
              borderColor: theme.primary,
              opacity: uploading ? 0.7 : 1 
            }
          ]}
          onPress={pickDocument}
          disabled={uploading}
        >
          <Paperclip size={18} color={theme.primary} />
          <Text style={[styles.uploadButtonText, { color: theme.primary }]}>選擇文件</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.uploadButton,
            { 
              backgroundColor: theme.background,
              borderColor: theme.primary,
              opacity: uploading ? 0.7 : 1 
            }
          ]}
          onPress={pickImage}
          disabled={uploading}
        >
          <Camera size={18} color={theme.primary} />
          <Text style={[styles.uploadButtonText, { color: theme.primary }]}>拍照上傳</Text>
        </TouchableOpacity>
      </View>
      
      {/* 上傳進度提示 */}
      {uploading && (
        <View style={[styles.uploadingIndicator, { backgroundColor: theme.primary + '10' }]}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.uploadingText, { color: theme.primary }]}>正在上傳...</Text>
        </View>
      )}
      
      {/* AI 分析進度 */}
      {aiProcessing.isProcessing && (
        <View style={[styles.aiProcessingContainer, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <View style={styles.aiProcessingHeader}>
            <Brain size={20} color={theme.primary} />
            <Text style={[styles.aiProcessingTitle, { color: theme.primary }]}>
              AI 智慧分析中...
            </Text>
          </View>
          
          <Text style={[styles.aiProcessingStage, { color: theme.text }]}>
            {aiProcessing.stage === 'uploading' ? '📤 正在上傳文件...' :
             aiProcessing.stage === 'ocr' ? '👁️ 正在識別文字...' :
             aiProcessing.stage === 'analysis' ? '🤖 AI 正在分析內容...' :
             aiProcessing.stage === 'validation' ? '✅ 正在驗證數據...' : '🎉 分析完成！'}
          </Text>
          
          <View style={[styles.aiProgressBar, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.aiProgressFill,
                { 
                  backgroundColor: theme.primary,
                  width: `${aiProcessing.progress}%`
                }
              ]} 
            />
          </View>
          
          <Text style={[styles.aiProgressText, { color: theme.secondaryText }]}>
            {Math.round(aiProcessing.progress)}% 完成
          </Text>
        </View>
      )}
      
      {/* 已上傳文件列表 */}
      {documents.length > 0 && (
        <View style={styles.documentsSection}>
          <Text style={[styles.documentsSectionTitle, { color: theme.text }]}>
            已上傳文件 ({documents.length})
          </Text>
          {documents.map((doc, index) => (
            <View key={doc.id} style={[styles.documentItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.documentIconContainer}>
                <Text style={styles.documentIcon}>{getDocumentIcon(doc.type)}</Text>
              </View>
              <View style={styles.documentInfo}>
                <Text style={[styles.documentName, { color: theme.text }]} numberOfLines={1}>
                  {doc.name}
                </Text>
                <View style={styles.documentMeta}>
                  <Text style={[styles.documentType, { color: theme.primary }]}>
                    {getDocumentTypeLabel(doc.type)}
                  </Text>
                  <Text style={[styles.documentSize, { color: theme.secondaryText }]}>
                    {formatFileSize(doc.size)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => removeDocument(doc.id)}
                style={[styles.removeButton, { backgroundColor: theme.background }]}
              >
                <X size={16} color={theme.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* 空狀態提示 */}
      {documents.length === 0 && (
        <View style={styles.emptyDocuments}>
          <Text style={[styles.emptyDocumentsText, { color: theme.secondaryText }]}>
            📋 尚未上傳任何證明文件
          </Text>
          <Text style={[styles.emptyDocumentsHint, { color: theme.secondaryText }]}>
            建議上傳發票或收據以獲得最高評分
          </Text>
        </View>
      )}
    </View>
  );
};

// 輔助函數
const determineDocumentType = (filename: string): EvidenceDocument['type'] => {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'pdf' && filename.includes('發票')) return 'invoice';
  if (ext === 'pdf' || filename.includes('報告')) return 'report';
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'photo';
  if (filename.includes('收據')) return 'receipt';
  return 'other';
};

const getDocumentTypeLabel = (type: EvidenceDocument['type']): string => {
  switch (type) {
    case 'invoice': return '發票';
    case 'receipt': return '收據';
    case 'report': return '報告';
    case 'photo': return '照片';
    default: return '其他文件';
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// 模擬 AI 文件識別 API
const analyzeDocumentWithAI = async (
  documentUri: string, 
  documentType: string,
  documentName: string
): Promise<AIAnalysisResult> => {
  console.log('AI分析開始:', { documentUri, documentType, documentName });
  // 模擬 AI 處理延遲
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('AI分析處理完成，準備返回結果');
  
  // 根據文件類型和名稱模擬不同的識別結果
  if (documentName.includes('加油') || documentName.includes('油單') || documentType === 'receipt') {
    return {
      documentType: 'receipt',
      confidence: 92,
      extractedData: {
        quantity: 45.5,
        unit: '公升',
        amount: 1820,
        date: '2024-06-10',
        description: '中油自助加油站 - 95無鉛汽油',
        vehicleInfo: {
          licensePlate: 'ABC-1234',
          fuelType: 'gasoline'
        }
      },
      suggestedCategory: 'scope1-vehicles',
      suggestedSource: 'company-car-gasoline',
      validationStatus: 'valid',
      issues: []
    };
  } else if (documentName.includes('冷媒') || documentName.includes('檢測')) {
    return {
      documentType: 'report',
      confidence: 87,
      extractedData: {
        quantity: 2.5,
        unit: '公斤',
        date: '2024-06-08',
        description: '冷氣機冷媒補充作業',
        refrigerantInfo: {
          type: 'R-410A',
          weight: 2.5,
          reason: '例行保養補充'
        }
      },
      suggestedCategory: 'scope1-refrigerant',
      suggestedSource: 'refrigerant-r410a',
      validationStatus: 'needs_review',
      issues: ['建議確認冷媒逸散原因是否為正常損耗', '請核實冷媒類型和重量數據']
    };
  } else if (documentName.includes('電費') || documentName.includes('台電')) {
    return {
      documentType: 'invoice',
      confidence: 95,
      extractedData: {
        quantity: 2450,
        unit: '度',
        amount: 8820,
        date: '2024-06-01',
        description: '台電公司 - 6月份電費',
        electricityInfo: {
          kwh: 2450,
          address: '台北市信義區信義路五號',
          period: '2024/05/01-2024/05/31'
        }
      },
      suggestedCategory: 'scope2-electricity',
      suggestedSource: 'electricity-taipower',
      validationStatus: 'valid',
      issues: []
    };
  }
  
  return {
    documentType: 'unknown',
    confidence: 45,
    extractedData: {},
    validationStatus: 'invalid',
    issues: ['無法識別文件內容，建議重新上傳清晰照片或手動輸入數據']
  };
};

// 新手指導內容
const HELP_CONTENT = {
  category: {
    title: "什麼是排放類別？",
    content: "排放類別按照國際標準分為三個範疇：\n• 範疇1：公司直接產生的排放（如公司車輛用油）\n• 範疇2：購買能源產生的排放（如辦公室用電）\n• 範疇3：其他間接排放（如員工通勤、廢棄物）",
    examples: ["辦公室用電 → 範疇2", "公司車輛加油 → 範疇1", "員工搭車通勤 → 範疇3"]
  },
  source: {
    title: "如何選擇排放源？",
    content: "排放源是具體產生碳排放的活動來源，每個類別下有不同的排放源選項。",
    examples: ["用電：選擇'電力消耗'", "開車：選擇對應的車輛類型", "搭飛機：選擇'航空運輸'"]
  },
  quantity: {
    title: "數量要怎麼填？",
    content: "根據選擇的排放源，輸入對應的數值和單位：",
    examples: ["用電：輸入'度數'(kWh)", "開車：輸入'公里數'(km)", "用油：輸入'公升數'(L)"]
  },
  description: {
    title: "活動描述怎麼寫？",
    content: "簡單描述這次活動的內容，幫助日後查詢和管理。",
    examples: ["辦公室12月用電費", "業務拜訪台中客戶", "員工教育訓練餐飲"]
  },
  allocation: {
    title: "分攤是什麼意思？",
    content: "將這筆營運排放分配到相關專案中，可以更準確地計算每個專案的碳足跡。",
    examples: ["辦公室電費分攤到所有進行中專案", "特定出差只分攤到相關專案"]
  }
};

// 車輛相關的額外字段
interface VehicleFields {
  vehicleType: string;
  mileage: string;
  fuelType: 'gasoline' | 'diesel';
  fuelEfficiency: string; // L/100km
}

// 電費相關的額外字段
interface ElectricityFields {
  address: string;
  kwhUsage: string;
  billAttachment?: string;
  isShared: boolean;
  sharedPercentage: string;
}

export default function AddOperationalRecordScreen() {
  const router = useRouter();
  const { addNonProjectEmissionRecord, projects } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  // 動畫相關
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // 表單狀態
  const [formData, setFormData] = useState({
    categoryId: '',
    sourceId: '',
    description: '',
    quantity: '',
    amount: '',
    date: new Date(),
    location: '',
    notes: '',
    isAllocated: false,
    allocationMethod: 'budget' as AllocationMethod,
    customPercentages: {} as { [projectId: string]: number },
    targetProjects: [] as string[]
  });
  
  // 車輛和電費的額外字段
  const [vehicleFields, setVehicleFields] = useState<VehicleFields>({
    vehicleType: '',
    mileage: '',
    fuelType: 'gasoline',
    fuelEfficiency: '8.0' // 預設值
  });
  
  const [electricityFields, setElectricityFields] = useState<ElectricityFields>({
    address: '',
    kwhUsage: '',
    billAttachment: '',
    isShared: false,
    sharedPercentage: '100'
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [helpMode, setHelpMode] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // 數據品質相關狀態
  const [documents, setDocuments] = useState<EvidenceDocument[]>([]);
  const [showQualityDetails, setShowQualityDetails] = useState(false);
  
  // AI 分析相關狀態
  const [aiProcessing, setAiProcessing] = useState<AIProcessingState>({
    isProcessing: false,
    stage: 'uploading',
    progress: 0
  });
  const [showAiResult, setShowAiResult] = useState(false);
  const [showAiAlert, setShowAiAlert] = useState(false);
  const [currentAiResult, setCurrentAiResult] = useState<AIAnalysisResult | null>(null);

  // AI結果自動填表函數
  const applyAIResultToForm = (result: AIAnalysisResult) => {
    try {
      // 更新基本表單數據
      setFormData(prev => ({
        ...prev,
        // 自動設置類別
        categoryId: result.suggestedCategory || prev.categoryId,
        // 自動設置排放源
        sourceId: result.suggestedSource || prev.sourceId,
        // 更新描述
        description: result.extractedData.description || prev.description,
        // 更新數量
        quantity: result.extractedData.quantity?.toString() || prev.quantity,
        // 更新金額
        amount: result.extractedData.amount?.toString() || prev.amount,
        // 更新日期
        date: result.extractedData.date ? new Date(result.extractedData.date) : prev.date
      }));

      // 根據文件類型更新特定字段
      if (result.extractedData.vehicleInfo) {
        setVehicleFields(prev => ({
          ...prev,
          fuelType: result.extractedData.vehicleInfo?.fuelType === 'gasoline' ? 'gasoline' : 'diesel',
          mileage: result.extractedData.vehicleInfo?.mileage?.toString() || prev.mileage,
          vehicleType: result.extractedData.vehicleInfo?.licensePlate || prev.vehicleType
        }));
      }

      if (result.extractedData.electricityInfo) {
        setElectricityFields(prev => ({
          ...prev,
          address: result.extractedData.electricityInfo?.address || prev.address,
          kwhUsage: result.extractedData.electricityInfo?.kwh?.toString() || prev.kwhUsage
        }));
      }

      // 顯示成功提示
      Alert.alert(
        '✅ 自動填表完成',
        '已根據AI分析結果自動填入相關欄位，請檢查並確認數據正確性。',
        [{ text: '確定' }]
      );

      // 如果有驗證問題，額外提醒
      if (result.validationStatus === 'needs_review' && result.issues.length > 0) {
        setTimeout(() => {
          Alert.alert(
            '⚠️ 需要人工確認',
            `AI檢測到以下問題，請務必核實：\n\n${result.issues.join('\n')}`,
            [{ text: '了解' }]
          );
        }, 1000);
      }

    } catch (error) {
      Alert.alert('填表失敗', '自動填表時發生錯誤，請手動輸入數據。');
    }
  };
  
  // 獲取選中的類別和排放源
  const selectedCategory = OPERATIONAL_CATEGORIES.find(cat => cat.id === formData.categoryId);
  const availableSources = OPERATIONAL_SOURCES.filter(source => 
    source.categoryId === formData.categoryId
  );
  const selectedSource = availableSources.find(source => source.id === formData.sourceId);
  
  // 進行中的專案
  const activeProjects = projects.filter(p => p.status === 'active');
  
  // 檢查是否為特殊類別
  const isVehicleCategory = formData.categoryId === 'scope1-vehicles';
  const isElectricityCategory = formData.categoryId === 'scope2-electricity';
  
  // 計算數據品質評分
  const dataQuality = React.useMemo(() => {
    return calculateDataQuality(formData, vehicleFields, electricityFields, documents);
  }, [formData, vehicleFields, electricityFields, documents]);
  
  // 頁面加載動畫
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // 自動計算排放量
  React.useEffect(() => {
    if (selectedSource && formData.quantity) {
      const quantity = parseFloat(formData.quantity);
      if (!isNaN(quantity) && quantity > 0) {
        const amount = quantity * selectedSource.emissionFactor;
        setFormData(prev => ({ ...prev, amount: amount.toFixed(3) }));
        
        // 添加計算完成的動畫
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      } else {
        setFormData(prev => ({ ...prev, amount: '' }));
      }
    }
  }, [selectedSource, formData.quantity]);
  
  // 初始化目標專案（全選）
  React.useEffect(() => {
    if (formData.isAllocated && formData.targetProjects.length === 0) {
      setFormData(prev => ({
        ...prev,
        targetProjects: activeProjects.map(p => p.id)
      }));
    }
  }, [formData.isAllocated, activeProjects]);

  // 計算表單完成度
  const calculateProgress = () => {
    let completedFields = 0;
    const totalFields = 6; // 類別、排放源、描述、數量、日期、分攤設定
    
    if (formData.categoryId) completedFields++;
    if (formData.sourceId) completedFields++;
    if (formData.description.trim()) completedFields++;
    if (formData.quantity) completedFields++;
    if (formData.date) completedFields++;
    if (!formData.isAllocated || formData.targetProjects.length > 0) completedFields++;
    
    return completedFields / totalFields;
  };

  // 更新進度動畫
  React.useEffect(() => {
    const progress = calculateProgress();
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [formData]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.categoryId) newErrors.categoryId = '請選擇排放類別';
    if (!formData.sourceId) newErrors.sourceId = '請選擇排放源';
    if (!formData.description.trim()) newErrors.description = '請輸入活動描述';
    if (!formData.quantity) newErrors.quantity = '請輸入數量';
    if (!formData.amount) newErrors.amount = '請確保排放量已計算';
    
    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = '請輸入有效的正數';
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = '請確保排放量大於0';
    }
    
    // 分攤驗證
    if (formData.isAllocated) {
      if (formData.targetProjects.length === 0) {
        newErrors.targetProjects = '請選擇至少一個專案進行分攤';
      }
      
      if (formData.allocationMethod === 'custom') {
        const totalPercentage = Object.values(formData.customPercentages).reduce((sum, p) => sum + p, 0);
        if (Math.abs(totalPercentage - 100) > 0.1) {
          newErrors.customPercentages = '自訂分攤比例總和必須為100%';
        }
      }
      
      if (formData.allocationMethod === 'budget') {
        const targetBudgetSum = activeProjects
          .filter(p => formData.targetProjects.includes(p.id))
          .reduce((sum, p) => sum + (p.budget || 0), 0);
        if (targetBudgetSum === 0) {
          newErrors.allocationMethod = '選中的專案沒有預算，無法使用預算分攤';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('請檢查表單', '請修正標示的錯誤後再次提交');
      return;
    }

    setIsLoading(true);
    
    try {
      const allocationRule: AllocationRule | undefined = formData.isAllocated ? {
        method: formData.allocationMethod,
        targetProjects: formData.targetProjects,
        customPercentages: formData.allocationMethod === 'custom' ? formData.customPercentages : undefined,
      } : undefined;

      const record: Omit<NonProjectEmissionRecord, 'id'> = {
        categoryId: formData.categoryId,
        sourceId: formData.sourceId,
        description: formData.description,
        quantity: parseFloat(formData.quantity),
        unit: selectedSource?.unit || '',
        amount: parseFloat(formData.amount),
        date: formData.date.toISOString(),
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        isAllocated: formData.isAllocated,
        allocationRule,
        createdAt: new Date().toISOString(),
      };

      await addNonProjectEmissionRecord(record);
      
      Alert.alert('新增成功', '營運記錄已成功新增', [
        { text: '確定', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Save record error:', error);
      Alert.alert('新增失敗', '請稍後重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 處理自訂比例變更
  const handleCustomPercentageChange = (projectId: string, percentage: string) => {
    const value = parseFloat(percentage) || 0;
    setFormData(prev => ({
      ...prev,
      customPercentages: {
        ...prev.customPercentages,
        [projectId]: value
      }
    }));
  };

  // 渲染類別選擇模態框
  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>選擇排放類別</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={OPERATIONAL_CATEGORIES}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  { 
                    backgroundColor: formData.categoryId === item.id ? theme.primary + '20' : 'transparent',
                    borderColor: theme.border
                  }
                ]}
                onPress={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    categoryId: item.id,
                    sourceId: '', // 重置排放源
                    quantity: '',
                    amount: ''
                  }));
                  setShowCategoryModal(false);
                }}
              >
                <View style={styles.categoryOptionContent}>
                  <Text style={[styles.categoryOptionName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                                     <Text style={[styles.categoryOptionDesc, { color: theme.secondaryText }]}>
                     範疇 {item.scope || 'N/A'}
                   </Text>
                </View>
                {formData.categoryId === item.id && (
                  <Settings size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // 渲染排放源選擇模態框
  const renderSourceModal = () => (
    <Modal
      visible={showSourceModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSourceModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>選擇排放源</Text>
            <TouchableOpacity onPress={() => setShowSourceModal(false)}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          {availableSources.length === 0 ? (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color={theme.secondaryText} />
              <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
                請先選擇排放類別
              </Text>
            </View>
          ) : (
            <FlatList
              data={availableSources}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sourceOption,
                    { 
                      backgroundColor: formData.sourceId === item.id ? theme.primary + '20' : 'transparent',
                      borderColor: theme.border
                    }
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      sourceId: item.id,
                      quantity: '',
                      amount: ''
                    }));
                    setShowSourceModal(false);
                  }}
                >
                  <View style={styles.sourceOptionContent}>
                    <Text style={[styles.sourceOptionName, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.sourceOptionDesc, { color: theme.secondaryText }]}>
                      {item.description}
                    </Text>
                    <Text style={[styles.sourceOptionFactor, { color: theme.primary }]}>
                      排放係數: {item.emissionFactor} kg CO₂e/{item.unit}
                    </Text>
                  </View>
                  {formData.sourceId === item.id && (
                    <Settings size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  // 渲染分攤設定模態框
  const renderAllocationModal = () => (
    <Modal
      visible={showAllocationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAllocationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>分攤設定</Text>
            <TouchableOpacity onPress={() => setShowAllocationModal(false)}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* 分攤方式選擇 */}
            <View style={styles.allocationMethodSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>分攤方式</Text>
              {[
                { method: 'budget', title: '預算分攤', desc: '依據專案預算比例分攤' },
                { method: 'equal', title: '平均分攤', desc: '平均分配到所有專案' },
                { method: 'duration', title: '時間分攤', desc: '依據專案執行天數分攤' },
                { method: 'custom', title: '自訂分攤', desc: '手動設定分攤比例' }
              ].map(({ method, title, desc }) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodOption,
                    { 
                      backgroundColor: formData.allocationMethod === method ? theme.primary + '20' : 'transparent',
                      borderColor: theme.border
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, allocationMethod: method as AllocationMethod }))}
                >
                  <View style={styles.methodOptionContent}>
                    <Text style={[styles.methodOptionTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.methodOptionDesc, { color: theme.secondaryText }]}>{desc}</Text>
                  </View>
                  {formData.allocationMethod === method && (
                    <Settings size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* 目標專案選擇 */}
            <View style={styles.targetProjectsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>目標專案</Text>
              {activeProjects.map(project => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectOption,
                    { 
                      backgroundColor: formData.targetProjects.includes(project.id) ? theme.primary + '20' : 'transparent',
                      borderColor: theme.border
                    }
                  ]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      targetProjects: prev.targetProjects.includes(project.id)
                        ? prev.targetProjects.filter(id => id !== project.id)
                        : [...prev.targetProjects, project.id]
                    }));
                  }}
                >
                  <View style={styles.projectOptionContent}>
                    <Text style={[styles.projectOptionName, { color: theme.text }]}>{project.name}</Text>
                    <Text style={[styles.projectOptionDesc, { color: theme.secondaryText }]}>
                      預算: ${project.budget?.toLocaleString() || '未設定'}
                    </Text>
                  </View>
                  {formData.targetProjects.includes(project.id) && (
                    <Settings size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* 自訂比例設定 */}
            {formData.allocationMethod === 'custom' && formData.targetProjects.length > 0 && (
              <View style={styles.customPercentageSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>自訂分攤比例</Text>
                {formData.targetProjects.map(projectId => {
                  const project = activeProjects.find(p => p.id === projectId);
                  if (!project) return null;
                  
                  return (
                    <View key={projectId} style={styles.percentageRow}>
                      <Text style={[styles.percentageLabel, { color: theme.text }]}>
                        {project.name}
                      </Text>
                      <View style={styles.percentageInputContainer}>
                        <TextInput
                          style={[
                            styles.percentageInput,
                            { 
                              backgroundColor: theme.background,
                              color: theme.text,
                              borderColor: theme.border
                            }
                          ]}
                          value={formData.customPercentages[projectId]?.toString() || ''}
                          onChangeText={(text) => handleCustomPercentageChange(projectId, text)}
                          placeholder="0"
                          placeholderTextColor={theme.secondaryText}
                          keyboardType="numeric"
                        />
                        <Text style={[styles.percentageSymbol, { color: theme.secondaryText }]}>%</Text>
                      </View>
                    </View>
                  );
                })}
                <Text style={[styles.percentageTotal, { color: theme.primary }]}>
                  總計: {Object.values(formData.customPercentages).reduce((sum, p) => sum + p, 0).toFixed(1)}%
                </Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="確定"
              onPress={() => setShowAllocationModal(false)}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderHelpModal = () => (
    <Modal
      visible={showHelpModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.helpModalContent, { backgroundColor: theme.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>🌱 新手指南</Text>
            <TouchableOpacity onPress={() => setShowHelpModal(false)}>
              <X size={24} color={theme.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.helpModalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.helpSection}>
              <Text style={[styles.helpSectionTitle, { color: theme.text }]}>📝 如何填寫營運記錄？</Text>
              <Text style={[styles.helpText, { color: theme.secondaryText }]}>
                營運記錄是指公司日常營運中產生的碳排放活動，像是辦公室用電、公司車輛用油、員工差旅等。
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={[styles.helpStepTitle, { color: theme.primary }]}>步驟 1: 選擇排放類別</Text>
              <Text style={[styles.helpText, { color: theme.secondaryText }]}>
                • 範疇1：公司直接控制的排放（如公司車輛）{'\n'}
                • 範疇2：購買能源的排放（如用電、用氣）{'\n'}
                • 範疇3：其他間接排放（如員工通勤、廢棄物）
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={[styles.helpStepTitle, { color: theme.primary }]}>步驟 2: 選擇排放源</Text>
              <Text style={[styles.helpText, { color: theme.secondaryText }]}>
                根據類別選擇具體的排放源，系統會自動提供對應的計算係數。
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={[styles.helpStepTitle, { color: theme.primary }]}>步驟 3: 輸入數量</Text>
              <Text style={[styles.helpText, { color: theme.secondaryText }]}>
                輸入對應單位的數量，例如：{'\n'}
                • 用電：輸入度數 (kWh){'\n'}
                • 開車：輸入公里數 (km){'\n'}
                • 用油：輸入公升數 (L)
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={[styles.helpStepTitle, { color: theme.primary }]}>步驟 4: 填寫描述</Text>
              <Text style={[styles.helpText, { color: theme.secondaryText }]}>
                簡單描述這次活動，例如：「辦公室12月電費」、「出差台中拜訪客戶」等。
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={[styles.helpStepTitle, { color: theme.primary }]}>步驟 5: 分攤設定（可選）</Text>
              <Text style={[styles.helpText, { color: theme.secondaryText }]}>
                可以將這筆排放分攤到相關專案中，有四種分攤方式：{'\n'}
                • 預算分攤：按專案預算比例分配{'\n'}
                • 平均分攤：平均分配給各專案{'\n'}
                • 時長分攤：按專案時間長度分配{'\n'}
                • 自訂分攤：手動設定各專案比例
              </Text>
            </View>

            <View style={[styles.helpTip, { backgroundColor: theme.primary + '10' }]}>
              <Text style={[styles.helpTipTitle, { color: theme.primary }]}>💡 小貼士</Text>
              <Text style={[styles.helpText, { color: theme.secondaryText }]}>
                • 每個字段旁邊的問號圖示可以查看詳細說明{'\n'}
                • 系統會自動計算碳排放量{'\n'}
                • 可以隨時點擊「新手指南」回到這裡
              </Text>
            </View>
          </ScrollView>
          
          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <Button
              title="開始填寫"
              onPress={() => setShowHelpModal(false)}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAIResultModal = () => {
    const latestAIResult = aiProcessing.result;
    if (!latestAIResult) return null;

    const getConfidenceColor = (confidence: number) => {
      if (confidence >= 90) return '#10B981'; // 綠色
      if (confidence >= 70) return '#F59E0B'; // 橙色
      return '#EF4444'; // 紅色
    };

    const getConfidenceText = (confidence: number) => {
      if (confidence >= 90) return '高信度';
      if (confidence >= 70) return '中信度';
      return '低信度';
    };

    return (
      <Modal
        visible={showAiResult}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAiResult(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.helpModalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>🤖 AI 分析結果</Text>
              <TouchableOpacity onPress={() => setShowAiResult(false)}>
                <X size={24} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.helpModalBody} showsVerticalScrollIndicator={false}>
              {/* 信度評分 */}
              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>識別可信度</Text>
                <View style={styles.confidenceContainer}>
                  <View 
                    style={[
                      styles.confidenceBadge, 
                      { backgroundColor: getConfidenceColor(latestAIResult.confidence) }
                    ]}
                  >
                    <Text style={styles.confidenceText}>
                      {latestAIResult.confidence}% {getConfidenceText(latestAIResult.confidence)}
                    </Text>
                  </View>
                  <Text style={[styles.confidenceDescription, { color: theme.secondaryText }]}>
                    {latestAIResult.confidence >= 90 
                      ? '識別結果準確度很高，可以直接使用'
                      : latestAIResult.confidence >= 70
                      ? '識別結果基本準確，建議核對後使用'
                      : '識別結果準確度較低，建議人工確認'
                    }
                  </Text>
                </View>
              </View>

              {/* 識別到的數據 */}
              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>識別到的數據</Text>
                <View style={styles.extractedDataContainer}>
                  {latestAIResult.extractedData.description && (
                    <View style={styles.dataItem}>
                      <Text style={[styles.dataLabel, { color: theme.secondaryText }]}>描述：</Text>
                      <Text style={[styles.dataValue, { color: theme.text }]}>
                        {latestAIResult.extractedData.description}
                      </Text>
                    </View>
                  )}
                  {latestAIResult.extractedData.quantity && (
                    <View style={styles.dataItem}>
                      <Text style={[styles.dataLabel, { color: theme.secondaryText }]}>數量：</Text>
                      <Text style={[styles.dataValue, { color: theme.text }]}>
                        {latestAIResult.extractedData.quantity} {latestAIResult.extractedData.unit || ''}
                      </Text>
                    </View>
                  )}
                  {latestAIResult.extractedData.amount && (
                    <View style={styles.dataItem}>
                      <Text style={[styles.dataLabel, { color: theme.secondaryText }]}>金額：</Text>
                      <Text style={[styles.dataValue, { color: theme.text }]}>
                        NT$ {latestAIResult.extractedData.amount}
                      </Text>
                    </View>
                  )}
                  {latestAIResult.extractedData.date && (
                    <View style={styles.dataItem}>
                      <Text style={[styles.dataLabel, { color: theme.secondaryText }]}>日期：</Text>
                      <Text style={[styles.dataValue, { color: theme.text }]}>
                        {latestAIResult.extractedData.date}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* 建議的分類 */}
              {(latestAIResult.suggestedCategory || latestAIResult.suggestedSource) && (
                <View style={styles.helpSection}>
                  <Text style={[styles.helpSectionTitle, { color: theme.text }]}>建議的分類</Text>
                  {latestAIResult.suggestedCategory && (
                    <View style={styles.dataItem}>
                      <Text style={[styles.dataLabel, { color: theme.secondaryText }]}>排放類別：</Text>
                      <Text style={[styles.dataValue, { color: theme.text }]}>
                        {OPERATIONAL_CATEGORIES.find(c => c.id === latestAIResult.suggestedCategory)?.name || latestAIResult.suggestedCategory}
                      </Text>
                    </View>
                  )}
                  {latestAIResult.suggestedSource && (
                    <View style={styles.dataItem}>
                      <Text style={[styles.dataLabel, { color: theme.secondaryText }]}>排放源：</Text>
                      <Text style={[styles.dataValue, { color: theme.text }]}>
                        {OPERATIONAL_SOURCES.find(s => s.id === latestAIResult.suggestedSource)?.name || latestAIResult.suggestedSource}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* 驗證問題 */}
              {latestAIResult.issues.length > 0 && (
                <View style={styles.helpSection}>
                  <Text style={[styles.helpSectionTitle, { color: theme.text }]}>需要注意的問題</Text>
                  {latestAIResult.issues.map((issue, index) => (
                    <Text key={index} style={[styles.helpText, { color: '#EF4444' }]}>
                      ⚠️ {issue}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* 操作按鈕 */}
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Button
                title="自動填入表單"
                onPress={() => {
                  applyAIResultToForm(latestAIResult);
                  setShowAiResult(false);
                  setCurrentAiResult(null); // 清除當前結果
                }}
                variant="primary"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="關閉"
                onPress={() => setShowAiResult(false)}
                variant="outline"
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAIAlertModal = () => {
    if (!currentAiResult) return null;

    return (
      <Modal
        visible={showAiAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAiAlert(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.helpModalContent, { backgroundColor: theme.card, maxWidth: 400, minWidth: 300 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>🤖 AI 分析完成</Text>
              <TouchableOpacity onPress={() => setShowAiAlert(false)}>
                <X size={24} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.helpModalBody}>
              <Text style={[styles.helpText, { color: theme.text, marginBottom: 16 }]}>
                文件類型: {currentAiResult.documentType}{'\n'}
                可信度: {currentAiResult.confidence}%{'\n'}
                {'\n'}
                識別到的數據:{'\n'}
                {currentAiResult.extractedData.description || '未知'}
                {currentAiResult.extractedData.quantity ? `\n數量: ${currentAiResult.extractedData.quantity} ${currentAiResult.extractedData.unit || ''}` : ''}
                {currentAiResult.extractedData.amount ? `\n金額: NT$ ${currentAiResult.extractedData.amount}` : ''}
              </Text>
            </View>

            <View style={[styles.modalFooter, { borderTopColor: theme.border, flexDirection: 'column', gap: 8 }]}>
              <Button
                title="🚀 自動填入表單"
                onPress={() => {
                  applyAIResultToForm(currentAiResult);
                  setShowAiAlert(false);
                }}
                variant="primary"
                style={{ width: '100%' }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  title="查看詳細"
                  onPress={() => {
                    setShowAiResult(true);
                    setShowAiAlert(false);
                  }}
                  variant="outline"
                  style={{ flex: 1 }}
                />
                <Button
                  title="稍後處理"
                  onPress={() => setShowAiAlert(false)}
                  variant="outline"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
      <Header title="新增營運記錄" showBackButton />
        <TouchableOpacity 
          style={[styles.helpButton, { backgroundColor: theme.primary + '15' }]}
          onPress={() => setShowHelpModal(true)}
        >
          <AlertCircle size={20} color={theme.primary} />
          <Text style={[styles.helpButtonText, { color: theme.primary }]}>新手指南</Text>
        </TouchableOpacity>
      </View>
      
      {/* 動畫進度條 */}
      <View style={[styles.progressContainer, { backgroundColor: theme.card }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.text }]}>表單完成度</Text>
          <Animated.Text style={[styles.progressPercentage, { color: theme.primary }]}>
            {progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            })}
          </Animated.Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <Animated.View 
            style={[
              styles.progressBar,
              { 
                backgroundColor: theme.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })
              }
            ]} 
          />
        </View>
      </View>
      
      <Animated.ScrollView 
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {/* 基本資訊 */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>基本資訊</Text>
            
            {/* 排放類別 */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>
                  排放類別 *
                  {selectedCategory && (
                    <Text style={[styles.fieldBadge, { color: theme.primary, backgroundColor: theme.primary + '20' }]}>
                      {' '}範疇 {selectedCategory.scope}
                    </Text>
                  )}
                </Text>
                <TouchableOpacity 
                  style={styles.helpIcon}
                  onPress={() => {
                    Alert.alert(
                      HELP_CONTENT.category.title,
                      HELP_CONTENT.category.content + '\n\n範例：\n' + HELP_CONTENT.category.examples.join('\n'),
                      [{ text: '了解', style: 'default' }]
                    );
                  }}
                >
                  <AlertCircle size={16} color={theme.secondaryText} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.fieldHint, { color: theme.secondaryText }]}>
                選擇這次活動屬於哪種類型的碳排放
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectField,
                  { 
                    backgroundColor: theme.background,
                    borderColor: errors.categoryId ? theme.error : (selectedCategory ? theme.primary : theme.border),
                    borderWidth: selectedCategory ? 2 : 1
                  }
                ]}
                onPress={() => setShowCategoryModal(true)}
              >
                <View style={styles.selectFieldContent}>
                  {selectedCategory && (
                    <View style={[styles.categoryIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Building size={16} color={theme.primary} />
                    </View>
                  )}
                <Text style={[
                  styles.selectFieldText,
                  { color: selectedCategory ? theme.text : theme.secondaryText }
                ]}>
                  {selectedCategory ? selectedCategory.name : '請選擇排放類別'}
                </Text>
                </View>
                <ChevronDown size={20} color={theme.secondaryText} />
              </TouchableOpacity>
              {errors.categoryId && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.categoryId}</Text>
              )}
            </View>

            {/* 排放源 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>排放源 *</Text>
              <TouchableOpacity
                style={[
                  styles.selectField,
                  { 
                    backgroundColor: theme.background,
                    borderColor: errors.sourceId ? theme.error : theme.border,
                    opacity: !formData.categoryId ? 0.5 : 1
                  }
                ]}
                onPress={() => {
                  if (formData.categoryId) {
                    setShowSourceModal(true);
                  } else {
                    Alert.alert('提示', '請先選擇排放類別');
                  }
                }}
                disabled={!formData.categoryId}
              >
                <Text style={[
                  styles.selectFieldText,
                  { color: selectedSource ? theme.text : theme.secondaryText }
                ]}>
                  {selectedSource ? selectedSource.name : '請選擇排放源'}
                </Text>
                <ChevronDown size={20} color={theme.secondaryText} />
              </TouchableOpacity>
              {errors.sourceId && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.sourceId}</Text>
              )}
            </View>

            {/* 活動描述 */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>活動描述 *</Text>
                <TouchableOpacity 
                  style={styles.helpIcon}
                  onPress={() => {
                    Alert.alert(
                      HELP_CONTENT.description.title,
                      HELP_CONTENT.description.content + '\n\n範例：\n' + HELP_CONTENT.description.examples.join('\n'),
                      [{ text: '了解', style: 'default' }]
                    );
                  }}
                >
                  <AlertCircle size={16} color={theme.secondaryText} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.fieldHint, { color: theme.secondaryText }]}>
                簡單描述這次活動，方便日後查詢和管理
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: errors.description ? theme.error : theme.border
                  }
                ]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="例如：辦公室12月電費、出差台中客戶拜訪"
                placeholderTextColor={theme.secondaryText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.description}</Text>
              )}
            </View>

            {/* 日期 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>發生日期</Text>
              <TouchableOpacity
                style={[
                  styles.selectField,
                  { backgroundColor: theme.background, borderColor: theme.border }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateContainer}>
                  <Calendar size={20} color={theme.primary} />
                  <Text style={[styles.dateText, { color: theme.text }]}>
                    {formData.date.toLocaleDateString('zh-TW')}
                  </Text>
                </View>
                <ChevronDown size={20} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>

            {/* 地點 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>地點</Text>
              <View style={[styles.inputWithIcon, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <MapPin size={20} color={theme.secondaryText} />
                <TextInput
                  style={[styles.iconInput, { color: theme.text }]}
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholder="活動發生地點"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>
            </View>
          </View>

          {/* 排放量計算 */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Calculator size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 8 }]}>排放量計算</Text>
            </View>

            {selectedSource && (
              <View style={[styles.infoCard, { backgroundColor: theme.background }]}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>排放係數資訊</Text>
                <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                  {selectedSource.emissionFactor} kg CO₂e/{selectedSource.unit}
                </Text>
              </View>
            )}

            {/* 數量 */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                數量 * {selectedSource && `(${selectedSource.unit})`}
              </Text>
                <TouchableOpacity 
                  style={styles.helpIcon}
                  onPress={() => {
                    Alert.alert(
                      HELP_CONTENT.quantity.title,
                      HELP_CONTENT.quantity.content + '\n\n範例：\n' + HELP_CONTENT.quantity.examples.join('\n'),
                      [{ text: '了解', style: 'default' }]
                    );
                  }}
                >
                  <AlertCircle size={16} color={theme.secondaryText} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.fieldHint, { color: theme.secondaryText }]}>
                {selectedSource ? 
                  `輸入這次活動的${selectedSource.unit}數量，例如：100` : 
                  "先選擇排放源後會顯示對應單位"
                }
              </Text>
              <View style={[styles.inputWithUnit, { backgroundColor: theme.background, borderColor: errors.quantity ? theme.error : theme.border }]}>
                <TextInput
                  style={[styles.unitInput, { color: theme.text }]}
                value={formData.quantity}
                onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                  placeholder={selectedSource ? "輸入數字" : "請先選擇排放源"}
                placeholderTextColor={theme.secondaryText}
                keyboardType="numeric"
              />
                {selectedSource && (
                  <View style={[styles.unitLabel, { backgroundColor: theme.primary + '10' }]}>
                    <Text style={[styles.unitText, { color: theme.primary }]}>
                      {selectedSource.unit}
                    </Text>
                  </View>
                )}
              </View>
              {errors.quantity && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.quantity}</Text>
              )}
            </View>

            {/* 計算結果 */}
            {formData.amount && (
              <Animated.View style={[
                styles.resultCard, 
                { 
                  backgroundColor: theme.primary + '15',
                  transform: [{ scale: scaleAnim }]
                }
              ]}>
                <LinearGradient
                  colors={[theme.primary + '20', theme.primary + '10']}
                  style={styles.resultGradient}
                >
                  <View style={styles.resultContent}>
                    <View style={styles.resultHeader}>
                      <Calculator size={20} color={theme.primary} />
                <Text style={[styles.resultLabel, { color: theme.text }]}>計算排放量</Text>
                    </View>
                <Text style={[styles.resultValue, { color: theme.primary }]}>
                  {formatEmissions(parseFloat(formData.amount))}
                </Text>
                {selectedSource && formData.quantity && (
                  <Text style={[styles.resultFormula, { color: theme.secondaryText }]}>
                    {formData.quantity} × {selectedSource.emissionFactor} = {formData.amount} kg CO₂e
                  </Text>
                )}
              </View>
                </LinearGradient>
              </Animated.View>
            )}
          </View>

          {/* 分攤設定 */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 8 }]}>分攤設定</Text>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>是否分攤到專案</Text>
                <Text style={[styles.switchDesc, { color: theme.secondaryText }]}>
                  將此營運排放分攤到相關專案
                </Text>
              </View>
              <Switch
                value={formData.isAllocated}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isAllocated: value }))}
                thumbColor={formData.isAllocated ? theme.primary : theme.secondaryText}
                trackColor={{ false: theme.border, true: theme.primary + '40' }}
              />
            </View>

            {formData.isAllocated && (
              <TouchableOpacity
                style={[styles.allocationButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setShowAllocationModal(true)}
              >
                <View style={styles.allocationButtonContent}>
                  <Settings size={20} color={theme.primary} />
                  <View style={styles.allocationButtonText}>
                    <Text style={[styles.allocationButtonTitle, { color: theme.text }]}>
                      分攤方式: {
                        formData.allocationMethod === 'budget' ? '預算分攤' :
                        formData.allocationMethod === 'equal' ? '平均分攤' :
                        formData.allocationMethod === 'duration' ? '時間分攤' : '自訂分攤'
                      }
                    </Text>
                    <Text style={[styles.allocationButtonDesc, { color: theme.secondaryText }]}>
                      已選擇 {formData.targetProjects.length} 個專案
                    </Text>
                  </View>
                </View>
                <ChevronDown size={20} color={theme.secondaryText} />
              </TouchableOpacity>
            )}

            {errors.targetProjects && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.targetProjects}</Text>
            )}
            {errors.allocationMethod && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.allocationMethod}</Text>
            )}
            {errors.customPercentages && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.customPercentages}</Text>
            )}
          </View>

          {/* 數據品質評分 */}
          {(formData.categoryId || formData.sourceId || formData.description || documents.length > 0) && (
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>數據品質評分</Text>
              <DataQualityBadge quality={dataQuality} theme={theme} />
              
              {/* 評分詳細資訊 */}
              <TouchableOpacity 
                style={styles.qualityDetailsToggle}
                onPress={() => setShowQualityDetails(!showQualityDetails)}
              >
                <Text style={[styles.qualityDetailsText, { color: theme.secondaryText }]}>
                  {showQualityDetails ? '隱藏詳細資訊' : '查看評分詳細資訊'}
                </Text>
                <ChevronDown 
                  size={16} 
                  color={theme.secondaryText}
                  style={{ 
                    transform: [{ rotate: showQualityDetails ? '180deg' : '0deg' }] 
                  }}
                />
              </TouchableOpacity>
              
              {showQualityDetails && (
                <View style={styles.qualityDetails}>
                  <Text style={[styles.qualityFactorTitle, { color: theme.text }]}>評分因子</Text>
                  <View style={styles.qualityFactorRow}>
                    <Text style={[styles.qualityFactorLabel, { color: theme.secondaryText }]}>
                      表單完整度
                    </Text>
                    <Text style={[styles.qualityFactorValue, { color: theme.text }]}>
                      {dataQuality.factors.completeness}%
                    </Text>
                  </View>
                  <View style={styles.qualityFactorRow}>
                    <Text style={[styles.qualityFactorLabel, { color: theme.secondaryText }]}>
                      數據準確性
                    </Text>
                    <Text style={[styles.qualityFactorValue, { color: theme.text }]}>
                      {dataQuality.factors.accuracy}%
                    </Text>
                  </View>
                  <View style={styles.qualityFactorRow}>
                    <Text style={[styles.qualityFactorLabel, { color: theme.secondaryText }]}>
                      可追溯性
                    </Text>
                    <Text style={[styles.qualityFactorValue, { color: theme.text }]}>
                      {dataQuality.factors.traceability}%
                    </Text>
                  </View>
                  {dataQuality.factors.hasDocument && (
                    <View style={styles.qualityFactorRow}>
                      <Text style={[styles.qualityFactorLabel, { color: theme.secondaryText }]}>
                        證明文件
                      </Text>
                      <Text style={[styles.qualityFactorValue, { color: theme.primary }]}>
                        {getDocumentTypeLabel(dataQuality.factors.documentType!)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* 證明文件上傳 */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>證明文件</Text>
            <DocumentUploader 
              documents={documents}
              onDocumentsChange={setDocuments}
              theme={theme}
              onAIAnalysis={async (doc) => {
                try {
                  // 啟動AI分析流程
                  setAiProcessing({
                    isProcessing: true,
                    stage: 'uploading',
                    progress: 10
                  });

                  // 模擬不同階段的進度
                  setTimeout(() => {
                    setAiProcessing(prev => ({ ...prev, stage: 'ocr', progress: 30 }));
                  }, 500);

                  setTimeout(() => {
                    setAiProcessing(prev => ({ ...prev, stage: 'analysis', progress: 60 }));
                  }, 1500);

                  setTimeout(() => {
                    setAiProcessing(prev => ({ ...prev, stage: 'validation', progress: 90 }));
                  }, 2500);

                  // 執行AI分析
                  const result = await analyzeDocumentWithAI(doc.uri, doc.type, doc.name);
                  
                  // 更新文件的AI分析結果
                  setDocuments(prev => prev.map(d => 
                    d.id === doc.id ? { ...d, aiAnalysis: result } : d
                  ));

                  setAiProcessing({
                    isProcessing: false,
                    stage: 'completed',
                    progress: 100,
                    result
                  });

                  // 顯示結果並提供自動填表選項
                  console.log('準備顯示AI結果Alert:', result);
                  setCurrentAiResult(result);
                  setShowAiAlert(true);
                } catch (error) {
                  Alert.alert('AI 分析失敗', '請稍後重試或手動輸入數據');
                  setAiProcessing({
                    isProcessing: false,
                    stage: 'uploading',
                    progress: 0
                  });
                }
              }}
              aiProcessing={aiProcessing}
            />
          </View>

          {/* 備註 */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>備註</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.notesInput,
                { 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="其他相關說明或備註資訊"
              placeholderTextColor={theme.secondaryText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* 提交按鈕 */}
          <View style={styles.buttonContainer}>
            <Button
              title="取消"
              onPress={() => router.back()}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="儲存記錄"
              onPress={handleSave}
              variant="primary"
              loading={isLoading}
              icon={<Save size={16} color="white" />}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* 日期選擇器 */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({ ...prev, date: selectedDate }));
            }
          }}
        />
      )}

      {/* 模態框 */}
      {renderCategoryModal()}
      {renderSourceModal()}
      {renderAllocationModal()}
      {renderHelpModal()}
      {renderAIResultModal()}
      {renderAIAlertModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 標題區域
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  helpButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // 進度條樣式
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  helpIcon: {
    padding: 4,
  },
  fieldHint: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  fieldBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  selectFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectFieldText: {
    fontSize: 16,
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  iconInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 16,
    paddingRight: 4,
  },
  unitInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  unitLabel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
  },
  notesInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  
  // 資訊卡片
  infoCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
  },
  
  // 計算結果
  resultCard: {
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resultGradient: {
    padding: 16,
  },
  resultContent: {
    alignItems: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultFormula: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // 分攤設定
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDesc: {
    fontSize: 12,
  },
  allocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  allocationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  allocationButtonText: {
    marginLeft: 12,
  },
  allocationButtonTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  allocationButtonDesc: {
    fontSize: 12,
  },
  
  // 按鈕
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  
  // 模態框
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    maxHeight: 400,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  
  // 選項
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  categoryOptionContent: {
    flex: 1,
  },
  categoryOptionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  categoryOptionDesc: {
    fontSize: 12,
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  sourceOptionContent: {
    flex: 1,
  },
  sourceOptionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sourceOptionDesc: {
    fontSize: 12,
    marginBottom: 4,
  },
  sourceOptionFactor: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // 分攤方式
  allocationMethodSection: {
    padding: 16,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  methodOptionContent: {
    flex: 1,
  },
  methodOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  methodOptionDesc: {
    fontSize: 12,
  },
  
  // 專案選擇
  targetProjectsSection: {
    padding: 16,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  projectOptionContent: {
    flex: 1,
  },
  projectOptionName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  projectOptionDesc: {
    fontSize: 12,
  },
  
  // 自訂比例
  customPercentageSection: {
    padding: 16,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  percentageLabel: {
    flex: 1,
    fontSize: 14,
    marginRight: 16,
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  percentageSymbol: {
    marginLeft: 4,
    fontSize: 14,
  },
  percentageTotal: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  
  // 空狀態
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
     emptyStateText: {
     marginTop: 16,
     fontSize: 16,
     textAlign: 'center',
   },
  
  // 幫助模態框樣式
  helpModalContent: {
    width: width * 0.92,
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  helpModalBody: {
    maxHeight: 500,
    padding: 20,
  },
  helpSection: {
    marginBottom: 20,
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  helpStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
  helpTip: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  helpTipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  // 數據品質評分樣式
  qualityBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  qualityBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingHorizontal: 8,
  },
  badgeScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 4,
  },
  qualityInfo: {
    flex: 1,
  },
  qualityLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  qualityDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // 文件上傳樣式
  documentUploader: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  uploaderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploaderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploaderHeaderText: {
    flex: 1,
  },
  uploaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploaderDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  documentsSection: {
    marginTop: 8,
  },
  documentsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  documentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentIcon: {
    fontSize: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentType: {
    fontSize: 12,
    fontWeight: '500',
  },
  documentSize: {
    fontSize: 12,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emptyDocuments: {
    alignItems: 'center',
    padding: 20,
  },
  emptyDocumentsText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyDocumentsHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  
  // 數據品質詳細資訊樣式
  qualityDetailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  qualityDetailsText: {
    fontSize: 14,
    marginRight: 4,
  },
  qualityDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  qualityFactorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  qualityFactorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  qualityFactorLabel: {
    fontSize: 13,
    flex: 1,
  },
  qualityFactorValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // AI 分析進度樣式
  aiProcessingContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  aiProcessingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiProcessingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  aiProcessingStage: {
    fontSize: 14,
    marginBottom: 12,
  },
  aiProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  aiProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  aiProgressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  
  // AI 結果模態框樣式
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confidenceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  extractedDataContainer: {
    marginTop: 8,
  },
  dataItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  dataValue: {
    fontSize: 14,
    flex: 1,
  },
 }); 