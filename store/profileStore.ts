import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  phone?: string;
  company?: string;
  position?: string;
  location?: string;
  language: 'zh-TW' | 'en-US';
  units: 'metric' | 'imperial';
  notificationsEnabled: boolean;
  darkMode: boolean;
}

export interface OrganizationInfo {
  name: string;
  industry: string;
  reportingBoundary: string;
  address: string;
  contactPerson: string;
  contactName?: string; // 聯絡人姓名（補充字段）
  representative?: string; // 代表人/負責人
  businessNumber?: string; // 營業登記號碼
  employeeCount?: number; // 員工人數
  email: string;
  phone: string;
  website?: string;
  carbonNeutralTarget?: string;
  reductionGoal?: number; // 百分比
}

interface ProfileState {
  profile: UserProfile;
  organization: OrganizationInfo;
  currentUserId: string | null;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateOrganization: (organization: Partial<OrganizationInfo>) => void;
  resetProfile: () => void;
  setCurrentUser: (userId: string | null) => void;
}

const defaultProfile: UserProfile = {
  name: '使用者',
  email: '',
  role: '管理員',
  language: 'zh-TW',
  units: 'metric',
  notificationsEnabled: true,
  darkMode: false,
};

const defaultOrganization: OrganizationInfo = {
  name: '影視製片公司',
  industry: '影視製作',
  reportingBoundary: '公司所有影視製作專案及日常營運活動',
  address: '',
  contactPerson: '',
  email: '',
  phone: '',
  website: '',
  carbonNeutralTarget: '2030',
  reductionGoal: 15,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      organization: defaultOrganization,
      currentUserId: null,
      
      updateProfile: (newProfile) => {
        const currentState = get();
        console.log('🔄 更新 ProfileStore (用戶:', currentState.currentUserId, '):', newProfile);
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        }));
      },
      
      updateOrganization: (newOrganization) =>
        set((state) => ({
          organization: { ...state.organization, ...newOrganization },
        })),
        
      resetProfile: () => {
        console.log('🔄 重置 ProfileStore 到預設值');
        set(() => ({
          profile: { ...defaultProfile },
          organization: { ...defaultOrganization },
          currentUserId: null,
        }));
      },
      
      setCurrentUser: (userId) => {
        const currentState = get();
        if (currentState.currentUserId !== userId) {
          console.log('👤 切換用戶:', currentState.currentUserId, '->', userId);
          // 當用戶切換時，重置資料
          set(() => ({
            profile: { ...defaultProfile },
            organization: { ...defaultOrganization },
            currentUserId: userId,
          }));
        }
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2, // 增加版本號以支援新的結構
      partialize: (state) => ({
        profile: state.profile,
        organization: state.organization,
        currentUserId: state.currentUserId,
      }),
    }
  )
);