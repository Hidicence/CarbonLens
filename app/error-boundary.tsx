import React, { ErrorInfo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

// 錯誤分類和用戶友好消息
const getErrorInfo = (error: Error) => {
  const errorMessage = error.message?.toLowerCase() || '';
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      title: '網路連線問題',
      description: '請檢查您的網路連線是否正常，然後重試',
      icon: 'wifi-outline' as const,
      severity: 'warning' as const,
      suggestions: [
        '檢查網路連線',
        '嘗試重新整理頁面',
        '稍後再試'
      ]
    };
  }
  
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
    return {
      title: '認證問題',
      description: '您的登入狀態可能已過期，請重新登入',
      icon: 'lock-closed-outline' as const,
      severity: 'error' as const,
      suggestions: [
        '重新登入',
        '清除瀏覽器快取',
        '聯繫技術支援'
      ]
    };
  }
  
  if (errorMessage.includes('firebase') || errorMessage.includes('firestore')) {
    return {
      title: '資料同步問題',
      description: '與雲端資料庫的連線出現問題',
      icon: 'cloud-offline-outline' as const,
      severity: 'warning' as const,
      suggestions: [
        '檢查網路連線',
        '重新啟動應用程式',
        '稍後再試'
      ]
    };
  }
  
  if (errorMessage.includes('parse') || errorMessage.includes('json')) {
    return {
      title: '資料格式問題',
      description: '接收到的資料格式不正確',
      icon: 'document-outline' as const,
      severity: 'error' as const,
      suggestions: [
        '重新整理頁面',
        '清除應用程式快取',
        '聯繫技術支援'
      ]
    };
  }
  
  // 預設錯誤
  return {
    title: '應用程式錯誤',
    description: '應用程式遇到了未預期的問題',
    icon: 'alert-circle-outline' as const,
    severity: 'error' as const,
    suggestions: [
      '重新啟動應用程式',
      '重新整理頁面',
      '聯繫技術支援'
    ]
  };
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 記錄詳細錯誤信息
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A'
    };
    
    console.error('🚨 ErrorBoundary captured error:', errorDetails);
    
    // 這裡可以添加錯誤報告服務
    // this.reportError(errorDetails);
    
    this.setState({ errorInfo });
  }

  resetError = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  // 報告錯誤到遠端服務（將來實現）
  // private reportError = async (errorDetails: any) => {
  //   try {
  //     // 發送錯誤報告到分析服務
  //     console.log('Reporting error:', errorDetails);
  //   } catch (reportingError) {
  //     console.error('Failed to report error:', reportingError);
  //   }
  // };

  render() {
    if (this.state.hasError && this.state.error) {
      // 使用自定義錯誤組件
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.resetError} />;
      }

      // 預設錯誤UI
      const errorInfo = getErrorInfo(this.state.error);
      
      return <ErrorDisplay error={this.state.error} errorInfo={errorInfo} onRetry={this.resetError} />;
    }

    return this.props.children;
  }
}

// 錯誤顯示組件
const ErrorDisplay: React.FC<{
  error: Error;
  errorInfo: ReturnType<typeof getErrorInfo>;
  onRetry: () => void;
}> = ({ error, errorInfo, onRetry }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const iconColor = errorInfo.severity === 'error' ? '#EF4444' : '#F59E0B';
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* 錯誤圖標 */}
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={errorInfo.icon} size={48} color={iconColor} />
        </View>
        
        {/* 錯誤標題 */}
        <Text style={[styles.title, { color: theme.text }]}>{errorInfo.title}</Text>
        
        {/* 錯誤描述 */}
        <Text style={[styles.description, { color: theme.secondaryText }]}>
          {errorInfo.description}
        </Text>
        
        {/* 建議操作 */}
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsTitle, { color: theme.text }]}>建議解決方法：</Text>
          {errorInfo.suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Text style={[styles.suggestionBullet, { color: theme.primary }]}>•</Text>
              <Text style={[styles.suggestionText, { color: theme.secondaryText }]}>
                {suggestion}
              </Text>
            </View>
          ))}
        </View>
        
        {/* 操作按鈕 */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={20} color={theme.text} style={styles.buttonIcon} />
            <Text style={[styles.primaryButtonText, { color: theme.text }]}>重試</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.secondaryButton, { borderColor: theme.border }]} 
            onPress={() => {
              // 重載應用程式
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          >
            <Ionicons name="reload" size={20} color={theme.secondaryText} style={styles.buttonIcon} />
            <Text style={[styles.secondaryButtonText, { color: theme.secondaryText }]}>重新載入</Text>
          </Pressable>
        </View>
        
        {/* 技術詳情（開發模式） */}
        {__DEV__ && (
          <View style={[styles.technicalDetails, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.technicalTitle, { color: theme.text }]}>技術詳情 (開發模式)</Text>
            <Text style={[styles.technicalText, { color: theme.secondaryText }]}>
              {error.message}
            </Text>
            {error.stack && (
              <Text style={[styles.technicalStack, { color: theme.secondaryText }]}>
                {error.stack.split('\n').slice(0, 5).join('\n')}
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  suggestionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  suggestionBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 52,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
    minHeight: 52,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  technicalDetails: {
    width: '100%',
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  technicalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  technicalText: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  technicalStack: {
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});

export default ErrorBoundary;