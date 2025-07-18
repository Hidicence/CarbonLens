import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Share
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, 
  Download, 
  Share as ShareIcon, 
  ExternalLink,
  FileText 
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface HtmlReportViewerProps {
  htmlContent: string;
  reportTitle: string;
  fileName?: string;
  onClose?: () => void;
}

const HtmlReportViewer: React.FC<HtmlReportViewerProps> = ({
  htmlContent,
  reportTitle,
  fileName,
  onClose
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { t } = useTranslation();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  
  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };
  
  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      if (Platform.OS === 'web') {
        // Web環境直接下載
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `${reportTitle}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // 移動端：寫入文件並分享
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const finalFileName = fileName || `${reportTitle}_${timestamp}.html`;
        const filePath = `${FileSystem.documentDirectory}${finalFileName}`;
        
        await FileSystem.writeAsStringAsync(filePath, htmlContent);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'text/html',
            dialogTitle: `分享 ${reportTitle}`,
            UTI: 'public.html'
          });
        } else {
          // 回退到原生分享
          await Share.share({
            title: reportTitle,
            message: `${reportTitle} 報告已生成`,
            url: filePath
          });
        }
      }
      
      Alert.alert(
        t('reports.share.success'),
        t('reports.share.success.message'),
        [{ text: t('common.confirm') }]
      );
      
    } catch (error) {
      console.error('分享報告失敗:', error);
      Alert.alert(
        t('reports.share.error'),
        t('reports.share.error.message'),
        [{ text: t('common.confirm') }]
      );
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleSaveToFiles = async () => {
    try {
      if (Platform.OS === 'web') {
        handleShare();
        return;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalFileName = fileName || `${reportTitle}_${timestamp}.html`;
      const filePath = `${FileSystem.documentDirectory}${finalFileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, htmlContent);
      
      Alert.alert(
        t('reports.save.success'),
        `檔案已保存至: ${filePath}`,
        [
          { text: t('common.confirm') },
          { 
            text: t('reports.open.files'), 
            onPress: () => {
              if (Sharing.isAvailableAsync()) {
                Sharing.shareAsync(filePath);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('保存報告失敗:', error);
      Alert.alert(
        t('reports.save.error'),
        t('reports.save.error.message'),
        [{ text: t('common.confirm') }]
      );
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 標題列 */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        
        <View style={styles.titleContainer}>
          <FileText size={20} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {reportTitle}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.primary + '15' }]}
            onPress={handleSaveToFiles}
          >
            <Download size={18} color={theme.primary} />
          </Pressable>
          
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.primary + '15' }]}
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ShareIcon size={18} color={theme.primary} />
            )}
          </Pressable>
        </View>
      </View>
      
      {/* WebView */}
      <View style={styles.webviewContainer}>
        {isLoading && (
          <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              {t('reports.loading')}
            </Text>
          </View>
        )}
        
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
          scalesPageToFit={true}
          bounces={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HtmlReportViewer;