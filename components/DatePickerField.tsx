import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import CustomDatePicker from './CustomDatePicker';

interface DatePickerFieldProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  showIcon?: boolean;
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '選擇日期',
  error,
  minDate,
  maxDate,
  containerStyle,
  labelStyle,
  fieldStyle,
  textStyle,
  errorStyle,
  showIcon = true,
  iconSize = 20,
  iconColor,
  disabled = false
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [showPicker, setShowPicker] = useState(false);
  
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };
  
  const handleDateSelect = (date: Date) => {
    onChange(date);
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }, labelStyle]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.field,
          { 
            backgroundColor: theme.card,
            borderColor: error ? theme.error : theme.border
          },
          fieldStyle,
          disabled && styles.disabledField
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        {showIcon && (
          <Calendar 
            size={iconSize} 
            color={iconColor || theme.secondaryText} 
            style={styles.icon} 
          />
        )}
        
        <Text 
          style={[
            styles.text, 
            { color: theme.text },
            !value && { color: theme.secondaryText },
            textStyle
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={[styles.error, { color: theme.error }, errorStyle]}>
          {error}
        </Text>
      )}
      
      <CustomDatePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleDateSelect}
        initialDate={value}
        minDate={minDate}
        maxDate={maxDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  disabledField: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default DatePickerField;