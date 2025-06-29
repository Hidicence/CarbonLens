import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Pressable, 
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
  Share
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  FileText, 
  Download, 
  Share2, 
  ChevronRight, 
  Check, 
  BarChart3, 
  PieChart,
  Calendar,
  Users,
  Info,
  ArrowLeft
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { useProjectStore } from '@/store/projectStore';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { formatEmissions, groupByCategory, groupByStage } from '@/utils/helpers';
import { generatePDF } from '@/utils/pdfGenerator';
import { EMISSION_CATEGORIES } from '@/mocks/projects';

export default function ProjectReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguageStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { projects, getProjectEmissionRecords } = useProjectStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    includeProjectInfo: true,
    includeEmissionSummary: true,
    includeStageAnalysis: true,
    includeCategoryBreakdown: true,
    includeDetailedRecords: false,
    includeCollaborators: true,
    includeTips: true,
  });
  
  const project = projects.find(p => p.id === id);
  const projectRecords = id ? getProjectEmissionRecords(id) : [];
  
  // 模擬加載
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading || !project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('reports.generate')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            {isLoading ? t('common.loading') : t('projects.empty')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const toggleOption = (option: keyof typeof reportOptions) => {
    setReportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // 準備報告數據
      const reportData = {
        project,
        records: projectRecords,
        categories: EMISSION_CATEGORIES,
        options: reportOptions,
        categoryData: groupByCategory(projectRecords, EMISSION_CATEGORIES),
        stageData: groupByStage(projectRecords),
        language: t,
        date: new Date().toISOString(),
      };
      
      // 生成PDF
      const pdfPath = await generatePDF(reportData);
      
      setIsGenerating(false);
      
      if (pdfPath) {
        Alert.alert(
          t('reports.success'),
          t('reports.success.message'),
          [
            { 
              text: t('common.ok'), 
              style: 'cancel' 
            },
            {
              text: t('reports.share'),
              onPress: () => handleShareReport(pdfPath)
            }
          ]
        );
      }
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating report:', error);
      Alert.alert(
        t('common.error'),
        t('reports.error.message')
      );
    }
  };
  
  const handleShareReport = async (filePath: string) => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(t('common.info'), t('reports.web.not.supported'));
        return;
      }
      
      const shareOptions = {
        url: `file://${filePath}`,
        message: `${t('reports.share.message')} ${project.name}`,
        title: `${project.name} - ${t('reports.title')}`,
        subject: `${project.name} - ${t('reports.title')}`,
      };
      
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert(
        t('common.error'),
        t('reports.share.error')
      );
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('reports.generate')} showBackButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.projectInfoCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.projectName, { color: theme.text }]}>{project.name}</Text>
            <Text style={[styles.projectDescription, { color: theme.secondaryText }]}>
              {project.description}
            </Text>
            
            <View style={styles.projectDetails}>
              <View style={styles.projectDetailItem}>
                <Calendar size={16} color={theme.secondaryText} />
                <Text style={[styles.projectDetailText, { color: theme.secondaryText }]}>
                  {project.startDate ? formatDate(project.startDate) : t('common.not.set')}
                  {project.endDate ? ` - ${formatDate(project.endDate)}` : ''}
                </Text>
              </View>
              
              <View style={styles.projectDetailItem}>
                <BarChart3 size={16} color={theme.secondaryText} />
                <Text style={[styles.projectDetailText, { color: theme.secondaryText }]}>
                  {formatEmissions(project.totalEmissions || 0)}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('reports.options')}
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.secondaryText }]}>
              {t('reports.options.description')}
            </Text>
            
            <View style={[styles.optionsCard, { backgroundColor: theme.card }]}>
              <OptionItem
                title={t('reports.include.project')}
                description={t('reports.include.project.description')}
                isEnabled={reportOptions.includeProjectInfo}
                onToggle={() => toggleOption('includeProjectInfo')}
                theme={theme}
                icon={<Info size={20} color={theme.primary} />}
              />
              
              <OptionItem
                title={t('reports.include.summary')}
                description={t('reports.include.summary.description')}
                isEnabled={reportOptions.includeEmissionSummary}
                onToggle={() => toggleOption('includeEmissionSummary')}
                theme={theme}
                icon={<BarChart3 size={20} color={theme.primary} />}
              />
              
              <OptionItem
                title={t('reports.include.stages')}
                description={t('reports.include.stages.description')}
                isEnabled={reportOptions.includeStageAnalysis}
                onToggle={() => toggleOption('includeStageAnalysis')}
                theme={theme}
                icon={<ChevronRight size={20} color={theme.primary} />}
              />
              
              <OptionItem
                title={t('reports.include.categories')}
                description={t('reports.include.categories.description')}
                isEnabled={reportOptions.includeCategoryBreakdown}
                onToggle={() => toggleOption('includeCategoryBreakdown')}
                theme={theme}
                icon={<PieChart size={20} color={theme.primary} />}
              />
              
              <OptionItem
                title={t('reports.include.records')}
                description={t('reports.include.records.description')}
                isEnabled={reportOptions.includeDetailedRecords}
                onToggle={() => toggleOption('includeDetailedRecords')}
                theme={theme}
                icon={<FileText size={20} color={theme.primary} />}
                isLast={false}
              />
              
              <OptionItem
                title={t('reports.include.collaborators')}
                description={t('reports.include.collaborators.description')}
                isEnabled={reportOptions.includeCollaborators}
                onToggle={() => toggleOption('includeCollaborators')}
                theme={theme}
                icon={<Users size={20} color={theme.primary} />}
                isLast={false}
              />
              
              <OptionItem
                title={t('reports.include.tips')}
                description={t('reports.include.tips.description')}
                isEnabled={reportOptions.includeTips}
                onToggle={() => toggleOption('includeTips')}
                theme={theme}
                icon={<Info size={20} color={theme.primary} />}
                isLast={true}
              />
            </View>
          </View>
          
          <View style={styles.reportPreviewSection}>
            <Text style={[styles.previewTitle, { color: theme.text }]}>
              {t('reports.preview')}
            </Text>
            <Text style={[styles.previewDescription, { color: theme.secondaryText }]}>
              {t('reports.preview.description')}
            </Text>
            
            <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
              <View style={styles.previewHeader}>
                <FileText size={24} color={theme.primary} />
                <Text style={[styles.previewHeaderText, { color: theme.text }]}>
                  {project.name} - {t('reports.title')}
                </Text>
              </View>
              
              <View style={styles.previewContent}>
                {reportOptions.includeProjectInfo && (
                  <View style={styles.previewSection}>
                    <Text style={[styles.previewSectionTitle, { color: theme.text }]}>
                      {t('projects.details')}
                    </Text>
                    <View style={[styles.previewSectionContent, { backgroundColor: theme.background + '80' }]} />
                  </View>
                )}
                
                {reportOptions.includeEmissionSummary && (
                  <View style={styles.previewSection}>
                    <Text style={[styles.previewSectionTitle, { color: theme.text }]}>
                      {t('emissions.summary')}
                    </Text>
                    <View style={[styles.previewSectionContent, { backgroundColor: theme.background + '80' }]} />
                  </View>
                )}
                
                {reportOptions.includeStageAnalysis && (
                  <View style={styles.previewSection}>
                    <Text style={[styles.previewSectionTitle, { color: theme.text }]}>
                      {t('analytics.stage.analysis')}
                    </Text>
                    <View style={[styles.previewSectionContent, { backgroundColor: theme.background + '80' }]} />
                  </View>
                )}
                
                {reportOptions.includeCategoryBreakdown && (
                  <View style={styles.previewSection}>
                    <Text style={[styles.previewSectionTitle, { color: theme.text }]}>
                      {t('analytics.category.distribution')}
                    </Text>
                    <View style={[styles.previewSectionContent, { backgroundColor: theme.background + '80' }]} />
                  </View>
                )}
                
                {reportOptions.includeDetailedRecords && (
                  <View style={styles.previewSection}>
                    <Text style={[styles.previewSectionTitle, { color: theme.text }]}>
                      {t('emissions.title')}
                    </Text>
                    <View style={[styles.previewSectionContent, { backgroundColor: theme.background + '80' }]} />
                  </View>
                )}
                
                {reportOptions.includeCollaborators && (
                  <View style={styles.previewSection}>
                    <Text style={[styles.previewSectionTitle, { color: theme.text }]}>
                      {t('collaborators.title')}
                    </Text>
                    <View style={[styles.previewSectionContent, { backgroundColor: theme.background + '80' }]} />
                  </View>
                )}
                
                {reportOptions.includeTips && (
                  <View style={styles.previewSection}>
                    <Text style={[styles.previewSectionTitle, { color: theme.text }]}>
                      {t('tips.title')}
                    </Text>
                    <View style={[styles.previewSectionContent, { backgroundColor: theme.background + '80' }]} />
                  </View>
                )}
              </View>
              
              <View style={styles.previewFooter}>
                <Text style={[styles.previewFooterText, { color: theme.secondaryText }]}>
                  {t('reports.generated')}: {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Button
          title={t('reports.generate')}
          onPress={handleGenerateReport}
          variant="primary"
          loading={isGenerating}
          icon={<Download size={20} color="#FFFFFF" />}
          style={styles.generateButton}
        />
      </View>
    </SafeAreaView>
  );
}

interface OptionItemProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  theme: any;
  icon: React.ReactNode;
  isLast?: boolean;
}

function OptionItem({ 
  title, 
  description, 
  isEnabled, 
  onToggle, 
  theme, 
  icon,
  isLast = false 
}: OptionItemProps) {
  return (
    <View style={[
      styles.optionItem,
      !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }
    ]}>
      <View style={styles.optionHeader}>
        <View style={styles.optionTitleContainer}>
          {icon}
          <Text style={[styles.optionTitle, { color: theme.text }]}>{title}</Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.primary + '50' }}
          thumbColor={isEnabled ? theme.primary : theme.secondaryText}
        />
      </View>
      <Text style={[styles.optionDescription, { color: theme.secondaryText }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  projectInfoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  projectName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  projectDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  projectDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  projectDetailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionItem: {
    padding: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 32,
  },
  reportPreviewSection: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  previewCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  previewContent: {
    padding: 16,
  },
  previewSection: {
    marginBottom: 16,
  },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  previewSectionContent: {
    height: 40,
    borderRadius: 8,
  },
  previewFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewFooterText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  generateButton: {
    width: '100%',
  },
});