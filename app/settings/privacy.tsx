import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleOpenLink = (url: string) => {

    // For demo URLs, show an alert instead of trying to open them
    if (url.includes('carbonlens.example.com') || url.includes('example.com')) {
      Alert.alert(
        t('privacy.demo.alert.title'),
        t('privacy.demo.alert.message'),
        [{ text: t('privacy.demo.alert.button'), style: "default" }]
      );
      return;
    }
    
    // For real URLs like mailto:, try to open them
    Linking.openURL(url).catch(err => {
      console.error("Couldn't load page", err);
      Alert.alert(
        t('privacy.link.error.title'),
        t('privacy.link.error.message'),
        [{ text: t('common.ok'), style: "default" }]
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('privacy.title')} showBackButton />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Shield size={40} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('privacy.header.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>
            {t('privacy.header.subtitle')}
          </Text>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacy.section.security')}</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            {t('privacy.security.description')}
          </Text>
          
          <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
            <Text style={[styles.infoBoxText, { color: theme.primary }]}>
              {t('privacy.security.info')}
            </Text>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Eye size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacy.section.policy')}</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            {t('privacy.policy.description')}
          </Text>
          
          <TouchableOpacity 
            style={[styles.linkButton, { borderColor: theme.border }]}
            onPress={() => handleOpenLink('https://carbonlens.example.com/privacy')}
          >
            <FileText size={16} color={theme.primary} />
            <Text style={[styles.linkButtonText, { color: theme.primary }]}>
              {t('privacy.policy.link')}
            </Text>
            <ExternalLink size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Database size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacy.section.control')}</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            {t('privacy.control.description')}
          </Text>
          
          <View style={styles.dataControlOptions}>
            <TouchableOpacity 
              style={[styles.dataControlButton, { backgroundColor: theme.background }]}
              onPress={() => router.push('/settings/data-export')}
            >
              <Text style={[styles.dataControlButtonText, { color: theme.text }]}>
                {t('privacy.control.export')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dataControlButton, { backgroundColor: theme.background }]}
              onPress={() => router.push('/settings/data-delete')}
            >
              <Text style={[styles.dataControlButtonText, { color: theme.error }]}>
                {t('privacy.control.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Server size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacy.section.storage')}</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            {t('privacy.storage.description')}
          </Text>
          
          <View style={styles.storageInfo}>
            <View style={styles.storageInfoItem}>
              <Text style={[styles.storageInfoLabel, { color: theme.secondaryText }]}>
                {t('privacy.storage.location')}
              </Text>
              <Text style={[styles.storageInfoValue, { color: theme.text }]}>
                {t('privacy.storage.location.value')}
              </Text>
            </View>
            
            <View style={styles.storageInfoItem}>
              <Text style={[styles.storageInfoLabel, { color: theme.secondaryText }]}>
                {t('privacy.storage.retention')}
              </Text>
              <Text style={[styles.storageInfoValue, { color: theme.text }]}>
                {t('privacy.storage.retention.value')}
              </Text>
            </View>
            
            <View style={styles.storageInfoItem}>
              <Text style={[styles.storageInfoLabel, { color: theme.secondaryText }]}>
                {t('privacy.storage.backup')}
              </Text>
              <Text style={[styles.storageInfoValue, { color: theme.text }]}>
                {t('privacy.storage.backup.value')}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <UserCheck size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacy.section.account')}</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            {t('privacy.account.description')}
          </Text>
          
          <TouchableOpacity 
            style={[styles.securityButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/settings/security')}
          >
            <Text style={styles.securityButtonText}>
              {t('privacy.account.manage')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Mail size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacy.contact.title')}</Text>
          </View>
          
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            {t('privacy.contact.description')}
          </Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleOpenLink('mailto:privacy@carbonlens.example.com')}
          >
            <Mail size={20} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.secondaryText }]}>
              privacy@carbonlens.example.com
            </Text>
            <ExternalLink size={16} color={theme.secondaryText} />
          </TouchableOpacity>
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 8,
  },
});