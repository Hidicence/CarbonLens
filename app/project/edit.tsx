import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Camera, X, DollarSign, Lightbulb } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { useProjectStore } from '@/store/projectStore';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { ProjectStatus } from '@/types/project';
import DatePickerField from '@/components/DatePickerField';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { projects, updateProject } = useProjectStore();
  
  const project = projects.find(p => p.id === id);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [thumbnail, setThumbnail] = useState('');
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState('');
  
  // Carbon budget fields
  const [enableCarbonBudget, setEnableCarbonBudget] = useState(false);
  const [totalCarbonBudget, setTotalCarbonBudget] = useState('');
  const [preProductionBudget, setPreProductionBudget] = useState('');
  const [productionBudget, setProductionBudget] = useState('');
  const [postProductionBudget, setPostProductionBudget] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // 載入專案資料
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setLocation(project.location || '');
      setStatus(project.status);
      setThumbnail(project.thumbnail || '');
      setBudget(project.budget?.toString() || '');
      setStartDate(project.startDate ? new Date(project.startDate) : new Date());
      setEndDate(project.endDate ? new Date(project.endDate) : null);
      
      // Set carbon budget data if exists
      if (project.carbonBudget) {
        setEnableCarbonBudget(true);
        setTotalCarbonBudget(project.carbonBudget.total.toString());
        
        if (project.carbonBudget.stages) {
          setPreProductionBudget(project.carbonBudget.stages['pre-production']?.toString() || '');
          setProductionBudget(project.carbonBudget.stages['production']?.toString() || '');
          setPostProductionBudget(project.carbonBudget.stages['post-production']?.toString() || '');
        }
      }
    } else {
      // 如果找不到專案，返回上一頁
      Alert.alert(t('common.error'), t('projects.empty'));
      router.back();
    }
  }, [project, t]);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = t('projects.name') + t('common.required');
    }
    
    if (!description.trim()) {
      newErrors.description = t('projects.description') + t('common.required');
    }
    
    if (!location.trim()) {
      newErrors.location = t('projects.location') + t('common.required');
    }
    
    if (enableCarbonBudget && !totalCarbonBudget.trim()) {
      newErrors.carbonBudget = t('projects.carbon.budget.total') + t('common.required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Prepare carbon budget data if enabled
    const carbonBudget = enableCarbonBudget ? {
      total: parseFloat(totalCarbonBudget) || 0,
      stages: {
        'pre-production': parseFloat(preProductionBudget) || 0,
        'production': parseFloat(productionBudget) || 0,
        'post-production': parseFloat(postProductionBudget) || 0,
      }
    } : undefined;
    
    // 模擬網絡請求延遲
    setTimeout(() => {
      try {
        updateProject(id, {
          name,
          description,
          location,
          status,
          thumbnail,
          budget: parseFloat(budget) || 0,
          startDate: startDate.toISOString(),
          endDate: endDate ? endDate.toISOString() : undefined,
          carbonBudget,
        });
        
        Alert.alert(t('common.success'), t('projects.update'), [
          { text: t('common.ok'), onPress: () => router.back() }
        ]);
      } catch (error) {
        Alert.alert(t('common.error'), t('common.error'));
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };
  
  const handleSelectThumbnail = () => {
    // 這裡應該實現圖片選擇功能
    // 由於我們沒有實際的圖片選擇器，所以使用一些示例圖片
    const sampleImages = [
      'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1579156412503-f22426588c8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      'https://images.unsplash.com/photo-1616469829581-73993eb86b02?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1159&q=80',
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setThumbnail(randomImage);
  };
  
  const handleClearThumbnail = () => {
    setThumbnail('');
  };
  
  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: 'planning', label: t('status.planning') },
    { value: 'active', label: t('status.active') },
    { value: 'completed', label: t('status.completed') },
    { value: 'on-hold', label: t('status.on-hold') },
  ];
  
  if (!project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('projects.edit')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('projects.edit')} showBackButton />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            {/* 專案名稱 */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.name')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: errors.name ? theme.error : theme.border
                  }
                ]}
                value={name}
                onChangeText={setName}
                placeholder={t('projects.name')}
                placeholderTextColor={theme.secondaryText}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>
              )}
            </View>
            
            {/* 專案描述 */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.description')}</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { 
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: errors.description ? theme.error : theme.border
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('projects.description')}
                placeholderTextColor={theme.secondaryText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.description}</Text>
              )}
            </View>
            
            {/* 拍攝地點 */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.location')}</Text>
              <View style={[
                styles.inputWithIcon,
                { 
                  backgroundColor: theme.card,
                  borderColor: errors.location ? theme.error : theme.border
                }
              ]}>
                <MapPin size={20} color={theme.secondaryText} />
                <TextInput
                  style={[styles.iconInput, { color: theme.text }]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder={t('projects.location')}
                  placeholderTextColor={theme.secondaryText}
                />
              </View>
              {errors.location && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.location}</Text>
              )}
            </View>
            
            {/* 專案預算 */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>專案預算 (選填)</Text>
              <View style={[
                styles.inputWithIcon,
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }
              ]}>
                <DollarSign size={20} color={theme.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.inputWithIconText,
                    { color: theme.text }
                  ]}
                  placeholder="輸入專案預算"
                  placeholderTextColor={theme.secondaryText}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            {/* 開始日期 */}
            <View style={styles.formGroup}>
              <DatePickerField
                label={t('projects.start.date')}
                value={startDate}
                onChange={setStartDate}
                fieldStyle={[
                  styles.datePickerField,
                  { 
                    backgroundColor: theme.card,
                    borderColor: theme.border
                  }
                ]}
              />
            </View>
            
            {/* 結束日期 */}
            <View style={styles.formGroup}>
              <DatePickerField
                label={`${t('projects.end.date')} (${t('common.optional')})`}
                value={endDate || new Date()}
                onChange={(date) => setEndDate(date)}
                placeholder={t('common.optional')}
                minDate={startDate}
                fieldStyle={[
                  styles.datePickerField,
                  { 
                    backgroundColor: theme.card,
                    borderColor: theme.border
                  }
                ]}
              />
            </View>
            
            {/* 專案狀態 */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.status')}</Text>
              <View style={styles.statusOptions}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      { 
                        backgroundColor: status === option.value ? theme.primary : theme.card,
                        borderColor: status === option.value ? theme.primary : theme.border
                      }
                    ]}
                    onPress={() => setStatus(option.value)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        { color: status === option.value ? '#FFFFFF' : theme.text }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Carbon Budget Section */}
            <View style={[styles.carbonBudgetSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.carbonBudgetHeader}>
                <View style={styles.carbonBudgetTitleContainer}>
                  <Lightbulb size={20} color={theme.primary} />
                  <Text style={[styles.carbonBudgetTitle, { color: theme.text }]}>
                    {t('projects.carbon.budget')}
                  </Text>
                </View>
                <Switch
                  value={enableCarbonBudget}
                  onValueChange={setEnableCarbonBudget}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={enableCarbonBudget ? theme.primary : theme.secondaryText}
                />
              </View>
              
              {enableCarbonBudget && (
                <View style={styles.carbonBudgetForm}>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>{t('projects.carbon.budget.total')}</Text>
                    <TextInput
                      style={[
                        styles.input, 

                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: errors.carbonBudget ? theme.error : theme.border
                        }
                      ]}
                      placeholder={t('projects.carbon.budget.total')}
                      placeholderTextColor={theme.secondaryText}
                      value={totalCarbonBudget}
                      onChangeText={setTotalCarbonBudget}
                      keyboardType="numeric"
                    />
                    {errors.carbonBudget && (
                      <Text style={[styles.errorText, { color: theme.error }]}>{errors.carbonBudget}</Text>
                    )}
                    <Text style={[styles.helperText, { color: theme.secondaryText }]}>
                      {t('projects.carbon.budget.total')} (kg CO₂e)
                    </Text>
                  </View>
                  
                  <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
                    {t('stages.title')} ({t('common.optional')})
                  </Text>
                  
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>{t('stage.pre-production')}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      placeholder={t('projects.carbon.budget.pre')}
                      placeholderTextColor={theme.secondaryText}
                      value={preProductionBudget}
                      onChangeText={setPreProductionBudget}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>{t('stage.production')}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      placeholder={t('projects.carbon.budget.production')}
                      placeholderTextColor={theme.secondaryText}
                      value={productionBudget}
                      onChangeText={setProductionBudget}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>{t('stage.post-production')}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      placeholder={t('projects.carbon.budget.post')}
                      placeholderTextColor={theme.secondaryText}
                      value={postProductionBudget}
                      onChangeText={setPostProductionBudget}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}
            </View>
            
            {/* 專案封面 */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.thumbnail')} ({t('common.optional')})</Text>
              
              {thumbnail ? (
                <View style={styles.thumbnailContainer}>
                  <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={[styles.clearThumbnailButton, { backgroundColor: theme.error }]}
                    onPress={handleClearThumbnail}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.thumbnailPlaceholder, { backgroundColor: theme.card }]}
                  onPress={handleSelectThumbnail}
                >
                  <Camera size={32} color={theme.secondaryText} />
                  <Text style={[styles.thumbnailPlaceholderText, { color: theme.secondaryText }]}>
                    {t('projects.thumbnail')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* 提交按鈕 */}
            <View style={styles.buttonContainer}>
              <Button
                title={t('common.cancel')}
                onPress={() => router.back()}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={t('common.save')}
                onPress={handleSubmit}
                variant="primary"
                loading={isLoading}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
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
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
  },
  datePickerField: {
    height: 48,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  clearThumbnailButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 40,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  carbonBudgetSection: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  carbonBudgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  carbonBudgetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carbonBudgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  carbonBudgetForm: {
    padding: 16,
    paddingTop: 0,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIconText: {
    flex: 1,
  },
});