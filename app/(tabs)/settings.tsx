import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Switch, Alert, Image, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  Bell, 
  Globe, 
  HelpCircle, 
  Shield, 
  LogOut, 
  ChevronRight,
  Moon,
  Smartphone,
  Wifi,
  Trash2,
  Database,
  RefreshCcw,
  Settings as SettingsIcon,
  Activity,
  BarChart3,
  FileText,
  Info,
  ExternalLink,
  Building
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useProfileStore } from '@/store/profileStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import PageTitle from '@/components/PageTitle';
import { resetOnboarding } from '@/utils/onboardingManager';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '@/store/languageStore';

// const { width } = Dimensions.get('window'); // 移到組件內部

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { profile } = useProfileStore();
  const { projects, nonProjectEmissionRecords, allocationRecords, deleteAllProjects } = useProjectStore();
  const { logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(false);

  const theme = isDarkMode ? Colors.dark : Colors.light;

  // 計算統計數據
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalRecords: nonProjectEmissionRecords.length,
    totalAllocations: allocationRecords.length
  };

  const handleClearData = () => {
  const { t } = useTranslation();

    Alert.alert(
      t('settings.delete.all'),
      t('settings.delete.all.confirm'),
      [
        {
          text: t('common.cancel'),
          style: "cancel"
        },
        { 
          text: t('common.confirm'), 
          onPress: () => {
            deleteAllProjects();
            Alert.alert(t('common.success'), t('settings.clear.success.desc'));
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logout.confirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: t('common.confirm'), 
          onPress: async () => {
            console.log("🚪 開始登出流程...");
            
            try {
              // 執行登出
              await logout();
              console.log("✅ 登出成功");
              
              // 強制導航到登入頁面
              console.log("🔄 導航到登入頁面...");
                router.replace('/login');
              
            } catch (error) {
              console.error("❌ 登出失敗:", error);
              Alert.alert('錯誤', '登出失敗，請重試');
            }
          }
        }
      ]
    );
  };

  const navigateToProfile = () => {
    router.push('/settings/profile');
  };

  const navigateToPrivacySecurity = () => {
    router.push('/settings/privacy');
  };

  const navigateToAbout = () => {
    router.push('/settings/about');
  };

  const navigateToDatabase = () => {
    router.push('/settings/database');
  };

  const navigateToOrganization = () => {
    router.push('/settings/organization');
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      t('settings.onboarding'),
      t('settings.onboarding.confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          onPress: async () => {
            try {
              await resetOnboarding();
              Alert.alert(t('settings.onboarding.success'), t('settings.onboarding.success.desc'));
            } catch (error) {
              console.error('重置導引流程失敗:', error);
              Alert.alert(t('settings.onboarding.error'), t('settings.onboarding.error.desc'));
            }
          } 
        },
      ]
    );
  };

  // 渲染頁面標題
  const renderPageHeader = () => (
    <View style={styles.pageHeader}>
      <View style={styles.headerContent}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>{t('settings.page.title')}</Text>
        <Text style={[styles.pageSubtitle, { color: theme.secondaryText }]}>{t('settings.page.subtitle')}</Text>
      </View>
      <View style={[styles.headerIconContainer, { backgroundColor: theme.primary + '20' }]}>
        <SettingsIcon size={24} color={theme.primary} />
      </View>
    </View>
  );

  // 渲染統計概覽
  const renderStatsOverview = () => (
    <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
      <View style={styles.statsHeader}>
        <View style={styles.statsHeaderLeft}>
          <Activity size={18} color={theme.primary} />
          <Text style={[styles.statsTitle, { color: theme.text }]}>{t('settings.stats.title')}</Text>
        </View>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { backgroundColor: theme.background }]}>
          <View style={[styles.statIconContainer, { backgroundColor: theme.primary + '15' }]}>
            <FileText size={16} color={theme.primary} />
          </View>
          <Text style={[styles.statValue, { color: theme.primary }]}>{stats.totalProjects}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('settings.stats.totalProjects')}</Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.background }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#34C759' + '15' }]}>
            <BarChart3 size={16} color="#34C759" />
          </View>
          <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.activeProjects}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('settings.stats.activeProjects')}</Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.background }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FF9500' + '15' }]}>
            <Database size={16} color="#FF9500" />
          </View>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>{stats.totalRecords}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('settings.stats.totalRecords')}</Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.background }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#007AFF' + '15' }]}>
            <Activity size={16} color="#007AFF" />
          </View>
          <Text style={[styles.statValue, { color: '#007AFF' }]}>{stats.totalAllocations}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t('settings.stats.totalAllocations')}</Text>
        </View>
      </View>
    </View>
  );

  // 渲染用戶資料卡片
  const renderProfileCard = () => (
    <View style={[
      styles.profileCard, 
      { 
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border + '20',
      }
    ]}>
      <LinearGradient
        colors={[theme.primary + '10', theme.primary + '05']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />
             <Pressable 
         style={({ pressed }) => [
           styles.profileContent,
           { opacity: pressed ? 0.8 : 1 }
         ]}
         onPress={navigateToProfile}
       >
        <View style={styles.profileLeft}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[
              styles.avatarPlaceholder, 
              { 
                backgroundColor: theme.primary,
                borderWidth: 3,
                borderColor: '#FFFFFF',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }
            ]}>
              <Text style={styles.avatarText}>
                {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[
              styles.profileName, 
              { 
                color: theme.text,
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 6,
              }
            ]}>
              {profile?.name || t('settings.profile.defaultName')}
            </Text>
            <Text style={[
              styles.profileEmail, 
              { 
                color: theme.secondaryText,
                fontSize: 15,
                fontWeight: '500',
                marginBottom: 8,
              }
            ]}>
              {profile?.email || t('settings.profile.defaultEmail')}
            </Text>
            <View style={styles.profileBadgeContainer}>
              <View style={[
                styles.profileBadge, 
                { 
                  backgroundColor: theme.primary + '20',
                  borderWidth: 1,
                  borderColor: theme.primary + '40',
                }
              ]}>
                <Text style={[
                  styles.profileBadgeText, 
                  { 
                    color: theme.primary,
                    fontWeight: '600',
                  }
                ]}>
                  {profile?.role || t('settings.profile.defaultRole')}
                </Text>
              </View>
              <Text style={[
                styles.profileCompany, 
                { 
                  color: theme.secondaryText,
                  fontSize: 13,
                  fontWeight: '500',
                }
              ]}>
                {profile?.company || t('settings.profile.defaultCompany')}
              </Text>
            </View>
          </View>
        </View>
                 <View style={[
           styles.chevronContainer, 
           { 
             backgroundColor: theme.primary + '15',
             borderWidth: 1,
             borderColor: theme.primary + '30',
           }
         ]}>
           <ChevronRight size={20} color={theme.primary} />
        </View>
      </Pressable>
    </View>
  );

  // 渲染設定分組
  const renderSettingGroup = (title: string, items: Array<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
    isDangerous?: boolean;
  }>) => (
    <View style={styles.settingGroup}>
      <Text style={[styles.groupTitle, { color: theme.text }]}>{title}</Text>
      <View style={[
        styles.groupCard, 
        { 
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border + '20',
        }
      ]}>
        {items.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.settingItem,
              { 
                backgroundColor: pressed ? theme.primary + '10' : 'transparent',
                borderBottomWidth: index === items.length - 1 ? 0 : 1,
                borderBottomColor: theme.border + '30',
                borderRadius: index === 0 ? 12 : index === items.length - 1 ? 12 : 0,
                borderTopLeftRadius: index === 0 ? 12 : 0,
                borderTopRightRadius: index === 0 ? 12 : 0,
                borderBottomLeftRadius: index === items.length - 1 ? 12 : 0,
                borderBottomRightRadius: index === items.length - 1 ? 12 : 0,
                marginHorizontal: 2,
                marginVertical: index === 0 ? 2 : index === items.length - 1 ? 2 : 0,
                paddingVertical: 18,
                paddingHorizontal: 18,
              }
            ]}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <View style={styles.settingItemLeft}>
              <View style={[
                styles.settingIconContainer, 
                {
                  backgroundColor: item.isDangerous 
                    ? theme.error + '15' 
                    : theme.primary + '15',
                  borderWidth: 1,
                  borderColor: item.isDangerous 
                    ? theme.error + '30' 
                    : theme.primary + '30',
                }
              ]}>
                {item.icon}
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[
                  styles.settingItemTitle, 
                  { 
                    color: item.isDangerous ? theme.error : theme.text,
                    fontSize: 16,
                    fontWeight: '600',
                    marginBottom: 4,
                  }
                ]}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={[
                    styles.settingItemSubtitle, 
                    { 
                      color: theme.secondaryText,
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: '400',
                    }
                  ]}>
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.settingItemRight}>
              {item.rightComponent}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderPageHeader()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStatsOverview()}
        {renderProfileCard()}

        {renderSettingGroup(t('settings.group.account'), [
          {
            icon: <User size={18} color={theme.primary} />,
            title: t('settings.profile'),
            subtitle: t('settings.profile.subtitle'),
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToProfile
          },
          {
            icon: <Building size={18} color={theme.primary} />,
            title: t('settings.organization'),
            subtitle: t('settings.organization.subtitle'),
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToOrganization
          },
          {
            icon: <Shield size={18} color={theme.primary} />,
            title: t('settings.privacy'),
            subtitle: t('settings.privacy.subtitle'),
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToPrivacySecurity
          }
        ])}

        {renderSettingGroup(t('settings.group.app'), [
          {
            icon: <Bell size={18} color={theme.primary} />,
            title: t('settings.notifications'),
            subtitle: t('settings.notifications.subtitle'),
            rightComponent: (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: theme.primary + '60' }}
                thumbColor={notificationsEnabled ? theme.primary : theme.secondaryText}
                ios_backgroundColor={theme.border}
              />
            )
          },
          {
            icon: <Moon size={18} color={theme.primary} />,
            title: t('settings.theme'),
            subtitle: t('settings.theme.subtitle'),
            rightComponent: (
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary + '60' }}
                thumbColor={isDarkMode ? theme.primary : theme.secondaryText}
                ios_backgroundColor={theme.border}
              />
            )
          },
          {
            icon: <Wifi size={18} color={theme.primary} />,
            title: t('settings.offline'),
            subtitle: t('settings.offline.subtitle'),
            rightComponent: (
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{ false: theme.border, true: theme.primary + '60' }}
                thumbColor={offlineMode ? theme.primary : theme.secondaryText}
                ios_backgroundColor={theme.border}
              />
            )
          },
          {
            icon: <Globe size={18} color={theme.primary} />,
            title: t('settings.language'),
            subtitle: t('settings.language.subtitle'),
            rightComponent: (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable 
                  style={{
                    borderWidth: 1,
                    borderColor: language === 'zh' ? theme.primary : theme.border,
                      backgroundColor: language === 'zh' ? theme.primary : 'transparent',
                    borderRadius: 8,
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    marginRight: 6,
                  }}
                  onPress={() => setLanguage('zh')}
                >
                  <Text style={{ color: language === 'zh' ? '#fff' : theme.text, fontWeight: language === 'zh' ? 'bold' : 'normal' }}>中文</Text>
                </Pressable>
                <Pressable 
                  style={{
                    borderWidth: 1,
                    borderColor: language === 'en' ? theme.primary : theme.border,
                      backgroundColor: language === 'en' ? theme.primary : 'transparent',
                    borderRadius: 8,
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                  }}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={{ color: language === 'en' ? '#fff' : theme.text, fontWeight: language === 'en' ? 'bold' : 'normal' }}>EN</Text>
                </Pressable>
              </View>
            )
          }
        ])}

        {renderSettingGroup(t('settings.group.data'), [
          {
            icon: <Database size={18} color={theme.primary} />,
            title: t('settings.database'),
            subtitle: t('settings.database.subtitle'),
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToDatabase
          },
          {
            icon: <RefreshCcw size={18} color={theme.primary} />,
            title: t('settings.onboarding'),
            subtitle: t('settings.onboarding.subtitle'),
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: handleResetOnboarding
          },
          {
            icon: <Trash2 size={18} color={theme.error} />,
            title: t('settings.delete.all'),
            subtitle: t('settings.delete.all.subtitle'),
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: handleClearData,
            isDangerous: true
          }
        ])}

        {renderSettingGroup(t('settings.group.support'), [
          {
            icon: <HelpCircle size={18} color={theme.primary} />,
            title: t('settings.about'),
            subtitle: t('settings.about.subtitle'),
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToAbout
          },
          {
            icon: <ExternalLink size={18} color={theme.primary} />,
            title: t('settings.support'),
            subtitle: t('settings.support.subtitle'),
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: () => Alert.alert(t('settings.support'), t('settings.support.coming'))
          }
        ])}

        {/* 登出按鈕 */}
        <View style={styles.logoutSection}>
          <Pressable 
            style={[styles.logoutButton, { backgroundColor: theme.card }]}
            onPress={handleLogout}
          >
            <View style={[styles.logoutIconContainer, { backgroundColor: theme.error + '15' }]}>
              <LogOut size={18} color={theme.error} />
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={[styles.logoutText, { color: theme.error }]}>{t('settings.logout')}</Text>
              <Text style={[styles.logoutSubtext, { color: theme.secondaryText }]}>{t('settings.logout.subtitle')}</Text>
            </View>
          </Pressable>
        </View>

        {/* 版本信息 */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.secondaryText }]}>{t('settings.version')}</Text>
          <Text style={[styles.copyrightText, { color: theme.secondaryText }]}>{t('settings.copyright')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  profileBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileCompany: {
    fontSize: 13,
    fontWeight: '500',
  },
  chevronContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingGroup: {
    marginBottom: 32,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  groupCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingItemSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  logoutSubtext: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
});