import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AIAssistant from '@/components/AIAssistant';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import { ChevronLeft } from 'lucide-react-native';

export default function AIChatScreen() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'AI 助理',
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      <AIAssistant 
        projectId={Array.isArray(projectId) ? projectId[0] : projectId} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 