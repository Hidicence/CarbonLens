import React, { useState, useEffect } from 'react';
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
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error, clearError, isLoading } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  // Show error alert if there's an error
  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      clearError();
    }
  }, [error, clearError, t]);
  
  const handleRegister = async () => {
    // Validate inputs
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert(t('common.error'), t('auth.all.fields.required'));
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwords.not.match'));
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('common.error'), t('auth.invalid.email'));
      return;
    }
    
    // Password strength validation
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.password.too.short'));
      return;
    }
    
    try {
      await register(name, email, password);
      router.replace('/');
    } catch (error) {
      console.error("Registration error:", error);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleGoBack = () => {
    router.back();
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
          
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: theme.text }]}>{t('auth.create.account')}</Text>
            <Text style={[styles.formSubtitle, { color: theme.secondaryText }]}>
              {t('auth.register.subtitle')}
            </Text>
            
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }
              ]}>
                <User size={20} color={theme.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('auth.name')}
                  placeholderTextColor={theme.secondaryText}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
              
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
              
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }
              ]}>
                <Lock size={20} color={theme.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('auth.password')}
                  placeholderTextColor={theme.secondaryText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                  {showPassword ? (
                    <EyeOff size={20} color={theme.secondaryText} />
                  ) : (
                    <Eye size={20} color={theme.secondaryText} />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }
              ]}>
                <Lock size={20} color={theme.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('auth.confirm.password')}
                  placeholderTextColor={theme.secondaryText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={theme.secondaryText} />
                  ) : (
                    <Eye size={20} color={theme.secondaryText} />
                  )}
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.termsText, { color: theme.secondaryText }]}>
                {t('auth.terms.prefix')} 
                <Text style={[styles.termsLink, { color: theme.primary }]}>
                  {t('auth.terms.link')}
                </Text> 
                {t('auth.terms.and')} 
                <Text style={[styles.termsLink, { color: theme.primary }]}>
                  {t('auth.privacy.link')}
                </Text>
              </Text>
            </View>
            
            <Button
              title={t('auth.register')}
              onPress={handleRegister}
              variant="primary"
              loading={isLoading}
              style={styles.registerButton}
            />
            
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.secondaryText }]}>
                {t('auth.has.account')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginLink, { color: theme.primary }]}>
                  {t('auth.login')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  eyeIcon: {
    padding: 8,
  },
  termsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '500',
  },
  registerButton: {
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});