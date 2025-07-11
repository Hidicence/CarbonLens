import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, Camera, Zap, Mic, Palette, Shirt, Package, Truck } from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

// 定義活動類型
type ActivityType = {
  name: string;
  description: string;
  unit: string;
  emissionFactor: number;
  defaultQuantity: number;
  category: 'transportation' | 'energy' | 'fuel';
};

// 定義組別類型
type CrewType = 'director' | 'camera' | 'lighting' | 'sound' | 'makeup' | 'costume' | 'props' | 'transport';

export default function AddRecordSimpleScreen() {
  const router = useRouter();
  const { projectId, crew } = useLocalSearchParams<{ 
    projectId: string, 
    crew?: string 
  }>();
  const { addProjectEmissionRecord } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [selectedCrew, setSelectedCrew] = useState<CrewType>(crew as CrewType || 'director');
  const [selectedQuickOption, setSelectedQuickOption] = useState<ActivityType | null>(null);
  const [customQuantity, setCustomQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 組別圖標
  const getCrewIcon = (crewType: string, size: number = 20, color: string = '#6B7280') => {
    switch (crewType) {
      case 'director': return <Video size={size} color={color} />;
      case 'camera': return <Camera size={size} color={color} />;
      case 'lighting': return <Zap size={size} color={color} />;
      case 'sound': return <Mic size={size} color={color} />;
      case 'makeup': return <Palette size={size} color={color} />;
      case 'costume': return <Shirt size={size} color={color} />;
      case 'props': return <Package size={size} color={color} />;
      case 'transport': return <Truck size={size} color={color} />;
      default: return <Video size={size} color={color} />;
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

  const crewActivities: Record<CrewType, ActivityType[]> = {
    director: [
      {
        name: '交通移動',
        description: '拍攝現場往返交通',
        unit: '公里',
        emissionFactor: 0.304, // kg CO₂e/km (小客車平均值)
        defaultQuantity: 50,
        category: 'transportation'
      },
      {
        name: '會議用電',
        description: '會議室及辦公設備用電',
        unit: '小時',
        emissionFactor: 0.509, // kg CO₂e/kWh × 2kW設備
        defaultQuantity: 4,
        category: 'energy'
      }
    ],
    camera: [
      {
        name: '攝影設備用電',
        description: '攝影機及相關設備用電',
        unit: '小時',
        emissionFactor: 1.273, // kg CO₂e/kWh × 2.5kW設備
        defaultQuantity: 8,
        category: 'energy'
      },
      {
        name: '器材運輸',
        description: '攝影器材運輸距離',
        unit: '公里',
        emissionFactor: 0.68, // kg CO₂e/km (小貨車)
        defaultQuantity: 20,
        category: 'transportation'
      }
    ],
    lighting: [
      {
        name: '燈具用電',
        description: '拍攝現場燈光設備用電',
        unit: '小時',
        emissionFactor: 2.545, // kg CO₂e/kWh × 5kW燈具
        defaultQuantity: 6,
        category: 'energy'
      },
      {
        name: '發電機燃料',
        description: '柴油發電機燃料消耗',
        unit: '公升',
        emissionFactor: 2.68, // kg CO₂e/L 柴油
        defaultQuantity: 15,
        category: 'fuel'
      }
    ],
    sound: [
      {
        name: '音響設備用電',
        description: '收音及音響設備用電',
        unit: '小時',
        emissionFactor: 0.764, // kg CO₂e/kWh × 1.5kW設備
        defaultQuantity: 8,
        category: 'energy'
      },
      {
        name: '器材運輸',
        description: '音響器材運輸距離',
        unit: '公里',
        emissionFactor: 0.304, // kg CO₂e/km (小客車)
        defaultQuantity: 30,
        category: 'transportation'
      }
    ],
    makeup: [
      {
        name: '化妝間用電',
        description: '化妝間燈光及設備用電',
        unit: '小時',
        emissionFactor: 1.018, // kg CO₂e/kWh × 2kW設備
        defaultQuantity: 6,
        category: 'energy'
      },
      {
        name: '交通移動',
        description: '往返拍攝現場交通',
        unit: '公里',
        emissionFactor: 0.304, // kg CO₂e/km (小客車)
        defaultQuantity: 40,
        category: 'transportation'
      }
    ],
    costume: [
      {
        name: '服裝間用電',
        description: '服裝間燈光及整燙設備用電',
        unit: '小時',
        emissionFactor: 1.527, // kg CO₂e/kWh × 3kW設備
        defaultQuantity: 4,
        category: 'energy'
      },
      {
        name: '服裝運輸',
        description: '服裝道具運輸距離',
        unit: '公里',
        emissionFactor: 0.68, // kg CO₂e/km (小貨車)
        defaultQuantity: 25,
        category: 'transportation'
      }
    ],
    props: [
      {
        name: '道具運輸',
        description: '道具運送及搬運距離',
        unit: '公里',
        emissionFactor: 0.68, // kg CO₂e/km (小貨車)
        defaultQuantity: 35,
        category: 'transportation'
      },
      {
        name: '工作區用電',
        description: '道具製作及整理區用電',
        unit: '小時',
        emissionFactor: 1.018, // kg CO₂e/kWh × 2kW設備
        defaultQuantity: 5,
        category: 'energy'
      }
    ],
    transport: [
      {
        name: '人員接送',
        description: '演職人員接送距離',
        unit: '公里',
        emissionFactor: 0.68, // kg CO₂e/km (小客車/廂型車)
        defaultQuantity: 80,
        category: 'transportation'
      },
      {
        name: '車輛燃料',
        description: '工作車輛汽油消耗',
        unit: '公升',
        emissionFactor: 2.31, // kg CO₂e/L 汽油
        defaultQuantity: 40,
        category: 'fuel'
      }
    ]
  };

  const getCurrentOptions = (): ActivityType[] => {
    return crewActivities[selectedCrew as CrewType] || [];
  };

  const calculateEmission = () => {
    if (!selectedQuickOption) return 0;
    const quantity = parseFloat(customQuantity) || selectedQuickOption.defaultQuantity;
    return selectedQuickOption.emissionFactor * quantity;
  };

  const saveRecord = () => {
    if (!selectedQuickOption) {
      Alert.alert('請選擇項目', '請先選擇一個排放項目');
      return;
    }

    setIsSaving(true);
    
    const record = {
      projectId: projectId || '',
      stage: 'production' as const,
      category: 'production',
      categoryId: 'prod-general',
      description: description || selectedQuickOption.name,
      title: selectedQuickOption.name,
      sourceId: 'quick-input',
      quantity: parseFloat(customQuantity) || selectedQuickOption.defaultQuantity,
      unit: selectedQuickOption.unit,
      amount: calculateEmission(),
      date: new Date().toISOString(),
      location: '',
      notes: `${CREW_DEPARTMENTS[selectedCrew]?.name} - 快速輸入`,
      createdAt: new Date().toISOString(),
      crew: selectedCrew,
      crewName: CREW_DEPARTMENTS[selectedCrew]?.name,
    };
    
    setTimeout(() => {
      addProjectEmissionRecord(record);
      setIsSaving(false);
      Alert.alert('成功', '碳排放記錄已添加', [
        { text: '繼續添加', onPress: () => {
          setSelectedQuickOption(null);
          setCustomQuantity('');
          setDescription('');
        }},
        { text: '返回', onPress: () => router.back() }
      ]);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={`${CREW_DEPARTMENTS[selectedCrew]?.name || '拍攝組別'} - 快速記錄`}
        showBackButton={true}
        onBackPress={() => router.back()} 
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* 說明 */}
        <View style={[styles.infoSection, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <Text style={[styles.infoTitle, { color: theme.primary }]}>💡 精準碳排計算</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            所有項目均採用國際標準排放因子，確保數據準確性：{'\n'}
            • 交通運輸：基於車輛類型與距離{'\n'}
            • 用電設備：基於功率與使用時間{'\n'}
            • 燃料消耗：基於燃料類型與用量
          </Text>
        </View>

        {/* 組別選擇 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>選擇組別</Text>
          
          <View style={styles.crewGrid}>
            {Object.entries(CREW_DEPARTMENTS).map(([key, dept]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.crewCard,
                  { 
                    backgroundColor: selectedCrew === key ? dept.bgColor : theme.background,
                    borderColor: selectedCrew === key ? dept.color : theme.border
                  }
                ]}
                onPress={() => {
                  setSelectedCrew(key as CrewType);
                  setSelectedQuickOption(null);
                }}
              >
                <View style={[styles.crewIconContainer, { backgroundColor: dept.color + '20' }]}>
                  {getCrewIcon(key, 18, dept.color)}
                </View>
                <Text style={[styles.crewName, { color: dept.color }]}>
                  {dept.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 快速選項 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>選擇排放項目</Text>
          
          <View style={styles.optionsGrid}>
            {getCurrentOptions().map((activity, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: selectedQuickOption === activity ? theme.primary + '20' : theme.background,
                    borderColor: selectedQuickOption === activity ? theme.primary : theme.border
                  }
                ]}
                onPress={() => {
                  setSelectedQuickOption(activity);
                  setCustomQuantity(activity.defaultQuantity.toString());
                }}
              >
                <View style={styles.optionHeader}>
                  <Text style={[styles.optionLabel, { color: theme.text }]}>
                    {activity.name}
                  </Text>
                  <View style={[styles.categoryTag, { 
                    backgroundColor: activity.category === 'transportation' ? '#3B82F6' + '20' :
                                   activity.category === 'energy' ? '#F59E0B' + '20' :
                                   '#8B5CF6' + '20'
                  }]}>
                    <Text style={[styles.categoryText, { 
                      color: activity.category === 'transportation' ? '#3B82F6' :
                             activity.category === 'energy' ? '#F59E0B' :
                             '#8B5CF6'
                    }]}>
                      {activity.category === 'transportation' ? '交通' :
                       activity.category === 'energy' ? '用電' : '燃料'}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.optionDescription, { color: theme.secondaryText }]}>
                  {activity.description}
                </Text>
                
                <View style={styles.optionDetails}>
                  <Text style={[styles.optionDefault, { color: theme.secondaryText }]}>
                    預設: {activity.defaultQuantity} {activity.unit}
                  </Text>
                  <Text style={[styles.optionEmission, { color: theme.primary }]}>
                    {activity.emissionFactor} kg CO₂e/{activity.unit}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 數量調整 */}
        {selectedQuickOption && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>調整數量</Text>
            
            <View style={styles.quantityContainer}>
              <Text style={[styles.quantityLabel, { color: theme.text }]}>
                數量 ({selectedQuickOption.unit})
              </Text>
              <TextInput
                style={[styles.quantityInput, { 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                value={customQuantity}
                onChangeText={setCustomQuantity}
                placeholder={selectedQuickOption.defaultQuantity.toString()}
                placeholderTextColor={theme.secondaryText}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.emissionPreview}>
              <Text style={[styles.emissionLabel, { color: theme.text }]}>
                碳排放計算:
              </Text>
              <View style={[styles.calculationDetails, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.calculationFormula, { color: theme.secondaryText }]}>
                  {parseFloat(customQuantity) || selectedQuickOption.defaultQuantity} {selectedQuickOption.unit} × {selectedQuickOption.emissionFactor} kg CO₂e/{selectedQuickOption.unit}
                </Text>
                <Text style={[styles.emissionValue, { color: theme.primary }]}>
                  = {calculateEmission().toFixed(2)} kg CO₂e
                </Text>
              </View>
              <Text style={[styles.standardNote, { color: theme.secondaryText }]}>
                * 基於國際標準排放因子計算
              </Text>
            </View>
          </View>
        )}

        {/* 備註 */}
        {selectedQuickOption && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>備註 (選填)</Text>
            
            <TextInput
              style={[styles.descriptionInput, { 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="補充說明..."
              placeholderTextColor={theme.secondaryText}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* 保存按鈕 */}
        <Button
          title="儲存記錄"
          onPress={saveRecord}
          variant="primary"
          loading={isSaving}
          disabled={!selectedQuickOption}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  crewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  crewCard: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    padding: 8,
  },
  crewIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  crewName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  categoryTag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  optionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionDefault: {
    fontSize: 12,
  },
  optionEmission: {
    fontSize: 12,
    fontWeight: '500',
  },
  quantityContainer: {
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  emissionPreview: {
    marginBottom: 12,
  },
  emissionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  calculationDetails: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  calculationFormula: {
    fontSize: 12,
    marginBottom: 8,
  },
  emissionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  standardNote: {
    fontSize: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  infoSection: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
  },
}); 