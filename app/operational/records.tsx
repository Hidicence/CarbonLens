import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar, 
  Trash2,
  Edit,
  X,
  Lightbulb,
  Droplets,
  FileText,
  Car,
  Zap,
  Building,
  RefreshCw
} from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import { formatEmissions, formatCurrency } from '@/utils/helpers';
import { NonProjectEmissionRecord } from '@/types/project';

export default function RecordsScreen() {
  const router = useRouter();
  const { nonProjectEmissionRecords, deleteNonProjectEmissionRecord, clearAllData, initializeWithSampleData } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 獲取所有類別
  const getCategories = () => {
    const categories = [...new Set((nonProjectEmissionRecords || []).map(record => record.categoryId))];
    return categories;
  };

  // 篩選和排序記錄
  const getFilteredRecords = () => {
    let filtered = [...(nonProjectEmissionRecords || [])];

    // 搜索篩選
    if (searchQuery) {
      filtered = filtered.filter(record => 
        (record.sourceId && record.sourceId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        record.categoryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 類別篩選
    if (selectedCategory) {
      filtered = filtered.filter(record => record.categoryId === selectedCategory);
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.categoryId;
          bValue = b.categoryId;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredRecords = getFilteredRecords();

  // 獲取類別圖標
  const getCategoryIcon = (categoryId: string) => {
    // 這裡使用categoryId，實際應該從categories數據中查找對應的名稱
    // 暫時使用categoryId作為匹配
    switch (categoryId) {
      case 'office-electricity':
      case '辦公室用電':
        return <Lightbulb size={20} color="#FFB800" />;
      case 'office-water':
      case '辦公室用水':
        return <Droplets size={20} color="#007AFF" />;
      case 'office-paper':
      case '辦公用紙':
        return <FileText size={20} color="#34C759" />;
      case 'employee-commute':
      case '員工通勤':
        return <Car size={20} color="#FF3B30" />;
      case 'office-waste':
      case '辦公廢料':
        return <Trash2 size={20} color="#8E8E93" />;
      case 'office-heating':
      case '辦公室暖氣':
        return <Zap size={20} color="#FF9500" />;
      default:
        return <Building size={20} color={theme.primary} />;
    }
  };

  // 刪除記錄
  const handleDeleteRecord = (recordId: string) => {
    console.log('準備刪除記錄，ID:', recordId);
    
    // 檢查記錄是否存在
    const recordExists = nonProjectEmissionRecords?.find(r => r.id === recordId);
    console.log('記錄是否存在:', recordExists ? '是' : '否');
    
    if (!recordExists) {
      Alert.alert('錯誤', '找不到要刪除的記錄');
      return;
    }
    
    Alert.alert(
      '刪除記錄',
      '確定要刪除這筆營運記錄嗎？此操作無法復原。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '刪除', 
          style: 'destructive',
          onPress: () => {
            console.log('執行刪除，記錄ID:', recordId);
            try {
              deleteNonProjectEmissionRecord(recordId);
              console.log('刪除成功');
              Alert.alert('成功', '記錄已刪除');
            } catch (error) {
              console.error('刪除失敗:', error);
              Alert.alert('錯誤', '刪除失敗，請重試');
            }
          }
        }
      ]
    );
  };

  // 調試用：重置所有數據
  const handleResetData = () => {
    Alert.alert(
      '清除所有數據',
      '這將清除所有已保存的數據，包括專案、記錄等，確定嗎？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '清除', 
          style: 'destructive',
          onPress: async () => {
            console.log('清除所有數據...');
            clearAllData();
            
            // 同時清除 AsyncStorage 中的持久化數據
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.removeItem('project-storage');
              console.log('持久化數據已清除');
            } catch (error) {
              console.error('清除持久化數據失敗:', error);
            }
            
            Alert.alert('完成', '所有數據已清除');
          }
        }
      ]
    );
  };

  // 渲染記錄項目
  const renderRecord = ({ item }: { item: NonProjectEmissionRecord }) => {
    // 調試信息
    console.log('渲染記錄:', {
      id: item.id,
      categoryId: item.categoryId,
      amount: item.amount,
      hasId: !!item.id,
      idType: typeof item.id
    });
    
    return (
      <View style={[styles.recordCard, { backgroundColor: theme.card }]}>
        <View style={styles.recordHeader}>
          <View style={styles.recordTitle}>
            {getCategoryIcon(item.categoryId)}
            <View style={styles.recordInfo}>
              <Text style={[styles.recordSource, { color: theme.text }]}>
                {item.sourceId || '未知來源'}
              </Text>
              <Text style={[styles.recordCategory, { color: theme.secondaryText }]}>
                {item.categoryId}
              </Text>
            </View>
          </View>
          <View style={styles.recordActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/operational/edit-record?id=${item.id || ''}`)}
            >
              <Edit size={16} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { opacity: item.id ? 1 : 0.5 }]}
              onPress={() => item.id && handleDeleteRecord(item.id)}
              disabled={!item.id}
            >
              <Trash2 size={16} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.recordDetails}>
          <View style={styles.recordMeta}>
            <Text style={[styles.recordDate, { color: theme.secondaryText }]}>
              {new Date(item.date).toLocaleDateString('zh-TW')}
            </Text>
            <Text style={[styles.recordQuantity, { color: theme.secondaryText }]}>
              {item.quantity} {item.unit || '單位'}
            </Text>
            {/* 顯示ID用於調試 */}
            <Text style={[styles.recordCategory, { color: theme.secondaryText, fontSize: 10 }]}>
              ID: {item.id || '無ID'}
            </Text>
          </View>
        </View>
        
        <View style={styles.recordFooter}>
          <View style={styles.recordValues}>
            <Text style={[styles.recordAmount, { color: theme.primary }]}>
              {formatEmissions(item.amount)}
            </Text>
            {/* NonProjectEmissionRecord 沒有 cost 字段，暫時移除 */}
          </View>
          {item.description && (
            <Text style={[styles.recordDescription, { color: theme.secondaryText }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // 渲染篩選模態框
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>篩選與排序</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.text }]}>類別</Text>
            <TouchableOpacity
              style={[
                styles.filterOption,
                { 
                  backgroundColor: selectedCategory === '' ? theme.primary : theme.background,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setSelectedCategory('')}
            >
              <Text style={[
                styles.filterOptionText,
                { color: selectedCategory === '' ? 'white' : theme.text }
              ]}>
                全部
              </Text>
            </TouchableOpacity>
            
            {getCategories().map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterOption,
                  { 
                    backgroundColor: selectedCategory === category ? theme.primary : theme.background,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: selectedCategory === category ? 'white' : theme.text }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.text }]}>排序方式</Text>
            {[
              { key: 'date', label: '日期' },
              { key: 'amount', label: '碳排放量' },
              { key: 'category', label: '類別' }
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  { 
                    backgroundColor: sortBy === option.key ? theme.primary : theme.background,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => setSortBy(option.key as any)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: sortBy === option.key ? 'white' : theme.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.text }]}>排序順序</Text>
            <TouchableOpacity
              style={[
                styles.filterOption,
                { 
                  backgroundColor: sortOrder === 'desc' ? theme.primary : theme.background,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setSortOrder('desc')}
            >
              <Text style={[
                styles.filterOptionText,
                { color: sortOrder === 'desc' ? 'white' : theme.text }
              ]}>
                降序
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                { 
                  backgroundColor: sortOrder === 'asc' ? theme.primary : theme.background,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setSortOrder('asc')}
            >
              <Text style={[
                styles.filterOptionText,
                { color: sortOrder === 'asc' ? 'white' : theme.text }
              ]}>
                升序
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={`營運記錄 (${filteredRecords.length})`}
        showBackButton={true}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleResetData}
            >
              <RefreshCw size={20} color={theme.error} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Search size={20} color={theme.secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="搜索記錄..."
          placeholderTextColor={theme.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        renderItem={renderRecord}
        keyExtractor={item => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building size={48} color={theme.secondaryText} />
            <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
              {searchQuery || selectedCategory ? '沒有符合條件的記錄' : '還沒有營運記錄'}
            </Text>
          </View>
        }
      />

      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButton: {
    padding: 4,
  },
  resetButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  recordCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recordSource: {
    fontSize: 16,
    fontWeight: '600',
  },
  recordCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  recordDetails: {
    marginBottom: 8,
  },
  recordMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordDate: {
    fontSize: 14,
  },
  recordQuantity: {
    fontSize: 14,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recordValues: {
    alignItems: 'flex-end',
  },
  recordAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  recordCost: {
    fontSize: 12,
    marginTop: 2,
  },
  recordDescription: {
    fontSize: 12,
    flex: 1,
    marginRight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});