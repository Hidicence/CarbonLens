import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, MapPin, FileEdit, Film, Clapperboard, Calculator } from 'lucide-react-native';
import { ProjectEmissionRecord, ProductionStage } from '@/types/project';
import { EMISSION_CATEGORIES, STAGE_CATEGORIES, EMISSION_SOURCES } from '@/mocks/projects';
import { getTranslatedProjectCategories, getTranslatedProjectSources, getTranslatedStageCategories } from '@/utils/translations';
import Colors from '@/constants/colors';

interface EmissionRecordItemProps {
  record: ProjectEmissionRecord;
  onPress: () => void;
}

export default function EmissionRecordItem({ record, onPress }: EmissionRecordItemProps) {
  const { t } = useTranslation();
  
  // 獲取翻譯後的類別和排放源
  const translatedCategories = getTranslatedProjectCategories(t);
  const translatedSources = getTranslatedProjectSources(t);
  const translatedStageCategories = getTranslatedStageCategories(t);
  
  // 查找類別 - 添加安全檢查
  const category = 
    translatedCategories.find(cat => cat.id === record.categoryId) || 
    (translatedStageCategories && translatedStageCategories['pre-production'] ? translatedStageCategories['pre-production'].find(cat => cat.id === record.categoryId) : null) ||
    (translatedStageCategories && translatedStageCategories['production'] ? translatedStageCategories['production'].find(cat => cat.id === record.categoryId) : null) ||
    (translatedStageCategories && translatedStageCategories['post-production'] ? translatedStageCategories['post-production'].find(cat => cat.id === record.categoryId) : null);

  // 查找排放源
  const source = record.sourceId 
    ? translatedSources.find(s => s.id === record.sourceId) 
    : null;

  if (!category) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
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
    const size = 16;
    const color = Colors.dark.secondaryText;
    
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
    'pre-production': t('stage.pre-production'),
    'production': t('stage.production'),
    'post-production': t('stage.post-production')
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { borderLeftColor: category.color },
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
          <Text style={styles.categoryText}>{category.name}</Text>
        </View>
        <Text style={styles.amount}>{record.amount.toFixed(2)} {t('unit.kg.co2e.simple')}</Text>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {record.description}
      </Text>
      
      {source && record.quantity && (
        <View style={styles.sourceContainer}>
          <Calculator size={14} color={Colors.dark.secondaryText} />
          <Text style={styles.sourceText}>
            {source.name}: {record.quantity} {record.unit || source.unit}
          </Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Calendar size={14} color={Colors.dark.secondaryText} />
          <Text style={styles.footerText}>{formatDate(record.date)}</Text>
        </View>
        
        {record.location && (
          <View style={styles.footerItem}>
            <MapPin size={14} color={Colors.dark.secondaryText} />
            <Text style={styles.footerText}>{record.location}</Text>
          </View>
        )}
        
        <View style={styles.footerItem}>
          {getStageIcon(record.stage)}
          <Text style={[styles.footerText, { color: getStageColor(record.stage) }]}>
            {stageLabels[record.stage]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: Colors.dark.text,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
    marginLeft: 4,
  },
});