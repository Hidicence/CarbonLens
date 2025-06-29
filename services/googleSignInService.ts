import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

export class GoogleSignInService {
  private static isConfigured = false;

  static configure() {
    if (this.isConfigured || Platform.OS === 'web') {
      return;
    }

    try {
      GoogleSignin.configure({
        // 這個 Web Client ID 必須與 Firebase Console 中的一致
        webClientId: '574507647166-vqvlvlckpq5t33u5cqdpnqh5qhv1qm7k.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        profileImageSize: 120,
        // 添加 iOS Client ID (如果有的話)
        iosClientId: '574507647166-vqvlvlckpq5t33u5cqdpnqh5qhv1qm7k.apps.googleusercontent.com',
      });
      
      this.isConfigured = true;
      console.log('✅ Google Sign-In 配置成功');
      console.log('📋 Web Client ID:', '574507647166-vqvlvlckpq5t33u5cqdpnqh5qhv1qm7k.apps.googleusercontent.com');
    } catch (error) {
      console.error('❌ Google Sign-In 配置失敗:', error);
    }
  }

  static async signIn() {
    try {
      // 確保配置已完成
      this.configure();
      
      console.log('🚀 Google Sign-In 配置完成，開始登入流程...');
      
      // 檢查 Play Services 可用性 (僅 Android)
      if (Platform.OS === 'android') {
        console.log('🔍 檢查 Google Play Services...');
        await GoogleSignin.hasPlayServices();
        console.log('✅ Google Play Services 可用');
      }
      
      // 執行登入
      console.log('🔐 正在執行 Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In 成功:', userInfo?.data?.user?.email);
      console.log('👤 用戶信息:', {
        email: userInfo?.data?.user?.email,
        name: userInfo?.data?.user?.name,
        id: userInfo?.data?.user?.id
      });
      
      return userInfo;
    } catch (error: any) {
      console.error('❌ Google Sign-In 登入失敗:', error);
      console.error('錯誤代碼:', error.code);
      console.error('錯誤訊息:', error.message);
      
      // 提供更友好的錯誤信息
      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('用戶取消了 Google 登入');
      } else if (error.code === 'IN_PROGRESS') {
        throw new Error('Google 登入正在進行中，請稍候');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play 服務不可用，請更新 Google Play 服務');
      } else if (error.code === 'SIGN_IN_REQUIRED') {
        throw new Error('需要重新登入 Google 帳號');
      } else if (error.code === 'DEVELOPER_ERROR') {
        throw new Error('Google 登入配置錯誤，請聯繫開發者');
      }
      
      throw error;
    }
  }

  static async signOut() {
    try {
      await GoogleSignin.signOut();
      console.log('✅ Google Sign-In 登出成功');
    } catch (error) {
      console.error('❌ Google Sign-In 登出失敗:', error);
    }
  }

  static async getCurrentUser() {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        console.log('👤 當前 Google 用戶:', currentUser.data?.user?.email);
      } else {
        console.log('❌ 沒有當前 Google 用戶');
      }
      return currentUser;
    } catch (error) {
      console.error('❌ 獲取當前 Google 用戶失敗:', error);
      return null;
    }
  }

  static async isSignedIn() {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      const isSignedIn = currentUser !== null;
      console.log('🔍 Google 登入狀態:', isSignedIn ? '已登入' : '未登入');
      return isSignedIn;
    } catch (error) {
      console.error('❌ 檢查 Google 登入狀態失敗:', error);
      return false;
    }
  }

  // 新增：獲取 Google ID Token
  static async getIdToken() {
    try {
      const tokens = await GoogleSignin.getTokens();
      console.log('🔑 獲取 Google ID Token 成功');
      return tokens.idToken;
    } catch (error) {
      console.error('❌ 獲取 Google ID Token 失敗:', error);
      throw error;
    }
  }

  // 新增：檢查配置狀態
  static getConfigurationStatus() {
    return {
      isConfigured: this.isConfigured,
      platform: Platform.OS,
      webClientId: '574507647166-vqvlvlckpq5t33u5cqdpnqh5qhv1qm7k.apps.googleusercontent.com'
    };
  }
} 