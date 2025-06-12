import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

export default function UltraSimpleScreen() {
  const [count, setCount] = useState(0);

  const handlePress = () => {
    console.log('按鈕被點擊，計數:', count + 1);
    setCount(count + 1);
    Alert.alert('測試', `按鈕被點擊了 ${count + 1} 次`);
  };

  console.log('UltraSimpleScreen 正在渲染，計數:', count);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      padding: 20
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333'
      }}>
        超簡單測試頁面
      </Text>
      
      <Text style={{
        fontSize: 16,
        marginBottom: 20,
        color: '#666',
        textAlign: 'center'
      }}>
        這是最基本的React Native組件測試{'\n'}
        計數: {count}
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          minWidth: 150,
          alignItems: 'center'
        }}
        onPress={handlePress}
      >
        <Text style={{
          color: 'white',
          fontSize: 16,
          fontWeight: '600'
        }}>
          點我測試
        </Text>
      </TouchableOpacity>
      
      <View style={{
        marginTop: 30,
        padding: 15,
        backgroundColor: '#e8f4f8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#b3d9e8'
      }}>
        <Text style={{
          fontSize: 12,
          color: '#2c5f7c'
        }}>
          如果你能看到這個頁面並且按鈕有反應，{'\n'}
          說明 React Native Web 基本功能正常
        </Text>
      </View>
    </View>
  );
} 