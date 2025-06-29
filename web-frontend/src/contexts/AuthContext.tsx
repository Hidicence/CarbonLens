import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log('用戶已登入:', user.email);
      } else {
        console.log('用戶已登出');
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('登入成功:', result.user.email);
      toast.success('登入成功！');
    } catch (error: any) {
      console.error('登入失敗:', error);
      let errorMessage = '登入失敗';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '找不到此帳號，請檢查電子郵件或先註冊';
          break;
        case 'auth/wrong-password':
          errorMessage = '密碼錯誤，請重新輸入';
          break;
        case 'auth/invalid-email':
          errorMessage = '電子郵件格式不正確';
          break;
        case 'auth/too-many-requests':
          errorMessage = '登入嘗試次數過多，請稍後再試';
          break;
        case 'auth/network-request-failed':
          errorMessage = '網路連線失敗，請檢查網路設定';
          break;
        case 'auth/invalid-credential':
          errorMessage = '帳號或密碼錯誤，請重新輸入';
          break;
        default:
          errorMessage = `登入失敗: ${error.message}`;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('註冊成功！');
    } catch (error: any) {
      console.error('註冊失敗:', error);
      toast.error('註冊失敗: ' + (error.message || '未知錯誤'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Google 登入成功！');
    } catch (error: any) {
      console.error('Google 登入失敗:', error);
      toast.error('Google 登入失敗: ' + (error.message || '未知錯誤'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('已成功登出');
    } catch (error: any) {
      console.error('登出失敗:', error);
      toast.error('登出失敗: ' + (error.message || '未知錯誤'));
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 