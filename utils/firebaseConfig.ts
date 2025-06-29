import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// React Native persistence handled by browserLocalPersistence
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase配置信息
const firebaseConfig = {
  apiKey: "AIzaSyAJaNieypmA3XmeB5moloGylRTOPP29qsw",
  authDomain: "carbonlens-f3fa3.firebaseapp.com",
  projectId: "carbonlens-f3fa3",
  storageBucket: "carbonlens-f3fa3.firebasestorage.app",
  messagingSenderId: "318489404801",
  appId: "1:318489404801:web:f0aff1c5d64bbe690df480",
  measurementId: "G-8EPWF2H6SN"
};

// 初始化Firebase應用
const app = initializeApp(firebaseConfig);

// 獲取Firebase身份驗證實例
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // 對於 React Native，首先嘗試 initializeAuth
  try {
    auth = initializeAuth(app);
    console.log('Firebase Auth initialized successfully');
  } catch (error) {
    // 如果已經初始化，使用 getAuth
    console.log('Auth already initialized, using getAuth');
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