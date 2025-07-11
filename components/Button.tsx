import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: theme.secondary,
          borderColor: theme.secondary,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderColor: theme.border,
        };
        break;
      case 'text':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        };
        break;
    }
    
    if (disabled) {
      buttonStyle.opacity = 0.5;
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textColorStyle: TextStyle = {};
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        textColorStyle = {
          color: '#FFFFFF',
        };
        break;
      case 'outline':
      case 'text':
        textColorStyle = {
          color: theme.primary,
        };
        break;
    }
    
    return textColorStyle;
  };
  
  const getSizeStyle = () => {
    let sizeStyle: ViewStyle = {};
    let textSizeStyle: TextStyle = {};
    
    switch (size) {
      case 'small':
        sizeStyle = {
          paddingVertical: 6,
          paddingHorizontal: 12,
        };
        textSizeStyle = {
          fontSize: 14,
        };
        break;
      case 'medium':
        sizeStyle = {
          paddingVertical: 10,
          paddingHorizontal: 16,
        };
        textSizeStyle = {
          fontSize: 16,
        };
        break;
      case 'large':
        sizeStyle = {
          paddingVertical: 14,
          paddingHorizontal: 20,
        };
        textSizeStyle = {
          fontSize: 18,
        };
        break;
    }
    
    return { sizeStyle, textSizeStyle };
  };
  
  const { sizeStyle, textSizeStyle } = getSizeStyle();
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        sizeStyle,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : theme.primary} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text 
            style={[
              styles.text,
              getTextStyle(),
              textSizeStyle,
              icon ? { marginLeft: iconPosition === 'left' ? 8 : 0, marginRight: iconPosition === 'right' ? 8 : 0 } : {},
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});