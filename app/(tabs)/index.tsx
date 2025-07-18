import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Dimensions, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, FolderPlus, X, BarChart3, TrendingDown, TrendingUp, ChevronRight, Building, Wrench } from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useFloatingAIStore } from '@/store/floatingAIStore';
import { useBetaToolsStore } from '@/store/betaToolsStore';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import PageTitle from '@/components/PageTitle';
import EmptyState from '@/components/EmptyState';
import ProjectCard from '@/components/ProjectCard';
import StatusBadge from '@/components/StatusBadge';
import AIAssistantButton from '@/components/AIAssistantButton';
import { formatEmissions } from '@/utils/helpers';
import { generateAllTestData } from '@/utils/testDataGenerator';
import Colors from '@/constants/colors';

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
  const { showBetaTools } = useBetaToolsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  
  // Store 已初始化檢查
  // 由於現在 isInitialized 預設為 true，不需要額外檢查

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
  
  // 計算進行中專案數量
  const activeProjectsCount = projects && Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0;
  
  // 獲取最近30天的記錄
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentRecords = allEmissionRecords && Array.isArray(allEmissionRecords) ? allEmissionRecords.filter(record => 
    new Date(record.date) >= thirtyDaysAgo
  ) : [];
  
  // 計算最近30天的排放量
  const recentEmissions = recentRecords.reduce((total, record) => total + record.amount, 0);
  
  // 計算趨勢 (與前30天相比)
  const calculateTrend = () => {
    // 獲取前30天的記錄 (60-30天前)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const previousPeriodRecords = allEmissionRecords && Array.isArray(allEmissionRecords) ? allEmissionRecords.filter(record => 
      new Date(record.date) >= sixtyDaysAgo && new Date(record.date) < thirtyDaysAgo
    ) : [];
    
    const previousEmissions = previousPeriodRecords.reduce((total, record) => total + record.amount, 0);
    
    if (previousEmissions === 0) return 0;
    
    return ((recentEmissions - previousEmissions) / previousEmissions) * 100;
  };
  
  const emissionTrend = calculateTrend();
  const isDecreasing = emissionTrend <= 0;

  const filteredProjects = searchQuery && projects && Array.isArray(projects)
    ? projects.filter(project => 
        (project.name && project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (projects && Array.isArray(projects) ? projects : []);

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
    router.push('/analytics');
  };

  // 添加測試數據的處理函數
  const handleAddTestData = () => {
    try {
      console.log('開始添加測試數據...');
      
      if ((projects && Array.isArray(projects) && projects.length > 0) || (nonProjectEmissionRecords && nonProjectEmissionRecords.length > 0)) {
        console.log('⚠️ 檢測到已有數據，請先清空所有數據再添加測試數據');
        return;
      }
      
      const testData = generateAllTestData(language);
      
      // 添加測試專案
      testData.projects.forEach(project => {
        console.log('添加專案:', project.name);
        addProject(project);
      });
      
      // 添加日常營運記錄
      testData.operationalRecords.forEach(record => {
        console.log('添加營運記錄:', record.description);
        addNonProjectEmissionRecord(record);
      });
      
      // 添加專案排放記錄
      testData.projectRecords.forEach(record => {
        console.log('添加專案記錄:', record.description);
        addProjectEmissionRecord(record);
      });
      
      console.log('測試數據添加完成！');
      
    } catch (error) {
      console.error('添加測試數據時發生錯誤:', error);
    }
  };

  // 清除所有數據的處理函數
  const handleClearAllData = async () => {
    try {
      console.log('開始清除所有數據...');
      await clearAllData();
      console.log('所有數據已清除！');
    } catch (error) {
      console.error('清除數據時發生錯誤:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <PageTitle 
          title={t('home.title')} 
          subtitle={t('home.subtitle')} 
          centered
        />

        {/* 測試數據管理 - Beta版本功能 */}
        {showBetaTools && (
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
              {(() => {
                if ((!projects || !Array.isArray(projects) || projects.length === 0) && (!nonProjectEmissionRecords || nonProjectEmissionRecords.length === 0)) {
                  return t('home.beta.description.empty') || '新增測試數據以開始使用';
                } else {
                  const template = t('home.beta.description.has.data') || '目前有 {projectCount} 個專案，{operationalCount} 筆營運記錄，{projectRecordCount} 筆專案記錄';
                  return template
                    .replace('{projectCount}', projects && Array.isArray(projects) ? projects.length.toString() : '0')
                    .replace('{operationalCount}', nonProjectEmissionRecords && Array.isArray(nonProjectEmissionRecords) ? nonProjectEmissionRecords.length.toString() : '0')
                    .replace('{projectRecordCount}', projectEmissionRecords && Array.isArray(projectEmissionRecords) ? projectEmissionRecords.length.toString() : '0');
                }
              })()}
            </Text>
          </View>
        )}

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
                {activeProjectsCount.toString()}
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
          {nonProjectEmissionRecords && Array.isArray(nonProjectEmissionRecords) && nonProjectEmissionRecords.length > 0 && (
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
                    {nonProjectEmissionRecords && Array.isArray(nonProjectEmissionRecords) ? nonProjectEmissionRecords.filter(r => r.isAllocated).length.toString() : '0'}/{nonProjectEmissionRecords && Array.isArray(nonProjectEmissionRecords) ? nonProjectEmissionRecords.length.toString() : '0'}
                  </Text>
                  <Text style={[styles.operationalStatLabel, { color: theme.secondaryText }]}>
                    {t('home.operational.allocated.records')}
                  </Text>
                </View>
                <View style={styles.operationalStatDivider} />
                <View style={styles.operationalStatItem}>
                  <Text style={[styles.operationalStatValue, { color: theme.primary }]}>
                    {projects && Array.isArray(projects) ? projects.filter(p => p.status === 'active').length.toString() : '0'}
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
          </View>

          {/* 活躍專案指示器 */}
          {projects && Array.isArray(projects) && projects.filter(p => p.status === 'active').length > 0 && (
            <View style={[styles.activeProjectsIndicator, { backgroundColor: theme.background }]}>
              <View style={styles.indicatorLeft}>
                <View style={[styles.activeIndicatorDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.activeProjectsText, { color: theme.text }]}>
                  {(() => {
                    const activeCount = projects && Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0;
                    const indicatorText = t('home.operational.active.indicator') || '目前有 {count} 個進行中專案';
                    return indicatorText.replace('{count}', activeCount.toString());
                  })()}
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

        {/* 項目列表展示 */}
        {filteredProjects.length > 0 && (
          <View style={styles.projectList}>
            {filteredProjects.map((project, index) => {
              if (!project || !project.id) {
                return null;
              }
              
              return (
                <View key={project.id} style={{ marginBottom: 16 }}>
                  <ProjectCard project={project} />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: '500',
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