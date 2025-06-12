import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Save,
  Plus,
  Edit3,
  Trash2,
  Settings,
  ChevronDown,
  X,
  Star,
  StarOff,
  Info
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { AllocationParameters } from '@/types/project';

export default function AllocationParametersScreen() {
  const router = useRouter();
  const { 
    allocationParameters, 
    addAllocationParameters, 
    updateAllocationParameters, 
    deleteAllocationParameters,
    getDefaultAllocationParameters,
    setDefaultAllocationParameters
  } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParam, setEditingParam] = useState<AllocationParameters | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    preProduction: '60',
    production: '0',
    postProduction: '40',
    scope1: '1',
    scope2: '1',
    scope3: '1',
    isDefault: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 重置表單
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      preProduction: '60',
      production: '0',
      postProduction: '40',
      scope1: '1',
      scope2: '1',
      scope3: '1',
      isDefault: false
    });
    setErrors({});
  };

  // 驗證表單
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '請輸入參數名稱';
    }
    
    const preProduction = parseFloat(formData.preProduction);
    const production = parseFloat(formData.production);
    const postProduction = parseFloat(formData.postProduction);
    
    if (isNaN(preProduction) || preProduction < 0 || preProduction > 100) {
      newErrors.preProduction = '前期製作比例必須在0-100之間';
    }
    
    if (isNaN(production) || production < 0 || production > 100) {
      newErrors.production = '製作期比例必須在0-100之間';
    }
    
    if (isNaN(postProduction) || postProduction < 0 || postProduction > 100) {
      newErrors.postProduction = '後期製作比例必須在0-100之間';
    }
    
    // 製作期固定為0，只驗證前期和後期
    const totalPercentage = preProduction + postProduction;
    if (Math.abs(totalPercentage - 100) > 0.1) {
      newErrors.total = '前期製作和後期製作比例總和必須等於100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 打開新增模態框
  const openAddModal = () => {
    resetForm();
    setEditingParam(null);
    setShowAddModal(true);
  };

  // 打開編輯模態框
  const openEditModal = (param: AllocationParameters) => {
    setFormData({
      name: param.name,
      description: param.description,
      preProduction: param.stageAllocations.preProduction.toString(),
      production: param.stageAllocations.production.toString(),
      postProduction: param.stageAllocations.postProduction.toString(),
      scope1: param.scopeWeights?.scope1?.toString() || '1',
      scope2: param.scopeWeights?.scope2?.toString() || '1',
      scope3: param.scopeWeights?.scope3?.toString() || '1',
      isDefault: param.isDefault
    });
    setEditingParam(param);
    setErrors({});
    setShowAddModal(true);
  };

  // 儲存參數
  const handleSave = () => {
    if (!validateForm()) return;

    const paramData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      stageAllocations: {
        preProduction: parseFloat(formData.preProduction),
        production: 0, // 拍攝階段不參與分攤
        postProduction: parseFloat(formData.postProduction),
      },
      scopeWeights: {
        scope1: parseFloat(formData.scope1),
        scope2: parseFloat(formData.scope2),
        scope3: parseFloat(formData.scope3),
      },
      isDefault: formData.isDefault
    };

    try {
      if (editingParam) {
        updateAllocationParameters(editingParam.id, paramData);
        Alert.alert('更新成功', '分攤參數已更新');
      } else {
        addAllocationParameters(paramData);
        Alert.alert('新增成功', '分攤參數已新增');
      }
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('儲存失敗', '請稍後再試');
    }
  };

  // 刪除參數
  const handleDelete = (param: AllocationParameters) => {
    Alert.alert(
      '確認刪除',
      `確定要刪除「${param.name}」嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => {
            deleteAllocationParameters(param.id);
            Alert.alert('刪除成功', '分攤參數已刪除');
          }
        }
      ]
    );
  };

  // 設為預設
  const handleSetDefault = (param: AllocationParameters) => {
    setDefaultAllocationParameters(param.id);
    Alert.alert('設定成功', `「${param.name}」已設為預設參數`);
  };

  // 獲取目前預設參數
  const defaultParam = getDefaultAllocationParameters();
  const allParams = [...allocationParameters];
  
  // 如果系統預設不在列表中，加入
  if (!allParams.find(p => p.id === defaultParam.id)) {
    allParams.unshift(defaultParam);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="分攤參數設定" 
        showBackButton 
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={openAddModal}>
            <Plus size={24} color={theme.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 說明卡片 */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.infoHeader}>
            <Info size={20} color={theme.primary} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>分攤參數說明</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            日常營運排放將分攤至各專案的前期製作和後期製作階段。拍攝階段的排放由拍攝日記錄直接記錄，不參與分攤。前期和後期的分攤比例總和必須為100%。
          </Text>
        </View>

        {/* 參數列表 */}
        <View style={styles.parametersList}>
          {allParams.map((param) => (
            <View key={param.id} style={[styles.parameterCard, { backgroundColor: theme.card }]}>
              <View style={styles.parameterHeader}>
                <View style={styles.parameterTitleSection}>
                  <View style={styles.parameterTitleRow}>
                    <Text style={[styles.parameterName, { color: theme.text }]}>
                      {param.name}
                    </Text>
                    {param.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
                        <Star size={12} color="white" />
                        <Text style={styles.defaultBadgeText}>預設</Text>
                      </View>
                    )}
                  </View>
                  {param.description && (
                    <Text style={[styles.parameterDescription, { color: theme.secondaryText }]}>
                      {param.description}
                    </Text>
                  )}
                </View>
                
                <View style={styles.parameterActions}>
                  {!param.isDefault && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.background }]}
                      onPress={() => handleSetDefault(param)}
                    >
                      <StarOff size={16} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                  
                  {param.id !== 'default' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.background }]}
                        onPress={() => openEditModal(param)}
                      >
                        <Edit3 size={16} color={theme.primary} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.background }]}
                        onPress={() => handleDelete(param)}
                      >
                        <Trash2 size={16} color={theme.error} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              
              {/* 階段分配比例 */}
              <View style={styles.allocationBreakdown}>
                <Text style={[styles.breakdownTitle, { color: theme.text }]}>階段分配比例</Text>
                <View style={styles.breakdownBars}>
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownLabel, { color: theme.secondaryText }]}>
                      前期製作
                    </Text>
                    <View style={[styles.breakdownBar, { backgroundColor: theme.background }]}>
                      <View
                        style={[
                          styles.breakdownFill,
                          { 
                            backgroundColor: '#3B82F6',
                            width: `${param.stageAllocations.preProduction}%`
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.breakdownValue, { color: theme.text }]}>
                      {param.stageAllocations.preProduction}%
                    </Text>
                  </View>
                  
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownLabel, { color: theme.secondaryText }]}>
                      製作期
                    </Text>
                    <View style={[styles.breakdownBar, { backgroundColor: theme.background }]}>
                      <View
                        style={[
                          styles.breakdownFill,
                          { 
                            backgroundColor: '#10B981',
                            width: `${param.stageAllocations.production}%`
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.breakdownValue, { color: theme.text }]}>
                      {param.stageAllocations.production}%
                    </Text>
                  </View>
                  
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownLabel, { color: theme.secondaryText }]}>
                      後期製作
                    </Text>
                    <View style={[styles.breakdownBar, { backgroundColor: theme.background }]}>
                      <View
                        style={[
                          styles.breakdownFill,
                          { 
                            backgroundColor: '#F59E0B',
                            width: `${param.stageAllocations.postProduction}%`
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.breakdownValue, { color: theme.text }]}>
                      {param.stageAllocations.postProduction}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 新增/編輯模態框 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingParam ? '編輯參數' : '新增參數'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Save size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* 基本資訊 */}
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>基本資訊</Text>
              
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>參數名稱 *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: errors.name ? theme.error : theme.border
                    }
                  ]}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="例如：前期製作重點分攤"
                  placeholderTextColor={theme.secondaryText}
                />
                {errors.name && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>描述說明</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    { 
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border
                    }
                  ]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="描述此參數的用途和特點"
                  placeholderTextColor={theme.secondaryText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* 階段分配比例 */}
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>階段分配比例</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
                設定前期製作和後期製作的分攤比例，拍攝階段由拍攝日記錄直接計算
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>前期製作 (%)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: errors.preProduction ? theme.error : theme.border
                    }
                  ]}
                  value={formData.preProduction}
                  onChangeText={(text) => {
                    const preValue = parseFloat(text) || 0;
                    const postValue = Math.max(0, 100 - preValue);
                    setFormData(prev => ({ 
                      ...prev, 
                      preProduction: text,
                      postProduction: postValue.toString()
                    }));
                  }}
                  placeholder="0-100"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                />
                {errors.preProduction && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{errors.preProduction}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>後期製作 (%)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: errors.postProduction ? theme.error : theme.border
                    }
                  ]}
                  value={formData.postProduction}
                  onChangeText={(text) => {
                    const postValue = parseFloat(text) || 0;
                    const preValue = Math.max(0, 100 - postValue);
                    setFormData(prev => ({ 
                      ...prev, 
                      postProduction: text,
                      preProduction: preValue.toString()
                    }));
                  }}
                  placeholder="0-100"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                />
                {errors.postProduction && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{errors.postProduction}</Text>
                )}
              </View>

              {/* 拍攝階段說明 */}
              <View style={[styles.infoNote, { backgroundColor: theme.background }]}>
                <Text style={[styles.infoNoteText, { color: theme.secondaryText }]}>
                  📝 拍攝階段排放由拍攝日記錄直接計算，不參與分攤
                </Text>
              </View>

              {errors.total && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.total}</Text>
              )}

              {/* 比例預覽 */}
              <View style={styles.percentagePreview}>
                <Text style={[styles.previewLabel, { color: theme.text }]}>總計</Text>
                <Text style={[
                  styles.previewValue,
                  { 
                    color: Math.abs((parseFloat(formData.preProduction) || 0) + 
                                    (parseFloat(formData.postProduction) || 0) - 100) > 0.1 
                      ? theme.error : theme.success
                  }
                ]}>
                  {((parseFloat(formData.preProduction) || 0) + 
                    (parseFloat(formData.postProduction) || 0)).toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* 範疇權重（進階設定） */}
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>範疇權重（選用）</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
                設定不同排放範疇的權重，預設均為1
              </Text>

              <View style={styles.scopeWeights}>
                <View style={styles.scopeWeightItem}>
                  <Text style={[styles.scopeLabel, { color: theme.text }]}>範疇1</Text>
                  <TextInput
                    style={[
                      styles.scopeInput,
                      { 
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.border
                      }
                    ]}
                    value={formData.scope1}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, scope1: text }))}
                    placeholder="1"
                    placeholderTextColor={theme.secondaryText}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.scopeWeightItem}>
                  <Text style={[styles.scopeLabel, { color: theme.text }]}>範疇2</Text>
                  <TextInput
                    style={[
                      styles.scopeInput,
                      { 
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.border
                      }
                    ]}
                    value={formData.scope2}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, scope2: text }))}
                    placeholder="1"
                    placeholderTextColor={theme.secondaryText}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.scopeWeightItem}>
                  <Text style={[styles.scopeLabel, { color: theme.text }]}>範疇3</Text>
                  <TextInput
                    style={[
                      styles.scopeInput,
                      { 
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.border
                      }
                    ]}
                    value={formData.scope3}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, scope3: text }))}
                    placeholder="1"
                    placeholderTextColor={theme.secondaryText}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* 設為預設 */}
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={[styles.switchLabel, { color: theme.text }]}>設為預設參數</Text>
                  <Text style={[styles.switchDesc, { color: theme.secondaryText }]}>
                    新的分攤作業將自動使用此參數
                  </Text>
                </View>
                <Switch
                  value={formData.isDefault}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isDefault: value }))}
                  thumbColor={formData.isDefault ? theme.primary : theme.secondaryText}
                  trackColor={{ false: theme.border, true: theme.primary + '40' }}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  parametersList: {
    gap: 16,
  },
  parameterCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  parameterTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  parameterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  parameterDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  parameterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allocationBreakdown: {
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  breakdownBars: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownLabel: {
    width: 60,
    fontSize: 12,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    width: 40,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  percentagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  scopeWeights: {
    flexDirection: 'row',
    gap: 12,
  },
  scopeWeightItem: {
    flex: 1,
    alignItems: 'center',
  },
  scopeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  scopeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoNote: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoNoteText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
}); 