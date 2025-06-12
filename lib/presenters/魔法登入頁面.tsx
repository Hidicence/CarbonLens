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
  Animated,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { 使用多語言 } from '../hooks/使用多語言';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, Film, Video, Camera, Clapperboard, Play, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import { getDynamicColors } from '@/constants/colors';
import SocialLoginButton from '@/components/SocialLoginButton';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Haptics from 'expo-haptics';

// 獲取屏幕尺寸
const { width, height } = Dimensions.get('window');

interface 魔法登入頁面Props {
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

export function 魔法登入頁面({
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
}: 魔法登入頁面Props) {
  // 獲取翻譯函數
  const t = 使用多語言();
  
  // 獲取主題
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const dynamicTheme = getDynamicColors(); // 获取动态颜色
  
  // 電影元素的動畫參數
  const [filmElements, setFilmElements] = useState<{x: number, y: number, type: string, rotation: number, size: number, opacity: number}[]>([]);
  
  // 動畫相關的狀態和引用
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(100)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const formScale = useRef(new Animated.Value(0.95)).current;
  const buttonTranslateX = useRef(new Animated.Value(50)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const socialTranslateY = useRef(new Animated.Value(30)).current;
  const socialOpacity = useRef(new Animated.Value(0)).current;
  
  // 轉場動畫 - 類似電影片場的快門效果
  const shutterOpacity = useRef(new Animated.Value(1)).current;
  const clappingAnim = useRef(new Animated.Value(0)).current;
  
  // 輸入焦點狀態
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // 處理按鈕點擊時的觸覺反饋
  const handleButtonPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLogin();
  };
  
  // 處理社交登入按鈕點擊
  const handleSocialButtonPress = (type: 'google' | 'apple') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (type === 'google') {
      onGoogleLogin();
    } else {
      onAppleLogin();
    }
  };
  
  // 生成電影相關視覺元素
  useEffect(() => {
    const elements = [];
    const elementTypes = ['film', 'camera', 'video', 'clapperboard'];
    
    for (let i = 0; i < 10; i++) {
      elements.push({
        x: Math.random() * width,
        y: Math.random() * height,
        type: elementTypes[Math.floor(Math.random() * elementTypes.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 12 + 16,
        opacity: Math.random() * 0.2 + 0.1
      });
    }
    
    setFilmElements(elements);
    
    // 設置動畫
    const interval = setInterval(() => {
      setFilmElements(prevElements => 
        prevElements.map(element => ({
          ...element,
          rotation: (element.rotation + 0.3) % 360,
          opacity: element.opacity > 0.3 ? 0.1 : element.opacity + 0.001
        }))
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // 電影打板動畫
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(clappingAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(clappingAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          delay: 5000
        })
      ])
    ).start();
  }, []);
  
  // 頁面加載時的動畫效果
  useEffect(() => {
    // 快門動畫 - 模擬攝像機快門效果
    Animated.timing(shutterOpacity, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start();
    
    // 序列化動畫 - 先logo，再卡片，最後按鈕和社交登入
    Animated.sequence([
      // 背景和標題動畫
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]),
      
      // 表單卡片動畫
      Animated.parallel([
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(formScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]),
      
      // 按鈕和社交登入動畫
      Animated.parallel([
        Animated.timing(buttonTranslateX, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(socialTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(socialOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(5, 30, 20, 1)' : 'rgba(235, 250, 245, 1)' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content" } />
      
      {/* 快門動畫效果 */}
      <Animated.View 
        style={[
          styles.shutterOverlay,
          {
            backgroundColor: theme.background,
            opacity: shutterOpacity
          }
        ]}
        pointerEvents="none"
      >
        <View style={[styles.shutterRing, { borderColor: dynamicTheme.primary }]}>
          <View style={[styles.shutterInner, { backgroundColor: dynamicTheme.secondary }]} />
        </View>
      </Animated.View>
      
      {/* 背景 - 影視製作風格 */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000' }}
        style={[styles.backgroundImage, { zIndex: -1 }]}
        blurRadius={isDarkMode ? 12 : 5}
      >
        <View style={[styles.overlay, { 
          backgroundColor: isDarkMode ? 'rgba(15, 42, 29, 0.9)' : 'rgba(240, 250, 245, 0.85)',
          zIndex: -1
        }]} />
        
        {/* 背景中的電影元素 */}
        {filmElements.map((element, index) => (
          <Animated.View 
            key={`film-element-${index}`}
            style={[
              styles.filmElement,
              {
                left: element.x,
                top: element.y,
                opacity: element.opacity,
                transform: [{ rotate: `${element.rotation}deg` }],
                zIndex: -1
              }
            ]}
            pointerEvents="none"
          >
            {element.type === 'film' && <Film size={element.size} color={isDarkMode ? '#94a3b8' : '#334155'} />}
            {element.type === 'camera' && <Camera size={element.size} color={isDarkMode ? '#64748b' : '#475569'} />}
            {element.type === 'video' && <Video size={element.size} color={isDarkMode ? '#475569' : '#1e293b'} />}
            {element.type === 'clapperboard' && <Clapperboard size={element.size} color={isDarkMode ? '#334155' : '#0f172a'} />}
          </Animated.View>
        ))}
        
        {/* 電影打板動畫 */}
        <Animated.View
          style={[
            styles.clapperboardContainer,
            {
              transform: [
                { translateY: clappingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20]
                }) }
              ],
              zIndex: -1
            }
          ]}
          pointerEvents="none"
        >
          <Clapperboard size={60} color={isDarkMode ? '#f8fafc' : '#0f172a'} style={{ opacity: 0.15 }} />
        </Animated.View>
      </ImageBackground>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 頂部標題 */}
          <Animated.View 
            style={[
              styles.headerContainer, 
              {
                transform: [
                  { translateY },
                  { scale: logoScale }
                ],
                opacity
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircleFrame}>
                <Image 
                  source={{ uri: 'https://i.imgur.com/AHr8iYz.png' }}
                  style={styles.logoImage}
                />
              </View>
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={[styles.appTagline, { color: theme.secondaryText }]}>
                {t('app.tagline')}
              </Text>
            </View>
          </Animated.View>
          
          {/* 登入表單 */}
          <Animated.View 
            style={[
              styles.formContainer, 
              {
                opacity: cardOpacity,
                transform: [
                  { translateY: cardTranslateY },
                  { scale: formScale }
                ]
              }
            ]}
          >
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={isDarkMode ? 40 : 60}
                tint={isDarkMode ? 'dark' : 'light'}
                style={styles.formBlur}
              >
                <View style={styles.formInner}>
                  {renderFormContent()}
                </View>
              </BlurView>
            ) : (
              <View style={[styles.formCard, { 
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: `rgba(${dynamicTheme.primary.replace('#', '')}, 0.2)`
              }]}>
                {renderFormContent()}
              </View>
            )}
          </Animated.View>
          
          {/* 底部註冊提示 */}
          <Animated.View 
            style={[
              styles.registerContainer,
              {
                opacity: socialOpacity,
                transform: [{ translateY: socialTranslateY }],
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.8)',
                borderWidth: 1,
                borderColor: `rgba(${dynamicTheme.primary.replace('#', '')}, 0.2)`,
              }
            ]}
          >
            <Text style={[styles.registerText, { color: theme.text }]}>
              {t('auth.no.account')}
            </Text>
            <TouchableOpacity 
              onPress={onRegister}
              style={styles.registerButton}
            >
              <LinearGradient
                colors={[dynamicTheme.primary, dynamicTheme.secondary, isDarkMode ? '#0f766e' : '#047857']}
                style={styles.registerButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.registerButtonText}>
                  {t('auth.register')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          {/* 訪客登入 */}
          <Animated.View
            style={[
              styles.guestLoginContainer,
              {
                opacity: socialOpacity,
                transform: [{ translateY: socialTranslateY }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.guestButton, { 
                borderColor: `rgba(${dynamicTheme.primary.replace('#', '')}, 0.2)`,
              }]}
              onPress={onGuestLogin}
            >
              <Text style={[styles.guestText, { color: theme.secondaryText }]}>
                {t('auth.continue.guest')}
              </Text>
              <User size={16} color={theme.secondaryText} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
  
  // 表單內容渲染函數
  function renderFormContent() {
    return (
      <>
        <Text style={[styles.formTitle, { color: theme.text }]}>
          {t('auth.login')}
        </Text>
        
        <View style={styles.inputsContainer}>
          <View style={[
            styles.inputWrapper, 
            { 
              borderColor: emailFocused ? dynamicTheme.primary : theme.border,
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
              transform: [{ translateY: emailFocused ? -5 : 0 }],
            }
          ]}>
            <Mail 
              size={20} 
              color={emailFocused ? dynamicTheme.primary : theme.secondaryText} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t('auth.email')}
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
          
          <View style={[
            styles.inputWrapper, 
            { 
              borderColor: passwordFocused ? dynamicTheme.primary : theme.border,
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
              transform: [{ translateY: passwordFocused ? -5 : 0 }],
            }
          ]}>
            <Lock 
              size={20} 
              color={passwordFocused ? dynamicTheme.primary : theme.secondaryText} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t('auth.password')}
              placeholderTextColor={theme.secondaryText}
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity 
              onPress={onTogglePasswordVisibility} 
              style={styles.eyeIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff size={20} color={theme.secondaryText} />
              ) : (
                <Eye size={20} color={theme.secondaryText} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.rememberForgotRow}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => onRememberMeChange(!rememberMe)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[
              styles.checkbox, 
              { 
                borderColor: rememberMe ? dynamicTheme.primary : theme.border,
                backgroundColor: rememberMe ? dynamicTheme.primary : 'transparent',
              }
            ]}>
              {rememberMe && (
                <Check size={12} color="#fff" />
              )}
            </View>
            <Text style={[styles.rememberMeText, { color: theme.secondaryText }]}>
              {t('auth.remember.me')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={onForgotPassword}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.forgotPasswordText, { color: dynamicTheme.primary }]}>
              {t('auth.forgot.password')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 登入按鈕 */}
        <Animated.View style={[
          styles.loginButtonContainer,
          {
            opacity: buttonOpacity,
            transform: [{ translateX: buttonTranslateX }]
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.loginButton, 
              isLoading && styles.loginButtonDisabled
            ]}
            onPress={handleButtonPress}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[dynamicTheme.primary, dynamicTheme.secondary, isDarkMode ? '#0f766e' : '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              {isLoading ? (
                <Animated.View 
                  style={[
                    styles.loaderContainer,
                    {
                      transform: [{
                        rotate: socialOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }
                  ]}
                >
                  <Play size={20} color="#fff" />
                </Animated.View>
              ) : (
                <View style={styles.loginButtonContent}>
                  <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
                  <ArrowRight size={18} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        
        {/* 社交登入分隔線 */}
        <Animated.View
          style={[
            styles.dividerContainer,
            {
              opacity: socialOpacity,
              transform: [{ translateY: socialTranslateY }]
            }
          ]}
        >
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.secondaryText }]}>
            {t('auth.or')}
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </Animated.View>
        
        {/* 社交登入按鈕 */}
        <Animated.View
          style={[
            styles.socialButtonsContainer,
            {
              opacity: socialOpacity,
              transform: [{ translateY: socialTranslateY }]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.socialButton, { 
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#fff',
              borderColor: `rgba(${dynamicTheme.primary.replace('#', '')}, 0.2)`
            }]}
            onPress={() => handleSocialButtonPress('google')}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={[styles.socialText, { color: theme.text }]}>Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.socialButton, { 
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#fff',
              borderColor: `rgba(${dynamicTheme.primary.replace('#', '')}, 0.2)`
            }]}
            onPress={() => handleSocialButtonPress('apple')}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: isDarkMode ? 
                'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_white.svg' : 
                'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' 
              }} 
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={[styles.socialText, { color: theme.text }]}>Apple</Text>
          </TouchableOpacity>
        </Animated.View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  shutterOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  shutterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  filmElement: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
    pointerEvents: 'none',
  },
  clapperboardContainer: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    zIndex: -1,
    pointerEvents: 'none',
  },
  keyboardAvoidingView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoCircleFrame: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: 'rgba(10, 200, 100, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 40, 30, 0.1)',
    overflow: 'hidden',
  },
  logoImage: {
    width: 200,
    height: 200,
    shadowColor: '#00cc77',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  titleContainer: {
    alignItems: 'center',
  },
  appTagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  formBlur: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  formInner: {
    padding: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputsContainer: {
    gap: 18,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  rememberForgotRow: {
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
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPasswordContainer: {
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButtonContainer: {
    marginBottom: 20,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerText: {
    fontSize: 14,
    marginRight: 8,
  },
  registerButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  registerButtonGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  guestLoginContainer: {
    alignItems: 'center',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  guestText: {
    fontSize: 14,
    marginRight: 8,
  },
}); 