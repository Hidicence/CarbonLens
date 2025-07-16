import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';
import { Mail, Lock, Eye, EyeOff, Film, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  console.log('LoginScreen 開始執行');
  
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log('router 已初始化, params:', params);
  
  const { isDarkMode } = useThemeStore();
  console.log('themeStore 已載入, isDarkMode:', isDarkMode);
  
  const { login, loginWithGoogle, logout, isLoading, error, clearError, isLoggedIn } = useAuthStore();
  console.log('authStore 已載入, isLoading:', isLoading, 'isLoggedIn:', isLoggedIn);
  
  const theme = isDarkMode ? Colors.dark : Colors.light;
  console.log('theme 已計算:', theme.background);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [hasProcessedParams, setHasProcessedParams] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // 處理 URL 參數的強制登出（只執行一次）
  useEffect(() => {
    if (!hasProcessedParams && (params.logout === 'true' || params.force === 'true')) {
      console.log('檢測到強制登出參數，執行登出...');
      setHasProcessedParams(true);
      
      const executeLogout = async () => {
        try {
          await logout();
          console.log('URL 參數強制登出完成');
        } catch (error) {
          console.error('URL 參數強制登出失敗:', error);
        }
      };
      
      executeLogout();
    }
  }, [params.logout, params.force, hasProcessedParams, logout]);

  // 檢查是否需要顯示登出對話框（只檢查一次）
  useEffect(() => {
    if (!hasProcessedParams && isLoggedIn && !params.logout && !params.force) {
      console.log('用戶已登入但訪問登入頁面，顯示選項對話框...');
      setShowLogoutDialog(true);
      setHasProcessedParams(true);
    }
  }, [isLoggedIn, hasProcessedParams, params.logout, params.force]);

  // 顯示登出選項對話框
  useEffect(() => {
    if (showLogoutDialog) {
      Alert.alert(
        '已登入',
        '您目前已經登入，是否要登出並重新登入？',
        [
          {
            text: '返回主頁',
            onPress: () => {
              setShowLogoutDialog(false);
      router.replace('/(tabs)');
            },
            style: 'cancel'
          },
          {
            text: '登出重新登入',
            onPress: async () => {
              setShowLogoutDialog(false);
              console.log('用戶選擇登出重新登入');
              try {
                await logout();
                console.log('手動登出完成');
              } catch (error) {
                console.error('手動登出失敗:', error);
              }
            }
          }
        ]
      );
    }
  }, [showLogoutDialog, logout, router]);

  // 清除錯誤（只執行一次）
  useEffect(() => {
    console.log('LoginScreen 掛載，清除錯誤');
    if (clearError) {
      clearError();
    }
  }, []);

  const handleLogin = async () => {
    console.log('登入按鈕被點擊');
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('錯誤', '請輸入電子郵件和密碼');
      return;
    }

    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        console.log('登入成功，導航到主頁面');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('登入失敗:', error);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('Google 登入按鈕被點擊');
    try {
      const success = await loginWithGoogle();
      if (success) {
        console.log('Google 登入成功，導航到主頁面');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Google 登入失敗:', error);
    }
  };

  const handleGuestLogin = async () => {
    console.log('訪客登入被點擊');
    Alert.alert(
      '訪客模式', 
      '訪客模式僅供體驗使用，數據不會保存。建議註冊帳戶以完整使用功能。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '繼續', 
          onPress: async () => {
            try {
              const success = await login('guest@example.com', 'guest123', false);
              if (success) {
                console.log('訪客登入成功，導航到主頁面');
                router.replace('/(tabs)');
              }
            } catch (error) {
              console.error('訪客登入失敗:', error);
            }
          }
        }
      ]
    );
  };

  // 如果用戶已登入且沒有強制登出參數，並且已經處理過參數，直接跳轉
  if (isLoggedIn && hasProcessedParams && !params.logout && !params.force && !showLogoutDialog) {
    console.log('用戶已登入，直接跳轉到主頁面');
    router.replace('/(tabs)');
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 背景漸層 */}
          <LinearGradient
            colors={[theme.primary + '15', theme.background]}
            style={styles.backgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Logo 和標題區域 */}
          <View style={styles.headerContainer}>
            <View style={[styles.logoContainer, { backgroundColor: theme.primary + '20' }]}>
              <Film size={32} color={theme.primary} />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>CarbonLens</Text>
            <Text style={[styles.tagline, { color: theme.secondaryText }]}>
              專為影視製作行業設計的碳足跡追蹤與管理工具
            </Text>
          </View>

          {/* 登入表單 */}
          <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>歡迎回來</Text>
            <Text style={[styles.formSubtitle, { color: theme.secondaryText }]}>
              請登入您的帳戶以繼續使用
            </Text>
            

            {/* 電子郵件輸入 */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.background, 
                borderColor: theme.border 
              }]}>
                <Mail size={20} color={theme.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="電子郵件"
                  placeholderTextColor={theme.secondaryText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 密碼輸入 */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.background, 
                borderColor: theme.border 
              }]}>
                <Lock size={20} color={theme.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.text, flex: 1 }]}
                  placeholder="密碼"
                  placeholderTextColor={theme.secondaryText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.secondaryText} />
                  ) : (
                    <Eye size={20} color={theme.secondaryText} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 記住我選項 */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, { 
                  backgroundColor: rememberMe ? theme.primary : theme.background,
                  borderColor: rememberMe ? theme.primary : theme.border 
                }]}>
                  {rememberMe && <Check size={12} color="white" />}
                </View>
                <Text style={[styles.rememberMeText, { color: theme.secondaryText }]}>記住我</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={[styles.forgotPassword, { color: theme.primary }]}>忘記密碼?</Text>
              </TouchableOpacity>
            </View>

            {/* 登入按鈕 */}
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: theme.primary }]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>登入</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* 分隔線 */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.secondaryText }]}>或</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>
            
            {/* 其他登入方式 */}
            <View style={styles.socialLoginContainer}>
              <TouchableOpacity 
                style={[styles.googleButton, { 
                  backgroundColor: '#4285F4',
                  borderColor: '#4285F4'
                }]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={24} color="white" />
                <Text style={[styles.googleButtonText]}>使用 Google 登入</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={handleGuestLogin}
                disabled={isLoading}
              >
                <Ionicons name="person-circle-outline" size={24} color={theme.text} />
                <Text style={[styles.socialButtonText, { color: theme.text }]}>訪客體驗</Text>
              </TouchableOpacity>
            </View>

            {/* 錯誤顯示 */}
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: '#FF3B30' + '20', borderColor: '#FF3B30' }]}>
                <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
              </View>
            )}
          </View>

          {/* 註冊提示 */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: theme.secondaryText }]}>
              還沒有帳號？{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.registerLink, { color: theme.primary }]}>立即註冊</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.6,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialLoginContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  testInfo: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  testInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  testInfoText: {
    fontSize: 12,
    lineHeight: 16,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  errorText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});