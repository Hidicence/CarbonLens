import React from 'react';
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

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { profile } = useProfileStore();
  const { projects, nonProjectEmissionRecords, allocationRecords, deleteAllProjects } = useProjectStore();
  const { logout } = useAuthStore();
  
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
    Alert.alert(
      "清除所有資料",
      "此操作將刪除所有專案和碳排放記錄。此操作無法復原。",
      [
        {
          text: "取消",
          style: "cancel"
        },
        { 
          text: "確認清除", 
          onPress: () => {
            deleteAllProjects();
            Alert.alert("成功", "所有資料已清除");
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "登出",
      "確定要登出嗎？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "確定", 
          onPress: () => {
            console.log("Logging out...");
            logout();
            console.log("Navigating to login...");
            
            if (Platform.OS === 'web') {
              console.log("Web platform - forcing page reload");
              try {
                localStorage.clear();
                sessionStorage.clear();
                console.log("Storage cleared");
              } catch (e) {
                console.error("Failed to clear storage:", e);
              }
              
              setTimeout(() => {
                window.location.href = '/login?logout=true';
                setTimeout(() => {
                  console.log("Trying alternate navigation");
                  window.location.replace('/login?logout=true');
                }, 1000);
              }, 500);
            } else {
              setTimeout(() => {
                router.replace('/login');
              }, 100);
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
      '重置導引流程',
      '確定要重置導引流程嗎？下次啟動應用時將再次顯示導引。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確定', 
          onPress: async () => {
            try {
              await resetOnboarding();
              Alert.alert('成功', '導引流程已重置，請重啟應用以查看導引。');
            } catch (error) {
              console.error('重置導引流程失敗:', error);
              Alert.alert('錯誤', '重置導引流程失敗，請稍後再試。');
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
        <Text style={[styles.pageTitle, { color: theme.text }]}>系統設定</Text>
        <Text style={[styles.pageSubtitle, { color: theme.secondaryText }]}>
          管理您的帳戶和應用程式偏好設定
        </Text>
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
          <Text style={[styles.statsTitle, { color: theme.text }]}>系統使用狀況</Text>
        </View>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { backgroundColor: theme.background }]}>
          <View style={[styles.statIconContainer, { backgroundColor: theme.primary + '15' }]}>
            <FileText size={16} color={theme.primary} />
          </View>
          <Text style={[styles.statValue, { color: theme.primary }]}>{stats.totalProjects}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>總專案數</Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.background }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#34C759' + '15' }]}>
            <BarChart3 size={16} color="#34C759" />
          </View>
          <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.activeProjects}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>進行中</Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.background }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FF9500' + '15' }]}>
            <Database size={16} color="#FF9500" />
          </View>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>{stats.totalRecords}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>排放記錄</Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.background }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#007AFF' + '15' }]}>
            <Activity size={16} color="#007AFF" />
          </View>
          <Text style={[styles.statValue, { color: '#007AFF' }]}>{stats.totalAllocations}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>分攤記錄</Text>
        </View>
      </View>
    </View>
  );

  // 渲染個人資料卡片
  const renderProfileCard = () => (
    <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
      <Pressable onPress={navigateToProfile} style={styles.profileContent}>
        <View style={styles.profileLeft}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={[theme.primary, theme.primary + 'CC']}
              style={styles.avatarPlaceholder}
            >
              <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
            </LinearGradient>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>{profile.name}</Text>
            <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>{profile.email}</Text>
            <View style={styles.profileBadgeContainer}>
              <View style={[styles.profileBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.profileBadgeText, { color: theme.primary }]}>{profile.role}</Text>
              </View>
              <Text style={[styles.profileCompany, { color: theme.secondaryText }]}>{profile.role || '管理員'}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.chevronContainer, { backgroundColor: theme.background }]}>
          <ChevronRight size={18} color={theme.secondaryText} />
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
      <Text style={[styles.groupTitle, { color: theme.primary }]}>{title}</Text>
      <View style={[styles.groupCard, { backgroundColor: theme.card }]}>
        {items.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.settingItem,
              { 
                borderBottomWidth: index < items.length - 1 ? 1 : 0,
                borderBottomColor: theme.border + '40'
              },
              pressed && item.onPress && { backgroundColor: theme.highlight }
            ]}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <View style={styles.settingItemLeft}>
              <View style={[
                styles.settingIconContainer, 
                { backgroundColor: item.isDangerous ? theme.error + '15' : theme.primary + '15' }
              ]}>
                {item.icon}
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[
                  styles.settingItemTitle, 
                  { color: item.isDangerous ? theme.error : theme.text }
                ]}>
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text style={[styles.settingItemSubtitle, { color: theme.secondaryText }]}>
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

        {renderSettingGroup("帳戶管理", [
          {
            icon: <User size={18} color={theme.primary} />,
            title: "個人資料",
            subtitle: "編輯您的個人信息和偏好設定",
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToProfile
          },
          {
            icon: <Building size={18} color={theme.primary} />,
            title: "組織資訊",
            subtitle: "設定公司基本資訊和減碳目標",
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToOrganization
          },
          {
            icon: <Shield size={18} color={theme.primary} />,
            title: "隱私與安全",
            subtitle: "管理您的隱私設定和帳戶安全",
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToPrivacySecurity
          }
        ])}

        {renderSettingGroup("應用程式設定", [
          {
            icon: <Bell size={18} color={theme.primary} />,
            title: "通知",
            subtitle: "管理推送通知和提醒",
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
            title: "深色模式",
            subtitle: "切換淺色或深色主題",
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
            title: "離線模式",
            subtitle: "啟用離線數據同步功能",
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
            title: "語言",
            subtitle: "選擇應用程式介面語言",
            rightComponent: (
              <View style={styles.languageContainer}>
                <Text style={[styles.languageText, { color: theme.secondaryText }]}>繁體中文</Text>
                <ChevronRight size={18} color={theme.secondaryText} />
              </View>
            ),
            onPress: () => Alert.alert("提示", "語言設定功能即將推出")
          }
        ])}

        {renderSettingGroup("數據管理", [
          {
            icon: <Database size={18} color={theme.primary} />,
            title: "碳排放資料庫",
            subtitle: "查看和管理碳排放係數資料",
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToDatabase
          },
          {
            icon: <RefreshCcw size={18} color={theme.primary} />,
            title: "重置導引流程",
            subtitle: "重新顯示應用程式導引畫面",
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: handleResetOnboarding
          },
          {
            icon: <Trash2 size={18} color={theme.error} />,
            title: "清除所有資料",
            subtitle: "刪除所有專案和排放記錄（不可恢復）",
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: handleClearData,
            isDangerous: true
          }
        ])}

        {renderSettingGroup("說明與支援", [
          {
            icon: <HelpCircle size={18} color={theme.primary} />,
            title: "關於碳排放鏡頭",
            subtitle: "版本信息、使用條款和隱私政策",
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: navigateToAbout
          },
          {
            icon: <ExternalLink size={18} color={theme.primary} />,
            title: "技術支援",
            subtitle: "獲得技術協助和反饋渠道",
            rightComponent: <ChevronRight size={18} color={theme.secondaryText} />,
            onPress: () => Alert.alert("技術支援", "技術支援功能即將推出")
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
              <Text style={[styles.logoutText, { color: theme.error }]}>登出帳戶</Text>
              <Text style={[styles.logoutSubtext, { color: theme.secondaryText }]}>安全登出並返回登入頁面</Text>
            </View>
          </Pressable>
        </View>

        {/* 版本信息 */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.secondaryText }]}>CarbonLens v1.0.6</Text>
          <Text style={[styles.copyrightText, { color: theme.secondaryText }]}>© 2024 影視碳足跡管理平台</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
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
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 6,
  },
  profileBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  profileCompany: {
    fontSize: 12,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  groupCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 13,
    lineHeight: 18,
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
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  logoutSubtext: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
  },
});