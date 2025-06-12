import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';

interface EmissionData {
  projectEmissions: number;
  allocatedEmissions: number;
  carbonBudget?: number;
}

interface EmissionVisualizationProps {
  data: EmissionData;
  variant: 'badges' | 'vertical-bars' | 'circles' | 'minimal' | 'dashboard';
}

const formatEmissions = (emissions: number) => {
  if (emissions >= 1000) {
    return `${(emissions / 1000).toFixed(1)} 噸CO₂e`;
  }
  return `${emissions.toFixed(1)} kg CO₂e`;
};

export default function EmissionVisualization({ data, variant }: EmissionVisualizationProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const total = data.projectEmissions + data.allocatedEmissions;

  // 方案1：極簡徽章風格（已實現）
  const BadgesVariant = () => (
    <View style={styles.badgesContainer}>
      <View style={styles.simpleBadge}>
        <Text style={[styles.badgeLabel, { color: theme.secondaryText }]}>專案直接</Text>
        <View style={[styles.badgeValue, { backgroundColor: '#10B981' }]}>
          <Text style={styles.badgeValueText}>{formatEmissions(data.projectEmissions)}</Text>
        </View>
      </View>
      
      <View style={styles.simpleBadge}>
        <Text style={[styles.badgeLabel, { color: theme.secondaryText }]}>分攤營運</Text>
        <View style={[styles.badgeValue, { backgroundColor: '#F59E0B' }]}>
          <Text style={styles.badgeValueText}>{formatEmissions(data.allocatedEmissions)}</Text>
        </View>
      </View>
      
      <View style={styles.totalBadge}>
        <Text style={[styles.totalBadgeLabel, { color: theme.text }]}>總計排放量</Text>
        <View style={[styles.totalBadgeValue, { backgroundColor: theme.primary }]}>
          <Text style={styles.totalBadgeValueText}>{formatEmissions(total)}</Text>
        </View>
      </View>
    </View>
  );

  // 方案2：垂直進度條
  const VerticalBarsVariant = () => {
    const maxValue = Math.max(data.projectEmissions, data.allocatedEmissions);
    const projectHeight = (data.projectEmissions / maxValue) * 60;
    const allocatedHeight = (data.allocatedEmissions / maxValue) * 60;
    
    return (
      <View style={styles.barsContainer}>
        <View style={styles.barGroup}>
          <View style={styles.barWrapper}>
            <View style={[styles.bar, { height: projectHeight, backgroundColor: '#10B981' }]} />
            <Text style={[styles.barLabel, { color: theme.secondaryText }]}>直接</Text>
            <Text style={[styles.barValue, { color: '#10B981' }]}>{formatEmissions(data.projectEmissions)}</Text>
          </View>
          
          <View style={styles.barWrapper}>
            <View style={[styles.bar, { height: allocatedHeight, backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.barLabel, { color: theme.secondaryText }]}>營運</Text>
            <Text style={[styles.barValue, { color: '#F59E0B' }]}>{formatEmissions(data.allocatedEmissions)}</Text>
          </View>
        </View>
        
        <View style={styles.totalSection}>
          <Text style={[styles.totalText, { color: theme.primary }]}>{formatEmissions(total)}</Text>
          <Text style={[styles.totalLabel, { color: theme.secondaryText }]}>總計</Text>
        </View>
      </View>
    );
  };

  // 方案3：圓形進度環
  const CirclesVariant = () => (
    <View style={styles.circlesContainer}>
      <View style={styles.circleGroup}>
        <View style={[styles.circle, { borderColor: '#10B981' }]}>
          <Text style={[styles.circleValue, { color: '#10B981' }]}>
            {formatEmissions(data.projectEmissions)}
          </Text>
        </View>
        <Text style={[styles.circleLabel, { color: theme.secondaryText }]}>專案直接</Text>
      </View>
      
      <View style={styles.circleGroup}>
        <View style={[styles.circle, { borderColor: '#F59E0B' }]}>
          <Text style={[styles.circleValue, { color: '#F59E0B' }]}>
            {formatEmissions(data.allocatedEmissions)}
          </Text>
        </View>
        <Text style={[styles.circleLabel, { color: theme.secondaryText }]}>分攤營運</Text>
      </View>
      
      <View style={[styles.totalCircle, { borderColor: theme.primary }]}>
        <Text style={[styles.totalCircleValue, { color: theme.primary }]}>
          {formatEmissions(total)}
        </Text>
        <Text style={[styles.totalCircleLabel, { color: theme.secondaryText }]}>總計</Text>
      </View>
    </View>
  );

  // 方案4：極簡數字
  const MinimalVariant = () => (
    <View style={styles.minimalContainer}>
      <View style={styles.minimalRow}>
        <Text style={[styles.minimalLabel, { color: theme.secondaryText }]}>直接</Text>
        <Text style={[styles.minimalValue, { color: '#10B981' }]}>{formatEmissions(data.projectEmissions)}</Text>
      </View>
      <View style={styles.minimalRow}>
        <Text style={[styles.minimalLabel, { color: theme.secondaryText }]}>營運</Text>
        <Text style={[styles.minimalValue, { color: '#F59E0B' }]}>{formatEmissions(data.allocatedEmissions)}</Text>
      </View>
      <View style={[styles.minimalRow, styles.minimalTotal]}>
        <Text style={[styles.minimalLabel, { color: theme.text, fontWeight: 'bold' }]}>總計</Text>
        <Text style={[styles.minimalValue, { color: theme.primary, fontWeight: 'bold' }]}>{formatEmissions(total)}</Text>
      </View>
    </View>
  );

  // 方案5：儀表板風格
  const DashboardVariant = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#10B981' + '20' }]}>
          <Text style={[styles.statIconText, { color: '#10B981' }]}>●</Text>
        </View>
        <Text style={[styles.statValue, { color: '#10B981' }]}>{formatEmissions(data.projectEmissions)}</Text>
        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>直接</Text>
      </View>
      
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#F59E0B' + '20' }]}>
          <Text style={[styles.statIconText, { color: '#F59E0B' }]}>●</Text>
        </View>
        <Text style={[styles.statValue, { color: '#F59E0B' }]}>{formatEmissions(data.allocatedEmissions)}</Text>
        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>營運</Text>
      </View>
      
      <View style={[styles.statCard, styles.totalStatCard, { borderColor: theme.primary + '30' }]}>
        <Text style={[styles.totalStatValue, { color: theme.primary }]}>{formatEmissions(total)}</Text>
        <Text style={[styles.totalStatLabel, { color: theme.text }]}>總計排放</Text>
      </View>
    </View>
  );

  const variants = {
    badges: BadgesVariant,
    'vertical-bars': VerticalBarsVariant,
    circles: CirclesVariant,
    minimal: MinimalVariant,
    dashboard: DashboardVariant,
  };

  const SelectedVariant = variants[variant];
  
  return <SelectedVariant />;
}

const styles = StyleSheet.create({
  // 方案1：徽章風格
  badgesContainer: {
    width: 140,
    alignItems: 'center',
    paddingVertical: 8,
  },
  simpleBadge: {
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeLabel: {
    fontSize: 9,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeValue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
  },
  badgeValueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  totalBadge: {
    alignItems: 'center',
    marginTop: 6,
  },
  totalBadgeLabel: {
    fontSize: 9,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  totalBadgeValue: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 90,
  },
  totalBadgeValueText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  // 方案2：垂直進度條
  barsContainer: {
    width: 140,
    alignItems: 'center',
    paddingVertical: 8,
  },
  barGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 12,
  },
  barWrapper: {
    alignItems: 'center',
    width: 40,
  },
  bar: {
    width: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  totalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 8,
  },

  // 方案3：圓形進度環
  circlesContainer: {
    width: 140,
    alignItems: 'center',
    paddingVertical: 8,
  },
  circleGroup: {
    alignItems: 'center',
    marginBottom: 8,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  circleValue: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  circleLabel: {
    fontSize: 8,
  },
  totalCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCircleValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalCircleLabel: {
    fontSize: 7,
  },

  // 方案4：極簡數字
  minimalContainer: {
    width: 140,
    paddingVertical: 8,
  },
  minimalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  minimalLabel: {
    fontSize: 10,
  },
  minimalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  minimalTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 6,
    marginTop: 4,
  },

  // 方案5：儀表板風格
  dashboardContainer: {
    width: 140,
    paddingVertical: 8,
  },
  statCard: {
    alignItems: 'center',
    marginBottom: 8,
    padding: 6,
  },
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIconText: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
  },
  totalStatCard: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  totalStatValue: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  totalStatLabel: {
    fontSize: 8,
    fontWeight: '500',
  },
}); 