import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  Building, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  ChevronRight,
  Lightbulb,
  Droplets,
  FileText,
  Car,
  Trash2,
  Zap,
  Activity,
  ArrowUpRight,
  Clock,
  MessageSquare
} from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import { formatEmissions, formatCurrency } from '@/utils/helpers';
import { getTranslatedCategoryName, getTranslatedSourceName } from '@/utils/translations';
import { NonProjectEmissionRecord } from '@/types/project';

const screenWidth = Dimensions.get('window').width;

interface CategoryStats {
  category: string;
  totalAmount: number;
  recordCount: number;
  icon: React.ReactNode;
  color: string;
}

export default function OperationalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    nonProjectEmissionRecords, 
    projects
  } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // 獲取類別名稱
  const getCategoryName = (categoryId: string) => {
    try {
      return getTranslatedCategoryName(categoryId, t);
    } catch (error) {
      // 回退到未分類
      return t('operational.category.uncategorized');
    }
  };

  // 獲取來源名稱
  const getSourceName = (sourceId?: string) => {
    if (!sourceId) return t('operational.source.unspecified');
    try {
      return getTranslatedSourceName(sourceId, t);
    } catch (error) {
      return sourceId;
    }
  };

  // 獲取指定時間範圍的記錄
  const getRecordsForPeriod = (days: number) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return (nonProjectEmissionRecords || []).filter(record => 
      new Date(record.date) >= startDate
    );
  };

  // 獲取當前時間範圍的記錄
  const getCurrentRecords = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    return getRecordsForPeriod(days);
  };

  const currentRecords = getCurrentRecords();
  const totalEmissions = currentRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalCost = currentRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);

  // 計算趨勢
  const calculateTrend = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const currentRecords = getRecordsForPeriod(days);
    const previousRecords = (nonProjectEmissionRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      const now = new Date();
      const startDate = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return recordDate >= startDate && recordDate < endDate;
    });

    const currentTotal = currentRecords.reduce((sum, record) => sum + record.amount, 0);
    const previousTotal = previousRecords.reduce((sum, record) => sum + record.amount, 0);

    if (previousTotal === 0) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  };

  const trend = calculateTrend();
  const isDecreasing = trend <= 0;

  // 按類別統計
  const getCategoryStats = (): CategoryStats[] => {
    const categoryStatsMap = new Map<string, { amount: number; count: number }>();
    
    currentRecords.forEach(record => {
      const categoryName = getCategoryName(record.categoryId);
      const existing = categoryStatsMap.get(categoryName) || { amount: 0, count: 0 };
      categoryStatsMap.set(categoryName, {
        amount: existing.amount + record.amount,
        count: existing.count + 1
      });
    });

    const getIconAndColor = (category: string) => {
      switch (category) {
        case '辦公室用電':
          return { icon: <Lightbulb size={18} color="#FFB800" />, color: '#FFB800' };
        case '辦公室用水':
          return { icon: <Droplets size={18} color="#007AFF" />, color: '#007AFF' };
        case '辦公用紙':
          return { icon: <FileText size={18} color="#34C759" />, color: '#34C759' };
        case '員工通勤':
          return { icon: <Car size={18} color="#FF3B30" />, color: '#FF3B30' };
        case '辦公廢料':
          return { icon: <Trash2 size={18} color="#8E8E93" />, color: '#8E8E93' };
        case '辦公室暖氣':
          return { icon: <Zap size={18} color="#FF9500" />, color: '#FF9500' };
        default:
          return { icon: <Building size={18} color={theme.primary} />, color: theme.primary };
      }
    };

    return Array.from(categoryStatsMap.entries()).map(([category, data]) => {
      const { icon, color } = getIconAndColor(category);
      return {
        category,
        totalAmount: data.amount,
        recordCount: data.count,
        icon,
        color
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const categoryStats = getCategoryStats();

  // 最近的記錄
  const getRecentRecords = () => {
    return [...(nonProjectEmissionRecords || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const recentRecords = getRecentRecords();

  // 渲染頁面標題
  const renderPageHeader = () => (
    <View style={styles.pageHeader}>
      <View style={styles.headerContent}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>{t('operational.title')}</Text>
        <Text style={[styles.pageSubtitle, { color: theme.secondaryText }]}>
          {t('operational.subtitle')}
        </Text>
      </View>
      <View style={[styles.headerIconContainer, { backgroundColor: theme.primary + '20' }]}>
        <Activity size={24} color={theme.primary} />
      </View>
    </View>
  );

  // 渲染統計卡片
  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
        <View style={styles.statsHeader}>
          <Text style={[styles.statsTitle, { color: theme.text }]}>{t('operational.stats.overview')}</Text>
          <View style={[styles.periodSelector, { backgroundColor: theme.background }]}>
            {(['7d', '30d', '90d'] as const).map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  { 
                    backgroundColor: selectedPeriod === period ? theme.primary : 'transparent',
                  }
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === period ? 'white' : theme.secondaryText }
                ]}>
                  {period === '7d' ? t('operational.period.7days') : period === '30d' ? t('operational.period.30days') : t('operational.period.90days')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.primary + '15' }]}>
              <BarChart3 size={20} color={theme.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {formatEmissions(totalEmissions)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t('operational.total.emissions')}
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#34C759' + '15' }]}>
              <Building size={20} color="#34C759" />
            </View>
            <Text style={[styles.statValue, { color: '#34C759' }]}>
              {totalCost.toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t('operational.record.count')}
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <View style={[styles.statIconContainer, { 
              backgroundColor: trend === 0 ? theme.secondaryText + '15' : 
                              isDecreasing ? theme.success + '15' : theme.error + '15' 
            }]}>
              {isDecreasing ? (
                <TrendingDown size={20} color={theme.success} />
              ) : (
                <TrendingUp size={20} color={trend === 0 ? theme.secondaryText : theme.error} />
              )}
            </View>
            <Text style={[
              styles.statValue,
              { color: trend === 0 ? theme.secondaryText : isDecreasing ? theme.success : theme.error }
            ]}>
              {trend === 0 ? '0%' : `${Math.abs(trend).toFixed(1)}%`}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t('operational.trend.change')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // 渲染類別統計
  const renderCategoryStats = () => (
    <View style={[styles.categoryCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t('operational.category.stats')}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <ChevronRight size={20} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>
      
      {categoryStats.length === 0 ? (
        <View style={styles.emptyCategoryState}>
          <PieChart size={48} color={theme.secondaryText} />
          <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
            {t('operational.no.category.data')}
          </Text>
        </View>
      ) : (
        <View style={styles.categoryList}>
          {categoryStats.slice(0, 4).map((stat, index) => (
            <View key={stat.category} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIconContainer, { backgroundColor: stat.color + '20' }]}>
                  {stat.icon}
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {stat.category}
                  </Text>
                  <Text style={[styles.categoryCount, { color: theme.secondaryText }]}>
                    {stat.recordCount}{t('operational.record.count.suffix')}
                  </Text>
                </View>
              </View>
              <View style={styles.categoryRight}>
                <Text style={[styles.categoryAmount, { color: stat.color }]}>
                  {formatEmissions(stat.totalAmount)}
                </Text>
                <View style={[styles.categoryProgress, { backgroundColor: theme.background }]}>
                  <View style={[
                    styles.categoryProgressBar,
                    { 
                      width: `${(stat.totalAmount / Math.max(...categoryStats.map(s => s.totalAmount))) * 100}%`,
                      backgroundColor: stat.color 
                    }
                  ]} />
                </View>
              </View>
            </View>
          ))}
          {categoryStats.length > 4 && (
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={[styles.viewMoreText, { color: theme.primary }]}>
                {t('operational.view.all.categories').replace('{count}', categoryStats.length.toString())}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  // 渲染最近記錄
  const renderRecentRecords = () => (
    <View style={[styles.recentCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t('operational.recent.records')}</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/operational/records')}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>{t('operational.view.all')}</Text>
          <ArrowUpRight size={16} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      {recentRecords.length === 0 ? (
        <View style={styles.emptyRecordState}>
          <Clock size={48} color={theme.secondaryText} />
          <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
            {t('operational.no.records')}
          </Text>
          <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
            {t('operational.no.records.subtitle')}
          </Text>
          <TouchableOpacity 
            style={[styles.addFirstRecordButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/operational/add-record')}
          >
            <Plus size={16} color="white" />
            <Text style={styles.addFirstRecordText}>{t('operational.add.first.record')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.recordsList}>
          {recentRecords.map((record, index) => (
            <View key={record.id} style={[
              styles.recordItem,
              { borderBottomColor: theme.border }
            ]}>
              <View style={styles.recordLeft}>
                <View style={styles.recordHeader}>
                  <Text style={[styles.recordSource, { color: theme.text }]}>
                    {getSourceName(record.sourceId)}
                  </Text>
                  <View style={[styles.recordCategoryTag, { 
                    backgroundColor: getCategoryStats().find(s => s.category === getCategoryName(record.categoryId))?.color + '20' || theme.primary + '20'
                  }]}>
                    <Text style={[styles.recordCategoryText, { 
                      color: getCategoryStats().find(s => s.category === getCategoryName(record.categoryId))?.color || theme.primary
                    }]}>
                      {getCategoryName(record.categoryId)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.recordDate, { color: theme.secondaryText }]}>
                  {new Date(record.date).toLocaleDateString('zh-TW')}
                </Text>
              </View>
              <View style={styles.recordRight}>
                <Text style={[styles.recordAmount, { color: theme.primary }]}>
                  {formatEmissions(record.amount)}
                </Text>
                <Text style={[styles.recordQuantity, { color: theme.secondaryText }]}>
                  {record.quantity ? `${record.quantity} ${record.unit || ''}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // 渲染快捷操作
  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.quickActionsTitle, { color: theme.text }]}>{t('operational.quick.actions')}</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.primaryActionButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/operational/add-record')}
        >
          <View style={styles.actionButtonContent}>
            <Plus size={24} color="white" />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>{t('operational.action.add.record')}</Text>
              <Text style={styles.actionButtonSubtitle}>{t('operational.action.add.record.subtitle')}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryActionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/operational/allocation')}
        >
          <View style={styles.actionButtonContent}>
            <PieChart size={24} color={theme.primary} />
            <View style={styles.actionButtonText}>
              <Text style={[styles.actionButtonTitle, { color: theme.text }]}>{t('operational.action.allocation.settings')}</Text>
              <Text style={[styles.actionButtonSubtitle, { color: theme.secondaryText }]}>{t('operational.action.allocation.settings.subtitle')}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryActionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/operational/reports')}
        >
          <View style={styles.actionButtonContent}>
            <BarChart3 size={24} color={theme.primary} />
            <View style={styles.actionButtonText}>
              <Text style={[styles.actionButtonTitle, { color: theme.text }]}>{t('operational.action.view.reports')}</Text>
              <Text style={[styles.actionButtonSubtitle, { color: theme.secondaryText }]}>{t('operational.action.view.reports.subtitle')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />
      <Header 
        title={t('operational.title')} 
        showBackButton={true}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderPageHeader()}
        {renderStatsCard()}
        {renderCategoryStats()}
        {renderRecentRecords()}
        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  
  // 頁面標題
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 統計卡片
  statsContainer: {
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
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
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  
  // 類別統計
  categoryCard: {
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
  moreButton: {
    padding: 4,
  },
  emptyCategoryState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 8,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryProgress: {
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  viewMoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // 最近記錄
  recentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyRecordState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  addFirstRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addFirstRecordText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 8,
  },
  recordsList: {
    gap: 0,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recordLeft: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordSource: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  recordCategoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recordCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordDate: {
    fontSize: 12,
    marginTop: 2,
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  recordQuantity: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // 快捷操作
  quickActionsContainer: {
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActionsGrid: {
    gap: 12,
  },
  primaryActionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryActionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  actionButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
}); 