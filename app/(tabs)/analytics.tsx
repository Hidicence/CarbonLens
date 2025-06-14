import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Dimensions, TouchableOpacity, Alert, ActivityIndicator, Platform, Share } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { useProjectStore } from '@/store/projectStore';
import { useLanguageStore } from '@/store/languageStore';
import { useProfileStore } from '@/store/profileStore';
import Colors from '@/constants/colors';
import PageTitle from '@/components/PageTitle';
import { 
  Activity, 
  Target,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Globe,
  Building,
  Zap,
  FileText,
  Download,
  Share2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb
} from 'lucide-react-native';
import { formatEmissions } from '@/utils/helpers';
import { LineChartAdapter, PieChartAdapter } from '@/components/ChartAdapter';
import { useRouter } from 'expo-router';
import { generateCarbonFootprintReport, setReportGeneratingCallback, shareReport, ReportOptions } from '@/utils/reportGenerator';
import { ProjectEmissionSummary } from '@/types/project';

const screenWidth = Dimensions.get('window').width;

// Tab 選項類型
type AnalysisType = 'overview' | 'projects' | 'stages' | 'intensity' | 'reports';

interface AnalysisTab {
  id: AnalysisType;
  title: string;
  icon: any;
}

const ANALYSIS_TABS: AnalysisTab[] = [
  { id: 'overview', title: 'analytics.overview', icon: Activity },
  { id: 'projects', title: 'analytics.project.analysis', icon: Target },
  { id: 'stages', title: 'analytics.stage.breakdown', icon: Layers },
  { id: 'intensity', title: 'analytics.efficiency.metrics', icon: TrendingUp },
  { id: 'reports', title: 'analytics.report.management', icon: FileText },
];

export default function AnalyticsScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { 
    projects, 
    projectEmissionRecords, 
    nonProjectEmissionRecords, 
    allocationRecords,
    calculateProjectEmissions 
  } = useProjectStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [selectedTab, setSelectedTab] = useState<AnalysisType>('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    includeOrganizationInfo: true,
    includeExecutiveSummary: true,
    includeEmissionInventory: true,
    includeLifecycleAnalysis: true,
    includeEfficiencyMetrics: true,
    includeRecommendations: true,
    includeDataSources: true,
    format: 'comprehensive' as 'comprehensive' | 'summary' | 'executive'
  });
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // 設定報告生成回調
  useEffect(() => {
    setReportGeneratingCallback(setIsGeneratingReport);
  }, []);

  // 計算專案摘要數據
  const projectSummaries = useMemo(() => {
    const summaries: { [key: string]: ProjectEmissionSummary } = {};
    if (projects && projects.length > 0) {
      projects.forEach(project => {
        summaries[project.id] = calculateProjectEmissions(project.id);
      });
    }
    return summaries;
  }, [projects, calculateProjectEmissions]);

  // 計算總體統計
  const overallStats = useMemo(() => {
    // 計算所有專案的總排放量（包含直接排放和分攤排放）
    let totalProjectEmissions = 0;
    let totalRecords = 0;

    (projects || []).forEach(project => {
      const projectSummary = calculateProjectEmissions(project.id);
      totalProjectEmissions += projectSummary.totalEmissions;
      totalRecords += projectSummary.directRecordCount + projectSummary.allocatedRecordCount;
    });

    // 計算未分攤的日常營運排放
    const totalOperationalEmissions = (nonProjectEmissionRecords || []).reduce((sum, record) => sum + record.amount, 0);
    const totalAllocatedEmissions = (allocationRecords || []).reduce((sum, record) => sum + record.allocatedAmount, 0);
    const unallocatedOperationalEmissions = totalOperationalEmissions - totalAllocatedEmissions;

    // 總排放量 = 所有專案排放 + 未分攤的日常營運排放
    const totalEmissions = totalProjectEmissions + unallocatedOperationalEmissions;

    return {
      totalEmissions,
      totalRecords,
      averageEmissions: (projects && projects.length > 0) ? totalEmissions / projects.length : 0,
      activeProjects: projects ? projects.filter(p => p.status === 'active').length : 0
    };
  }, [projects, calculateProjectEmissions, nonProjectEmissionRecords, allocationRecords]);

  // 計算所有專案的階段排放統計
  const overallStageStats = useMemo(() => {
    const stats = {
      'pre-production': 0,
      'production': 0,
      'post-production': 0
    };
    
    (projects || []).forEach(project => {
      const projectSummary = calculateProjectEmissions(project.id);
      if (projectSummary.stageEmissions) {
        stats['pre-production'] += projectSummary.stageEmissions['pre-production'];
        stats['production'] += projectSummary.stageEmissions['production'];
        stats['post-production'] += projectSummary.stageEmissions['post-production'];
      }
    });
    
    const total = stats['pre-production'] + stats['production'] + stats['post-production'];
    
    return {
      stats,
      total,
      percentages: {
        'pre-production': total > 0 ? (stats['pre-production'] / total * 100) : 0,
        'production': total > 0 ? (stats['production'] / total * 100) : 0,
        'post-production': total > 0 ? (stats['post-production'] / total * 100) : 0
      }
    };
  }, [projects, calculateProjectEmissions]);

  // 階段圓餅圖數據
  const stageChartData = useMemo(() => {
    return [
      {
        name: t('stage.pre-production'),
        value: overallStageStats.stats['pre-production'],
        color: '#3b82f6',
        legendFontColor: theme.text,
        legendFontSize: 12,
      },
      {
        name: t('stage.production'),
        value: overallStageStats.stats['production'],
        color: '#f59e0b',
        legendFontColor: theme.text,
        legendFontSize: 12,
      },
      {
        name: t('stage.post-production'),
        value: overallStageStats.stats['post-production'],
        color: '#10b981',
        legendFontColor: theme.text,
        legendFontSize: 12,
      }
    ].filter(item => item.value > 0);
  }, [overallStageStats, theme.text]);

  // 計算效率指標數據
  const efficiencyStats = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        carbonPerBudget: 0,
        avgDailyEmissions: 0,
        bestProject: null,
        worstProject: null,
        monthlyTrend: [] as Array<{ month: string; efficiency: number }>,
        projectEfficiency: [] as Array<{
          projectId: string;
          projectName: string;
          carbonPerBudget: number;
          carbonPerDay: number;
          totalEmissions: number;
          budget: number;
          duration: number;
          status: string;
        }>
      };
    }

    // 計算各專案效率指標
    const projectEfficiency = projects.map(project => {
      const projectSummary = calculateProjectEmissions(project.id);
      const budget = project.budget || 1;
      const duration = project.startDate && project.endDate 
        ? Math.max(1, Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

      return {
        projectId: project.id,
        projectName: project.name,
        carbonPerBudget: projectSummary.totalEmissions / budget, // kg CO2e / NT$
        carbonPerDay: projectSummary.totalEmissions / duration,   // kg CO2e / day
        totalEmissions: projectSummary.totalEmissions,
        budget: project.budget || 0,
        duration,
        status: project.status
      };
    }).filter(p => p.totalEmissions > 0);

    // 整體效率指標
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const carbonPerBudget = totalBudget > 0 ? overallStats.totalEmissions / totalBudget : 0;

    // 計算平均每日排放
    const totalDays = projects.reduce((sum, p) => {
      if (p.startDate && p.endDate) {
        const days = Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.max(1, days);
      }
      return sum + 30; // 預設30天
    }, 0);
    const avgDailyEmissions = totalDays > 0 ? overallStats.totalEmissions / totalDays : 0;

    // 找出最佳和最差效率專案
    const sortedByEfficiency = [...projectEfficiency].sort((a, b) => a.carbonPerBudget - b.carbonPerBudget);
    const bestProject = sortedByEfficiency[0] || null;
    const worstProject = sortedByEfficiency[sortedByEfficiency.length - 1] || null;

    // 生成月度趨勢數據（基於實際數據的簡化計算）
    const monthlyTrend: Array<{ month: string; efficiency: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = `${date.getMonth() + 1}月`;
      const efficiency = carbonPerBudget * (0.8 + Math.random() * 0.4); // 模擬變化
      monthlyTrend.push({
        month: monthName,
        efficiency: efficiency
      });
    }

    return {
      carbonPerBudget,
      avgDailyEmissions,
      bestProject,
      worstProject,
      monthlyTrend,
      projectEfficiency: projectEfficiency.slice(0, 5) // 只顯示前5個專案
    };
  }, [projects, calculateProjectEmissions, overallStats.totalEmissions]);

  // 簡潔圖表數據
  const chartData = useMemo(() => {
    // 合併所有排放記錄
    const allEmissionRecords = [
      ...(projectEmissionRecords || []),
      ...(nonProjectEmissionRecords || [])
    ];

    if (allEmissionRecords.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [0] }],
        chartConfig: {
          backgroundColor: theme.card,
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: (opacity = 1) => theme.text,
          strokeWidth: 2,
          useShadowColorFromDataset: false,
        }
      };
    }

    // 獲取最近30天的記錄
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentRecords = allEmissionRecords.filter(record => 
      new Date(record.date) >= thirtyDaysAgo
    );

    if (recentRecords.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [0] }],
        chartConfig: {
          backgroundColor: theme.card,
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: (opacity = 1) => theme.text,
          strokeWidth: 2,
          useShadowColorFromDataset: false,
        }
      };
    }

    // 按日期分組數據
    const dataByDate = recentRecords.reduce<{ [key: string]: number }>((acc, record) => {
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
      datasets: [{ data: values }],
      chartConfig: {
        backgroundColor: theme.card,
        backgroundGradientFrom: theme.card,
        backgroundGradientTo: theme.card,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => theme.text,
        strokeWidth: 2,
        useShadowColorFromDataset: false,
      }
    };
  }, [projects, projectEmissionRecords, nonProjectEmissionRecords, allocationRecords, calculateProjectEmissions, theme]);

  // Tab 導航欄
  const renderTabBar = () => (
    <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {ANALYSIS_TABS.map((tab) => {
          const isSelected = selectedTab === tab.id;
          return (
            <TouchableOpacity 
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor: isSelected ? theme.primary : 'transparent',
                  borderColor: isSelected ? theme.primary : theme.border
                }
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <tab.icon 
                size={16} 
                color={isSelected ? '#FFFFFF' : theme.text} 
              />
              <Text style={[
                styles.tabText,
                { color: isSelected ? '#FFFFFF' : theme.text }
              ]}>
                {t(tab.title)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const StatCard = ({ title, value, change, icon: Icon, color }: {
    title: string;
    value: string;
    change: number;
    icon: any;
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: theme.card }]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.statChange}>
          {change !== 0 && (
            change > 0 ? 
              <ArrowUpRight size={12} color="#ef4444" /> : 
              <ArrowDownRight size={12} color="#10b981" />
          )}
          <Text style={[styles.statChangeText, { 
            color: change > 0 ? '#ef4444' : change < 0 ? '#10b981' : theme.secondaryText 
          }]}>
            {change !== 0 ? `${Math.abs(change).toFixed(1)}%` : ''}
          </Text>
        </View>
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{title}</Text>
    </View>
  );

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );

  const renderOverview = () => (
    <View style={styles.contentContainer}>
      {/* 統計卡片 */}
      <View style={styles.statsGrid}>
        <StatCard
          title={t('emissions.total')}
          value={formatEmissions(overallStats.totalEmissions, t)}
          change={0}
          icon={Globe}
          color="#3b82f6"
        />
        <StatCard
          title={t('projects.active')}
          value={overallStats.activeProjects.toString()}
          change={0}
          icon={Target}
          color="#10b981"
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title={t('emissions.average')}
          value={formatEmissions(overallStats.averageEmissions, t)}
          change={0}
          icon={BarChart3}
          color="#f59e0b"
        />
        <StatCard
          title={t('analytics.record.count')}
          value={overallStats.totalRecords.toString()}
          change={0}
          icon={Activity}
          color="#8b5cf6"
        />
      </View>

      {/* 趨勢圖表 */}
              <ChartCard title={t('analytics.trends.recent.emissions')}>
        {chartData.labels.length > 0 ? (
          <LineChartAdapter
            data={chartData}
            width={screenWidth - 60}
            height={180}
            chartConfig={chartData.chartConfig}
            bezier
            style={styles.chartStyle}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <TrendingUp size={32} color={theme.secondaryText} />
            <Text style={[styles.noDataText, { color: theme.secondaryText }]}>
              {t('analytics.no.trend.data')}
            </Text>
          </View>
        )}
      </ChartCard>

      {/* 洞察建議 */}
      <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.insightTitle, { color: theme.text }]}>{t('analytics.insights')}</Text>
        <Text style={[styles.insightText, { color: theme.secondaryText }]}>
          {overallStats.totalEmissions > 0 
            ? `${t('analytics.insights.total.emissions.prefix')} ${formatEmissions(overallStats.totalEmissions, t)}${t('analytics.insights.optimization.suffix')}`
            : t('analytics.insights.no.data')
          }
        </Text>
      </View>
    </View>
  );

  const renderProjectAnalysis = () => (
    <View style={styles.contentContainer}>
      {/* 專案統計 */}
      <View style={[styles.projectCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('analytics.project.performance')}</Text>
        {(projects && projects.length > 0) ? (
          <View style={styles.projectList}>
            {projects.map((project) => {
              const projectSummary = calculateProjectEmissions(project.id);
              return (
                <TouchableOpacity 
                  key={project.id} 
                  style={[styles.projectItem, { borderBottomColor: theme.border }]}
                  onPress={() => router.push(`/project/${project.id}`)}
                >
                  <View style={styles.projectInfo}>
                    <Text style={[styles.projectName, { color: theme.text }]}>{project.name}</Text>
                    <Text style={[styles.projectEmissions, { color: theme.secondaryText }]}>
                      {formatEmissions(projectSummary.totalEmissions, t)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: project.status === 'active' ? '#10b981' : '#f59e0b' 
                  }]}>
                    <Text style={styles.statusText}>
                      {project.status === 'active' ? t('status.active') : t('status.planning')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Target size={32} color={theme.secondaryText} />
            <Text style={[styles.noDataText, { color: theme.secondaryText }]}>
              {t('analytics.no.project.data')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // 階段分析頁面
  const renderStageAnalysis = () => {
    return (
      <View style={styles.contentContainer}>
        {/* 階段統計卡片 */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#3b82f6' + '15' }]}>
                <Layers size={20} color="#3b82f6" />
              </View>
              <Text style={[styles.statChangeText, { color: '#3b82f6' }]}>
                {overallStageStats.percentages['pre-production'].toFixed(1)}%
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatEmissions(overallStageStats.stats['pre-production'], t)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('stage.pre-production')}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#f59e0b' + '15' }]}>
                <Activity size={20} color="#f59e0b" />
              </View>
              <Text style={[styles.statChangeText, { color: '#f59e0b' }]}>
                {overallStageStats.percentages['production'].toFixed(1)}%
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatEmissions(overallStageStats.stats['production'], t)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('stage.production')}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10b981' + '15' }]}>
                <Building size={20} color="#10b981" />
              </View>
              <Text style={[styles.statChangeText, { color: '#10b981' }]}>
                {overallStageStats.percentages['post-production'].toFixed(1)}%
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatEmissions(overallStageStats.stats['post-production'], t)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('stage.post-production')}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#8b5cf6' + '15' }]}>
                <Globe size={20} color="#8b5cf6" />
              </View>
              <Text style={[styles.statChangeText, { color: '#8b5cf6' }]}>
                100%
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatEmissions(overallStageStats.total, t)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('emissions.total')}</Text>
          </View>
        </View>

        {/* 階段分佈圖表 */}
        <ChartCard title={t('analytics.lifecycle.stage.distribution')}>
          {stageChartData.length > 0 ? (
            <PieChartAdapter
              data={stageChartData}
              width={screenWidth - 60}
              height={180}
              chartConfig={chartData.chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Layers size={32} color={theme.secondaryText} />
              <Text style={[styles.noDataText, { color: theme.secondaryText }]}>
                {t('analytics.common.no.stage.data')}
              </Text>
            </View>
          )}
        </ChartCard>

        {/* 營運分攤說明 */}
        <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>{t('analytics.operational.allocation.logic')}</Text>
          <Text style={[styles.insightText, { color: theme.secondaryText }]}>
            {t('analytics.operational.allocation.description')}
          </Text>
        </View>

        {/* 專案階段詳情 */}
        <View style={[styles.projectCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('analytics.project.stage.details')}</Text>
          {(projects && projects.length > 0) ? (
            <View style={styles.projectList}>
              {projects.map((project) => {
                const projectSummary = calculateProjectEmissions(project.id);
                const stageEmissions = projectSummary.stageEmissions;
                const operationalAllocation = projectSummary.operationalAllocation;
                
                if (!stageEmissions) return null;
                
                return (
                  <View key={project.id} style={[styles.projectStageItem, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.projectName, { color: theme.text }]}>{project.name}</Text>
                    
                    <View style={styles.stageBreakdown}>
                      <View style={styles.stageItem}>
                        <Text style={[styles.stageLabel, { color: '#3b82f6' }]}>{t('analytics.stage.labels.pre-production')}</Text>
                        <Text style={[styles.stageValue, { color: theme.text }]}>
                          {formatEmissions(stageEmissions['pre-production'], t)}
                        </Text>
                        {operationalAllocation && operationalAllocation['pre-production'] > 0 && (
                          <Text style={[styles.stageAllocation, { color: theme.secondaryText }]}>
                            {t('analytics.common.contains.operational')} {formatEmissions(operationalAllocation['pre-production'], t)}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.stageItem}>
                        <Text style={[styles.stageLabel, { color: '#f59e0b' }]}>{t('analytics.stage.labels.production')}</Text>
                        <Text style={[styles.stageValue, { color: theme.text }]}>
                          {formatEmissions(stageEmissions['production'], t)}
                        </Text>
                      </View>
                      
                      <View style={styles.stageItem}>
                        <Text style={[styles.stageLabel, { color: '#10b981' }]}>{t('analytics.stage.labels.post-production')}</Text>
                        <Text style={[styles.stageValue, { color: theme.text }]}>
                          {formatEmissions(stageEmissions['post-production'], t)}
                        </Text>
                        {operationalAllocation && operationalAllocation['post-production'] > 0 && (
                          <Text style={[styles.stageAllocation, { color: theme.secondaryText }]}>
                            {t('analytics.common.contains.operational')} {formatEmissions(operationalAllocation['post-production'], t)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Target size={32} color={theme.secondaryText} />
              <Text style={[styles.noDataText, { color: theme.secondaryText }]}>
                {t('analytics.common.no.project.data')}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // 效率指標頁面
  const renderEfficiencyAnalysis = () => {
    return (
      <View style={styles.contentContainer}>
        {/* 核心效率指標 */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#8b5cf6' + '15' }]}>
                <TrendingUp size={20} color="#8b5cf6" />
              </View>
              <Text style={[styles.statChangeText, { color: '#8b5cf6' }]}>
                {t('analytics.common.core.indicators')}
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {efficiencyStats.carbonPerBudget.toFixed(4)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>每元碳排放 (kg/NT$)</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#f59e0b' + '15' }]}>
                <Activity size={20} color="#f59e0b" />
              </View>
              <Text style={[styles.statChangeText, { color: '#f59e0b' }]}>
                {t('analytics.common.daily.efficiency')}
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatEmissions(efficiencyStats.avgDailyEmissions, t)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('analytics.common.avg.daily.emissions')}</Text>
          </View>
        </View>

        {/* 專案效率排名 */}
        <View style={[styles.projectCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('analytics.project.efficiency.ranking')}</Text>
          {efficiencyStats.projectEfficiency.length > 0 ? (
            <View style={styles.projectList}>
              {efficiencyStats.projectEfficiency
                .sort((a, b) => a.carbonPerBudget - b.carbonPerBudget)
                .map((project, index) => (
                <View key={project.projectId} style={[styles.efficiencyItem, { borderBottomColor: theme.border }]}>
                  <View style={styles.rankContainer}>
                    <View style={[styles.rankBadge, { 
                      backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : theme.border 
                    }]}>
                      <Text style={[styles.rankText, { 
                        color: index < 3 ? '#FFFFFF' : theme.text 
                      }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.projectInfo}>
                      <Text style={[styles.projectName, { color: theme.text }]}>{project.projectName}</Text>
                      <Text style={[styles.efficiencyValue, { color: theme.secondaryText }]}>
                        {project.carbonPerBudget.toFixed(4)} kg/NT$
                      </Text>
                    </View>
                  </View>
                  <View style={styles.efficiencyMetrics}>
                    <Text style={[styles.metricText, { color: theme.secondaryText }]}>
                      {formatEmissions(project.totalEmissions, t)}
                    </Text>
                    <Text style={[styles.metricText, { color: theme.secondaryText }]}>
                      NT$ {(project.budget || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Target size={32} color={theme.secondaryText} />
              <Text style={[styles.noDataText, { color: theme.secondaryText }]}>
                {t('analytics.common.no.efficiency.data')}
              </Text>
            </View>
          )}
        </View>

        {/* 效率趨勢圖 */}
        <ChartCard title={t('analytics.efficiency.trend.analysis')}>
          {efficiencyStats.monthlyTrend.length > 0 ? (
            <LineChartAdapter
              data={{
                labels: efficiencyStats.monthlyTrend.map(d => d.month),
                datasets: [{
                  data: efficiencyStats.monthlyTrend.map(d => d.efficiency)
                }]
              }}
              width={screenWidth - 60}
              height={180}
              chartConfig={chartData.chartConfig}
              bezier
              style={styles.chartStyle}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <TrendingUp size={32} color={theme.secondaryText} />
              <Text style={[styles.noDataText, { color: theme.secondaryText }]}>
                {t('analytics.common.no.trend.data')}
              </Text>
            </View>
          )}
        </ChartCard>

        {/* 效率洞察 */}
        <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>{t('analytics.efficiency.analysis.insights')}</Text>
          <Text style={[styles.insightText, { color: theme.secondaryText }]}>
            {efficiencyStats.bestProject && efficiencyStats.worstProject
              ? t('analytics.efficiency.best.project.text')
                .replace('{bestProjectName}', efficiencyStats.bestProject.projectName)
                .replace('{bestValue}', efficiencyStats.bestProject.carbonPerBudget.toFixed(4))
                .replace('{worstProjectName}', efficiencyStats.worstProject.projectName)
                .replace('{worstValue}', efficiencyStats.worstProject.carbonPerBudget.toFixed(4))
              : efficiencyStats.carbonPerBudget > 0
              ? t('analytics.efficiency.current.efficiency.text')
                .replace('{efficiency}', efficiencyStats.carbonPerBudget.toFixed(4))
                .replace('{dailyEmissions}', formatEmissions(efficiencyStats.avgDailyEmissions, t))
              : t('analytics.efficiency.start.recording')
            }
          </Text>
        </View>

        {/* 效率改善建議 */}
        <View style={[styles.projectCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('analytics.efficiency.improvement.suggestions')}</Text>
          <View style={styles.suggestionList}>
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#10b981' + '15' }]}>
                <Target size={16} color="#10b981" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: theme.text }]}>{t('analytics.efficiency.budget.optimization.title')}</Text>
                <Text style={[styles.suggestionText, { color: theme.secondaryText }]}>
                  {t('analytics.efficiency.budget.optimization.description')}
                </Text>
              </View>
            </View>
            
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                <Activity size={16} color="#3b82f6" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: theme.text }]}>{t('analytics.efficiency.process.standardization.title')}</Text>
                <Text style={[styles.suggestionText, { color: theme.secondaryText }]}>
                  {t('analytics.efficiency.process.standardization.description')}
                </Text>
              </View>
            </View>
            
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#f59e0b' + '15' }]}>
                <TrendingUp size={16} color="#f59e0b" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: theme.text }]}>{t('analytics.efficiency.continuous.monitoring.title')}</Text>
                <Text style={[styles.suggestionText, { color: theme.secondaryText }]}>
                  {t('analytics.efficiency.continuous.monitoring.description')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // 報告生成處理函數
  const handleGenerateReport = async () => {
    try {
      if (isGeneratingReport) return;
      
      if (!projects || projects.length === 0) {
        Alert.alert(t('analytics.reports.generate.no.projects'), t('analytics.reports.generate.no.projects.message'));
        return;
      }

      setIsGeneratingReport(true);
      const { organization } = useProfileStore.getState();
      
      // 根據選擇的專案過濾數據
          const filteredProjects = (selectedProjects && selectedProjects.length > 0)
      ? (projects || []).filter(p => selectedProjects.includes(p.id))
      : (projects || []);

    const filteredSummaries = (selectedProjects && selectedProjects.length > 0)
        ? Object.fromEntries(
            Object.entries(projectSummaries).filter(([projectId]) => 
              selectedProjects.includes(projectId)
            )
          )
        : projectSummaries;
      
      const filePath = await generateCarbonFootprintReport(filteredProjects, filteredSummaries, reportOptions, organization);
      
              Alert.alert(
        t('analytics.reports.generate.success'),
        t('analytics.reports.generate.success.message'),
        [
          { text: t('analytics.reports.generate.view.report'), onPress: () => console.log('查看報告:', filePath) },
          { text: t('analytics.reports.generate.share.report'), onPress: () => shareReport(filePath, organization.name) },
          { text: t('analytics.reports.generate.confirm'), style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('報告生成失敗:', error);
      Alert.alert(t('analytics.reports.generate.error'), t('analytics.reports.generate.error.message'));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const toggleReportOption = (option: keyof ReportOptions) => {
    setReportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // 渲染報告管理頁面
  const renderReportManagement = () => (
    <View style={styles.contentContainer}>
      {/* 報告統計概覽 */}
      <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          {t('analytics.reports.generation.center')}
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' }]}>
                <FileText size={16} color="white" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {projects ? projects.length : 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t('analytics.common.available.projects')}
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#2196F3' }]}>
                <BarChart3 size={16} color="white" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatEmissions(overallStats.totalEmissions, t)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t('analytics.common.total.emissions')}
            </Text>
          </View>
        </View>
      </View>

      {/* 專案選擇 */}
      <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          {t('analytics.reports.project.selection')}
        </Text>
        
        <View style={styles.projectSelectionContainer}>
          <Pressable
            style={[
              styles.selectAllButton,
              { 
                borderColor: theme.border,
                                  backgroundColor: (selectedProjects && selectedProjects.length === 0) ? theme.primary + '10' : 'transparent'
              }
            ]}
            onPress={() => setSelectedProjects([])}
          >
            <Text style={[
              styles.selectAllText,
              { 
                                  color: (selectedProjects && selectedProjects.length === 0) ? theme.primary : theme.text
              }
            ]}>
                              {(selectedProjects && selectedProjects.length === 0) ? '✓ ' : ''}{t('analytics.common.all.projects')} ({projects ? projects.length : 0})
            </Text>
          </Pressable>
          
          <View style={styles.projectList}>
            {projects.map((project) => {
              const isSelected = selectedProjects.includes(project.id);
              const summary = projectSummaries[project.id];
              
              return (
                <Pressable
                  key={project.id}
                  style={[
                    styles.projectSelectionItem,
                    { 
                      borderColor: theme.border,
                      backgroundColor: isSelected ? theme.primary + '10' : 'transparent'
                    }
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedProjects(prev => prev.filter(id => id !== project.id));
                    } else {
                      setSelectedProjects(prev => [...prev, project.id]);
                    }
                  }}
                >
                  <View style={styles.projectSelectionLeft}>
                    <View style={[
                      styles.checkbox,
                      { 
                        borderColor: theme.border,
                        backgroundColor: isSelected ? theme.primary : 'transparent'
                      }
                    ]}>
                      {isSelected && <CheckCircle size={16} color="white" />}
                    </View>
                    <View style={styles.projectInfo}>
                      <Text style={[styles.projectName, { color: theme.text }]}>
                        {project.name}
                      </Text>
                      <Text style={[styles.projectEmissions, { color: theme.secondaryText }]}>
                        {formatEmissions(summary?.totalEmissions || 0, t)} • {project.status === 'active' ? t('status.active') : project.status === 'completed' ? '已完成' : t('status.planning')}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* 報告類型選擇 */}
      <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          {t('analytics.reports.settings')}
        </Text>
        
        <View style={styles.reportFormatContainer}>
          {(['comprehensive', 'summary', 'executive'] as const).map((format) => (
            <Pressable
              key={format}
              style={[
                styles.formatOption,
                { borderColor: theme.border },
                reportOptions.format === format && { 
                  borderColor: theme.primary,
                  backgroundColor: theme.primary + '10'
                }
              ]}
              onPress={() => setReportOptions(prev => ({ ...prev, format }))}
            >
              <View style={styles.formatOptionContent}>
                <Text style={[
                  styles.formatOptionTitle,
                  { color: theme.text },
                  reportOptions.format === format && { color: theme.primary }
                ]}>
                  {t(`analytics.reports.format.${format}`)}
                </Text>
                <Text style={[styles.formatOptionDescription, { color: theme.secondaryText }]}>
                  {t(`analytics.reports.format.${format}.desc`)}
                </Text>
              </View>
              {reportOptions.format === format && (
                <CheckCircle size={20} color={theme.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* 報告內容選項 */}
      <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          {t('analytics.reports.content')}
        </Text>
        
        <View style={styles.reportOptionsContainer}>
          {[
            { key: 'includeOrganizationInfo', title: t('analytics.reports.content.organization.info'), icon: Building },
            { key: 'includeExecutiveSummary', title: t('analytics.reports.content.executive.summary'), icon: FileText },
            { key: 'includeEmissionInventory', title: t('analytics.reports.content.emission.inventory'), icon: BarChart3 },
            { key: 'includeLifecycleAnalysis', title: t('analytics.reports.content.lifecycle.analysis'), icon: Layers },
            { key: 'includeEfficiencyMetrics', title: t('analytics.reports.content.efficiency.metrics'), icon: TrendingUp },
            { key: 'includeRecommendations', title: t('analytics.reports.content.recommendations'), icon: Lightbulb },
            { key: 'includeDataSources', title: t('analytics.reports.content.data.sources'), icon: Info },
          ].map(({ key, title, icon: Icon }) => (
            <Pressable
              key={key}
              style={styles.reportOptionItem}
              onPress={() => toggleReportOption(key as keyof ReportOptions)}
            >
              <View style={styles.reportOptionLeft}>
                <Icon size={20} color={theme.secondaryText} />
                <Text style={[styles.reportOptionTitle, { color: theme.text }]}>
                  {title}
                </Text>
              </View>
              <View style={[
                styles.switch,
                { backgroundColor: reportOptions[key as keyof ReportOptions] ? theme.primary : theme.border }
              ]}>
                <View style={[
                  styles.switchThumb,
                  { backgroundColor: 'white' },
                  reportOptions[key as keyof ReportOptions] && styles.switchThumbActive
                ]} />
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 國際標準說明 */}
      <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
        <View style={styles.insightHeader}>
          <Info size={20} color={theme.primary} />
          <Text style={[styles.insightTitle, { color: theme.text }]}>
            {t('analytics.reports.international.standards.compliance')}
          </Text>
        </View>
        <Text style={[styles.insightText, { color: theme.secondaryText }]}>
          {t('analytics.reports.international.standards.description')}
        </Text>
      </View>

      {/* 生成報告按鈕 */}
      <View style={styles.generateButtonContainer}>
        <Pressable
          style={[
            styles.generateButton,
            { backgroundColor: isGeneratingReport ? theme.border : theme.primary }
          ]}
          onPress={handleGenerateReport}
          disabled={isGeneratingReport}
        >
          {isGeneratingReport ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Download size={20} color="white" />
          )}
          <Text style={styles.generateButtonText}>
            {isGeneratingReport ? t('analytics.reports.generate.generating') : 
             (selectedProjects && selectedProjects.length > 0)
              ? t('analytics.reports.generate.selected.projects').replace('{count}', selectedProjects.length.toString())
              : t('analytics.reports.generate.all.projects').replace('{count}', (projects ? projects.length : 0).toString())}
          </Text>
        </Pressable>
        
        <Text style={[styles.generateButtonDescription, { color: theme.secondaryText }]}>
          {t('analytics.reports.generate.description')}
        </Text>
      </View>
    </View>
  );

  // 佔位符內容
  const renderPlaceholder = (title: string, icon: any) => (
    <View style={styles.contentContainer}>
      <View style={[styles.placeholderCard, { backgroundColor: theme.card }]}>
        <View style={styles.placeholderContent}>
          {React.createElement(icon, { size: 48, color: theme.secondaryText })}
          <Text style={[styles.placeholderTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.placeholderSubtitle, { color: theme.secondaryText }]}>
            {t('analytics.common.development.in.progress')}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'projects':
        return renderProjectAnalysis();
      case 'stages':
        return renderStageAnalysis();
      case 'intensity':
        return renderEfficiencyAnalysis();
      case 'reports':
        return renderReportManagement();
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <PageTitle 
        title="數據分析" 
        subtitle="碳排放分析與洞察" 
      />
      
      {renderTabBar()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 32,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  
  // Tab 導航
  tabContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // 統計卡片
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statChangeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // 圖表卡片
  chartCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartStyle: {
    borderRadius: 8,
  },
  
  // 洞察卡片
  insightCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  
  // 專案卡片
  projectCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectList: {
    gap: 8,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectEmissions: {
    fontSize: 12,
    fontWeight: '400',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  
  // 佔位符
  placeholderCard: {
    borderRadius: 12,
    padding: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholderSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  
  // 無數據狀態
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // 階段分析樣式
  projectStageItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  stageBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  stageItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  stageLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  stageValue: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  stageAllocation: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
  },
  
  // 效率指標樣式
  efficiencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  efficiencyValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  efficiencyMetrics: {
    alignItems: 'flex-end',
  },
  metricText: {
    fontSize: 10,
    fontWeight: '400',
    marginBottom: 2,
  },
  
  // 建議列表樣式
  suggestionList: {
    gap: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  
  // 報告管理樣式
  reportFormatContainer: {
    gap: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  formatOptionContent: {
    flex: 1,
  },
  formatOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  formatOptionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  reportOptionsContainer: {
    gap: 8,
  },
  reportOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  reportOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  reportOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  generateButtonContainer: {
    gap: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  generateButtonDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // 專案選擇樣式
  projectSelectionContainer: {
    gap: 12,
  },
  selectAllButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  projectSelectionItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  projectSelectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 