import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, Building, MapPin, Camera, X, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/Header';
export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const { profile, updateProfile } = useProfileStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || user?.name || '',
    email: profile.email || user?.email || '',
    phone: profile.phone || '',
    company: profile.company || '',
    position: profile.position || '',
    location: profile.location || '',
    avatar: profile.avatar || user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: profile.role || user?.role || '',
  });
  
  // 當auth store中的用戶信息更新時，更新表單數據
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: profile.name || user.name || prevData.name,
        email: profile.email || user.email || prevData.email,
        avatar: profile.avatar || user.avatar || prevData.avatar,
        role: profile.role || user.role || prevData.role,
      }));
    }
  }, [user, profile]);
  
  const handleChange = (field: string, value: string) => {

    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 更新個人資料
    updateProfile({
      ...formData,
      role: formData.role || 'user'
    });
    
    // 如果authStore提供了更新用戶資料的方法，也更新它
    try {
      const authState = useAuthStore.getState();
      if (authState.updateProfile) {
        authState.updateProfile({
          name: formData.name,
          avatar: formData.avatar
        });
      }
    } catch (error) {
      console.error('更新Auth用戶信息失敗:', error);
    }
    
    // 完成更新
    setTimeout(() => {
      setIsEditing(false);
      setIsLoading(false);
      Alert.alert(t('common.success'), t('profile.update.success'));
    }, 1000);
  };
  
  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      company: profile.company || '',
      position: profile.position || '',
      location: profile.location || '',
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: profile.role || '',
    });
    setIsEditing(false);
  };
  
  const pickImage = async () => {
    if (!isEditing) return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('avatar', result.assets[0].uri);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={t('profile.title')} 
        showBackButton 
        onBackPress={() => router.back()}
        textColor={theme.text}
        iconColor={theme.text}
        rightComponent={
          isEditing ? (
            isLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                  <X size={24} color={theme.error} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[styles.headerButton, { marginLeft: 16 }]}>
                  <Check size={24} color={theme.success} />
                </TouchableOpacity>
              </View>
            )
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Text style={[styles.editButtonText, { color: theme.primary }]}>{t('profile.edit')}</Text>
            </TouchableOpacity>
          )
        }
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: formData.avatar }} style={styles.avatar} />
              {isEditing && (
                <View style={styles.cameraIconContainer}>
                  <Camera size={20} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.profileName, { color: theme.text }]}>
            {profile.name || t('profile.name.default')}
          </Text>
          
          {profile.position && profile.company && (
            <Text style={[styles.profilePosition, { color: theme.secondaryText }]}>
              {profile.position} @ {profile.company}
            </Text>
          )}
        </View>
        
        <View style={styles.formContainer}>
          <View style={[styles.formGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputContainer}>
              <User size={20} color={theme.secondaryText} />
              <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>{t('profile.field.name')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder={t('profile.placeholder.name')}
                placeholderTextColor={theme.placeholder}
              />
            ) : (
              <Text style={[styles.inputValue, { color: theme.text }]}>
                {profile.name || t('profile.placeholder.notSet')}
              </Text>
            )}
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputContainer}>
              <Mail size={20} color={theme.secondaryText} />
              <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>{t('profile.field.email')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder={t('profile.placeholder.email')}
                placeholderTextColor={theme.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.inputValue, { color: theme.text }]}>
                {profile.email || t('profile.placeholder.notSet')}
              </Text>
            )}
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputContainer}>
              <Phone size={20} color={theme.secondaryText} />
              <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>{t('profile.field.phone')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                placeholder={t('profile.placeholder.phone')}
                placeholderTextColor={theme.placeholder}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.inputValue, { color: theme.text }]}>
                {profile.phone || t('profile.placeholder.notSet')}
              </Text>
            )}
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputContainer}>
              <Building size={20} color={theme.secondaryText} />
              <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>{t('profile.field.company')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
                value={formData.company}
                onChangeText={(text) => handleChange('company', text)}
                placeholder={t('profile.placeholder.company')}
                placeholderTextColor={theme.placeholder}
              />
            ) : (
              <Text style={[styles.inputValue, { color: theme.text }]}>
                {profile.company || t('profile.placeholder.notSet')}
              </Text>
            )}
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputContainer}>
              <User size={20} color={theme.secondaryText} />
              <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>{t('profile.field.position')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
                value={formData.position}
                onChangeText={(text) => handleChange('position', text)}
                placeholder={t('profile.placeholder.position')}
                placeholderTextColor={theme.placeholder}
              />
            ) : (
              <Text style={[styles.inputValue, { color: theme.text }]}>
                {profile.position || t('profile.placeholder.notSet')}
              </Text>
            )}
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={theme.secondaryText} />
              <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>{t('profile.field.location')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
                value={formData.location}
                onChangeText={(text) => handleChange('location', text)}
                placeholder={t('profile.placeholder.location')}
                placeholderTextColor={theme.placeholder}
              />
            ) : (
              <Text style={[styles.inputValue, { color: theme.text }]}>
                {profile.location || t('profile.placeholder.notSet')}
              </Text>
            )}
          </View>
        </View>
        
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>{t('profile.save')}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profilePosition: {
    fontSize: 16,
  },
  formContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  formGroup: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  inputValue: {
    fontSize: 16,
    paddingVertical: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});