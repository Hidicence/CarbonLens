import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AIService from '@/services/aiService';
import { useProjectStore } from '@/store/projectStore';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
}

interface AIAssistantProps {
  projectId?: string;
  mode?: 'project' | 'operational';
  onEmissionCreated?: (emission: any) => void;
  onClose?: () => void;
}

export default function AIAssistant({ 
  projectId, 
  mode = 'project',
  onEmissionCreated, 
  onClose 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmissions, setPendingEmissions] = useState<any[]>([]);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const { projects, addProjectEmissionRecord, addNonProjectEmissionRecord } = useProjectStore();
  
  const currentProject = projectId ? projects.find(p => p.id === projectId) : null;
  const isOperationalMode = mode === 'operational';

  useEffect(() => {
    // 根據模式顯示不同的歡迎消息
    const welcomeMessage = isOperationalMode ? 
      '您好！我是日常營運碳排放記錄助手 🏢\n\n您可以用自然語言告訴我公司的日常營運活動，我會幫您自動記錄碳排放。\n\n例如：\n• 「這個月辦公室用電1200度」\n• 「員工通勤，平均每天20人次開車」\n• 「公司車輛加油50公升」\n• 「採購影印紙10箱」' :
      '您好！我是碳排放記錄助手 🌱\n\n您可以用自然語言告訴我今天的活動，我會幫您自動記錄碳排放。\n\n例如：\n• 「今天開車到淡水拍攝，用了3台攝影機」\n• 「訂了20個便當給劇組」\n• 「住宿一晚在台北」';

    setMessages([{
      id: '1',
      type: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    }]);
  }, [isOperationalMode]);

  useEffect(() => {
    // 自動滾動到底部
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 準備上下文 - 保持與 AIService 接口兼容
      const projectContext = isOperationalMode ? undefined : currentProject ? {
        projectName: currentProject.name,
        currentStage: currentProject.status === 'active' ? 'production' : 'pre-production',
        location: currentProject.location || '未指定',
      } : undefined;

      // 調用 AI 解析
      const result = await AIService.parseEmissionDescription(inputText, projectContext);

      // 添加 AI 回應
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.summary,
        timestamp: new Date(),
        data: result,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 如果有解析到的排放數據，顯示確認界面
      if (result.emissions && result.emissions.length > 0) {
        setPendingEmissions(result.emissions);
        showEmissionConfirmation(result.emissions);
      }

      // 如果有後續問題，顯示問題
      if (result.questions && result.questions.length > 0) {
        const questionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: '我需要一些額外信息：\n\n' + result.questions.map((q, i) => `${i + 1}. ${q}`).join('\n'),
          timestamp: new Date(),
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, questionMessage]);
        }, 1000);
      }

    } catch (error) {
      console.error('AI 助手錯誤:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，我暫時無法理解您的描述。請嘗試用更具體的方式描述，例如「開車50公里」或「用電5小時」。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const showEmissionConfirmation = (emissions: any[]) => {
    const recordType = isOperationalMode ? '營運排放記錄' : '專案排放記錄';
    const confirmationText = `我幫您解析出以下${recordType}：\n\n${
      emissions.map((emission, index) => 
        `${index + 1}. ${emission.description}\n` +
        `   類別: ${getCategoryName(emission.category)}\n` +
        (isOperationalMode ? 
          `   範圍: ${getScopeName(emission.scope || 'scope2')}\n` :
          `   階段: ${getStageName(emission.stage)}\n`) +
        `   ${emission.amount ? `數量: ${emission.amount} ${emission.unit || ''}` : '數量待補充'}\n`
      ).join('\n')
    }\n要將這些記錄保存嗎？`;

    const confirmMessage: Message = {
      id: (Date.now() + 3).toString(),
      type: 'system',
      content: confirmationText,
      timestamp: new Date(),
    };

    setTimeout(() => {
      setMessages(prev => [...prev, confirmMessage]);
    }, 1500);
  };

  const handleConfirmEmissions = () => {
    if (isOperationalMode) {
      // 營運記錄模式
      pendingEmissions.forEach(emission => {
        const operationalRecord = {
          categoryId: mapToOperationalCategory(emission.category),
          sourceId: mapToOperationalSource(emission.category, emission.description),
          amount: emission.amount || 0,
          quantity: emission.quantity || emission.amount || 0,
          unit: emission.unit || 'kg',
          date: new Date().toISOString().split('T')[0],
          description: emission.description,
          isAllocated: true, // 預設啟用分攤
          allocationRule: {
            method: 'budget' as const, // 預設使用預算分攤
            targetProjects: [], // 會自動更新
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addNonProjectEmissionRecord(operationalRecord);
        onEmissionCreated?.(operationalRecord);
      });

      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `✅ 已成功記錄 ${pendingEmissions.length} 筆營運排放數據！\n\n這些記錄將自動分攤到進行中的專案。您可以繼續告訴我其他營運活動。`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, successMessage]);
    } else {
      // 專案記錄模式
      if (!currentProject) {
        Alert.alert('錯誤', '請先選擇一個專案');
        return;
      }

      pendingEmissions.forEach(emission => {
        const emissionRecord = {
          projectId: currentProject.id,
          categoryId: emission.category,
          category: emission.category,
          stage: emission.stage,
          amount: emission.amount || 0,
          quantity: emission.amount || 0,
          unit: emission.unit || 'kg',
          description: emission.description,
          date: new Date().toISOString(),
          location: currentProject.location || '',
          source: 'AI助手',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addProjectEmissionRecord(emissionRecord);
        onEmissionCreated?.(emissionRecord);
      });

      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `✅ 已成功記錄 ${pendingEmissions.length} 筆碳排放數據！\n\n您可以繼續告訴我其他活動，或者說「完成」結束記錄。`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, successMessage]);
    }

    setPendingEmissions([]);
  };

  const handleRejectEmissions = () => {
    setPendingEmissions([]);
    
    const rejectMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: '已取消記錄。請重新描述您的活動，我會再次為您解析。',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, rejectMessage]);
  };

  const getCategoryName = (category: string): string => {
    const categoryNames: { [key: string]: string } = {
      transport: '交通運輸',
      energy: '能源消耗',
      accommodation: '住宿',
      catering: '餐飲',
      equipment: '設備器材',
      waste: '廢棄物',
      digital: '數位服務',
    };
    return categoryNames[category] || category;
  };

  const getStageName = (stage: string): string => {
    const stageNames: { [key: string]: string } = {
      'pre-production': '前期製作',
      'production': '拍攝階段',
      'post-production': '後期製作',
    };
    return stageNames[stage] || stage;
  };

  const getScopeName = (scope: string): string => {
    const scopeNames: { [key: string]: string } = {
      scope1: '範圍1',
      scope2: '範圍2',
      scope3: '範圍3',
    };
    return scopeNames[scope] || scope;
  };

  // 映射到營運類別
  const mapToOperationalCategory = (aiCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      'transport': 'scope3-commuting',
      'energy': 'scope2-electricity',
      'fuel': 'scope1-vehicles',
      'paper': 'scope3-paper',
      'waste': 'scope3-waste',
      'water': 'scope3-water',
    };
    return categoryMap[aiCategory] || 'scope2-electricity';
  };

  // 映射到營運排放源
  const mapToOperationalSource = (aiCategory: string, description: string): string => {
    if (aiCategory === 'transport' || description.includes('通勤')) {
      return 'employee-commuting-car';
    }
    if (aiCategory === 'energy' || description.includes('用電') || description.includes('電費')) {
      return 'office-electricity';
    }
    if (aiCategory === 'fuel' || description.includes('加油') || description.includes('汽油')) {
      return 'company-car-gasoline';
    }
    if (description.includes('紙') || description.includes('影印')) {
      return 'office-paper-a4';
    }
    return 'office-electricity';
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <View key={message.id} style={styles.messageContainer}>
        <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
          <View style={[
            styles.messageBubble,
            isUser ? styles.userBubble : isSystem ? styles.systemBubble : styles.assistantBubble
          ]}>
            <Text style={[
              styles.messageText,
              isUser && styles.userMessageText
            ]}>
              {message.content}
            </Text>
            
            {isSystem && pendingEmissions.length > 0 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleConfirmEmissions}
                  style={[styles.button, styles.confirmButton]}
                >
                  <Text style={styles.buttonText}>確認記錄</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setPendingEmissions([])}
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={styles.buttonText}>重新描述</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {message.timestamp.toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 標題欄 */}
      <LinearGradient
        colors={isOperationalMode ? ['#3B82F6', '#1D4ED8'] : ['#10B981', '#059669']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons 
            name={isOperationalMode ? "business" : "chatbubble-ellipses"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.headerTitle}>
            {isOperationalMode ? 'AI 營運記錄助手' : 'AI 碳排放助手'}
          </Text>
        </View>
        
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* 專案信息或營運模式提示 */}
      {isOperationalMode ? (
        <View style={styles.projectInfo}>
          <Text style={styles.projectText}>
            📊 日常營運排放記錄模式
          </Text>
        </View>
      ) : currentProject ? (
        <View style={styles.projectInfo}>
          <Text style={styles.projectText}>
            當前專案: {currentProject.name}
          </Text>
        </View>
      ) : null}

      {/* 消息列表 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.loadingText}>AI 正在分析中...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 輸入區域 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="描述您今天的活動..."
            multiline
            maxLength={500}
            style={styles.textInput}
          />
          
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() && !isLoading ? 'white' : 'gray'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  projectInfo: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  projectText: {
    color: '#1D4ED8',
    fontSize: 14,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
  },
  assistantBubble: {
    backgroundColor: '#F3F4F6',
  },
  systemBubble: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  userMessageText: {
    color: 'white',
  },
  buttonContainer: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#22C55E',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginLeft: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 96,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
}); 