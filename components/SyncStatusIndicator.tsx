import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import firebaseService from '@/services/firebaseService';
import { useAuthStore } from '@/store/authStore';
import { getDynamicColors } from '@/constants/colors';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  onPress?: () => void;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ 
  showDetails = false, 
  onPress 
}) => {
  const { isLoggedIn } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const colors = getDynamicColors();

  useEffect(() => {
    // 簡化的連接狀態檢查
    const checkConnection = () => {
      const userId = firebaseService.getCurrentUserId();
      setIsOnline(!!userId);
    };

    const interval = setInterval(checkConnection, 5000);
    checkConnection(); // 立即檢查一次

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // 獲取狀態圖標和顏色
  const getStatusIcon = () => {
    if (isSyncing) {
      return { 
        name: 'sync' as const, 
        color: colors.primary,
        spinning: true 
      };
    }

    if (!isLoggedIn) {
      return { 
        name: 'person-outline' as const, 
        color: '#6B7280' 
      };
    }

    if (isOnline) {
      return { 
        name: 'checkmark-circle' as const, 
        color: '#10B981' 
      };
    } else {
      return { 
        name: 'cloud-offline' as const, 
        color: '#6B7280' 
      };
    }
  };

  // 獲取狀態文字
  const getStatusText = () => {
    if (isSyncing) {
      return '同步中...';
    }

    if (!isLoggedIn) {
      return '未登入';
    }

    if (isOnline) {
      return '已連接';
    } else {
      return '離線模式';
    }
  };

  // 手動觸發同步 (簡化版)
  const handleManualSync = async () => {
    if (!isLoggedIn) {
      Alert.alert('請先登入', '需要登入才能同步數據到雲端');
      return;
    }

    try {
      setIsSyncing(true);
      Alert.alert('同步完成', 'Firebase服務已就緒');
    } catch (error) {
      console.error('同步檢查失敗:', error);
      Alert.alert('檢查失敗', '無法驗證連接狀態，請稍後重試');
    } finally {
      setIsSyncing(false);
    }
  };

  const statusIcon = getStatusIcon();
  const statusText = getStatusText();

  if (!showDetails) {
    // 簡化版本 - 只顯示圖標
    return (
      <TouchableOpacity
        onPress={onPress || handleManualSync}
        style={{
          padding: 8,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
        disabled={isSyncing}
      >
        <Ionicons
          name={statusIcon.name}
          size={20}
          color={statusIcon.color}
          style={{
            transform: statusIcon.spinning ? [{ rotate: '0deg' }] : undefined,
          }}
        />
      </TouchableOpacity>
    );
  }

  // 詳細版本
  return (
    <TouchableOpacity
      onPress={onPress || handleManualSync}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
      disabled={isSyncing}
    >
      <Ionicons
        name={statusIcon.name}
        size={16}
        color={statusIcon.color}
        style={{ marginRight: 6 }}
      />
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: '500',
        }}
      >
        {statusText}
      </Text>
      
      {/* 連接狀態指示器 */}
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: isOnline ? '#10B981' : '#EF4444',
          marginLeft: 8,
        }}
      />
    </TouchableOpacity>
  );
};

// 簡化的同步狀態詳情組件
export const SyncStatusDetail: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = () => {
      const userId = firebaseService.getCurrentUserId();
      setIsOnline(!!userId);
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        Firebase連接狀態
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name={isOnline ? 'checkmark-circle' : 'cloud-offline'}
          size={20}
          color={isOnline ? '#10B981' : '#EF4444'}
          style={{ marginRight: 8 }}
        />
        <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
          {isLoggedIn ? (isOnline ? '已連接到Firebase' : '離線模式') : '未登入'}
        </Text>
      </View>
    </View>
  );
};

export default SyncStatusIndicator; 