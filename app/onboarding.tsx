import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import { AntDesign, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '@/store/projectStore';
import { completeOnboarding } from '@/utils/onboardingManager';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { DoneButtonProps, DotProps } from 'react-native-onboarding-swiper';

const { width, height } = Dimensions.get('window');

// 自定義"完成"按鈕
const DoneButton = ({ isLight, ...props }: DoneButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.doneButton,
        { backgroundColor: isLight ? Colors.dark.primary : Colors.light.primary }
      ]}
      {...props}
    >
      <Text style={styles.doneButtonText}>開始使用</Text>
    </TouchableOpacity>
  );
};

// 自定義點狀指示器
const CustomDot = ({ selected }: DotProps) => {
  return (
    <View
      style={{
        width: selected ? 16 : 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
        backgroundColor: selected ? Colors.light.primary : 'rgba(0, 0, 0, 0.3)',
      }}
    />
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const projectStore = useProjectStore();
  const [keepExamples, setKeepExamples] = useState(true);

  // 導引流程完成
  const handleDone = async () => {
    try {
      if (!keepExamples) {
        // 確認是否要刪除示例
        Alert.alert(
          '刪除示例資料？',
          '確定要刪除導引流程中的示例專案嗎？',
          [
            {
              text: '保留示例',
              style: 'cancel',
              onPress: () => finishOnboarding(true),
            },
            {
              text: '刪除',
              onPress: () => finishOnboarding(false),
            },
          ]
        );
      } else {
        finishOnboarding(keepExamples);
      }
    } catch (error) {
      console.error('完成導引流程出錯:', error);
      // 即使出錯也跳轉到主頁
      router.replace('/');
    }
  };

  // 完成導引流程並跳轉
  const finishOnboarding = async (keepSamples: boolean) => {
    await completeOnboarding(keepSamples, projectStore);
    router.replace('/');
  };

  // 切換是否保留示例
  const toggleKeepExamples = () => {
    setKeepExamples(!keepExamples);
  };

  return (
    <View style={styles.container}>
      <Onboarding
        onDone={handleDone}
        onSkip={handleDone}
        DoneButtonComponent={(props: DoneButtonProps) => <DoneButton {...props} />}
        DotComponent={CustomDot}
        bottomBarColor="transparent"
        containerStyles={styles.onboardingContainer}
        titleStyles={styles.title}
        subTitleStyles={styles.subTitle}
        pages={[
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={styles.welcomeImage}
                />
              </View>
            ),
            title: '歡迎使用CarbonLens',
            subtitle: '一個專為影視製作行業打造的碳排放追蹤工具，幫助您實現低碳環保的製作流程。',
          },
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <View style={styles.iconCircle}>
                  <FontAwesome5 name="project-diagram" size={50} color="#0ea5e9" />
                </View>
              </View>
            ),
            title: '專案管理',
            subtitle: '創建和管理您的影視專案，設定碳排放預算，追蹤每個製作階段的排放情況。我們已為您創建了示例專案供參考。',
          },
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="calculator-variant" size={50} color="#0ea5e9" />
                </View>
              </View>
            ),
            title: '排放計算',
            subtitle: '記錄各種活動的碳排放，包括運輸、設備用電、食宿等。系統會自動計算總排放量並提供視覺化報告。',
          },
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <View style={styles.iconCircle}>
                  <AntDesign name="linechart" size={50} color="#0ea5e9" />
                </View>
              </View>
            ),
            title: '數據分析',
            subtitle: '通過圖表和報表分析您的碳排放數據，找出改進空間，為未來項目制定更環保的策略。',
          },
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.featureContainer}>
                <LinearGradient
                  colors={['#f0f9ff', '#e0f7fa']}
                  style={styles.featureCard}
                >
                  <View style={styles.keepExamplesSection}>
                    <Text style={styles.featureTitle}>準備好了嗎？</Text>
                    <Text style={styles.featureDescription}>
                      您可以選擇在開始時保留或刪除示例專案。
                    </Text>
                    
                    <View style={styles.toggleContainer}>
                      <TouchableOpacity
                        style={[
                          styles.toggleOption,
                          keepExamples && styles.toggleOptionActive
                        ]}
                        onPress={() => setKeepExamples(true)}
                      >
                        <Ionicons 
                          name={keepExamples ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={keepExamples ? "#0ea5e9" : "#64748b"} 
                        />
                        <Text style={[
                          styles.toggleText,
                          keepExamples && styles.toggleTextActive
                        ]}>
                          保留示例專案
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.toggleOption,
                          !keepExamples && styles.toggleOptionActive
                        ]}
                        onPress={() => setKeepExamples(false)}
                      >
                        <Ionicons 
                          name={!keepExamples ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={!keepExamples ? "#0ea5e9" : "#64748b"} 
                        />
                        <Text style={[
                          styles.toggleText,
                          !keepExamples && styles.toggleTextActive
                        ]}>
                          刪除示例專案
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ),
            title: '開始您的低碳之旅',
            subtitle: '點擊"開始使用"按鈕，開始追蹤和減少您的碳足跡！',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  onboardingContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  featureContainer: {
    width: width * 0.8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  keepExamplesSection: {
    marginBottom: 10,
  },
  toggleContainer: {
    marginTop: 10,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  toggleOptionActive: {
    backgroundColor: '#e0f7fa',
  },
  toggleText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  doneButton: {
    marginHorizontal: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#0ea5e9',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 