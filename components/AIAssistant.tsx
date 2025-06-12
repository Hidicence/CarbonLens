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
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Send, Sparkles, Building2, Zap, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AIService from '@/services/aiService';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

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
  const [inputHeight, setInputHeight] = useState(50);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const { projects, addProjectEmissionRecord, addNonProjectEmissionRecord } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const currentProject = projectId ? projects.find(p => p.id === projectId) : null;
  const isOperationalMode = mode === 'operational';

  // 動畫值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // 進場動畫
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 根據模式顯示不同的歡迎消息
    const welcomeMessage = isOperationalMode ? 
      '您好！我是您的智能營運碳排放助手 🏢✨\n\n我可以幫您記錄和分析公司的日常營運碳排放，並自動分攤到各個專案中。\n\n💡 試試這些描述：\n• 「這個月辦公室用電1200度」\n• 「員工通勤，平均每天20人次開車」\n• 「公司車輛加油50公升」\n• 「採購影印紙10箱」' :
      `您好！我是您的專案碳排放智能助手 🌱✨\n\n${currentProject ? `正在為專案「${currentProject.name}」` : '我將幫您'}記錄和分析碳排放數據。\n\n💡 試試這些描述：\n• 「今天開車到淡水拍攝，用了3台攝影機」\n• 「訂了20個便當給劇組」\n• 「住宿一晚在台北」\n• 「租用發電機5小時」`;

    setTimeout(() => {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      }]);
    }, 300);
  }, [isOperationalMode, currentProject]);

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
    setInputHeight(50);
    setIsLoading(true);

    try {
      // 準備上下文
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
          content: '🤔 我需要一些額外信息來更準確地計算：\n\n' + result.questions.map((q, i) => `${i + 1}. ${q}`).join('\n'),
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
        content: '😅 抱歉，我暫時無法理解您的描述。\n\n請嘗試用更具體的方式描述，例如：\n• 「開車50公里到拍攝地點」\n• 「使用攝影設備5小時」\n• 「訂購30個便當」',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const showEmissionConfirmation = (emissions: any[]) => {
    const recordType = isOperationalMode ? '營運排放記錄' : '專案排放記錄';
    const confirmationText = `✨ 我幫您解析出以下${recordType}：\n\n${
      emissions.map((emission, index) => 
        `📋 ${index + 1}. ${emission.description}\n` +
        `   🏷️ 類別: ${getCategoryName(emission.category)}\n` +
        (isOperationalMode ? 
          `   📊 範圍: ${getScopeName(emission.scope || 'scope2')}\n` :
          `   🎬 階段: ${getStageName(emission.stage)}\n`) +
        `   📈 ${emission.amount ? `數量: ${emission.amount} ${emission.unit || ''}` : '數量待補充'}\n`
      ).join('\n')
    }\n💾 要將這些記錄保存到系統中嗎？`;

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
          isAllocated: true,
          allocationRule: {
            method: 'budget' as const,
            targetProjects: [],
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
        content: `🎉 太棒了！已成功記錄 ${pendingEmissions.length} 筆營運排放數據！\n\n✅ 這些記錄將自動分攤到進行中的專案\n📊 您可以在分析頁面查看詳細統計\n💬 繼續告訴我其他營運活動吧！`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, successMessage]);
    } else {
      // 專案記錄模式
      if (!projectId) {
        Alert.alert('錯誤', '無法找到專案信息');
        return;
      }

      pendingEmissions.forEach(emission => {
        const projectRecord = {
          projectId,
          categoryId: emission.category,
          sourceId: emission.category,
          amount: emission.amount || 0,
          quantity: emission.quantity || emission.amount || 0,
          unit: emission.unit || 'kg',
          date: new Date().toISOString().split('T')[0],
          description: emission.description,
          stage: emission.stage || 'production',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addProjectEmissionRecord(projectRecord);
        onEmissionCreated?.(projectRecord);
      });

      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🎉 完美！已成功為專案「${currentProject?.name}」記錄 ${pendingEmissions.length} 筆排放數據！\n\n✅ 數據已保存到系統中\n📊 您可以在專案詳情中查看統計\n💬 還有其他活動要記錄嗎？`,
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
      content: '好的，讓我們重新開始。請用更詳細的方式描述您的活動，我會盡力理解並提供準確的碳排放計算。',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, rejectMessage]);
  };

  const getCategoryName = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'transport': '交通運輸',
      'energy': '能源消耗',
      'accommodation': '住宿',
      'food': '餐飲',
      'equipment': '設備器材',
      'waste': '廢棄物處理',
      'fuel': '燃料使用',
    };
    return categoryMap[category] || category;
  };

  const getStageName = (stage: string): string => {
    const stageMap: { [key: string]: string } = {
      'pre-production': '前期製作',
      'production': '拍攝製作',
      'post-production': '後期製作',
    };
    return stageMap[stage] || stage;
  };

  const getScopeName = (scope: string): string => {
    const scopeMap: { [key: string]: string } = {
      'scope1': 'Scope 1 (直接排放)',
      'scope2': 'Scope 2 (間接排放-電力)',
      'scope3': 'Scope 3 (其他間接排放)',
    };
    return scopeMap[scope] || scope;
  };

  const mapToOperationalCategory = (aiCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      'transport': 'transport',
      'energy': 'energy',
      'fuel': 'fuel',
      'office': 'office-supplies',
    };
    return categoryMap[aiCategory] || 'energy';
  };

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
      <Animated.View 
        key={message.id} 
        style={[
          styles.messageContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
          {!isUser && (
            <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
              <Bot size={16} color={theme.primary} />
            </View>
          )}
          
          <View style={[
            styles.messageBubble,
            isUser ? [styles.userBubble, { backgroundColor: theme.primary }] : 
            isSystem ? [styles.systemBubble, { 
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderColor: theme.primary + '40'
            }] : [styles.assistantBubble, { backgroundColor: theme.card }]
          ]}>
            <Text style={[
              styles.messageText,
              { color: isUser ? '#FFFFFF' : theme.text },
              isSystem && { color: theme.primary }
            ]}>
              {message.content}
            </Text>
            
            {isSystem && pendingEmissions.length > 0 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleConfirmEmissions}
                  style={[styles.actionButton, styles.confirmButton, { backgroundColor: theme.primary }]}
                  activeOpacity={0.8}
                >
                  <CheckCircle size={16} color="#FFFFFF" />
                  <Text style={styles.buttonText}>確認記錄</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleRejectEmissions}
                  style={[styles.actionButton, styles.cancelButton, { 
                    backgroundColor: 'transparent',
                    borderColor: theme.border,
                    borderWidth: 1
                  }]}
                  activeOpacity={0.8}
                >
                  <XCircle size={16} color={theme.secondaryText} />
                  <Text style={[styles.buttonText, { color: theme.secondaryText }]}>重新描述</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {isUser && (
            <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.userAvatar, { color: theme.primary }]}>您</Text>
            </View>
          )}
        </View>
        
        <View style={[styles.timestampContainer, isUser && styles.userTimestampContainer]}>
          <Clock size={10} color={theme.secondaryText} />
          <Text style={[styles.timestamp, { color: theme.secondaryText }]}>
            {message.timestamp.toLocaleTimeString('zh-TW', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 現代化標題欄 */}
      <LinearGradient
        colors={isOperationalMode ? 
          isDarkMode ? ['#1E40AF', '#1D4ED8'] : ['#3B82F6', '#1D4ED8'] :
          isDarkMode ? ['#059669', '#10B981'] : ['#10B981', '#059669']
        }
        style={styles.header}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                {isOperationalMode ? 
                  <Building2 size={24} color="white" /> : 
                  <Sparkles size={24} color="white" />
                }
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {isOperationalMode ? 'AI 營運助手' : 'AI 碳排放助手'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {isOperationalMode ? '智能營運記錄' : currentProject ? currentProject.name : '專案記錄'}
                </Text>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>在線</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {/* 消息列表 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
            <View style={[styles.loadingBubble, { backgroundColor: theme.card }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
                AI 正在思考中...
              </Text>
              <View style={styles.loadingDots}>
                <Animated.View style={[styles.dot, { backgroundColor: theme.primary }]} />
                <Animated.View style={[styles.dot, { backgroundColor: theme.primary }]} />
                <Animated.View style={[styles.dot, { backgroundColor: theme.primary }]} />
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* 現代化輸入區域 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inputContainer, { backgroundColor: theme.card }]}
      >
        <BlurView intensity={10} style={styles.inputBlur}>
          <View style={styles.inputRow}>
            <View style={[styles.inputWrapper, { 
              backgroundColor: theme.background,
              borderColor: theme.border
            }]}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={isOperationalMode ? 
                  "描述您的營運活動..." : 
                  "描述您今天的拍攝活動..."
                }
                placeholderTextColor={theme.secondaryText}
                multiline
                maxLength={500}
                style={[styles.textInput, { 
                  color: theme.text,
                  height: Math.max(50, inputHeight)
                }]}
                onContentSizeChange={(e) => {
                  setInputHeight(Math.min(120, Math.max(50, e.nativeEvent.contentSize.height + 20)));
                }}
              />
              
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                style={[
                  styles.sendButton,
                  { backgroundColor: inputText.trim() && !isLoading ? theme.primary : theme.border }
                ]}
                activeOpacity={0.8}
              >
                <Send 
                  size={20} 
                  color={inputText.trim() && !isLoading ? 'white' : theme.secondaryText} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputHint}>
            <Zap size={12} color={theme.secondaryText} />
            <Text style={[styles.hintText, { color: theme.secondaryText }]}>
              {isOperationalMode ? 
                "支持自然語言描述營運活動，AI會自動計算碳排放" :
                "支持自然語言描述拍攝活動，AI會自動分類和計算"
              }
            </Text>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerBlur: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  userAvatar: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    borderBottomLeftRadius: 6,
  },
  systemBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  confirmButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {},
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 48,
    gap: 4,
  },
  userTimestampContainer: {
    justifyContent: 'flex-end',
    marginLeft: 0,
    marginRight: 48,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingDots: {
    flexDirection: 'row',
    marginLeft: 8,
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputBlur: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    textAlignVertical: 'top',
    paddingVertical: 8,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
}); 