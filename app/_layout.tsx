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
  
  // 登入狀態的判斷交給 (tabs) layout 或其他頁面自行處理
  // if (!isLoggedIn) {
  //   return <Redirect href="/login" />;
  // }

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