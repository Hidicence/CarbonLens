import React from 'react';
import { View, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// 備用顯示組件（在不支持3D的平台或出錯時使用）
const Fallback = ({ message }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  return (
    <View style={[styles.fallbackContainer, {backgroundColor: theme.card}]}>
      <Text style={{color: theme.text, textAlign: 'center'}}>
        {message}
      </Text>
    </View>
  );
};

// 一個簡單的2D替代視圖，顯示相同的數據
const Simple2DView = ({ data, maxValue, title }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  return (
    <View style={[styles.container, {backgroundColor: theme.card}]}>
      <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
      
      <View style={styles.barContainer}>
        {data && data.map((item, index) => {
          const barHeight = (item.value / (maxValue || 1)) * 250; // 最大高度250
          
          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barLabelContainer}>
                <Text style={[styles.barValue, {color: theme.text}]}>
                  {Math.round(item.value)}
                </Text>
              </View>
              
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight,
                      backgroundColor: item.color 
                    }
                  ]} 
                />
              </View>
              
              <Text style={[styles.barLabel, {color: theme.secondaryText}]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// 主要導出組件
const Emissions3DView = ({ data, maxValue, title }) => {
  const { t } = useTranslation();
  
  if (!data || data.length === 0) {
    return <Fallback message={t('no_emission_data')} />;
  }
  
  // 使用2D視圖，避免所有THREE.js和Skia依賴項
  return (
    <Simple2DView 
      data={data} 
      maxValue={maxValue} 
      title={title || t('emissions_3d_view')} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 400,
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
  },
  fallbackContainer: {
    width: width - 32,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 300,
    paddingTop: 20,
  },
  barGroup: {
    alignItems: 'center',
    width: (width - 64) / 5, // 5個柱子的寬度
    maxWidth: 80,
  },
  barWrapper: {
    height: 250,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabelContainer: {
    height: 20,
  },
  barValue: {
    fontSize: 12,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
    width: 60,
  }
});

export default Emissions3DView; 