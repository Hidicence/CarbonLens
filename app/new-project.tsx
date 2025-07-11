import React, { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
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
  Image,
  Keyboard,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, MapPin, Image as ImageIcon, DollarSign, Lightbulb } from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import DatePickerField from '@/components/DatePickerField';

export default function NewProjectScreen() {
  const router = useRouter();
  const { addProject } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [budget, setBudget] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Carbon budget fields
  const [enableCarbonBudget, setEnableCarbonBudget] = useState(false);
  const [totalCarbonBudget, setTotalCarbonBudget] = useState('');
  const [preProductionBudget, setPreProductionBudget] = useState('');
  const [productionBudget, setProductionBudget] = useState('');
  const [postProductionBudget, setPostProductionBudget] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [carbonBudgetError, setCarbonBudgetError] = useState('');
  
  // 監聽鍵盤顯示/隱藏事件
  React.useEffect(() => {
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
  
  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError(t('validation.required').replace('{field}', t('projects.name')));
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!description.trim()) {
      setDescriptionError(t('validation.required').replace('{field}', t('projects.description')));
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    if (!location.trim()) {
      setLocationError(t('validation.required').replace('{field}', t('projects.location')));
      isValid = false;
    } else {
      setLocationError('');
    }
    
    if (!startDate) {
      setStartDateError(t('validation.required').replace('{field}', t('projects.start.date')));
      isValid = false;
    } else {
      setStartDateError('');
    }
    
    if (enableCarbonBudget && !totalCarbonBudget.trim()) {
      setCarbonBudgetError(t('validation.required').replace('{field}', t('projects.carbon.budget.total')));
      isValid = false;
    } else {
      setCarbonBudgetError('');
    }
    
    return isValid;
  };
  
  const handleCreateProject = async () => {
    if (!validateForm()) return;
    
    try {
    // Prepare carbon budget data if enabled
    const carbonBudget = enableCarbonBudget ? {
      total: parseFloat(totalCarbonBudget) || 0,
      preProduction: parseFloat(preProductionBudget) || 0,
      production: parseFloat(productionBudget) || 0,
      postProduction: parseFloat(postProductionBudget) || 0,
      stages: {
        'pre-production': parseFloat(preProductionBudget) || 0,
        'production': parseFloat(productionBudget) || 0,
        'post-production': parseFloat(postProductionBudget) || 0,
      }
    } : undefined;
    
      console.log('🚀 開始創建專案並同步到 Firebase...');
      
      await addProject({
      name,
      description,
      location,
      startDate: startDate.toISOString(),
      status: 'active',
      budget: parseFloat(budget) || 0,
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059',
      endDate: undefined,
      carbonBudget,
    });
    
      console.log('✅ 專案創建成功！');
    router.back();
    } catch (error) {
      console.error('❌ 創建專案失敗:', error);
      // 可以在這裡添加錯誤提示
    }
  };
  
  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={t('projects.new')} 
        showBackButton 
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
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.name')}</Text>
              <TextInput
                style={[
                  styles.input, 
                  nameError ? styles.inputError : null,
                  { 
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: nameError ? theme.error : theme.border
                  }
                ]}
                placeholder={t('projects.name')}
                placeholderTextColor={theme.secondaryText}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text.trim()) setNameError('');
                }}
              />
              {nameError ? <Text style={[styles.errorText, { color: theme.error }]}>{nameError}</Text> : null}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.description')}</Text>
              <TextInput
                style={[
                  styles.textArea, 
                  descriptionError ? styles.inputError : null,
                  { 
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: descriptionError ? theme.error : theme.border
                  }
                ]}
                placeholder={t('projects.description')}
                placeholderTextColor={theme.secondaryText}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (text.trim()) setDescriptionError('');
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {descriptionError ? <Text style={[styles.errorText, { color: theme.error }]}>{descriptionError}</Text> : null}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.location')}</Text>
              <View style={[
                styles.inputWithIcon,
                { 
                  backgroundColor: theme.card,
                  borderColor: locationError ? theme.error : theme.border
                }
              ]}>
                <MapPin size={20} color={theme.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.inputWithIconText,
                    { color: theme.text }
                  ]}
                  placeholder={t('projects.location')}
                  placeholderTextColor={theme.secondaryText}
                  value={location}
                  onChangeText={(text) => {
                    setLocation(text);
                    if (text.trim()) setLocationError('');
                  }}
                />
              </View>
              {locationError ? <Text style={[styles.errorText, { color: theme.error }]}>{locationError}</Text> : null}
            </View>
            
            <View style={styles.formGroup}>
              <DatePickerField
                label={t('projects.start.date')}
                value={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setStartDateError('');
                }}
                error={startDateError}
                fieldStyle={[
                  styles.datePickerField,
                  { 
                    backgroundColor: theme.card,
                    borderColor: startDateError ? theme.error : theme.border
                  }
                ]}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.budget')} ({t('common.optional')})</Text>
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
                  placeholder={t('projects.budget')}
                  placeholderTextColor={theme.secondaryText}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
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
                        carbonBudgetError ? styles.inputError : null,
                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: carbonBudgetError ? theme.error : theme.border
                        }
                      ]}
                      placeholder={t('projects.carbon.budget.total')}
                      placeholderTextColor={theme.secondaryText}
                      value={totalCarbonBudget}
                      onChangeText={(text) => {
                        setTotalCarbonBudget(text);
                        if (text.trim()) setCarbonBudgetError('');
                      }}
                      keyboardType="numeric"
                    />
                    {carbonBudgetError ? <Text style={[styles.errorText, { color: theme.error }]}>{carbonBudgetError}</Text> : null}
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
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t('projects.thumbnail')} ({t('common.optional')})</Text>
              <TouchableOpacity style={[
                styles.imageUploadButton,
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }
              ]}>
                <ImageIcon size={24} color={theme.secondaryText} />
                <Text style={[styles.imageUploadText, { color: theme.secondaryText }]}>
                  {t('projects.thumbnail')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <Button
            title={t('common.cancel')}
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={t('projects.create')}
            onPress={handleCreateProject}
            variant="primary"
            style={styles.createButton}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  inputError: {
    borderColor: Colors.dark.error,
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
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
  },
  datePickerField: {
    height: 48,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  imageUploadButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    flex: 1,
    marginLeft: 8,
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
});