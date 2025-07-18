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
  const needleAnimation = useRef(new Animated.Value(0)).current;
  
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2 - 10;
  const center = size / 2;
  
  // 計算角度（從 -135° 到 135°，總共 270°）
  const startAngle = -135;
  const endAngle = 135;
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
    
    // 指針動畫
    Animated.timing(needleAnimation, {
      toValue: currentAngle,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    
    // 發光脈衝動畫
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: false,
        })
      ])
    ).start();
  }, [percentage, currentAngle]);
  
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
  
  // 指針位置
  const needleAngle = toRadians(currentAngle);
  const needleLength = radius - 20;
  const needleX = center + needleLength * Math.cos(needleAngle);
  const needleY = center + needleLength * Math.sin(needleAngle);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 背景發光效果 */}
      <Animated.View
        style={[
          styles.backgroundGlow,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            backgroundColor: color + '10',
            opacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3],
            }),
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
            shadowRadius: 20,
            elevation: 10,
          }
        ]}
      />
      
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={color} stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="1" />
          </SvgLinearGradient>
          <RadialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </RadialGradient>
        </Defs>
        
        {/* 背景弧線 */}
        <Path
          d={backgroundArc}
          fill="none"
          stroke={theme.border}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.3}
        />
        
        {/* 進度弧線 */}
        <Path
          d={progressArc}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* 中心點 */}
        <Circle
          cx={center}
          cy={center}
          r={12}
          fill="url(#centerGradient)"
        />
        
        {/* 中心點高光 */}
        <Circle
          cx={center - 2}
          cy={center - 2}
          r={4}
          fill={color + 'AA'}
          opacity={0.8}
        />
        
        {/* 指針陰影 */}
        <Path
          d={`M ${center + 1} ${center + 1} L ${needleX + 1} ${needleY + 1}`}
          stroke={color + '30'}
          strokeWidth={4}
          strokeLinecap="round"
        />
        
        {/* 指針 */}
        <Path
          d={`M ${center} ${center} L ${needleX} ${needleY}`}
          stroke="url(#needleGradient)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        
        {/* 刻度線 */}
        {Array.from({ length: 11 }, (_, i) => {
          const angle = startAngle + (totalAngle * i / 10);
          const tickAngle = toRadians(angle);
          const isMainTick = i % 2 === 0;
          const tickLength = isMainTick ? 15 : 10;
          const tickStartRadius = radius - 5;
          const tickEndRadius = radius - 5 - tickLength;
          
          const tickStart = polarToCartesian(center, center, tickStartRadius, angle);
          const tickEnd = polarToCartesian(center, center, tickEndRadius, angle);
          
          return (
            <Path
              key={i}
              d={`M ${tickStart.x} ${tickStart.y} L ${tickEnd.x} ${tickEnd.y}`}
              stroke={theme.secondaryText}
              strokeWidth={isMainTick ? 2 : 1}
              strokeLinecap="round"
              opacity={0.6}
            />
          );
        })}
      </Svg>
      
      {/* 文字內容 */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        
        {showValue && (
          <Text style={[styles.value, { color }]}>
            {normalizedValue.toFixed(1)}{unit}
          </Text>
        )}
        
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
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '60%',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  labelsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    bottom: '15%',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default GaugeChart;