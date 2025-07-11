import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Truck, Weight, Users, MapPin, Calculator, Plus, Minus, X, Package, Camera, Lightbulb, Monitor, HardDrive, FileText, Search } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useProjectStore } from '@/store/projectStore';
import { StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import Button from '@/components/Button';

// 導入器材數據
import { 
  ENHANCED_CAMERA_EQUIPMENT,
  ENHANCED_LIGHTING_EQUIPMENT,
  ENHANCED_EDITING_EQUIPMENT,
  ENHANCED_STORAGE_EQUIPMENT,
  ENHANCED_OFFICE_EQUIPMENT
} from '@/mocks/enhancedEquipment';

// 定義器材類型
interface Equipment {
  id: string;
  name: string;
  weight: number;
  [key: string]: any;
}

// 定義選中的器材
interface SelectedEquipment {
  equipment: Equipment;
  quantity: number;
}

// 器材分類
interface EquipmentCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  equipment: Equipment[];
}

// 按類別組織器材
const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'camera',
    name: '攝影器材',
    icon: Camera,
    equipment: ENHANCED_CAMERA_EQUIPMENT.filter(item => item.weight) as Equipment[]
  },
  {
    id: 'lighting',
    name: '燈光器材',
    icon: Lightbulb,
    equipment: ENHANCED_LIGHTING_EQUIPMENT.filter(item => item.weight) as Equipment[]
  },
  {
    id: 'editing',
    name: '後期設備',
    icon: Monitor,
    equipment: ENHANCED_EDITING_EQUIPMENT.filter(item => item.weight) as Equipment[]
  },
  {
    id: 'storage',
    name: '儲存設備',
    icon: HardDrive,
    equipment: ENHANCED_STORAGE_EQUIPMENT.filter(item => item.weight) as Equipment[]
  },
  {
    id: 'office',
    name: '辦公用品',
    icon: FileText,
    equipment: ENHANCED_OFFICE_EQUIPMENT.filter(item => item.weight) as Equipment[]
  }
];

export default function AddEquipmentTransportScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const { isDarkMode } = useThemeStore();
  const { addProjectEmissionRecord } = useProjectStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('camera');
  const [searchQuery, setSearchQuery] = useState('');

  // 計算器材重量
  const calculateEquipmentWeight = (): number => {
    return selectedEquipment.reduce((total, item) => 
      total + (item.equipment.weight * item.quantity), 0
    );
  };

  // 獲取分類中已選器材數量
  const getCategorySelectedCount = (categoryId: string): number => {
    const categoryEquipment = EQUIPMENT_CATEGORIES.find(cat => cat.id === categoryId)?.equipment || [];
    return selectedEquipment
      .filter(item => categoryEquipment.find(eq => eq.id === item.equipment.id))
      .reduce((total, item) => total + item.quantity, 0);
  };

  // 根據搜索過濾器材
  const getFilteredEquipment = () => {
    const currentCategory = EQUIPMENT_CATEGORIES.find(cat => cat.id === selectedCategory);
    if (!currentCategory) return [];
    
    if (!searchQuery.trim()) {
      return currentCategory.equipment;
    }
    
    return currentCategory.equipment.filter(equipment =>
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };



  // 添加器材
  const addEquipment = (equipment: Equipment) => {
    const existing = selectedEquipment.find(item => item.equipment.id === equipment.id);
    if (existing) {
      setSelectedEquipment(prev => 
        prev.map(item => 
          item.equipment.id === equipment.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedEquipment(prev => [...prev, { equipment, quantity: 1 }]);
    }
  };

  // 移除器材
  const removeEquipment = (equipmentId: string) => {
    setSelectedEquipment(prev => prev.filter(item => item.equipment.id !== equipmentId));
  };

  // 更新器材數量
  const updateQuantity = (equipmentId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeEquipment(equipmentId);
      return;
    }
    setSelectedEquipment(prev => 
      prev.map(item => 
        item.equipment.id === equipmentId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // 保存記錄
  const saveRecord = async () => {
    if (selectedEquipment.length === 0) {
      Alert.alert('錯誤', '請至少選擇一項器材');
      return;
    }

    setIsSaving(true);

    const equipmentList = selectedEquipment.map(item => 
      `${item.equipment.name} × ${item.quantity}`
    ).join(', ');

    const equipmentWeight = calculateEquipmentWeight();

    const record = {
      projectId: Array.isArray(projectId) ? projectId[0] : projectId || '',
      stage: 'production' as const,
      category: 'equipment',
      categoryId: 'project-equipment',
      title: '專案器材',
      description: `專案器材 - ${equipmentList}`,
      sourceId: 'project-equipment',
      quantity: selectedEquipment.reduce((total, item) => total + item.quantity, 0),
      unit: '件',
      amount: equipmentWeight,
      date: new Date().toISOString(),
      location: '',
      notes: `器材：${equipmentList}\n總重量：${equipmentWeight.toFixed(1)}kg`,
      createdAt: new Date().toISOString(),
      crew: 'equipment',
      crewName: '器材組',
    };

    setTimeout(() => {
      addProjectEmissionRecord(record);
      setIsSaving(false);
      Alert.alert('成功', '專案器材記錄已添加', [
        { text: '繼續添加', onPress: () => {
          setSelectedEquipment([]);
        }},
        { text: '返回', onPress: () => router.back() }
      ]);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="專案器材記錄"
        showBackButton={true}
        onBackPress={() => router.back()} 
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* 說明 */}
        <View style={[styles.infoSection, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                        <Text style={[styles.infoTitle, { color: theme.primary }]}>📦 專案器材重量統計</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            登記本專案使用的所有器材及其重量：{'\n'}
            • 統計器材總重量供後續運輸計算{'\n'}
            • 記錄器材清單便於專案管理{'\n'}
            • 運輸排放請於下方「拍攝日記錄」中輸入
          </Text>
        </View>

        {/* 器材選擇 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>選擇器材</Text>
            <TouchableOpacity
              onPress={() => setShowEquipmentSelector(!showEquipmentSelector)}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
            >
              <Plus size={16} color="white" />
              <Text style={styles.addButtonText}>添加器材</Text>
            </TouchableOpacity>
          </View>

          {/* 已選器材列表 */}
          {selectedEquipment.length > 0 ? (
            <View style={styles.selectedEquipmentList}>
              {selectedEquipment.map((item, index) => (
                <View key={item.equipment.id} style={[styles.equipmentItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <View style={styles.equipmentInfo}>
                    <Text style={[styles.equipmentName, { color: theme.text }]}>
                      {item.equipment.name}
                    </Text>
                    <Text style={[styles.equipmentWeight, { color: theme.secondaryText }]}>
                      {item.equipment.weight}kg × {item.quantity} = {(item.equipment.weight * item.quantity).toFixed(1)}kg
                    </Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.equipment.id, item.quantity - 1)}
                      style={[styles.quantityButton, { borderColor: theme.border }]}
                    >
                      <Minus size={14} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.quantityText, { color: theme.text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.equipment.id, item.quantity + 1)}
                      style={[styles.quantityButton, { borderColor: theme.border }]}
                    >
                      <Plus size={14} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeEquipment(item.equipment.id)}
                      style={[styles.removeButton, { backgroundColor: '#EF4444' + '20' }]}
                    >
                      <X size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              尚未選擇任何器材
            </Text>
          )}

          {/* 器材選擇器 */}
          {showEquipmentSelector && (
            <View style={[styles.equipmentSelector, { backgroundColor: theme.background, borderColor: theme.border }]}>
              {/* 分類選擇 */}
              <View style={styles.categoryTabs}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {EQUIPMENT_CATEGORIES.map((category) => {
                    const selectedCount = getCategorySelectedCount(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => {
                          setSelectedCategory(category.id);
                          setSearchQuery(''); // 清空搜索
                        }}
                        style={[
                          styles.categoryTab,
                          { 
                            backgroundColor: selectedCategory === category.id ? theme.primary : theme.card,
                            borderColor: theme.border
                          }
                        ]}
                      >
                        <category.icon 
                          size={16} 
                          color={selectedCategory === category.id ? 'white' : theme.primary}
                          style={styles.categoryIcon}
                        />
                        <Text style={[
                          styles.categoryTabText,
                          { 
                            color: selectedCategory === category.id ? 'white' : theme.text 
                          }
                        ]}>
                          {category.name}
                        </Text>
                        {selectedCount > 0 && (
                          <View style={[styles.categoryBadge, { 
                            backgroundColor: selectedCategory === category.id ? 'white' : theme.primary 
                          }]}>
                            <Text style={[styles.categoryBadgeText, { 
                              color: selectedCategory === category.id ? theme.primary : 'white' 
                            }]}>
                              {selectedCount.toString()}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 搜索框 */}
              <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Search size={16} color={theme.secondaryText} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="搜索器材..."
                  placeholderTextColor={theme.secondaryText}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color={theme.secondaryText} />
                  </TouchableOpacity>
                )}
              </View>

              {/* 器材列表 */}
              <View style={styles.equipmentGrid}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {getFilteredEquipment().map((equipment) => {
                    const isSelected = selectedEquipment.find(item => item.equipment.id === equipment.id);
                    return (
                  <TouchableOpacity
                    key={equipment.id}
                    onPress={() => addEquipment(equipment)}
                        style={[
                          styles.equipmentCard, 
                          { 
                            backgroundColor: isSelected ? theme.primary + '10' : theme.card, 
                            borderColor: isSelected ? theme.primary : theme.border 
                          }
                        ]}
                  >
                        <View style={styles.equipmentCardContent}>
                    <Text style={[styles.equipmentCardName, { color: theme.text }]}>
                      {equipment.name}
                    </Text>
                    <Text style={[styles.equipmentCardWeight, { color: theme.secondaryText }]}>
                      {equipment.weight}kg
                    </Text>
                          {isSelected && (
                            <Text style={[styles.equipmentCardSelected, { color: theme.primary }]}>
                              已選 {isSelected.quantity.toString()} 件
                            </Text>
                          )}
                        </View>
                        <Plus size={16} color={theme.primary} />
                  </TouchableOpacity>
                    );
                  })}
              </ScrollView>
              </View>
            </View>
          )}
        </View>

        {/* 重量統計 */}
        {selectedEquipment.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>重量統計</Text>
            
            <View style={[styles.calculationCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.calculationRow}>
                <Weight size={20} color={theme.primary} />
                <Text style={[styles.calculationLabel, { color: theme.text }]}>器材總重量</Text>
                <Text style={[styles.calculationValue, { color: theme.primary, fontWeight: 'bold' }]}>
                  {calculateEquipmentWeight().toFixed(1)} kg
                </Text>
              </View>
              
              <View style={styles.calculationRow}>
                <Package size={20} color={theme.primary} />
                <Text style={[styles.calculationLabel, { color: theme.text }]}>器材數量</Text>
                <Text style={[styles.calculationValue, { color: theme.text }]}>
                  {selectedEquipment.reduce((total, item) => total + item.quantity, 0)} 件
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 保存按鈕 */}
        <Button
          title="儲存器材記錄"
          onPress={saveRecord}
          variant="primary"
          loading={isSaving}
          disabled={selectedEquipment.length === 0}
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
  infoSection: {
    marginBottom: 16,
    borderWidth: 1,
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
    lineHeight: 18,
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedEquipmentList: {
    marginBottom: 12,
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  equipmentWeight: {
    fontSize: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 20,
  },
  equipmentSelector: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    maxHeight: 400,
  },
  categoryTabs: {
    marginBottom: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  equipmentGrid: {
    maxHeight: 280,
  },
  equipmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  equipmentCardContent: {
    flex: 1,
  },
  equipmentCardName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  equipmentCardWeight: {
    fontSize: 11,
    marginBottom: 2,
  },
  equipmentCardSelected: {
    fontSize: 10,
    fontWeight: '600',
  },
  peopleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  peopleLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  peopleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  peopleCount: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  peopleNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  distanceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
  },
  distanceUnit: {
    fontSize: 14,
    fontWeight: '600',
  },
  calculationCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  formulaContainer: {
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  formulaText: {
    fontSize: 12,
    textAlign: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    marginBottom: 32,
  },
}); 