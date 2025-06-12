import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function DatabaseScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // 直接重定向到專業設備碳排放數據庫頁面
    router.replace('/settings/equipment-database');
  }, [router]);
  
  // 這個組件不會渲染任何內容，因為它會立即重定向
  return null;
}