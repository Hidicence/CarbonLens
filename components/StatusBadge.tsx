import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectStatus } from '@/types/project';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'small' | 'medium' | 'large';
}

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const { t } = useTranslation();
  const getStatusColor = (status: ProjectStatus): string => {
    switch(status) {
      case 'planning':
        return '#6C63FF'; // Purple
      case 'active':
        return '#059669'; // Emerald
      case 'completed':
        return '#10B981'; // Green
      case 'on-hold':
        return '#9CA3AF'; // Gray
      default:
        return '#9CA3AF'; // Gray
    }
  };

  const getStatusLabel = (status: ProjectStatus): string => {
    switch(status) {
      case 'planning':
        return t('status.planning');
      case 'active':
        return t('status.active');
      case 'completed':
        return t('status.completed');
      case 'on-hold':
        return t('status.on-hold');
      default:
        return t('status.unknown');
    }
  };
  
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  
  // 確保標籤存在且不為空，避免渲染問題
  if (!label || typeof label !== 'string' || label.trim() === '') {
    return null;
  }
  
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 2,
          paddingHorizontal: 6,
          borderRadius: 4,
          fontSize: 10,
        };
      case 'medium':
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 6,
          fontSize: 12,
        };
      case 'large':
        return {
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
          fontSize: 14,
        };
      default:
        return {
          paddingVertical: 2,
          paddingHorizontal: 6,
          borderRadius: 4,
          fontSize: 10,
        };
    }
  };
  
  const sizeStyle = getSizeStyle();
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: color + '20',
        borderColor: color,
        paddingVertical: sizeStyle.paddingVertical,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        borderRadius: sizeStyle.borderRadius,
      }
    ]}>
      <Text style={[
        styles.text, 
        { 
          color: color,
          fontSize: sizeStyle.fontSize,
        }
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  text: {
    fontWeight: '500',
  },
});