import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase配置 - 與APP端保持一致
const firebaseConfig = {
  apiKey: "AIzaSyAJaNieypmA3XmeB5moloGylRTOPP29qsw",
  authDomain: "carbonlens-f3fa3.firebaseapp.com",
  projectId: "carbonlens-f3fa3",
  storageBucket: "carbonlens-f3fa3.firebasestorage.app",
  messagingSenderId: "318489404801",
  appId: "1:318489404801:web:f0aff1c5d64bbe690df480",
  measurementId: "G-8EPWF2H6SN"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 初始化服務
export const auth = getAuth(app);
export const db = getFirestore(app);

// 開發環境可以啟用模擬器（可選）
if (process.env.NODE_ENV === 'development') {
  // 如果需要使用模擬器，取消註釋以下代碼
  // try {
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  //   connectFirestoreEmulator(db, 'localhost', 8080);
  // } catch (error) {
  //   console.log('Firebase emulators already connected');
  // }
}

export default app; 