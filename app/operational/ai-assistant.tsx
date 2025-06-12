import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import AIAssistant from '@/components/AIAssistant';

export default function OperationalAIAssistantScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleEmissionCreated = (emission: any) => {
    console.log('營運 AI 助手創建排放記錄:', emission);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="AI 營運記錄助手" 
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      
      <View style={styles.content}>
        <AIAssistant
          mode="operational"
          onEmissionCreated={handleEmissionCreated}
          onClose={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
}); 