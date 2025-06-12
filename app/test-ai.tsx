import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { useFloatingAIStore } from '@/store/floatingAIStore';
import { useRouter } from 'expo-router';

export default function TestAIScreen() {
  const { showFloatingAI, isVisible } = useFloatingAIStore();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 填寫功能測試</Text>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>當前 AI 助手狀態:</Text>
        <Text style={styles.status}>
          {isVisible ? '✅ 顯示中' : '❌ 隱藏中'}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.testButton}
        onPress={showFloatingAI}
      >
        <MessageSquare size={20} color="white" />
        <Text style={styles.buttonText}>啟動 AI 助手</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>返回</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#6B7280',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
  },
}); 