import { Stack, router, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, Platform } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Colors from "@/constants/colors";
import { useThemeStore } from "@/store/themeStore";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { isFirstLaunch, isOnboardingCompleted, setupOnboarding } from "@/utils/onboardingManager";
// Firebase同步服務已整合到統一的firebaseService中
// import { GoogleSignInService } from "@/services/googleSignInService"; // 暫時禁用 Google Sign-In 服務
import '@/utils/i18n'; // 導入i18n配置

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const [loaded, error] = useFonts({
    // Add any fonts you need here
  });
  const { isDarkMode } = useThemeStore();
  const projectStore = useProjectStore();
  const { isLoggedIn, initAuthListener } = useAuthStore();
  
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 初始化Firebase認證監聽器
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  // Firebase服務初始化 (由firebaseService自動處理)
  useEffect(() => {
    console.log('🚀 Firebase服務已整合到統一架構中...');
    // firebaseService 會在認證狀態變化時自動管理數據同步
    // 不需要額外的初始化代碼
    
    // 暫時禁用 Google Sign-In 配置，避免原生模塊錯誤
    // TODO: 重新啟用 Google Sign-In 配置
    // GoogleSignInService.configure();
  }, []);

  // 檢查是否為首次啟動
  useEffect(() => {
    const checkOnboarding = async () => {
      const firstLaunch = await isFirstLaunch();
      setIsFirst(firstLaunch);
      if (firstLaunch) {
        await setupOnboarding(projectStore);
      }
      setOnboardingChecked(true);
    };
    checkOnboarding();
  }, [projectStore]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && onboardingChecked) {
      SplashScreen.hideAsync();
      // 延遲一點確保組件完全掛載
      setTimeout(() => setMounted(true), 100);
    }
  }, [loaded, onboardingChecked]);

  if (!loaded || !onboardingChecked || !mounted) {
    return null;
  }
  
  if (isFirst) {
    return <Redirect href="/onboarding" />;
  }
  
  // 登入狀態的判斷交給 (tabs) layout 處理，這樣可以確保正確的導航

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? Colors.dark.background : Colors.light.background} 
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="direct-login" />
        <Stack.Screen name="test-google-login" />
        <Stack.Screen name="simple-login-test" />
        <Stack.Screen 
          name="modal" 
          options={{ 
            headerShown: true,
            presentation: 'modal' 
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}