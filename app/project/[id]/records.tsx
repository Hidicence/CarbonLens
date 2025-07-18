import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, Filter, ArrowUp, ArrowDown, X, Calendar, DollarSign, MessageSquare } from 'lucide-react-native';
import { useProjectStore } from '@/store/projectStore';
import { useFloatingAIStore } from '@/store/floatingAIStore';
import { ProjectEmissionRecord, ProductionStage } from '@/types/project';
import Header from '@/components/Header';
import EmissionRecordItem from '@/components/EmissionRecordItem';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

type SortBy = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export default function ProjectRecordsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { projects, getProjectEmissionRecords } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const { showFloatingAI } = useFloatingAIStore();
  const { t } = useTranslation();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProductionStage | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filteredRecords, setFilteredRecords] = useState<ProjectEmissionRecord[]>([]);

  
  // Memoize project and projectRecords to prevent infinite re-renders
  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);
  
  // Memoize projectRecords to prevent infinite re-renders
  const projectRecords = useMemo(() => 
    getProjectEmissionRecords(id || ''),
    [getProjectEmissionRecords, id]
  );
  
  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter and sort records
  useEffect(() => {
    let records = [...projectRecords];
    
    // Search filter
    if (searchQuery) {
      records = records.filter(record => 
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.location && record.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Stage filter
    if (selectedStage) {
      records = records.filter(record => record.stage === selectedStage);
    }
    
    // Sort
    records.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });
    
    setFilteredRecords(records);
  }, [projectRecords, searchQuery, selectedStage, sortBy, sortOrder]);
  
  const handleRecordPress = (recordId: string) => {
    router.push(`/project/record/${recordId}`);
  };
  
  const handleAddRecord = () => {
    router.push({
      pathname: '/project/add-record',
      params: { projectId: id }
    });
  };

  const handleAIButtonPress = () => {
    console.log(t('projects.records.ai.button.pressed'));
    alert(t('projects.records.ai.button.pressed'));
    showFloatingAI();
  };


  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleSortByChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      toggleSortOrder();
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc'); // Default to descending when changing sort field
    }
  };
  
  const clearFilters = () => {
    setSelectedStage(null);
    setSortBy('date');
    setSortOrder('desc');
    setSearchQuery('');
    setShowFilters(false);
  };
  
  const stageOptions: { value: ProductionStage | null; label: string }[] = [
    { value: null, label: t('common.all') },
    { value: 'pre-production', label: t('stage.pre-production') },
    { value: 'production', label: t('stage.production') },
    { value: 'post-production', label: t('stage.post-production') },
  ];
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('emissions.title')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('emissions.title')} showBackButton />
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: theme.secondaryText }]}>{t('projects.empty')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={`${project.name} - ${t('emissions.title')}`} 
        showBackButton
      />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t('common.search')}
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={theme.secondaryText} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: theme.card }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.card }]}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.text }]}>{t('stages.title')}</Text>
            <View style={styles.stageOptions}>
              {stageOptions.map((option) => (
                <TouchableOpacity
                  key={option.value || 'all'}
                  style={[
                    styles.stageOption,
                    { 
                      backgroundColor: selectedStage === option.value ? theme.primary : theme.background,
                      borderColor: selectedStage === option.value ? theme.primary : theme.border
                    }
                  ]}
                  onPress={() => setSelectedStage(option.value)}
                >
                  <Text
                    style={[
                      styles.stageOptionText,
                      { color: selectedStage === option.value ? '#FFFFFF' : theme.text }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.text }]}>{t('common.sort')}</Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  { 
                    backgroundColor: sortBy === 'date' ? theme.primary : theme.background,
                    borderColor: sortBy === 'date' ? theme.primary : theme.border
                  }
                ]}
                onPress={() => handleSortByChange('date')}
              >
                <Calendar size={16} color={sortBy === 'date' ? '#FFFFFF' : theme.text} />
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: sortBy === 'date' ? '#FFFFFF' : theme.text }
                  ]}
                >
                  {t('emissions.date')}
                </Text>
                {sortBy === 'date' && (
                  sortOrder === 'asc' 
                    ? <ArrowUp size={16} color="#FFFFFF" /> 
                    : <ArrowDown size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  { 
                    backgroundColor: sortBy === 'amount' ? theme.primary : theme.background,
                    borderColor: sortBy === 'amount' ? theme.primary : theme.border
                  }
                ]}
                onPress={() => handleSortByChange('amount')}
              >
                <DollarSign size={16} color={sortBy === 'amount' ? '#FFFFFF' : theme.text} />
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: sortBy === 'amount' ? '#FFFFFF' : theme.text }
                  ]}
                >
                  {t('emissions.amount')}
                </Text>
                {sortBy === 'amount' && (
                  sortOrder === 'asc' 
                    ? <ArrowUp size={16} color="#FFFFFF" /> 
                    : <ArrowDown size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.clearFiltersButton, { borderColor: theme.border }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearFiltersText, { color: theme.primary }]}>{t('common.clear.filters')}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {filteredRecords.length > 0 ? (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id || `record-${Date.now()}-${Math.random()}`}
          renderItem={({ item }) => (
            <EmissionRecordItem
              record={item}
              onPress={() => handleRecordPress(item.id || '')}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {searchQuery || selectedStage 
              ? t('emissions.empty') 
              : t('emissions.empty')}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={handleAddRecord}
          >
            <Text style={styles.addButtonText}>{t('emissions.add')}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* {t('projects.records.floating.buttons')} */}
        <View style={styles.fabContainer}>
        <TouchableOpacity
          style={{
            backgroundColor: '#10B981', 
            marginBottom: 12,
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            borderWidth: 2,
            borderColor: 'white',
          }}
          onPress={handleAIButtonPress}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>AI</Text>
        </TouchableOpacity>
        
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.primary }]}
            onPress={handleAddRecord}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>


    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  stageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stageOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  stageOptionText: {
    fontSize: 14,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  sortOptionText: {
    fontSize: 14,
    marginLeft: 4,
    marginRight: 4,
  },
  clearFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'center',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  aiFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});