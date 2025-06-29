import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Chrome, Leaf } from 'lucide-react';
import TestCredentials from './TestCredentials';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      // 錯誤已在 AuthContext 中處理
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // 錯誤已在 AuthContext 中處理
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-green-500/10"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/25">
            <Leaf className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            CarbonLens
          </h2>
          <p className="text-lg text-purple-200 mb-2">
            網頁管理平台
          </p>
          <p className="text-sm text-gray-400">
            影視製作碳足跡追蹤與管理系統
          </p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <div className="flex mb-8 bg-slate-700/50 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 text-center rounded-lg transition-all duration-300 font-medium ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              登入
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 text-center rounded-lg transition-all duration-300 font-medium ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              註冊
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-3">
                電子郵件
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  placeholder="請輸入您的電子郵件"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-3">
                密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 border border-slate-600 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  placeholder="請輸入您的密碼"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-purple-400 hover:text-purple-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-purple-400 hover:text-purple-300 transition-colors" />
                  )}
                            </button>
          </div>

          {/* 測試帳號信息 */}
          <TestCredentials />
        </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>處理中...</span>
                </div>
              ) : (
                isLogin ? '登入系統' : '創建帳號'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/60 text-gray-400">或</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-6 w-full flex justify-center items-center py-3 px-6 border border-slate-600 rounded-xl shadow-sm text-base font-medium text-gray-300 bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
            >
              <Chrome className="h-5 w-5 mr-3" />
              使用 Google 登入
            </button>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-purple-200">
            使用與手機APP相同的帳號登入
          </p>
          <p className="text-xs text-gray-400">
            即可同步所有專案數據與排放記錄
          </p>
          <div className="flex items-center justify-center space-x-4 pt-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">即時同步</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
              <span className="text-xs text-purple-400">安全加密</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 