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
  OAuthProvider,
  onAuthStateChanged,
  type UserCredential,
  type User as FirebaseUser,
  getAuth
} from 'firebase/auth';

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
  logout: () => void;
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
          // 如果是訪客帳號且登入失敗，嘗試創建它
          if (email === 'guest@example.com' && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
            console.log('訪客帳號不存在或密碼錯誤，嘗試創建新帳號...');
            try {
              const auth = getAuth(firebaseApp);
              await createUserWithEmailAndPassword(auth, email, password);
              console.log('訪客帳號創建成功並登入');
              return true;
            } catch (creationError: any) {
              console.error('創建訪客帳號失敗:', creationError);
              set({ error: creationError.message, isLoading: false });
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
          // 檢查當前環境是否支援 Google 登入
          if (Platform.OS !== 'web') {
            set({
              isLoading: false,
              error: '目前僅支援在網頁瀏覽器中使用 Google 登入'
            });
            return false;
          }
          
          // 設置Google認證提供者
          const provider = new GoogleAuthProvider();
          
          // 添加額外的範圍權限（可選）
          provider.addScope('profile');
          provider.addScope('email');
          
          // 設置語言為繁體中文
          provider.setCustomParameters({
            'hl': 'zh-TW'
          });
          
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
          
          // 檢查用戶是否確實登入成功
          if (!firebaseUser) {
            throw new Error('Google 登入未返回用戶資訊');
          }
            
            set({
              isLoggedIn: true,
              user: mapFirebaseUserToUser(firebaseUser),
              isLoading: false
            });
            
            return true;
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
          }
          
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
        try {
          // 使用Firebase登出
          await signOut(auth);
          
          // 這將由onAuthStateChanged處理，但我們也在這裡手動設置狀態以確保即時更新
          set({
            isLoggedIn: false,
            user: null
          });

          // 在Web平台上，確保清理所有可能的會話信息
          if (Platform.OS === 'web') {
            try {
              // 通過全局變量，讓應用知道這是登出操作
              if (typeof window !== 'undefined') {
                (window as any).isLoggedOut = true;
              }
              console.log("Web platform - additional session cleanup");
            } catch (error) {
              console.error("Web session cleanup error:", error);
            }
          }
        } catch (error) {
          console.error('Logout error:', error);
          // 即使登出失敗，我們也重置本地狀態
          set({
            isLoggedIn: false,
            user: null
          });
          
          // 在Web平台上，即使Firebase登出失敗，也要確保用戶被登出
          if (Platform.OS === 'web') {
            console.log("Forcing logout on web despite Firebase error");
          }
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