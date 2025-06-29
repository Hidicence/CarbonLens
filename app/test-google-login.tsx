import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { GoogleSignInService } from '@/services/googleSignInService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TestGoogleLoginScreen() {
  const router = useRouter();
  const { loginWithGoogle, user, isLoggedIn, logout, error } = useAuthStore();
  const [testLog, setTestLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setTestLog(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  useEffect(() => {
    addLog('🚀 Google 登入測試頁面已載入');
    addLog(`📱 平台: ${Platform.OS}`);
    
    // 檢查 Google Sign-In 配置狀態
    if (Platform.OS !== 'web') {
      const config = GoogleSignInService.getConfigurationStatus();
      addLog(`⚙️ Google Sign-In 配置狀態: ${JSON.stringify(config, null, 2)}`);
    }
  }, []);

  const testGoogleSignIn = async () => {
    setIsLoading(true);
    addLog('🔐 開始測試 Google 登入...');
    
    try {
      const success = await loginWithGoogle();
      if (success) {
        addLog('✅ Google 登入測試成功！');
      } else {
        addLog('❌ Google 登入測試失敗');
      }
    } catch (error: any) {
      addLog(`❌ Google 登入錯誤: ${error.message}`);
      addLog(`錯誤詳情: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleSignOut = async () => {
    addLog('🚪 開始測試登出...');
    
    try {
      await logout();
      addLog('✅ 登出測試成功！');
    } catch (error: any) {
      addLog(`❌ 登出錯誤: ${error.message}`);
    }
  };

  const testCurrentUser = async () => {
    addLog('👤 檢查當前用戶狀態...');
    
    if (Platform.OS !== 'web') {
      try {
        const currentUser = await GoogleSignInService.getCurrentUser();
        addLog(`Google 當前用戶: ${JSON.stringify(currentUser?.data?.user, null, 2)}`);
      } catch (error: any) {
        addLog(`❌ 獲取 Google 用戶失敗: ${error.message}`);
      }
    }
    
    addLog(`Firebase 當前用戶: ${JSON.stringify(user, null, 2)}`);
    addLog(`登入狀態: ${isLoggedIn ? '已登入' : '未登入'}`);
  };

  const clearLogs = () => {
    setTestLog([]);
    addLog('🧹 日誌已清空');
  };

  const goToMainApp = () => {
    if (isLoggedIn) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('提示', '請先登入再進入主應用');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20 }}>
      {/* 標題 */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Ionicons name="logo-google" size={60} color="#4285F4" />
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>
          Google 登入測試
        </Text>
        <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginTop: 5 }}>
          測試 APP 端與網頁版的 Google 登入同步
        </Text>
      </View>

      {/* 當前狀態 */}
      <View style={{ 
        backgroundColor: '#2a2a2a', 
        padding: 15, 
        borderRadius: 10, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isLoggedIn ? '#4CAF50' : '#FF5722'
      }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          當前狀態
        </Text>
        <Text style={{ color: isLoggedIn ? '#4CAF50' : '#FF5722', fontSize: 14 }}>
          {isLoggedIn ? '✅ 已登入' : '❌ 未登入'}
        </Text>
        {user && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: '#888', fontSize: 12 }}>用戶信息:</Text>
            <Text style={{ color: 'white', fontSize: 14 }}>{user.name}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{user.email}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>提供者: {user.provider}</Text>
          </View>
        )}
        {error && (
          <Text style={{ color: '#FF5722', fontSize: 12, marginTop: 10 }}>
            錯誤: {error}
          </Text>
        )}
      </View>

      {/* 測試按鈕 */}
      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#4285F4',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            opacity: isLoading ? 0.6 : 1
          }}
          onPress={testGoogleSignIn}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {isLoading ? '登入中...' : '🔐 測試 Google 登入'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#FF5722',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10
          }}
          onPress={testGoogleSignOut}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            🚪 測試登出
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#2196F3',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10
          }}
          onPress={testCurrentUser}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            👤 檢查用戶狀態
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#4CAF50',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10
          }}
          onPress={goToMainApp}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            🏠 進入主應用
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#9E9E9E',
            padding: 10,
            borderRadius: 10
          }}
          onPress={clearLogs}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            🧹 清空日誌
          </Text>
        </TouchableOpacity>
      </View>

      {/* 測試日誌 */}
      <View style={{ 
        backgroundColor: '#2a2a2a', 
        padding: 15, 
        borderRadius: 10,
        minHeight: 200
      }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          測試日誌
        </Text>
        <ScrollView style={{ maxHeight: 300 }}>
          {testLog.map((log, index) => (
            <Text 
              key={index} 
              style={{ 
                color: '#ccc', 
                fontSize: 12, 
                marginBottom: 5,
                fontFamily: 'monospace'
              }}
            >
              {log}
            </Text>
          ))}
          {testLog.length === 0 && (
            <Text style={{ color: '#888', fontSize: 12, fontStyle: 'italic' }}>
              暫無日誌...
            </Text>
          )}
        </ScrollView>
      </View>

      {/* 返回按鈕 */}
      <TouchableOpacity
        style={{
          backgroundColor: '#333',
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
          marginBottom: 40
        }}
        onPress={() => router.back()}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          ← 返回
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
} 