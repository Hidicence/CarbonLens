import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
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
  email: string;
  phone: string;
  website?: string;
  carbonNeutralTarget?: string;
  reductionGoal?: number; // 百分比
}

interface ProfileState {
  profile: UserProfile;
  organization: OrganizationInfo;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateOrganization: (organization: Partial<OrganizationInfo>) => void;
  resetProfile: () => void;
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
    (set) => ({
      profile: defaultProfile,
      organization: defaultOrganization,
      updateProfile: (newProfile) =>
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        })),
      updateOrganization: (newOrganization) =>
        set((state) => ({
          organization: { ...state.organization, ...newOrganization },
        })),
      resetProfile: () =>
        set(() => ({
          profile: defaultProfile,
          organization: defaultOrganization,
        })),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);