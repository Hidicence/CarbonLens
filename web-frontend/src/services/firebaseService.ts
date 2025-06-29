import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from 'firebase/auth';

// 數據類型定義 - 與APP端保持一致
// 使用統一的類型定義
import type { 
  Project, 
  ProjectEmissionRecord, 
  NonProjectEmissionRecord, 
  ShootingDayEmission 
} from '../../../types/project';

class FirebaseService {
  private getUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  private getUserCollection(collectionName: string) {
    const userId = this.getUserId();
    if (!userId) throw new Error('用戶未登入');
    return collection(db, 'users', userId, collectionName);
  }

  // 專案相關方法
  async getProjects(): Promise<Project[]> {
    try {
      const projectsCol = this.getUserCollection('projects');
      const snapshot = await getDocs(query(projectsCol, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
    } catch (error) {
      console.error('獲取專案失敗:', error);
      return [];
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const userId = this.getUserId();
      if (!userId) return null;
      
      const projectDoc = doc(db, 'users', userId, 'projects', projectId);
      const snapshot = await getDoc(projectDoc);
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Project;
      }
      return null;
    } catch (error) {
      console.error('獲取專案失敗:', error);
      return null;
    }
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<string> {
    try {
      const projectsCol = this.getUserCollection('projects');
      const docRef = await addDoc(projectsCol, {
        ...project,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('創建專案失敗:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) throw new Error('用戶未登入');
      
      const projectDoc = doc(db, 'users', userId, 'projects', projectId);
      await updateDoc(projectDoc, updates);
    } catch (error) {
      console.error('更新專案失敗:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) throw new Error('用戶未登入');
      
      const projectDoc = doc(db, 'users', userId, 'projects', projectId);
      await deleteDoc(projectDoc);
    } catch (error) {
      console.error('刪除專案失敗:', error);
      throw error;
    }
  }

  // 排放記錄相關方法
  async getEmissionRecords(projectId?: string): Promise<ProjectEmissionRecord[]> {
    try {
      const recordsCol = this.getUserCollection('emissionRecords');
      let q = query(recordsCol, orderBy('date', 'desc'));
      
      if (projectId) {
        q = query(recordsCol, where('projectId', '==', projectId), orderBy('date', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProjectEmissionRecord));
    } catch (error) {
      console.error('獲取排放記錄失敗:', error);
      return [];
    }
  }

  async createEmissionRecord(record: Omit<ProjectEmissionRecord, 'id' | 'createdAt'>): Promise<string> {
    try {
      const recordsCol = this.getUserCollection('emissionRecords');
      const docRef = await addDoc(recordsCol, {
        ...record,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('創建排放記錄失敗:', error);
      throw error;
    }
  }

  async updateEmissionRecord(recordId: string, updates: Partial<ProjectEmissionRecord>): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) throw new Error('用戶未登入');
      
      const recordDoc = doc(db, 'users', userId, 'emissionRecords', recordId);
      await updateDoc(recordDoc, updates);
    } catch (error) {
      console.error('更新排放記錄失敗:', error);
      throw error;
    }
  }

  async deleteEmissionRecord(recordId: string): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) throw new Error('用戶未登入');
      
      const recordDoc = doc(db, 'users', userId, 'emissionRecords', recordId);
      await deleteDoc(recordDoc);
    } catch (error) {
      console.error('刪除排放記錄失敗:', error);
      throw error;
    }
  }

  // 營運排放記錄
  async getOperationalRecords(): Promise<NonProjectEmissionRecord[]> {
    try {
      const recordsCol = this.getUserCollection('operationalRecords');
      const snapshot = await getDocs(query(recordsCol, orderBy('date', 'desc')));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NonProjectEmissionRecord));
    } catch (error) {
      console.error('獲取營運記錄失敗:', error);
      return [];
    }
  }

  // 拍攝日記錄
  async getShootingDayRecords(projectId?: string): Promise<ShootingDayEmission[]> {
    try {
      const recordsCol = this.getUserCollection('shootingDayRecords');
      let q = query(recordsCol, orderBy('shootingDate', 'desc'));
      
      if (projectId) {
        q = query(recordsCol, where('projectId', '==', projectId), orderBy('shootingDate', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ShootingDayEmission));
    } catch (error) {
      console.error('獲取拍攝日記錄失敗:', error);
      return [];
    }
  }

  async createShootingDayRecord(record: Omit<ShootingDayEmission, 'id' | 'createdAt'>): Promise<string> {
    try {
      const userId = this.getUserId();
      if (!userId) throw new Error('用戶未登入');
      
      const recordsCol = this.getUserCollection('shootingDayRecords');
      const docRef = await addDoc(recordsCol, {
        ...record,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('創建拍攝日記錄失敗:', error);
      throw error;
    }
  }

  async updateShootingDayRecord(recordId: string, updates: Partial<ShootingDayEmission>): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) throw new Error('用戶未登入');
      
      const recordDoc = doc(db, 'users', userId, 'shootingDayRecords', recordId);
      await updateDoc(recordDoc, updates);
    } catch (error) {
      console.error('更新拍攝日記錄失敗:', error);
      throw error;
    }
  }

  async deleteShootingDayRecord(recordId: string): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) throw new Error('用戶未登入');
      
      const recordDoc = doc(db, 'users', userId, 'shootingDayRecords', recordId);
      await deleteDoc(recordDoc);
    } catch (error) {
      console.error('刪除拍攝日記錄失敗:', error);
      throw error;
    }
  }

  // 實時監聽方法
  subscribeToProjects(callback: (projects: Project[]) => void) {
    try {
      const projectsCol = this.getUserCollection('projects');
      return onSnapshot(
        query(projectsCol, orderBy('createdAt', 'desc')),
        (snapshot) => {
          const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Project));
          callback(projects);
        },
        (error) => {
          console.error('監聽專案失敗:', error);
        }
      );
    } catch (error) {
      console.error('訂閱專案失敗:', error);
      return () => {}; // 返回空的取消訂閱函數
    }
  }

  subscribeToEmissionRecords(callback: (records: ProjectEmissionRecord[]) => void, projectId?: string) {
    try {
      const recordsCol = this.getUserCollection('emissionRecords');
      let q = query(recordsCol, orderBy('date', 'desc'));
      
      if (projectId) {
        q = query(recordsCol, where('projectId', '==', projectId), orderBy('date', 'desc'));
      }
      
      return onSnapshot(
        q,
        (snapshot) => {
          const records = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ProjectEmissionRecord));
          callback(records);
        },
        (error) => {
          console.error('監聽排放記錄失敗:', error);
        }
      );
    } catch (error) {
      console.error('訂閱排放記錄失敗:', error);
      return () => {}; // 返回空的取消訂閱函數
    }
  }

  // 訂閱營運記錄的實時監聽
  subscribeToOperationalRecords(callback: (records: NonProjectEmissionRecord[]) => void) {
    try {
      const recordsCol = this.getUserCollection('operationalRecords');
      return onSnapshot(
        query(recordsCol, orderBy('date', 'desc')),
        (snapshot) => {
          const records = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as NonProjectEmissionRecord));
          callback(records);
        },
        (error) => {
          console.error('監聽營運記錄失敗:', error);
        }
      );
    } catch (error) {
      console.error('訂閱營運記錄失敗:', error);
      return () => {}; // 返回空的取消訂閱函數
    }
  }

  // 統計分析方法
  async getProjectEmissionSummary(projectId: string) {
    try {
      // 獲取專案直接排放
      const directRecords = await this.getEmissionRecords(projectId);
      const directEmissions = directRecords.reduce((sum, record) => sum + record.amount, 0);

      // 獲取分攤到該專案的營運排放
      const operationalRecords = await this.getOperationalRecords();
      const allocatedEmissions = operationalRecords.reduce((sum, record) => {
        if (record.allocations) {
          const allocation = record.allocations.find(alloc => alloc.projectId === projectId);
          return sum + (allocation?.allocatedAmount || 0);
        }
        return sum;
      }, 0);

      return {
        projectId,
        directEmissions,
        allocatedEmissions,
        totalEmissions: directEmissions + allocatedEmissions,
        directRecordCount: directRecords.length,
        allocatedRecordCount: operationalRecords.filter(r => 
          r.allocations?.some(alloc => alloc.projectId === projectId)
        ).length
      };
    } catch (error) {
      console.error('獲取專案排放摘要失敗:', error);
      return {
        projectId,
        directEmissions: 0,
        allocatedEmissions: 0,
        totalEmissions: 0,
        directRecordCount: 0,
        allocatedRecordCount: 0
      };
    }
  }

  async getOverviewStats() {
    try {
      const [projects, emissionRecords, operationalRecords] = await Promise.all([
        this.getProjects(),
        this.getEmissionRecords(),
        this.getOperationalRecords()
      ]);

      const totalProjects = projects.length;
      const totalEmissions = emissionRecords.reduce((sum, record) => sum + record.amount, 0) +
                           operationalRecords.reduce((sum, record) => sum + record.amount, 0);

      const projectsByStatus = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalProjects,
        totalEmissions,
        projectsByStatus,
        totalRecords: emissionRecords.length + operationalRecords.length
      };
    } catch (error) {
      console.error('獲取概覽統計失敗:', error);
      return {
        totalProjects: 0,
        totalEmissions: 0,
        projectsByStatus: {},
        totalRecords: 0
      };
    }
  }

  // 清除所有數據
  async clearAllData(): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) throw new Error('用戶未登入');

      console.log('🔄 開始清除 Firebase 雲端數據...');
      
      // 清除所有專案
      const projectsRef = collection(db, 'users', userId, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);
      const projectDeletePromises = projectsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // 清除所有排放記錄
      const emissionRecordsRef = collection(db, 'users', userId, 'emissionRecords');
      const emissionSnapshot = await getDocs(emissionRecordsRef);
      const emissionDeletePromises = emissionSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // 清除所有營運記錄
      const operationalRecordsRef = collection(db, 'users', userId, 'operationalRecords');
      const operationalSnapshot = await getDocs(operationalRecordsRef);
      const operationalDeletePromises = operationalSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // 清除所有拍攝日記錄
      const shootingRecordsRef = collection(db, 'users', userId, 'shootingDayRecords');
      const shootingSnapshot = await getDocs(shootingRecordsRef);
      const shootingDeletePromises = shootingSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // 執行所有刪除操作
      await Promise.all([
        ...projectDeletePromises,
        ...emissionDeletePromises,
        ...operationalDeletePromises,
        ...shootingDeletePromises
      ]);
      
      console.log('✅ Firebase 雲端數據已清除');
    } catch (error) {
      console.error('❌ 清除 Firebase 數據失敗:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService; 