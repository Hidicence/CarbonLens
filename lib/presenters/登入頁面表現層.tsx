import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Dimensions,
  Animated 
} from 'react-native';
import { 使用多語言 } from '../hooks/使用多語言';
import { Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import SocialLoginButton from '@/components/SocialLoginButton';

// 獲取屏幕尺寸
const { width, height } = Dimensions.get('window');

interface 登入頁面表現層Props {
  // 數據和狀態
  email: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  isLoading: boolean;
  
  // 事件處理器
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onTogglePasswordVisibility: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
  onGuestLogin: () => void;
}

export function 登入頁面表現層({
  email,
  password,
  showPassword,
  rememberMe,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onTogglePasswordVisibility,
  onLogin,
  onRegister,
  onForgotPassword,
  onGoogleLogin,
  onAppleLogin,
  onGuestLogin
}: 登入頁面表現層Props) {
  // 獲取翻譯函數
  const t = 使用多語言();
  
  // 獲取主題
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  // 動畫相關的狀態和引用
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.97)).current;
  
  // 標記是否發生過動畫錯誤
  const [animationError, setAnimationError] = useState(false);
  
  // 頁面加載時的動畫效果
  useEffect(() => {
    try {
      if (animationError) return; // 如果之前有動畫錯誤，不再嘗試動畫
      
      // 添加一個延遲，然後啟動動畫
      const timer = setTimeout(() => {
        try {
          translateY.setValue(30);
          opacity.setValue(0.3); // 半透明而非完全透明
          cardScale.setValue(0.97); // 稍微縮小而非明顯縮小
          buttonOpacity.setValue(0); // 按鈕初始不可見
          buttonScale.setValue(0.97); // 按鈕初始縮小
          
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
              toValue: 1,
              tension: 40,
              friction: 7,
              useNativeDriver: true,
            })
          ]).start(() => {
            // 卡片動畫完成後再開始按鈕動畫
            Animated.parallel([
              Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(buttonScale, {
                toValue: 1,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
              })
            ]).start();
          });
        } catch (error) {
          console.error('動畫啟動錯誤:', error);
          setAnimationError(true);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('設置動畫錯誤:', error);
      setAnimationError(true);
    }
  }, [animationError, translateY, opacity, cardScale, buttonOpacity, buttonScale]);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 背景層 */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[
            isDarkMode ? '#0f172a' : '#f0f9ff', 
            isDarkMode ? '#1e293b' : '#e0f2fe'
          ]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.backgroundCircle1} />
        <View style={[styles.backgroundCircle2, { 
          backgroundColor: isDarkMode ? 'rgba(14, 165, 233, 0.05)' : 'rgba(14, 165, 233, 0.1)'
        }]} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 頂部Logo和標題 */}
          <Animated.View 
            style={[
              styles.logoContainer, 
              !animationError && {
                transform: [{ translateY }],
                opacity
              }
            ]}
          >
            <View style={styles.logoImageContainer}>
              <LinearGradient
                colors={[theme.gradientFrom || '#0f766e', theme.gradientTo || '#059669']}
                style={styles.logoBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1974' }} 
                  style={styles.logoImage as any}
                  resizeMode="cover"
                />
              </LinearGradient>
              <LinearGradient
                colors={['rgba(0,0,0,0)', isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)']}
                style={styles.logoOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>CarbonLens</Text>
            <Text style={[styles.appTagline, { color: theme.secondaryText }]}>
              {t('app.tagline')}
            </Text>
          </Animated.View>
          
          {/* 登入表單 */}
          <Animated.View 
            style={[
              styles.formContainer, 
              !animationError && { 
                transform: [{ scale: cardScale }],
                opacity
              }
            ]}
          >
            <LinearGradient
              colors={[
                isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)', 
                isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)'
              ]}
              style={styles.formBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.formTitle, { color: theme.text }]}>{t('auth.login')}</Text>
              
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: theme.border
                  }
                ]}>
                  <Mail size={20} color={theme.secondaryText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={t('auth.email')}
                    placeholderTextColor={theme.secondaryText}
                    value={email}
                    onChangeText={onEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: theme.border
                  }
                ]}>
                  <Lock size={20} color={theme.secondaryText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={t('auth.password')}
                    placeholderTextColor={theme.secondaryText}
                    value={password}
                    onChangeText={onPasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={onTogglePasswordVisibility} style={styles.eyeIcon}>
                    {showPassword ? (
                      <EyeOff size={20} color={theme.secondaryText} />
                    ) : (
                      <Eye size={20} color={theme.secondaryText} />
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.rememberForgotRow}>
                  <TouchableOpacity 
                    style={styles.rememberMeContainer}
                    onPress={() => onRememberMeChange(!rememberMe)}
                  >
                    <View style={[
                      styles.checkbox, 
                      { 
                        borderColor: theme.border,
                        backgroundColor: rememberMe ? theme.primary : 'transparent' 
                      }
                    ]}>
                      {rememberMe && (
                        <View style={styles.checkboxInner} />
                      )}
                    </View>
                    <Text style={[styles.rememberMeText, { color: theme.secondaryText }]}>
                      {t('auth.remember.me')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.forgotPasswordContainer}
                    onPress={onForgotPassword}
                  >
                    <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                      {t('auth.forgot.password')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Animated.View
                style={[
                  styles.buttonsContainer,
                  !animationError && {
                    opacity: buttonOpacity,
                    transform: [{ scale: buttonScale }]
                  }
                ]}
              >
                <Button
                  title={t('auth.login')}
                  onPress={onLogin}
                  loading={isLoading}
                  style={styles.loginButton}
                />
                
                <View style={styles.orContainer}>
                  <View style={[styles.orLine, { backgroundColor: theme.border }]} />
                  <Text style={[styles.orText, { color: theme.secondaryText }]}>{t('auth.or')}</Text>
                  <View style={[styles.orLine, { backgroundColor: theme.border }]} />
                </View>
                
                <View style={styles.socialButtonsContainer}>
                  <SocialLoginButton
                    provider="google"
                    onPress={onGoogleLogin}
                    style={styles.socialButton}
                  />
                  <SocialLoginButton
                    provider="apple"
                    onPress={onAppleLogin}
                    style={styles.socialButton}
                  />
                </View>
              </Animated.View>
              
              <View style={styles.registerContainer}>
                <Text style={[styles.registerText, { color: theme.secondaryText }]}>
                  {t('auth.no.account')}
                </Text>
                <TouchableOpacity onPress={onRegister}>
                  <Text style={[styles.registerLink, { color: theme.primary }]}>
                    {t('auth.register')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.guestLoginButton, { 
                  borderColor: theme.border,
                  backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.6)'
                }]}
                onPress={onGuestLogin}
              >
                <Text style={[styles.guestLoginText, { color: theme.secondaryText }]}>
                  {t('auth.continue.guest')}
                </Text>
                <ChevronRight size={16} color={theme.secondaryText} />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(56, 189, 248, 0.07)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    bottom: -width * 0.4,
    left: -width * 0.3,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  appTagline: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  formContainer: {
    width: '100%',
  },
  formBackground: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 0.48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  registerText: {
    fontSize: 14,
    marginRight: 4,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  guestLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  guestLoginText: {
    fontSize: 14,
    marginRight: 4,
  },
  buttonsContainer: {
    marginBottom: 24,
  },
}); 