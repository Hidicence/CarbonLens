import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Filter, FeDropShadow } from 'react-native-svg';

interface ModernDashboardCardProps {
  title: string;
  value: string;
  percentage: number; // 0-100
  icon: any;
  color: string;
  glowColor?: string;
  subtitle?: string;
  showProgressRing?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ModernDashboardCard: React.FC<ModernDashboardCardProps> = ({
  title,
  value,
  percentage,
  icon: Icon,
  color,
  glowColor,
  subtitle,
  showProgressRing = true,
  size = 'medium'
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  // 安全檢查 percentage 值
  const safePercentage = (() => {
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      console.warn('ModernDashboardCard: Invalid percentage value:', percentage, 'for title:', title);
      return 0;
    }
    return Math.max(0, Math.min(100, percentage));
  })();
  
  // 動畫值
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.95)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  
  // 動畫準備狀態
  const [animationReady, setAnimationReady] = useState(false);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  
  // 固定尺寸，避免跑版
  const cardSizes = {
    small: { width: 130, height: 130 },
    medium: { width: 150, height: 150 },
    large: { width: 170, height: 170 }
  };
  
  const { width, height } = cardSizes[size];
  const ringSize = width * 0.8;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  
  // 安全檢查計算值
  const safeCircumference = (() => {
    if (typeof circumference !== 'number' || isNaN(circumference)) {
      console.warn('ModernDashboardCard: Invalid circumference value:', circumference, 'for title:', title);
      return 0;
    }
    return circumference;
  })();
  
  const safeRadius = (() => {
    if (typeof radius !== 'number' || isNaN(radius)) {
      console.warn('ModernDashboardCard: Invalid radius value:', radius, 'for title:', title);
      return 0;
    }
    return radius;
  })();
  
  // 動畫效果
  useEffect(() => {
    // 設置動畫準備狀態
    setAnimationReady(false);
    setDisplayPercentage(0);
    
    // 進度動畫
    Animated.timing(animatedValue, {
      toValue: safePercentage,
      duration: 1200,
      useNativeDriver: false,
    }).start(() => {
      setAnimationReady(true);
    });
    
    // 縮放動畫
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
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
    
    // 百分比數字動畫
    const steps = 60; // 60幀
    const stepValue = safePercentage / steps;
    let currentStep = 0;
    
    const percentageInterval = setInterval(() => {
      currentStep++;
      setDisplayPercentage(Math.round(stepValue * currentStep));
      
      if (currentStep >= steps) {
        clearInterval(percentageInterval);
        setDisplayPercentage(safePercentage);
      }
    }, 1200 / steps);
    
    return () => {
      clearInterval(percentageInterval);
    };
  }, [safePercentage]);
  
  return (
    <Animated.View style={[
      styles.container, 
      { width, height, transform: [{ scale: scaleValue }] }
    ]}>
      {/* 多層背景漸變 */}
      <LinearGradient
        colors={[
          isDarkMode ? '#1a1a1a' : '#ffffff',
          isDarkMode ? '#2d2d2d' : '#f8f9fa',
          isDarkMode ? '#1a1a1a' : '#ffffff'
        ]}
        style={[styles.background, { borderRadius: 24 }]}
      />
      
      {/* 內層發光背景 */}
      <LinearGradient
        colors={[
          (glowColor || color) + '05',
          (glowColor || color) + '10',
          (glowColor || color) + '05'
        ]}
        style={[styles.innerGlow, { borderRadius: 20 }]}
      />
      
      {/* 動態發光效果 */}
      <Animated.View 
        style={[
          styles.glowEffect,
          { 
            backgroundColor: glowColor || color,
            opacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.05, 0.25],
            }),
            borderRadius: 24,
            shadowColor: glowColor || color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0.9],
            }),
            shadowRadius: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [15, 25],
            }),
            elevation: 18,
          }
        ]} 
      />
      
      {/* 外層光暈 */}
      <Animated.View 
        style={[
          styles.outerGlow,
          { 
            backgroundColor: glowColor || color,
            opacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.02, 0.12],
            }),
            borderRadius: 32,
            shadowColor: glowColor || color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.6],
            }),
            shadowRadius: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 35],
            }),
            elevation: 20,
          }
        ]} 
      />
      
      {/* 主要內容 */}
      <View style={styles.content}>
        {/* 圖標容器 */}
        <Animated.View style={[
          styles.iconContainer, 
          { 
            backgroundColor: color + '15',
            transform: [{
              scale: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05],
              })
            }]
          }
        ]}>
          <Animated.View style={[
            styles.iconGlow, 
            { 
              backgroundColor: color + '30',
              opacity: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              })
            }
          ]} />
          <Icon size={size === 'small' ? 18 : size === 'medium' ? 22 : 26} color={color} />
        </Animated.View>
        
        {/* 標題 */}
        <Text style={[styles.title, { color: theme.secondaryText }]} numberOfLines={1}>
          {title}
        </Text>
        
        {/* 數值 */}
        <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
          {value}
        </Text>
        
        {/* 副標題 */}
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.secondaryText }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {/* 進度環 */}
      {showProgressRing && (
        <View style={styles.progressRing}>
          <Svg width={ringSize} height={ringSize} style={styles.svg}>
            <Defs>
              <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <Stop offset="50%" stopColor={color} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={color} stopOpacity="1" />
              </SvgLinearGradient>
              <SvgLinearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.1" />
                <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </SvgLinearGradient>
            </Defs>
            
            {/* 背景圓環 */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={safeRadius}
              stroke={theme.border}
              strokeWidth={strokeWidth - 2}
              fill="none"
              opacity={0.2}
            />
            
            {/* 進度圓環 */}
            <Animated.View>
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={safeRadius}
                stroke="url(#gradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={safeCircumference}
                strokeDashoffset={animationReady ? animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: [safeCircumference, 0],
                }) : safeCircumference}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            </Animated.View>
          </Svg>
          
          {/* 百分比 */}
          <View style={styles.percentageContainer}>
            <Text style={[styles.percentage, { color }]}>
              {Math.round(displayPercentage)}%
            </Text>
          </View>
        </View>
      )}
      
      {/* 邊框高光 */}
      <Animated.View 
        style={[
          styles.borderHighlight,
          { 
            borderColor: color + '60',
            borderRadius: 24,
            opacity: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            })
          }
        ]} 
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    margin: 6,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
  },
  innerGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
  },
  outerGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
    zIndex: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 25,
    opacity: 0.6,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  percentageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '75%',
  },
  percentage: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  borderHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    pointerEvents: 'none',
  },
});

export default ModernDashboardCard;