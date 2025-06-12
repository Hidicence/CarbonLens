import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  MessageSquare, 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  Target,
  Users,
  CheckCircle,
  PlayCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import AIAssistant from '@/components/AIAssistant';
import Colors from '@/constants/colors';

export default function AIAssistantDemoScreen() {
  const router = useRouter();
  const { projects } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const activeProjects = projects.filter(p => p.status === 'active');

  const handleStartDemo = () => {
    if (activeProjects.length === 0) {
      Alert.alert(
        '需要專案',
        '使用 AI 助手需要至少一個專案。請先創建一個專案。',
        [
          { text: '取消', style: 'cancel' },
          { text: '創建專案', onPress: () => router.push('/new-project') }
        ]
      );
      return;
    }

    // 使用第一個活躍專案作為預設
    setSelectedProject(activeProjects[0].id);
    setShowAIAssistant(true);
  };

  const features = [
    {
      icon: <MessageSquare size={24} color="#10B981" />,
      title: '自然語言輸入',
      description: '用日常對話描述您的拍攝活動，AI 會自動理解並分類'
    },
    {
      icon: <Sparkles size={24} color="#8B5CF6" />,
      title: '智能解析',
      description: '自動識別排放類別、製作階段和數量，無需專業知識'
    },
    {
      icon: <Target size={24} color="#F59E0B" />,
      title: '精準分類',
      description: '基於影視行業專業知識，確保記錄的準確性和一致性'
    },
    {
      icon: <Zap size={24} color="#EF4444" />,
      title: '快速記錄',
      description: '3-5倍的記錄速度提升，讓碳足跡管理變得輕鬆簡單'
    }
  ];

  const examples = [
    {
      input: '今天開車到淡水拍攝，用了3台攝影機',
      output: '自動分類為：交通運輸 + 能源消耗（拍攝階段）'
    },
    {
      input: '訂了20個便當給劇組，住宿一晚',
      output: '自動分類為：餐飲服務 + 住宿（拍攝階段）'
    },
    {
      input: '運送器材到片場，包括燈光設備',
      output: '自動分類為：設備器材 + 交通運輸（拍攝階段）'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 標題欄 */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>AI 智能助手</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 主要介紹卡片 */}
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <MessageSquare size={48} color="white" />
            <Text style={styles.heroTitle}>AI 碳排放記錄助手</Text>
            <Text style={styles.heroSubtitle}>
              用自然語言描述拍攝活動，AI 自動幫您記錄碳足跡
            </Text>
            
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleStartDemo}
            >
              <PlayCircle size={20} color="#10B981" />
              <Text style={styles.demoButtonText}>立即體驗</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 核心功能 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>核心功能</Text>
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureItem, { borderBottomColor: theme.border }]}>
              <View style={styles.featureIcon}>
                {feature.icon}
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 使用示例 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>使用示例</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
            看看 AI 如何理解您的描述
          </Text>
          
          {examples.map((example, index) => (
            <View key={index} style={[styles.exampleItem, { backgroundColor: theme.background }]}>
              <View style={styles.exampleInput}>
                <Text style={[styles.exampleLabel, { color: theme.primary }]}>您說：</Text>
                <Text style={[styles.exampleText, { color: theme.text }]}>
                  「{example.input}」
                </Text>
              </View>
              
              <View style={styles.exampleOutput}>
                <Text style={[styles.exampleLabel, { color: '#10B981' }]}>AI 理解：</Text>
                <Text style={[styles.exampleText, { color: theme.text }]}>
                  {example.output}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 使用位置說明 */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>如何使用</Text>
          
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                在專案記錄頁面
              </Text>
              <Text style={[styles.stepDescription, { color: theme.secondaryText }]}>
                進入任何專案的記錄頁面，點擊右下角的綠色 AI 助手按鈕
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                自然語言描述
              </Text>
              <Text style={[styles.stepDescription, { color: theme.secondaryText }]}>
                用日常語言描述您的拍攝活動，例如「今天開車去拍攝」
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                確認並保存
              </Text>
              <Text style={[styles.stepDescription, { color: theme.secondaryText }]}>
                AI 解析結果後，確認信息並保存到您的專案記錄中
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* AI 助手模態框 */}
      <Modal
        visible={showAIAssistant}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <AIAssistant
          projectId={selectedProject || undefined}
          onEmissionCreated={(emission) => {
            console.log('演示：AI 助手創建排放記錄:', emission);
          }}
          onClose={() => setShowAIAssistant(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroCard: {
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  demoButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  exampleItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  exampleInput: {
    marginBottom: 8,
  },
  exampleOutput: {
    marginTop: 8,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpace: {
    height: 32,
  },
}); 