import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';

interface ProjectCardLayoutProps {
  project: any;
  allocatedEmissions: number;
  layout: 'right-sidebar' | 'bottom-horizontal' | 'vertical-stack' | 'inline-footer';
}

const formatEmissions = (emissions: number) => {
  if (emissions >= 1000) {
    return `${(emissions / 1000).toFixed(1)} 噸CO₂e`;
  }
  return `${emissions.toFixed(1)} kg CO₂e`;
};

export default function ProjectCardLayout({ project, allocatedEmissions, layout }: ProjectCardLayoutProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // 方案A：右側邊欄（當前，優化後）
  const RightSidebarLayout = () => (
    <View style={styles.rightSidebarContainer}>
      <View style={styles.leftContentWide}>
        {/* 左側內容 */}
        <Text style={[styles.title, { color: theme.text }]}>專案標題示例</Text>
        <Text style={[styles.description, { color: theme.secondaryText }]}>專案描述內容...</Text>
        <Text style={[styles.details, { color: theme.secondaryText }]}>2024/01/15 - 台北</Text>
      </View>
      
      <View style={styles.rightPanelWide}>
        {/* 右側統計，更寬 */}
        <View style={styles.statItemWide}>
          <Text style={[styles.statLabelWide, { color: theme.secondaryText }]}>專案直接</Text>
          <Text style={[styles.statValueWide, { color: '#10B981' }]}>104.7 kg CO₂e</Text>
        </View>
        <View style={styles.statItemWide}>
          <Text style={[styles.statLabelWide, { color: theme.secondaryText }]}>分攤營運</Text>
          <Text style={[styles.statValueWide, { color: '#F59E0B' }]}>517.9 kg CO₂e</Text>
        </View>
        <View style={[styles.statItemWide, styles.totalStatWide]}>
          <Text style={[styles.statLabelWide, { color: theme.text, fontWeight: 'bold' }]}>總計排放</Text>
          <Text style={[styles.statValueWide, { color: theme.primary, fontWeight: 'bold' }]}>622.5 kg CO₂e</Text>
        </View>
      </View>
    </View>
  );

  // 方案B：底部橫排
  const BottomHorizontalLayout = () => (
    <View style={styles.verticalContainer}>
      <View style={styles.topContent}>
        <Text style={[styles.title, { color: theme.text }]}>專案標題示例</Text>
        <Text style={[styles.description, { color: theme.secondaryText }]}>專案描述內容...</Text>
        <Text style={[styles.details, { color: theme.secondaryText }]}>2024/01/15 - 台北</Text>
      </View>
      
      <View style={[styles.bottomStatsRow, { borderTopColor: theme.border }]}>
        <View style={styles.statColumn}>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>專案直接</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>104.7 kg CO₂e</Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>分攤營運</Text>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>517.9 kg CO₂e</Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={[styles.statLabel, { color: theme.text, fontWeight: 'bold' }]}>總計排放</Text>
          <Text style={[styles.statValue, { color: theme.primary, fontWeight: 'bold' }]}>622.5 kg CO₂e</Text>
        </View>
      </View>
    </View>
  );

  // 方案C：垂直層疊
  const VerticalStackLayout = () => (
    <View style={styles.stackContainer}>
      <View style={styles.mainContent}>
        <Text style={[styles.title, { color: theme.text }]}>專案標題示例</Text>
        <Text style={[styles.description, { color: theme.secondaryText }]}>專案描述內容...</Text>
        <Text style={[styles.details, { color: theme.secondaryText }]}>2024/01/15 - 台北</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#10B981' + '15' }]}>
          <Text style={[styles.cardLabel, { color: theme.secondaryText }]}>專案直接</Text>
          <Text style={[styles.cardValue, { color: '#10B981' }]}>104.7 kg CO₂e</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F59E0B' + '15' }]}>
          <Text style={[styles.cardLabel, { color: theme.secondaryText }]}>分攤營運</Text>
          <Text style={[styles.cardValue, { color: '#F59E0B' }]}>517.9 kg CO₂e</Text>
        </View>
        <View style={[styles.statCard, styles.totalCard, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
          <Text style={[styles.cardLabel, { color: theme.text, fontWeight: 'bold' }]}>總計排放</Text>
          <Text style={[styles.cardValue, { color: theme.primary, fontWeight: 'bold' }]}>622.5 kg CO₂e</Text>
        </View>
      </View>
    </View>
  );

  // 方案D：內聯頁腳
  const InlineFooterLayout = () => (
    <View style={styles.inlineContainer}>
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: theme.text }]}>專案標題示例</Text>
        <Text style={[styles.description, { color: theme.secondaryText }]}>專案描述內容...</Text>
        <Text style={[styles.details, { color: theme.secondaryText }]}>2024/01/15 - 台北</Text>
      </View>
      
      <View style={styles.inlineStats}>
        <Text style={[styles.inlineText, { color: theme.secondaryText }]}>
          直接: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>104.7 kg CO₂e</Text>
          {' • '}
          營運: <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>517.9 kg CO₂e</Text>
          {' • '}
          總計: <Text style={{ color: theme.primary, fontWeight: 'bold' }}>622.5 kg CO₂e</Text>
        </Text>
      </View>
    </View>
  );

  const layouts = {
    'right-sidebar': RightSidebarLayout,
    'bottom-horizontal': BottomHorizontalLayout,
    'vertical-stack': VerticalStackLayout,
    'inline-footer': InlineFooterLayout,
  };

  const SelectedLayout = layouts[layout];
  
  return <SelectedLayout />;
}

const styles = StyleSheet.create({
  // 方案A：右側邊欄（優化版）
  rightSidebarContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  leftContentWide: {
    flex: 1,
    marginRight: 12,
  },
  rightPanelWide: {
    width: 160,
    justifyContent: 'center',
  },
  statItemWide: {
    marginBottom: 8,
    alignItems: 'center',
  },
  statLabelWide: {
    fontSize: 10,
    marginBottom: 2,
    textAlign: 'center',
  },
  statValueWide: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalStatWide: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  // 方案B：底部橫排
  verticalContainer: {
    padding: 16,
  },
  topContent: {
    marginBottom: 16,
  },
  bottomStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 方案C：垂直層疊
  stackContainer: {
    padding: 16,
  },
  mainContent: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalCard: {
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 方案D：內聯頁腳
  inlineContainer: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 12,
  },
  inlineStats: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inlineText: {
    fontSize: 10,
    lineHeight: 16,
  },

  // 共用樣式
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  details: {
    fontSize: 12,
  },
}); 