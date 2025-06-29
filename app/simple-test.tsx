import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Cloud, Database, Zap, CheckCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { firebaseSync } from '@/services/firebaseDataSync';
import { generateId } from '@/utils/helpers';

export default function SimpleTestScreen() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { addProject, addProjectEmissionRecord } = useProjectStore();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 創建測試專案
  const createTestProject = () => {
    try {
      const testProject = {
        id: generateId(),
        name: `測試專案 - ${new Date().toLocaleTimeString()}`,
        description: '這是一個用來測試Firebase同步的專案',
        status: 'active' as const,
        location: '台北市',
        budget: 100000,
        emissionSummary: {
          projectId: '',
          directEmissions: 0,
          allocatedEmissions: 0,
          totalEmissions: 0,
          directRecordCount: 0,
          allocatedRecordCount: 0,
        },
        totalEmissions: 0,
        createdAt: new Date().toISOString(),
        collaborators: [],
      };

      testProject.emissionSummary.projectId = testProject.id;
      addProject(testProject);
      addTestResult(`✅ 已創建測試專案: ${testProject.name}`);
      return testProject.id;
    } catch (error) {
      addTestResult(`❌ 創建測試專案失敗: ${error}`);
      return null;
    }
  };

  // 創建測試排放記錄
  const createTestEmissionRecord = (projectId: string) => {
    try {
      const testRecord = {
        projectId,
        stage: 'production' as const,
        categoryId: 'transport-prod',
        description: `測試排放記錄 - ${new Date().toLocaleTimeString()}`,
        sourceId: 'van-transport',
        quantity: 50,
        unit: '公里',
        amount: 12.5,
        date: new Date().toISOString(),
        location: '測試地點',
        notes: '這是一個測試記錄',
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'test-user',
      };

      addProjectEmissionRecord(testRecord);
      addTestResult(`✅ 已創建測試排放記錄: ${testRecord.description}`);
    } catch (error) {
      addTestResult(`❌ 創建測試排放記錄失敗: ${error}`);
    }
  };

  // 執行完整測試
  const runFullTest = async () => {
    if (!isLoggedIn) {
      Alert.alert('請先登入', '需要登入才能測試同步功能');
      return;
    }

    setIsLoading(true);
    setTestResults([]);
    
    try {
      addTestResult('🚀 開始完整同步測試...');
      
      // 1. 創建測試數據
      addTestResult('📝 步驟1: 創建測試數據');
      const projectId = createTestProject();
      if (projectId) {
        createTestEmissionRecord(projectId);
      }
      
      // 等待一下讓數據保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. 執行同步
      addTestResult('☁️ 步驟2: 同步數據到Firebase');
      await firebaseSync.startAutoSync();
      addTestResult('✅ 數據已同步到Firebase雲端');
      
      // 3. 獲取同步狀態
      const syncStatus = firebaseSync.getSyncStatus();
      addTestResult(`📊 同步狀態: ${syncStatus.isOnline ? '在線' : '離線'}`);
      addTestResult(`👤 用戶ID: ${syncStatus.userId}`);
      
      addTestResult('🎉 測試完成！請到Firebase控制台查看數據');
      addTestResult('🔗 Firebase控制台: https://console.firebase.google.com');
      
    } catch (error) {
      addTestResult(`❌ 測試失敗: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 只同步現有數據
  const syncExistingData = async () => {
    if (!isLoggedIn) {
      Alert.alert('請先登入', '需要登入才能同步數據');
      return;
    }

    setIsLoading(true);
    try {
      addTestResult('🔄 開始同步現有數據...');
      await firebaseSync.startAutoSync();
      addTestResult('✅ 現有數據已同步到Firebase');
    } catch (error) {
      addTestResult(`❌ 同步失敗: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 從雲端下載數據
  const downloadFromCloud = async () => {
    if (!isLoggedIn) {
      Alert.alert('請先登入', '需要登入才能下載數據');
      return;
    }

    setIsLoading(true);
    try {
      addTestResult('📥 開始從雲端下載數據...');
      await firebaseSync.downloadFromCloud();
      addTestResult('✅ 雲端數據已下載到本地');
    } catch (error) {
      addTestResult(`❌ 下載失敗: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Firebase同步測試</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 用戶狀態 */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>當前狀態</Text>
          <Text style={styles.statusText}>
            登入狀態: {isLoggedIn ? '已登入' : '未登入'}
          </Text>
          {user && (
            <Text style={styles.statusText}>
              用戶: {user.name} ({user.email})
            </Text>
          )}
        </View>

        {/* 測試按鈕 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.testButton, styles.primaryButton]}
            onPress={runFullTest}
            disabled={isLoading || !isLoggedIn}
          >
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {isLoading ? '測試中...' : '完整測試 (創建+同步)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.secondaryButton]}
            onPress={syncExistingData}
            disabled={isLoading || !isLoggedIn}
          >
            <Cloud size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              同步現有數據
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.tertiaryButton]}
            onPress={downloadFromCloud}
            disabled={isLoading || !isLoggedIn}
          >
            <Database size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              從雲端下載
            </Text>
          </TouchableOpacity>
        </View>

        {/* 測試結果 */}
        {testResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>測試結果</Text>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))}
          </View>
        )}

        {/* 說明 */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>如何查看Firebase數據：</Text>
          <Text style={styles.instructionText}>
            1. 打開 https://console.firebase.google.com
          </Text>
          <Text style={styles.instructionText}>
            2. 選擇 "carbonlens-f3fa3" 專案
          </Text>
          <Text style={styles.instructionText}>
            3. 點擊左側選單的 "Firestore Database"
          </Text>
          <Text style={styles.instructionText}>
            4. 在 "users" 集合中找到您的用戶ID
          </Text>
          <Text style={styles.instructionText}>
            5. 查看 projects、emissionRecords 等子集合
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#10B981',
  },
  tertiaryButton: {
    backgroundColor: '#8B5CF6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultsContainer: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  instructionsCard: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
}); 