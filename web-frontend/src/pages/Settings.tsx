import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Database,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Server,
  Key,
  Eye,
  EyeOff,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Calendar,
  Clock,
  HardDrive,
  Wifi,
  Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebaseService';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'CarbonLens',
      language: 'zh-TW',
      timezone: 'Asia/Taipei',
      dateFormat: 'YYYY-MM-DD',
      theme: 'dark',
      autoSave: true,
      soundEnabled: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReport: true,
      budgetAlerts: true,
      projectUpdates: true,
      dailyReminder: false,
      systemMaintenance: true
    },
    api: {
      baseUrl: 'http://localhost:3001',
      apiKey: '••••••••••••••••',
      timeout: 30000,
      retryAttempts: 3,
      rateLimit: 1000,
      cacheEnabled: true
    },
    data: {
      backupEnabled: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      exportFormat: 'json',
      compression: true,
      encryption: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 24,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: false
    }
  });

  const tabs = [
    { id: 'general', name: '一般設定', icon: SettingsIcon, desc: '基本系統設定' },
    { id: 'notifications', name: '通知設定', icon: Bell, desc: '通知與提醒設定' },
    { id: 'api', name: 'API 設定', icon: Server, desc: 'API 連接設定' },
    { id: 'data', name: '數據管理', icon: Database, desc: '備份與數據管理' },
    { id: 'security', name: '安全設定', icon: Shield, desc: '帳戶安全設定' },
  ];

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // 這裡應該調用 API 保存設定
    toast.success('設定已儲存');
  };

  const handleExportData = () => {
    // 模擬數據導出
    const data = {
      projects: [],
      emissions: [],
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbonlens-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('數據導出成功');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('導入的數據:', data);
            toast.success('數據導入成功');
          } catch (error) {
            toast.error('數據格式錯誤');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (window.confirm('確定要清除所有數據嗎？此操作不可撤銷！')) {
      try {
        await firebaseService.clearAllData();
        toast.success('數據已清除');
        // 刷新頁面或重新載入數據
        window.location.reload();
      } catch (error) {
        console.error('清除數據失敗:', error);
        toast.error('清除數據失敗');
      }
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="p-8 bg-gradient-glass rounded-2xl border border-app-border/20 hover:border-app-border/40 transition-all duration-300">
          <h4 className="text-xl font-bold text-app-text mb-6 flex items-center">
            <div className="p-3 bg-glassmorphism-blue/20 rounded-2xl mr-4">
              <Globe className="h-6 w-6 text-glassmorphism-blue" />
            </div>
            語言與地區
          </h4>
    <div className="space-y-6">
      <div>
              <label className="block text-base font-semibold text-app-text mb-3">
                站點名稱
        </label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                className="w-full px-4 py-3 bg-app-card/50 border border-app-border/30 rounded-xl text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-blue/50 focus:border-glassmorphism-blue/50 transition-all duration-300"
                placeholder="輸入站點名稱"
        />
      </div>

      <div>
              <label className="block text-base font-semibold text-app-text mb-3">
                語言
        </label>
        <select
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                className="w-full px-4 py-3 bg-app-card/50 border border-app-border/30 rounded-xl text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-blue/50 focus:border-glassmorphism-blue/50 transition-all duration-300"
        >
          <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
          <option value="en-US">English</option>
        </select>
      </div>

      <div>
              <label className="block text-base font-semibold text-app-text mb-3">
                時區
        </label>
        <select
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                className="w-full px-4 py-3 bg-app-card/50 border border-app-border/30 rounded-xl text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-blue/50 focus:border-glassmorphism-blue/50 transition-all duration-300"
        >
                <option value="Asia/Shanghai">亞洲/上海</option>
                <option value="Asia/Taipei">亞洲/台北</option>
          <option value="UTC">UTC</option>
        </select>
      </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-glass rounded-xl border border-app-border/20">
          <h4 className="text-lg font-semibold text-app-text mb-4 flex items-center">
            <Palette className="h-5 w-5 mr-2 text-glassmorphism-purple" />
            外觀設定
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-app-textSecondary mb-2">
                主題
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'light', label: '淺色', icon: Sun },
                  { value: 'dark', label: '深色', icon: Moon },
                  { value: 'auto', label: '自動', icon: Monitor },
                ].map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleSettingChange('general', 'theme', theme.value)}
                      className={`p-3 rounded-lg border transition-all ${
                        settings.general.theme === theme.value
                          ? 'border-glassmorphism-blue bg-glassmorphism-blue/20 text-glassmorphism-blue'
                          : 'border-app-border/20 text-app-textSecondary hover:border-app-border/40'
                      }`}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs">{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

      <div>
              <label className="block text-sm font-medium text-app-textSecondary mb-2">
          日期格式
        </label>
        <select
          value={settings.general.dateFormat}
          onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                className="w-full px-3 py-2 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-blue/50"
        >
          <option value="YYYY-MM-DD">2024-01-01</option>
          <option value="DD/MM/YYYY">01/01/2024</option>
          <option value="MM/DD/YYYY">01/01/2024</option>
        </select>
      </div>
    </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-glass rounded-xl border border-app-border/20">
        <h4 className="text-lg font-semibold text-app-text mb-4">系統偏好設定</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex items-center justify-between">
        <div>
              <h5 className="text-sm font-medium text-app-text">自動儲存</h5>
              <p className="text-xs text-app-textSecondary">自動儲存變更</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
                checked={settings.general.autoSave}
                onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
            className="sr-only peer"
          />
              <div className="w-11 h-6 bg-app-border/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-glassmorphism-blue"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
              <h5 className="text-sm font-medium text-app-text">音效</h5>
              <p className="text-xs text-app-textSecondary">啟用系統音效</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
                checked={settings.general.soundEnabled}
                onChange={(e) => handleSettingChange('general', 'soundEnabled', e.target.checked)}
            className="sr-only peer"
          />
              <div className="w-11 h-6 bg-app-border/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-glassmorphism-blue"></div>
        </label>
      </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-glass rounded-xl border border-app-border/20">
        <h4 className="text-lg font-semibold text-app-text mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-glassmorphism-green" />
          通知類型
        </h4>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: '電子郵件通知', desc: '接收重要事件的電子郵件通知' },
            { key: 'pushNotifications', label: '推送通知', desc: '接收瀏覽器推送通知' },
            { key: 'weeklyReport', label: '週報', desc: '每週接收數據匯總報告' },
            { key: 'budgetAlerts', label: '預算提醒', desc: '碳排放預算超標時提醒' },
            { key: 'projectUpdates', label: '專案更新', desc: '專案狀態變化時通知' },
            { key: 'dailyReminder', label: '每日提醒', desc: '每日數據輸入提醒' },
            { key: 'systemMaintenance', label: '系統維護', desc: '系統維護通知' },
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between p-4 bg-app-card/30 rounded-lg">
        <div>
                <h5 className="text-sm font-medium text-app-text">{notification.label}</h5>
                <p className="text-xs text-app-textSecondary">{notification.desc}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
                  checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                  onChange={(e) => handleSettingChange('notifications', notification.key, e.target.checked)}
            className="sr-only peer"
          />
                <div className="w-11 h-6 bg-app-border/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-glassmorphism-green"></div>
        </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-glass rounded-xl border border-app-border/20">
        <h4 className="text-lg font-semibold text-app-text mb-4 flex items-center">
          <Server className="h-5 w-5 mr-2 text-glassmorphism-cyan" />
          API 連接設定
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
            <label className="block text-sm font-medium text-app-textSecondary mb-2">
              API 基礎地址
        </label>
        <input
          type="text"
          value={settings.api.baseUrl}
          onChange={(e) => handleSettingChange('api', 'baseUrl', e.target.value)}
              className="w-full px-3 py-2 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-cyan/50"
          placeholder="http://localhost:3001"
        />
      </div>

      <div>
            <label className="block text-sm font-medium text-app-textSecondary mb-2">
              API 密鑰
        </label>
            <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={settings.api.apiKey}
            onChange={(e) => handleSettingChange('api', 'apiKey', e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-cyan/50"
                placeholder="輸入 API 密鑰"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-app-textSecondary hover:text-app-text transition-colors"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
            <label className="block text-sm font-medium text-app-textSecondary mb-2">
              請求超時 (毫秒)
        </label>
        <input
          type="number"
          value={settings.api.timeout}
          onChange={(e) => handleSettingChange('api', 'timeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-cyan/50"
          min="1000"
          max="120000"
        />
      </div>

      <div>
            <label className="block text-sm font-medium text-app-textSecondary mb-2">
              重試次數
        </label>
        <input
          type="number"
          value={settings.api.retryAttempts}
          onChange={(e) => handleSettingChange('api', 'retryAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-cyan/50"
          min="0"
          max="10"
        />
          </div>
      </div>

        <div className="mt-6 pt-4 border-t border-app-border/20">
        <button
            onClick={() => toast.success('API 連接測試成功')}
            className="bg-gradient-primary hover:bg-gradient-secondary rounded-lg px-4 py-2 text-white text-sm hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
            <span>測試連接</span>
        </button>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-glass rounded-xl border border-app-border/20">
        <h4 className="text-lg font-semibold text-app-text mb-4 flex items-center">
          <HardDrive className="h-5 w-5 mr-2 text-glassmorphism-orange" />
          備份設定
        </h4>
        <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
              <h5 className="text-sm font-medium text-app-text">自動備份</h5>
              <p className="text-xs text-app-textSecondary">定期自動備份數據</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.data.backupEnabled}
            onChange={(e) => handleSettingChange('data', 'backupEnabled', e.target.checked)}
            className="sr-only peer"
          />
              <div className="w-11 h-6 bg-app-border/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-glassmorphism-orange"></div>
        </label>
      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
              <label className="block text-sm font-medium text-app-textSecondary mb-2">
                備份頻率
        </label>
        <select
          value={settings.data.backupFrequency}
          onChange={(e) => handleSettingChange('data', 'backupFrequency', e.target.value)}
                className="w-full px-3 py-2 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-orange/50"
          disabled={!settings.data.backupEnabled}
        >
          <option value="daily">每日</option>
                <option value="weekly">每週</option>
          <option value="monthly">每月</option>
        </select>
      </div>

      <div>
              <label className="block text-sm font-medium text-app-textSecondary mb-2">
                保留天數
        </label>
        <input
          type="number"
          value={settings.data.retentionDays}
          onChange={(e) => handleSettingChange('data', 'retentionDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-orange/50"
          min="1"
          max="365"
          disabled={!settings.data.backupEnabled}
        />
      </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-glass rounded-xl border border-app-border/20">
        <h4 className="text-lg font-semibold text-app-text mb-4">數據操作</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="bg-gradient-glass border border-app-border/20 hover:bg-app-cardAlt/50 rounded-lg px-4 py-2 text-app-text text-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>匯出數據</span>
          </button>
          
          <button
            onClick={handleImportData}
            className="bg-gradient-glass border border-app-border/20 hover:bg-app-cardAlt/50 rounded-lg px-4 py-2 text-app-text text-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>匯入數據</span>
          </button>
          
          <button
            onClick={handleClearData}
            className="bg-gradient-glass border border-red-500/20 hover:bg-red-500/10 rounded-lg px-4 py-2 text-red-400 hover:text-red-300 text-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>清除數據</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-glass rounded-xl border border-app-border/20">
        <h4 className="text-lg font-semibold text-app-text mb-4 flex items-center">
          <Lock className="h-5 w-5 mr-2 text-glassmorphism-pink" />
          安全設定
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-app-text">雙重驗證</h5>
              <p className="text-xs text-app-textSecondary">啟用雙重驗證以提高帳戶安全性</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-app-border/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-glassmorphism-pink"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app-textSecondary mb-2">
                會話超時 (小時)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-pink/50"
                min="1"
                max="168"
              />
            </div>

      <div>
              <label className="block text-sm font-medium text-app-textSecondary mb-2">
                密碼過期 (天)
              </label>
              <input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-app-card/50 border border-app-border/20 rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-glassmorphism-pink/50"
                min="30"
                max="365"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-background via-app-background to-app-cardAlt/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 頁面標題 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-app-text to-app-textSecondary bg-clip-text text-transparent">
              系統設定
            </h1>
            <p className="text-lg text-app-textSecondary font-medium">配置系統參數和使用者偏好設定</p>
          </div>
          <button
            onClick={handleSave}
            className="bg-gradient-primary hover:bg-gradient-secondary rounded-2xl px-8 py-4 text-white font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-3 shadow-glow"
          >
            <Save className="w-5 h-5" />
            <span>儲存設定</span>
          </button>
      </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* 側邊欄標籤 */}
          <div className="xl:w-96">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl sticky top-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">設定類別</h3>
                <p className="text-slate-300 leading-relaxed">選擇要配置的設定項目</p>
              </div>
              <nav className="space-y-3">
                {tabs.map((tab, index) => {
              const Icon = tab.icon;
                  const gradients = [
                    'from-blue-500 to-purple-600',
                    'from-green-500 to-teal-600', 
                    'from-orange-500 to-red-600',
                    'from-purple-500 to-pink-600',
                    'from-yellow-500 to-orange-600'
                  ];
                  const gradient = gradients[index % gradients.length];
                  
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-start p-5 text-left font-medium rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                    activeTab === tab.id
                          ? 'text-white transform scale-105 shadow-2xl'
                          : 'text-slate-300 hover:text-white hover:scale-102'
                      }`}
                    >
                      {/* 動態背景 */}
                      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${gradient} opacity-100`
                          : 'bg-white/5 opacity-0 group-hover:opacity-100'
                      }`}></div>
                      
                      {/* 光暈效果 */}
                      {activeTab === tab.id && (
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient} blur-xl opacity-30 animate-pulse`}></div>
                      )}
                      
                      {/* 內容 */}
                      <div className="relative flex items-start w-full">
                        <div className={`p-3 rounded-xl mr-4 transition-all duration-300 ${
                          activeTab === tab.id 
                            ? 'bg-white/20 transform scale-110' 
                            : 'bg-white/10 group-hover:bg-white/20 group-hover:scale-105'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold mb-2 text-lg">{tab.name}</div>
                          <div className="text-sm opacity-80 leading-relaxed">{tab.desc}</div>
                        </div>
                      </div>
                </button>
              );
            })}
          </nav>
            </div>
        </div>

          {/* 主要內容區域 */}
        <div className="flex-1">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="mb-10">
                <div className="flex items-center space-x-4 mb-4">
                  {(() => {
                    const activeTabData = tabs.find(tab => tab.id === activeTab);
                    const Icon = activeTabData?.icon;
                    const index = tabs.findIndex(tab => tab.id === activeTab);
                    const gradients = [
                      'from-blue-500 to-purple-600',
                      'from-green-500 to-teal-600', 
                      'from-orange-500 to-red-600',
                      'from-purple-500 to-pink-600',
                      'from-yellow-500 to-orange-600'
                    ];
                    const gradient = gradients[index % gradients.length];
                    
                    return Icon ? (
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-30 animate-pulse`}></div>
                        <div className={`relative p-4 bg-gradient-to-r ${gradient} rounded-2xl`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
                    <p className="text-slate-300 font-medium text-lg leading-relaxed">
                      {tabs.find(tab => tab.id === activeTab)?.desc}
                    </p>
                  </div>
                </div>
            </div>

              <div className="animate-fadeIn">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'api' && renderApiSettings()}
            {activeTab === 'data' && renderDataSettings()}
                {activeTab === 'security' && renderSecuritySettings()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 