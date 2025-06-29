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
  disableNetwork
} from 'firebase/firestore';
import { db, auth } from '@/utils/firebaseConfig';
import { 
  Project, 
  ProjectEmissionRecord, 
  NonProjectEmissionRecord,
  ShootingDayEmission,
  AllocationRecord 
} from '@/types/project';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';

/**
 * Firebase數據同步服務
 * 這個服務會自動將您的數據同步到雲端
 */
class FirebaseDataSync {
  private userId: string | null = null;
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private shouldStopSync: boolean = false;

  constructor() {
    // 監聽用戶登入狀態
    auth.onAuthStateChanged((user) => {
      this.userId = user?.uid || null;
      if (this.userId) {
        console.log('🔄 用戶已登入，開始同步數據...');
        this.startAutoSync();
      } else {
        console.log('👤 用戶已登出，停止同步');
        this.stopSync();
      }
    });
  }

  /**
   * 停止同步
   */
  stopSync() {
    this.shouldStopSync = true;
    this.isSyncing = false;
    console.log('⏹️ 同步已停止');
  }

  /**
   * 開始自動同步
   */
  async startAutoSync() {
    if (!this.userId || this.isSyncing) return;
    
    this.isSyncing = true;
    this.shouldStopSync = false;
    
    try {
      console.log('☁️ 首先從雲端下載最新數據...');
      await this.downloadFromCloud();
      
      if (this.shouldStopSync) return;
      
      console.log('📱 開始同步本地數據到雲端...');
      await this.syncProjects();
      
      if (this.shouldStopSync) return;
      
      console.log('📊 開始同步排放記錄...');
      await this.syncEmissionRecords();
      
      if (this.shouldStopSync) return;
      
      console.log('🎬 開始同步拍攝日記錄...');
      await this.syncShootingDayRecords();
      
      if (this.shouldStopSync) return;
      
      console.log('⚖️ 開始同步營運記錄...');
      await this.syncOperationalRecords();
      
      console.log('✅ 所有數據同步完成！');
    } catch (error) {
      console.error('❌ 數據同步失敗:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 同步專案數據到雲端
   */
  async syncProjects() {
    if (!this.userId || this.shouldStopSync) return;

    const projectStore = useProjectStore.getState();
    const projects = projectStore.projects;

    for (const project of projects) {
      if (this.shouldStopSync) break;
      
      try {
        const projectRef = doc(db, 'users', this.userId, 'projects', project.id);
        await setDoc(projectRef, {
          ...project,
          syncedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log(`✅ 專案 "${project.name}" 已同步到雲端`);
      } catch (error) {
        console.error(`❌ 同步專案 "${project.name}" 失敗:`, error);
      }
    }
  }

  /**
   * 同步專案排放記錄
   */
  async syncEmissionRecords() {
    if (!this.userId || this.shouldStopSync) return;

    const projectStore = useProjectStore.getState();
    const records = projectStore.projectEmissionRecords;

    for (const record of records) {
      if (this.shouldStopSync) break;
      
      try {
        const recordRef = doc(db, 'users', this.userId, 'emissionRecords', record.id || '');
        await setDoc(recordRef, {
          ...record,
          syncedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log(`✅ 排放記錄 "${record.description}" 已同步`);
      } catch (error) {
        console.error(`❌ 同步排放記錄失敗:`, error);
      }
    }
  }

  /**
   * 同步拍攝日記錄
   */
  async syncShootingDayRecords() {
    if (!this.userId || this.shouldStopSync) return;

    const projectStore = useProjectStore.getState();
    const allShootingRecords = projectStore.shootingDayRecords;

    // 遍歷每個專案的拍攝記錄
    for (const [projectId, records] of Object.entries(allShootingRecords)) {
      if (this.shouldStopSync) break;
      
      for (const record of records) {
        if (this.shouldStopSync) break;
        
        try {
          const recordRef = doc(db, 'users', this.userId, 'shootingDayRecords', record.id);
          await setDoc(recordRef, {
            ...record,
            syncedAt: new Date().toISOString()
          }, { merge: true });
          
          console.log(`✅ 拍攝記錄 "${record.description}" 已同步`);
        } catch (error) {
          console.error(`❌ 同步拍攝記錄失敗:`, error);
        }
      }
    }
  }

  /**
   * 同步營運排放記錄
   */
  async syncOperationalRecords() {
    if (!this.userId || this.shouldStopSync) return;

    const projectStore = useProjectStore.getState();
    const records = projectStore.nonProjectEmissionRecords;

    for (const record of records) {
      if (this.shouldStopSync) break;
      
      try {
        const recordRef = doc(db, 'users', this.userId, 'operationalRecords', record.id || '');
        await setDoc(recordRef, {
          ...record,
          syncedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log(`✅ 營運記錄 "${record.description}" 已同步`);
      } catch (error) {
        console.error(`❌ 同步營運記錄失敗:`, error);
      }
    }
  }

  /**
   * 從雲端下載數據到本地
   */
  async downloadFromCloud() {
    if (!this.userId || this.shouldStopSync) return;

    try {
      console.log('☁️ 開始從雲端下載數據...');
      
      // 下載專案數據
      await this.downloadProjects();
      
      if (this.shouldStopSync) return;
      
      // 下載排放記錄
      await this.downloadEmissionRecords();
      
      if (this.shouldStopSync) return;
      
      // 下載拍攝記錄
      await this.downloadShootingDayRecords();
      
      if (this.shouldStopSync) return;
      
      // 下載營運記錄
      await this.downloadOperationalRecords();
      
      console.log('✅ 雲端數據下載完成！');
    } catch (error) {
      console.error('❌ 下載雲端數據失敗:', error);
    }
  }

  /**
   * 下載專案數據
   */
  async downloadProjects() {
    if (!this.userId || this.shouldStopSync) return;

    const projectsRef = collection(db, 'users', this.userId, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    if (snapshot.empty) {
      console.log('☁️ 雲端沒有專案數據');
      return;
    }

    const projects: Project[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Project;
      projects.push(data);
    });

    // 直接更新本地store，不觸發Firebase同步
    const projectStore = useProjectStore.getState();
    const existingProjects = projectStore.projects;
    
    // 使用 setState 直接更新，避免觸發 addProject 的 Firebase 同步
    useProjectStore.setState((state) => {
      const updatedProjects = [...existingProjects];
      
      projects.forEach(project => {
        const existingIndex = updatedProjects.findIndex(p => p.id === project.id);
        if (existingIndex >= 0) {
          // 更新現有專案
          updatedProjects[existingIndex] = project;
          console.log(`🔄 更新專案: ${project.name}`);
        } else {
          // 添加新專案
          updatedProjects.push(project);
          console.log(`📥 下載專案: ${project.name}`);
        }
      });
      
      return { ...state, projects: updatedProjects };
    });
  }

  /**
   * 下載排放記錄
   */
  async downloadEmissionRecords() {
    if (!this.userId || this.shouldStopSync) return;

    const recordsRef = collection(db, 'users', this.userId, 'emissionRecords');
    const snapshot = await getDocs(recordsRef);
    
    if (snapshot.empty) {
      console.log('☁️ 雲端沒有排放記錄');
      return;
    }
    
    const records: ProjectEmissionRecord[] = [];
    snapshot.forEach((doc) => {
      const record = doc.data() as ProjectEmissionRecord;
      if (record.id) {
        records.push(record);
      }
    });

    // 直接更新store
    useProjectStore.setState((state) => {
      const existingRecords = state.projectEmissionRecords;
      const updatedRecords = [...existingRecords];
      
      records.forEach(record => {
        const existingIndex = updatedRecords.findIndex(r => r.id === record.id);
        if (existingIndex >= 0) {
          updatedRecords[existingIndex] = record;
          console.log(`🔄 更新排放記錄: ${record.description}`);
        } else {
          updatedRecords.push(record);
          console.log(`📥 下載排放記錄: ${record.description}`);
        }
      });
      
      return { ...state, projectEmissionRecords: updatedRecords };
    });
  }

  /**
   * 下載拍攝日記錄
   */
  async downloadShootingDayRecords() {
    if (!this.userId || this.shouldStopSync) return;

    const recordsRef = collection(db, 'users', this.userId, 'shootingDayRecords');
    const snapshot = await getDocs(recordsRef);
    
    if (snapshot.empty) {
      console.log('☁️ 雲端沒有拍攝記錄');
      return;
    }
    
    const records: ShootingDayEmission[] = [];
    snapshot.forEach((doc) => {
      const record = doc.data() as ShootingDayEmission;
      records.push(record);
    });

    // 直接更新store
    useProjectStore.setState((state) => {
      const existingRecords = { ...state.shootingDayRecords };
      
      records.forEach(record => {
        if (!existingRecords[record.projectId]) {
          existingRecords[record.projectId] = [];
        }
        
        const projectRecords = existingRecords[record.projectId];
        const existingIndex = projectRecords.findIndex(r => r.id === record.id);
        
        if (existingIndex >= 0) {
          projectRecords[existingIndex] = record;
          console.log(`🔄 更新拍攝記錄: ${record.description}`);
        } else {
          projectRecords.push(record);
          console.log(`📥 下載拍攝記錄: ${record.description}`);
        }
      });
      
      return { ...state, shootingDayRecords: existingRecords };
    });
  }

  /**
   * 下載營運記錄
   */
  async downloadOperationalRecords() {
    if (!this.userId || this.shouldStopSync) return;

    const recordsRef = collection(db, 'users', this.userId, 'operationalRecords');
    const snapshot = await getDocs(recordsRef);
    
    if (snapshot.empty) {
      console.log('☁️ 雲端沒有營運記錄');
      return;
    }
    
    const records: NonProjectEmissionRecord[] = [];
    snapshot.forEach((doc) => {
      const record = doc.data() as NonProjectEmissionRecord;
      if (record.id) {
        records.push(record);
      }
    });

    // 直接更新store
    useProjectStore.setState((state) => {
      const existingRecords = state.nonProjectEmissionRecords;
      const updatedRecords = [...existingRecords];
      
      records.forEach(record => {
        const existingIndex = updatedRecords.findIndex(r => r.id === record.id);
        if (existingIndex >= 0) {
          updatedRecords[existingIndex] = record;
          console.log(`🔄 更新營運記錄: ${record.description}`);
        } else {
          updatedRecords.push(record);
          console.log(`📥 下載營運記錄: ${record.description}`);
        }
      });
      
      return { ...state, nonProjectEmissionRecords: updatedRecords };
    });
  }

  /**
   * 設置離線模式
   */
  async setOfflineMode() {
    try {
      this.stopSync();
      await disableNetwork(db);
      this.isOnline = false;
      console.log('📴 已切換到離線模式');
    } catch (error) {
      console.error('❌ 切換離線模式失敗:', error);
    }
  }

  /**
   * 設置在線模式
   */
  async setOnlineMode() {
    try {
      await enableNetwork(db);
      this.isOnline = true;
      console.log('📶 已切換到在線模式，開始同步...');
      await this.startAutoSync();
    } catch (error) {
      console.error('❌ 切換在線模式失敗:', error);
    }
  }

  /**
   * 檢查同步狀態
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      userId: this.userId,
      isSyncing: this.isSyncing,
      lastSyncTime: new Date().toISOString()
    };
  }
}

// 創建全局同步實例
export const firebaseSync = new FirebaseDataSync();

// 導出同步方法，讓其他地方可以使用
export const {
  startAutoSync,
  stopSync,
  syncProjects,
  downloadFromCloud,
  setOfflineMode,
  setOnlineMode,
  getSyncStatus
} = firebaseSync; 