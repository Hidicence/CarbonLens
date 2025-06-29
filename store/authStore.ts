import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/auth';
import { Platform } from 'react-native';
import { useProfileStore } from '@/store/profileStore';

// 直接導入Firebase Auth功能
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  OAuthProvider,
  onAuthStateChanged,
  type UserCredential,
  type User as FirebaseUser,
  getAuth
} from 'firebase/auth';

// 導入 Google Sign-In 服務
import { GoogleSignInService } from '@/services/googleSignInService';

// 導入auth實例
import { auth } from '@/utils/firebaseConfig';
import firebaseApp from '@/utils/firebaseConfig';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
  initAuthListener: () => () => void; // 返回取消訂閱函數
}

// 將Firebase用戶轉換為我們的用戶模型
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  // 將Firebase用戶信息同步到profileStore
  const providerId = firebaseUser.providerData?.[0]?.providerId || 'password';
  let provider: User['provider'] = 'email';
  
  if (providerId === 'google.com') {
    provider = 'google';
  } else if (providerId === 'apple.com') {
    provider = 'apple';
  } else if (providerId === 'facebook.com') {
    provider = 'facebook';
  } else if (providerId === 'twitter.com') {
    provider = 'twitter';
  }
  
  const user = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || '用戶',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL,
    role: 'user' as const,
    createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
    provider
  };
  
  // 同步到profileStore
  const profileStore = useProfileStore.getState();
  profileStore.updateProfile({
    name: user.name,
    email: user.email,
    avatar: user.avatar || profileStore.profile.avatar,
  });
  
  return user;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      isAuthLoading: true,
      error: null,
      
      initAuthListener: () => {
        // 設置Firebase身份驗證狀態監聽
        try {
          const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
              // 用戶已登入
              set({
                isLoggedIn: true,
                user: mapFirebaseUserToUser(firebaseUser),
                isLoading: false,
                isAuthLoading: false
              });
            } else {
              // 用戶已登出
              set({
                isLoggedIn: false,
                user: null,
                isLoading: false,
                isAuthLoading: false
              });
            }
          });
          
          return unsubscribe;
        } catch (error) {
          console.error('設置認證監聽器失敗:', error);
          set({ isAuthLoading: false }); // 即使失敗也要更新加載狀態
          return () => {}; // 返回空函數作為後備
        }
      },
      
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        try {
          const auth = getAuth(firebaseApp);
          await signInWithEmailAndPassword(auth, email, password);
          // onAuthStateChanged 將會處理 user 和 isLoggedIn 狀態
          console.log('登入成功:', email);
          return true;
        } catch (error: any) {
          console.error('登入錯誤:', error);
          
          // 如果是測試帳號或訪客帳號且登入失敗，嘗試創建它們
          const isTestAccount = email === 'test@example.com' || email === 'guest@example.com';
          const isCredentialError = error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential';
          
          if (isTestAccount && isCredentialError) {
            console.log(`${email} 帳號不存在或密碼錯誤，嘗試創建新帳號...`);
            try {
              const auth = getAuth(firebaseApp);
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              
              // 設置顯示名稱
              const displayName = email === 'test@example.com' ? '測試用戶' : '訪客用戶';
              await updateProfile(userCredential.user, {
                displayName: displayName
              });
              
              console.log(`${email} 帳號創建成功並登入`);
              return true;
            } catch (creationError: any) {
              console.error(`創建 ${email} 帳號失敗:`, creationError);
              
              // 如果創建失敗，可能是帳號已存在但密碼錯誤
              if (creationError.code === 'auth/email-already-in-use') {
                set({ error: `${email} 帳號已存在，但密碼不正確`, isLoading: false });
              } else {
              set({ error: creationError.message, isLoading: false });
              }
              return false;
            }
          }
          
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          if (Platform.OS === 'web') {
            // Web 平台使用 Firebase popup
            console.log('開始 Web Google 登入流程...');
            
            // 確保 auth 實例存在
            if (!auth) {
              throw new Error('Firebase Auth 實例未初始化');
          }
          
          const provider = new GoogleAuthProvider();
          provider.addScope('profile');
          provider.addScope('email');
          provider.setCustomParameters({
            'hl': 'zh-TW'
          });
          
            console.log('正在執行 signInWithPopup...');
            const result = await signInWithPopup(auth, provider);
            console.log('signInWithPopup 成功:', result);
            
            const firebaseUser = result.user;
          
          if (!firebaseUser) {
            throw new Error('Google 登入未返回用戶資訊');
          }
            
            console.log('Web Google 登入成功:', firebaseUser.email);
            
            // onAuthStateChanged 將會處理狀態更新
            return true;
          } else {
            // 原生 APP 平台使用 Google Sign-In SDK
            console.log('開始原生 Google 登入流程...');
            
            try {
              // 執行 Google 登入
              const userInfo = await GoogleSignInService.signIn();
              console.log('Google 登入成功，用戶資訊:', userInfo);
              
              if (!userInfo.data?.idToken) {
                throw new Error('未獲取到 Google ID Token');
              }
              
              // 獲取 Google 認證憑證
              const googleCredential = GoogleAuthProvider.credential(
                userInfo.data.idToken
              );
              
              console.log('正在使用 Google 憑證登入 Firebase...');
              
              // 使用 Google 憑證登入 Firebase
              const result = await signInWithCredential(auth, googleCredential);
              const firebaseUser = result.user;
              
              if (!firebaseUser) {
                throw new Error('Google 登入未返回用戶資訊');
              }
              
              console.log('Firebase 登入成功:', firebaseUser.email);
              
              // onAuthStateChanged 將會處理狀態更新
              return true;
            } catch (nativeError: any) {
              console.error('原生 Google 登入失敗:', nativeError);
              
              // 如果原生登入失敗，在開發環境下可以嘗試測試帳號登入
              if (__DEV__) {
                console.log('開發環境：嘗試使用測試帳號登入...');
                return await get().login('test@example.com', 'password', false);
              }
              
              throw nativeError;
            }
          }
        } catch (error: any) {
          console.error('Google login error:', error);
          
          let errorMessage = 'Google 登入失敗，請稍後再試';
          
          // 處理特定的錯誤類型
          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = '登入視窗已關閉，請重新嘗試';
          } else if (error.code === 'auth/popup-blocked') {
            errorMessage = '瀏覽器阻止了登入視窗，請檢查彈出視窗設定';
          } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = '登入請求已取消';
          } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Google 登入功能尚未啟用，請聯繫管理員';
          } else if (error.code === 'auth/network-request-failed') {
            errorMessage = '網路連線失敗，請檢查網路設定';
          } else if (error.code === 'auth/argument-error') {
            errorMessage = 'Firebase 配置錯誤，請檢查設定';
            console.error('Firebase argument error details:', error);
          } else if (error.code === 'SIGN_IN_CANCELLED') {
            errorMessage = '用戶取消了 Google 登入';
          } else if (error.code === 'IN_PROGRESS') {
            errorMessage = 'Google 登入正在進行中，請稍候';
          } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
            errorMessage = 'Google Play 服務不可用，請更新 Google Play 服務';
          }
          
          console.error('完整錯誤信息:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          
          set({
            isLoading: false,
            error: errorMessage
          });
          return false;
        }
      },
      
      loginWithApple: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Apple登入
          if (Platform.OS !== 'ios' && Platform.OS !== 'web') {
            set({
              isLoading: false,
              error: 'Apple登入僅支援iOS裝置和Web'
            });
            return false;
          }
          
          // 設置Apple認證提供者
          const provider = new OAuthProvider('apple.com');
          
          // 在Web上使用signInWithPopup
          if (Platform.OS === 'web') {
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
            
            set({
              isLoggedIn: true,
              user: mapFirebaseUserToUser(firebaseUser),
              isLoading: false
            });
            
            return true;
          } else {
            // 在真實應用中，需要使用專門為iOS設計的方法
            throw new Error('iOS上的Apple登入需要額外配置');
          }
        } catch (error: any) {
          console.error('Apple login error:', error);
          set({
            isLoading: false,
            error: 'Apple登入失敗，請稍後再試'
          });
          return false;
        }
      },
      
      logout: async () => {
        console.log('🚪 開始執行登出流程...');
        
        try {
          // 1. 登出 Google Sign-In (如果已登入)
          if (Platform.OS !== 'web') {
            try {
              console.log('🔍 檢查 Google Sign-In 狀態...');
              const isSignedIn = await GoogleSignInService.isSignedIn();
              if (isSignedIn) {
                console.log('🔐 登出 Google Sign-In...');
                await GoogleSignInService.signOut();
                console.log('✅ Google Sign-In 登出成功');
              }
            } catch (error) {
              console.log('⚠️ Google Sign-In 登出時發生錯誤:', error);
            }
          }
          
          // 2. 使用Firebase登出
          console.log('🔥 執行 Firebase 登出...');
          await signOut(auth);
          console.log('✅ Firebase 登出成功');
          
          // 3. 立即更新本地狀態
          console.log('🔄 更新本地認證狀態...');
          set({
            isLoggedIn: false,
            user: null,
            isLoading: false,
            error: null
          });
          console.log('✅ 本地狀態已清除');

          // 4. 清除本地儲存 (如果需要)
          if (Platform.OS !== 'web') {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const keys = await AsyncStorage.getAllKeys();
              const authKeys = keys.filter((key: string) => 
                key.includes('auth') || 
                key.includes('user') || 
                key.includes('login')
              );
              
              if (authKeys.length > 0) {
                await AsyncStorage.multiRemove(authKeys);
                console.log('✅ AsyncStorage 認證數據已清除');
              }
            } catch (error) {
              console.log('⚠️ 清除 AsyncStorage 時發生錯誤:', error);
            }
          }

          console.log('🎉 登出流程完成');
          
        } catch (error) {
          console.error('❌ 登出過程中發生錯誤:', error);
          
          // 即使登出失敗，我們也要強制重置本地狀態
          console.log('🔄 強制重置本地狀態...');
          set({
            isLoggedIn: false,
            user: null,
            isLoading: false,
            error: null
          });
          
          // 拋出錯誤，讓調用者知道登出過程中有問題
          throw error;
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // 使用Firebase創建新用戶
          const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // 更新用戶資料以添加顯示名稱
          await updateProfile(firebaseUser, {
            displayName: name
          });
          
          // 刷新用戶信息以獲取更新後的資料
          if (firebaseUser.reload) {
            await firebaseUser.reload();
          }
          
          // 同步到profileStore
          const profileStore = useProfileStore.getState();
          profileStore.updateProfile({
            name: name,
            email: email,
            role: '影視製作人員', // 設置默認角色
          });
          
          // 註冊成功
          set({
            isLoggedIn: true,
            user: {
              id: firebaseUser.uid,
              name: name,
              email: email,
              avatar: null,
              role: 'user',
              createdAt: new Date().toISOString(),
              provider: 'email'
            },
            isLoading: false
          });
          
          return true;
        } catch (error: any) {
          // 處理錯誤
          let errorMessage = '註冊時發生錯誤';
          
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = '此電子郵件已被使用';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = '無效的電子郵件地址';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = '密碼強度不足';
          }
          
          console.error('註冊錯誤:', error);
          
          set({
            isLoading: false,
            error: errorMessage
          });
          
          return false;
        }
      },
      
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // 使用Firebase發送密碼重置郵件
          await sendPasswordResetEmail(auth, email);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          // 處理錯誤
          let errorMessage = '發送重置郵件時發生錯誤';
          
          if (error.code === 'auth/user-not-found') {
            errorMessage = '找不到與此電子郵件關聯的帳戶';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = '無效的電子郵件地址';
          }
          
          console.error('重置密碼錯誤:', error);
          
          set({
            isLoading: false,
            error: errorMessage
          });
          
          return false;
        }
      },
      
      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
            set({
              user: { ...currentUser, ...updates }
            });
        }
      },
      
      clearError: () => {
          set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
      }),
    }
  )
);