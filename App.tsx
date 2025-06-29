import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// 導入主要頁面
import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// 創建底部導航
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === '首頁') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === '專案') {
                iconName = focused ? 'folder' : 'folder-outline';
              } else if (route.name === '分析') {
                iconName = focused ? 'analytics' : 'analytics-outline';
              } else if (route.name === '設定') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#10b981',
            tabBarInactiveTintColor: '#6b7280',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopColor: '#e5e7eb',
              paddingVertical: 8,
              height: 65,
            },
            headerStyle: {
              backgroundColor: '#10b981',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="首頁" 
            component={HomeScreen}
            options={{ headerTitle: 'CarbonLens - 首頁' }}
          />
          <Tab.Screen 
            name="專案" 
            component={ProjectsScreen}
            options={{ headerTitle: 'CarbonLens - 專案管理' }}
          />
          <Tab.Screen 
            name="分析" 
            component={AnalyticsScreen}
            options={{ headerTitle: 'CarbonLens - 數據分析' }}
          />
          <Tab.Screen 
            name="設定" 
            component={SettingsScreen}
            options={{ headerTitle: 'CarbonLens - 設定' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 