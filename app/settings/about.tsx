import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Image, 
  Linking, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Globe, 
  Mail, 
  Github, 
  Heart, 
  Shield, 
  FileText, 
  HelpCircle,
  ExternalLink
} from 'lucide-react-native';
import Header from '@/components/Header';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
export default function AboutScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleOpenLink = (url: string) => {

    // For demo URLs, show an alert instead of trying to open them
    if (url.includes('carbonlens.example.com') || url.includes('example.com')) {
      Alert.alert(
        t('about.demo.alert.title'),
        t('about.demo.alert.message'),
        [{ text: t('about.demo.alert.button'), style: "default" }]
      );
      return;
    }
    
    // For real URLs, try to open them
    Linking.openURL(url).catch(err => {
      console.error("Couldn't load page", err);
      Alert.alert(
        t('about.link.error.title'),
        t('about.link.error.message'),
        [{ text: t('common.ok'), style: "default" }]
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('about.title')} showBackButton />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: theme.text }]}>{t('about.app.name')}</Text>
          <Text style={[styles.appVersion, { color: theme.secondaryText }]}>v1.17</Text>
          <Text style={[styles.appTagline, { color: theme.primary }]}>{t('about.app.tagline')}</Text>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('about.section.about')}</Text>
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            {t('about.description.main')}
          </Text>
          <Text style={[styles.sectionText, { color: theme.secondaryText, marginTop: 12 }]}>
            {t('about.description.mission')}
          </Text>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('about.section.features')}</Text>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              {t('about.feature.tracking')}
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              {t('about.feature.analysis')}
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              {t('about.feature.collaboration')}
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              {t('about.feature.recommendations')}
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              {t('about.feature.customization')}
            </Text>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('about.section.contact')}</Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleOpenLink('https://carbonlens.example.com')}
          >
            <Globe size={20} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.secondaryText }]}>
              carbonlens.example.com
            </Text>
            <ExternalLink size={16} color={theme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleOpenLink('mailto:info@carbonlens.example.com')}
          >
            <Mail size={20} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.secondaryText }]}>
              info@carbonlens.example.com
            </Text>
            <ExternalLink size={16} color={theme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleOpenLink('https://github.com/carbonlens')}
          >
            <Github size={20} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.secondaryText }]}>
              github.com/carbonlens
            </Text>
            <ExternalLink size={16} color={theme.secondaryText} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.linksContainer}>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://carbonlens.example.com/privacy')}
          >
            <Shield size={16} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.primary }]}>{t('about.link.privacy')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://carbonlens.example.com/terms')}
          >
            <FileText size={16} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.primary }]}>{t('about.link.terms')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://carbonlens.example.com/help')}
          >
            <HelpCircle size={16} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.primary }]}>{t('about.link.help')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>
            {t('about.footer.copyright')}
          </Text>
          <View style={styles.footerTagline}>
            <Text style={[styles.footerTaglineText, { color: theme.secondaryText }]}>
              {t('about.footer.tagline.prefix')} 
            </Text>
            <Heart size={14} color={theme.error} style={{ marginHorizontal: 4 }} />
            <Text style={[styles.footerTaglineText, { color: theme.secondaryText }]}>
              {t('about.footer.tagline.suffix')}
            </Text>
          </View>
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
  logoContainer: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 8,
  },
  footerTagline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerTaglineText: {
    fontSize: 12,
  },
});