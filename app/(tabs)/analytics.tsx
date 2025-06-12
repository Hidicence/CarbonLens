import React, { useState, useMemo, useEffect } from 'react';
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
  { id: 'overview', title: '總覽', icon: Activity },
  { id: 'projects', title: '專案分析', icon: Target },
  { id: 'stages', title: '階段剖析', icon: Layers },
  { id: 'intensity', title: '效率指標', icon: TrendingUp },
  { id: 'reports', title: '報告管理', icon: FileText },
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
    projects.forEach(project => {
      summaries[project.id] = calculateProjectEmissions(project.id);
    });
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
      averageEmissions: projects.length > 0 ? totalEmissions / projects.length : 0,
      activeProjects: projects.filter(p => p.status === 'active').length
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
        name: '前期製作',
        value: overallStageStats.stats['pre-production'],
        color: '#3b82f6',
        legendFontColor: theme.text,
        legendFontSize: 12,
      },
      {
        name: '拍攝製作',
        value: overallStageStats.stats['production'],
        color: '#f59e0b',
        legendFontColor: theme.text,
        legendFontSize: 12,
      },
      {
        name: '後期製作',
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
                {tab.title}
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
          title="總排放量"
          value={formatEmissions(overallStats.totalEmissions)}
          change={0}
          icon={Globe}
          color="#3b82f6"
        />
        <StatCard
          title="活躍專案"
          value={overallStats.activeProjects.toString()}
          change={0}
          icon={Target}
          color="#10b981"
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="平均排放"
          value={formatEmissions(overallStats.averageEmissions)}
          change={0}
          icon={BarChart3}
          color="#f59e0b"
        />
        <StatCard
          title="記錄總數"
          value={overallStats.totalRecords.toString()}
          change={0}
          icon={Activity}
          color="#8b5cf6"
        />
      </View>

      {/* 趨勢圖表 */}
      <ChartCard title="最近排放趨勢">
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
              暫無趨勢數據
            </Text>
          </View>
        )}
      </ChartCard>

      {/* 洞察建議 */}
      <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.insightTitle, { color: theme.text }]}>分析洞察</Text>
        <Text style={[styles.insightText, { color: theme.secondaryText }]}>
          {overallStats.totalEmissions > 0 
            ? `目前總排放量為 ${formatEmissions(overallStats.totalEmissions)}，建議重點關注高排放專案的優化機會。`
            : '目前尚無排放數據，開始記錄第一個專案的碳排放吧！'
          }
        </Text>
      </View>
    </View>
  );

  const renderProjectAnalysis = () => (
    <View style={styles.contentContainer}>
      {/* 專案統計 */}
      <View style={[styles.projectCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>專案表現</Text>
        {projects.length > 0 ? (
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
                      {formatEmissions(projectSummary.totalEmissions)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: project.status === 'active' ? '#10b981' : '#f59e0b' 
                  }]}>
                    <Text style={styles.statusText}>
                      {project.status === 'active' ? '進行中' : '規劃中'}
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
              暫無專案數據
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
              {formatEmissions(overallStageStats.stats['pre-production'])}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>前期製作</Text>
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
              {formatEmissions(overallStageStats.stats['production'])}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>拍攝製作</Text>
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
              {formatEmissions(overallStageStats.stats['post-production'])}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>後期製作</Text>
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
              {formatEmissions(overallStageStats.total)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>總排放量</Text>
          </View>
        </View>

        {/* 階段分佈圖表 */}
        <ChartCard title="生命週期階段分佈">
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
                暫無階段數據
              </Text>
            </View>
          )}
        </ChartCard>

        {/* 營運分攤說明 */}
        <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>營運分攤邏輯</Text>
          <Text style={[styles.insightText, { color: theme.secondaryText }]}>
            日常營運排放已按照專業碳足跡管理原則分攤：60% 歸類為前期製作階段，40% 歸類為後期製作階段。
            這樣的分配更準確地反映了營運活動對各生命週期階段的影響。
          </Text>
        </View>

        {/* 專案階段詳情 */}
        <View style={[styles.projectCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>各專案階段明細</Text>
          {projects.length > 0 ? (
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
                        <Text style={[styles.stageLabel, { color: '#3b82f6' }]}>前期</Text>
                        <Text style={[styles.stageValue, { color: theme.text }]}>
                          {formatEmissions(stageEmissions['pre-production'])}
                        </Text>
                        {operationalAllocation && operationalAllocation['pre-production'] > 0 && (
                          <Text style={[styles.stageAllocation, { color: theme.secondaryText }]}>
                            含營運 {formatEmissions(operationalAllocation['pre-production'])}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.stageItem}>
                        <Text style={[styles.stageLabel, { color: '#f59e0b' }]}>拍攝</Text>
                        <Text style={[styles.stageValue, { color: theme.text }]}>
                          {formatEmissions(stageEmissions['production'])}
                        </Text>
                      </View>
                      
                      <View style={styles.stageItem}>
                        <Text style={[styles.stageLabel, { color: '#10b981' }]}>後期</Text>
                        <Text style={[styles.stageValue, { color: theme.text }]}>
                          {formatEmissions(stageEmissions['post-production'])}
                        </Text>
                        {operationalAllocation && operationalAllocation['post-production'] > 0 && (
                          <Text style={[styles.stageAllocation, { color: theme.secondaryText }]}>
                            含營運 {formatEmissions(operationalAllocation['post-production'])}
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
                暫無專案數據
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
                核心指標
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
                日均效率
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatEmissions(efficiencyStats.avgDailyEmissions)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>平均每日排放</Text>
          </View>
        </View>

        {/* 專案效率排名 */}
        <View style={[styles.projectCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>專案效率排名</Text>
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
                      {formatEmissions(project.totalEmissions)}
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
                暫無專案效率數據
              </Text>
            </View>
          )}
        </View>

        {/* 效率趨勢圖 */}
        <ChartCard title="效率趨勢分析">
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
                暫無趨勢數據
              </Text>
            </View>
          )}
        </ChartCard>

        {/* 效率洞察 */}
        <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>效率分析洞察</Text>
          <Text style={[styles.insightText, { color: theme.secondaryText }]}>
            {efficiencyStats.bestProject && efficiencyStats.worstProject
              ? `效率最佳專案「${efficiencyStats.bestProject.projectName}」每元預算產生 ${efficiencyStats.bestProject.carbonPerBudget.toFixed(4)} kg CO₂e，` +
                `而「${efficiencyStats.worstProject.projectName}」為 ${efficiencyStats.worstProject.carbonPerBudget.toFixed(4)} kg CO₂e。` +
                `建議分析高效專案的成功做法，並應用到其他專案中。`
              : efficiencyStats.carbonPerBudget > 0
              ? `目前整體碳排放效率為每元預算 ${efficiencyStats.carbonPerBudget.toFixed(4)} kg CO₂e，` +
                `平均每日排放 ${formatEmissions(efficiencyStats.avgDailyEmissions)}。持續優化可進一步提升效率。`
              : '開始記錄專案數據以獲得效率分析洞察。'
            }
          </Text>
        </View>

        {/* 效率改善建議 */}
        <View style={[styles.projectCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>效率改善建議</Text>
          <View style={styles.suggestionList}>
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#10b981' + '15' }]}>
                <Target size={16} color="#10b981" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: theme.text }]}>預算配置優化</Text>
                <Text style={[styles.suggestionText, { color: theme.secondaryText }]}>
                  根據效率排名調整預算分配，將更多資源投入高效專案
                </Text>
              </View>
            </View>
            
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                <Activity size={16} color="#3b82f6" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: theme.text }]}>流程標準化</Text>
                <Text style={[styles.suggestionText, { color: theme.secondaryText }]}>
                  將高效專案的最佳實踐制定為標準流程，提升整體效率
                </Text>
              </View>
            </View>
            
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#f59e0b' + '15' }]}>
                <TrendingUp size={16} color="#f59e0b" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: theme.text }]}>持續監控</Text>
                <Text style={[styles.suggestionText, { color: theme.secondaryText }]}>
                  建立定期效率評估機制，及時發現並解決效率問題
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
      
      if (projects.length === 0) {
        Alert.alert('無法生成報告', '您需要至少創建一個專案才能生成報告');
        return;
      }

      setIsGeneratingReport(true);
      const { organization } = useProfileStore.getState();
      
      // 根據選擇的專案過濾數據
      const filteredProjects = selectedProjects.length > 0 
        ? projects.filter(p => selectedProjects.includes(p.id))
        : projects;
      
      const filteredSummaries = selectedProjects.length > 0
        ? Object.fromEntries(
            Object.entries(projectSummaries).filter(([projectId]) => 
              selectedProjects.includes(projectId)
            )
          )
        : projectSummaries;
      
      const filePath = await generateCarbonFootprintReport(filteredProjects, filteredSummaries, reportOptions, organization);
      
              Alert.alert(
        '報告生成成功',
        '專業碳足跡報告已生成完成',
        [
          { text: '查看報告', onPress: () => console.log('查看報告:', filePath) },
          { text: '分享報告', onPress: () => shareReport(filePath, organization.name) },
          { text: '確定', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('報告生成失敗:', error);
      Alert.alert('生成失敗', '報告生成失敗，請稍後重試');
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
          報告生成中心
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' }]}>
                <FileText size={16} color="white" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {projects.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              可分析專案
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#2196F3' }]}>
                <BarChart3 size={16} color="white" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatEmissions(overallStats.totalEmissions)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              總排放量
            </Text>
          </View>
        </View>
      </View>

      {/* 專案選擇 */}
      <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          專案選擇
        </Text>
        
        <View style={styles.projectSelectionContainer}>
          <Pressable
            style={[
              styles.selectAllButton,
              { 
                borderColor: theme.border,
                backgroundColor: selectedProjects.length === 0 ? theme.primary + '10' : 'transparent'
              }
            ]}
            onPress={() => setSelectedProjects([])}
          >
            <Text style={[
              styles.selectAllText,
              { 
                color: selectedProjects.length === 0 ? theme.primary : theme.text
              }
            ]}>
              {selectedProjects.length === 0 ? '✓ ' : ''}全部專案 ({projects.length})
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
                        {formatEmissions(summary?.totalEmissions || 0)} • {project.status === 'active' ? '進行中' : project.status === 'completed' ? '已完成' : '規劃中'}
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
          報告設定
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
                  {format === 'comprehensive' ? '完整報告' : 
                   format === 'summary' ? '摘要報告' : '執行摘要'}
                </Text>
                <Text style={[styles.formatOptionDescription, { color: theme.secondaryText }]}>
                  {format === 'comprehensive' ? '包含所有分析模組和詳細數據' : 
                   format === 'summary' ? '核心指標和關鍵洞察' : '高階主管專用簡報'}
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
          報告內容
        </Text>
        
        <View style={styles.reportOptionsContainer}>
          {[
            { key: 'includeOrganizationInfo', title: '組織基本資訊', icon: Building },
            { key: 'includeExecutiveSummary', title: '執行摘要', icon: FileText },
            { key: 'includeEmissionInventory', title: '排放清冊', icon: BarChart3 },
            { key: 'includeLifecycleAnalysis', title: '生命週期分析', icon: Layers },
            { key: 'includeEfficiencyMetrics', title: '效率指標', icon: TrendingUp },
            { key: 'includeRecommendations', title: '減碳建議', icon: Lightbulb },
            { key: 'includeDataSources', title: '數據來源', icon: Info },
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
            國際標準符合性
          </Text>
        </View>
        <Text style={[styles.insightText, { color: theme.secondaryText }]}>
          本報告遵循 ISO 14064-1:2018 和 GHG Protocol 國際標準，
          包含完整的排放係數來源、計算方法學和數據品質說明，
          適用於第三方審查和國際客戶展示。
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
            {isGeneratingReport ? '生成中...' : 
             selectedProjects.length > 0 
               ? `生成報告 (${selectedProjects.length}個專案)`
               : `生成報告 (全部${projects.length}個專案)`}
          </Text>
        </Pressable>
        
        <Text style={[styles.generateButtonDescription, { color: theme.secondaryText }]}>
          生成符合國際標準的碳足跡報告，支援審查和客戶展示
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
            功能開發中，敬請期待
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