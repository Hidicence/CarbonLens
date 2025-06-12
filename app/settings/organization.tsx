import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Target,
  Save,
  CheckCircle
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useProfileStore } from '@/store/profileStore';

export default function OrganizationSettingsScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { organization, updateOrganization } = useProfileStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [formData, setFormData] = useState(organization);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('錯誤', '請填寫組織名稱');
      return;
    }

    updateOrganization(formData);
    Alert.alert(
      '保存成功', 
      '組織資訊已更新',
      [{ text: '確定', onPress: () => router.back() }]
    );
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    icon: Icon,
    multiline = false,
    required = false,
    keyboardType = 'default' as any
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: any;
    multiline?: boolean;
    required?: boolean;
    keyboardType?: any;
  }) => (
    <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
      <View style={styles.inputHeader}>
        <View style={styles.inputLabelContainer}>
          <Icon size={16} color={theme.primary} />
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            {label}
            {required && <Text style={{ color: '#FF3B30' }}> *</Text>}
          </Text>
        </View>
      </View>
      <TextInput
        style={[
          styles.textInput,
          { 
            color: theme.text,
            backgroundColor: theme.background,
            borderColor: theme.border,
            height: multiline ? 80 : 44
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.secondaryText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>組織資訊</Text>
        <Pressable 
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Save size={16} color="white" />
          <Text style={styles.saveButtonText}>保存</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 基本資訊 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>基本資訊</Text>
            
            <InputField
              label="組織名稱"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="請輸入公司/組織名稱"
              icon={Building}
              required
            />

            <InputField
              label="行業類別"
              value={formData.industry}
              onChangeText={(text) => setFormData({ ...formData, industry: text })}
              placeholder="如：影視製作、廣告製作等"
              icon={Target}
            />

            <InputField
              label="盤查邊界"
              value={formData.reportingBoundary}
              onChangeText={(text) => setFormData({ ...formData, reportingBoundary: text })}
              placeholder="描述碳排放盤查的組織邊界"
              icon={Globe}
              multiline
            />
          </View>

          {/* 聯絡資訊 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>聯絡資訊</Text>
            
            <InputField
              label="負責人姓名"
              value={formData.contactPerson}
              onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
              placeholder="永續發展負責人"
              icon={User}
            />

            <InputField
              label="電子郵件"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="sustainability@company.com"
              icon={Mail}
              keyboardType="email-address"
            />

            <InputField
              label="聯絡電話"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="+886-2-xxxx-xxxx"
              icon={Phone}
              keyboardType="phone-pad"
            />

            <InputField
              label="公司地址"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="公司完整地址"
              icon={MapPin}
              multiline
            />

            <InputField
              label="公司網站"
              value={formData.website || ''}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              placeholder="https://www.company.com (選填)"
              icon={Globe}
              keyboardType="url"
            />
          </View>

          {/* 減碳目標 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>減碳目標</Text>
            
            <InputField
              label="碳中和目標年"
              value={formData.carbonNeutralTarget || ''}
              onChangeText={(text) => setFormData({ ...formData, carbonNeutralTarget: text })}
              placeholder="如：2030、2050"
              icon={Target}
              keyboardType="numeric"
            />

            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <View style={styles.inputHeader}>
                <View style={styles.inputLabelContainer}>
                  <CheckCircle size={16} color={theme.primary} />
                  <Text style={[styles.inputLabel, { color: theme.text }]}>減碳目標 (%)</Text>
                </View>
              </View>
              <View style={styles.sliderContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      color: theme.text,
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      width: 80,
                      textAlign: 'center'
                    }
                  ]}
                  value={formData.reductionGoal?.toString() || ''}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    setFormData({ ...formData, reductionGoal: Math.min(100, Math.max(0, value)) });
                  }}
                  placeholder="15"
                  keyboardType="numeric"
                />
                <Text style={[styles.sliderLabel, { color: theme.secondaryText }]}>
                  相較基準年減少 {formData.reductionGoal || 0}% 排放量
                </Text>
              </View>
            </View>
          </View>

          {/* 說明 */}
          <View style={[styles.infoCard, { backgroundColor: theme.primary + '10' }]}>
            <View style={styles.infoHeader}>
              <Building size={16} color={theme.primary} />
              <Text style={[styles.infoTitle, { color: theme.primary }]}>重要說明</Text>
            </View>
            <Text style={[styles.infoText, { color: theme.text }]}>
              這些資訊將用於生成專業的碳足跡報告，符合 ISO 14064-1:2018 和 GHG Protocol 國際標準。
              所有資訊均存儲在本地設備，不會上傳到服務器。
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  inputHeader: {
    marginBottom: 8,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 