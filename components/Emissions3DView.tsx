import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get('window');

// 3D視圖組件的接口定義
interface Emissions3DViewProps {
  data: {
    category: string;
    amount: number;
    color: string;
  }[];
  width?: number;
  height?: number;
  title?: string;
}

export default function Emissions3DView({ 
  data, 
  width = screenWidth - 32,
  height = 300,
  title
}: Emissions3DViewProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { t } = useTranslation();
  
  // 如果沒有數據，顯示空狀態
  if (!data || data.length === 0) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: theme.card, width, height }]}>
        <Text style={[styles.fallbackText, { color: theme.text }]}>
          {t('no_emission_data') || '暫無排放數據'}
        </Text>
      </View>
    );
  }
  
  // 計算最大值用於縮放
  const maxValue = Math.max(...data.map(item => item.amount));
  const chartHeight = height - 80; // 留出標題和標籤空間
  
  return (
    <View style={[styles.container, { backgroundColor: theme.card, width, height }]}>
      {title && (
        <Text style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
      )}
      
      <View style={[styles.barContainer, { height: chartHeight }]}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.amount / maxValue) * (chartHeight - 40) : 0;
          const barWidth = Math.min((width - 64) / data.length - 8, 60);
          
          return (
            <View key={index} style={[styles.barGroup, { width: barWidth }]}>
              {/* 數值標籤 */}
              <View style={styles.valueContainer}>
                <Text style={[styles.valueText, { color: theme.text }]}>
                  {item.amount.toFixed(1)}
                </Text>
              </View>
              
              {/* 柱狀圖 */}
              <View style={[styles.barWrapper, { height: chartHeight - 40 }]}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight,
                      width: barWidth - 8,
                      backgroundColor: item.color 
                    }
                  ]} 
                />
              </View>
              
              {/* 類別標籤 */}
              <Text style={[styles.categoryText, { color: theme.secondaryText }]} numberOfLines={2}>
                {item.category}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  barGroup: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  valueContainer: {
    height: 20,
    justifyContent: 'center',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  barWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 2,
  },
  categoryText: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 12,
  },
}); 