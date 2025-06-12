import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadDemoProjects, removeDemoProjects } from './demoProjects';

// 存儲鍵
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const FIRST_LAUNCH_KEY = 'first_launch';

/**
 * 檢查是否是首次啟動應用
 * @returns Promise<boolean> 是否是首次啟動
 */
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    return value === null; // 如果沒有值，則是首次啟動
  } catch (error) {
    console.error('檢查首次啟動出錯:', error);
    return false; // 發生錯誤時，假設不是首次啟動
  }
};

/**
 * 標記首次啟動完成
 */
export const markFirstLaunchCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
  } catch (error) {
    console.error('標記首次啟動完成出錯:', error);
  }
};

/**
 * 檢查導引流程是否已完成
 * @returns Promise<boolean> 導引流程是否已完成
 */
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true'; // 已完成導引流程
  } catch (error) {
    console.error('檢查導引流程完成狀態出錯:', error);
    return false; // 發生錯誤時，假設未完成導引流程
  }
};

/**
 * 標記導引流程完成
 */
export const markOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('標記導引流程完成出錯:', error);
  }
};

/**
 * 重置導引流程完成狀態（用於測試）
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
  } catch (error) {
    console.error('重置導引流程狀態出錯:', error);
  }
};

/**
 * 導引流程設置
 * @param projectStore 專案存儲
 */
export const setupOnboarding = async (projectStore: any): Promise<void> => {
  try {
    const firstLaunch = await isFirstLaunch();
    const onboardingCompleted = await isOnboardingCompleted();
    
    // 如果是首次啟動且尚未完成導引流程
    if (firstLaunch && !onboardingCompleted) {
      // 不自動初始化示例數據，讓用戶手動建立專案
      console.log('首次啟動，但不自動載入示例數據');
      
      // 標記首次啟動完成
      await markFirstLaunchCompleted();
    }
  } catch (error) {
    console.error('設置導引流程出錯:', error);
  }
};

/**
 * 完成導引流程，可選擇是否保留示例資料
 * @param keepExamples 是否保留示例資料
 * @param projectStore 專案存儲
 */
export const completeOnboarding = async (
  keepExamples: boolean = false,
  projectStore: any
): Promise<void> => {
  try {
    // 如果不保留示例，清除示例資料
    if (!keepExamples) {
      projectStore.clearAllData();
    }
    
    // 標記導引流程完成
    await markOnboardingCompleted();
  } catch (error) {
    console.error('完成導引流程出錯:', error);
  }
}; 