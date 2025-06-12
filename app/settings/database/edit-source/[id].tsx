import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  Pressable, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  AlertTriangle, 
  Trash2, 
  Info,
  X
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useDatabaseStore } from '@/store/databaseStore';
import { ProductionStage } from '@/types/project';
import Header from '@/components/Header';
import Button from '@/components/Button';

export default function EditSourceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useThemeStore();
  const { emissionSources, updateEmissionSource, deleteEmissionSource } = useDatabaseStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const source = emissionSources.find(s => s.id === id);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [stage, setStage] = useState<ProductionStage>('production');
  const [emissionFactor, setEmissionFactor] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [emissionFactorError, setEmissionFactorError] = useState('');
  const [unitError, setUnitError] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    if (source) {
      setName(source.name);
      setCategory(source.category);
      setStage(source.stage);
      setEmissionFactor(source.emissionFactor.toString());
      setUnit(source.unit);
      setDescription(source.description || '');
    }
  }, [source]);
  
  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('請輸入排放源名稱');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!category.trim()) {
      setCategoryError('請輸入類別');
      isValid = false;
    } else {
      setCategoryError('');
    }
    
    if (!emissionFactor.trim() || isNaN(parseFloat(emissionFactor)) || parseFloat(emissionFactor) <= 0) {
      setEmissionFactorError('請輸入有效的排放係數');
      isValid = false;
    } else {
      setEmissionFactorError('');
    }
    
    if (!unit.trim()) {
      setUnitError('請輸入單位');
      isValid = false;
    } else {
      setUnitError('');
    }
    
    return isValid;
  };
  
  const handleSave = () => {
    if (!validateForm() || !source) return;
    
    setIsSaving(true);
    
    // 模擬保存延遲
    setTimeout(() => {
      updateEmissionSource(id, {
        name,
        category,
        stage,
        emissionFactor: parseFloat(emissionFactor),
        unit,
        description: description.trim() || undefined
      });
      
      setIsSaving(false);
      Alert.alert('成功', '排放源已更新');
      router.back();
    }, 800);
  };
  
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    
    // 模擬刪除延遲
    setTimeout(() => {
      deleteEmissionSource(id);
      setIsDeleting(false);
      Alert.alert('成功', '排放源已刪除');
      router.back();
    }, 800);
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
  
  if (!source) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="編輯排放源" 
          showBackButton 
          onBackPress={() => router.back()}
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: theme.secondaryText }]}>找不到排放源</Text>
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
          title="編輯排放源" 
          showBackButton 
          onBackPress={() => router.back()}
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>正在保存排放源...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (isDeleting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="刪除排放源" 
          showBackButton 
          onBackPress={() => router.back()}
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>正在刪除排放源...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="編輯排放源" 
        showBackButton 
        onBackPress={() => router.back()}
        textColor={theme.text}
        iconColor={theme.text}
        rightComponent={
          <Pressable style={styles.headerButton} onPress={handleDelete}>
            <Trash2 size={24} color={theme.error} />
          </Pressable>
        }
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>排放源名稱</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: theme.text,
                    backgroundColor: theme.card,
                    borderColor: nameError ? theme.error : theme.border
                  }
                ]}
                value={name}
                onChangeText={setName}
                placeholder="輸入排放源名稱"
                placeholderTextColor={theme.secondaryText}
              />
              {nameError ? <Text style={[styles.errorText, { color: theme.error }]}>{nameError}</Text> : null}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>類別</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: theme.text,
                    backgroundColor: theme.card,
                    borderColor: categoryError ? theme.error : theme.border
                  }
                ]}
                value={category}
                onChangeText={setCategory}
                placeholder="輸入類別"
                placeholderTextColor={theme.secondaryText}
              />
              {categoryError ? <Text style={[styles.errorText, { color: theme.error }]}>{categoryError}</Text> : null}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>製作階段</Text>
              <View style={styles.stagesContainer}>
                {Object.entries(stageLabels).map(([stageKey, stageLabel]) => (
                  <Pressable
                    key={stageKey}
                    style={[
                      styles.stageChip,
                      { 
                        backgroundColor: stage === stageKey 
                          ? getStageColor(stageKey as ProductionStage) + '30' 
                          : theme.card,
                        borderColor: stage === stageKey 
                          ? getStageColor(stageKey as ProductionStage) 
                          : theme.border
                      }
                    ]}
                    onPress={() => setStage(stageKey as ProductionStage)}
                  >
                    <Text 
                      style={[
                        styles.stageChipText,
                        { 
                          color: stage === stageKey 
                            ? getStageColor(stageKey as ProductionStage) 
                            : theme.text 
                        }
                      ]}
                    >
                      {stageLabel}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>排放係數</Text>
              <View style={styles.factorContainer}>
                <TextInput
                  style={[
                    styles.factorInput, 
                    { 
                      color: theme.text,
                      backgroundColor: theme.card,
                      borderColor: emissionFactorError ? theme.error : theme.border
                    }
                  ]}
                  value={emissionFactor}
                  onChangeText={setEmissionFactor}
                  placeholder="輸入排放係數"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                />
                
                <Text style={[styles.factorUnit, { color: theme.text }]}>kg CO₂e/</Text>
                
                <TextInput
                  style={[
                    styles.unitInput, 
                    { 
                      color: theme.text,
                      backgroundColor: theme.card,
                      borderColor: unitError ? theme.error : theme.border
                    }
                  ]}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="單位"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>
              {emissionFactorError ? <Text style={[styles.errorText, { color: theme.error }]}>{emissionFactorError}</Text> : null}
              {unitError ? <Text style={[styles.errorText, { color: theme.error }]}>{unitError}</Text> : null}
              
              <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                <Info size={16} color={theme.primary} />
                <Text style={[styles.infoText, { color: theme.primary }]}>
                  排放係數是指每單位活動產生的溫室氣體排放量，單位為 kg CO₂e/單位。
                </Text>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>描述 (選填)</Text>
              <TextInput
                style={[
                  styles.textArea, 
                  { 
                    color: theme.text,
                    backgroundColor: theme.card,
                    borderColor: theme.border
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="輸入描述"
                placeholderTextColor={theme.secondaryText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="取消"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="保存"
              onPress={handleSave}
              variant="primary"
              style={styles.saveButton}
            />
          </View>
          
          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmContainer, { backgroundColor: theme.card }]}>
            <View style={styles.confirmHeader}>
              <Text style={[styles.confirmTitle, { color: theme.text }]}>刪除排放源</Text>
              <Pressable onPress={() => setShowDeleteConfirm(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
            
            <View style={styles.confirmContent}>
              <View style={[styles.warningContainer, { backgroundColor: theme.error + '10' }]}>
                <AlertTriangle size={24} color={theme.error} />
                <Text style={[styles.warningText, { color: theme.error }]}>
                  此操作將永久刪除此排放源，無法恢復！
                </Text>
              </View>
              
              <Text style={[styles.confirmText, { color: theme.text }]}>
                確定要刪除「{source.name}」排放源嗎？
              </Text>
            </View>
            
            <View style={styles.confirmActions}>
              <Button
                title="取消"
                onPress={() => setShowDeleteConfirm(false)}
                variant="outline"
                style={styles.confirmCancelButton}
              />
              <Button
                title="確認刪除"
                onPress={confirmDelete}
                variant="outline"
                style={styles.confirmDeleteButton}
                textStyle={{ color: theme.error }}
                icon={<Trash2 size={16} color={theme.error} />}
              />
            </View>
          </View>
        </View>
      )}
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
  headerButton: {
    padding: 8,
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
  stagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  stageChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  factorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factorInput: {
    flex: 2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  factorUnit: {
    fontSize: 16,
    marginRight: 8,
  },
  unitInput: {
    flex: 1,
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
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  footer: {
    height: 40,
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmContainer: {
    width: '85%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  confirmContent: {
    padding: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  confirmCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmDeleteButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: Colors.dark.error,
  },
});