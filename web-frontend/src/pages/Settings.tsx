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
  EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'CarbonLens',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      theme: 'dark'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReport: true,
      budgetAlerts: true,
      projectUpdates: true
    },
    api: {
      baseUrl: 'http://localhost:3001',
      apiKey: '••••••••••••••••',
      timeout: 30000,
      retryAttempts: 3
    },
    data: {
      backupEnabled: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      exportFormat: 'json'
    }
  });

  const tabs = [
    { id: 'general', name: '一般设置', icon: SettingsIcon },
    { id: 'notifications', name: '通知设置', icon: Bell },
    { id: 'api', name: 'API 设置', icon: Server },
    { id: 'data', name: '数据管理', icon: Database },
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
    // 这里应该调用 API 保存设置
    toast.success('设置已保存');
  };

  const handleExportData = () => {
    // 模拟数据导出
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
    
    toast.success('数据导出成功');
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
            console.log('导入的数据:', data);
            toast.success('数据导入成功');
          } catch (error) {
            toast.error('数据格式错误');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可撤销！')) {
      // 这里应该调用 API 清除数据
      toast.success('数据已清除');
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          站点名称
        </label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
          className="input w-full max-w-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          语言
        </label>
        <select
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          className="input w-full max-w-md"
        >
          <option value="zh-CN">简体中文</option>
          <option value="zh-TW">繁体中文</option>
          <option value="en-US">English</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          时区
        </label>
        <select
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          className="input w-full max-w-md"
        >
          <option value="Asia/Shanghai">亚洲/上海</option>
          <option value="Asia/Taipei">亚洲/台北</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          日期格式
        </label>
        <select
          value={settings.general.dateFormat}
          onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
          className="input w-full max-w-md"
        >
          <option value="YYYY-MM-DD">2024-01-01</option>
          <option value="DD/MM/YYYY">01/01/2024</option>
          <option value="MM/DD/YYYY">01/01/2024</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          主题
        </label>
        <select
          value={settings.general.theme}
          onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
          className="input w-full max-w-md"
        >
          <option value="dark">深色主题</option>
          <option value="light">浅色主题</option>
          <option value="auto">跟随系统</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">邮件通知</h3>
          <p className="text-sm text-gray-400">接收重要事件的邮件通知</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">推送通知</h3>
          <p className="text-sm text-gray-400">接收浏览器推送通知</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.pushNotifications}
            onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">周报</h3>
          <p className="text-sm text-gray-400">每周接收数据汇总报告</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.weeklyReport}
            onChange={(e) => handleSettingChange('notifications', 'weeklyReport', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">预算提醒</h3>
          <p className="text-sm text-gray-400">碳排放预算超标时提醒</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.budgetAlerts}
            onChange={(e) => handleSettingChange('notifications', 'budgetAlerts', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">项目更新</h3>
          <p className="text-sm text-gray-400">项目状态变化时通知</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.projectUpdates}
            onChange={(e) => handleSettingChange('notifications', 'projectUpdates', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          API 基础地址
        </label>
        <input
          type="text"
          value={settings.api.baseUrl}
          onChange={(e) => handleSettingChange('api', 'baseUrl', e.target.value)}
          className="input w-full max-w-md"
          placeholder="http://localhost:3001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          API 密钥
        </label>
        <div className="relative max-w-md">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={settings.api.apiKey}
            onChange={(e) => handleSettingChange('api', 'apiKey', e.target.value)}
            className="input w-full pr-10"
            placeholder="输入 API 密钥"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          请求超时 (毫秒)
        </label>
        <input
          type="number"
          value={settings.api.timeout}
          onChange={(e) => handleSettingChange('api', 'timeout', parseInt(e.target.value))}
          className="input w-full max-w-md"
          min="1000"
          max="120000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          重试次数
        </label>
        <input
          type="number"
          value={settings.api.retryAttempts}
          onChange={(e) => handleSettingChange('api', 'retryAttempts', parseInt(e.target.value))}
          className="input w-full max-w-md"
          min="0"
          max="10"
        />
      </div>

      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={() => toast.success('API 连接测试成功')}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>测试连接</span>
        </button>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">自动备份</h3>
          <p className="text-sm text-gray-400">定期自动备份数据</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.data.backupEnabled}
            onChange={(e) => handleSettingChange('data', 'backupEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          备份频率
        </label>
        <select
          value={settings.data.backupFrequency}
          onChange={(e) => handleSettingChange('data', 'backupFrequency', e.target.value)}
          className="input w-full max-w-md"
          disabled={!settings.data.backupEnabled}
        >
          <option value="daily">每日</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          保留天数
        </label>
        <input
          type="number"
          value={settings.data.retentionDays}
          onChange={(e) => handleSettingChange('data', 'retentionDays', parseInt(e.target.value))}
          className="input w-full max-w-md"
          min="1"
          max="365"
          disabled={!settings.data.backupEnabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          导出格式
        </label>
        <select
          value={settings.data.exportFormat}
          onChange={(e) => handleSettingChange('data', 'exportFormat', e.target.value)}
          className="input w-full max-w-md"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
          <option value="xlsx">Excel</option>
        </select>
      </div>

      <div className="pt-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>导出数据</span>
          </button>
          
          <button
            onClick={handleImportData}
            className="btn-secondary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>导入数据</span>
          </button>
          
          <button
            onClick={handleClearData}
            className="btn-secondary text-red-400 hover:text-red-300 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>清除数据</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">系统设置</h1>
        <p className="mt-1 text-gray-400">配置系统参数和用户偏好</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 侧边栏标签 */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
            </div>

            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'api' && renderApiSettings()}
            {activeTab === 'data' && renderDataSettings()}

            {/* 保存按钮 */}
            <div className="pt-6 border-t border-gray-700">
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>保存设置</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 