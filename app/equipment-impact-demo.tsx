import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Zap, Users, Clock, Info } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import Header from '@/components/Header';
import Colors from '@/constants/colors';
import { CREW_OPTIONS, getCrewIcon } from '@/constants/crews';
import { 
  calculateAllCrewEmissionsWithEquipment,
  CREW_BASE_EMISSION_FACTORS 
} from '@/constants/equipmentCrewMapping';
import { 
  ENHANCED_CAMERA_EQUIPMENT,
  ENHANCED_LIGHTING_EQUIPMENT,
  ENHANCED_EDITING_EQUIPMENT,
  ENHANCED_STORAGE_EQUIPMENT,
  ENHANCED_OFFICE_EQUIPMENT
} from '@/mocks/enhancedEquipment';

// 合併所有器材
const ALL_EQUIPMENT = [
  ...ENHANCED_CAMERA_EQUIPMENT,
  ...ENHANCED_LIGHTING_EQUIPMENT, 
  ...ENHANCED_EDITING_EQUIPMENT,
  ...ENHANCED_STORAGE_EQUIPMENT,
  ...ENHANCED_OFFICE_EQUIPMENT
].filter(item => item.weight).slice(0, 20); // 限制顯示前20項以避免過長

interface SelectedEquipment {
  id: string;
  name: string;
  weight?: number;
}

export default function EquipmentImpactDemo() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  const [workDuration, setWorkDuration] = useState(8);
  const [showEquipmentList, setShowEquipmentList] = useState(true);
  const [crewEmissions, setCrewEmissions] = useState<Record<string, {
    emission: number;
    impactFactor: number;
    descriptions: string[];
  }>>({});

  // 預設選擇一些器材作為示例
  useEffect(() => {
    const defaultEquipment = [
      ALL_EQUIPMENT.find(eq => eq.id === 'cam-1'),  // ARRI Alexa Mini
      ALL_EQUIPMENT.find(eq => eq.id === 'cam-2'),  // RED Epic Dragon
    ].filter(Boolean) as any[];
    
    if (defaultEquipment.length > 0) {
      setSelectedEquipment(defaultEquipment.map(eq => ({
        id: eq.id,
        name: eq.name,
        weight: eq.weight
      })));
    }
  }, []);

  // 計算所有組別的排放量
  useEffect(() => {
    const equipmentIds = selectedEquipment.map(eq => eq.id);
    const results = calculateAllCrewEmissionsWithEquipment(
      equipmentIds,
      {}, // 使用預設組別人數 (1人)
      workDuration
    );
    setCrewEmissions(results);
  }, [selectedEquipment, workDuration]);

  const toggleEquipment = (equipment: any) => {
    const isSelected = selectedEquipment.find(eq => eq.id === equipment.id);
    if (isSelected) {
      setSelectedEquipment(prev => prev.filter(eq => eq.id !== equipment.id));
    } else {
      setSelectedEquipment(prev => [...prev, {
        id: equipment.id,
        name: equipment.name,
        weight: equipment.weight
      }]);
    }
  };

  const formatEmission = (value: number) => {
    return value.toFixed(2);
  };

  const getImpactColor = (impactFactor: number) => {
    if (impactFactor >= 2.0) return '#FF4444'; // 高影響 - 紅色
    if (impactFactor >= 1.5) return '#FF8800'; // 中高影響 - 橙色
    if (impactFactor >= 1.2) return '#FFB300'; // 中等影響 - 黃色
    if (impactFactor >= 1.1) return '#88CC00'; // 低影響 - 淺綠色
    return '#00AA00'; // 無影響或降低 - 綠色
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="器材碳排影響示例" 
        showBackButton 
      />
      
      <ScrollView style={styles.content}>
        {/* 說明卡片 */}
        <View style={[styles.infoCard, { backgroundColor: theme.primary + '20' }]}>
          <Info size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            這個頁面展示器材攜帶對各工作組別碳排放的影響。選擇不同器材組合，觀察對各組別排放量和影響係數的變化。
          </Text>
        </View>

        {/* 工作參數 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>工作參數</Text>
          
          <View style={styles.parameterRow}>
            <Clock size={16} color={theme.text} />
            <Text style={[styles.parameterText, { color: theme.text }]}>
              工作時長：{workDuration} 小時
            </Text>
          </View>
          
          <View style={styles.durationButtons}>
            {[4, 8, 12, 16].map(hours => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.durationButton,
                  { 
                    backgroundColor: workDuration === hours ? theme.primary : theme.background,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => setWorkDuration(hours)}
              >
                <Text style={[
                  styles.durationButtonText,
                  { color: workDuration === hours ? 'white' : theme.text }
                ]}>
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 器材選擇 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setShowEquipmentList(!showEquipmentList)}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              器材選擇 ({selectedEquipment.length}項)
            </Text>
            <Text style={[styles.toggleText, { color: theme.primary }]}>
              {showEquipmentList ? '收起' : '展開'}
            </Text>
          </TouchableOpacity>
          
          {showEquipmentList && (
            <FlatList
              data={ALL_EQUIPMENT}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.equipmentRow}
              renderItem={({ item }) => {
                const isSelected = selectedEquipment.find(eq => eq.id === item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.equipmentItem,
                      {
                        backgroundColor: isSelected ? theme.primary + '20' : theme.background,
                        borderColor: isSelected ? theme.primary : theme.border
                      }
                    ]}
                    onPress={() => toggleEquipment(item)}
                  >
                    <Text style={[
                      styles.equipmentName,
                      { color: isSelected ? theme.primary : theme.text }
                    ]}>
                      {item.name}
                    </Text>
                    {item.weight && (
                      <Text style={[styles.equipmentWeight, { color: theme.secondaryText }]}>
                        {item.weight}kg
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* 組別影響分析 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>組別影響分析</Text>
          
          {CREW_OPTIONS.map(crew => {
            const crewData = crewEmissions[crew.key];
            if (!crewData) return null;
            
            const baseEmission = CREW_BASE_EMISSION_FACTORS[crew.key] * workDuration;
            const impactColor = getImpactColor(crewData.impactFactor);
            
            return (
              <View key={crew.key} style={[styles.crewAnalysisItem, { backgroundColor: theme.background }]}>
                <View style={styles.crewAnalysisHeader}>
                  <View style={styles.crewInfo}>
                    {getCrewIcon(crew.key, 20, crew.color)}
                    <Text style={[styles.crewName, { color: theme.text }]}>
                      {crew.name}
                    </Text>
                  </View>
                  
                  <View style={styles.emissionInfo}>
                    <Text style={[styles.baseEmission, { color: theme.secondaryText }]}>
                      基礎：{formatEmission(baseEmission)}
                    </Text>
                    <Text style={[styles.totalEmission, { color: theme.text }]}>
                      總計：{formatEmission(crewData.emission)} kg CO₂e
                    </Text>
                  </View>
                </View>
                
                <View style={styles.impactFactorContainer}>
                  <View style={[styles.impactFactorBadge, { backgroundColor: impactColor }]}>
                    <Text style={styles.impactFactorText}>
                      {crewData.impactFactor}x
                    </Text>
                  </View>
                  
                  {crewData.descriptions.length > 0 && (
                    <View style={styles.impactDescriptions}>
                      {crewData.descriptions.slice(0, 2).map((desc, index) => (
                        <Text key={index} style={[styles.impactDescription, { color: theme.secondaryText }]}>
                          • {desc}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* 總計統計 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>總計統計</Text>
          
          <View style={styles.totalStats}>
            <View style={styles.statItem}>
              <Zap size={20} color={theme.primary} />
              <Text style={[styles.statLabel, { color: theme.text }]}>總排放量</Text>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {formatEmission(Object.values(crewEmissions).reduce((sum, crew) => sum + crew.emission, 0))} kg CO₂e
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Users size={20} color={theme.primary} />
              <Text style={[styles.statLabel, { color: theme.text }]}>受影響組別</Text>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {Object.values(crewEmissions).filter(crew => crew.impactFactor > 1.1).length} 個
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} />
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
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  parameterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  parameterText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  equipmentRow: {
    justifyContent: 'space-between',
  },
  equipmentItem: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  equipmentWeight: {
    fontSize: 12,
    fontWeight: '400',
  },
  crewAnalysisItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  crewAnalysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  crewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crewName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emissionInfo: {
    alignItems: 'flex-end',
  },
  baseEmission: {
    fontSize: 12,
    fontWeight: '400',
  },
  totalEmission: {
    fontSize: 14,
    fontWeight: '600',
  },
  impactFactorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  impactFactorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  impactFactorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  impactDescriptions: {
    flex: 1,
  },
  impactDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  totalStats: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    height: 40,
  },
}); 