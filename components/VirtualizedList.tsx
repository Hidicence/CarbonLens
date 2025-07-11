import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { calculateVirtualItems, throttle } from '@/utils/performance';

interface VirtualizedListProps<T> {
  data: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  overscan?: number;
  ListHeaderComponent?: React.ComponentType | React.ReactElement;
  ListFooterComponent?: React.ComponentType | React.ReactElement;
  ListEmptyComponent?: React.ComponentType | React.ReactElement;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedList<T>({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.8,
  overscan = 5,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onScroll,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 記憶化虛擬化計算
  const virtualItems = useMemo(() => {
    return calculateVirtualItems(data, scrollTop, {
      itemHeight,
      containerHeight,
      overscan,
    });
  }, [data, scrollTop, itemHeight, containerHeight, overscan]);
  
  // 節流滾動處理
  const handleScroll = useCallback(
    throttle((event: any) => {
      const scrollPosition = event.nativeEvent.contentOffset.y;
      setScrollTop(scrollPosition);
      onScroll?.(scrollPosition);
      
      // 檢查是否需要觸發 onEndReached
      if (onEndReached) {
        const { contentSize, layoutMeasurement, contentOffset } = event.nativeEvent;
        const paddingToBottom = contentSize.height * (1 - onEndReachedThreshold);
        
        if (contentOffset.y >= paddingToBottom - layoutMeasurement.height) {
          onEndReached();
        }
      }
    }, 16), // 60fps
    [onScroll, onEndReached, onEndReachedThreshold]
  );
  
  // 空列表處理
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height: containerHeight }]}>
        {ListHeaderComponent && (
          typeof ListHeaderComponent === 'function' 
            ? <ListHeaderComponent /> 
            : ListHeaderComponent
        )}
        {ListEmptyComponent && (
          <View style={styles.emptyContainer}>
            {typeof ListEmptyComponent === 'function' 
              ? <ListEmptyComponent /> 
              : ListEmptyComponent}
          </View>
        )}
        {ListFooterComponent && (
          typeof ListFooterComponent === 'function' 
            ? <ListFooterComponent /> 
            : ListFooterComponent
        )}
      </View>
    );
  }
  
  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { height: containerHeight }]}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={true}
    >
      {/* Header */}
      {ListHeaderComponent && (
        typeof ListHeaderComponent === 'function' 
          ? <ListHeaderComponent /> 
          : ListHeaderComponent
      )}
      
      {/* 虛擬化容器 */}
      <View style={{ height: virtualItems.totalHeight, position: 'relative' }}>
        {virtualItems.visibleItems.map(({ item, index, top }) => (
          <View
            key={keyExtractor(item, index)}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </View>
        ))}
      </View>
      
      {/* Footer */}
      {ListFooterComponent && (
        typeof ListFooterComponent === 'function' 
          ? <ListFooterComponent /> 
          : ListFooterComponent
      )}
    </ScrollView>
  );
}

// 優化的分頁加載Hook
export function usePaginatedData<T>(
  allData: T[],
  pageSize: number = 50
) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedData = useMemo(() => {
    return allData.slice(0, currentPage * pageSize);
  }, [allData, currentPage, pageSize]);
  
  const hasMore = currentPage * pageSize < allData.length;
  
  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);
  
  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  return {
    data: paginatedData,
    hasMore,
    loadMore,
    reset,
    currentPage,
    totalPages: Math.ceil(allData.length / pageSize),
  };
}

// 優化的搜索Hook
export function useOptimizedSearch<T>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  // 防抖搜索詞
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);
  
  // 記憶化搜索結果
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return data;
    }
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchLower);
        }
        return false;
      });
    });
  }, [data, debouncedSearchTerm, searchFields]);
  
  return {
    filteredData,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
}

// 排序Hook
export function useOptimizedSort<T>(
  data: T[],
  sortBy: keyof T | null,
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortBy, sortOrder]);
  
  return sortedData;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VirtualizedList; 