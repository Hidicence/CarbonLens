import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import { Home, BarChart2, Lightbulb, Settings } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useFloatingAIStore } from '@/store/floatingAIStore';
import { Redirect } from 'expo-router';
import FloatingAIAssistant from '@/components/FloatingAIAssistant';

export default function TabLayout() {
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();
  const { isLoggedIn, isAuthLoading } = useAuthStore();
  const { isVisible: isFloatingAIVisible, mode: aiMode, hideFloatingAI } = useFloatingAIStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("Tab layout - Auth state:", isLoggedIn ? "Logged in" : "Logged out", "Loading:", isAuthLoading);
  }, [isLoggedIn, isAuthLoading]);

  useEffect(() => {
    console.log(`[Layout] 懸浮 AI 可見性狀態改變: ${isFloatingAIVisible}`);
  }, [isFloatingAIVisible]);

  // 確保組件掛載後再允許重定向
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 如果組件還未掛載，顯示空白畫面
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  // 如果認證狀態還在載入中，顯示空白畫面
  if (isAuthLoading) {
    console.log("Tab layout - Auth is loading, showing blank screen");
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    console.log("Tab layout - Redirecting to login");
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.projects'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('nav.analytics'),
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="carbon_tips"
        options={{
          title: t('nav.tips'),
          tabBarIcon: ({ color, size }) => <Lightbulb size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
      
      {/* 懸浮 AI 助手 */}
      <FloatingAIAssistant
        visible={isFloatingAIVisible}
        mode={aiMode}
        onClose={hideFloatingAI}
      />
    </View>
  );
}