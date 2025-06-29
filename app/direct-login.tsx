import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DirectLoginScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { 
    isLoggedIn, 
    user, 
    isAuthLoading, 
    login, 
    loginWithGoogle, 
    logout, 
    error 
  } = useAuthStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setDebugInfo(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  useEffect(() => {
    addDebugInfo('🚀 Direct Login 頁面載入');
    addDebugInfo(`📊 當前認證狀態: ${isLoggedIn ? '已登入' : '未登入'}`);
    addDebugInfo(`⏳ 認證載入中: ${isAuthLoading ? '是' : '否'}`);
    if (user) {
      addDebugInfo(`👤 當前用戶: ${user.email} (${user.provider})`);
    }
  }, [isLoggedIn, isAuthLoading, user]);

  // 清除所有認證狀態
  const clearAllAuthState = async () => {
    addDebugInfo('🧹 開始清除所有認證狀態...');
    
    try {
      // 1. 清除 Firebase 認證
      await logout();
      addDebugInfo('✅ Firebase 登出完成');
      
      // 2. 清除 AsyncStorage 中的 auth 相關數據
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => 
        key.includes('auth') || 
        key.includes('user') || 
        key.includes('login') ||
        key.includes('google')
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
        addDebugInfo(`✅ 清除 AsyncStorage keys: ${authKeys.join(', ')}`);
      }
      
      // 3. 強制重置 auth store 狀態
      useAuthStore.setState({
        isLoggedIn: false,
        user: null,
        isAuthLoading: false,
        error: null
      });
      
      addDebugInfo('✅ 認證狀態清除完成');
      Alert.alert('成功', '所有認證狀態已清除，請重新登入');
      
    } catch (error: any) {
      addDebugInfo(`❌ 清除認證狀態失敗: ${error.message}`);
      Alert.alert('錯誤', `清除失敗: ${error.message}`);
    }
  };

  // 測試帳號登入
  const testLogin = async () => {
    setIsLoading(true);
    addDebugInfo('🔐 開始測試帳號登入...');
    
    try {
      const success = await login('test@example.com', 'password');
      if (success) {
        addDebugInfo('✅ 測試帳號登入成功');
        Alert.alert('成功', '測試帳號登入成功！', [
          { text: '確定', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        addDebugInfo('❌ 測試帳號登入失敗');
      }
    } catch (error: any) {
      addDebugInfo(`❌ 測試帳號登入錯誤: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Google 登入
  const testGoogleLogin = async () => {
    setIsLoading(true);
    addDebugInfo('🔐 開始 Google 登入...');
    
    try {
      const success = await loginWithGoogle();
      if (success) {
        addDebugInfo('✅ Google 登入成功');
        Alert.alert('成功', 'Google 登入成功！', [
          { text: '確定', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        addDebugInfo('❌ Google 登入失敗');
      }
    } catch (error: any) {
      addDebugInfo(`❌ Google 登入錯誤: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 檢查 AsyncStorage 內容
  const checkAsyncStorage = async () => {
    addDebugInfo('🔍 檢查 AsyncStorage 內容...');
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      addDebugInfo(`📋 所有 keys: ${keys.length} 個`);
      
      for (const key of keys) {
        if (key.includes('auth') || key.includes('user') || key.includes('login')) {
          const value = await AsyncStorage.getItem(key);
          addDebugInfo(`🔑 ${key}: ${value ? '有數據' : '無數據'}`);
        }
      }
    } catch (error: any) {
      addDebugInfo(`❌ 檢查 AsyncStorage 失敗: ${error.message}`);
    }
  };

  const goToNormalLogin = () => {
    router.push('/login');
  };

  const goToGoogleTest = () => {
    router.push('/test-google-login');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20 }}>
      {/* 標題 */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Ionicons name="key" size={60} color="#4CAF50" />
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>
          直接登入測試
        </Text>
        <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginTop: 5 }}>
          繞過路由重定向的登入測試頁面
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
          當前認證狀態
        </Text>
        <Text style={{ color: isLoggedIn ? '#4CAF50' : '#FF5722', fontSize: 14, marginBottom: 5 }}>
          登入狀態: {isLoggedIn ? '✅ 已登入' : '❌ 未登入'}
        </Text>
        <Text style={{ color: '#888', fontSize: 12, marginBottom: 5 }}>
          載入中: {isAuthLoading ? '是' : '否'}
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

      {/* 操作按鈕 */}
      <View style={{ marginBottom: 20 }}>
        {/* 清除認證狀態 */}
        <TouchableOpacity
          style={{
            backgroundColor: '#FF5722',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10
          }}
          onPress={clearAllAuthState}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            🧹 清除所有認證狀態
          </Text>
        </TouchableOpacity>

        {/* 測試帳號登入 */}
        <TouchableOpacity
          style={{
            backgroundColor: '#2196F3',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            opacity: isLoading ? 0.6 : 1
          }}
          onPress={testLogin}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {isLoading ? '登入中...' : '🔐 測試帳號登入'}
          </Text>
        </TouchableOpacity>

        {/* Google 登入 */}
        <TouchableOpacity
          style={{
            backgroundColor: '#4285F4',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            opacity: isLoading ? 0.6 : 1
          }}
          onPress={testGoogleLogin}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {isLoading ? '登入中...' : '🔐 Google 登入'}
          </Text>
        </TouchableOpacity>

        {/* 檢查儲存 */}
        <TouchableOpacity
          style={{
            backgroundColor: '#9C27B0',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10
          }}
          onPress={checkAsyncStorage}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            🔍 檢查本地儲存
          </Text>
        </TouchableOpacity>

        {/* 導航按鈕 */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#4CAF50',
              padding: 15,
              borderRadius: 10
            }}
            onPress={goToNormalLogin}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              📱 正常登入頁
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#FF9800',
              padding: 15,
              borderRadius: 10
            }}
            onPress={goToGoogleTest}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              🧪 Google 測試
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 調試日誌 */}
      <View style={{ 
        backgroundColor: '#2a2a2a', 
        padding: 15, 
        borderRadius: 10,
        minHeight: 200
      }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          調試日誌
        </Text>
        <ScrollView style={{ maxHeight: 300 }}>
          {debugInfo.map((info, index) => (
            <Text 
              key={index} 
              style={{ 
                color: '#ccc', 
                fontSize: 12, 
                marginBottom: 5,
                fontFamily: 'monospace'
              }}
            >
              {info}
            </Text>
          ))}
          {debugInfo.length === 0 && (
            <Text style={{ color: '#888', fontSize: 12, fontStyle: 'italic' }}>
              暫無調試信息...
            </Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  navButtons: {
    gap: 12,
  },
  navButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 