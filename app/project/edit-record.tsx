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
  Keyboard
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, MapPin, Info, Check, ChevronDown, ChevronUp, AlertCircle, Trash2 } from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { EMISSION_CATEGORIES, STAGE_CATEGORIES, EMISSION_SOURCES } from '@/mocks/projects';
import { ProductionStage, EmissionSource } from '@/types/project';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import DatePickerField from '@/components/DatePickerField';

export default function EditRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { emissionRecords, updateEmissionRecord, deleteEmissionRecord } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 從所有項目的排放記錄中查找指定記錄
  const record = Object.values(emissionRecords)
    .flat()
    .find(r => r.id === id);
  
  const [stage, setStage] = useState<ProductionStage>('production');
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // 展開/收起區段的狀態
  const [expandedSections, setExpandedSections] = useState({
    stage: true,
    category: true,
    source: true,
    details: true,
    optional: true
  });
  
  const [stageError, setStageError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [sourceError, setSourceError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [dateError, setDateError] = useState('');
  
  // 獲取基於選擇階段的類別 - 添加安全檢查
  const stageCategories = (STAGE_CATEGORIES && STAGE_CATEGORIES[stage]) ? STAGE_CATEGORIES[stage] : [];
  
  // 獲取基於選擇階段和類別的排放源
  const [availableSources, setAvailableSources] = useState<EmissionSource[]>([]);
  
  // 選擇的排放源
  const [selectedSource, setSelectedSource] = useState<EmissionSource | null>(null);
  
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
  
  // 載入記錄數據
  useEffect(() => {
    if (record) {
      setStage(record.stage);
      setCategoryId(record.categoryId || '');
      setDescription(record.description);
      setSourceId(record.sourceId || '');
      setQuantity(record.quantity ? record.quantity.toString() : '');
      setCalculatedAmount(record.amount);
      
      // 設置日期
      setDate(new Date(record.date));
      
      setLocation(record.location || '');
      setNotes(record.notes || '');
    }
  }, [record]);
  
  useEffect(() => {
    if (categoryId) {
      // 找到選擇類別的名稱
      const selectedCategory = stageCategories.find(cat => cat.id === categoryId);
      if (selectedCategory) {
        // 過濾出屬於該類別和階段的排放源
        const sources = EMISSION_SOURCES.filter(
          source => source.categoryId === categoryId && source.stage === stage
        );
        setAvailableSources(sources);
      }
    } else {
      setAvailableSources([]);
    }
  }, [categoryId, stage, stageCategories]);
  
  useEffect(() => {
    // 當排放源改變時，更新選擇的排放源對象
    if (sourceId) {
      const source = availableSources.find(s => s.id === sourceId);
      setSelectedSource(source || null);
    } else {
      setSelectedSource(null);
    }
  }, [sourceId, availableSources]);
  
  // 當數量變化時自動計算排放量
  useEffect(() => {
    if (selectedSource && quantity && !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0) {
      calculateEmission();
    }
  }, [quantity, selectedSource]);
  
  // 計算碳排放量
  const calculateEmission = () => {
    if (!selectedSource || !quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setQuantityError('請輸入有效的數量');
      return;
    }
    
    setIsCalculating(true);
    
    // 模擬計算延遲，實際應用中可以移除
    setTimeout(() => {
      const quantityValue = parseFloat(quantity);
      const emissionFactor = selectedSource.emissionFactor;
      const calculatedValue = quantityValue * emissionFactor;
      
      setCalculatedAmount(calculatedValue);
      setQuantityError('');
      
      setIsCalculating(false);
      
      // 自動展開詳細資訊區段
      setExpandedSections(prev => ({...prev, details: true}));
    }, 300);
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (!stage) {
      setStageError('請選擇製作階段');
      isValid = false;
    } else {
      setStageError('');
    }
    
    if (!categoryId) {
      setCategoryError('請選擇排放類別');
      isValid = false;
    } else {
      setCategoryError('');
    }
    
    if (!sourceId) {
      setSourceError('請選擇排放源');
      isValid = false;
    } else {
      setSourceError('');
    }
    
    if (!description.trim()) {
      setDescriptionError('請輸入排放描述');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setQuantityError('請輸入有效的數量');
      isValid = false;
    } else {
      setQuantityError('');
      
      // 如果數量有效但尚未計算，立即計算
      if (!calculatedAmount && selectedSource) {
        const quantityValue = parseFloat(quantity);
        const emissionFactor = selectedSource.emissionFactor;
        const calculatedValue = quantityValue * emissionFactor;
        setCalculatedAmount(calculatedValue);
      }
    }
    
    if (!date) {
      setDateError('請選擇日期');
      isValid = false;
    } else {
      setDateError('');
    }
    
    return isValid;
  };
  
  const handleUpdateRecord = () => {
    if (!validateForm() || !record) return;
    
    // 如果數量有效但尚未計算，立即計算
    if (!calculatedAmount && selectedSource && quantity) {
      const quantityValue = parseFloat(quantity);
      const emissionFactor = selectedSource.emissionFactor;
      const calculatedValue = quantityValue * emissionFactor;
      setCalculatedAmount(calculatedValue);
    }
    
    if (!calculatedAmount) {
      Alert.alert('錯誤', '無法計算碳排放量，請檢查輸入數據');
      return;
    }
    
    setIsSaving(true);
    
    // 模擬保存延遲
    setTimeout(() => {
      updateEmissionRecord(id, {
        category: record.category, // Keep original category for compatibility
        categoryId,
        stage,
        description,
        title: description, // For compatibility
        amount: calculatedAmount,
        date: date.toISOString(),
        location: location || undefined,
        notes: notes || undefined,
        sourceId: sourceId,
        quantity: parseFloat(quantity),
        unit: selectedSource?.unit || '',
      });
      
      setIsSaving(false);
      Alert.alert('成功', '碳排放記錄已更新');
      router.back();
    }, 800);
  };
  
  const handleDeleteRecord = () => {
    Alert.alert(
      "刪除記錄",
      "確定要刪除此碳排放記錄嗎？此操作無法復原。",
      [
        {
          text: "取消",
          style: "cancel"
        },
        { 
          text: "確認刪除", 
          onPress: () => {
            setIsDeleting(true);
            
            // 模擬刪除延遲
            setTimeout(() => {
              deleteEmissionRecord(id);
              setIsDeleting(false);
              Alert.alert("成功", "碳排放記錄已刪除");
              router.back();
            }, 800);
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleCancel = () => {
    router.back();
  };

  const stageLabels = {
    'pre-production': '前期製作',
    'production': '拍攝階段',
    'post-production': '後期製作'
  };

  function getStageColor(stageType: ProductionStage): string {
    switch(stageType) {
      case 'pre-production':
        return '#6C63FF'; // Purple
      case 'production':
        return '#4ECDC4'; // Teal
      case 'post-production':
        return '#FF6B6B'; // Red
      default:
        return '#AAAAAA';
    }
  }
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!record) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="編輯記錄" 
          showBackButton 
          onBackPress={() => router.back()}
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: theme.text }]}>找不到記錄</Text>
          <Button 
            title="返回" 
            onPress={() => router.back()} 
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isSaving) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="保存記錄" 
          showBackButton 
          onBackPress={() => router.back()}
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>正在保存記錄...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isDeleting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="刪除記錄" 
          showBackButton 
          onBackPress={() => router.back()}
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>正在刪除記錄...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="編輯碳排放記錄" 
        showBackButton 
        onBackPress={() => router.back()}
        textColor={theme.text}
        iconColor={theme.text}
        rightComponent={
          <TouchableOpacity onPress={handleCancel}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        }
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: keyboardVisible ? 120 : 20 }}
        >
          <View style={styles.formContainer}>
            {/* 製作階段區段 */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
              <TouchableOpacity 
                style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
                onPress={() => toggleSection('stage')}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>製作階段</Text>
                <View style={styles.sectionHeaderRight}>
                  {expandedSections.stage ? 
                    <ChevronUp size={20} color={theme.text} /> : 
                    <ChevronDown size={20} color={theme.text} />
                  }
                </View>
              </TouchableOpacity>
              
              {expandedSections.stage && (
                <View style={styles.formGroup}>
                  <View style={styles.stagesContainer}>
                    {Object.entries(stageLabels).map(([stageKey, stageLabel]) => (
                      <TouchableOpacity
                        key={stageKey}
                        style={[
                          styles.stageChip,
                          { 
                            backgroundColor: theme.background,
                            borderColor: theme.border
                          },
                          stage === stageKey && { 
                            backgroundColor: getStageColor(stageKey as ProductionStage) + '30',
                            borderColor: getStageColor(stageKey as ProductionStage)
                          }
                        ]}
                        onPress={() => setStage(stageKey as ProductionStage)}
                      >
                        <Text 
                          style={[
                            styles.stageChipText,
                            { color: theme.text },
                            stage === stageKey && { color: getStageColor(stageKey as ProductionStage) }
                          ]}
                        >
                          {stageLabel}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {stageError ? <Text style={[styles.errorText, { color: theme.error }]}>{stageError}</Text> : null}
                </View>
              )}
            </View>
            
            {/* 排放類別區段 */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
              <TouchableOpacity 
                style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
                onPress={() => toggleSection('category')}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>排放類別</Text>
                <View style={styles.sectionHeaderRight}>
                  {expandedSections.category ? 
                    <ChevronUp size={20} color={theme.text} /> : 
                    <ChevronDown size={20} color={theme.text} />
                  }
                </View>
              </TouchableOpacity>
              
              {expandedSections.category && (
                <View style={styles.formGroup}>
                  <View style={styles.categoriesContainer}>
                    {stageCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          { 
                            backgroundColor: theme.background,
                            borderColor: theme.border
                          },
                          categoryId === category.id && { 
                            backgroundColor: category.color + '30',
                            borderColor: category.color
                          }
                        ]}
                        onPress={() => setCategoryId(category.id)}
                      >
                        <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                        <Text 
                          style={[
                            styles.categoryChipText,
                            { color: theme.text },
                            categoryId === category.id && { color: category.color }
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {categoryError ? <Text style={[styles.errorText, { color: theme.error }]}>{categoryError}</Text> : null}
                </View>
              )}
            </View>
            
            {/* 排放源區段 */}
            {categoryId && (
              <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
                <TouchableOpacity 
                  style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
                  onPress={() => toggleSection('source')}
                >
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>排放源與數量</Text>
                  <View style={styles.sectionHeaderRight}>
                    {expandedSections.source ? 
                      <ChevronUp size={20} color={theme.text} /> : 
                      <ChevronDown size={20} color={theme.text} />
                    }
                  </View>
                </TouchableOpacity>
                
                {expandedSections.source && (
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>選擇排放源</Text>
                    <View style={styles.sourcesContainer}>
                      {availableSources.map((source) => (
                        <TouchableOpacity
                          key={source.id}
                          style={[
                            styles.sourceChip,
                            { 
                              backgroundColor: theme.background,
                              borderColor: theme.border
                            },
                            sourceId === source.id && {
                              backgroundColor: theme.primary + '30',
                              borderColor: theme.primary
                            }
                          ]}
                          onPress={() => setSourceId(source.id)}
                        >
                          <Text
                            style={[
                              styles.sourceChipText,
                              { color: theme.text },
                              sourceId === source.id && { color: theme.primary }
                            ]}
                          >
                            {source.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {sourceError ? <Text style={[styles.errorText, { color: theme.error }]}>{sourceError}</Text> : null}
                    
                    {selectedSource && (
                      <View style={[styles.quantityContainer, { backgroundColor: theme.background + '80' }]}>
                        <Text style={[styles.label, { color: theme.text }]}>
                          {`輸入${selectedSource.name}的${selectedSource.unit}`}
                        </Text>
                        <View style={styles.calculationContainer}>
                          <TextInput
                            style={[
                              styles.calculationInput, 
                              { 
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderColor: theme.border
                              },
                              quantityError ? { borderColor: theme.error } : null
                            ]}
                            placeholder={`輸入${selectedSource.unit}數量`}
                            placeholderTextColor={theme.secondaryText}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                          />
                        </View>
                        {quantityError ? <Text style={[styles.errorText, { color: theme.error }]}>{quantityError}</Text> : null}
                        
                        {isCalculating && (
                          <View style={styles.calculatingContainer}>
                            <ActivityIndicator size="small" color={theme.primary} />
                            <Text style={[styles.calculatingText, { color: theme.primary }]}>計算中...</Text>
                          </View>
                        )}
                        
                        {calculatedAmount !== null && !isCalculating && (
                          <View style={[styles.resultContainer, { backgroundColor: theme.success + '10' }]}>
                            <View style={styles.resultHeader}>
                              <Check size={16} color={theme.success} />
                              <Text style={[styles.resultTitle, { color: theme.success }]}>計算結果</Text>
                            </View>
                            <Text style={[styles.resultValue, { color: theme.text }]}>
                              {calculatedAmount.toFixed(2)} 公斤CO₂e
                            </Text>
                            <Text style={[styles.resultFormula, { color: theme.secondaryText }]}>
                              計算公式: {quantity} {selectedSource.unit} × {selectedSource.emissionFactor} kg CO₂e/{selectedSource.unit}
                            </Text>
                          </View>
                        )}
                        
                        <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                          <Info size={16} color={theme.primary} />
                          <Text style={[styles.infoText, { color: theme.primary }]}>
                            {selectedSource.description || `${selectedSource.name}的碳排放係數為 ${selectedSource.emissionFactor} kg CO₂e/${selectedSource.unit}`}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
            
            {/* 詳細資訊區段 */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
              <TouchableOpacity 
                style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
                onPress={() => toggleSection('details')}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>詳細資訊</Text>
                <View style={styles.sectionHeaderRight}>
                  {expandedSections.details ? 
                    <ChevronUp size={20} color={theme.text} /> : 
                    <ChevronDown size={20} color={theme.text} />
                  }
                </View>
              </TouchableOpacity>
              
              {expandedSections.details && (
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>排放描述</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.border
                      },
                      descriptionError ? { borderColor: theme.error } : null
                    ]}
                    placeholder="輸入排放描述"
                    placeholderTextColor={theme.secondaryText}
                    value={description}
                    onChangeText={setDescription}
                  />
                  {descriptionError ? <Text style={[styles.errorText, { color: theme.error }]}>{descriptionError}</Text> : null}
                  
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
                        backgroundColor: theme.background,
                        borderColor: dateError ? theme.error : theme.border
                      }
                    ]}
                  />
                </View>
              )}
            </View>
            
            {/* 選填資訊區段 */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
              <TouchableOpacity 
                style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
                onPress={() => toggleSection('optional')}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>選填資訊</Text>
                <View style={styles.sectionHeaderRight}>
                  {expandedSections.optional ? 
                    <ChevronUp size={20} color={theme.text} /> : 
                    <ChevronDown size={20} color={theme.text} />
                  }
                </View>
              </TouchableOpacity>
              
              {expandedSections.optional && (
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>地點 (選填)</Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <MapPin size={20} color={theme.secondaryText} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputWithIconText, { color: theme.text }]}
                      placeholder="輸入地點"
                      placeholderTextColor={theme.secondaryText}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                  
                  <Text style={[styles.label, { color: theme.text }]}>備註 (選填)</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="輸入備註"
                    placeholderTextColor={theme.secondaryText}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              )}
            </View>

            <View style={[styles.tipContainer, { backgroundColor: theme.secondary + '10' }]}>
              <AlertCircle size={16} color={theme.secondary} />
              <Text style={[styles.tipText, { color: theme.secondary }]}>
                提示：修改排放源或數量後，系統將自動重新計算碳排放量
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.deleteButton, { borderColor: theme.error }]}
              onPress={handleDeleteRecord}
            >
              <Trash2 size={16} color={theme.error} />
              <Text style={[styles.deleteButtonText, { color: theme.error }]}>刪除此記錄</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <Button
            title="取消"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="保存修改"
            onPress={handleUpdateRecord}
            variant="primary"
            style={styles.addButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  sectionContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  formGroup: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  stagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  stageChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    minWidth: 90,
  },
  stageChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
  },
  sourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sourceChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  sourceChipText: {
    fontSize: 14,
  },
  quantityContainer: {
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
  },
  calculationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calculationInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  calculatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
  },
  calculatingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  resultContainer: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultFormula: {
    fontSize: 12,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputIcon: {
    marginLeft: 12,
  },
  inputWithIconText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  datePickerField: {
    height: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 24,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});