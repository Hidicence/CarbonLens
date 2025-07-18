import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

interface GaugeChartProps {
  value: number; // 0-100
  max?: number;
  min?: number;
  title: string;
  subtitle?: string;
  color?: string;
  size?: number;
  showValue?: boolean;
  unit?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max = 100,
  min = 0,
  title,
  subtitle,
  color = '#3b82f6',
  size = 200,
  showValue = true,
  unit = '%'
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  // 動畫值
  const animatedValue = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2 - 10;
  const center = size / 2;
  
  // 計算角度（從 -180° 到 0°，總共 180°，半圓形）
  const startAngle = -180;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle;
  
  // 計算當前值的角度
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = (normalizedValue - min) / (max - min);
  const currentAngle = startAngle + (totalAngle * percentage);
  
  // 動畫效果
  useEffect(() => {
    // 進度動畫
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    
    // 發光脈衝動畫
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0.2,
          duration: 2000,
          useNativeDriver: false,
        })
      ])
    ).start();
  }, [percentage]);
  
  // 轉換角度到弧度
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  // 計算弧線路徑
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = toRadians(angleInDegrees);
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  // 背景弧線
  const backgroundArc = describeArc(center, center, radius, startAngle, endAngle);
  
  // 進度弧線
  const progressArc = describeArc(center, center, radius, startAngle, currentAngle);
  
  // 移除指針相關計算 - 採用更簡潔的設計
  
  return (
    <View style={[styles.container, { width: size, height: size * 0.65, overflow: 'hidden' }]}>
      {/* 背景發光效果 */}
      <Animated.View
        style={[
          styles.backgroundGlow,
          {
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: (size * 0.95) / 2,
            backgroundColor: color + '08',
            opacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.06, 0.18],
            }),
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.12, 0.35],
            }),
            shadowRadius: 15,
            elevation: 8,
          }
        ]}
      />
      
      <Svg width={size} height={size * 0.65}>
        <Defs>
          <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={color} stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={isDarkMode ? '#374151' : '#E5E7EB'} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={isDarkMode ? '#4B5563' : '#F3F4F6'} stopOpacity="0.6" />
          </SvgLinearGradient>
        </Defs>
        
        {/* 背景弧線 */}
        <Path
          d={backgroundArc}
          fill="none"
          stroke="url(#backgroundGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.9}
        />
        
        {/* 進度弧線 */}
        <Path
          d={progressArc}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* 進度弧線外層光暈 */}
        <Path
          d={progressArc}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          opacity={0.15}
        />
        
        {/* 移除指針和中心點 - 採用更簡潔的設計 */}
        
        {/* 刻度線已移除 - 更簡潔的設計 */}
      </Svg>
      
      {/* 文字內容 */}
      <View style={styles.textContainer}>
        {showValue && (
          <Text style={[styles.value, { color: theme.text }]}>
            {Math.round(normalizedValue)}
          </Text>
        )}
        
        <Text style={[styles.title, { color: theme.secondaryText }]}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {/* 數值標籤 */}
      <View style={styles.labelsContainer}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          {min}
        </Text>
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          {max}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGlow: {
    position: 'absolute',
    top: '2%',
    left: '2.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '25%',
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.9,
  },
  value: {
    fontSize: 52,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  labelsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    bottom: '5%',
    left: '5%',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
});

export default GaugeChart;