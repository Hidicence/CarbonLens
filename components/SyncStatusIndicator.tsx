import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebaseSync } from '@/services/firebaseDataSync';
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
  const [syncStatus, setSyncStatus] = useState(firebaseSync.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const colors = getDynamicColors();

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(firebaseSync.getSyncStatus());
    }, 5000); // 每5秒更新一次狀態

    return () => clearInterval(interval);
  }, []);

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

    if (syncStatus.isOnline) {
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

    if (syncStatus.isOnline) {
      const lastSync = syncStatus.lastSyncTime 
        ? new Date(syncStatus.lastSyncTime).toLocaleString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })
        : '未知';
      return `已同步 ${lastSync}`;
    } else {
      return '離線模式';
    }
  };

  // 手動觸發同步
  const handleManualSync = async () => {
    if (!isLoggedIn) {
      Alert.alert('請先登入', '需要登入才能同步數據到雲端');
      return;
    }

    try {
      setIsSyncing(true);
      await firebaseSync.startAutoSync();
      Alert.alert('同步成功', '數據已同步到雲端');
    } catch (error) {
      console.error('手動同步失敗:', error);
      Alert.alert('同步失敗', '無法同步數據，請稍後重試');
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
          backgroundColor: syncStatus.isOnline ? '#10B981' : '#EF4444',
          marginLeft: 8,
        }}
      />
    </TouchableOpacity>
  );
};

// 簡化的同步狀態詳情組件
export const SyncStatusDetail: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState(firebaseSync.getSyncStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(firebaseSync.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadFromCloud = async () => {
    try {
      await firebaseSync.downloadFromCloud();
      Alert.alert('下載成功', '雲端數據已下載到本地');
    } catch (error) {
      Alert.alert('下載失敗', '無法從雲端下載數據');
    }
  };

  const handleToggleOfflineMode = async () => {
    try {
      if (syncStatus.isOnline) {
        await firebaseSync.setOfflineMode();
        Alert.alert('已切換到離線模式', '數據將暫停同步');
      } else {
        await firebaseSync.setOnlineMode();
        Alert.alert('已切換到在線模式', '數據將自動同步');
      }
    } catch (error) {
      Alert.alert('切換失敗', '無法切換同步模式');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        數據同步狀態
      </Text>
      
      <View style={{ marginBottom: 12 }}>
        <Text>登入狀態: {isLoggedIn ? '已登入' : '未登入'}</Text>
        <Text>同步狀態: {syncStatus.isOnline ? '在線' : '離線'}</Text>
        <Text>用戶ID: {syncStatus.userId || '無'}</Text>
        <Text>最後同步: {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : '從未同步'}</Text>
      </View>

      {isLoggedIn && (
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={handleDownloadFromCloud}
            style={{
              backgroundColor: '#3B82F6',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              從雲端下載數據
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleOfflineMode}
            style={{
              backgroundColor: syncStatus.isOnline ? '#EF4444' : '#10B981',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {syncStatus.isOnline ? '切換到離線模式' : '切換到在線模式'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SyncStatusIndicator; 