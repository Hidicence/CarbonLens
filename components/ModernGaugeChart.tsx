import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface ModernGaugeChartProps {
  value: number; // 0-100
  title: string;
  subtitle?: string;
  color?: string;
  size?: number;
  unit?: string;
}

const ModernGaugeChart: React.FC<ModernGaugeChartProps> = ({
  value,
  title,
  subtitle,
  color = '#10b981',
  size = 200,
  unit = '%'
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  // 動畫值
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2 - 20;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  // 計算進度
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const progressOffset = circumference - (circumference * normalizedValue) / 100;
  
  useEffect(() => {
    // 進度動畫
    Animated.timing(animatedValue, {
      toValue: normalizedValue,
      duration: 1500,
      useNativeDriver: false,
    }).start();
    
    // 脈衝動畫
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseLoop.start();
    
    return () => {
      pulseLoop.stop();
    };
  }, [normalizedValue]);
  
  const getColorFromValue = (val: number) => {
    if (val >= 80) return '#10b981'; // 綠色 - 優秀
    if (val >= 60) return '#3b82f6'; // 藍色 - 良好
    if (val >= 40) return '#f59e0b'; // 橘色 - 一般
    return '#ef4444'; // 紅色 - 需要改善
  };
  
  const currentColor = getColorFromValue(normalizedValue);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View 
        style={[
          styles.svgContainer,
          {
            transform: [{ scale: pulseAnimation }],
          }
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={currentColor} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={currentColor} stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          
          {/* 背景圓圈 */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth={strokeWidth}
          />
          
          {/* 進度圓圈 */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
          
          {/* 中心點 */}
          <Circle
            cx={center}
            cy={center}
            r={4}
            fill={currentColor}
          />
        </Svg>
      </Animated.View>
      
      {/* 中心內容 */}
      <View style={styles.centerContent}>
        <Animated.Text style={[
          styles.valueText, 
          { 
            color: currentColor,
            fontSize: size * 0.12,
          }
        ]}>
          {Math.round(normalizedValue)}{unit}
        </Animated.Text>
        
        <Text style={[
          styles.titleText, 
          { 
            color: theme.text,
            fontSize: size * 0.06,
          }
        ]}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[
            styles.subtitleText, 
            { 
              color: theme.secondaryText,
              fontSize: size * 0.05,
            }
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {/* 狀態指示器 */}
      <View style={[styles.statusIndicator, { backgroundColor: currentColor + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: currentColor }]} />
        <Text style={[styles.statusText, { color: currentColor }]}>
          {normalizedValue >= 80 ? '優秀' : 
           normalizedValue >= 60 ? '良好' : 
           normalizedValue >= 40 ? '一般' : '需改善'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  valueText: {
    fontWeight: '800',
    marginBottom: 4,
  },
  titleText: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitleText: {
    fontWeight: '400',
    textAlign: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default ModernGaugeChart;