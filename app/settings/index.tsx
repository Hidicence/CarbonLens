import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  Database, 
  Lock, 
  Info, 
  ChevronRight, 
  LogOut, 
  Moon, 
  Sun,
  HelpCircle,
  Bell,
  Languages,
  Trash2,
  RefreshCcw
} from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import { resetOnboarding } from '@/utils/onboardingManager';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { language, setLanguage, t } = useLanguageStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { deleteAllProjects } = useProjectStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logout.confirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.ok'),
          onPress: () => {
            logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('settings.delete.all'),
      t('settings.delete.all.confirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.delete'),
          onPress: () => {
            deleteAllProjects();
            Alert.alert(t('common.success'), t('settings.delete.all'));
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleLanguageChange = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLanguage);
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      '重置導引流程',
      '確定要重置導引流程嗎？下次啟動應用時將再次顯示導引。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確定', 
          onPress: async () => {
            try {
              await resetOnboarding();
              Alert.alert('成功', '導引流程已重置。請重啟應用以查看導引。');
            } catch (error) {
              console.error('重置導引流程失敗:', error);
              Alert.alert('錯誤', '重置導引流程失敗，請稍後再試。');
            }
          } 
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void,
    rightElement?: React.ReactNode,
    destructive: boolean = false
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        {icon}
        <Text style={[
          styles.settingItemTitle, 
          { color: destructive ? theme.error : theme.text }
        ]}>
          {title}
        </Text>
      </View>
      {rightElement || <ChevronRight size={20} color={theme.secondaryText} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('settings.title')} />
      
      <ScrollView style={styles.scrollView}>
        {isLoggedIn && user ? (
          <TouchableOpacity 
            style={[styles.profileCard, { backgroundColor: theme.card }]}
            onPress={() => router.push('/settings/profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileInfo}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
              </View>
              <View style={styles.profileText}>
                <Text style={[styles.profileName, { color: theme.text }]}>{user.name}</Text>
                <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>{user.email}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.secondaryText} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.loginPrompt, { backgroundColor: theme.card }]}
            onPress={() => router.push('/login')}
            activeOpacity={0.7}
          >
            <User size={24} color={theme.primary} />
            <Text style={[styles.loginPromptText, { color: theme.text }]}>{t('auth.login.or.register')}</Text>
            <ChevronRight size={20} color={theme.secondaryText} />
          </TouchableOpacity>
        )}

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>{t('settings.app')}</Text>
          
          {renderSettingItem(
            <Database size={20} color={theme.text} />,
            t('settings.database'),
            () => router.push('/settings/equipment-database')
          )}
          
          {renderSettingItem(
            isDarkMode ? <Sun size={20} color={theme.text} /> : <Moon size={20} color={theme.text} />,
            isDarkMode ? t('settings.theme.light') : t('settings.theme.dark'),
            toggleTheme,
            <View style={[styles.toggle, { backgroundColor: isDarkMode ? theme.primary + '80' : theme.border }]}>
              <View style={[styles.toggleCircle, { transform: [{ translateX: isDarkMode ? 16 : 0 }] }]} />
            </View>
          )}
          
          {renderSettingItem(
            <Languages size={20} color={theme.text} />,
            t('settings.language'),
            handleLanguageChange,
            <View style={styles.languageSelector}>
              <TouchableOpacity 
                style={[
                  styles.languageOption, 
                  { 
                    backgroundColor: language === 'zh' ? theme.primary : 'transparent',
                    borderColor: language === 'zh' ? theme.primary : theme.border
                  }
                ]}
                onPress={() => setLanguage('zh')}
              >
                <Text style={{ 
                  color: language === 'zh' ? '#FFFFFF' : theme.text,
                  fontWeight: language === 'zh' ? 'bold' : 'normal'
                }}>中文</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.languageOption, 
                  { 
                    backgroundColor: language === 'en' ? theme.primary : 'transparent',
                    borderColor: language === 'en' ? theme.primary : theme.border
                  }
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text style={{ 
                  color: language === 'en' ? '#FFFFFF' : theme.text,
                  fontWeight: language === 'en' ? 'bold' : 'normal'
                }}>EN</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {renderSettingItem(
            <Bell size={20} color={theme.text} />,
            t('settings.notifications'),
            () => Alert.alert(t('settings.notifications'), t('common.info'))
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>{t('settings.info')}</Text>
          
          {renderSettingItem(
            <Info size={20} color={theme.text} />,
            t('settings.about'),
            () => router.push('/settings/about')
          )}
          
          {renderSettingItem(
            <Lock size={20} color={theme.text} />,
            t('settings.privacy'),
            () => router.push('/settings/privacy')
          )}
          
          {renderSettingItem(
            <HelpCircle size={20} color={theme.text} />,
            t('settings.help'),
            () => Alert.alert(t('settings.help'), t('common.info'))
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>{t('settings.danger')}</Text>
          
          {renderSettingItem(
            <Trash2 size={20} color={theme.error} />,
            t('settings.delete.all'),
            handleDeleteAllData,
            <ChevronRight size={20} color={theme.error} />,
            true
          )}
          
          {isLoggedIn && renderSettingItem(
            <LogOut size={20} color={theme.error} />,
            t('settings.logout'),
            handleLogout,
            <ChevronRight size={20} color={theme.error} />,
            true
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.debug')}</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Pressable 
              style={styles.menuItem}
              onPress={handleResetOnboarding}
            >
              <View style={styles.menuItemContent}>
                <RefreshCcw size={20} color={theme.primary} style={styles.menuItemIcon} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>重置導引流程</Text>
              </View>
              <ChevronRight size={20} color={theme.secondaryText} />
            </Pressable>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>
            CarbonLens v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>
            © 2023 CarbonLens Team
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileText: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  loginPromptText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
});