import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput,
  Platform,
  Alert,
  Pressable
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, MapPin, Users, Zap, Save, Car, Fuel, Utensils, Hotel, Trash, Package, FileText } from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { FilmCrew } from '@/types/project';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import DatePickerField from '@/components/DatePickerField';
import { CREW_OPTIONS, getCrewIcon, getCrewColor } from '@/constants/crews';
import { useLanguageStore } from '@/store/languageStore';

const EMISSION_CATEGORIES = [
  { 
    key: 'transport', 
    name: '交通運輸', 
    icon: Car, 
    unit: 'km', 
    factor: 0.21,
    description: '基於一般客車每公里平均排放',
    source: '行政院環保署 2023年溫室氣體排放係數管理表'
  },
  { 
    key: 'equipment', 
    name: '設備用電', 
    icon: Zap, 
    unit: 'kWh', 
    factor: 0.533,
    description: '台灣電網2023年平均排放係數',
    source: '經濟部能源局 2023年電力排放係數'
  },
  { 
    key: 'fuel', 
    name: '燃料消耗', 
    icon: Fuel, 
    unit: 'L', 
    factor: 2.31,
    description: '汽油燃燒每公升排放係數',
    source: 'IPCC 2006年溫室氣體清冊指南'
  },
  { 
    key: 'catering', 
    name: '餐飲', 
    icon: Utensils, 
    unit: '人次', 
    factor: 3.2,
    description: '平均每人每餐碳足跡（含食材運輸）',
    source: '碳信託基金會餐飲業碳足跡研究'
  },
  { 
    key: 'accommodation', 
    name: '住宿', 
    icon: Hotel, 
    unit: '房晚', 
    factor: 12.1,
    description: '一般旅館每房每晚平均排放',
    source: '觀光局旅宿業環境影響評估報告'
  },
  { 
    key: 'waste', 
    name: '廢棄物', 
    icon: Trash, 
    unit: 'kg', 
    factor: 0.45,
    description: '一般廢棄物處理排放係數',
    source: '行政院環保署廢棄物處理排放係數'
  },
  { 
    key: 'materials', 
    name: '物料耗材', 
    icon: Package, 
    unit: 'kg', 
    factor: 1.8,
    description: '一般消耗性物料生產運輸平均排放',
    source: '工研院材料生命週期評估資料庫'
  },
  { 
    key: 'other', 
    name: '其他', 
    icon: FileText, 
    unit: 'kg CO₂e', 
    factor: 1,
    description: '直接輸入碳排放當量',
    source: '自行計算或第三方數據'
  },
];

const getCategoryIcon = (categoryKey: string, size: number = 24, color?: string) => {
  const category = EMISSION_CATEGORIES.find(c => c.key === categoryKey);
  if (!category) return <FileText size={size} color={color || '#666'} />;
  
  const IconComponent = category.icon;
  return <IconComponent size={size} color={color} />;
};



export default function AddShootingDayRecord() {
  const router = useRouter();
  const { projectId, crew: initialCrew } = useLocalSearchParams<{ projectId: string, crew?: FilmCrew }>();
  const { addShootingDayRecord } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // 獲取翻譯過的活動類別
  const getTranslatedCategories = () => {
    return EMISSION_CATEGORIES.map(category => ({
      ...category,
      name: t(`activity.${category.key}`) || category.name,
      unit: getTranslatedUnit(category.unit),
    }));
  };

  // 獲取翻譯過的單位
  const getTranslatedUnit = (unit: string) => {
    switch (unit) {
      case 'km': return t('unit.km') || 'km';
      case 'kWh': return t('unit.kwh') || 'kWh';
      case 'L': return t('unit.l') || 'L';
      case '人次': return t('unit.person.time') || '人次';
      case '房晚': return t('unit.room.night') || '房晚';
      case 'kg': return t('unit.kg') || 'kg';
      case 'kg CO₂e': return t('unit.kg.co2e.simple') || 'kg CO₂e';
      default: return unit;
    }
  };

  const [shootingDate, setShootingDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [sceneNumber, setSceneNumber] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<FilmCrew>(initialCrew || 'director');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  


  const selectedCrewOption = CREW_OPTIONS.find(c => c.key === selectedCrew);
  const translatedCategories = getTranslatedCategories();
  const selectedCategoryOption = translatedCategories.find(c => c.key === selectedCategory);

  // 獲取項目器材總重量
  const getProjectEquipmentWeight = (): number => {
    if (!projectId) return 0;
    
    // 查找專案器材記錄
    const { getProjectEmissionRecords } = useProjectStore();
    const projectRecords = getProjectEmissionRecords(projectId);
    const equipmentRecords = projectRecords.filter(
      record => record.categoryId === 'project-equipment'
    );
    
    return equipmentRecords.reduce((total, record) => total + (record.amount || 0), 0);
  };

  const calculateEmission = () => {
    if (!selectedCategoryOption || !quantity) return 0;
    
    let baseEmission = parseFloat(quantity) * selectedCategoryOption.factor;
    
    // 如果是攝影組的交通運輸，加入器材重量影響
    if (selectedCrew === 'camera' && selectedCategory === 'transport') {
      const equipmentWeight = getProjectEquipmentWeight();
      if (equipmentWeight > 0) {
        // 器材重量影響係數：每100kg增加20%排放
        const weightFactor = 1 + (equipmentWeight / 100) * 0.2;
        baseEmission *= weightFactor;
      }
    }
    
    return baseEmission;
  };

  const validateForm = () => {
    if (!location.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('shooting.record.validation.location') || '請輸入拍攝地點');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert(t('common.error') || '錯誤', t('shooting.record.validation.category') || '請選擇排放類別');
      return false;
    }
    if (!description.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('shooting.record.validation.description') || '請輸入活動描述');
      return false;
    }
    if (!quantity.trim() || isNaN(parseFloat(quantity))) {
      Alert.alert(t('common.error') || '錯誤', t('shooting.record.validation.quantity') || '請輸入有效的數量');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    console.log('開始保存記錄...');
    console.log('表單數據:', {
      projectId,
      location: location.trim(),
      selectedCategory,
      description: description.trim(),
      quantity,
      selectedCrew,
      shootingDate: shootingDate.toISOString().split('T')[0]
    });
    
    if (!validateForm()) {
      console.log('表單驗證失敗');
      return;
    }
    if (!projectId) {
      console.log('專案 ID 不存在');
      Alert.alert(t('common.error') || '錯誤', t('shooting.record.validation.project.id') || '專案 ID 不存在');
      return;
    }

    setIsSaving(true);
    try {
      const emission = calculateEmission();
      console.log('計算的排放量:', emission);
      
      const recordData = {
        projectId,
        shootingDate: shootingDate.toISOString().split('T')[0],
        location: location.trim(),
        sceneNumber: sceneNumber.trim() || undefined,
        crew: selectedCrew,
        category: selectedCategory,
        description: description.trim(),
        amount: emission,
        quantity: parseFloat(quantity),
        unit: selectedCategoryOption?.unit,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      
      console.log('準備保存的記錄:', recordData);
      
      await addShootingDayRecord(recordData);
      
      console.log('記錄保存成功');

      Alert.alert(t('common.success') || '成功', t('shooting.record.success') || '拍攝日記錄已保存', [
        { text: t('common.ok') || '確定', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('保存失敗:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(t('common.error') || '錯誤', `${t('shooting.record.error') || '保存失敗'}：${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('shooting.record.add') || '添加拍攝日記錄'} showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 拍攝信息 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            拍攝信息
          </Text>
          
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>{t('shooting.record.date') || '拍攝日期'}</Text>
            <DatePickerField
              value={shootingDate}
              onChange={setShootingDate}
              placeholder="選擇拍攝日期"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>{t('shooting.record.location') || '拍攝地點'}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
              <MapPin size={20} color={theme.secondaryText} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="輸入拍攝地點"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>{t('shooting.record.scene') || '場次編號'} (選填)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
              value={sceneNumber}
              onChangeText={setSceneNumber}
              placeholder="例如：001, A01"
              placeholderTextColor={theme.secondaryText}
            />
          </View>
        </View>

        {/* 組別選擇 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('shooting.record.crew') || '選擇組別'}
          </Text>
          
          <View style={styles.crewGrid}>
            {CREW_OPTIONS.map((crew) => (
              <Pressable
                key={crew.key}
                style={[
                  styles.crewOption,
                  { 
                    backgroundColor: selectedCrew === crew.key 
                      ? crew.color + '30' 
                      : theme.background,
                    borderColor: selectedCrew === crew.key 
                      ? crew.color 
                      : theme.border
                  }
                ]}
                onPress={() => setSelectedCrew(crew.key as FilmCrew)}
              >
                <View style={styles.crewIconContainer}>
                  {getCrewIcon(crew.key, 20, selectedCrew === crew.key ? crew.color : theme.text)}
                </View>
                <Text style={[
                  styles.crewText, 
                  { 
                    color: selectedCrew === crew.key 
                      ? crew.color 
                      : theme.text 
                  }
                ]}>
                  {t(`crew.${crew.key}`) || crew.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 排放類別 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('shooting.record.category') || '排放類別'}
          </Text>
          
          <View style={styles.categoryGrid}>
            {translatedCategories.map((category) => (
              <Pressable
                key={category.key}
                style={[
                  styles.categoryOption,
                  { 
                    backgroundColor: selectedCategory === category.key 
                      ? theme.primary + '20' 
                      : theme.background,
                    borderColor: selectedCategory === category.key 
                      ? theme.primary 
                      : theme.border
                  }
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <View style={styles.categoryIconContainer}>
                  {getCategoryIcon(category.key, 24, selectedCategory === category.key ? theme.primary : theme.text)}
                </View>
                <Text style={[
                  styles.categoryText, 
                  { 
                    color: selectedCategory === category.key 
                      ? theme.primary 
                      : theme.text 
                  }
                ]}>
                  {category.name}
                </Text>
                <Text style={[styles.categoryUnit, { color: theme.secondaryText }]}>
                  ({category.unit})
                </Text>
                <Text style={[styles.categoryFactor, { color: theme.secondaryText }]}>
                  {t('emission.factor') || '係數'}：{category.factor} kg CO₂e/{category.unit}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 係數來源說明 */}
          {selectedCategoryOption && (
            <View style={[styles.factorInfo, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.factorTitle, { color: theme.text }]}>
                {t('emission.factor.info.title') || '排放係數資訊'}
              </Text>
              <Text style={[styles.factorDescription, { color: theme.secondaryText }]}>
                {selectedCategoryOption.description}
              </Text>
              <Text style={[styles.factorSource, { color: theme.secondaryText }]}>
                {t('emission.factor.data.source') || '數據來源'}：{selectedCategoryOption.source}
              </Text>
            </View>
          )}
        </View>



        {/* 活動詳情 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            活動詳情
          </Text>
          
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>{t('shooting.record.description') || '活動描述'}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="例如：器材運輸、現場用電、工作餐"
              placeholderTextColor={theme.secondaryText}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>
              {t('shooting.record.quantity') || '數量'} {selectedCategoryOption && `(${selectedCategoryOption.unit})`}
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="輸入數量"
              placeholderTextColor={theme.secondaryText}
              keyboardType="numeric"
            />
          </View>

          {calculateEmission() > 0 && (
            <View style={[styles.emissionPreview, { backgroundColor: theme.primary + '10' }]}>
              <Zap size={20} color={theme.primary} />
              <View style={styles.emissionDetails}>
              <Text style={[styles.emissionText, { color: theme.primary }]}>
                預估排放量：{calculateEmission().toFixed(2)} kg CO₂e
              </Text>
                {(!location.trim() || !selectedCategory || !description.trim()) && (
                  <Text style={[styles.previewNote, { color: theme.warning || '#FF8C00' }]}>
                    ⚠️ 請完成所有必填欄位後保存記錄
                  </Text>
                )}
                {selectedCrew === 'camera' && selectedCategory === 'transport' && getProjectEquipmentWeight() > 0 && (
                  <View style={styles.equipmentWeightInfo}>
                    <Text style={[styles.equipmentWeightText, { color: theme.secondaryText }]}>
                      已包含器材重量影響：{getProjectEquipmentWeight().toFixed(1)} kg
                    </Text>
                    <Text style={[styles.equipmentWeightNote, { color: theme.secondaryText }]}>
                      * 每100kg器材增加20%運輸排放
                    </Text>
                  </View>
                )}
                {selectedCategoryOption && (
                  <Text style={[styles.emissionFormula, { color: theme.secondaryText }]}>
                    計算公式：{quantity || '0'} {selectedCategoryOption.unit} × {selectedCategoryOption.factor} = {((parseFloat(quantity) || 0) * selectedCategoryOption.factor).toFixed(2)} kg CO₂e
                    {selectedCrew === 'camera' && selectedCategory === 'transport' && getProjectEquipmentWeight() > 0 && 
                      ` × ${(1 + (getProjectEquipmentWeight() / 100) * 0.2).toFixed(2)} (器材重量影響)`}
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>{t('shooting.record.notes') || '備註'} (選填)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="其他備註信息"
              placeholderTextColor={theme.secondaryText}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      <View style={[styles.bottomAction, { backgroundColor: theme.card }]}>
        <Button
          title={t('shooting.record.save') || '保存記錄'}
          onPress={handleSave}
          variant="primary"
          loading={isSaving}
          icon={<Save size={20} color={Colors.dark.text} />}
        />
      </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  textInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  crewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  crewOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: '45%',
  },
  crewIconContainer: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: '30%',
    alignItems: 'center',
  },
  categoryIconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryUnit: {
    fontSize: 12,
    textAlign: 'center',
  },
  categoryFactor: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 2,
  },
  factorInfo: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  factorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  factorDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  factorSource: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  emissionPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  emissionDetails: {
    flex: 1,
    marginLeft: 8,
  },
  emissionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewNote: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
  },
  equipmentWeightInfo: {
    marginTop: 6,
    padding: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 6,
  },
  equipmentWeightText: {
    fontSize: 12,
    fontWeight: '500',
  },
  equipmentWeightNote: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emissionFormula: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomAction: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  footer: {
    height: 100,
  },
  workInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  workInfoField: {
    flex: 1,
  },
  equipmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  equipmentButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  selectedEquipmentContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedEquipmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectedEquipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  selectedEquipmentName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  selectedEquipmentWeight: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeEquipmentButton: {
    padding: 8,
  },
  equipmentImpactContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  equipmentImpactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentImpactTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  equipmentImpactDetails: {
    marginBottom: 8,
  },
  equipmentImpactText: {
    fontSize: 14,
    fontWeight: '500',
  },
  equipmentImpactFactor: {
    fontSize: 14,
    fontWeight: '500',
  },
  equipmentDescriptions: {
    marginTop: 8,
  },
  equipmentDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
  },
  equipmentList: {
    padding: 16,
  },
  equipmentItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  equipmentItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  equipmentItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  equipmentItemWeight: {
    fontSize: 14,
    fontWeight: '400',
    marginLeft: 8,
  },
  equipmentSelectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  equipmentSelectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 