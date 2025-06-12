import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { 認證模型 } from '../models/身份認證模型';
import type { Router } from 'expo-router';

// 登入控制器類 - 處理用戶交互邏輯
export class 登入控制器 {
  private router: Router | null = null;
  private translationFn: (key: string) => string = key => key;
  
  // 設置router和翻譯函數
  setDependencies(router: Router, translationFn: (key: string) => string): void {
    this.router = router;
    this.translationFn = translationFn;
  }
  
  // 獲取翻譯文本
  private t(key: string): string {
    return this.translationFn(key);
  }
  
  // 處理登入按鈕點擊事件
  async handleLogin(): Promise<void> {
    // 首先驗證輸入
    const validation = 認證模型.validateInput();
    if (!validation.isValid) {
      Alert.alert(this.t('common.error'), validation.message || this.t('auth.invalid.credentials'));
      return;
    }
    
    // 嘗試登入
    const success = await 認證模型.login();
    if (success) {
      if (this.router) {
        this.router.replace('/');
      }
    } else {
      const error = 認證模型.getError();
      if (error) {
        Alert.alert(this.t('common.error'), error);
        認證模型.clearError();
      }
    }
  }
  
  // 處理註冊按鈕點擊事件
  handleRegister(): void {
    if (this.router) {
      this.router.push('/register');
    }
  }
  
  // 處理忘記密碼點擊事件
  handleForgotPassword(): void {
    if (this.router) {
      this.router.push('/forgot-password');
    }
  }
  
  // 處理Google登入按鈕點擊事件
  async handleGoogleLogin(): Promise<void> {
    try {
      const success = await 認證模型.loginWithGoogle();
      if (success) {
        if (this.router) {
          this.router.replace('/');
        }
      } else {
        Alert.alert(this.t('common.error'), this.t('auth.social.login.error'));
      }
    } catch (error) {
      console.error("Google登入錯誤:", error);
      Alert.alert(this.t('common.error'), this.t('auth.social.login.error'));
    }
  }
  
  // 處理Apple登入按鈕點擊事件
  async handleAppleLogin(): Promise<void> {
    try {
      const success = await 認證模型.loginWithApple();
      if (success) {
        if (this.router) {
          this.router.replace('/');
        }
      } else {
        Alert.alert(this.t('common.error'), this.t('auth.social.login.error'));
      }
    } catch (error) {
      console.error("Apple登入錯誤:", error);
      Alert.alert(this.t('common.error'), this.t('auth.social.login.error'));
    }
  }
  
  // 處理訪客登入按鈕點擊事件
  async handleGuestLogin(): Promise<void> {
    try {
      const success = await 認證模型.guestLogin();
      if (success) {
        if (this.router) {
          this.router.replace('/');
        }
      } else {
        Alert.alert(this.t('common.error'), this.t('auth.guest.login.error'));
      }
    } catch (error) {
      console.error("訪客登入錯誤:", error);
      Alert.alert(this.t('common.error'), this.t('auth.guest.login.error'));
    }
  }
  
  // 處理表單輸入變更
  handleEmailChange(email: string): void {
    認證模型.setEmail(email);
  }
  
  handlePasswordChange(password: string): void {
    認證模型.setPassword(password);
  }
  
  handleRememberMeChange(rememberMe: boolean): void {
    認證模型.setRememberMe(rememberMe);
  }
  
  // 獲取加載狀態
  getLoadingState(): boolean {
    return 認證模型.isLoading();
  }
  
  // 清除錯誤
  clearError(): void {
    認證模型.clearError();
  }
}

// 創建並導出控制器實例
export const 登錄控制器 = new 登入控制器(); 