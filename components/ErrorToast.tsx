import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

export interface ToastMessage {
  id: string;
  type: ErrorType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ErrorToastProps {
  message: ToastMessage;
  onDismiss: (id: string) => void;
}

// 根據錯誤類型獲取顏色和圖標
const getToastConfig = (type: ErrorType) => {
  switch (type) {
    case 'error':
      return {
        backgroundColor: '#FEF2F2',
        borderColor: '#FCA5A5',
        iconColor: '#EF4444',
        icon: 'alert-circle' as const,
        darkBackgroundColor: '#1F1B1B',
        darkBorderColor: '#4C1D1D',
      };
    case 'warning':
      return {
        backgroundColor: '#FFFBEB',
        borderColor: '#FCD34D',
        iconColor: '#F59E0B',
        icon: 'warning' as const,
        darkBackgroundColor: '#1F1E1B',
        darkBorderColor: '#4C3D1D',
      };
    case 'success':
      return {
        backgroundColor: '#F0FDF4',
        borderColor: '#A7F3D0',
        iconColor: '#10B981',
        icon: 'checkmark-circle' as const,
        darkBackgroundColor: '#1B1F1C',
        darkBorderColor: '#1D4C2A',
      };
    case 'info':
    default:
      return {
        backgroundColor: '#EFF6FF',
        borderColor: '#93C5FD',
        iconColor: '#3B82F6',
        icon: 'information-circle' as const,
        darkBackgroundColor: '#1B1E1F',
        darkBorderColor: '#1D3A4C',
      };
  }
};

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onDismiss }) => {
  const { isDarkMode } = useThemeStore();
  const [slideAnim] = useState(new Animated.Value(-screenWidth));
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const config = getToastConfig(message.type);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const backgroundColor = isDarkMode ? config.darkBackgroundColor : config.backgroundColor;
  const borderColor = isDarkMode ? config.darkBorderColor : config.borderColor;
  
  useEffect(() => {
    // 滑入動畫
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 自動消失
    const duration = message.duration ?? 4000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(message.id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* 圖標 */}
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
      </View>

      {/* 內容 */}
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {message.title}
        </Text>
        <Text style={[styles.message, { color: theme.secondaryText }]} numberOfLines={2}>
          {message.message}
        </Text>
      </View>

      {/* 操作按鈕 */}
      <View style={styles.actionsContainer}>
        {message.action && (
          <Pressable
            style={[styles.actionButton, { borderColor: config.iconColor }]}
            onPress={message.action.onPress}
          >
            <Text style={[styles.actionText, { color: config.iconColor }]}>
              {message.action.label}
            </Text>
          </Pressable>
        )}
        
        <Pressable style={styles.closeButton} onPress={handleDismiss}>
          <Ionicons name="close" size={20} color={theme.secondaryText} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

// Toast管理器
class ToastManager {
  private listeners: ((messages: ToastMessage[]) => void)[] = [];
  private messages: ToastMessage[] = [];

  subscribe(listener: (messages: ToastMessage[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.messages));
  }

  show(message: Omit<ToastMessage, 'id'>) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const newMessage: ToastMessage = { ...message, id };
    
    this.messages = [newMessage, ...this.messages].slice(0, 3); // 最多顯示3個
    this.notify();
    
    return id;
  }

  dismiss(id: string) {
    this.messages = this.messages.filter(m => m.id !== id);
    this.notify();
  }

  clear() {
    this.messages = [];
    this.notify();
  }

  // 快捷方法
  error(title: string, message: string, action?: ToastMessage['action']) {
    return this.show({ type: 'error', title, message, action });
  }

  warning(title: string, message: string, action?: ToastMessage['action']) {
    return this.show({ type: 'warning', title, message, action });
  }

  success(title: string, message: string, action?: ToastMessage['action']) {
    return this.show({ type: 'success', title, message, action });
  }

  info(title: string, message: string, action?: ToastMessage['action']) {
    return this.show({ type: 'info', title, message, action });
  }
}

export const toastManager = new ToastManager();

// Toast容器組件
export const ToastContainer: React.FC = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setMessages);
    return unsubscribe;
  }, []);

  return (
    <View style={styles.toastContainer}>
      {messages.map((message, index) => (
        <View key={message.id} style={[styles.toastWrapper, { top: 60 + index * 100 }]}>
          <ErrorToast message={message} onDismiss={toastManager.dismiss.bind(toastManager)} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
});

export default ErrorToast; 