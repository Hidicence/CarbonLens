import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp, 
  Edit3, 
  Trash2,
  Eye,
  Leaf,
  Zap,
  Target,
  Folder,
  Play,
  Pause,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { api } from '../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'production' | 'post-production' | 'completed';
  startDate: string;
  endDate?: string;
  totalEmissions: number;
  targetEmissions?: number;
  progress: number;
  teamSize: number;
  category: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 模擬數據
  const avgFirstReplyTime = { hours: 30, minutes: 15 };
  const avgFullResolveTime = { hours: 22, minutes: 40 };
  const ticketsCreated = 68;
  const ticketsSolved = 55;
  const maxTickets = 68;

  // 圖表數據 (模擬)
  const chartData = [
    { month: 'Jan', created: 45, solved: 40 },
    { month: 'Feb', created: 52, solved: 48 },
    { month: 'Mar', created: 48, solved: 45 },
    { month: 'Apr', created: 61, solved: 58 },
    { month: 'May', created: 68, solved: 55 },
    { month: 'Jun', created: 58, solved: 62 },
    { month: 'Jul', created: 52, solved: 48 }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // 使用模拟数据
      setProjects([
        {
          id: '1',
          name: '《綠色製作》電影專案',
          description: '一部關於環保主題的劇情片製作，探討氣候變遷對人類社會的影響',
          status: 'production',
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          totalEmissions: 125.5,
          targetEmissions: 100,
          progress: 65,
          teamSize: 45,
          category: '劇情片'
        },
        {
          id: '2',
          name: '《城市之光》紀錄片',
          description: '記錄都市發展與環境變遷的紀錄片，深度探討可持續發展',
          status: 'post-production',
          startDate: '2023-10-01',
          endDate: '2024-03-15',
          totalEmissions: 78.2,
          targetEmissions: 80,
          progress: 90,
          teamSize: 12,
          category: '紀錄片'
        },
        {
          id: '3',
          name: '《未來世界》廣告系列',
          description: '科技公司品牌廣告拍攝專案，展示創新科技與環保理念',
          status: 'planning',
          startDate: '2024-03-01',
          totalEmissions: 0,
          targetEmissions: 50,
          progress: 15,
          teamSize: 8,
          category: '廣告'
        },
        {
          id: '4',
          name: '《海洋守護者》短片',
          description: '海洋保護主題短片，呼籲大眾關注海洋污染問題',
          status: 'completed',
          startDate: '2023-08-01',
          endDate: '2023-12-20',
          totalEmissions: 32.8,
          targetEmissions: 40,
          progress: 100,
          teamSize: 15,
          category: '短片'
        }
      ]);
    } catch (error) {
      console.error('获取项目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      planning: { label: '企劃中', color: 'badge-info', icon: Target, bgColor: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-500/30' },
      production: { label: '製作中', color: 'badge-warning', icon: Play, bgColor: 'from-orange-500/20 to-yellow-500/20', borderColor: 'border-orange-500/30' },
      'post-production': { label: '後製中', color: 'badge-purple', icon: Edit3, bgColor: 'from-purple-500/20 to-pink-500/20', borderColor: 'border-purple-500/30' },
      completed: { label: '已完成', color: 'badge-success', icon: CheckCircle, bgColor: 'from-green-500/20 to-emerald-500/20', borderColor: 'border-green-500/30' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.planning;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'production').length;
  const totalEmissions = projects.reduce((sum, p) => sum + p.totalEmissions, 0);
  const avgProgress = projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner"></div>
        <span className="ml-4 text-slate-300 text-lg">載入專案數據中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頂部大卡片區域 - 仿照參考圖 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 平均首次回應時間 - 粉色卡片 */}
        <div className="dashboard-card bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 p-8">
          <h3 className="text-slate-300 text-sm font-medium mb-4">平均專案啟動時間</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-6xl font-bold text-white">{avgFirstReplyTime.hours}</span>
            <span className="text-2xl text-pink-300">天</span>
            <span className="text-4xl font-bold text-white">{avgFirstReplyTime.minutes}</span>
            <span className="text-xl text-pink-300">小時</span>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <ArrowDown className="w-4 h-4 mr-1" />
            <span className="text-sm">較上月減少 15%</span>
          </div>
        </div>

        {/* 平均完整解決時間 - 青色卡片 */}
        <div className="dashboard-card bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-8">
          <h3 className="text-slate-300 text-sm font-medium mb-4">平均專案完成時間</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-6xl font-bold text-white">{avgFullResolveTime.hours}</span>
            <span className="text-2xl text-cyan-300">天</span>
            <span className="text-4xl font-bold text-white">{avgFullResolveTime.minutes}</span>
            <span className="text-xl text-cyan-300">小時</span>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <ArrowDown className="w-4 h-4 mr-1" />
            <span className="text-sm">較上月減少 8%</span>
          </div>
        </div>
      </div>

      {/* 主要圖表區域 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 左側大圖表 - 專案創建 vs 完成 */}
        <div className="xl:col-span-2 dashboard-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">專案創建 vs 專案完成</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                <span className="text-sm text-slate-400">專案完成</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-slate-400">專案創建</span>
              </div>
              <button className="text-slate-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* 簡化的圖表顯示 */}
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {chartData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center space-y-2">
                  <div className="flex flex-col items-center space-y-1">
                    <div 
                      className="w-6 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                      style={{ height: `${(data.created / maxTickets) * 150}px` }}
                    ></div>
                    <div 
                      className="w-6 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                      style={{ height: `${(data.solved / maxTickets) * 150}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">{data.month}</span>
                </div>
              ))}
            </div>
            
            {/* 最大值標示 */}
            <div className="absolute top-4 left-4 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-2">
              <span className="text-sm text-purple-300">Max • {maxTickets}</span>
            </div>
          </div>
        </div>

        {/* 右側通知面板 */}
        <div className="space-y-4">
          {/* 消息通知 */}
          <div className="dashboard-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">消息</h4>
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">20%</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-sm">過去</span>
              <div className="bg-cyan-500 text-white text-xs px-2 py-1 rounded mt-1 inline-block">24 hours</div>
            </div>
          </div>

          {/* 郵件通知 */}
          <div className="dashboard-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">郵件</h4>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">+25%</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-sm">過去</span>
              <div className="bg-cyan-500 text-white text-xs px-2 py-1 rounded mt-1 inline-block">24 hours</div>
            </div>
          </div>

          {/* 第一次回應和完整解決時間 */}
          <div className="dashboard-card p-4">
            <h4 className="text-sm font-medium text-white mb-4">第一次回應和完整解決時間</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">查看完整報告</span>
              </div>
              {/* 簡化的圖表顯示 */}
              <div className="h-20 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部小卡片區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 專案類型分布 - 圓餅圖 */}
        <div className="dashboard-card p-6">
          <h4 className="text-lg font-semibold text-white mb-4">專案類型</h4>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
              <div className="absolute inset-2 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">4</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-400">劇情片</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-slate-400">紀錄片</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-slate-400">廣告</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span className="text-sm text-slate-400">短片</span>
              </div>
            </div>
          </div>
        </div>

        {/* 新專案 vs 回歸專案 */}
        <div className="dashboard-card p-6">
          <h4 className="text-lg font-semibold text-white mb-4">新專案 vs 回歸專案</h4>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
              <div className="absolute inset-2 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">1,200</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-slate-400">回歸專案</span>
              </div>
              <span className="text-sm text-white">82%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-slate-400">新專案</span>
              </div>
              <span className="text-sm text-white">18%</span>
            </div>
          </div>
        </div>

        {/* 每週專案數量 */}
        <div className="dashboard-card p-6">
          <h4 className="text-lg font-semibold text-white mb-4">每週專案數量</h4>
          <div className="flex items-end justify-between h-32 px-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <div key={day} className="flex flex-col items-center space-y-2">
                <div 
                  className="w-4 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                  style={{ height: `${Math.random() * 80 + 20}px` }}
                ></div>
                <span className="text-xs text-slate-400">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 完整專案報告 */}
        <div className="dashboard-card p-6">
          <h4 className="text-lg font-semibold text-white mb-4">完整專案報告</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">完成率</span>
              <span className="text-sm text-white">85%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '85%' }}></div>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              下載報告
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects; 