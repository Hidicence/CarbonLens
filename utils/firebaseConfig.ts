import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// 條件導入AsyncStorage避免類型錯誤  
let ReactNativeAsyncStorage: any;
try {
  ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  // Web環境下的後備存儲
  ReactNativeAsyncStorage = {
    getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
  };
}
import { getFirestore } from 'firebase/firestore';
import { disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase配置信息 - 從環境變數讀取
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAJaNieypmA3XmeB5moloGylRTOPP29qsw",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "carbonlens-f3fa3.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "carbonlens-f3fa3",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "carbonlens-f3fa3.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "318489404801",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:318489404801:web:f0aff1c5d64bbe690df480",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8EPWF2H6SN"
};

// 初始化Firebase應用
const app = initializeApp(firebaseConfig);

// 獲取Firebase身份驗證實例
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // 對於 React Native，Firebase 11.x 自動處理持久化
  try {
    auth = initializeAuth(app);
    if (auth) {
      __DEV__ && console.log('Firebase Auth initialized successfully for React Native');
      __DEV__ && console.log('AsyncStorage persistence is handled automatically in Firebase 11.x');
    } else {
      __DEV__ && console.log('Auth already initialized, using getAuth');
    }
  } catch (error) {
    // 如果已經初始化，使用 getAuth
    console.log('Auth already initialized, using getAuth:', error);
    auth = getAuth(app);
  }
}

// 初始化Firestore數據庫
const db = getFirestore(app);

// 初始化Cloud Storage（用於文件存儲）
const storage = getStorage(app);

// 初始化Firebase Analytics (僅在支持的環境中)
const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
    return null;
  } catch (e) {
    console.log('Analytics不支持在當前環境下運行');
    return null;
  }
};

const analyticsPromise = initializeAnalytics();

// 離線/在線模式控制
export const enableOfflineMode = () => disableNetwork(db);
export const enableOnlineMode = () => enableNetwork(db);

// 導出所有Firebase服務
export { auth, db, storage, analyticsPromise };
export default app;