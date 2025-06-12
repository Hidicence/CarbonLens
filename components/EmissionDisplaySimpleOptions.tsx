import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';

interface EmissionSimpleDisplayProps {
  projectEmissions: number;
  allocatedEmissions: number;
  variant: 'minimal-text' | 'symbol-dots' | 'inline-compact' | 'numbers-only';
}

const formatEmissions = (emissions: number) => {
  if (emissions >= 1000) {
    return `${(emissions / 1000).toFixed(1)} 噸CO₂e`;
  }
  return `${emissions.toFixed(1)} kg CO₂e`;
};

const formatEmissionsShort = (emissions: number) => {
  if (emissions >= 1000) {
    return `${(emissions / 1000).toFixed(1)}噸`;
  }
  return `${emissions.toFixed(0)}kg`;
};

export default function EmissionSimpleDisplay({ projectEmissions, allocatedEmissions, variant }: EmissionSimpleDisplayProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const total = projectEmissions + allocatedEmissions;

  // 方案1：極簡文字版（已實現）
  const MinimalTextVariant = () => (
    <View style={[styles.bottomRow, { borderTopColor: theme.border }]}>
      <View style={styles.column}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>直接</Text>
        <Text style={[styles.value, { color: '#10B981' }]}>{formatEmissions(projectEmissions)}</Text>
      </View>
      <View style={styles.column}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>營運</Text>
        <Text style={[styles.value, { color: '#F59E0B' }]}>{formatEmissions(allocatedEmissions)}</Text>
      </View>
      <View style={styles.column}>
        <Text style={[styles.label, { color: theme.text, fontWeight: 'bold' }]}>總計</Text>
        <Text style={[styles.value, styles.totalValue, { color: theme.primary }]}>{formatEmissions(total)}</Text>
      </View>
    </View>
  );

  // 方案2：彩色圓點符號版
  const SymbolDotsVariant = () => (
    <View style={[styles.bottomRow, { borderTopColor: theme.border }]}>
      <View style={styles.column}>
        <Text style={[styles.dotSymbol, { color: '#10B981' }]}>●</Text>
        <Text style={[styles.valueCompact, { color: '#10B981' }]}>{formatEmissions(projectEmissions)}</Text>
      </View>
      <View style={styles.column}>
        <Text style={[styles.dotSymbol, { color: '#F59E0B' }]}>●</Text>
        <Text style={[styles.valueCompact, { color: '#F59E0B' }]}>{formatEmissions(allocatedEmissions)}</Text>
      </View>
      <View style={styles.column}>
        <Text style={[styles.dotSymbol, { color: theme.primary }]}>∑</Text>
        <Text style={[styles.valueCompact, styles.totalValueCompact, { color: theme.primary }]}>{formatEmissions(total)}</Text>
      </View>
    </View>
  );

  // 方案3：內聯緊湊版
  const InlineCompactVariant = () => (
    <View style={[styles.inlineRow, { borderTopColor: theme.border }]}>
      <Text style={[styles.inlineText, { color: theme.secondaryText }]}>
        <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{formatEmissionsShort(projectEmissions)}</Text>
        <Text style={{ color: theme.secondaryText }}> • </Text>
        <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>{formatEmissionsShort(allocatedEmissions)}</Text>
        <Text style={{ color: theme.secondaryText }}> • 總計 </Text>
        <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{formatEmissionsShort(total)}</Text>
      </Text>
    </View>
  );

  // 方案4：純數字版
  const NumbersOnlyVariant = () => (
    <View style={[styles.numbersRow, { borderTopColor: theme.border }]}>
      <View style={styles.numberColumn}>
        <Text style={[styles.numberValue, { color: '#10B981' }]}>{formatEmissionsShort(projectEmissions)}</Text>
      </View>
      <View style={styles.numberColumn}>
        <Text style={[styles.numberValue, { color: '#F59E0B' }]}>{formatEmissionsShort(allocatedEmissions)}</Text>
      </View>
      <View style={styles.numberColumn}>
        <Text style={[styles.numberValue, styles.totalNumber, { color: theme.primary }]}>{formatEmissionsShort(total)}</Text>
      </View>
    </View>
  );

  const variants = {
    'minimal-text': MinimalTextVariant,
    'symbol-dots': SymbolDotsVariant,
    'inline-compact': InlineCompactVariant,
    'numbers-only': NumbersOnlyVariant,
  };

  const SelectedVariant = variants[variant];
  
  return <SelectedVariant />;
}

const styles = StyleSheet.create({
  // 共用底部橫排
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },

  // 方案1：極簡文字
  label: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // 方案2：彩色圓點
  dotSymbol: {
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'center',
  },
  valueCompact: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalValueCompact: {
    fontSize: 11,
    fontWeight: '700',
  },

  // 方案3：內聯緊湊
  inlineRow: {
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  inlineText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
  },

  // 方案4：純數字
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
  },
  numberColumn: {
    alignItems: 'center',
    flex: 1,
  },
  numberValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
}); 