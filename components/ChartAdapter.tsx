import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import Colors from '@/constants/colors';

// 只在動態導入圖表庫（不是在頂層導入）
let LineChart: any = null;
let PieChart: any = null;

// 類型定義
interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
    }[];
    legend?: string[];
  };
  width: number;
  height: number;
  chartConfig: any;
  bezier?: boolean;
  style?: any;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  yAxisSuffix?: string;
  yAxisInterval?: number;
  paddingRight?: number;
}

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }[];
  width: number;
  height: number;
  chartConfig: any;
  accessor: string;
  backgroundColor: string;
  paddingLeft: string;
  center?: number[];
  absolute?: boolean;
}

// Web平台簡易折線圖組件 (用更簡單的方法避免樣式問題)
const SimpleLineChart = ({ data, width, height, chartConfig, style, yAxisSuffix }: LineChartProps) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { t } = useTranslation();
  
  if (!data || !data.labels || !data.datasets || data.labels.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { height, width }, style]}>
        <Text style={{ color: theme.secondaryText }}>{t('ui.chart.cannot.display')}</Text>
      </View>
    );
  }

  const { labels, datasets } = data;
  const chartData = datasets[0].data;
  const maxValue = Math.max(...chartData);

  return (
    <View style={[{ width, height, borderRadius: (style?.borderRadius || 16) }, style, styles.webChartContainer]}>
      <View style={styles.chartLegend}>
        {data.legend && data.legend.map((legendItem, index) => (
          <View key={index} style={styles.legendItem}>
            <View 
              style={[
                styles.legendColor, 
                { backgroundColor: chartConfig.color ? chartConfig.color(1) : theme.primary }
              ]} 
            />
            <Text style={{ color: chartConfig.labelColor ? chartConfig.labelColor(1) : theme.text }}>
              {legendItem}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.chartContent}>
        {/* Y軸標籤 */}
        <View style={styles.yAxisContainer}>
          <Text style={{ color: theme.secondaryText, fontSize: 10 }}>
            {Math.round(maxValue)}{yAxisSuffix || ''}
          </Text>
          <Text style={{ color: theme.secondaryText, fontSize: 10 }}>
            {Math.round(maxValue/2)}{yAxisSuffix || ''}
          </Text>
          <Text style={{ color: theme.secondaryText, fontSize: 10 }}>
            0{yAxisSuffix || ''}
          </Text>
        </View>
        
        {/* 簡易圖表 */}
        <View style={styles.barContainer}>
          {chartData.map((value, index) => (
            <View key={index} style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: (value / maxValue) * (height - 50),
                    backgroundColor: chartConfig.color ? chartConfig.color(1) : theme.primary
                  }
                ]} 
              />
              <Text style={{ color: theme.secondaryText, fontSize: 9 }}>
                {labels[index]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Web平台簡易餅圖組件
const SimplePieChart = ({ data, width, height, chartConfig, accessor, backgroundColor, style = {} }: PieChartProps & { style?: any }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { t } = useTranslation();
  
  if (!data || data.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { height, width }, style]}>
        <Text style={{ color: theme.secondaryText }}>{t('ui.chart.cannot.display')}</Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={[{ width, height }, style, { backgroundColor: backgroundColor || 'transparent' }]}>
      {/* 使用圖例代替實際餅圖 */}
      <View style={styles.simplePieContainer}>
        {data.map((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          
          return (
            <View key={index} style={styles.pieItemContainer}>
              <View style={[styles.pieColorBlock, { backgroundColor: item.color }]} />
              <View style={styles.pieItemContent}>
                <Text style={{ color: item.legendFontColor, fontSize: item.legendFontSize }}>
                  {item.name}
                </Text>
                <View style={styles.pieItemValue}>
                  <Text style={{ color: item.legendFontColor, fontSize: item.legendFontSize, fontWeight: 'bold' }}>
                    {percentage}%
                  </Text>
                  <View 
                    style={[
                      styles.piePercentageBar, 
                      { 
                        backgroundColor: item.color,
                        width: percentage * 0.7
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// 線圖適配器組件
export const LineChartAdapter = (props: LineChartProps) => {
  const { t } = useTranslation();
  
  // 懶加載圖表庫，僅在第一次渲染時進行
  React.useEffect(() => {
    if (Platform.OS !== 'web' && !LineChart) {
      try {
        const { LineChart: ImportedLineChart } = require('react-native-chart-kit');
        LineChart = ImportedLineChart;
      } catch (error) {
        console.warn('Failed to load LineChart component', error);
      }
    }
  }, []);
  
  // 在網頁上渲染簡化版圖表，在原生平台使用原始庫
  if (Platform.OS === 'web') {
    return <SimpleLineChart {...props} />;
  }
  
  // 如果在原生平台，並已經成功導入組件，則使用
  if (LineChart) {
    return <LineChart {...props} />;
  }
  
  // 圖表庫尚未加載或加載失敗時顯示佔位符
  return (
    <View style={[styles.placeholderContainer, { height: props.height, width: props.width }, props.style]}>
      <Text style={{ color: '#888' }}>{t('ui.chart.cannot.display')}</Text>
    </View>
  );
};

// 餅圖適配器組件
export const PieChartAdapter = (props: PieChartProps & { style?: any }) => {
  const { t } = useTranslation();
  
  // 懶加載圖表庫，僅在第一次渲染時進行
  React.useEffect(() => {
    if (Platform.OS !== 'web' && !PieChart) {
      try {
        const { PieChart: ImportedPieChart } = require('react-native-chart-kit');
        PieChart = ImportedPieChart;
      } catch (error) {
        console.warn('Failed to load PieChart component', error);
      }
    }
  }, []);
  
  // 在網頁上渲染簡化版圖表，在原生平台使用原始庫
  if (Platform.OS === 'web') {
    return <SimplePieChart {...props} />;
  }
  
  // 如果在原生平台，並已經成功導入組件，則使用
  if (PieChart) {
    return <PieChart {...props} />;
  }
  
  // 圖表庫尚未加載或加載失敗時顯示佔位符
  return (
    <View style={[styles.placeholderContainer, { height: props.height, width: props.width }, props.style]}>
      <Text style={{ color: '#888' }}>{t('ui.chart.cannot.display')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 16,
  },
  webChartContainer: {
    backgroundColor: 'transparent',
    padding: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  chartContent: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: 20,
  },
  yAxisContainer: {
    width: 40,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 2,
  },
  bar: {
    width: '80%',
    marginBottom: 5,
    minHeight: 2,
  },
  simplePieContainer: {
    padding: 10,
  },
  pieItemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  pieColorBlock: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10,
  },
  pieItemContent: {
    flex: 1,
  },
  pieItemValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  piePercentageBar: {
    height: 4,
    marginLeft: 6,
    borderRadius: 2,
  }
}); 