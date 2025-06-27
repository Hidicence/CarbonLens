import React, { useState } from 'react';
import { 
  Home, 
  BarChart3, 
  FolderOpen, 
  Settings, 
  Users, 
  Bell, 
  Search, 
  ChevronDown,
  Menu,
  X,
  Activity,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Database
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  const navigationItems = [
    { id: 'dashboard', label: '儀表板', icon: Home, href: '/' },
    { id: 'projects', label: '專案管理', icon: FolderOpen, href: '/projects' },
    { id: 'emissions', label: '排放數據', icon: BarChart3, href: '/emissions' },
    { id: 'analytics', label: '數據分析', icon: TrendingUp, href: '/analytics' },
    { id: 'reports', label: '報告中心', icon: FileText, href: '/reports' },
    { id: 'team', label: '團隊管理', icon: Users, href: '/team' },
    { id: 'calendar', label: '行程規劃', icon: Calendar, href: '/calendar' },
    { id: 'database', label: '數據庫', icon: Database, href: '/database' },
    { id: 'settings', label: '系統設置', icon: Settings, href: '/settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 側邊欄 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo 區域 */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CarbonLens</h1>
                <p className="text-xs text-slate-400">碳足跡管理平台</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 導航菜單 */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white shadow-lg shadow-purple-500/10' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 用戶信息區域 */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">管</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">管理員</p>
                <p className="text-xs text-slate-400">admin@carbonlens.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="lg:ml-80">
        {/* 頂部導航欄 */}
        <header className="h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* 搜索欄 */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索專案、數據或設置..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 通知按鈕 */}
            <button className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>
            </button>

            {/* 系統狀態指示器 */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">系統正常</span>
            </div>
          </div>
        </header>

        {/* 頁面內容 */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* 移動端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 