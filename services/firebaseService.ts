import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/utils/firebaseConfig';
import { 
  Project, 
  ProjectEmissionRecord, 
  NonProjectEmissionRecord,
  ShootingDayEmission,
  AllocationRecord 
} from '@/types/project';

/**
 * 統一Firebase服務 - APP端專用
 * 標準化數據操作，確保與未來網頁端的兼容性
 */
class FirebaseService {
  private userId: string | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    // 監聽認證狀態變化
    auth.onAuthStateChanged((user) => {
      this.userId = user?.uid || null;
      if (!this.userId) {
        this.clearAllListeners();
      }
    });
  }

  // 獲取用戶專屬集合引用
  private getUserCollection(collectionName: string) {
    if (!this.userId) {
      throw new Error('用戶未登入，無法訪問Firebase');
    }
    return collection(db, 'users', this.userId, collectionName);
  }

  // 獲取用戶專屬文檔引用
  private getUserDoc(collectionName: string, docId: string) {
    if (!this.userId) {
      throw new Error('用戶未登入，無法訪問Firebase');
    }
    return doc(db, 'users', this.userId, collectionName, docId);
  }

  // 清理所有監聽器
  private clearAllListeners() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }

  // =================== 專案操作 ===================

  /**
   * 創建或更新專案
   */
  async saveProject(project: Project): Promise<void> {
    try {
      const projectRef = this.getUserDoc('projects', project.id);
      const cleanProject = this.cleanFirebaseData({
        ...project,
        syncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await setDoc(projectRef, cleanProject, { merge: true });
      console.log(`✅ 專案 "${project.name}" 已同步到 Firebase`);
    } catch (error) {
      console.error(`❌ 保存專案失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除專案
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const projectRef = this.getUserDoc('projects', projectId);
      await deleteDoc(projectRef);
      console.log(`✅ 專案已從 Firebase 刪除`);
    } catch (error) {
      console.error(`❌ 刪除專案失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取所有專案
   */
  async getProjects(): Promise<Project[]> {
    try {
      const projectsCol = this.getUserCollection('projects');
      const snapshot = await getDocs(query(projectsCol, orderBy('createdAt', 'desc')));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
    } catch (error) {
      console.error('❌ 獲取專案失敗:', error);
      return [];
    }
  }

  /**
   * 監聽專案變化
   */
  subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    if (!this.userId) {
      console.warn('用戶未登入，無法監聽專案變化');
      return () => {};
    }

    try {
      const projectsCol = this.getUserCollection('projects');
      const q = query(projectsCol, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
        callback(projects);
      }, (error) => {
        console.error('❌ 監聽專案變化失敗:', error);
      });

      this.listeners.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ 設置專案監聽失敗:', error);
      return () => {};
    }
  }

  // =================== 專案排放記錄操作 ===================

  /**
   * 保存專案排放記錄
   */
  async saveProjectEmissionRecord(record: ProjectEmissionRecord): Promise<void> {
    try {
      const recordRef = this.getUserDoc('emissionRecords', record.id);
      const cleanRecord = this.cleanFirebaseData({
        ...record,
        syncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await setDoc(recordRef, cleanRecord, { merge: true });
      console.log(`✅ 專案排放記錄已同步到 Firebase`);
    } catch (error) {
      console.error(`❌ 保存專案排放記錄失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除專案排放記錄
   */
  async deleteProjectEmissionRecord(recordId: string): Promise<void> {
    try {
      const recordRef = this.getUserDoc('emissionRecords', recordId);
      await deleteDoc(recordRef);
      console.log(`✅ 專案排放記錄已從 Firebase 刪除`);
    } catch (error) {
      console.error(`❌ 刪除專案排放記錄失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取專案排放記錄
   */
  async getProjectEmissionRecords(): Promise<ProjectEmissionRecord[]> {
    try {
      const recordsCol = this.getUserCollection('emissionRecords');
      const snapshot = await getDocs(query(recordsCol, orderBy('date', 'desc')));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProjectEmissionRecord));
    } catch (error) {
      console.error('❌ 獲取專案排放記錄失敗:', error);
      return [];
    }
  }

  // =================== 營運排放記錄操作 ===================

  /**
   * 保存營運排放記錄
   */
  async saveOperationalEmissionRecord(record: NonProjectEmissionRecord): Promise<void> {
    try {
      const recordRef = this.getUserDoc('operationalRecords', record.id);
      const cleanRecord = this.cleanFirebaseData({
        ...record,
        syncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await setDoc(recordRef, cleanRecord, { merge: true });
      console.log(`✅ 營運排放記錄已同步到 Firebase`);
    } catch (error) {
      console.error(`❌ 保存營運排放記錄失敗:`, error);
      throw error;
    }
  }

  /**
   * 刪除營運排放記錄
   */
  async deleteOperationalEmissionRecord(recordId: string): Promise<void> {
    try {
      const recordRef = this.getUserDoc('operationalRecords', recordId);
      await deleteDoc(recordRef);
      console.log(`✅ 營運排放記錄已從 Firebase 刪除`);
    } catch (error) {
      console.error(`❌ 刪除營運排放記錄失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取營運排放記錄
   */
  async getOperationalEmissionRecords(): Promise<NonProjectEmissionRecord[]> {
    try {
      const recordsCol = this.getUserCollection('operationalRecords');
      const snapshot = await getDocs(query(recordsCol, orderBy('date', 'desc')));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NonProjectEmissionRecord));
    } catch (error) {
      console.error('❌ 獲取營運排放記錄失敗:', error);
      return [];
    }
  }

  // =================== 拍攝日記錄操作 ===================

  /**
   * 保存拍攝日記錄
   */
  async saveShootingDayRecord(record: ShootingDayEmission): Promise<void> {
    try {
      const recordRef = this.getUserDoc('shootingDayRecords', record.id);
      const cleanRecord = this.cleanFirebaseData({
        ...record,
        syncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await setDoc(recordRef, cleanRecord, { merge: true });
      console.log(`✅ 拍攝日記錄已同步到 Firebase`);
    } catch (error) {
      console.error(`❌ 保存拍攝日記錄失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取拍攝日記錄
   */
  async getShootingDayRecords(): Promise<ShootingDayEmission[]> {
    try {
      const recordsCol = this.getUserCollection('shootingDayRecords');
      const snapshot = await getDocs(query(recordsCol, orderBy('shootingDate', 'desc')));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ShootingDayEmission));
    } catch (error) {
      console.error('❌ 獲取拍攝日記錄失敗:', error);
      return [];
    }
  }

  // =================== 工具方法 ===================

  /**
   * 清理Firebase數據 - 移除undefined值
   */
  private cleanFirebaseData(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = typeof value === 'object' && value !== null 
          ? this.cleanFirebaseData(value) 
          : value;
      }
    }
    return cleaned;
  }

  /**
   * 檢查網絡狀態
   */
  async setOnlineMode(): Promise<void> {
    try {
      await enableNetwork(db);
      console.log('📶 Firebase 已切換到在線模式');
    } catch (error) {
      console.error('❌ 切換在線模式失敗:', error);
      throw error;
    }
  }

  /**
   * 設置離線模式
   */
  async setOfflineMode(): Promise<void> {
    try {
      await disableNetwork(db);
      console.log('📵 Firebase 已切換到離線模式');
    } catch (error) {
      console.error('❌ 切換離線模式失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取當前用戶ID
   */
  getCurrentUserId(): string | null {
    return this.userId;
  }

  /**
   * 清除用戶所有Firebase數據
   */
  async clearAllUserData(): Promise<void> {
    if (!this.userId) {
      console.log('⚠️ 用戶未登入，無法清除Firebase數據');
      return;
    }

    try {
      console.log('🔄 開始清除 Firebase 雲端數據...');
      
      // 獲取所有集合的數據並刪除
      const collections = ['projects', 'emissionRecords', 'operationalRecords', 'shootingDayRecords'];
      const deletePromises: Promise<void>[] = [];

      for (const collectionName of collections) {
        const collectionRef = this.getUserCollection(collectionName);
        const snapshot = await getDocs(collectionRef);
        
        const collectionDeletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        deletePromises.push(...collectionDeletePromises);
      }

      // 執行所有刪除操作
      await Promise.all(deletePromises);
      
      console.log('✅ Firebase 雲端數據已清除');
    } catch (error) {
      console.error('❌ 清除 Firebase 數據失敗:', error);
      throw error;
    }
  }

  /**
   * 清理所有監聽器 (在登出時調用)
   */
  cleanup(): void {
    this.clearAllListeners();
    this.userId = null;
  }
}

// 創建單例實例
export const firebaseService = new FirebaseService();
export default firebaseService; 