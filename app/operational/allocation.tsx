import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  DollarSign,
  BarChart3,
  Users,
  CheckCircle,
  AlertCircle,
  Settings,
  ArrowRight,
  Play,
  Clock,
  Percent,
  Target,
  Info,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import { formatEmissions } from '@/utils/helpers';
import { AllocationMethod, NonProjectEmissionRecord } from '@/types/project';
import { OPERATIONAL_CATEGORIES } from '@/mocks/projects';

export default function AllocationManagementScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    projects, 
    nonProjectEmissionRecords, 
    allocationRecords,
    calculateAllocations,
    applyAllocation
  } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [selectedMethod, setSelectedMethod] = useState<AllocationMethod>('budget');
  const [refreshing, setRefreshing] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [allocatingRecordId, setAllocatingRecordId] = useState<string | null>(null);
  
  // 進行中的專案
  const activeProjects = projects.filter(p => p.status === 'active');
  
  // 未分攤的記錄
  const unallocatedRecords = nonProjectEmissionRecords.filter(r => !r.isAllocated);
  
  // 已分攤的記錄
  const allocatedRecords = nonProjectEmissionRecords.filter(r => r.isAllocated);

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // 計算預算統計
  const budgetStats = React.useMemo(() => {
    const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const projectBudgets = activeProjects.map(project => ({
      ...project,
      percentage: totalBudget > 0 ? ((project.budget || 0) / totalBudget) * 100 : 0
    }));
    
    return {
      totalBudget,
      projectBudgets
    };
  }, [activeProjects]);

  // 計算分攤統計
  const allocationStats = React.useMemo(() => {
    const totalAllocated = allocationRecords.reduce((sum, record) => sum + record.allocatedAmount, 0);
    const totalUnallocated = unallocatedRecords.reduce((sum, record) => sum + record.amount, 0);
    const totalRecords = nonProjectEmissionRecords.length;
    const allocatedCount = allocatedRecords.length;
    
    return {
      totalAllocated,
      totalUnallocated,
      totalRecords,
      allocatedCount,
      unallocatedCount: unallocatedRecords.length,
      allocationPercentage: totalRecords > 0 ? (allocatedCount / totalRecords) * 100 : 0
    };
  }, [allocationRecords, unallocatedRecords, allocatedRecords, nonProjectEmissionRecords]);
  
  // 獲取類別資訊
  const getCategoryInfo = (categoryId: string) => {
    const category = OPERATIONAL_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? { name: category.name, color: category.color } : { name: categoryId, color: theme.primary };
  };

  // 處理單個記錄分攤
  const handleAllocateRecord = async (record: NonProjectEmissionRecord) => {
    if (activeProjects.length === 0) {
      Alert.alert(t('common.error'), t('allocation.no.projects.error'));
      return;
    }
    
    if (selectedMethod === 'budget' && budgetStats.totalBudget === 0) {
      Alert.alert(t('common.error'), t('allocation.no.budget.error'));
      return;
    }

    setAllocatingRecordId(record.id || '');
    
    try {
      // 建立分攤規則
      const allocationRule = {
        method: selectedMethod,
        targetProjects: activeProjects.map(p => p.id)
      };

      await applyAllocation(record.id!, allocationRule);
      
      Alert.alert(t('allocation.success'), t('allocation.success.message').replace('{method}', getMethodTitle(selectedMethod)));
    } catch (error) {
      Alert.alert(t('allocation.failed'), t('allocation.failed.message'));
      console.error('Allocation error:', error);
    } finally {
      setAllocatingRecordId(null);
    }
  };
  
  // 批量分攤所有未分攤記錄
  const allocateAllRecords = () => {
    if (unallocatedRecords.length === 0) {
      Alert.alert(t('common.notice'), t('allocation.no.records'));
      return;
    }
    
    if (selectedMethod === 'budget' && budgetStats.totalBudget === 0) {
      Alert.alert(t('common.error'), t('allocation.budget.not.set'));
      return;
    }
    
    Alert.alert(
      t('allocation.batch.confirm'),
      t('allocation.batch.confirm.message').replace('{method}', getMethodTitle(selectedMethod)).replace('{count}', unallocatedRecords.length.toString()),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              const allocationRule = {
                method: selectedMethod,
                targetProjects: activeProjects.map(p => p.id)
              };

              for (const record of unallocatedRecords) {
                await applyAllocation(record.id!, allocationRule);
              }
              
              Alert.alert(t('allocation.batch.success'), t('allocation.batch.success.message').replace('{count}', unallocatedRecords.length.toString()));
            } catch (error) {
              Alert.alert(t('allocation.failed'), t('allocation.batch.failed'));
              console.error('Batch allocation error:', error);
            }
          }
        }
      ]
    );
  };
  
  // 獲取分攤方式標題
  const getMethodTitle = (method: AllocationMethod) => {
    switch (method) {
      case 'budget': return t('allocation.method.budget');
      case 'equal': return t('allocation.method.equal');
      case 'duration': return t('allocation.method.duration');
      case 'custom': return t('allocation.method.custom');
      default: return t('allocation.method.unknown');
    }
  };

  // 獲取分攤方式圖標
  const getMethodIcon = (method: AllocationMethod) => {
    switch (method) {
      case 'budget': return <DollarSign size={20} color={theme.primary} />;
      case 'equal': return <Users size={20} color={theme.success} />;
      case 'duration': return <Clock size={20} color={theme.warning} />;
      case 'custom': return <Settings size={20} color={theme.secondary} />;
      default: return <Target size={20} color={theme.primary} />;
    }
  };

  // 渲染統計概覽
  const renderStatsOverview = () => (
    <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>分攤統計</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: theme.primary + '20' }]}>
            <TrendingUp size={20} color={theme.primary} />
          </View>
          <Text style={[styles.statValue, { color: theme.primary }]}>
            {formatEmissions(allocationStats.totalAllocated)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
            已分攤排放
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: theme.warning + '20' }]}>
            <Clock size={20} color={theme.warning} />
          </View>
          <Text style={[styles.statValue, { color: theme.warning }]}>
            {formatEmissions(allocationStats.totalUnallocated)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
            待分攤排放
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: theme.success + '20' }]}>
            <CheckCircle size={20} color={theme.success} />
          </View>
                        <Text style={[styles.statValue, { color: theme.success }]}>
                {allocationStats.allocatedCount.toString()}
              </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
            已分攤記錄
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: theme.error + '20' }]}>
            <AlertCircle size={20} color={theme.error} />
          </View>
          <Text style={[styles.statValue, { color: theme.error }]}>
            {allocationStats.unallocatedCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
            待分攤記錄
          </Text>
        </View>
      </View>

      <View style={[styles.progressContainer, { backgroundColor: theme.background }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.text }]}>分攤進度</Text>
          <Text style={[styles.progressPercentage, { color: theme.primary }]}>
            {allocationStats.allocationPercentage.toFixed(1)}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { backgroundColor: theme.primary, width: `${allocationStats.allocationPercentage}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );

  // 渲染分攤方式選擇
  const renderMethodSelector = () => (
    <View style={[styles.methodCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>分攤方式</Text>
        <TouchableOpacity onPress={() => setShowMethodModal(true)}>
          <Settings size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.methodSelector, { backgroundColor: theme.background, borderColor: theme.border }]}
        onPress={() => setShowMethodModal(true)}
      >
        <View style={styles.methodSelectorContent}>
          {getMethodIcon(selectedMethod)}
          <View style={styles.methodSelectorText}>
            <Text style={[styles.methodSelectorTitle, { color: theme.text }]}>
              {getMethodTitle(selectedMethod)}
            </Text>
            <Text style={[styles.methodSelectorDesc, { color: theme.secondaryText }]}>
              點擊切換分攤方式
            </Text>
          </View>
        </View>
        <ArrowRight size={20} color={theme.secondaryText} />
      </TouchableOpacity>

      {/* 預算分攤預覽 */}
      {selectedMethod === 'budget' && (
        <View style={[styles.budgetPreview, { backgroundColor: theme.background }]}>
          <View style={styles.budgetPreviewHeader}>
            <Info size={16} color={theme.primary} />
            <Text style={[styles.budgetPreviewTitle, { color: theme.text }]}>
              預算分攤預覽
            </Text>
          </View>
          
          {budgetStats.totalBudget === 0 ? (
            <Text style={[styles.budgetWarning, { color: theme.error }]}>
              ⚠️ 專案未設定預算，無法進行預算分攤
            </Text>
          ) : (
            <View style={styles.budgetBreakdown}>
              <Text style={[styles.budgetTotal, { color: theme.secondaryText }]}>
                總預算：{budgetStats.totalBudget.toLocaleString()}元
              </Text>
              
              {budgetStats.projectBudgets.slice(0, 3).map(project => (
                <View key={project.id} style={styles.budgetProjectItem}>
                  <View style={styles.budgetProjectHeader}>
                    <View style={[styles.projectIndicator, { backgroundColor: project.color }]} />
                    <Text style={[styles.budgetProjectName, { color: theme.text }]}>
                      {project.name}
                    </Text>
                    <Text style={[styles.budgetProjectPercentage, { color: theme.primary }]}>
                      {project.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
              
              {budgetStats.projectBudgets.length > 3 && (
                <Text style={[styles.budgetMore, { color: theme.secondaryText }]}>
                  還有 {budgetStats.projectBudgets.length - 3} 個專案...
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* 批量分攤按鈕 */}
      <TouchableOpacity
        style={[
          styles.batchAllocateButton,
          { 
            backgroundColor: unallocatedRecords.length > 0 ? theme.primary : theme.border,
            opacity: unallocatedRecords.length > 0 ? 1 : 0.5
          }
        ]}
        onPress={allocateAllRecords}
        disabled={unallocatedRecords.length === 0}
      >
        <Play size={16} color="white" />
        <Text style={styles.batchAllocateButtonText}>
          批量分攤 ({unallocatedRecords.length.toString()} 筆記錄)
        </Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染未分攤記錄
  const renderUnallocatedRecords = () => (
    <View style={[styles.recordsCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>待分攤記錄</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.warning + '20' }]}>
          <Text style={[styles.countBadgeText, { color: theme.warning }]}>
            {unallocatedRecords.length.toString()}
          </Text>
        </View>
      </View>

      {unallocatedRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <CheckCircle size={48} color={theme.success} />
          <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
            所有記錄都已分攤完成
          </Text>
        </View>
      ) : (
        <FlatList
          data={unallocatedRecords}
          keyExtractor={item => item.id || Math.random().toString()}
          renderItem={({ item }) => renderRecordItem(item, false)}
          showsVerticalScrollIndicator={false}
          style={styles.recordsList}
        />
      )}
    </View>
  );

  // 渲染已分攤記錄
  const renderAllocatedRecords = () => (
    <View style={[styles.recordsCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>已分攤記錄</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.success + '20' }]}>
          <Text style={[styles.countBadgeText, { color: theme.success }]}>
            {allocatedRecords.length.toString()}
          </Text>
        </View>
      </View>

      {allocatedRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={theme.secondaryText} />
          <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
            還沒有已分攤的記錄
          </Text>
        </View>
      ) : (
        <FlatList
          data={allocatedRecords.slice(0, 5)}
          keyExtractor={item => item.id || Math.random().toString()}
          renderItem={({ item }) => renderRecordItem(item, true)}
          showsVerticalScrollIndicator={false}
          style={styles.recordsList}
        />
      )}

      {allocatedRecords.length > 5 && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/operational/records')}
        >
          <Text style={[styles.viewAllButtonText, { color: theme.primary }]}>
            查看全部 {allocatedRecords.length.toString()} 筆記錄
          </Text>
          <ArrowRight size={16} color={theme.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  // 渲染記錄項目
  const renderRecordItem = (item: NonProjectEmissionRecord, isAllocated: boolean) => {
    const categoryInfo = getCategoryInfo(item.categoryId);
    const isAllocating = allocatingRecordId === item.id;
    
    return (
      <View style={[styles.recordItem, { borderBottomColor: theme.border }]}>
        <View style={styles.recordContent}>
          <View style={styles.recordHeader}>
            <View style={[styles.categoryIndicator, { backgroundColor: categoryInfo.color }]} />
            <View style={styles.recordInfo}>
              <Text style={[styles.recordDescription, { color: theme.text }]} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={[styles.recordMeta, { color: theme.secondaryText }]}>
                {categoryInfo.name} • {new Date(item.date).toLocaleDateString('zh-TW')}
              </Text>
            </View>
            <View style={styles.recordAmount}>
              <Text style={[styles.recordEmissionValue, { color: theme.primary }]}>
                {formatEmissions(item.amount)}
              </Text>
            </View>
          </View>

          {isAllocated && item.allocationRule && (
            <View style={[styles.allocationInfo, { backgroundColor: theme.background }]}>
              <Text style={[styles.allocationMethod, { color: theme.success }]}>
                {getMethodIcon(item.allocationRule.method)}
                <Text style={{ marginLeft: 4 }}>
                  {getMethodTitle(item.allocationRule.method)}
                </Text>
              </Text>
              <Text style={[styles.allocationProjects, { color: theme.secondaryText }]}>
                分攤到 {item.allocationRule.targetProjects.length} 個專案
              </Text>
            </View>
          )}

          {!isAllocated && (
            <TouchableOpacity
              style={[
                styles.allocateButton,
                { 
                  backgroundColor: isAllocating ? theme.border : theme.primary,
                  opacity: isAllocating ? 0.7 : 1
                }
              ]}
              onPress={() => handleAllocateRecord(item)}
              disabled={isAllocating}
            >
              {isAllocating ? (
                <Clock size={14} color={theme.secondaryText} />
              ) : (
                <Play size={14} color="white" />
              )}
              <Text style={[
                styles.allocateButtonText,
                { color: isAllocating ? theme.secondaryText : 'white' }
              ]}>
                {isAllocating ? '分攤中...' : '分攤'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // 渲染分攤方式選擇模態框
  const renderMethodModal = () => (
    <Modal
      visible={showMethodModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMethodModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>選擇分攤方式</Text>
            <TouchableOpacity onPress={() => setShowMethodModal(false)}>
              <Text style={[styles.modalCloseText, { color: theme.primary }]}>完成</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.methodOptions}>
            {[
              { 
                method: 'budget' as AllocationMethod, 
                title: '預算分攤', 
                desc: '依據專案預算比例分攤',
                icon: <DollarSign size={20} color={theme.primary} />
              },
              { 
                method: 'equal' as AllocationMethod, 
                title: '平均分攤', 
                desc: '平均分配到所有專案',
                icon: <Users size={20} color={theme.success} />
              },
              { 
                method: 'duration' as AllocationMethod, 
                title: '時間分攤', 
                desc: '依據專案執行天數分攤',
                icon: <Clock size={20} color={theme.warning} />
              },
              { 
                method: 'custom' as AllocationMethod, 
                title: '自訂分攤', 
                desc: '手動設定分攤比例',
                icon: <Settings size={20} color={theme.secondary} />
              }
            ].map(({ method, title, desc, icon }) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodOption,
                  { 
                    backgroundColor: selectedMethod === method ? theme.primary + '20' : theme.background,
                    borderColor: selectedMethod === method ? theme.primary : theme.border
                  }
                ]}
                onPress={() => {
                  setSelectedMethod(method);
                  setShowMethodModal(false);
                }}
              >
                <View style={styles.methodOptionContent}>
                  {icon}
                  <View style={styles.methodOptionText}>
                    <Text style={[styles.methodOptionTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.methodOptionDesc, { color: theme.secondaryText }]}>{desc}</Text>
                  </View>
                </View>
                {selectedMethod === method && (
                  <CheckCircle size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={t('allocation.title')} 
        showBackButton 
        rightComponent={
          <TouchableOpacity onPress={() => router.push('/operational/allocation-parameters')}>
            <Settings size={24} color={theme.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.content}>
          {renderStatsOverview()}
          {renderMethodSelector()}
          {renderUnallocatedRecords()}
          {renderAllocatedRecords()}
        </View>
      </ScrollView>

      {renderMethodModal()}
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },

  // 統計卡片
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressContainer: {
    padding: 12,
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // 方式選擇卡片
  methodCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  methodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  methodSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodSelectorText: {
    marginLeft: 12,
  },
  methodSelectorTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  methodSelectorDesc: {
    fontSize: 12,
  },
  budgetPreview: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  budgetPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetPreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  budgetWarning: {
    fontSize: 14,
    textAlign: 'center',
    padding: 8,
  },
  budgetBreakdown: {
    marginTop: 8,
  },
  budgetTotal: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  budgetProjectItem: {
    marginBottom: 8,
  },
  budgetProjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  budgetProjectName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  budgetProjectPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetMore: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  batchAllocateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  batchAllocateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },

  // 記錄卡片
  recordsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordsList: {
    maxHeight: 300,
  },
  recordItem: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  recordMeta: {
    fontSize: 12,
  },
  recordAmount: {
    alignItems: 'flex-end',
  },
  recordEmissionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  allocationInfo: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  allocationMethod: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  allocationProjects: {
    fontSize: 11,
  },
  allocateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  allocateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },

  // 空狀態
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },

  // 模態框
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '500',
  },
  methodOptions: {
    padding: 20,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  methodOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodOptionText: {
    marginLeft: 12,
  },
  methodOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  methodOptionDesc: {
    fontSize: 12,
  },
}); 