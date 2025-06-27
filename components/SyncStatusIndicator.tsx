import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStore } from '@/store/syncStore';
import { SyncStatus } from '@/services/syncManager';
import { getDynamicColors } from '@/constants/colors';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  onPress?: () => void;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ 
  showDetails = false, 
  onPress 
}) => {
  const {
    syncStatus,
    lastSyncResult,
    isSyncing,
    syncProgress,
    isConnectedToServer,
    startSync,
    getSyncStatus
  } = useSyncStore();

  const [syncStatusInfo, setSyncStatusInfo] = useState(getSyncStatus());
  const colors = getDynamicColors();

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatusInfo(getSyncStatus());
    }, 5000); // 每5秒更新一次

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

    switch (syncStatus) {
      case SyncStatus.SUCCESS:
        return { 
          name: 'checkmark-circle' as const, 
          color: '#10B981' 
        };
      case SyncStatus.ERROR:
        return { 
          name: 'warning' as const, 
          color: '#EF4444' 
        };
      case SyncStatus.OFFLINE:
        return { 
          name: 'cloud-offline' as const, 
          color: '#6B7280' 
        };
      default:
        return { 
          name: 'cloud' as const, 
          color: '#6B7280' 
        };
    }
  };

  // 獲取狀態文字
  const getStatusText = () => {
    if (isSyncing) {
      return `同步中... ${syncProgress}%`;
    }

    switch (syncStatus) {
      case SyncStatus.SUCCESS:
        const lastSync = syncStatusInfo.lastSyncTime 
          ? new Date(syncStatusInfo.lastSyncTime).toLocaleString('zh-TW', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })
          : '未知';
        return `已同步 ${lastSync}`;
      case SyncStatus.ERROR:
        return lastSyncResult?.message || '同步失敗';
      case SyncStatus.OFFLINE:
        return '離線模式';
      default:
        return '等待同步';
    }
  };

  // 手動觸發同步
  const handleManualSync = async () => {
    try {
      const result = await startSync(true);
      
      if (result.status === SyncStatus.SUCCESS) {
        Alert.alert('同步成功', '數據已更新到最新版本');
      } else if (result.status === SyncStatus.OFFLINE) {
        Alert.alert('網絡連接失敗', '請檢查網絡設置後重試');
      } else {
        Alert.alert('同步失敗', result.message);
      }
    } catch (error) {
      Alert.alert('同步錯誤', '無法執行同步操作');
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
          backgroundColor: isConnectedToServer ? '#10B981' : '#EF4444',
          marginLeft: 8,
        }}
      />
    </TouchableOpacity>
  );
};

// 同步狀態詳情組件
export const SyncStatusDetail: React.FC = () => {
  const {
    syncStatus,
    lastSyncResult,
    isSyncing,
    syncProgress,
    isConnectedToServer,
    syncConfig,
    startSync,
    updateSyncConfig,
    getSyncStatus
  } = useSyncStore();

  const [syncStatusInfo, setSyncStatusInfo] = useState(getSyncStatus());
  const colors = getDynamicColors();

  useEffect(() => {
    setSyncStatusInfo(getSyncStatus());
  }, [lastSyncResult]);

  const handleToggleAutoSync = async () => {
    await updateSyncConfig({
      autoSync: !syncConfig.autoSync
    });
  };

  const handleChangeSyncInterval = () => {
    Alert.prompt(
      '設定同步間隔',
      '請輸入自動同步間隔（分鐘）',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async (value) => {
            const interval = parseInt(value || '15');
            if (interval > 0) {
              await updateSyncConfig({ syncInterval: interval });
            }
          }
        }
      ],
      'plain-text',
      syncConfig.syncInterval.toString()
    );
  };

  return (
    <View style={{ padding: 16, backgroundColor: '#1F2937', borderRadius: 12 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        數據同步狀態
      </Text>

      {/* 當前狀態 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#9CA3AF', fontSize: 14 }}>狀態：</Text>
        <SyncStatusIndicator showDetails={true} />
      </View>

      {/* 連接狀態 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#9CA3AF', fontSize: 14 }}>服務器連接：</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 8,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isConnectedToServer ? '#10B981' : '#EF4444',
              marginRight: 4,
            }}
          />
          <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
            {isConnectedToServer ? '已連接' : '未連接'}
          </Text>
        </View>
      </View>

      {/* 最後同步時間 */}
      {syncStatusInfo.lastSyncTime && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>最後同步：</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, marginLeft: 8 }}>
            {new Date(syncStatusInfo.lastSyncTime).toLocaleString('zh-TW')}
          </Text>
        </View>
      )}

      {/* 同步進度 */}
      {isSyncing && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 4 }}>
            同步進度：{syncProgress}%
          </Text>
          <View
            style={{
              height: 4,
              backgroundColor: '#374151',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
                          <View
                style={{
                  height: '100%',
                  width: `${syncProgress}%`,
                  backgroundColor: colors.primary,
                }}
              />
          </View>
        </View>
      )}

      {/* 自動同步設置 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <TouchableOpacity
          onPress={handleToggleAutoSync}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
          }}
        >
          <Ionicons
            name={syncConfig.autoSync ? 'checkbox' : 'square-outline'}
            size={20}
            color={syncConfig.autoSync ? colors.primary : '#9CA3AF'}
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: '#FFFFFF', fontSize: 14 }}>自動同步</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleChangeSyncInterval}
          style={{
            padding: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
            間隔：{syncConfig.syncInterval}分鐘
          </Text>
        </TouchableOpacity>
      </View>

      {/* 手動同步按鈕 */}
      <TouchableOpacity
        onPress={() => startSync(true)}
        disabled={isSyncing}
        style={{
          backgroundColor: isSyncing ? '#6B7280' : colors.primary,
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
          {isSyncing ? '同步中...' : '立即同步'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SyncStatusIndicator; 