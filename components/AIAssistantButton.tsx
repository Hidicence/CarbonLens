import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MessageSquare, Bot } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import Colors from '@/constants/colors';

interface AIAssistantButtonProps {
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  title?: string;
  icon?: 'message' | 'bot';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function AIAssistantButton({
  onPress,
  variant = 'primary',
  size = 'medium',
  title,
  icon = 'message',
  style,
  textStyle,
  disabled = false
}: AIAssistantButtonProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { t } = useTranslation();

  // 根據變體選擇樣式
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size === 'small' ? 8 : size === 'medium' ? 10 : 12,
      paddingHorizontal: size === 'small' ? 12 : size === 'medium' ? 16 : 20,
      paddingVertical: size === 'small' ? 8 : size === 'medium' ? 10 : 12,
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#10B981', // AI助手專用綠色
          borderWidth: 1,
          borderColor: '#10B981',
          elevation: 2,
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        };
      
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.card,
          borderWidth: 1.5,
          borderColor: '#10B981',
          elevation: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        };
      
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.6)' : '#10B981',
        };
      
      case 'minimal':
        return {
          ...baseStyle,
          backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          borderWidth: 0,
        };
      
      default:
        return baseStyle;
    }
  };

  // 根據變體選擇文字顏色
  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
      case 'outline':
      case 'minimal':
        return '#10B981';
      default:
        return '#10B981';
    }
  };

  // 根據變體選擇圖標顏色
  const getIconColor = (): string => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
      case 'outline':
      case 'minimal':
        return '#10B981';
      default:
        return '#10B981';
    }
  };

  // 根據尺寸選擇圖標大小
  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 18;
      case 'large':
        return 20;
      default:
        return 18;
    }
  };

  // 根據尺寸選擇字體大小
  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const IconComponent = icon === 'bot' ? Bot : MessageSquare;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <IconComponent 
        size={getIconSize()} 
        color={getIconColor()} 
      />
      <Text 
        style={[
          styles.buttonText,
          {
            color: getTextColor(),
            fontSize: getFontSize(),
            marginLeft: 6,
            fontWeight: variant === 'primary' ? '600' : '500'
          },
          textStyle
        ]}
      >
        {title || t('ui.ai.assistant')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontWeight: '500',
    letterSpacing: 0.3,
  },
}); 