import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 這是一個簡單的測試組件，用於測試 MCP 工具
export default function MCPMagicTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MCP Magic 測試</Text>
      <Text style={styles.description}>
        這個組件用於測試 @21st-dev/magic MCP 工具是否可以被正確調用
      </Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>這是一個可以被優化的UI元素</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  box: {
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  boxText: {
    fontSize: 16,
  },
}); 