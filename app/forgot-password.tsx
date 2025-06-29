import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // 清除之前的錯誤
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  // 顯示錯誤警告（如果有）
  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      clearError();
    }
  }, [error, clearError, t]);
  
  const handleSubmit = async () => {
    // 驗證電子郵件
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.email.required'));
      return;
    }
    
    // 簡單的電子郵件驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('common.error'), t('auth.invalid.email'));
      return;
    }
    
    // 使用Firebase發送密碼重置郵件
    const success = await resetPassword(email);
    if (success) {
      setIsSubmitted(true);
    }
  };
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleReturnToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          
          {!isSubmitted ? (
            <View style={styles.formContainer}>
              <Text style={[styles.formTitle, { color: theme.text }]}>{t('auth.forgot.password')}</Text>
              <Text style={[styles.formSubtitle, { color: theme.secondaryText }]}>
                {t('auth.forgot.password.subtitle')}
              </Text>
              
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: theme.card,
                    borderColor: theme.border
                  }
                ]}>
                  <Mail size={20} color={theme.secondaryText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={t('auth.email')}
                    placeholderTextColor={theme.secondaryText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              
              <Button
                title={t('auth.reset.password')}
                onPress={handleSubmit}
                variant="primary"
                loading={isLoading}
                style={styles.submitButton}
              />
              
              <TouchableOpacity 
                style={styles.returnToLoginButton}
                onPress={handleReturnToLogin}
              >
                <Text style={[styles.returnToLoginText, { color: theme.secondaryText }]}>
                  {t('auth.return.to.login')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <View style={[styles.successIconContainer, { backgroundColor: theme.primary + '20' }]}>
                <CheckCircle size={64} color={theme.primary} />
              </View>
              
              <Text style={[styles.successTitle, { color: theme.text }]}>
                {t('auth.check.email')}
              </Text>
              
              <Text style={[styles.successMessage, { color: theme.secondaryText }]}>
                {t('auth.reset.email.sent')} {email}
              </Text>
              
              <Button
                title={t('auth.return.to.login')}
                onPress={handleReturnToLogin}
                variant="primary"
                style={styles.returnButton}
              />
              
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleSubmit}
              >
                <Text style={[styles.resendText, { color: theme.primary }]}>
                  {t('auth.resend.email')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  formSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  returnToLoginButton: {
    alignItems: 'center',
    padding: 12,
  },
  returnToLoginText: {
    fontSize: 14,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  returnButton: {
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  resendButton: {
    padding: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
  },
});