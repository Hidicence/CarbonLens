import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput,
  FlatList
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Search, 
  ChevronRight, 
  Database
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
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

// 定義設備分類
type CategoryId = 'camera' | 'lighting' | 'editing' | 'storage' | 'transport' | 'office' | 'food' | 'accommodation' | 'waste' | 'fuel';

const equipmentCategories: Record<CategoryId, { name: string, data: any[] }> = {
  'camera': { name: '攝影設備', data: ENHANCED_CAMERA_EQUIPMENT },
  'lighting': { name: '照明設備', data: ENHANCED_LIGHTING_EQUIPMENT },
  'editing': { name: '編輯設備', data: ENHANCED_EDITING_EQUIPMENT },
  'storage': { name: '存儲設備', data: ENHANCED_STORAGE_EQUIPMENT },
  'transport': { name: '交通設備', data: ENHANCED_TRANSPORT_EQUIPMENT },
  'office': { name: '辦公設備', data: ENHANCED_OFFICE_EQUIPMENT },
  'food': { name: '餐飲設備', data: ENHANCED_FOOD_EQUIPMENT },
  'accommodation': { name: '住宿設備', data: ENHANCED_ACCOMMODATION_EQUIPMENT },
  'waste': { name: '廢棄物設備', data: ENHANCED_WASTE_EQUIPMENT },
  'fuel': { name: '燃料設備', data: ENHANCED_FUEL_EQUIPMENT }
};

export default function CategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // 確保category是有效的CategoryId
  const categoryId = category as CategoryId;
  const isCategoryValid = categoryId && categoryId in equipmentCategories;
  
  if (!isCategoryValid) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="設備分類" 
          showBackButton 
          onBackPress={() => router.back()}
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.errorContainer}>
          <Database size={40} color={theme.secondaryText} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>找不到該設備分類</Text>
          <Text style={[styles.errorText, { color: theme.secondaryText }]}>
            請返回上一頁重新選擇設備分類
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const categoryData = equipmentCategories[categoryId];
  const equipmentList = categoryData.data;
  
  // 過濾設備
  const filteredEquipment = searchQuery
    ? equipmentList.filter((item: any) => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.technicalSpecs && JSON.stringify(item.technicalSpecs).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : equipmentList;
  
  // 渲染設備項目
  const renderEquipmentItem = ({ item }: { item: any }) => (
    <View style={[styles.equipmentCard, { backgroundColor: theme.card }]}>
      <View style={styles.equipmentHeader}>
        <Text style={[styles.equipmentName, { color: theme.text }]}>{item.name}</Text>
        <View style={styles.equipmentMeta}>
          <View style={[styles.emissionTag, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.emissionTagText, { color: theme.primary }]}>
              {item.emissionFactor} kg CO₂e
            </Text>
          </View>
          {item.type && (
            <View style={[styles.typeTag, { backgroundColor: theme.background }]}>
              <Text style={[styles.typeTagText, { color: theme.secondaryText }]}>
                {item.type}
              </Text>
            </View>
          )}
          {/* 添加綠色能源標籤 */}
          {categoryId === 'fuel' && (item.type === 'nuclear' || item.type === 'hydrogen') && (
            <View style={[styles.greenEnergyTag, { backgroundColor: '#4CAF5030' }]}>
              <Text style={[styles.greenEnergyTagText, { color: '#4CAF50' }]}>
                綠色能源
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      
      <View style={styles.equipmentDetails}>
        {item.technicalSpecs && (
          <View style={styles.specSection}>
            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>技術規格</Text>
            {Object.entries(item.technicalSpecs).map(([key, value]) => (
              <View key={key} style={styles.specItem}>
                <Text style={[styles.specLabel, { color: theme.secondaryText }]}>{key}:</Text>
                <Text style={[styles.specValue, { color: theme.text }]}>{value as string}</Text>
              </View>
            ))}
          </View>
        )}
        
        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>備註</Text>
            <Text style={[styles.notesText, { color: theme.text }]}>{item.notes}</Text>
          </View>
        )}
        
        {item.lifeCycleData && (
          <View style={styles.specSection}>
            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>生命週期數據 (kg CO₂e)</Text>
            {Object.entries(item.lifeCycleData).map(([key, value]) => (
              <View key={key} style={styles.specItem}>
                <Text style={[styles.specLabel, { color: theme.secondaryText }]}>{key}:</Text>
                <Text style={[styles.specValue, { color: theme.text }]}>{value as string}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={categoryData.name} 
        showBackButton 
        onBackPress={() => router.back()}
        textColor={theme.text}
        iconColor={theme.text}
      />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Search size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={`搜尋${categoryData.name}`}
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statsValue, { color: theme.primary }]}>{equipmentList.length}</Text>
          <Text style={[styles.statsLabel, { color: theme.secondaryText }]}>設備總數</Text>
        </View>
        
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statsValue, { color: theme.primary }]}>{filteredEquipment.length}</Text>
          <Text style={[styles.statsLabel, { color: theme.secondaryText }]}>搜尋結果</Text>
        </View>
      </View>
      
      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={[styles.emptyResults, { backgroundColor: theme.card }]}>
            <Database size={40} color={theme.secondaryText} />
            <Text style={[styles.emptyResultsTitle, { color: theme.text }]}>找不到符合的設備</Text>
            <Text style={[styles.emptyResultsText, { color: theme.secondaryText }]}>
              嘗試使用不同的關鍵詞搜尋
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  equipmentCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  equipmentHeader: {
    padding: 16,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  equipmentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emissionTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  emissionTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  typeTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  typeTagText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
  },
  equipmentDetails: {
    padding: 16,
  },
  specSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  specLabel: {
    fontSize: 14,
    width: 120,
  },
  specValue: {
    fontSize: 14,
    flex: 1,
  },
  notesSection: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  greenEnergyTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    marginLeft: 4,
  },
  greenEnergyTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 12,
  },
  emptyResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 