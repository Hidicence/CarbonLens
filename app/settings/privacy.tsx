import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Server, 
  UserCheck, 
  FileText, 
  Mail,
  ExternalLink
} from 'lucide-react-native';
import Header from '@/components/Header';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

export default function PrivacyScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleOpenLink = (url: string) => {
    // For demo URLs, show an alert instead of trying to open them
    if (url.includes('carbonlens.example.com') || url.includes('example.com')) {
      Alert.alert(
        "示範應用",
        "這是一個示範連結，在實際應用中會連接到真實的網頁。",
        [{ text: "了解", style: "default" }]
      );
      return;
    }
    
    // For real URLs like mailto:, try to open them
    Linking.openURL(url).catch(err => {
      console.error("Couldn't load page", err);
      Alert.alert(
        "無法開啟連結",
        "無法開啟此連結，請稍後再試。",
        [{ text: "確定", style: "default" }]
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="隱私與安全" showBackButton />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Shield size={40} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>隱私與安全</Text>
          <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>
            我們致力於保護您的數據安全和隱私
          </Text>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>數據安全</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            CarbonLens 採用業界標準的加密技術保護您的數據。所有傳輸中的數據都使用 TLS/SSL 加密，
            存儲的數據也經過加密處理，確保您的專案信息和碳排放數據安全無虞。
          </Text>
          
          <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
            <Text style={[styles.infoBoxText, { color: theme.primary }]}>
              您的數據僅存儲在您的設備上，除非您選擇啟用雲同步功能。
            </Text>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Eye size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>隱私政策</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            我們的隱私政策清晰透明地說明了我們如何收集、使用和保護您的數據。
            我們只收集必要的信息來提供服務，不會將您的數據出售給第三方。
          </Text>
          
          <TouchableOpacity 
            style={[styles.linkButton, { borderColor: theme.border }]}
            onPress={() => handleOpenLink('https://carbonlens.example.com/privacy')}
          >
            <FileText size={16} color={theme.primary} />
            <Text style={[styles.linkButtonText, { color: theme.primary }]}>
              查看完整隱私政策
            </Text>
            <ExternalLink size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Database size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>數據控制</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            您對自己的數據擁有完全控制權。您可以隨時查看、導出或刪除您的數據。
            如果您選擇刪除帳戶，我們會徹底刪除與您相關的所有數據。
          </Text>
          
          <View style={styles.dataControlOptions}>
            <TouchableOpacity 
              style={[styles.dataControlButton, { backgroundColor: theme.background }]}
              onPress={() => router.push('/settings/data-export')}
            >
              <Text style={[styles.dataControlButtonText, { color: theme.text }]}>
                導出我的數據
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dataControlButton, { backgroundColor: theme.background }]}
              onPress={() => router.push('/settings/data-delete')}
            >
              <Text style={[styles.dataControlButtonText, { color: theme.error }]}>
                刪除我的數據
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Server size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>數據存儲</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            我們的服務器位於符合嚴格數據保護標準的地區。我們採用多層次的安全措施，
            包括定期安全審計、漏洞掃描和入侵檢測系統，確保您的數據安全。
          </Text>
          
          <View style={styles.storageInfo}>
            <View style={styles.storageInfoItem}>
              <Text style={[styles.storageInfoLabel, { color: theme.secondaryText }]}>
                數據中心位置:
              </Text>
              <Text style={[styles.storageInfoValue, { color: theme.text }]}>
                歐盟、亞太地區
              </Text>
            </View>
            
            <View style={styles.storageInfoItem}>
              <Text style={[styles.storageInfoLabel, { color: theme.secondaryText }]}>
                數據保留期限:
              </Text>
              <Text style={[styles.storageInfoValue, { color: theme.text }]}>
                帳戶活躍期間
              </Text>
            </View>
            
            <View style={styles.storageInfoItem}>
              <Text style={[styles.storageInfoLabel, { color: theme.secondaryText }]}>
                備份頻率:
              </Text>
              <Text style={[styles.storageInfoValue, { color: theme.text }]}>
                每日自動備份
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <UserCheck size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>帳戶安全</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            我們提供多種帳戶安全功能，包括雙因素認證、登錄通知和定期安全檢查。
            我們建議您啟用這些功能，並定期更新密碼，以確保帳戶安全。
          </Text>
          
          <TouchableOpacity 
            style={[styles.securityButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/settings/security')}
          >
            <Text style={styles.securityButtonText}>
              管理帳戶安全設置
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.contactCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.contactTitle, { color: theme.text }]}>
            有任何隱私或安全問題？
          </Text>
          <Text style={[styles.contactText, { color: theme.secondaryText }]}>
            如果您對我們的隱私政策或數據處理方式有任何疑問，請隨時聯繫我們的隱私團隊。
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { borderColor: theme.primary }]}
            onPress={() => handleOpenLink('mailto:privacy@carbonlens.example.com')}
          >
            <Mail size={16} color={theme.primary} />
            <Text style={[styles.contactButtonText, { color: theme.primary }]}>
              privacy@carbonlens.example.com
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>
            隱私政策最後更新日期: 2023年10月15日
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
  headerContainer: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoBox: {
    borderRadius: 8,
    padding: 12,
  },
  infoBoxText: {
    fontSize: 14,
    fontWeight: '500',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  dataControlOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataControlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dataControlButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  storageInfo: {
    marginTop: 8,
  },
  storageInfoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  storageInfoLabel: {
    fontSize: 14,
    width: 120,
  },
  storageInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  securityButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  securityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  contactButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
  },
});