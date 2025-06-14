import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BarChart3, Calendar, FileText, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProjectStore } from '@/store/projectStore';
import { getStageLabel, getStageColor, formatEmissions, groupByCategory } from '@/utils/helpers';
import { EMISSION_CATEGORIES, getCategoriesByStage } from '@/mocks/projects';
import Header from '@/components/Header';
import EmissionRecordItem from '@/components/EmissionRecordItem';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { ProductionStage } from '@/types/project';
import { useTranslation } from '@/hooks/useTranslation';

// 定義類型
interface PieDataPoint {
  x: string;
  y: number;
  color: string;
}

interface BarDataPoint {
  x: string;
  y: number;
  color: string;
}

// 僅在原生平台導入Victory Native
let VictoryComponents: any = null;
if (Platform.OS !== 'web') {
  try {
    VictoryComponents = require('victory-native');
  } catch (error) {
    console.warn('Failed to load Victory Native components');
  }
}

const screenWidth = Dimensions.get('window').width;

export default function StageAnalyticsScreen() {
  const { stage } = useLocalSearchParams<{ stage: ProductionStage }>();
  const router = useRouter();
  const { projectEmissionRecords, projects } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { t } = useTranslation();
  
  if (!stage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>{t('stage.invalid.parameter')}</Text>
      </View>
    );
  }

  // Get stage-specific records
  const stageRecords = (projectEmissionRecords || []).filter((record: any) => record.stage === stage);
  
  // Calculate total emissions for this stage
  const totalEmissions = stageRecords.reduce((sum: number, record: any) => sum + record.amount, 0);
  
  // Get stage-specific categories
  const stageCategories = getCategoriesByStage(stage);
  
  // Group records by category (manually implement since types don't match)
  const categoriesData = stageCategories.map(category => {
    const categoryRecords = stageRecords.filter((record: any) => record.categoryId === category.id);
    const totalValue = categoryRecords.reduce((sum: number, record: any) => sum + record.amount, 0);
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      value: totalValue,
      count: categoryRecords.length
    };
  }).filter(category => category.value > 0);
  
  // Prepare data for pie chart
  const pieChartData = categoriesData.map(category => ({
    x: category.name,
    y: category.value,
    color: category.color
  }));

  // Prepare data for bar chart - last 5 records
  const barChartData = stageRecords
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((record: any) => {
      const category = stageCategories.find((c: any) => c.id === record.categoryId);
      return {
        x: new Date(record.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
        y: record.amount,
        color: category ? category.color : '#888888'
      };
    })
    .reverse(); // Reverse to show chronological order

  // Count unique projects in this stage
  const uniqueProjects = new Set(stageRecords.map((record: any) => record.projectId)).size;
  
  // Get most recent record date
  const getMostRecentDate = () => {
    if (stageRecords.length === 0) return t('stage.no.records');
    
    const sortedRecords = [...stageRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const date = new Date(sortedRecords[0].date);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  const stageColor = getStageColor(stage);
  
  // Web版簡易餅圖
  const renderSimplePieChart = () => {
    if (pieChartData.length === 0) return null;
    
    const total = pieChartData.reduce((sum, item) => sum + item.y, 0);
    let currentAngle = 0;
    
    return (
      <View style={styles.simplePieChartContainer}>
        <View style={styles.simplePieWrapper}>
          {pieChartData.map((item, index) => {
            const angle = (item.y / total) * 360;
            const rotation = currentAngle;
            currentAngle += angle;
            
            return (
              <View 
                key={index}
                style={[
                  styles.simplePieSlice,
                  {
                    backgroundColor: item.color,
                    transform: [
                      { rotate: `${rotation}deg` },
                      { skewX: `${angle - 90}deg` }
                    ],
                    opacity: angle > 180 ? 0.9 : 1,
                    zIndex: angle > 180 ? 1 : 0
                  }
                ]}
              />
            );
          })}
          <View style={styles.simplePieInner} />
        </View>
        
        <View style={styles.legendContainer}>
          {pieChartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: theme.secondaryText }]}>
                {item.x}: {((item.y / totalEmissions) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  // Web版簡易柱狀圖
  const renderSimpleBarChart = () => {
    if (barChartData.length === 0) return null;
    
    const maxValue = Math.max(...barChartData.map(item => item.y));
    
    return (
      <View style={styles.simpleBarChartContainer}>
        <View style={styles.simpleBarChartBars}>
          {barChartData.map((item, index) => (
            <View key={index} style={styles.simpleBarContainer}>
              <View 
                style={[
                  styles.simpleBar, 
                  { 
                    backgroundColor: item.color,
                    height: `${(item.y / maxValue) * 80}%`,
                  }
                ]} 
              />
              <Text style={[styles.simpleBarLabel, { color: theme.secondaryText }]}>
                {item.x}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.simpleBarYAxis}>
          <Text style={[styles.simpleAxisLabel, { color: theme.secondaryText }]}>
            {Math.round(maxValue)}kg
          </Text>
          <Text style={[styles.simpleAxisLabel, { color: theme.secondaryText }]}>
            {Math.round(maxValue/2)}kg
          </Text>
          <Text style={[styles.simpleAxisLabel, { color: theme.secondaryText }]}>
            0kg
          </Text>
        </View>
      </View>
    );
  };
  
  // 渲染原生平台圓餅圖
  const renderNativePieChart = () => {
    if (!VictoryComponents || pieChartData.length === 0) return null;
    
    return (
      <View style={styles.pieChartContainer}>
        <VictoryComponents.VictoryPie
          data={pieChartData}
          width={screenWidth * 0.85}
          height={220}
          colorScale={pieChartData.map(d => d.color)}
          innerRadius={40}
          padAngle={2}
          labelRadius={40 + 35}
          style={{
            labels: { fill: theme.text, fontSize: 10 },
          }}
          animate={{ duration: 500 }}
        />
        <View style={styles.legendContainer}>
          {pieChartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: theme.secondaryText }]}>
                {item.x}: {((item.y / totalEmissions) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  // 渲染原生平台柱狀圖
  const renderNativeBarChart = () => {
    if (!VictoryComponents || barChartData.length === 0) return null;
    
    return (
      <VictoryComponents.VictoryChart
        width={screenWidth * 0.85}
        height={220}
        domainPadding={{ x: 20 }}
        padding={{ top: 20, right: 20, bottom: 40, left: 50 }}
        theme={VictoryComponents.VictoryTheme.material}
      >
        <VictoryComponents.VictoryAxis
          tickFormat={(t: string) => t}
          style={{
            axis: { stroke: theme.border },
            tickLabels: { 
              fill: theme.secondaryText,
              fontSize: 9,
              angle: -45,
              textAnchor: 'end'
            }
          }}
        />
        <VictoryComponents.VictoryAxis
          dependentAxis
          tickFormat={(t: number) => `${t}kg`}
          style={{
            axis: { stroke: theme.border },
            tickLabels: { fill: theme.secondaryText, fontSize: 9 }
          }}
        />
        <VictoryComponents.VictoryBar
          data={barChartData}
          style={{
            data: {
              fill: ({ datum }: { datum: BarDataPoint }) => datum.color,
              width: 20
            }
          }}
          animate={{
            duration: 500,
            onLoad: { duration: 200 }
          }}
        />
      </VictoryComponents.VictoryChart>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.gradientFrom || '#064E3B', theme.gradientTo || '#065F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        
        <Text style={styles.stageTitle}>{getStageLabel(stage)}</Text>
        <Text style={styles.stageSubtitle}>{t('stage.carbon.analysis')}</Text>
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <BarChart3 size={24} color={stageColor} />
            <Text style={[styles.statValue, { color: theme.text }]}>{formatEmissions(totalEmissions)}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('stage.total.emissions')}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <FileText size={24} color={stageColor} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stageRecords.length}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('stage.emission.records')}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Users size={24} color={stageColor} />
            <Text style={[styles.statValue, { color: theme.text }]}>{uniqueProjects}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('stage.related.projects')}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Calendar size={24} color={stageColor} />
            <Text style={[styles.statValue, { color: theme.text, fontSize: 16 }]}>{getMostRecentDate()}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('stage.recent.record')}</Text>
          </View>
        </View>
        
        {/* 圓餅圖 - 根據平台選擇不同實現 */}
        {categoriesData.length > 0 && (
          <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>{t('stage.category.distribution')}</Text>
            {Platform.OS === 'web' 
              ? renderSimplePieChart() 
              : renderNativePieChart()
            }
          </View>
        )}
        
        {/* 條形圖 - 根據平台選擇不同實現 */}
        {barChartData.length > 0 && (
          <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>{t('stage.recent.trends')}</Text>
            {Platform.OS === 'web' 
              ? renderSimpleBarChart() 
              : renderNativeBarChart()
            }
          </View>
        )}
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('stage.category.analysis')}</Text>
          
          {categoriesData.length > 0 ? (
            <View style={styles.categoriesContainer}>
              {categoriesData.map((category) => (
                <View 
                  key={category.id} 
                  style={[styles.categoryCard, { backgroundColor: theme.card }]}
                >
                  <View style={styles.categoryHeader}>
                    <View 
                      style={[
                        styles.categoryIcon, 
                        { backgroundColor: category.color + '20' }
                      ]}
                    >
                      <Text style={[styles.categoryIconText, { color: category.color }]}>
                        {category.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                      <Text style={[styles.categoryCount, { color: theme.secondaryText }]}>
                        {category.count} {t('stage.record.count')}
                      </Text>
                    </View>
                    <Text style={[styles.categoryValue, { color: category.color }]}>
                      {formatEmissions(category.value)}
                    </Text>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          backgroundColor: category.color + '30',
                          width: `${Math.min(100, (category.value / totalEmissions) * 100)}%` 
                        }
                      ]}
                    />
                    <Text style={[styles.progressText, { color: theme.secondaryText }]}>
                      {((category.value / totalEmissions) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              {t('stage.no.records.message')}
            </Text>
          )}
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('stage.recent.records')}</Text>
          
          {stageRecords.length > 0 ? (
            <View style={styles.recordsContainer}>
              {stageRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((record) => (
                  <EmissionRecordItem 
                    key={record.id}
                    record={record}
                    onPress={() => router.push(`/project/${record.projectId}/edit?recordId=${record.id}`)}
                  />
                ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              {t('stage.no.records.message')}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  stageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stageSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  // 圖表相關樣式
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  // Web簡易圖表樣式
  simplePieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  simplePieWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  simplePieSlice: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    transformOrigin: 'center',
  },
  simplePieInner: {
    position: 'absolute',
    width: 80,
    height: 80,
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    borderRadius: 40,
    backgroundColor: 'white',
  },
  simpleBarChartContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 220,
    alignItems: 'flex-end',
  },
  simpleBarChartBars: {
    flexDirection: 'row',
    flex: 1,
    height: '100%',
    alignItems: 'flex-end',
    paddingLeft: 30,
    paddingBottom: 30,
  },
  simpleBarContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  simpleBar: {
    width: 20,
    minHeight: 4,
    borderRadius: 2,
  },
  simpleBarLabel: {
    position: 'absolute',
    bottom: 0,
    fontSize: 9,
    textAlign: 'center',
    transform: [{ rotate: '-45deg' }],
    width: 60,
  },
  simpleBarYAxis: {
    width: 30,
    height: '100%',
    justifyContent: 'space-between',
    paddingBottom: 50,
    paddingTop: 20,
  },
  simpleAxisLabel: {
    fontSize: 9,
    textAlign: 'right',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    top: 12,
    fontSize: 12,
  },
  recordsContainer: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});