import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
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
import { useLanguageStore } from '@/store/languageStore';

export default function OrganizationSettingsScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { organization, updateOrganization } = useProfileStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [formData, setFormData] = useState(organization);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('organization.error.name.required'));
      return;
    }

    updateOrganization(formData);
    Alert.alert(
      t('organization.save.success'), 
      t('organization.save.success.desc'),
      [{ text: t('common.ok'), onPress: () => router.back() }]
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('organization.title')}</Text>
        <Pressable 
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Save size={16} color="white" />
          <Text style={styles.saveButtonText}>{t('organization.save')}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 基本資訊 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('organization.section.basic')}</Text>
            
            <InputField
              label={t('organization.field.name')}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder={t('organization.placeholder.name')}
              icon={Building}
              required
            />

            <InputField
              label={t('organization.field.industry')}
              value={formData.industry}
              onChangeText={(text) => setFormData({ ...formData, industry: text })}
              placeholder={t('organization.placeholder.industry')}
              icon={Target}
            />

            <InputField
              label={t('organization.field.boundary')}
              value={formData.reportingBoundary}
              onChangeText={(text) => setFormData({ ...formData, reportingBoundary: text })}
              placeholder={t('organization.placeholder.boundary')}
              icon={Globe}
              multiline
            />
          </View>

          {/* 聯絡資訊 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('organization.section.contact')}</Text>
            
            <InputField
              label={t('organization.field.contact')}
              value={formData.contactPerson}
              onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
              placeholder={t('organization.placeholder.contact')}
              icon={User}
            />

            <InputField
              label={t('organization.field.email')}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder={t('organization.placeholder.email')}
              icon={Mail}
              keyboardType="email-address"
            />

            <InputField
              label={t('organization.field.phone')}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder={t('organization.placeholder.phone')}
              icon={Phone}
              keyboardType="phone-pad"
            />

            <InputField
              label={t('organization.field.address')}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder={t('organization.placeholder.address')}
              icon={MapPin}
              multiline
            />

            <InputField
              label={t('organization.field.website')}
              value={formData.website || ''}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              placeholder={`${t('organization.placeholder.website')} ${t('organization.website.optional')}`}
              icon={Globe}
              keyboardType="url"
            />
          </View>

          {/* 減碳目標 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('organization.section.target')}</Text>
            
            <InputField
              label={t('organization.field.target.year')}
              value={formData.carbonNeutralTarget || ''}
              onChangeText={(text) => setFormData({ ...formData, carbonNeutralTarget: text })}
              placeholder={t('organization.placeholder.target.year')}
              icon={Target}
              keyboardType="numeric"
            />

            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <View style={styles.inputHeader}>
                <View style={styles.inputLabelContainer}>
                  <CheckCircle size={16} color={theme.primary} />
                  <Text style={[styles.inputLabel, { color: theme.text }]}>{t('organization.field.target.reduction')}</Text>
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
                  placeholder={t('organization.placeholder.target.reduction')}
                  keyboardType="numeric"
                />
                <Text style={[styles.sliderLabel, { color: theme.secondaryText }]}>
                  {t('organization.target.description').replace('{percent}', (formData.reductionGoal || 0).toString())}
                </Text>
              </View>
            </View>
          </View>

          {/* 說明 */}
          <View style={[styles.infoCard, { backgroundColor: theme.primary + '10' }]}>
            <View style={styles.infoHeader}>
              <Building size={16} color={theme.primary} />
              <Text style={[styles.infoTitle, { color: theme.primary }]}>{t('organization.info.title')}</Text>
            </View>
            <Text style={[styles.infoText, { color: theme.text }]}>
              {t('organization.info.description')}
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