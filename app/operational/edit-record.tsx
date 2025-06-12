import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X,
  Calendar,
  MapPin,
  FileText,
  Save,
  AlertCircle,
  Lightbulb,
  Droplets,
  Car,
  Trash2,
  Thermometer,
  Building,
  Users,
  Calculator,
  Target,
  ChevronRight
} from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import { formatEmissions } from '@/utils/helpers';
import { NonProjectEmissionRecord, AllocationMethod } from '@/types/project';
import { OPERATIONAL_CATEGORIES, OPERATIONAL_SOURCES } from '@/mocks/projects';

interface EmissionFactor {
  value: number;
  unit: string;
  description: string;
}

const EMISSION_FACTORS: { [key: string]: EmissionFactor } = {
  'source-electricity-office': { value: 0.554, unit: 'kgCO₂e/kWh', description: '台灣電力排放係數' },
  'source-electricity-warehouse': { value: 0.554, unit: 'kgCO₂e/kWh', description: '台灣電力排放係數' },
  'source-water-tap': { value: 0.16, unit: 'kgCO₂e/m³', description: '自來水排放係數' },
  'source-water-mineral': { value: 0.33, unit: 'kgCO₂e/L', description: '礦泉水排放係數' },
  'source-paper-a4': { value: 4.74, unit: 'kgCO₂e/kg', description: 'A4紙張排放係數' },
  'source-paper-newspaper': { value: 1.8, unit: 'kgCO₂e/kg', description: '報紙排放係數' },
  'source-vehicle-car': { value: 0.18, unit: 'kgCO₂e/km', description: '小客車排放係數' },
  'source-vehicle-scooter': { value: 0.063, unit: 'kgCO₂e/km', description: '機車排放係數' },
  'source-waste-general': { value: 0.025, unit: 'kgCO₂e/kg', description: '一般廢棄物排放係數' },
  'source-waste-plastic': { value: 2.0, unit: 'kgCO₂e/kg', description: '塑膠廢棄物排放係數' },
  'source-heating-gas': { value: 2.03, unit: 'kgCO₂e/m³', description: '天然氣排放係數' },
  'source-heating-oil': { value: 2.7, unit: 'kgCO₂e/L', description: '燃油排放係數' },
  'source-commuting-car': { value: 0.18, unit: 'kgCO₂e/km', description: '通勤小客車排放係數' },
  'source-commuting-public': { value: 0.055, unit: 'kgCO₂e/km', description: '大眾運輸排放係數' },
  'source-travel-flight-domestic': { value: 0.255, unit: 'kgCO₂e/km', description: '國內航班排放係數' },
  'source-travel-flight-international': { value: 0.195, unit: 'kgCO₂e/km', description: '國際航班排放係數' },
};

export default function EditRecordScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { nonProjectEmissionRecords, projects, updateNonProjectEmissionRecord } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // 找到要編輯的記錄
  const recordToEdit = nonProjectEmissionRecords?.find(record => record.id === id);

  // 表單狀態
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [calculatedEmissions, setCalculatedEmissions] = useState<number>(0);
  
  // 分攤設定
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>('budget');
  const [customAllocations, setCustomAllocations] = useState<{ [projectId: string]: number }>({});
  
  // UI 狀態
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // 初始化表單數據
  useEffect(() => {
    if (recordToEdit) {
      setSelectedCategory(recordToEdit.categoryId);
      setSelectedSource(recordToEdit.sourceId || '');
      setQuantity(recordToEdit.quantity.toString());
      setUnit(recordToEdit.unit || '');
      setLocation(recordToEdit.location || '');
      setDate(recordToEdit.date);
      setDescription(recordToEdit.description || '');
      setCalculatedEmissions(recordToEdit.amount);
    } else {
      // 如果找不到記錄，返回
      Alert.alert('錯誤', '找不到指定的記錄', [
        { text: '確定', onPress: () => router.back() }
      ]);
    }
  }, [recordToEdit, router]);

  // 獲取活躍專案
  const activeProjects = projects.filter(p => p.status === 'active');

  // 獲取類別資訊
  const getCategoryInfo = (categoryId: string) => {
    const category = OPERATIONAL_CATEGORIES.find(cat => cat.id === categoryId);
    return category || { id: categoryId, name: categoryId, scope: 'unknown', color: theme.primary };
  };

  // 獲取排放源資訊
  const getSourceInfo = (sourceId: string) => {
    const source = OPERATIONAL_SOURCES.find(src => src.id === sourceId);
    return source || { id: sourceId, name: sourceId, categoryId: '', unit: '' };
  };

  // 獲取類別圖標
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'scope2-electricity': <Lightbulb size={24} color="#FFB800" />,
      'scope3-water': <Droplets size={24} color="#007AFF" />,
      'scope3-paper': <FileText size={24} color="#34C759" />,
      'scope1-vehicles': <Car size={24} color="#FF3B30" />,
      'scope3-waste': <Trash2 size={24} color="#8E8E93" />,
      'scope2-heating': <Thermometer size={24} color="#FF9500" />,
      'scope3-commuting': <Car size={24} color="#5856D6" />,
      'scope3-business-travel': <Car size={24} color="#AF52DE" />,
    };
    
    return iconMap[categoryId] || <Building size={24} color={theme.primary} />;
  };

  // 計算碳排放量
  const calculateEmissions = useMemo(() => {
    if (!selectedSource || !quantity || isNaN(parseFloat(quantity))) {
      return 0;
    }

    const emissionFactor = EMISSION_FACTORS[selectedSource];
    if (!emissionFactor) {
      return 0;
    }

    const quantityValue = parseFloat(quantity);
    return quantityValue * emissionFactor.value;
  }, [selectedSource, quantity]);

  // 更新計算結果
  useEffect(() => {
    setCalculatedEmissions(calculateEmissions);
    setUnit(selectedSource ? EMISSION_FACTORS[selectedSource]?.unit.split('/')[1] || '' : '');
  }, [calculateEmissions, selectedSource]);

  // 表單驗證
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedCategory) newErrors.category = '請選擇排放類別';
    if (!selectedSource) newErrors.source = '請選擇排放源';
    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      newErrors.quantity = '請輸入有效的數量';
    }
    if (!date) newErrors.date = '請選擇日期';
    if (!location.trim()) newErrors.location = '請輸入地點';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 儲存記錄
  const handleSave = async () => {
    if (!validateForm()) return;
    if (!recordToEdit) return;

    setIsSaving(true);

    try {
      const updatedRecord: NonProjectEmissionRecord = {
        ...recordToEdit,
        categoryId: selectedCategory,
        sourceId: selectedSource,
        amount: calculatedEmissions,
        quantity: parseFloat(quantity),
        unit,
        location: location.trim(),
        date,
        description: description.trim() || '',
        updatedAt: new Date().toISOString(),
      };

      updateNonProjectEmissionRecord(recordToEdit.id!, updatedRecord);

      Alert.alert(
        '成功',
        '營運記錄已更新',
        [{ text: '確定', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('更新記錄失敗:', error);
      Alert.alert('錯誤', '更新記錄失敗，請重試');
    } finally {
      setIsSaving(false);
    }
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
                  styles.modalItem,
                  {
                    backgroundColor: selectedCategory === item.id ? theme.primary + '20' : 'transparent',
                    borderBottomColor: theme.border
                  }
                ]}
                onPress={() => {
                  setSelectedCategory(item.id);
                  setSelectedSource(''); // 重置排放源選擇
                  setShowCategoryModal(false);
                }}
              >
                <View style={styles.modalItemLeft}>
                  {getCategoryIcon(item.id)}
                  <View style={styles.modalItemInfo}>
                    <Text style={[styles.modalItemName, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.modalItemScope, { color: theme.secondaryText }]}>
                      {item.scope}
                    </Text>
                  </View>
                </View>
                <View style={[styles.scopeIndicator, { backgroundColor: item.color }]} />
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </View>
    </Modal>
  );

  // 渲染排放源選擇模態框
  const renderSourceModal = () => {
    const availableSources = OPERATIONAL_SOURCES.filter(source => 
      source.categoryId === selectedCategory
    );

    return (
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
                renderItem={({ item }) => {
                  const factor = EMISSION_FACTORS[item.id];
                  return (
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        {
                          backgroundColor: selectedSource === item.id ? theme.primary + '20' : 'transparent',
                          borderBottomColor: theme.border
                        }
                      ]}
                      onPress={() => {
                        setSelectedSource(item.id);
                        setShowSourceModal(false);
                      }}
                    >
                      <View style={styles.modalItemInfo}>
                        <Text style={[styles.modalItemName, { color: theme.text }]}>
                          {item.name}
                        </Text>
                        {factor && (
                          <Text style={[styles.modalItemFactor, { color: theme.secondaryText }]}>
                            {factor.value} {factor.unit}
                          </Text>
                        )}
                        <Text style={[styles.modalItemUnit, { color: theme.secondaryText }]}>
                          單位: {item.unit}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                style={styles.modalList}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  if (!recordToEdit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="編輯記錄" showBackButton />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>找不到指定的記錄</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="編輯營運記錄" showBackButton />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            {/* 基本資訊 */}
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>基本資訊</Text>
              
              {/* 排放類別選擇 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>排放類別 *</Text>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: theme.background,
                      borderColor: errors.category ? theme.error : theme.border
                    }
                  ]}
                  onPress={() => setShowCategoryModal(true)}
                >
                  {selectedCategory ? (
                    <View style={styles.selectedItem}>
                      {getCategoryIcon(selectedCategory)}
                      <Text style={[styles.selectedText, { color: theme.text }]}>
                        {getCategoryInfo(selectedCategory).name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.placeholder, { color: theme.secondaryText }]}>
                      請選擇排放類別
                    </Text>
                  )}
                  <ChevronRight size={20} color={theme.secondaryText} />
                </TouchableOpacity>
                {errors.category && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{errors.category}</Text>
                )}
              </View>

              {/* 排放源選擇 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>排放源 *</Text>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: theme.background,
                      borderColor: errors.source ? theme.error : theme.border,
                      opacity: selectedCategory ? 1 : 0.5
                    }
                  ]}
                  onPress={() => selectedCategory && setShowSourceModal(true)}
                  disabled={!selectedCategory}
                >
                  {selectedSource ? (
                    <Text style={[styles.selectedText, { color: theme.text }]}>
                      {getSourceInfo(selectedSource).name}
                    </Text>
                  ) : (
                    <Text style={[styles.placeholder, { color: theme.secondaryText }]}>
                      {selectedCategory ? '請選擇排放源' : '請先選擇排放類別'}
                    </Text>
                  )}
                  <ChevronRight size={20} color={theme.secondaryText} />
                </TouchableOpacity>
                {errors.source && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{errors.source}</Text>
                )}
              </View>

              {/* 數量輸入 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>數量 *</Text>
                <View style={styles.quantityContainer}>
                  <TextInput
                    style={[
                      styles.quantityInput,
                      {
                        backgroundColor: theme.background,
                        borderColor: errors.quantity ? theme.error : theme.border,
                        color: theme.text
                      }
                    ]}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="請輸入數量"
                    placeholderTextColor={theme.secondaryText}
                    keyboardType="numeric"
                  />
                  {unit && (
                    <View style={[styles.unitBadge, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={[styles.unitText, { color: theme.primary }]}>{unit}</Text>
                    </View>
                  )}
                </View>
                {errors.quantity && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{errors.quantity}</Text>
                )}
              </View>

              {/* 自動計算的碳排放量 */}
              {calculatedEmissions > 0 && (
                <View style={[styles.calculationResult, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                  <View style={styles.calculationHeader}>
                    <Calculator size={20} color={theme.primary} />
                    <Text style={[styles.calculationTitle, { color: theme.primary }]}>自動計算結果</Text>
                  </View>
                  <Text style={[styles.calculationValue, { color: theme.primary }]}>
                    {formatEmissions(calculatedEmissions)}
                  </Text>
                  {selectedSource && EMISSION_FACTORS[selectedSource] && (
                    <Text style={[styles.calculationFactor, { color: theme.secondaryText }]}>
                      排放係數: {EMISSION_FACTORS[selectedSource].value} {EMISSION_FACTORS[selectedSource].unit}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* 詳細資訊 */}
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>詳細資訊</Text>
              
              {/* 日期 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>日期 *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      borderColor: errors.date ? theme.error : theme.border,
                      color: theme.text
                    }
                  ]}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.secondaryText}
                />
                {errors.date && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{errors.date}</Text>
                )}
              </View>

              {/* 地點 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>地點 *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      borderColor: errors.location ? theme.error : theme.border,
                      color: theme.text
                    }
                  ]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="請輸入發生地點"
                  placeholderTextColor={theme.secondaryText}
                />
                {errors.location && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{errors.location}</Text>
                )}
              </View>

              {/* 備註 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>備註</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text
                    }
                  ]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="請輸入備註（選填）"
                  placeholderTextColor={theme.secondaryText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 儲存按鈕 */}
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.primary,
                opacity: isSaving ? 0.6 : 1
              }
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>
              {isSaving ? '儲存中...' : '儲存修改'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 模態框 */}
      {renderCategoryModal()}
      {renderSourceModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },

  // 區塊樣式
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  // 表單樣式
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 80,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
  },

  // 計算結果樣式
  calculationResult: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  calculationValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  calculationFactor: {
    fontSize: 12,
  },

  // 模態框樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  modalItemScope: {
    fontSize: 12,
  },
  modalItemFactor: {
    fontSize: 12,
    marginBottom: 2,
  },
  modalItemUnit: {
    fontSize: 12,
  },
  scopeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },

  // 底部樣式
  footer: {
    borderTopWidth: 1,
    padding: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 