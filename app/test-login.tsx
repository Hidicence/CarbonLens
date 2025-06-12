import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestLoginScreen() {
  console.log('TestLoginScreen 正在渲染');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>測試登入頁面</Text>
      <Text style={styles.subtitle}>如果你看到這個頁面，表示基本渲染正常</Text>
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>調試訊息:</Text>
        <Text style={styles.debugText}>• React Native 組件正常載入</Text>
        <Text style={styles.debugText}>• 樣式應用正常</Text>
        <Text style={styles.debugText}>• 頁面可以正常渲染</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  debugContainer: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3d9e8',
  },
  debugText: {
    fontSize: 14,
    color: '#2c5f7c',
    marginBottom: 5,
  },
}); 