/**
 * 認證和用戶相關類型定義
 */

import type { BaseEntity, AsyncState } from './base';

/**
 * 社交登錄提供商
 */
export type AuthProvider = 'email' | 'google' | 'apple' | 'facebook' | 'twitter';

/**
 * 用戶狀態
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * 用戶實體
 */
export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  role?: string; // 使用字符串類型保持一致性
  provider?: AuthProvider;
  // 擴展用戶信息
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  emailVerified: boolean;
  phoneVerified?: boolean;
  lastLoginAt?: string;
  loginCount?: number;
  // 組織相關
  organizationId?: string;
  department?: string;
  position?: string;
}

/**
 * 登錄憑證
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 註冊數據
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  organizationName?: string;
}

/**
 * 密碼重置請求
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * 密碼重置確認
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 用戶會話信息
 */
export interface UserSession {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  permissions: string[];
}

/**
 * 認證狀態
 */
export interface AuthState extends AsyncState<User> {
  isLoggedIn: boolean;
  user: User | null;
  session: UserSession | null;
  isInitialized: boolean;
}

/**
 * 社交登錄提供商配置
 */
export interface SocialAuthProvider {
  id: AuthProvider;
  name: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, any>;
}

/**
 * 支援的社交登錄提供商
 */
export const SOCIAL_AUTH_PROVIDERS: SocialAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google',
    enabled: true,
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: 'apple',
    enabled: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    enabled: false,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    enabled: false,
  },
];

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  name: string;
  role?: string;
  iat: number; // Issued at
  exp: number; // Expiration
  aud?: string; // Audience
  iss?: string; // Issuer
}

/**
 * 用戶偏好設定（認證相關）
 */
export interface UserAuthPreferences {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number; // 分鐘
  allowMultipleSessions: boolean;
}

/**
 * 設備信息
 */
export interface DeviceInfo {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os: string;
  browser?: string;
  lastUsed: string;
  isCurrentDevice: boolean;
}