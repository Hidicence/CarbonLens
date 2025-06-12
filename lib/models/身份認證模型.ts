import { useAuthStore } from '@/store/authStore';
import { Alert } from 'react-native';

// 定義與 authStore 相關的接口
interface AuthStore {
  isLoggedIn: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// 身份認證模型類 - 處理所有相關的認證邏輯
export class 身份認證模型 {
  private email: string = '';
  private password: string = '';
  private rememberMe: boolean = false;
  private authStore: AuthStore | null = null;
  
  // 設置 authStore
  setAuthStore(store: AuthStore): void {
    this.authStore = store;
  }
  
  // 設置電子郵件
  setEmail(email: string): void {
    this.email = email;
  }
  
  // 設置密碼
  setPassword(password: string): void {
    this.password = password;
  }
  
  // 設置記住我
  setRememberMe(rememberMe: boolean): void {
    this.rememberMe = rememberMe;
  }
  
  // 獲取當前電子郵件
  getEmail(): string {
    return this.email;
  }
  
  // 獲取當前密碼
  getPassword(): string {
    return this.password;
  }
  
  // 獲取記住我狀態
  getRememberMe(): boolean {
    return this.rememberMe;
  }
  
  // 驗證輸入是否有效
  validateInput(): { isValid: boolean; message?: string } {
    if (!this.email.trim()) {
      return { isValid: false, message: '請輸入電子郵件地址' };
    }
    
    if (!this.password.trim()) {
      return { isValid: false, message: '請輸入密碼' };
    }
    
    // 簡單的電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      return { isValid: false, message: '請輸入有效的電子郵件地址' };
    }
    
    return { isValid: true };
  }
  
  // 執行登入操作
  async login(): Promise<boolean> {
    const validation = this.validateInput();
    if (!validation.isValid) {
      return false;
    }
    
    try {
      if (!this.authStore) {
        console.error('AuthStore 未初始化');
        return false;
      }
      
      return await this.authStore.login(
        this.email, 
        this.password, 
        this.rememberMe
      );
    } catch (error) {
      console.error('登入失敗:', error);
      return false;
    }
  }
  
  // 使用Google登入
  async loginWithGoogle(): Promise<boolean> {
    try {
      if (!this.authStore) {
        console.error('AuthStore 未初始化');
        return false;
      }
      return await this.authStore.loginWithGoogle();
    } catch (error) {
      console.error('Google登入失敗:', error);
      return false;
    }
  }
  
  // 使用Apple登入
  async loginWithApple(): Promise<boolean> {
    try {
      if (!this.authStore) {
        console.error('AuthStore 未初始化');
        return false;
      }
      return await this.authStore.loginWithApple();
    } catch (error) {
      console.error('Apple登入失敗:', error);
      return false;
    }
  }
  
  // 訪客登入
  async guestLogin(): Promise<boolean> {
    try {
      if (!this.authStore) {
        console.error('AuthStore 未初始化');
        return false;
      }
      return await this.authStore.login(
        "guest@example.com", 
        "guest123", 
        false
      );
    } catch (error) {
      console.error('訪客登入失敗:', error);
      return false;
    }
  }
  
  // 清除錯誤
  clearError(): void {
    if (this.authStore) {
      this.authStore.clearError();
    }
  }
  
  // 獲取錯誤
  getError(): string | null {
    return this.authStore?.error || null;
  }
  
  // 獲取載入狀態
  isLoading(): boolean {
    return this.authStore?.isLoading || false;
  }
}

// 創建並導出模型實例
export const 認證模型 = new 身份認證模型(); 