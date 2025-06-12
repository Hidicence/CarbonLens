import React from 'react';
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
    
    // For real URLs, try to open them
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
      <Header title="關於 CarbonLens" showBackButton />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2874&auto=format&fit=crop' }} 
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: theme.text }]}>CarbonLens</Text>
          <Text style={[styles.appVersion, { color: theme.secondaryText }]}>版本 1.0.6</Text>
          <Text style={[styles.appTagline, { color: theme.primary }]}>影視碳足跡管理平台</Text>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>關於我們</Text>
          <Text style={[styles.sectionText, { color: theme.secondaryText }]}>
            CarbonLens 是一個專為影視製作團隊設計的碳足跡管理平台，旨在幫助影視產業減少碳排放，實現可持續發展。
            我們提供簡單易用的工具，讓製作團隊能夠追蹤、分析和減少製作過程中的碳排放。
          </Text>
          <Text style={[styles.sectionText, { color: theme.secondaryText, marginTop: 12 }]}>
            我們的使命是推動影視產業的綠色轉型，通過數據驅動的方法，幫助製作團隊做出更環保的決策。
          </Text>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>主要功能</Text>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              專案碳排放追蹤與管理
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              製作階段碳排放分析
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              多人協作與數據共享
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              碳減排建議與最佳實踐
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.featureText, { color: theme.secondaryText }]}>
              自定義排放源與排放因子
            </Text>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>聯繫我們</Text>
          
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
            <Text style={[styles.linkText, { color: theme.primary }]}>隱私政策</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://carbonlens.example.com/terms')}
          >
            <FileText size={16} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.primary }]}>使用條款</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://carbonlens.example.com/help')}
          >
            <HelpCircle size={16} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.primary }]}>幫助中心</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>
            © 2024 CarbonLens. All rights reserved.
          </Text>
          <View style={styles.footerTagline}>
            <Text style={[styles.footerTaglineText, { color: theme.secondaryText }]}>
              Made with 
            </Text>
            <Heart size={14} color={theme.error} style={{ marginHorizontal: 4 }} />
            <Text style={[styles.footerTaglineText, { color: theme.secondaryText }]}>
              for a greener film industry
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