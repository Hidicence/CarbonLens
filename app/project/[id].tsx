import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Pressable, 
  Image, 
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Keyboard,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  ArrowLeft, 
  BarChart3, 
  Pencil, 
  FileEdit, 
  Film, 
  Clapperboard, 
  Trash2,
  AlertCircle,
  X,
  Info,
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Truck,
  ArrowUpRight,
  Camera,
  Video,
  Lightbulb,
  Mic,
  Palette,
  Settings,
  PieChart,
  Building
} from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useLanguageStore } from '@/store/languageStore';
import { EMISSION_CATEGORIES } from '@/mocks/projects';
import { ProductionStage } from '@/types/project';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import EmissionCategoryCard from '@/components/EmissionCategoryCard';
import EmissionRecordItem from '@/components/EmissionRecordItem';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import CollaboratorsList from '@/components/CollaboratorsList';
import { getCrewIcon, CREW_OPTIONS } from '@/constants/crews';
import { useThemeStore } from '@/store/themeStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    projects, 
    projectEmissionRecords, 
    deleteProject, 
    shootingDayRecords,
    calculateProjectEmissions,
    getProjectEmissionRecords
  } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
  const { t } = useTranslation();

        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Set up initial data
  useEffect(() => {
    // Project setup is handled by the store automatically
  }, [id]);
  
  const project = projects.find(p => p.id === id);
  
  // 動態計算項目的排放量統計
  const projectEmissionSummary = id ? calculateProjectEmissions(id) : null;
  const dynamicTotalEmissions = projectEmissionSummary?.totalEmissions || 0;
  
  // 合併 projectEmissionRecords 和 shootingDayRecords 中的數據
  const projectRecords = useMemo(() => {
    if (!id) return [];
    
    const directRecords = getProjectEmissionRecords(id);
    const shootingRecords = shootingDayRecords[id] || [];
    
    // 將拍攝日記錄轉換為 ProjectEmissionRecord 格式
    const convertedShootingRecords = shootingRecords.map(record => {
      // 取得組別名稱
      const crewName = CREW_OPTIONS.find(c => c.key === record.crew)?.name || record.crew;
      
      return {
        id: record.id,
        projectId: record.projectId,
        stage: 'production' as const,
        categoryId: record.category,
        description: `${crewName} - ${record.description}`,
        sourceId: record.category,
        quantity: record.quantity || 0,
        unit: record.unit || '',
        amount: record.amount,
        date: record.shootingDate + 'T00:00:00.000Z', // 轉換為 ISO 格式
        location: record.location || '',
        notes: record.notes || '',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    });
    
    return [...directRecords, ...convertedShootingRecords];
  }, [getProjectEmissionRecords, shootingDayRecords, id]);
  
  // Restore scroll position after any re-renders
  useEffect(() => {
    if (scrollViewRef.current && scrollPosition > 0) {
      // Use a small timeout to ensure the ScrollView has rendered
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: false });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [scrollPosition]);
  
  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('projects.details')} showBackButton />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>{t('projects.empty')}</Text>
          <Button 
            title={t('common.back')} 
            onPress={() => router.back()} 
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  const handleAddRecord = (stage?: ProductionStage) => {
    if (!id) return;
    
    if (stage) {
      router.push({
        pathname: '/project/add-record',
        params: { projectId: id, stage }
      });
    } else {
      router.push({
        pathname: '/project/add-record',
        params: { projectId: id }
      });
    }
  };

  const handleViewRecord = (recordId: string) => {
    router.push(`/project/record/${recordId}`);
  };

  const handleViewStage = (stage: ProductionStage) => {
    router.push(`/analytics/${stage}`);
  };

  const handleDeleteProject = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    
    // 模擬刪除延遲
    setTimeout(() => {
      if (id) {
      deleteProject(id);
      }
      router.replace('/');
    }, 800);
  };

  const handleEditProject = () => {
    router.push({
      pathname: '/project/edit',
      params: { id }
    });
  };

  const handleManageCollaborators = () => {
    setShowCollaboratorsModal(true);
  };
  
  const handleGenerateReport = () => {
    if (!id) return;
    router.push(`/project/${id}/report`);
  };

  const handleAddEquipmentTransport = () => {
    if (!id) return;
    router.push({
      pathname: '/project/add-equipment-transport',
      params: { projectId: id }
    });
  };

  const handleAddShootingDay = (crew?: string) => {
    if (!id) return;
    router.push({
      pathname: '/project/shooting-day/add',
      params: { projectId: id, crew }
    });
  };

  // Calculate emissions by stage
  const emissionsByStage = {
    'pre-production': projectRecords.filter(r => r.stage === 'pre-production').reduce((sum, r) => sum + r.amount, 0),
    'production': projectRecords.filter(r => r.stage === 'production').reduce((sum, r) => sum + r.amount, 0),
    'post-production': projectRecords.filter(r => r.stage === 'post-production').reduce((sum, r) => sum + r.amount, 0)
  };

  const stageLabels = {
    'pre-production': t('stage.pre-production'),
    'production': t('stage.production'),
    'post-production': t('stage.post-production')
  };

  function getStageColor(stage: ProductionStage): string {
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
  }

  function getStageIcon(stage: ProductionStage) {
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
  }

  // Check carbon budget status
  const getBudgetStatus = (stage: ProductionStage) => {
    if (!project.carbonBudget) return null;
    
    const stageBudget = project.carbonBudget.stages?.[stage];
    const stageEmissions = emissionsByStage[stage];
    
    if (stageBudget) {
      if (stageEmissions >= stageBudget) {
        return {
          status: 'exceeded',
          message: t('projects.carbon.budget.exceeded'),
          color: Colors.dark.error,
          icon: <AlertTriangle size={16} color={Colors.dark.error} />
        };
      } else if (stageEmissions >= stageBudget * 0.8) {
        return {
          status: 'warning',
          message: t('projects.carbon.budget.warning'),
          color: Colors.dark.warning,
          icon: <AlertCircle size={16} color={Colors.dark.warning} />
        };
      } else {
        return {
          status: 'good',
          message: t('projects.carbon.budget.good'),
          color: Colors.dark.success,
          icon: <CheckCircle size={16} color={Colors.dark.success} />
        };
      }
    }
    
    return null;
  };
  
  // Check total budget status
  const getTotalBudgetStatus = () => {
    if (!project.carbonBudget) return null;
    
    const totalBudget = project.carbonBudget.total;
    const totalEmissions = dynamicTotalEmissions || 0;
    
    if (totalEmissions >= totalBudget) {
      return {
        status: 'exceeded',
        message: t('projects.carbon.budget.exceeded'),
        color: Colors.dark.error,
        icon: <AlertTriangle size={20} color={Colors.dark.error} />
      };
    } else if (totalEmissions >= totalBudget * 0.8) {
      return {
        status: 'warning',
        message: t('projects.carbon.budget.warning'),
        color: Colors.dark.warning,
        icon: <AlertCircle size={20} color={Colors.dark.warning} />
      };
    } else {
      return {
        status: 'good',
        message: t('projects.carbon.budget.good'),
        color: Colors.dark.success,
        icon: <CheckCircle size={20} color={Colors.dark.success} />
      };
    }
  };

  if (isDeleting) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('projects.delete')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>{t('projects.delete')}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Sort records by date (newest first)
  const sortedRecords = [...projectRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get the 5 most recent records
  const recentRecords = sortedRecords.slice(0, 5);
  
  // Calculate total budget remaining
  const totalBudgetRemaining = project.carbonBudget 
    ? project.carbonBudget.total - (dynamicTotalEmissions || 0)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={t('projects.details')} 
        showBackButton 
        rightComponent={
          <View style={styles.headerActions}>
            <Pressable 
              style={styles.headerButton} 
              onPress={handleEditProject}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Pencil size={20} color={Colors.dark.text} />
            </Pressable>
            <Pressable 
              style={styles.headerButton} 
              onPress={handleDeleteProject}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={20} color={Colors.dark.error} />
            </Pressable>
          </View>
        }
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
        onScroll={(event) => {
          // Save scroll position
          const position = event.nativeEvent.contentOffset.y;
          setScrollPosition(position);
        }}
        scrollEventThrottle={16} // Throttle scroll events for better performance
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={keyboardVisible ? { paddingBottom: 200 } : undefined}
      >
        {project.thumbnail && (
          <Image 
            source={{ uri: project.thumbnail }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{project.name}</Text>
          <StatusBadge status={project.status} size="large" />
        </View>
        
        <Text style={styles.projectDescription}>{project.description}</Text>
        
        <View style={styles.projectDetails}>
          <View style={styles.detailItem}>
            <Calendar size={16} color={Colors.dark.secondaryText} />
            <Text style={styles.detailText}>
              {formatDate(project.startDate || '')}
              {project.endDate ? ` - ${formatDate(project.endDate)}` : ''}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={16} color={Colors.dark.secondaryText} />
            <Text style={styles.detailText}>{project.location}</Text>
          </View>
          
          <Pressable 
            style={styles.collaboratorsButton}
            onPress={handleManageCollaborators}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Users size={16} color={Colors.dark.primary} />
            <Text style={styles.collaboratorsButtonText}>
                                {(project.collaborators?.length || 0).toString()} {t('collaborators.count') || '位協作者'}
            </Text>
          </Pressable>
        </View>
        
        {/* Carbon Budget Section */}
        {project.carbonBudget && (
          <View style={styles.carbonBudgetSection}>
            <View style={styles.carbonBudgetHeader}>
              <Text style={styles.sectionTitle}>{t('projects.carbon.budget')}</Text>
              {getTotalBudgetStatus() && (
                <View style={[styles.budgetStatusBadge, { backgroundColor: getTotalBudgetStatus()?.color + '20' }]}>
                  {getTotalBudgetStatus()?.icon}
                  <Text style={[styles.budgetStatusText, { color: getTotalBudgetStatus()?.color }]}>
                    {getTotalBudgetStatus()?.message}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={[styles.carbonBudgetCard, { backgroundColor: Colors.dark.card }]}>
              <View style={styles.carbonBudgetInfo}>
                <View style={styles.carbonBudgetItem}>
                  <Text style={styles.carbonBudgetLabel}>{t('projects.carbon.budget.total')}</Text>
                  <Text style={styles.carbonBudgetValue}>{project.carbonBudget.total} kg CO₂e</Text>
                </View>
                
                <View style={styles.carbonBudgetItem}>
                  <Text style={styles.carbonBudgetLabel}>{t('emissions.total')}</Text>
                  <Text style={styles.carbonBudgetValue}>{(dynamicTotalEmissions || 0).toFixed(2)} kg CO₂e</Text>
                </View>
                
                <View style={styles.carbonBudgetItem}>
                  <Text style={styles.carbonBudgetLabel}>{t('projects.carbon.budget.remaining')}</Text>
                  <Text style={[
                    styles.carbonBudgetValue, 
                    { color: totalBudgetRemaining && totalBudgetRemaining < 0 ? Colors.dark.error : Colors.dark.success }
                  ]}>
                    {totalBudgetRemaining ? `${totalBudgetRemaining.toFixed(2)} kg CO₂e` : '0.00 kg CO₂e'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.carbonBudgetProgressContainer}>
                <View style={styles.carbonBudgetProgressBackground}>
                  <View 
                    style={[
                      styles.carbonBudgetProgress, 
                      { 
                        width: `${Math.min(((dynamicTotalEmissions || 0) / project.carbonBudget.total) * 100, 100)}%`,
                        backgroundColor: totalBudgetRemaining && totalBudgetRemaining < 0 
                          ? Colors.dark.error 
                          : totalBudgetRemaining && totalBudgetRemaining < project.carbonBudget.total * 0.2
                            ? Colors.dark.warning
                            : Colors.dark.success
                      }
                    ]}
                  />
                </View>
                <Text style={styles.carbonBudgetPercentage}>
                  {project.carbonBudget.total > 0 
                    ? `${Math.min(Math.round(((dynamicTotalEmissions || 0) / project.carbonBudget.total) * 100), 100)}% ${t('projects.carbon.budget.used')}`
                    : '0% used'}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.emissionSummary}>
          <View style={styles.emissionSummaryHeader}>
            <BarChart3 size={20} color={Colors.dark.text} />
            <Text style={styles.sectionTitle}>{t('emissions.summary')}</Text>
          </View>
          
          <View style={styles.emissionSummaryContent}>
            {/* 簡化的碳排放摘要 */}
            <View style={styles.simpleSummaryCard}>
              <Text style={styles.simpleSummaryValue}>
                {dynamicTotalEmissions >= 1000 
                  ? `${(dynamicTotalEmissions / 1000).toFixed(2)} t CO₂e` 
                  : `${dynamicTotalEmissions.toFixed(2)} kg CO₂e`}
              </Text>
              
              {projectEmissionSummary && (
                <Text style={styles.simpleSummaryBreakdown}>
                  拍攝日 {projectEmissionSummary.directEmissions.toFixed(1)} + 營運 {projectEmissionSummary.allocatedEmissions.toFixed(1)} kg CO₂e
                </Text>
              )}
            </View>
          </View>
              </View>
              
        {/* 快速操作區域 */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: Colors.dark.text }]}>快速操作</Text>
          
          {/* 專案器材 */}
          <Pressable 
            style={[styles.quickActionCard, { backgroundColor: Colors.dark.card }]}
            onPress={handleAddEquipmentTransport}
          >
            <View style={styles.quickActionIcon}>
              <Truck size={24} color={Colors.dark.primary} />
                    </View>
            <View style={styles.quickActionContent}>
              <Text style={[styles.quickActionTitle, { color: Colors.dark.text }]}>{t('projects.equipment') || '專案器材'}</Text>
              <Text style={[styles.quickActionDesc, { color: Colors.dark.secondaryText }]}>
                {t('projects.equipment.subtitle') || '登記專案使用器材總重量'}
              </Text>
              </View>
            <ArrowUpRight size={20} color={Colors.dark.secondaryText} />
          </Pressable>

          {/* 拍攝日記錄 - 工作組別 */}
          <View style={[styles.shootingDaySection, { backgroundColor: Colors.dark.card }]}>
            <View style={styles.shootingDayHeader}>
              <View style={styles.quickActionIcon}>
                <Users size={24} color={Colors.dark.success} />
            </View>
              <View style={styles.quickActionContent}>
                <Text style={[styles.quickActionTitle, { color: Colors.dark.text }]}>{t('projects.shooting.records') || '拍攝日記錄'}</Text>
                <Text style={[styles.quickActionDesc, { color: Colors.dark.secondaryText }]}>
                  {t('projects.shooting.records.subtitle') || '按工作組別記錄拍攝活動'}
                </Text>
          </View>
        </View>
        
            <View style={styles.crewButtonsGrid}>
              <Pressable 
                style={[styles.crewButton, { backgroundColor: '#FF6B6B' + '20', borderColor: '#FF6B6B' }]}
                onPress={() => handleAddShootingDay('director')}
              >
                <View style={styles.crewButtonIconContainer}>
                  {getCrewIcon('director', 18, '#FF6B6B')}
                </View>
                <Text style={[styles.crewButtonText, { color: '#FF6B6B' }]}>{t('crew.director') || '導演組'}</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.crewButton, { backgroundColor: '#4ECDC4' + '20', borderColor: '#4ECDC4' }]}
                onPress={() => handleAddShootingDay('camera')}
              >
                <View style={styles.crewButtonIconContainer}>
                  {getCrewIcon('camera', 18, '#4ECDC4')}
                </View>
                <Text style={[styles.crewButtonText, { color: '#4ECDC4' }]}>{t('crew.camera') || '攝影組'}</Text>
              </Pressable>
              
                <Pressable 
                style={[styles.crewButton, { backgroundColor: '#FFE66D' + '20', borderColor: '#FFE66D' }]}
                onPress={() => handleAddShootingDay('lighting')}
                >
                <View style={styles.crewButtonIconContainer}>
                  {getCrewIcon('lighting', 18, '#FFE66D')}
                </View>
                <Text style={[styles.crewButtonText, { color: '#FFE66D' }]}>{t('crew.lighting') || '燈光組'}</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.crewButton, { backgroundColor: '#A8E6CF' + '20', borderColor: '#A8E6CF' }]}
                onPress={() => handleAddShootingDay('sound')}
              >
                <View style={styles.crewButtonIconContainer}>
                  {getCrewIcon('sound', 18, '#A8E6CF')}
                      </View>
                <Text style={[styles.crewButtonText, { color: '#A8E6CF' }]}>{t('crew.sound') || '收音組'}</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.crewButton, { backgroundColor: '#FFB3BA' + '20', borderColor: '#FFB3BA' }]}
                onPress={() => handleAddShootingDay('makeup')}
              >
                <View style={styles.crewButtonIconContainer}>
                  {getCrewIcon('makeup', 18, '#FFB3BA')}
                      </View>
                <Text style={[styles.crewButtonText, { color: '#FFB3BA' }]}>{t('crew.makeup') || '梳化組'}</Text>
              </Pressable>
                  
                  <Pressable 
                style={[styles.crewButton, { backgroundColor: '#D4E6B7' + '20', borderColor: '#D4E6B7' }]}
                onPress={() => handleAddShootingDay('production')}
                  >
                <View style={styles.crewButtonIconContainer}>
                  {getCrewIcon('production', 18, '#D4E6B7')}
                </View>
                <Text style={[styles.crewButtonText, { color: '#D4E6B7' }]}>{t('crew.production') || '製片組'}</Text>
                  </Pressable>
            </View>
          </View>
        </View>
        
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>{t('emissions.recent')}</Text>
          
          {recentRecords.length > 0 ? (
            <View style={styles.recordsList}>
              {recentRecords.map((record) => (
                <Pressable 
                key={record.id} 
                  style={[styles.recordItem, { backgroundColor: Colors.dark.card }]}
                onPress={() => record.id && handleViewRecord(record.id)}
                >
                  <View style={styles.recordHeader}>
                    <Text style={[styles.recordTitle, { color: Colors.dark.text }]}>
                      {record.description}
                    </Text>
                    <Text style={[styles.recordAmount, { color: Colors.dark.primary }]}>
                      {record.amount.toFixed(2)} kg CO₂e
                    </Text>
                  </View>
                  <Text style={[styles.recordDate, { color: Colors.dark.secondaryText }]}>
                    {formatDate(record.date || '')}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRecords}>
              <Text style={styles.emptyRecordsText}>{t('emissions.empty')}</Text>
              <Button 
                title={t('emissions.add')} 
                onPress={() => handleAddShootingDay()} 
                variant="primary"
                icon={<Plus size={16} color={Colors.dark.text} />}
              />
            </View>
          )}
          
          {projectRecords.length > 5 && id && (
            <Pressable 
              style={styles.viewAllButton}
              onPress={() => id && router.push(`/project/${id}/records`)}
            >
              <Text style={styles.viewAllButtonText}>{t('common.view.all') || '查看全部'}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.reportSection}>
          <View style={styles.reportHeader}>
            <FileText size={20} color={Colors.dark.text} />
            <Text style={styles.sectionTitle}>{t('reports.title')}</Text>
          </View>
          
          <Pressable 
            style={styles.generateReportButton}
            onPress={handleGenerateReport}
          >
            <FileText size={20} color={Colors.dark.primary} />
            <Text style={styles.generateReportText}>{t('reports.generate')}</Text>
          </Pressable>
        </View>

        <View style={styles.tipContainer}>
          <View style={styles.tipIconWrapper}>
            <AlertCircle size={16} color={Colors.dark.secondary} />
          </View>
          <Text style={styles.tipText}>
            {t('tips.title')}: t('analytics.stage.analysis')
          </Text>
        </View>
        
        <View style={styles.footer} />
      </ScrollView>
      
      <View style={styles.fabContainer}>
        <Pressable 
          style={styles.fab}
          onPress={() => handleAddShootingDay()}
        >
          <Plus size={24} color={Colors.dark.text} />
        </Pressable>
      </View>

      {/* 刪除確認彈窗 */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('projects.delete')}</Text>
              <Pressable 
                onPress={() => setShowDeleteModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={Colors.dark.text} />
              </Pressable>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.warningContainer}>
                <AlertCircle size={24} color={Colors.dark.error} />
                <Text style={styles.warningText}>{t('projects.delete.warning')}</Text>
              </View>
              
              <Text style={styles.modalText}>
                {t('projects.delete.confirm')} "{project.name}"?
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <Button
                title={t('common.cancel')}
                onPress={() => setShowDeleteModal(false)}
                variant="outline"
                style={styles.modalCancelButton}
              />
              <Button
                title={t('common.delete')}
                onPress={confirmDeleteProject}
                variant="outline"
                style={styles.modalDeleteButton}
                textStyle={{ color: Colors.dark.error }}
                icon={<Trash2 size={16} color={Colors.dark.error} />}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 協作者管理彈窗 */}
      <Modal
        visible={showCollaboratorsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCollaboratorsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.collaboratorsModalContainer, 
            { 
              height: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.85 : SCREEN_HEIGHT * 0.9,
              width: isSmallScreen ? '95%' : '90%',
              maxHeight: SCREEN_HEIGHT * 0.95
            }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('collaborators.title')}</Text>
              <Pressable 
                onPress={() => setShowCollaboratorsModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={Colors.dark.text} />
              </Pressable>
            </View>
            
            <View style={styles.collaboratorsModalContent}>
              {id && (
              <CollaboratorsList 
                projectId={id} 
                onClose={() => setShowCollaboratorsModal(false)} 
              />
              )}
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
    backgroundColor: Colors.dark.background,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.dark.secondaryText,
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
    color: Colors.dark.text,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexWrap: 'wrap',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
    marginRight: 12,
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 16,
    color: Colors.dark.secondaryText,
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  projectDetails: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginLeft: 8,
  },
  collaboratorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  collaboratorsButtonText: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  carbonBudgetSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  carbonBudgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  budgetStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  carbonBudgetCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  carbonBudgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  carbonBudgetItem: {
    alignItems: 'center',
  },
  carbonBudgetLabel: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
    marginBottom: 4,
  },
  carbonBudgetValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  carbonBudgetProgressContainer: {
    alignItems: 'center',
  },
  carbonBudgetProgressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  carbonBudgetProgress: {
    height: '100%',
    borderRadius: 4,
  },
  carbonBudgetPercentage: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
  },
  emissionSummary: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emissionSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginLeft: 8,
  },
  emissionSummaryContent: {},
  emissionTotalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emissionTotalLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 4,
  },
  emissionTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  emissionPercentage: {},
  progressBar: {
    height: 16,
    backgroundColor: Colors.dark.border,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
  },
  stagesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stagesGrid: {
    flexDirection: 'column',
  },
  stageCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginLeft: 8,
    flex: 1,
  },
  stageBudgetStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCardEmission: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    marginBottom: 4,
  },
  stageCardPercentage: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 12,
  },
  stageBudgetInfo: {
    backgroundColor: Colors.dark.background + '50',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  stageBudgetText: {
    fontSize: 12,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  stageBudgetRemainingText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  stageBudgetProgressContainer: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stageBudgetProgress: {
    height: '100%',
    borderRadius: 2,
  },
  stageCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  stageCardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recordsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyRecords: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyRecordsText: {
    fontSize: 16,
    color: Colors.dark.secondaryText,
    marginBottom: 16,
  },
  viewAllButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  reportSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  generateReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  generateReportText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginLeft: 12,
  },
  footer: {
    height: 80,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  collaboratorsModalContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        // Web 特定樣式
      }
    })
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  modalContent: {
    padding: 16,
  },
  collaboratorsModalContent: {
    flex: 1,
    padding: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.error + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: Colors.dark.error,
    marginLeft: 8,
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  modalDeleteButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: Colors.dark.error,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.secondary + '10',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  tipIconWrapper: {
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.dark.secondary,
    flex: 1,
  },
  // 快速操作樣式
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 14,
  },
  shootingDaySection: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shootingDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  crewButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4, // 替代 gap 屬性
  },
  crewButton: {
    width: '47%', // 稍微減少寬度以增加間距
    minHeight: 60, // 使用最小高度而不是 aspectRatio
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12, // 增加圓角
    borderWidth: 1.5, // 稍微增加邊框寬度
    marginBottom: 12, // 增加底部間距
    paddingHorizontal: 12, // 添加水平內邊距
    paddingVertical: 8, // 添加垂直內邊距
  },
  crewButtonIconContainer: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  crewButtonText: {
    fontSize: 13, // 稍微減小字體以適應小螢幕
    fontWeight: '600',
    flexShrink: 1, // 允許文字收縮
    textAlign: 'center',
  },
  recordsList: {
    marginTop: 8,
  },
  recordItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  recordAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordDate: {
    fontSize: 12,
  },
  emissionBreakdown: {
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  breakdownProgress: {
    height: 16,
    backgroundColor: Colors.dark.border,
    borderRadius: 8,
    marginBottom: 4,
  },
  breakdownProgressBar: {
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  breakdownProgressSegment: {
    height: '100%',
    borderRadius: 8,
  },
  breakdownPercentages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  breakdownPercentage: {
    fontSize: 12,
    color: Colors.dark.text,
  },
  // 簡化的排放量分解樣式
  simpleBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border + '50',
  },
  simpleBreakdownLabel: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  simpleBreakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  // 階段排放量純文字樣式
  stageEmissionsText: {
    marginTop: 16,
  },
  stageEmissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  stageEmissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  stageEmissionLabel: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  stageEmissionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  // 美化的排放量分解樣式
  beautifulBreakdownCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  beautifulBreakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  beautifulBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.dark.background + '50',
    borderRadius: 12,
    marginBottom: 8,
  },
  beautifulBreakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beautifulDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  beautifulBreakdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  beautifulBreakdownValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  // 美化的階段排放量樣式
  beautifulStageCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  beautifulStageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  beautifulStageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.dark.background + '50',
    borderRadius: 12,
    marginBottom: 8,
  },
  beautifulStageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beautifulStageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  beautifulStageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  beautifulStageValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  // 緊湊的排放量分解樣式
  compactBreakdownCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  compactBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginLeft: 6,
  },
  compactBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background + '50',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  compactBreakdownLabel: {
    fontSize: 12,
    color: Colors.dark.text,
    marginLeft: 4,
    marginRight: 4,
  },
  compactBreakdownValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 緊湊的階段排放量樣式
  compactStageCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  compactStageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactStageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginLeft: 6,
  },
  compactStageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactStageItem: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Colors.dark.background + '50',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 2,
  },
  compactStageLabel: {
    fontSize: 10,
    color: Colors.dark.text,
    marginTop: 2,
    textAlign: 'center',
  },
  compactStageValue: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  // 簡化的碳排放摘要樣式
  simpleSummaryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  simpleSummaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark.primary,
    marginBottom: 8,
  },
  simpleSummaryBreakdown: {
    fontSize: 15,
    color: Colors.dark.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});