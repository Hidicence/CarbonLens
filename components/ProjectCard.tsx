import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, Modal, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, MoreVertical, Trash2, Edit, X, AlertCircle, Users, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react-native';
import { Project, ProjectStatus } from '@/types/project';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import StatusBadge from './StatusBadge';
import Button from './Button';
import AIAssistantButton from './AIAssistantButton';
import Colors from '@/constants/colors';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { deleteProject, getAllocatedEmissions, calculateProjectEmissions } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // 動態計算項目的排放量統計
  const projectEmissionSummary = calculateProjectEmissions(project.id);
  
  // 獲取該專案的分攤排放量
  const allocatedEmissions = getAllocatedEmissions ? getAllocatedEmissions(project.id) : 0;
  
  const handlePress = () => {
    router.push(`/project/${project.id}`);
  };

  const handleOptionsPress = (e: any) => {
    e.stopPropagation();
    setShowOptions(true);
  };

  const handleEdit = () => {
    setShowOptions(false);
    router.push({
      pathname: '/project/edit',
      params: { id: project.id }
    });
  };

  const handleDelete = () => {
    setShowOptions(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    deleteProject(project.id);
  };

  const handleAIFillPress = () => {
    router.push(`/ai-chat/${project.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  const formatEmissions = (emissions: number) => {
    if (emissions >= 1000) {
      return `${(emissions / 1000).toFixed(1)} ${t('unit.ton.co2e')}`;
    }
    return `${emissions.toFixed(1)} ${t('unit.kg.co2e')}`;
  };
  
  const formatEmissionsShort = (emissions: number) => {
    if (emissions >= 1000) {
      return `${(emissions / 1000).toFixed(1)}噸`;
    }
    return `${emissions.toFixed(0)}kg`;
  };
  
  // Check carbon budget status
  const getBudgetStatus = () => {
    if (!project.carbonBudget) return null;
    
    const totalBudget = project.carbonBudget.total;
    const totalEmissions = project.totalEmissions || 0;
    
    if (totalEmissions >= totalBudget) {
      return {
        status: 'exceeded',
        message: t('projects.carbon.budget.exceeded'),
        color: Colors.dark.error,
        icon: <AlertTriangle size={14} color={Colors.dark.error} />
      };
    } else if (totalEmissions >= totalBudget * 0.8) {
      return {
        status: 'warning',
        message: t('projects.carbon.budget.warning'),
        color: Colors.dark.warning,
        icon: <AlertCircle size={14} color={Colors.dark.warning} />
      };
    } else {
      return {
        status: 'good',
        message: t('projects.carbon.budget.good'),
        color: Colors.dark.success,
        icon: <CheckCircle size={14} color={Colors.dark.success} />
      };
    }
  };

  return (
    <>
      <Pressable 
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: theme.card },
          pressed && styles.pressed
        ]}
        onPress={handlePress}
      >
        {project.thumbnail ? (
          // 背景圖片版本
          <View style={styles.imageContainer}>
          <Image 
            source={{ uri: project.thumbnail }} 
              style={styles.backgroundImage}
            resizeMode="cover"
              blurRadius={3}
            />
            <View style={styles.overlay} />
            <View style={styles.contentWithBackground}>
              {/* 主要內容區域 */}
              <View style={styles.mainContent}>
                <View style={styles.header}>
                  <Text style={[styles.title, styles.titleWithBackground]} numberOfLines={1}>{project.name}</Text>
                  <View style={styles.headerRight}>
                    <AIAssistantButton
                      variant="primary"
                      size="small"
                      title={t('ui.ai.fill')}
                      onPress={handleAIFillPress}
                      style={styles.aiButton}
                    />
                    <StatusBadge status={project.status} />
                    <Pressable 
                      style={styles.optionsButton}
                      onPress={handleOptionsPress}
                    >
                      <MoreVertical size={18} color="white" />
                    </Pressable>
                  </View>
                </View>
                
                <Text style={[styles.description, styles.descriptionWithBackground]} numberOfLines={2}>
                  {project.description}
                </Text>
                
                <View style={styles.details}>
                  <View style={styles.detailItem}>
                    <Calendar size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={[styles.detailText, styles.detailTextWithBackground]}>
                      {project.startDate ? formatDate(project.startDate) : t('common.not.set')}
                      {project.endDate ? ` - ${formatDate(project.endDate)}` : ''}
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <MapPin size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={[styles.detailText, styles.detailTextWithBackground]}>{project.location}</Text>
                  </View>
                  
                  {project.budget && project.budget > 0 && (
                    <View style={styles.detailItem}>
                      <DollarSign size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={[styles.detailText, styles.detailTextWithBackground]}>
                        {t('projects.budget')}: ${project.budget.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* 底部碳排放統計 - 背景圖片版 */}
              <View style={[styles.emissionsRow, styles.emissionsRowWithBackground]}>
                {/* 專案直接排放 */}
                <View style={styles.emissionsColumn}>
                  <Text style={[styles.emissionsLabel, styles.emissionsLabelWithBackground]}>{t('emissions.project.direct')}</Text>
                  <Text style={[styles.emissionsValue, { color: '#10B981' }]}>
                    {formatEmissions(projectEmissionSummary.directEmissions)}
                  </Text>
                </View>
                
                {/* 分攤營運排放 */}
                <View style={styles.emissionsColumn}>
                  <Text style={[styles.emissionsLabel, styles.emissionsLabelWithBackground]}>{t('emissions.operational.allocated')}</Text>
                  <Text style={[styles.emissionsValue, { color: '#F59E0B' }]}>
                    {formatEmissions(projectEmissionSummary.allocatedEmissions)}
                  </Text>
                </View>
                
                {/* 總計排放量 */}
                <View style={styles.emissionsColumn}>
                  <Text style={[styles.emissionsLabel, styles.emissionsLabelWithBackground, { fontWeight: 'bold' }]}>{t('emissions.total')}</Text>
                  <Text style={[styles.emissionsValue, { color: 'white', fontWeight: 'bold' }]}>
                    {formatEmissions(projectEmissionSummary.totalEmissions)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          // 無圖片版本
        <View style={styles.content}>
            {/* 主要內容區域 */}
            <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{project.name}</Text>
            <View style={styles.headerRight}>
              <AIAssistantButton
                variant="secondary"
                size="small"
                                      title={t('ui.ai.fill')}
                onPress={handleAIFillPress}
                style={styles.aiButton}
              />
              <StatusBadge status={project.status} />
              <Pressable 
                style={styles.optionsButton}
                onPress={handleOptionsPress}
              >
                <MoreVertical size={18} color={theme.secondaryText} />
              </Pressable>
            </View>
          </View>
          
          <Text style={[styles.description, { color: theme.secondaryText }]} numberOfLines={2}>
            {project.description}
          </Text>
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Calendar size={14} color={theme.secondaryText} />
              <Text style={[styles.detailText, { color: theme.secondaryText }]}>
                {project.startDate ? formatDate(project.startDate) : t('common.not.set')}
                {project.endDate ? ` - ${formatDate(project.endDate)}` : ''}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={14} color={theme.secondaryText} />
              <Text style={[styles.detailText, { color: theme.secondaryText }]}>{project.location}</Text>
            </View>
            
            {project.budget && project.budget > 0 && (
              <View style={styles.detailItem}>
                <DollarSign size={14} color={theme.secondaryText} />
                <Text style={[styles.detailText, { color: theme.secondaryText }]}>
  {t('projects.budget')}: ${project.budget.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
                </View>
                
            {/* 底部碳排放統計 - 完整顯示版 */}
            <View style={[styles.emissionsRow, { borderTopColor: theme.border }]}>
              {/* 專案直接排放 */}
              <View style={styles.emissionsColumn}>
                <Text style={[styles.emissionsLabel, { color: theme.secondaryText }]}>{t('emissions.project.direct')}</Text>
                <Text style={[styles.emissionsValue, { color: '#10B981' }]}>
                  {formatEmissions(projectEmissionSummary.directEmissions)}
                </Text>
              </View>
              
              {/* 分攤營運排放 */}
              <View style={styles.emissionsColumn}>
                <Text style={[styles.emissionsLabel, { color: theme.secondaryText }]}>{t('emissions.operational.allocated')}</Text>
                <Text style={[styles.emissionsValue, { color: '#F59E0B' }]}>
                  {formatEmissions(projectEmissionSummary.allocatedEmissions)}
                  </Text>
            </View>
            
              {/* 總計排放量 */}
              <View style={styles.emissionsColumn}>
                <Text style={[styles.emissionsLabel, { color: theme.text, fontWeight: 'bold' }]}>{t('emissions.total')}</Text>
                <Text style={[styles.emissionsValue, { color: theme.primary, fontWeight: 'bold' }]}>
                  {formatEmissions(projectEmissionSummary.totalEmissions)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Pressable>

      {/* 選項彈窗 */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        >
          <View style={[styles.optionsContainer, { backgroundColor: theme.card }]}>
            <Pressable 
              style={styles.optionItem}
              onPress={handleEdit}
            >
              <Edit size={18} color={theme.text} />
              <Text style={[styles.optionText, { color: theme.text }]}>{t('projects.edit')}</Text>
            </Pressable>
            
            <Pressable 
              style={styles.optionItem}
              onPress={handleDelete}
            >
              <Trash2 size={18} color={theme.error} />
              <Text style={[styles.optionText, { color: theme.error }]}>{t('projects.delete')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* 刪除確認彈窗 */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalContainer, { backgroundColor: theme.card }]}>
            <View style={[styles.deleteModalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.deleteModalTitle, { color: theme.text }]}>{t('projects.delete')}</Text>
              <Pressable onPress={() => setShowDeleteModal(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
            
            <View style={styles.deleteModalContent}>
              <View style={[styles.warningContainer, { backgroundColor: theme.error + '10' }]}>
                <AlertCircle size={24} color={theme.error} />
                <Text style={[styles.warningText, { color: theme.error }]}>{t('projects.delete.warning')}</Text>
              </View>
              
              <Text style={[styles.deleteModalText, { color: theme.text }]}>
                {t('projects.delete.confirm')} "{project.name}"?
              </Text>
            </View>
            
            <View style={[styles.deleteModalActions, { borderTopColor: theme.border }]}>
              <Button
                title={t('common.cancel')}
                onPress={() => setShowDeleteModal(false)}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title={t('common.delete')}
                onPress={confirmDelete}
                variant="outline"
                style={[styles.confirmDeleteButton, { borderColor: theme.error }]}
                textStyle={{ color: theme.error }}
                icon={<Trash2 size={16} color={theme.error} />}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  thumbnail: {
    width: '100%',
    height: 140,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentWithBackground: {
    position: 'relative',
    padding: 16,
    height: '100%',
  },
  titleWithBackground: {
    color: 'white',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }
    }),
  },
  descriptionWithBackground: {
    color: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }
    }),
  },
  detailTextWithBackground: {
    color: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }
    }),
  },
  emissionsRowWithBackground: {
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  emissionsLabelWithBackground: {
    color: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }
    }),
  },
  content: {
    padding: 16,
  },
  mainContent: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  aiButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  optionsButton: {
    padding: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  emissionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emissionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  emissionsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  emissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  emissionsLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  emissionsValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalEmissionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  totalEmissionsLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  totalEmissionsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  budgetStatusText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  inlineEmissionsRow: {
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  inlineEmissionsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    top: '30%',
    right: '10%',
    borderRadius: 8,
    padding: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
      },
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }
    }),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  deleteModalContainer: {
    width: '85%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
      },
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }
    }),
  },
  deleteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  deleteModalContent: {
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
  deleteModalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmDeleteButton: {
    flex: 1,
    marginLeft: 8,
  },
});