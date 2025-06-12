import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectStatus } from '@/types/project';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'small' | 'medium' | 'large';
}

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
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
        return '規劃中';
      case 'active':
        return '進行中';
      case 'completed':
        return '已完成';
      case 'on-hold':
        return '暫停中';
      default:
        return '未知狀態';
    }
  };
  
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  
  // 如果標籤為空，不渲染任何內容
  if (!label || label === '未知狀態') {
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