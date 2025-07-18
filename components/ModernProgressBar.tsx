import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';

interface ModernProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  color?: string;
  height?: number;
  showValue?: boolean;
  animated?: boolean;
  glowEffect?: boolean;
  style?: any;
}

const ModernProgressBar: React.FC<ModernProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = '#3b82f6',
  height = 8,
  showValue = true,
  animated = true,
  glowEffect = true,
  style
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const [animationReady, setAnimationReady] = useState(false);
  
  // 安全檢查數值
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const safeMax = typeof max === 'number' && !isNaN(max) && max > 0 ? max : 100;
  const percentage = Math.min(Math.max(safeValue, 0), safeMax) / safeMax * 100;
  
  useEffect(() => {
    setAnimationReady(false);
    
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }).start(() => {
        setAnimationReady(true);
      });
    } else {
      animatedValue.setValue(percentage);
      setAnimationReady(true);
    }
    
    // 發光效果
    if (glowEffect) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0.4,
            duration: 1500,
            useNativeDriver: false,
          })
        ])
      ).start();
    }
  }, [percentage, animated, glowEffect]);
  
  return (
    <View style={[styles.container, style]}>
      {/* 標籤和數值 */}
      {(label || showValue) && (
        <View style={styles.header}>
          {label && (
            <Text style={[styles.label, { color: theme.text }]}>
              {label}
            </Text>
          )}
          {showValue && (
            <Text style={[styles.value, { color }]}>
              {value.toFixed(1)}{max === 100 ? '%' : `/${max}`}
            </Text>
          )}
        </View>
      )}
      
      {/* 進度條容器 */}
      <View style={[styles.progressContainer, { height }]}>
        {/* 背景 */}
        <View 
          style={[
            styles.background,
            { 
              backgroundColor: theme.border,
              opacity: 0.3,
              borderRadius: height / 2
            }
          ]} 
        />
        
        {/* 進度條 */}
        <Animated.View
          style={[
            styles.progress,
            {
              width: animationReady ? animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }) : '0%',
              borderRadius: height / 2,
            }
          ]}
        >
          <LinearGradient
            colors={[
              color + '80',
              color,
              color + 'CC'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { borderRadius: height / 2 }]}
          />
          
          {/* 發光效果 */}
          {glowEffect && (
            <Animated.View 
              style={[
                styles.glow,
                {
                  backgroundColor: color,
                  opacity: animationReady ? glowAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.7],
                  }) : 0.3,
                  borderRadius: height / 2,
                  shadowColor: color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: animationReady ? glowAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }) : 0.5,
                  shadowRadius: animationReady ? glowAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [3, 8],
                  }) : 3,
                  elevation: 6,
                }
              ]} 
            />
          )}
        </Animated.View>
        
        {/* 進度指示器 */}
        {percentage > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                left: animationReady ? animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }) : '0%',
                backgroundColor: color,
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: animationReady ? glowAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }) : 0.6,
                shadowRadius: animationReady ? glowAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, 5],
                }) : 2,
                elevation: 5,
              }
            ]}
          />
        )}
      </View>
      
      {/* 分段指示器 */}
      <View style={styles.segments}>
        {Array.from({ length: 4 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              {
                backgroundColor: percentage > (i + 1) * 25 ? color + '60' : theme.border,
                opacity: percentage > (i + 1) * 25 ? 1 : 0.3,
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
  },
  indicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 12,
    borderRadius: 2,
    transform: [{ translateX: -2 }],
  },
  segments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  segment: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
});

export default ModernProgressBar;