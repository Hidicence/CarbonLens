import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import AIAssistant from '@/components/AIAssistant';
import Colors from '@/constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingAIAssistantProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'project' | 'operational';
}

export default function FloatingAIAssistant({ 
  visible, 
  onClose,
  mode = 'project'
}: FloatingAIAssistantProps) {
  const { projects } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  const isOperationalMode = mode === 'operational';

  // 動畫值
  const position = useRef(new Animated.ValueXY({ 
    x: screenWidth - 80, 
    y: screenHeight * 0.5 
  })).current;
  const scale = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  // 初始化專案
  useEffect(() => {
    const activeProjects = projects.filter(p => p.status === 'active');
    if (activeProjects.length > 0 && !selectedProject) {
      setSelectedProject(activeProjects[0].id);
    }
  }, [projects, selectedProject]);

  // 顯示/隱藏動畫
  useEffect(() => {
    if (visible) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    }
  }, [visible]);

  // 展開/收縮動畫
  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: false,
      tension: 150,
      friction: 8,
    }).start();
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleMinimize = () => {
    setIsExpanded(false);
  };

  const handleEmissionCreated = (emission: any) => {
    console.log('懸浮 AI 助手創建排放記錄:', emission);
  };

  // 處理拖拽手勢
  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: position.x,
          translationY: position.y,
        },
      },
    ],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // 拖拽結束時，確保泡泡在屏幕邊界內
      const { translationX, translationY } = event.nativeEvent;
      const newX = Math.max(0, Math.min(screenWidth - 60, translationX));
      const newY = Math.max(100, Math.min(screenHeight - 200, translationY));
      
      position.setOffset({
        x: newX,
        y: newY,
      });
      position.setValue({ x: 0, y: 0 });
    }
  };

  if (!visible) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View
        style={[
          styles.floatingContainer,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { scale },
            ],
          },
        ]}
      >
        {!isExpanded ? (
          // 收縮狀態 - 小圓球（可拖拽）
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View>
              <TouchableOpacity
                style={[styles.bubble, { backgroundColor: '#10B981' }]}
                onPress={handleExpand}
                activeOpacity={0.8}
              >
                <MessageSquare size={28} color="white" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>AI</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </PanGestureHandler>
        ) : (
          // 展開狀態 - 聊天窗口
          <Animated.View
            style={[
              styles.expandedContainer,
              {
                backgroundColor: theme.background,
                width: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, Math.min(screenWidth - 32, 340)],
                }),
                height: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, Math.min(screenHeight * 0.7, 500)],
                }),
              },
            ]}
          >
            {/* 頂部控制欄 */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <View style={styles.headerLeft}>
                <MessageSquare size={20} color="#10B981" />
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  AI 助手
                </Text>
              </View>
              
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleMinimize}
                >
                  <Minimize2 size={16} color={theme.secondaryText} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={onClose}
                >
                  <X size={16} color={theme.secondaryText} />
                </TouchableOpacity>
              </View>
            </View>

            {/* AI 助手內容 */}
            <View style={styles.content}>
              <AIAssistant
                projectId={selectedProject || undefined}
                mode={mode}
                onEmissionCreated={handleEmissionCreated}
                onClose={() => {}} // 在這裡不處理關閉，由上層控制
              />
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
    zIndex: 9999,
  },
  floatingContainer: {
    position: 'absolute',
    pointerEvents: 'auto',
  },
  bubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      },
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }
    }),
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  expandedContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
      },
      android: {
        elevation: 12,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      }
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
}); 