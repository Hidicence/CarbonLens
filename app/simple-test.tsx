import React from 'react';
import { View, Text } from 'react-native';

export default function SimpleTestScreen() {
  console.log('SimpleTestScreen 正在渲染');
  
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'white' 
    }}>
      <Text style={{ fontSize: 18, color: 'black' }}>
        簡單測試頁面
      </Text>
      <Text style={{ fontSize: 14, color: 'gray', marginTop: 10 }}>
        這個頁面沒有任何依賴項
      </Text>
    </View>
  );
} 