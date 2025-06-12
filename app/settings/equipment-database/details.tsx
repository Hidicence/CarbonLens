import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Share
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  Share2,
  Clock,
  BarChart4,
  FileText,
  CheckCircle,
  AlertTriangle,
  Leaf
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

// 定義設備分類映射
const equipmentCategoryMap = {
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

export default function EquipmentDetailsScreen() {
  const router = useRouter();
  const { id, category } = useLocalSearchParams<{ id: string, category: string }>();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { width } = useWindowDimensions();
  
  // 獲取設備數據
  const categoryData = equipmentCategoryMap[category as keyof typeof equipmentCategoryMap];
  const equipment = categoryData?.data.find(item => item.id === id);
  
  if (!equipment || !categoryData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="設備詳情" 
          showBackButton 
          onBackPress={() => router.back()}
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.errorContainer}>
          <AlertTriangle size={40} color={theme.error} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>找不到該設備</Text>
          <Text style={[styles.errorText, { color: theme.secondaryText }]}>
            請返回上一頁重新選擇設備
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 分享設備數據
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${equipment.name} - 碳排放因子: ${equipment.emissionFactor} kg CO₂e\n技術規格: ${JSON.stringify(equipment.technicalSpecs)}\n備註: ${equipment.notes || '無'}`,
        title: `碳鏡頭 - ${equipment.name} 碳排放數據`,
      });
    } catch (error) {
      console.error('分享失敗:', error);
    }
  };
  
  // 判斷是否為綠色能源設備
  const isGreenEnergy = category === 'fuel' && (equipment.type === 'nuclear' || equipment.type === 'hydrogen');
  
  // 計算生命週期圖表數據比例
  const lifeCycleData = equipment.lifeCycleData;
  const maxLifeCycleValue = lifeCycleData ? 
    Math.max(
      lifeCycleData.manufacturing || 0, 
      lifeCycleData.transportation || 0, 
      (lifeCycleData.usage || 0) * 365 * (lifeCycleData.lifespan || 1), 
      lifeCycleData.endOfLife || 0
    ) : 0;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="設備詳情" 
        showBackButton 
        onBackPress={() => router.back()}
        textColor={theme.text}
        iconColor={theme.text}
        rightComponent={
          <TouchableOpacity onPress={handleShare}>
            <Share2 size={24} color={theme.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.equipmentName, { color: theme.text }]}>{equipment.name}</Text>
            <Text style={[styles.categoryName, { color: theme.secondaryText }]}>{categoryData.name}</Text>
            
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>
                  {equipment.emissionFactor} kg CO₂e
                </Text>
              </View>
              
              {equipment.type && (
                <View style={[styles.badge, { backgroundColor: theme.background }]}>
                  <Text style={[styles.badgeText, { color: theme.secondaryText }]}>
                    {equipment.type}
                  </Text>
                </View>
              )}
              
              {isGreenEnergy && (
                <View style={[styles.badge, { backgroundColor: '#4CAF5030' }]}>
                  <Leaf size={14} color="#4CAF50" style={{ marginRight: 4 }} />
                  <Text style={[styles.badgeText, { color: '#4CAF50' }]}>
                    綠色能源
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {equipment.recognitionData?.imageUrls && equipment.recognitionData.imageUrls.length > 0 && (
            <Image 
              source={{ uri: equipment.recognitionData.imageUrls[0] }}
              style={styles.equipmentImage}
              resizeMode="contain"
            />
          )}
        </View>
        
        {equipment.technicalSpecs && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>技術規格</Text>
            </View>
            <View style={styles.specsList}>
              {Object.entries(equipment.technicalSpecs).map(([key, value]) => (
                <View key={key} style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: theme.secondaryText }]}>{key}:</Text>
                  <Text style={[styles.specValue, { color: theme.text }]}>{value as string}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {lifeCycleData && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <BarChart4 size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>生命週期碳排放</Text>
            </View>
            
            <View style={styles.lifeCycleStats}>
              <View style={styles.lifeCycleStat}>
                <Text style={[styles.lifeCycleValue, { color: theme.primary }]}>{lifeCycleData?.totalLifeCycle || 0}</Text>
                <Text style={[styles.lifeCycleLabel, { color: theme.secondaryText }]}>總排放量 (kg CO₂e)</Text>
              </View>
              <View style={styles.lifeCycleStat}>
                <Text style={[styles.lifeCycleValue, { color: theme.primary }]}>{lifeCycleData?.lifespan || 0}</Text>
                <Text style={[styles.lifeCycleLabel, { color: theme.secondaryText }]}>預計壽命 (年)</Text>
              </View>
            </View>
            
            <View style={styles.chartContainer}>
              <View style={styles.chartItem}>
                <Text style={[styles.chartLabel, { color: theme.secondaryText }]}>製造</Text>
                <View style={styles.chartBarContainer}>
                  <View 
                    style={[
                      styles.chartBar, 
                      { 
                        backgroundColor: theme.primary, 
                        width: `${((lifeCycleData?.manufacturing || 0) / maxLifeCycleValue) * 100}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.chartValue, { color: theme.text }]}>{lifeCycleData?.manufacturing || 0}</Text>
              </View>
              
              <View style={styles.chartItem}>
                <Text style={[styles.chartLabel, { color: theme.secondaryText }]}>運輸</Text>
                <View style={styles.chartBarContainer}>
                  <View 
                    style={[
                      styles.chartBar, 
                      { 
                        backgroundColor: theme.primary, 
                        width: `${((lifeCycleData?.transportation || 0) / maxLifeCycleValue) * 100}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.chartValue, { color: theme.text }]}>{lifeCycleData?.transportation || 0}</Text>
              </View>
              
              <View style={styles.chartItem}>
                <Text style={[styles.chartLabel, { color: theme.secondaryText }]}>使用</Text>
                <View style={styles.chartBarContainer}>
                  <View 
                    style={[
                      styles.chartBar, 
                      { 
                        backgroundColor: theme.primary, 
                        width: `${(((lifeCycleData?.usage || 0) * 365 * (lifeCycleData?.lifespan || 1)) / maxLifeCycleValue) * 100}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.chartValue, { color: theme.text }]}>
                  {((lifeCycleData?.usage || 0) * 365 * (lifeCycleData?.lifespan || 1)).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.chartItem}>
                <Text style={[styles.chartLabel, { color: theme.secondaryText }]}>報廢</Text>
                <View style={styles.chartBarContainer}>
                  <View 
                    style={[
                      styles.chartBar, 
                      { 
                        backgroundColor: theme.primary, 
                        width: `${((lifeCycleData?.endOfLife || 0) / maxLifeCycleValue) * 100}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.chartValue, { color: theme.text }]}>{lifeCycleData?.endOfLife || 0}</Text>
              </View>
            </View>
          </View>
        )}
        
        {equipment.isoCertification && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>ISO認證</Text>
            </View>
            <View style={styles.specsList}>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: theme.secondaryText }]}>標準:</Text>
                <Text style={[styles.specValue, { color: theme.text }]}>{equipment.isoCertification.standard}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: theme.secondaryText }]}>認證機構:</Text>
                <Text style={[styles.specValue, { color: theme.text }]}>{equipment.isoCertification.certifiedBy}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: theme.secondaryText }]}>認證日期:</Text>
                <Text style={[styles.specValue, { color: theme.text }]}>{equipment.isoCertification.certificationDate}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: theme.secondaryText }]}>有效期至:</Text>
                <Text style={[styles.specValue, { color: theme.text }]}>{equipment.isoCertification.validUntil}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: theme.secondaryText }]}>認證編號:</Text>
                <Text style={[styles.specValue, { color: theme.text }]}>{equipment.isoCertification.certificationId}</Text>
              </View>
            </View>
          </View>
        )}
        
        {equipment.notes && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>備註</Text>
            </View>
            <Text style={[styles.notesText, { color: theme.text }]}>{equipment.notes}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>
            數據來源: {equipment.dataSource || 'ISO 14064/14067碳足跡標準'}
          </Text>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>
            數據更新日期: 2023年12月
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  equipmentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  specsList: {
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specLabel: {
    fontSize: 14,
    width: 100,
  },
  specValue: {
    fontSize: 14,
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  lifeCycleStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  lifeCycleStat: {
    flex: 1,
    alignItems: 'center',
  },
  lifeCycleValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  lifeCycleLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartLabel: {
    width: 40,
    fontSize: 12,
  },
  chartBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 8,
  },
  chartValue: {
    width: 50,
    fontSize: 12,
    textAlign: 'right',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
}); 