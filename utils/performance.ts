// 性能優化工具函數

// 簡單記憶化裝飾器
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // 限制緩存大小，防止內存洩漏
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
}

// 帶過期時間的緩存
interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class TTLCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 預設5分鐘
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, item);
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理過期項目
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // 獲取緩存統計
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 防抖函數
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let result: ReturnType<T>;

  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) result = func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) result = func.apply(this, args);
    
    return result;
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// 節流函數
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
    return lastResult;
  } as T;
}

// 批量操作優化
export function batch<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => void,
  delay: number = 0
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    
    const processBatch = () => {
      const batch = items.slice(index, index + batchSize);
      if (batch.length === 0) {
        resolve();
        return;
      }
      
      processor(batch);
      index += batchSize;
      
      if (delay > 0) {
        setTimeout(processBatch, delay);
      } else {
        // 使用 requestIdleCallback 或 setTimeout 來避免阻塞UI
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(processBatch);
        } else {
          setTimeout(processBatch, 0);
        }
      }
    };
    
    processBatch();
  });
}

// 深度相等比較（用於選擇器優化）
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
}

// 選擇器工廠函數
export function createSelector<State, Result>(
  selector: (state: State) => Result,
  equalityFn: (a: Result, b: Result) => boolean = deepEqual
) {
  let lastState: State;
  let lastResult: Result;
  let hasResult = false;

  return (state: State): Result => {
    if (!hasResult || state !== lastState) {
      const result = selector(state);
      
      if (!hasResult || !equalityFn(result, lastResult)) {
        lastResult = result;
      }
      
      lastState = state;
      hasResult = true;
    }
    
    return lastResult;
  };
}

// 性能監控
export class PerformanceMonitor {
  private measurements = new Map<string, number[]>();
  
  start(name: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      
      const measurements = this.measurements.get(name)!;
      measurements.push(duration);
      
      // 只保留最近100次測量
      if (measurements.length > 100) {
        measurements.shift();
      }
      
      return duration;
    };
  }
  
  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) {
      return null;
    }
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    const avg = sum / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    return {
      count: measurements.length,
      average: avg,
      min,
      max,
      total: sum,
    };
  }
  
  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name] of this.measurements) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }
  
  clear() {
    this.measurements.clear();
  }
}

// 單例性能監控器
export const performanceMonitor = new PerformanceMonitor();

// 性能測量裝飾器
export function measurePerformance(name: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;
    
    descriptor.value = function (this: any, ...args: any[]) {
      const end = performanceMonitor.start(name);
      try {
        const result = originalMethod.apply(this, args);
        
        // 處理異步方法
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            end();
          });
        }
        
        end();
        return result;
      } catch (error) {
        end();
        throw error;
      }
    } as T;
    
    return descriptor;
  };
}

// 數組分組優化
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  
  for (const item of array) {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }
  
  return groups;
}

// 數組去重優化
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  
  for (const item of array) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  
  return result;
}

// 虛擬滾動計算
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualItems<T>(
  items: T[],
  scrollTop: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index,
    top: (startIndex + index) * itemHeight,
  }));
  
  return {
    totalHeight,
    visibleItems,
    startIndex,
    endIndex,
  };
} 