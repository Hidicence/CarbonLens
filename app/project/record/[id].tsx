import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Pressable, 
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  X, 
  Info, 
  Calculator, 
  FileEdit, 
  Clapperboard, 
  Film 
} from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import { EMISSION_CATEGORIES, STAGE_CATEGORIES, EMISSION_SOURCES } from '@/mocks/projects';
import { ProductionStage } from '@/types/project';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { CREW_OPTIONS } from '@/constants/crews';

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    projectEmissionRecords, 
    shootingDayRecords, 
    deleteProjectEmissionRecord, 
    deleteShootingDayRecord,
    getProjectEmissionRecords 
  } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // 從專案排放記錄中查找指定記錄
  let record = projectEmissionRecords.find(r => r.id === id);
  
  // 如果在專案排放記錄中找不到，則在 shootingDayRecords 中查找
  let isShootingDayRecord = false;
  if (!record) {
    const shootingRecord = Object.values(shootingDayRecords)
      .flat()
      .find(r => r.id === id);
    
    if (shootingRecord) {
      isShootingDayRecord = true;
      // 將拍攝日記錄轉換為通用記錄格式
      const crewName = CREW_OPTIONS.find(c => c.key === shootingRecord.crew)?.name || shootingRecord.crew;
      record = {
        id: shootingRecord.id,
        projectId: shootingRecord.projectId,
        stage: 'production' as const,
        categoryId: shootingRecord.category,
        description: `${crewName} - ${shootingRecord.description}`,
        sourceId: shootingRecord.category,
        quantity: shootingRecord.quantity || 0,
        unit: shootingRecord.unit || '',
        amount: shootingRecord.amount,
        date: shootingRecord.shootingDate + 'T00:00:00.000Z',
        location: shootingRecord.location || '',
        notes: shootingRecord.notes || '',
        createdAt: shootingRecord.createdAt,
        updatedAt: shootingRecord.updatedAt,
      };
    }
  }
  
  if (!record) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="記錄詳情" 
          showBackButton 
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: theme.secondaryText }]}>找不到記錄</Text>
          <Button 
            title="返回" 
            onPress={() => router.back()} 
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }
  
  // 查找類別 - 添加安全檢查
  const category = 
    EMISSION_CATEGORIES.find(cat => cat.id === record.categoryId) || 
    (STAGE_CATEGORIES && STAGE_CATEGORIES['pre-production'] ? STAGE_CATEGORIES['pre-production'].find(cat => cat.id === record.categoryId) : null) ||
    (STAGE_CATEGORIES && STAGE_CATEGORIES['production'] ? STAGE_CATEGORIES['production'].find(cat => cat.id === record.categoryId) : null) ||
    (STAGE_CATEGORIES && STAGE_CATEGORIES['post-production'] ? STAGE_CATEGORIES['post-production'].find(cat => cat.id === record.categoryId) : null);
  
  // 查找排放源
  const source = record.sourceId 
    ? EMISSION_SOURCES.find(s => s.id === record.sourceId) 
    : null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };
  
  const handleEditRecord = () => {
    router.push(`/project/edit-record?id=${id}`);
  };
  
  const handleDeleteRecord = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDeleteRecord = () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    
    // 模擬刪除延遲
    setTimeout(() => {
      if (isShootingDayRecord) {
        deleteShootingDayRecord(id);
      } else {
      deleteProjectEmissionRecord(id);
      }
      setIsDeleting(false);
      router.back();
    }, 800);
  };
  
  const getStageColor = (stage: ProductionStage): string => {
    switch(stage) {
      case 'pre-production':
        return '#6C63FF'; // Purple
      case 'production':
        return '#4ECDC4'; // Teal
      case 'post-production':
        return '#FF6B6B'; // Red
      default:
        return '#AAAAAA';
    }
  };
  
  const getStageIcon = (stage: ProductionStage) => {
    const size = 20;
    const color = getStageColor(stage);
    
    switch(stage) {
      case 'pre-production':
        return <FileEdit size={size} color={color} />;
      case 'production':
        return <Clapperboard size={size} color={color} />;
      case 'post-production':
        return <Film size={size} color={color} />;
    }
  };
  
  const stageLabels = {
    'pre-production': '前期製作',
    'production': '拍攝階段',
    'post-production': '後期製作'
  };
  
  if (isDeleting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title="刪除記錄" 
          showBackButton 
          textColor={theme.text}
          iconColor={theme.text}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>正在刪除記錄...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="碳排放記錄詳情" 
        showBackButton 
        textColor={theme.text}
        iconColor={theme.text}
        rightComponent={
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton} onPress={handleEditRecord}>
              <Edit2 size={20} color={theme.text} />
            </Pressable>
            <Pressable style={styles.headerButton} onPress={handleDeleteRecord}>
              <Trash2 size={20} color={theme.error} />
            </Pressable>
          </View>
        }
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.recordHeader}>
          <View style={styles.recordHeaderLeft}>
            {category && (
              <View style={[styles.categoryTag, { backgroundColor: category.color + '30' }]}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
              </View>
            )}
            
            <View style={[styles.stageTag, { backgroundColor: getStageColor(record.stage) + '30' }]}>
              {getStageIcon(record.stage)}
              <Text style={[styles.stageText, { color: getStageColor(record.stage) }]}>
                {stageLabels[record.stage]}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.recordDate, { color: theme.secondaryText }]}>
            {formatDate(record.date)}
          </Text>
        </View>
        
        <View style={[styles.amountCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.amountLabel, { color: theme.secondaryText }]}>碳排放量</Text>
          <Text style={[styles.amountValue, { color: theme.primary }]}>
            {record.amount.toFixed(2)} 公斤CO₂e
          </Text>
        </View>
        
        <View style={[styles.descriptionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.descriptionTitle, { color: theme.text }]}>描述</Text>
          <Text style={[styles.descriptionText, { color: theme.text }]}>
            {record.description}
          </Text>
        </View>
        
        {source && record.quantity && (
          <View style={[styles.calculationCard, { backgroundColor: theme.card }]}>
            <View style={styles.calculationHeader}>
              <Calculator size={20} color={theme.text} />
              <Text style={[styles.calculationTitle, { color: theme.text }]}>計算詳情</Text>
            </View>
            
            <View style={styles.calculationDetails}>
              <View style={styles.calculationRow}>
                <Text style={[styles.calculationLabel, { color: theme.secondaryText }]}>排放源:</Text>
                <Text style={[styles.calculationValue, { color: theme.text }]}>{source.name}</Text>
              </View>
              
              <View style={styles.calculationRow}>
                <Text style={[styles.calculationLabel, { color: theme.secondaryText }]}>數量:</Text>
                <Text style={[styles.calculationValue, { color: theme.text }]}>
                  {record.quantity} {record.unit}
                </Text>
              </View>
              
              <View style={styles.calculationRow}>
                <Text style={[styles.calculationLabel, { color: theme.secondaryText }]}>排放係數:</Text>
                <Text style={[styles.calculationValue, { color: theme.text }]}>
                  {source.emissionFactor} kg CO₂e/{source.unit}
                </Text>
              </View>
              
              <View style={[styles.calculationFormula, { backgroundColor: theme.background }]}>
                <Text style={[styles.formulaText, { color: theme.primary }]}>
                  計算公式: {record.quantity} {record.unit} × {source.emissionFactor} kg CO₂e/{record.unit} = {record.amount.toFixed(2)} kg CO₂e
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.detailsTitle, { color: theme.text }]}>其他詳情</Text>
          
          {record.location && (
            <View style={styles.detailRow}>
              <MapPin size={16} color={theme.secondaryText} />
              <Text style={[styles.detailText, { color: theme.text }]}>{record.location}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Calendar size={16} color={theme.secondaryText} />
            <Text style={[styles.detailText, { color: theme.text }]}>{formatDate(record.date)}</Text>
          </View>
          
          {record.createdBy && (
            <View style={styles.detailRow}>
              <Info size={16} color={theme.secondaryText} />
              <Text style={[styles.detailText, { color: theme.text }]}>
                記錄者: {record.createdBy}
              </Text>
            </View>
          )}
        </View>
        
        {record.notes && (
          <View style={[styles.notesCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.notesTitle, { color: theme.text }]}>備註</Text>
            <Text style={[styles.notesText, { color: theme.text }]}>{record.notes}</Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <Button
            title="編輯記錄"
            onPress={handleEditRecord}
            variant="outline"
            icon={<Edit2 size={16} color={theme.primary} />}
            style={styles.editButton}
          />
          <Button
            title="刪除記錄"
            onPress={handleDeleteRecord}
            variant="outline"
            icon={<Trash2 size={16} color={theme.error} />}
            style={[styles.deleteButton, { borderColor: theme.error }]}
            textStyle={{ color: theme.error }}
          />
        </View>
        
        <View style={styles.footer} />
      </ScrollView>
      
      {/* 刪除確認彈窗 */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>刪除記錄</Text>
              <Pressable onPress={() => setShowDeleteModal(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
            
            <View style={styles.modalContent}>
              <View style={[styles.warningContainer, { backgroundColor: theme.error + '10' }]}>
                <AlertTriangle size={24} color={theme.error} />
                <Text style={[styles.warningText, { color: theme.error }]}>
                  此操作將永久刪除此碳排放記錄，無法恢復！
                </Text>
              </View>
              
              <Text style={[styles.modalText, { color: theme.text }]}>
                確定要刪除此碳排放記錄嗎？
              </Text>
            </View>
            
            <View style={[styles.modalActions, { borderTopColor: theme.border }]}>
              <Button
                title="取消"
                onPress={() => setShowDeleteModal(false)}
                variant="outline"
                style={styles.modalCancelButton}
              />
              <Button
                title="確認刪除"
                onPress={confirmDeleteRecord}
                variant="outline"
                style={[styles.modalDeleteButton, { borderColor: theme.error }]}
                textStyle={{ color: theme.error }}
                icon={<Trash2 size={16} color={theme.error} />}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
    marginLeft: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  recordDate: {
    fontSize: 14,
  },
  amountCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  descriptionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  calculationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  calculationDetails: {},
  calculationRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    width: 80,
  },
  calculationValue: {
    fontSize: 14,
    flex: 1,
  },
  calculationFormula: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  formulaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  notesCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
  footer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  modalDeleteButton: {
    flex: 1,
    marginLeft: 8,
  },
});