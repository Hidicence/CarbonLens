import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { X, Check, Camera as CameraIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { ENHANCED_EQUIPMENT } from '@/mocks/enhancedEquipment';

interface ARScannerProps {
  onClose: () => void;
  onEquipmentDetected: (equipment: any, confidence: number) => void;
}

// 模擬設備識別函數
const mockIdentifyEquipment = async (): Promise<{
  equipment: any | null;
  confidence: number;
}> => {
  // 模擬API延遲
  return new Promise((resolve) => {
    setTimeout(() => {
      // 隨機選擇一個設備作為識別結果
      const randomIndex = Math.floor(Math.random() * ENHANCED_EQUIPMENT.length);
      const randomEquipment = ENHANCED_EQUIPMENT[randomIndex];
      const confidence = Math.random() * 0.5 + 0.5; // 50-100%的可信度
      
      resolve({
        equipment: randomEquipment,
        confidence: confidence
      });
    }, 2000);
  });
};

const ARScanner: React.FC<ARScannerProps> = ({ onClose, onEquipmentDetected }) => {
  const { t } = useLanguageStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [isScanning, setIsScanning] = useState(false);
  const [detectedEquipment, setDetectedEquipment] = useState<any | null>(null);
  const [confidence, setConfidence] = useState(0);
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const scanSize = Math.min(screenWidth, screenHeight) * 0.7;
  
  // 請求相機權限
  useEffect(() => {
    // 在這裡我們會設置相機權限，目前使用模擬數據
    // 在實際實現中，這裡將請求相機訪問權限
    const requestPermissions = async () => {
      try {
        // 假設我們已經獲得了相機權限
        // 在實際應用中使用 Camera.requestCameraPermissionsAsync()
      } catch (error) {
        console.log('相機權限請求失敗:', error);
        Alert.alert(
          t('scanner.permission.title'),
          t('scanner.permission.message'),
          [{ text: t('common.ok'), onPress: onClose }]
        );
      }
    };
    
    requestPermissions();
  }, []);
  
  // 掃描設備
  const scanEquipment = async () => {
    if (!isScanning) {
      setIsScanning(true);
      
      try {
        // 實際應用中，這裡我們會拍照並處理圖像
        // 目前使用模擬識別功能
        const result = await mockIdentifyEquipment();
        
        if (result.equipment && result.confidence > 0.7) {
          setDetectedEquipment(result.equipment);
          setConfidence(result.confidence);
        } else {
          Alert.alert(
            t('scanner.no.match.title'),
            t('scanner.no.match.message'),
            [{ text: t('common.ok') }]
          );
          setIsScanning(false);
        }
      } catch (error) {
        console.error('Error scanning equipment:', error);
        Alert.alert('Error', 'Failed to scan equipment');
        setIsScanning(false);
      }
    }
  };
  
  // 確認選擇設備
  const confirmEquipment = () => {
    if (detectedEquipment) {
      onEquipmentDetected(detectedEquipment, confidence);
    }
  };
  
  // 取消選擇，繼續掃描
  const cancelDetection = () => {
    setDetectedEquipment(null);
    setConfidence(0);
    setIsScanning(false);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      {/* 實際使用相機，使用原生相機預覽 */}
      <View style={styles.cameraPreview}>
        {/* 掃描框 - 新設計 */}
        <View style={[styles.scanArea, { width: scanSize, height: scanSize }]}>
          {/* 左上角 */}
          <View style={styles.cornerContainer}>
            <View style={[styles.cornerHorizontal, { backgroundColor: theme.primary }]} />
            <View style={[styles.cornerVertical, { backgroundColor: theme.primary }]} />
          </View>
          
          {/* 右上角 */}
          <View style={[styles.cornerContainer, { right: 0 }]}>
            <View style={[styles.cornerHorizontal, { backgroundColor: theme.primary }]} />
            <View style={[styles.cornerVertical, { backgroundColor: theme.primary, right: 0 }]} />
          </View>
          
          {/* 左下角 */}
          <View style={[styles.cornerContainer, { bottom: 0 }]}>
            <View style={[styles.cornerHorizontal, { backgroundColor: theme.primary, bottom: 0 }]} />
            <View style={[styles.cornerVertical, { backgroundColor: theme.primary, bottom: 0 }]} />
          </View>
          
          {/* 右下角 */}
          <View style={[styles.cornerContainer, { right: 0, bottom: 0 }]}>
            <View style={[styles.cornerHorizontal, { backgroundColor: theme.primary, bottom: 0 }]} />
            <View style={[styles.cornerVertical, { backgroundColor: theme.primary, right: 0, bottom: 0 }]} />
          </View>
          
          {/* 中間水平線 */}
          <View 
            style={[
              styles.centerLine, 
              { 
                width: scanSize * 0.6,
                backgroundColor: theme.primary,
                top: scanSize / 2
              }
            ]} 
          />
        </View>
        
        {/* 掃描提示 */}
        <Text style={[styles.scanTip, { color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          {t('scanner.tip')}
        </Text>
      </View>
      
      {/* 標題 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#fff' }]}>{t('scanner.title')}</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* 底部控制 */}
      <View style={styles.controls}>
        {!detectedEquipment ? (
          <TouchableOpacity 
            style={[styles.scanButton, isScanning && styles.scanningButton, { backgroundColor: theme.primary }]}
            onPress={scanEquipment}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <CameraIcon size={24} color="#FFFFFF" />
            )}
            <Text style={styles.scanButtonText}>
              {isScanning ? t('scanner.scanning') : t('scanner.scan')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.detectionResult}>
            <Text style={[styles.detectionTitle, { color: theme.text }]}>
              {t('scanner.detected')}
            </Text>
            <Text style={[styles.detectionName, { color: theme.primary }]}>
              {detectedEquipment.name}
            </Text>
            <Text style={[styles.detectionConfidence, { color: theme.secondaryText }]}>
              {t('scanner.confidence')}: {Math.round(confidence * 100)}%
            </Text>
            
            <View style={styles.detectionActions}>
              <TouchableOpacity 
                style={[styles.detectionAction, styles.cancelAction, { backgroundColor: theme.error + '20' }]}
                onPress={cancelDetection}
              >
                <X size={20} color={theme.error} />
                <Text style={[styles.actionText, { color: theme.error }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.detectionAction, styles.confirmAction, { backgroundColor: theme.primary + '20' }]}
                onPress={confirmEquipment}
              >
                <Check size={20} color={theme.primary} />
                <Text style={[styles.actionText, { color: theme.primary }]}>
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    position: 'relative',
  },
  cornerContainer: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  cornerHorizontal: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 2,
  },
  cornerVertical: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2,
    height: 30,
  },
  centerLine: {
    position: 'absolute',
    height: 2,
    alignSelf: 'center',
  },
  scanTip: {
    position: 'absolute',
    bottom: 120,
    textAlign: 'center',
    fontSize: 14,
    padding: 8,
    borderRadius: 4,
    width: '80%'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  scanningButton: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16
  },
  detectionResult: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  detectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detectionName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detectionConfidence: {
    fontSize: 14,
    marginBottom: 16,
  },
  detectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  detectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 8,
  },
  cancelAction: {},
  confirmAction: {},
  actionText: {
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ARScanner; 