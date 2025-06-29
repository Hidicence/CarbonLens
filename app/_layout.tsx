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
import { firebaseSync } from "@/services/firebaseDataSync"; // 導入同步服務
import { GoogleSignInService } from "@/services/googleSignInService"; // 導入 Google Sign-In 服務
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

  // 初始化Firebase認證監聽器
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  // 初始化Firebase數據同步服務和Google Sign-In
  useEffect(() => {
    console.log('🚀 正在啟動Firebase數據同步服務...');
    // firebaseSync 會自動監聽用戶登入狀態並開始同步
    // 這裡不需要額外的代碼，服務會自動運行
    
    // 初始化 Google Sign-In 配置
    GoogleSignInService.configure();
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
    }
  }, [loaded, onboardingChecked]);

  if (!loaded || !onboardingChecked) {
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