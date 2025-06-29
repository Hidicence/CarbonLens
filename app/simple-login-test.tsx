import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';

export default function SimpleLoginTestScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { login, isLoading, error, user, isLoggedIn } = useAuthStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicLogin = async () => {
    addResult('開始測試基本登入...');
    
    try {
      const success = await login('test@example.com', 'password', false);
      if (success) {
        addResult('✅ 基本登入成功');
        addResult('🚀 準備導航到主頁面...');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } else {
        addResult('❌ 基本登入失敗');
      }
    } catch (error: any) {
      addResult(`❌ 基本登入錯誤: ${error.message}`);
    }
  };

  const testGuestLogin = async () => {
    addResult('開始測試訪客登入...');
    
    try {
      const success = await login('guest@example.com', 'guest123', false);
      if (success) {
        addResult('✅ 訪客登入成功');
        addResult('🚀 準備導航到主頁面...');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } else {
        addResult('❌ 訪客登入失敗');
      }
    } catch (error: any) {
      addResult(`❌ 訪客登入錯誤: ${error.message}`);
    }
  };

  const testCurrentUser = async () => {
    addResult('檢查當前用戶狀態...');
    
    try {
      const { user, isLoggedIn } = useAuthStore.getState();
      addResult(`當前登入狀態: ${isLoggedIn ? '已登入' : '未登入'}`);
      if (user) {
        addResult(`當前用戶: ${user.email} (${user.name})`);
        addResult(`用戶ID: ${user.id}`);
        addResult(`認證方式: ${user.provider}`);
      } else {
        addResult('無用戶資訊');
      }
    } catch (error: any) {
      addResult(`❌ 檢查用戶狀態錯誤: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const goToMainApp = () => {
    router.replace('/(tabs)');
  };

  const testLogout = async () => {
    addResult('開始測試登出...');
    
    try {
      const { logout } = useAuthStore.getState();
      await logout();
      addResult('✅ 登出成功');
    } catch (error: any) {
      addResult(`❌ 登出錯誤: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>簡單登入測試</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          測試基本登入功能，確保認證系統正常工作
        </Text>

        {/* 狀態顯示 */}
        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statusTitle, { color: theme.text }]}>當前狀態</Text>
          <Text style={[styles.statusText, { color: theme.secondaryText }]}>
            登入狀態: {isLoggedIn ? '✅ 已登入' : '❌ 未登入'}
          </Text>
          <Text style={[styles.statusText, { color: theme.secondaryText }]}>
            用戶: {user?.email || '無'}
          </Text>
          <Text style={[styles.statusText, { color: theme.secondaryText }]}>
            載入中: {isLoading ? '是' : '否'}
          </Text>
          {error && (
            <Text style={[styles.errorText, { color: '#FF3B30' }]}>
              錯誤: {error}
            </Text>
          )}
        </View>

        {/* 測試按鈕 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={testBasicLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>測試基本登入</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#34C759' }]}
            onPress={testGuestLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>測試訪客登入</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#FF9500' }]}
            onPress={testCurrentUser}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>檢查當前用戶</Text>
          </TouchableOpacity>

          {isLoggedIn && (
            <>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#007AFF' }]}
                onPress={goToMainApp}
              >
                <Text style={styles.buttonText}>進入主應用</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#8E8E93' }]}
                onPress={testLogout}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>測試登出</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#FF3B30' }]}
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>清除結果</Text>
          </TouchableOpacity>
        </View>

        {/* 測試結果 */}
        <View style={[styles.resultsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statusTitle, { color: theme.text }]}>測試結果</Text>
          {testResults.length === 0 ? (
            <Text style={[styles.statusText, { color: theme.secondaryText }]}>
              點擊上方按鈕開始測試
            </Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={[styles.resultText, { color: theme.text }]}>
                {result}
              </Text>
            ))
          )}
        </View>

        {/* 導航按鈕 */}
        <View style={styles.navSection}>
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/direct-login')}
          >
            <Text style={[styles.navButtonText, { color: theme.text }]}>
              直接登入頁面
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.navButtonText, { color: theme.text }]}>
              正常登入頁面
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  buttonSection: {
    marginBottom: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 150,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  navSection: {
    gap: 8,
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 