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
  Image,
  FlatList,
  Animated,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  X,
  Filter,
  Camera,
  Video,
  HardDrive,
  Laptop,
  Car,
  Home,
  Trash2,
  Utensils,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import Header from '@/components/Header';

// 導入增強設備數據
import { 
  ENHANCED_CAMERA_EQUIPMENT,
  ENHANCED_LIGHTING_EQUIPMENT,
  ENHANCED_EDITING_EQUIPMENT,
  ENHANCED_STORAGE_EQUIPMENT,
  ENHANCED_TRANSPORT_EQUIPMENT,
  ENHANCED_OFFICE_EQUIPMENT,
  ENHANCED_FOOD_EQUIPMENT,
  ENHANCED_ACCOMMODATION_EQUIPMENT,
  ENHANCED_WASTE_EQUIPMENT,
  ENHANCED_FUEL_EQUIPMENT
} from '@/mocks/enhancedEquipment';

// 定義設備類型
interface Equipment {
  id: string;
  name: string;
  emissionFactor: number;
  type?: string;
  technicalSpecs?: Record<string, string | number>;
  notes?: string;
  isoCertification?: {
    standard: string;
    [key: string]: any;
  };
  lifeCycleData?: {
    totalLifeCycle: number;
    lifespan: number;
    [key: string]: any;
  };
  [key: string]: any;
}

// 定義類別類型
interface Category {
  id: string;
  name: string;
  icon: any;
  data: Equipment[];
  color: string;
}

// 定義設備類別和圖示
const CATEGORIES: Category[] = [
  { id: 'all', name: '全部設備', icon: null, data: [], color: '#6366F1' },
  { id: 'camera', name: '攝影設備', icon: Camera, data: ENHANCED_CAMERA_EQUIPMENT as Equipment[], color: '#F59E0B' },
  { id: 'lighting', name: '照明設備', icon: Zap, data: ENHANCED_LIGHTING_EQUIPMENT as Equipment[], color: '#FBBF24' },
  { id: 'editing', name: '編輯設備', icon: Laptop, data: ENHANCED_EDITING_EQUIPMENT as Equipment[], color: '#3B82F6' },
  { id: 'storage', name: '存儲設備', icon: HardDrive, data: ENHANCED_STORAGE_EQUIPMENT as Equipment[], color: '#8B5CF6' },
  { id: 'transport', name: '交通設備', icon: Car, data: ENHANCED_TRANSPORT_EQUIPMENT as Equipment[], color: '#EC4899' },
  { id: 'office', name: '辦公設備', icon: Laptop, data: ENHANCED_OFFICE_EQUIPMENT as Equipment[], color: '#10B981' },
  { id: 'food', name: '餐飲設備', icon: Utensils, data: ENHANCED_FOOD_EQUIPMENT as Equipment[], color: '#F97316' },
  { id: 'accommodation', name: '住宿設備', icon: Home, data: ENHANCED_ACCOMMODATION_EQUIPMENT as Equipment[], color: '#14B8A6' },
  { id: 'waste', name: '廢棄物設備', icon: Trash2, data: ENHANCED_WASTE_EQUIPMENT as Equipment[], color: '#6366F1' },
  { id: 'fuel', name: '燃料與能源', icon: Zap, data: ENHANCED_FUEL_EQUIPMENT as Equipment[], color: '#4F46E5' }
];

// 合併所有設備數據到一個數組
const ALL_EQUIPMENT: Equipment[] = [
  ...ENHANCED_CAMERA_EQUIPMENT as Equipment[],
  ...ENHANCED_LIGHTING_EQUIPMENT as Equipment[],
  ...ENHANCED_EDITING_EQUIPMENT as Equipment[],
  ...ENHANCED_STORAGE_EQUIPMENT as Equipment[],
  ...ENHANCED_TRANSPORT_EQUIPMENT as Equipment[],
  ...ENHANCED_OFFICE_EQUIPMENT as Equipment[],
  ...ENHANCED_FOOD_EQUIPMENT as Equipment[],
  ...ENHANCED_ACCOMMODATION_EQUIPMENT as Equipment[],
  ...ENHANCED_WASTE_EQUIPMENT as Equipment[],
  ...ENHANCED_FUEL_EQUIPMENT as Equipment[]
];

// 標籤/篩選選項
const FILTER_TAGS = [
  { id: 'lowCarbon', name: '低碳設備', color: '#16A34A', backgroundColor: '#16A34A20' },
  { id: 'greenEnergy', name: '綠色能源', color: '#059669', backgroundColor: '#05966920' },
  { id: 'isoStandard', name: 'ISO認證', color: '#0284C7', backgroundColor: '#0284C720' }
];

export default function EquipmentDatabaseScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  // 狀態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const detailsHeight = useRef(new Animated.Value(0)).current;
  
  // 處理類別選擇
  const handleCategorySelect = (categoryId: string) => {
  const { t } = useTranslation();

    setSelectedCategory(categoryId);
    setSelectedEquipment(null);
  };
  
  // 處理設備選擇
  const handleEquipmentSelect = (equipment: any) => {
    if (selectedEquipment && selectedEquipment.id === equipment.id) {
      Animated.timing(detailsHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start(() => setSelectedEquipment(null));
    } else {
      setSelectedEquipment(equipment);
      Animated.timing(detailsHeight, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false
      }).start();
    }
  };
  
  // 處理篩選標籤選擇
  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };
  
  // 應用篩選的設備數據
  const getFilteredEquipment = (): Equipment[] => {
    let data = selectedCategory === 'all' 
      ? ALL_EQUIPMENT 
      : CATEGORIES.find(c => c.id === selectedCategory)?.data || [];
    
    // 應用搜索
    if (searchQuery.trim()) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.technicalSpecs && Object.values(item.technicalSpecs).some((v: any) => 
          typeof v === 'string' && v.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // 應用標籤篩選
    if (activeFilters.length > 0) {
      if (activeFilters.includes('lowCarbon')) {
        data = data.filter(item => item.emissionFactor < 0.2);
      }
      
      if (activeFilters.includes('greenEnergy')) {
        data = data.filter(item => 
          item.type === 'nuclear' || item.type === 'hydrogen'
        );
      }
      
      if (activeFilters.includes('isoStandard')) {
        data = data.filter(item => item.isoCertification);
      }
    }
    
    return data;
  };
  
  const filteredEquipment = getFilteredEquipment();
  const getCategoryForEquipment = (equipmentId: string): string => {
    for (const category of CATEGORIES) {
      if (category.data && category.data.some(item => item.id === equipmentId)) {
        return category.id;
      }
    }
    return '';
  };
  
  const equipmentGroupedByCategory = (): Category[] => {
    if (selectedCategory !== 'all') return [];
    
    const grouped = CATEGORIES.slice(1).map(category => ({
      ...category,
      data: filteredEquipment.filter(item => 
        category.data.some(catItem => catItem.id === item.id)
      )
    })).filter(group => group.data.length > 0);
    
    return grouped;
  };
  
  const groupedData = selectedCategory === 'all' ? equipmentGroupedByCategory() : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={t('equipment.title')} 
        showBackButton 
        onBackPress={() => router.back()}
        textColor={theme.text}
        iconColor={theme.text}
      />
      
      {/* 搜索欄 */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Search size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t('equipment.search.placeholder')}
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={theme.secondaryText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* 分類標籤 */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {CATEGORIES.map(category => {
            const isSelected = selectedCategory === category.id;
            const Icon = category.icon;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor: isSelected ? category.color : theme.card + '80',
                    borderColor: isSelected ? category.color : theme.border
                  }
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                {Icon && <Icon size={16} color={isSelected ? '#FFF' : category.color} style={styles.categoryIcon} />}
                <Text style={[
                  styles.categoryText,
                  { color: isSelected ? '#FFF' : theme.text }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      {/* 篩選標籤 */}
      <View style={styles.filterTagsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTagsScrollContent}
        >
          {FILTER_TAGS.map(filter => {
            const isActive = activeFilters.includes(filter.id);
            
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTag,
                  {
                    backgroundColor: isActive ? filter.backgroundColor : theme.card,
                    borderColor: isActive ? filter.color : theme.border
                  }
                ]}
                onPress={() => handleFilterToggle(filter.id)}
              >
                <Text style={[styles.filterTagText, { color: isActive ? filter.color : theme.secondaryText }]}>
                  {filter.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          {activeFilters.length > 0 && (
            <TouchableOpacity
              style={[styles.filterTag, { backgroundColor: theme.error + '10', borderColor: theme.error }]}
              onPress={() => setActiveFilters([])}
            >
              <Text style={[styles.filterTagText, { color: theme.error }]}>{t('common.clear.filters')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
      
      {/* 結果統計 */}
      <View style={styles.resultsStats}>
        <Text style={[styles.resultsCount, { color: theme.secondaryText }]}>
          {t('common.found')} {filteredEquipment.length.toString()} {t('common.items')}
        </Text>
      </View>
      
      {/* 設備列表 */}
      {selectedCategory === 'all' && groupedData && groupedData.length > 0 ? (
        <FlatList
          data={groupedData}
          keyExtractor={item => `group-${item.id}`}
          contentContainerStyle={styles.equipmentListContent}
          renderItem={({ item: category }) => (
            <View style={styles.categoryGroup}>
              <View style={styles.categoryHeader}>
                {category.icon && <category.icon size={18} color={category.color} style={styles.categoryHeaderIcon} />}
                <Text style={[styles.categoryHeaderTitle, { color: theme.text }]}>{category.name}</Text>
                <Text style={[styles.categoryHeaderCount, { color: theme.secondaryText }]}>
                  {category.data.length.toString()}項
                </Text>
              </View>
              
              <View style={styles.groupedEquipmentList}>
                {category.data.map((equipment, index) => {
                  const isSelected = selectedEquipment && selectedEquipment.id === equipment.id;
                  const isLowCarbon = equipment.emissionFactor < 0.2;
                  const isGreenEnergy = equipment.type === 'nuclear' || equipment.type === 'hydrogen';
                  
                  return (
                    <View key={equipment.id} style={{ marginBottom: isSelected ? 0 : 10 }}>
                      <TouchableOpacity
                        style={[
                          styles.equipmentCard,
                          { backgroundColor: theme.card },
                          isSelected && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                        ]}
                        onPress={() => handleEquipmentSelect(equipment)}
                      >
                        <View style={[styles.equipmentColorTag, { backgroundColor: category.color }]} />
                        
                        <View style={styles.equipmentInfo}>
                          <Text style={[styles.equipmentName, { color: theme.text }]}>{equipment.name}</Text>
                          
                          <View style={styles.equipmentTags}>
                            <View style={[styles.emissionBadge, { backgroundColor: theme.primary + '15' }]}>
                              <Text style={[styles.emissionText, { color: theme.primary }]}>
                                {equipment.emissionFactor} kg CO₂e
                              </Text>
                            </View>
                            
                            {isLowCarbon && (
                              <View style={[styles.tagBadge, { backgroundColor: '#16A34A20' }]}>
                                <Text style={[styles.tagText, { color: '#16A34A' }]}>低碳</Text>
                              </View>
                            )}
                            
                            {isGreenEnergy && (
                              <View style={[styles.tagBadge, { backgroundColor: '#05966920' }]}>
                                <Text style={[styles.tagText, { color: '#059669' }]}>綠色能源</Text>
                              </View>
                            )}
                            
                            {equipment.isoCertification && (
                              <View style={[styles.tagBadge, { backgroundColor: '#0284C720' }]}>
                                <Text style={[styles.tagText, { color: '#0284C7' }]}>ISO認證</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        
                        {isSelected ? <ChevronUp size={20} color={theme.secondaryText} /> : <Info size={20} color={theme.secondaryText} />}
                      </TouchableOpacity>
                      
                      {isSelected && (
                        <Animated.View 
                          style={[
                            styles.equipmentDetails,
                            { 
                              backgroundColor: theme.card,
                              maxHeight: detailsHeight.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 500]
                              }),
                              opacity: detailsHeight
                            }
                          ]}
                        >
                          {equipment.technicalSpecs && (
                            <View style={styles.detailSection}>
                              <Text style={[styles.detailSectionTitle, { color: theme.secondaryText }]}>
                                技術規格
                              </Text>
                              {Object.entries(equipment.technicalSpecs).map(([key, value]) => (
                                <View key={key} style={styles.specRow}>
                                  <Text style={[styles.specKey, { color: theme.secondaryText }]}>{key}</Text>
                                  <Text style={[styles.specValue, { color: theme.text }]}>{value as string}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                          
                          {equipment.lifeCycleData && (
                            <View style={styles.detailSection}>
                              <Text style={[styles.detailSectionTitle, { color: theme.secondaryText }]}>
                                生命週期數據
                              </Text>
                              <View style={styles.lifeCycleStats}>
                                <View style={styles.lifeCycleStat}>
                                  <Text style={[styles.lifeCycleValue, { color: theme.primary }]}>
                                    {equipment.lifeCycleData.totalLifeCycle}
                                  </Text>
                                  <Text style={[styles.lifeCycleLabel, { color: theme.secondaryText }]}>
                                    總碳排放 (kg CO₂e)
                                  </Text>
                                </View>
                                <View style={styles.lifeCycleStat}>
                                  <Text style={[styles.lifeCycleValue, { color: theme.primary }]}>
                                    {equipment.lifeCycleData.lifespan}
                                  </Text>
                                  <Text style={[styles.lifeCycleLabel, { color: theme.secondaryText }]}>
                                    預計壽命 (年)
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}
                          
                          {equipment.notes && (
                            <View style={styles.detailSection}>
                              <Text style={[styles.detailSectionTitle, { color: theme.secondaryText }]}>
                                備註
                              </Text>
                              <Text style={[styles.notesText, { color: theme.text }]}>
                                {equipment.notes}
                              </Text>
                            </View>
                          )}
                        </Animated.View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>沒有符合條件的設備</Text>
              <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
                請嘗試修改您的搜尋條件或選擇其他分類
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.secondaryText }]}>
                數據來源：ISO 14064/14067碳足跡標準
              </Text>
              <Text style={[styles.footerText, { color: theme.secondaryText }]}>
                最後更新: 2023年12月
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredEquipment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.equipmentListContent}
          renderItem={({ item: equipment }) => {
            const isSelected = selectedEquipment && selectedEquipment.id === equipment.id;
            const categoryId = getCategoryForEquipment(equipment.id);
            const category = CATEGORIES.find(c => c.id === categoryId);
            const isLowCarbon = equipment.emissionFactor < 0.2;
            const isGreenEnergy = equipment.type === 'nuclear' || equipment.type === 'hydrogen';
            
            return (
              <View key={equipment.id} style={{ marginBottom: isSelected ? 0 : 10 }}>
                <TouchableOpacity
                  style={[
                    styles.equipmentCard,
                    { backgroundColor: theme.card },
                    isSelected && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                  ]}
                  onPress={() => handleEquipmentSelect(equipment)}
                >
                  {category && <View style={[styles.equipmentColorTag, { backgroundColor: category.color }]} />}
                  
                  <View style={styles.equipmentInfo}>
                    <Text style={[styles.equipmentName, { color: theme.text }]}>{equipment.name}</Text>
                    <Text style={[styles.equipmentCategory, { color: theme.secondaryText }]}>
                      {category ? category.name : '其他設備'}
                    </Text>
                    
                    <View style={styles.equipmentTags}>
                      <View style={[styles.emissionBadge, { backgroundColor: theme.primary + '15' }]}>
                        <Text style={[styles.emissionText, { color: theme.primary }]}>
                          {equipment.emissionFactor} kg CO₂e
                        </Text>
                      </View>
                      
                      {isLowCarbon && (
                        <View style={[styles.tagBadge, { backgroundColor: '#16A34A20' }]}>
                          <Text style={[styles.tagText, { color: '#16A34A' }]}>低碳</Text>
                        </View>
                      )}
                      
                      {isGreenEnergy && (
                        <View style={[styles.tagBadge, { backgroundColor: '#05966920' }]}>
                          <Text style={[styles.tagText, { color: '#059669' }]}>綠色能源</Text>
                        </View>
                      )}
                      
                      {equipment.isoCertification && (
                        <View style={[styles.tagBadge, { backgroundColor: '#0284C720' }]}>
                          <Text style={[styles.tagText, { color: '#0284C7' }]}>ISO認證</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {isSelected ? <ChevronUp size={20} color={theme.secondaryText} /> : <Info size={20} color={theme.secondaryText} />}
                </TouchableOpacity>
                
                {isSelected && (
                  <Animated.View 
                    style={[
                      styles.equipmentDetails,
                      { 
                        backgroundColor: theme.card,
                        maxHeight: detailsHeight.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 500]
                        }),
                        opacity: detailsHeight
                      }
                    ]}
                  >
                    {equipment.technicalSpecs && (
                      <View style={styles.detailSection}>
                        <Text style={[styles.detailSectionTitle, { color: theme.secondaryText }]}>
                          技術規格
                        </Text>
                        {Object.entries(equipment.technicalSpecs).map(([key, value]) => (
                          <View key={key} style={styles.specRow}>
                            <Text style={[styles.specKey, { color: theme.secondaryText }]}>{key}</Text>
                            <Text style={[styles.specValue, { color: theme.text }]}>{value as string}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {equipment.lifeCycleData && (
                      <View style={styles.detailSection}>
                        <Text style={[styles.detailSectionTitle, { color: theme.secondaryText }]}>
                          生命週期數據
                        </Text>
                        <View style={styles.lifeCycleStats}>
                          <View style={styles.lifeCycleStat}>
                            <Text style={[styles.lifeCycleValue, { color: theme.primary }]}>
                              {equipment.lifeCycleData.totalLifeCycle}
                            </Text>
                            <Text style={[styles.lifeCycleLabel, { color: theme.secondaryText }]}>
                              總碳排放 (kg CO₂e)
                            </Text>
                          </View>
                          <View style={styles.lifeCycleStat}>
                            <Text style={[styles.lifeCycleValue, { color: theme.primary }]}>
                              {equipment.lifeCycleData.lifespan}
                            </Text>
                            <Text style={[styles.lifeCycleLabel, { color: theme.secondaryText }]}>
                              預計壽命 (年)
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                    
                    {equipment.notes && (
                      <View style={styles.detailSection}>
                        <Text style={[styles.detailSectionTitle, { color: theme.secondaryText }]}>
                          備註
                        </Text>
                        <Text style={[styles.notesText, { color: theme.text }]}>
                          {equipment.notes}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>沒有符合條件的設備</Text>
              <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
                請嘗試修改您的搜尋條件或選擇其他分類
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.secondaryText }]}>
                數據來源：ISO 14064/14067碳足跡標準
              </Text>
              <Text style={[styles.footerText, { color: theme.secondaryText }]}>
                最後更新: 2023年12月
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTagsContainer: {
    paddingVertical: 8,
  },
  filterTagsScrollContent: {
    paddingHorizontal: 16,
  },
  filterTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
  },
  filterTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultsStats: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 14,
  },
  equipmentListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryHeaderIcon: {
    marginRight: 8,
  },
  categoryHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryHeaderCount: {
    fontSize: 14,
  },
  groupedEquipmentList: {
    
  },
  equipmentCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 14,
    alignItems: 'center',
  },
  equipmentColorTag: {
    width: 4,
    height: '100%',
    marginRight: 10,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  equipmentCategory: {
    fontSize: 13,
    marginBottom: 6,
  },
  equipmentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  emissionBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 3,
  },
  emissionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 3,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  equipmentDetails: {
    overflow: 'hidden',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -1,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  specKey: {
    width: 100,
    fontSize: 13,
  },
  specValue: {
    flex: 1,
    fontSize: 13,
  },
  lifeCycleStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  lifeCycleStat: {
    flex: 1,
    alignItems: 'center',
  },
  lifeCycleValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  lifeCycleLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    marginVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
}); 