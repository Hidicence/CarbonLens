export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  provider?: 'email' | 'google' | 'apple' | 'facebook' | 'twitter';
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface SocialAuthProvider {
  id: string;
  name: string;
  icon: string;
}