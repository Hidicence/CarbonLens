import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';
// React Native persistence handled by browserLocalPersistence
import { getAnalytics, isSupported } from 'firebase/analytics';
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
const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? indexedDBLocalPersistence 
    : browserLocalPersistence
});

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

export { auth, analyticsPromise };
export default app;