import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, TextInput, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, FolderPlus, X, BarChart3, TrendingDown, TrendingUp, ChevronRight, Building, Settings, Wrench } from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useFloatingAIStore } from '@/store/floatingAIStore';
import ProjectCard from '@/components/ProjectCard';
import EmptyState from '@/components/EmptyState';
import PageTitle from '@/components/PageTitle';
import AIAssistantButton from '@/components/AIAssistantButton';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { formatEmissions } from '@/utils/helpers';
import { LineChartAdapter } from '@/components/ChartAdapter';
import { generateAllTestData } from '@/utils/testDataGenerator';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/languageStore';

// 類型定義
interface DateMap {
  [key: string]: number;
}

const screenWidth = Dimensions.get('window').width;

export default function ProjectsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { 
    projects, 
    projectEmissionRecords, 
    nonProjectEmissionRecords, 
    calculateProjectEmissions, 
    allocationRecords,
    addProject,
    addProjectEmissionRecord,
    addNonProjectEmissionRecord,
    clearAllData
  } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const { showFloatingAI } = useFloatingAIStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // 不再初始化示例數據，保持應用乾淨狀態

  // 使用正確的計算方法計算總排放量
  const totalEmissions = useMemo(() => {
    // 計算所有專案的總排放量（包含直接排放和分攤排放）
    let totalProjectEmissions = 0;
    
    (projects || []).forEach(project => {
      const projectSummary = calculateProjectEmissions(project.id);
      totalProjectEmissions += projectSummary.totalEmissions;
    });
    
    // 計算未分攤的日常營運排放
    const totalOperationalEmissions = (nonProjectEmissionRecords || []).reduce((sum, record) => sum + record.amount, 0);
    const totalAllocatedEmissions = (allocationRecords || []).reduce((sum, record) => sum + record.allocatedAmount, 0);
    const unallocatedOperationalEmissions = totalOperationalEmissions - totalAllocatedEmissions;
    
    // 總排放量 = 所有專案排放 + 未分攤的日常營運排放
    return totalProjectEmissions + unallocatedOperationalEmissions;
  }, [projects, calculateProjectEmissions, nonProjectEmissionRecords, allocationRecords]);

  // 合併所有排放記錄以兼容圖表顯示邏輯
  const allEmissionRecords = [
    ...(projectEmissionRecords || []),
    ...(nonProjectEmissionRecords || [])
  ];
  
  // 計算總預算
  const totalBudget = projects.reduce((total, project) => total + (project.budget || 0), 0);
  
  // 計算進行中專案數量
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  
  // 計算每元碳排放KPI (kg CO2e / NT$)
  const carbonEfficiency = totalBudget > 0 ? totalEmissions / totalBudget : 0;
  
  // 格式化預算數字
  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };
  
  // 獲取最近30天的記錄
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentRecords = allEmissionRecords.filter(record => 
    new Date(record.date) >= thirtyDaysAgo
  );
  
  // 計算最近30天的排放量
  const recentEmissions = recentRecords.reduce((total, record) => total + record.amount, 0);
  
  // 準備圖表數據
  const chartData = (() => {
    if (recentRecords.length === 0) return { labels: [], datasets: [{ data: [0] }] };
    
    // 按日期分組數據
    const dataByDate = recentRecords.reduce<DateMap>((acc, record) => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += record.amount;
      return acc;
    }, {});
    
    // 獲取排序後的日期和相應數據
    const sortedDates = Object.keys(dataByDate).sort();
    
    // 取最近的5天數據，如果少於5天，則使用所有數據
    const recentDates = sortedDates.slice(-5);
    const values = recentDates.map(date => dataByDate[date]);
    
    // 格式化日期標籤
    const labels = recentDates.map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    return {
      labels,
      datasets: [{ data: values }]
    };
  })();
  
  // 計算趨勢 (與前30天相比)
  const calculateTrend = () => {
    // 獲取前30天的記錄 (60-30天前)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const previousPeriodRecords = allEmissionRecords.filter(record => 
      new Date(record.date) >= sixtyDaysAgo && new Date(record.date) < thirtyDaysAgo
    );
    
    const previousEmissions = previousPeriodRecords.reduce((total, record) => total + record.amount, 0);
    
    if (previousEmissions === 0) return 0;
    
    return ((recentEmissions - previousEmissions) / previousEmissions) * 100;
  };
  
  const emissionTrend = calculateTrend();
  const isDecreasing = emissionTrend <= 0;

  const filteredProjects = searchQuery && projects
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (projects || []);

  const handleAddProject = () => {
    router.push('/new-project');
  };

  const activateSearch = () => {
    setIsSearchActive(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };
  
  const navigateToAnalytics = () => {
    // 導航到整體分析頁面
    router.push('/analytics');
  };

  // 添加測試數據的處理函數
  const handleAddTestData = () => {
    try {
      console.log('開始添加測試數據...');
      
      const testData = generateAllTestData(language);
      
      // 添加測試專案
      testData.projects.forEach(project => {
        console.log('添加專案:', project.name);
        addProject(project);
      });
      
      // 添加日常營運記錄（會自動觸發分攤）
      testData.operationalRecords.forEach(record => {
        console.log('添加營運記錄:', record.description, '分攤到', record.allocationRule?.targetProjects?.length, '個專案');
        addNonProjectEmissionRecord(record);
      });
      
      // 添加專案排放記錄
      testData.projectRecords.forEach(record => {
        console.log('添加專案記錄:', record.description);
        addProjectEmissionRecord(record);
      });
      
      console.log('測試數據添加完成！');
      console.log(`添加了 ${testData.projects.length} 個專案`);
      console.log(`添加了 ${testData.operationalRecords.length} 筆營運記錄`);
      console.log(`添加了 ${testData.projectRecords.length} 筆專案記錄`);
      
      // 可以選擇顯示成功提示
      // Alert.alert('成功', '測試數據已添加完成！您現在可以在各個頁面查看這些數據。');
      
    } catch (error) {
      console.error('添加測試數據時發生錯誤:', error);
      // Alert.alert('錯誤', '添加測試數據時發生錯誤，請稍後重試。');
    }
  };

  // 清除所有數據的處理函數
  const handleClearAllData = () => {
    try {
      console.log('開始清除所有數據...');
      clearAllData();
      console.log('所有數據已清除！');
      
      // 可以選擇顯示成功提示
      // Alert.alert('成功', '所有數據已清除！應用恢復到初始狀態。');
      
    } catch (error) {
      console.error('清除數據時發生錯誤:', error);
      // Alert.alert('錯誤', '清除數據時發生錯誤，請稍後重試。');
    }
  };

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => theme.secondaryText,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.primary
    }
  };

  // 簡易圖表渲染
  const renderChart = () => {
    if (chartData.labels.length === 0 || !chartData.datasets[0].data.some(val => val > 0)) {
      return null;
    }
    
    return (
      <View style={styles.chartContainer}>
        <LineChartAdapter
          data={chartData}
          width={screenWidth - 60}
          height={160}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 12
          }}
          withInnerLines={false}
          withOuterLines={false}
          yAxisSuffix="kg"
          yAxisInterval={1}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <PageTitle 
        title={t('home.title')} 
        subtitle={t('home.subtitle')} 
        centered
      />

      {/* 測試數據管理 - Beta版本功能 */}
      <View style={[styles.testDataContainer, { backgroundColor: theme.card }]}>
        <View style={styles.testDataHeader}>
          <View style={styles.testDataInfo}>
            <Text style={[styles.testDataTitle, { color: theme.text }]}>
              {t('home.beta.title')}
            </Text>
            <Text style={[styles.testDataSubtitle, { color: theme.secondaryText }]}>
              {t('home.beta.subtitle')}
            </Text>
          </View>
        </View>
        
        <View style={styles.testDataButtonsContainer}>
          <TouchableOpacity 
            style={[styles.testDataButton, { 
              backgroundColor: '#10B981',
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              flex: 1,
              marginRight: 8,
            }]}
            onPress={handleAddTestData}
          >
            <Wrench size={16} color="white" />
            <Text style={styles.testDataButtonText}>{t('home.beta.add.test.data')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testDataButton, { 
              backgroundColor: '#EF4444',
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              flex: 1,
              marginLeft: 8,
            }]}
            onPress={handleClearAllData}
          >
            <X size={16} color="white" />
            <Text style={styles.testDataButtonText}>{t('home.beta.clear.all.data')}</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.testDataDescription, { color: theme.secondaryText }]}>
          {projects.length === 0 && nonProjectEmissionRecords.length === 0 
            ? t('home.beta.description.empty')
            : t('home.beta.description.has.data')
                .replace('{projectCount}', projects.length.toString())
                .replace('{operationalCount}', nonProjectEmissionRecords.length.toString())
                .replace('{projectRecordCount}', projectEmissionRecords.length.toString())
          }
        </Text>
      </View>

      {/* 碳排放摘要卡片 - 精簡版 */}
      <Pressable 
        style={[styles.compactEmissionCard, { backgroundColor: theme.card }]}
        onPress={navigateToAnalytics}
      >
        <View style={styles.compactCardHeader}>
          <View style={styles.compactHeaderLeft}>
            <BarChart3 size={18} color={theme.primary} />
            <Text style={[styles.compactCardTitle, { color: theme.text }]}>
              {t('home.emissions.overview')}
            </Text>
          </View>
          <ChevronRight size={16} color={theme.secondaryText} />
        </View>
        
        <View style={styles.compactStatsRow}>
          <View style={styles.compactStatItem}>
            <Text style={[styles.compactStatValue, { color: theme.primary }]}>
              {formatEmissions(totalEmissions)}
            </Text>
            <Text style={[styles.compactStatLabel, { color: theme.secondaryText }]}>
              {t('home.emissions.total')}
            </Text>
          </View>
          
          <View style={styles.compactStatDivider} />
          
          <View style={styles.compactStatItem}>
            <Text style={[styles.compactStatValue, { color: theme.primary }]}>
              {activeProjectsCount}
            </Text>
            <Text style={[styles.compactStatLabel, { color: theme.secondaryText }]}>
              {t('home.projects.active')}
            </Text>
          </View>
          
          <View style={styles.compactStatDivider} />
          
          <View style={styles.compactStatItem}>
            <View style={styles.compactTrendContainer}>
              {isDecreasing ? (
                <TrendingDown size={14} color={theme.success} />
              ) : (
                <TrendingUp size={14} color={emissionTrend === 0 ? theme.secondaryText : theme.error} />
              )}
              <Text style={[
                styles.compactStatValue, 
                { 
                  color: emissionTrend === 0 
                    ? theme.secondaryText 
                    : isDecreasing 
                      ? theme.success 
                      : theme.error,
                  marginLeft: 4
                }
              ]}>
                {emissionTrend === 0 ? '0%' : `${Math.abs(emissionTrend).toFixed(1)}%`}
              </Text>
            </View>
            <Text style={[styles.compactStatLabel, { color: theme.secondaryText }]}>
              {t('home.trend.30days')}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 日常營運管理卡片 */}
      <View style={[styles.operationalCard, { backgroundColor: theme.card }]}>
        <View style={styles.operationalHeader}>
          <View style={styles.operationalTitleSection}>
            <View style={[styles.operationalIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
              <Building size={28} color="#3B82F6" />
            </View>
            <View style={styles.operationalTitleInfo}>
              <Text style={[styles.operationalTitle, { color: theme.text }]}>
                {t('home.operational.management')}
              </Text>
              <Text style={[styles.operationalSubtitle, { color: theme.secondaryText }]}>
                {t('home.operational.subtitle')}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.operationalMainButton, { 
              backgroundColor: '#3B82F6',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 5,
            }]}
            onPress={() => router.push('/operational')}
          >
            <Text style={styles.operationalMainButtonText}>{t('home.operational.center')}</Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* 營運排放統計概覽 */}
        {nonProjectEmissionRecords.length > 0 && (
          <View style={[styles.operationalStatsContainer, { backgroundColor: theme.background }]}>
            <View style={styles.operationalStatsRow}>
              <View style={styles.operationalStatItem}>
                <Text style={[styles.operationalStatValue, { color: '#10B981' }]}>
                  {formatEmissions(nonProjectEmissionRecords.reduce((sum, r) => sum + r.amount, 0))}
                </Text>
                <Text style={[styles.operationalStatLabel, { color: theme.secondaryText }]}>
                  {t('home.operational.total.emissions')}
                </Text>
              </View>
              <View style={styles.operationalStatDivider} />
              <View style={styles.operationalStatItem}>
                <Text style={[styles.operationalStatValue, { color: '#F59E0B' }]}>
                  {nonProjectEmissionRecords.filter(r => r.isAllocated).length}/{nonProjectEmissionRecords.length}
                </Text>
                <Text style={[styles.operationalStatLabel, { color: theme.secondaryText }]}>
                  {t('home.operational.allocated.records')}
                </Text>
              </View>
              <View style={styles.operationalStatDivider} />
              <View style={styles.operationalStatItem}>
                <Text style={[styles.operationalStatValue, { color: theme.primary }]}>
                  {projects.filter(p => p.status === 'active').length}
                </Text>
                <Text style={[styles.operationalStatLabel, { color: theme.secondaryText }]}>
                  {t('home.operational.active.projects')}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* 快捷操作按鈕 */}
        <View style={styles.operationalQuickActions}>
          <AIAssistantButton
            variant="primary"
            size="medium"
            title={t('home.operational.ai.assistant')}
            onPress={() => router.push('/operational/ai-assistant')}
            style={styles.operationalQuickAction}
          />
          
          <TouchableOpacity 
            style={[styles.operationalQuickAction, { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }]}
            onPress={() => router.push('/operational/add-record')}
          >
            <Plus size={18} color={theme.primary} />
            <Text style={[styles.operationalQuickActionText, { color: theme.primary }]}>
              {t('home.operational.add.record')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.operationalQuickAction, { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }]}
            onPress={() => router.push('/operational/allocation')}
          >
            <Settings size={18} color={theme.primary} />
            <Text style={[styles.operationalQuickActionText, { color: theme.primary }]}>
              {t('home.operational.allocation.settings')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.operationalQuickAction, { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }]}
            onPress={() => router.push('/operational/reports')}
          >
            <BarChart3 size={18} color={theme.primary} />
            <Text style={[styles.operationalQuickActionText, { color: theme.primary }]}>
              {t('home.operational.reports')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 活躍專案指示器 */}
        {projects.filter(p => p.status === 'active').length > 0 && (
          <View style={[styles.activeProjectsIndicator, { backgroundColor: theme.background }]}>
            <View style={styles.indicatorLeft}>
              <View style={[styles.activeIndicatorDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.activeProjectsText, { color: theme.text }]}>
                {t('home.operational.active.indicator').replace('{count}', projects.filter(p => p.status === 'active').length.toString())}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/operational/allocation')}>
              <Text style={[styles.manageAllocationText, { color: theme.primary }]}>
                {t('home.operational.manage.allocation')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>

      {/* 項目管理操作欄 */}
      <View style={styles.projectActionsContainer}>
        {isSearchActive ? (
          <View style={[styles.searchInputContainer, { backgroundColor: theme.background }]}>
            <Search size={20} color={theme.secondaryText} />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('home.search.placeholder')}
              placeholderTextColor={theme.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoFocus
            />
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={theme.secondaryText} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.projectActionButton, { backgroundColor: theme.card }]} 
              onPress={activateSearch}
            >
              <Search size={20} color={theme.primary} />
              <Text style={[styles.projectActionText, { color: theme.primary }]}>{t('home.search.projects')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.addProjectButton, { backgroundColor: theme.primary }]} 
              onPress={handleAddProject}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addProjectButtonText}>{t('home.add.project')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 項目列表 */}
      {filteredProjects.length === 0 && (
        searchQuery ? (
          <View style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: theme.secondaryText }]}>
              {t('home.no.search.results')}
            </Text>
          </View>
        ) : (
          <EmptyState
            icon={<FolderPlus size={48} color={theme.secondaryText} />}
            title={t('home.no.projects')}
            description={t('home.no.projects.description')}
            actionLabel={t('home.create.first.project')}
            onAction={handleAddProject}
          />
        )
      )}

      {/* 添加項目列表展示 */}
      {filteredProjects.length > 0 && (
        <FlatList
          data={filteredProjects}
          renderItem={({ item }) => <ProjectCard project={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.projectList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 碳排放摘要卡片樣式
  emissionSummaryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // 緊湊版碳排放卡片樣式
  compactEmissionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  compactStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  compactStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 8,
  },
  compactStatValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  compactStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  compactTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emissionSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emissionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emissionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emissionSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  viewDetailsText: {
    fontSize: 12,
    marginRight: 4,
  },
  emissionStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  emissionStatItem: {
    alignItems: 'center',
  },
  emissionStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emissionStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  
  // KPI 區塊樣式
  kpiContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  kpiLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  
  // 日常營運卡片樣式
  operationalCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  operationalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  operationalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  operationalTitleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  operationalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  operationalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  operationalMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  operationalMainButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  operationalQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  operationalQuickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  operationalQuickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  operationalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  operationalStatsContainer: {
    marginVertical: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  operationalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  operationalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  operationalStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 12,
  },
  operationalStatValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  operationalStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeProjectsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  indicatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeProjectsText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  manageAllocationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  operationalSecondaryActions: {
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  operationalSecondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  operationalSecondaryActionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  // 項目管理操作欄樣式
  projectActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  projectActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  projectActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  addProjectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 4,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    fontSize: 16,
  },
  projectList: {
    padding: 20,
    paddingTop: 8,
  },
  
  // 測試數據按鈕樣式
  testDataContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderStyle: 'dashed',
  },
  testDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testDataInfo: {
    flex: 1,
  },
  testDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  testDataSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  testDataButtonsContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    gap: 0,
  },
  testDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  testDataButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  testDataDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
});