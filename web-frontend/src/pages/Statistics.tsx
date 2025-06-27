import React, { useState } from 'react'
import { 
  BarChart3, TrendingUp, TrendingDown, Activity, Target, 
  Calendar, ArrowUpRight, ArrowDownRight, PieChart, 
  Users, Clock, CheckCircle, Zap, Leaf, Filter, Download,
  ChevronDown, ChevronUp, Eye, Settings
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'

const Statistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('6months')
  const [showDetailPanel, setShowDetailPanel] = useState(false)

  const tabs = [
    { id: 'overview', name: '總覽', icon: BarChart3 },
    { id: 'projects', name: '專案分析', icon: Target },
    { id: 'operational', name: '營運分析', icon: Activity },
    { id: 'stages', name: '階段分析', icon: Clock },
    { id: 'intensity', name: '強度分析', icon: Zap },
    { id: 'reports', name: '報告', icon: CheckCircle },
  ]

  const timeRanges = [
    { id: '1month', name: '1個月' },
    { id: '3months', name: '3個月' },
    { id: '6months', name: '6個月' },
    { id: '1year', name: '1年' },
  ]

  // 模擬數據
  const overviewData = [
    { month: '1月', emissions: 1250, target: 1000, efficiency: 85 },
    { month: '2月', emissions: 1180, target: 1000, efficiency: 88 },
    { month: '3月', emissions: 980, target: 1000, efficiency: 92 },
    { month: '4月', emissions: 1320, target: 1000, efficiency: 79 },
    { month: '5月', emissions: 1100, target: 1000, efficiency: 86 },
    { month: '6月', emissions: 950, target: 1000, efficiency: 94 },
  ]

  const emissionByCategory = [
    { name: '專案製作', value: 45, color: '#EC4899', trend: '-5%', type: 'project' },
    { name: '日常營運', value: 25, color: '#F59E0B', trend: '+2%', type: 'operational' },
    { name: '運輸物流', value: 20, color: '#06B6D4', trend: '-8%', type: 'mixed' },
    { name: '設備租賃', value: 10, color: '#10B981', trend: '-12%', type: 'mixed' },
  ]

  const projectComparison = [
    { name: '電影：綠色星球', current: 1570, budget: 1800, efficiency: 87 },
    { name: '廣告：環保汽車', current: 366, budget: 400, efficiency: 92 },
    { name: '紀錄片：氣候變遷', current: 705, budget: 900, efficiency: 78 },
    { name: 'MV：自然之歌', current: 245, budget: 300, efficiency: 82 },
  ]

  const stageAnalysis = [
    { stage: '前期企劃', percentage: 5, emissions: 125, color: '#F59E0B' },
    { stage: '拍攝製作', percentage: 65, emissions: 1625, color: '#EC4899' },
    { stage: '後期製作', percentage: 25, emissions: 625, color: '#8B5CF6' },
    { stage: '宣傳發行', percentage: 5, emissions: 125, color: '#06B6D4' },
  ]

  const efficiencyMetrics = [
    { metric: '碳排放強度', value: '0.45', unit: 'tCO₂/萬元', trend: '-12%', status: 'good' },
    { metric: '能源效率', value: '85', unit: '%', trend: '+8%', status: 'excellent' },
    { metric: '綠色採購率', value: '67', unit: '%', trend: '+15%', status: 'good' },
    { metric: '廢料回收率', value: '78', unit: '%', trend: '+5%', status: 'good' },
  ]

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* 主要趨勢圖 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app-text mb-1">碳排放趨勢分析</h3>
            <p className="text-app-textSecondary text-sm">實際排放 vs 目標值對比</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-glassmorphism-pink rounded-full"></div>
              <span className="text-sm text-app-textSecondary">實際排放</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-glassmorphism-green rounded-full"></div>
              <span className="text-sm text-app-textSecondary">目標值</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overviewData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#F9FAFB'
                }}
              />
              <Area type="monotone" dataKey="emissions" stroke="#EC4899" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
              <Area type="monotone" dataKey="target" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorTarget)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 分類排放分析 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 圓餅圖 */}
        <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-app-text">排放類別分佈</h3>
            <PieChart className="h-5 w-5 text-glassmorphism-purple" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie 
                  data={emissionByCategory} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={40} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {emissionByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#F9FAFB'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {emissionByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-glass rounded-xl border border-app-border/20">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-app-text">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-app-text">{item.value}%</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.trend.startsWith('-') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 效率指標 */}
        <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-app-text">效率指標</h3>
            <Target className="h-5 w-5 text-glassmorphism-green" />
          </div>
          <div className="space-y-4">
            {efficiencyMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-gradient-glass rounded-xl border border-app-border/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-app-textSecondary">{metric.metric}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    metric.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-app-text">{metric.value}</span>
                    <span className="text-sm text-app-textSecondary">{metric.unit}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    metric.status === 'excellent' ? 'bg-glassmorphism-green' :
                    metric.status === 'good' ? 'bg-glassmorphism-cyan' :
                    'bg-glassmorphism-pink'
                  } animate-pulse`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderProjectsTab = () => (
    <div className="space-y-6">
      {/* 專案對比圖 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app-text mb-1">專案排放對比</h3>
            <p className="text-app-textSecondary text-sm">當前排放 vs 預算對比</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#F9FAFB'
                }}
              />
              <Bar dataKey="current" fill="#EC4899" radius={[4, 4, 0, 0]} name="當前排放" />
              <Bar dataKey="budget" fill="#10B981" radius={[4, 4, 0, 0]} name="預算上限" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 專案效率排名 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-app-text">專案效率排名</h3>
          <BarChart3 className="h-5 w-5 text-glassmorphism-cyan" />
        </div>
        <div className="space-y-4">
          {projectComparison.sort((a, b) => b.efficiency - a.efficiency).map((project, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-glass rounded-xl border border-app-border/20">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-gradient-primary text-white' :
                  index === 1 ? 'bg-glassmorphism-cyan/20 text-glassmorphism-cyan' :
                  index === 2 ? 'bg-glassmorphism-purple/20 text-glassmorphism-purple' :
                  'bg-app-border/20 text-app-textSecondary'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-app-text">{project.name}</p>
                  <p className="text-xs text-app-textSecondary">
                    {project.current} / {project.budget} tCO₂e
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-lg font-bold text-app-text">{project.efficiency}%</p>
                  <p className="text-xs text-app-textSecondary">效率指標</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  project.efficiency >= 90 ? 'bg-glassmorphism-green' :
                  project.efficiency >= 80 ? 'bg-glassmorphism-cyan' :
                  'bg-glassmorphism-pink'
                } animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderOperationalTab = () => (
    <div className="space-y-6">
      {/* 營運排放趨勢 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app-text mb-1">日常營運排放趨勢</h3>
            <p className="text-app-textSecondary text-sm">非專案相關的日常營運碳排放分析</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overviewData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#F9FAFB'
                }}
              />
              <Line type="monotone" dataKey="emissions" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 營運排放分類 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
          <h3 className="text-lg font-semibold text-app-text mb-4">營運排放分類</h3>
          <div className="space-y-4">
            {[
              { name: '辦公用電', value: 450, percentage: 35, color: '#10B981' },
              { name: '員工通勤', value: 320, percentage: 25, color: '#06B6D4' },
              { name: '設備維護', value: 256, percentage: 20, color: '#8B5CF6' },
              { name: '辦公用品', value: 192, percentage: 15, color: '#F59E0B' },
              { name: '其他', value: 64, percentage: 5, color: '#EF4444' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-glass rounded-xl border border-app-border/20">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-app-text">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-app-text">{item.value} kg</p>
                  <p className="text-xs text-app-textSecondary">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
          <h3 className="text-lg font-semibold text-app-text mb-4">營運效率指標</h3>
          <div className="space-y-4">
            {[
              { metric: '人均排放', value: '1.2', unit: 'tCO₂/人/月', trend: '-8%' },
              { metric: '單位面積排放', value: '0.45', unit: 'tCO₂/m²/月', trend: '-12%' },
              { metric: '能源使用效率', value: '88', unit: '%', trend: '+5%' },
              { metric: '綠色辦公評分', value: '82', unit: '分', trend: '+15%' },
            ].map((metric, index) => (
              <div key={index} className="p-4 bg-gradient-glass rounded-xl border border-app-border/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-app-textSecondary">{metric.metric}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    metric.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold text-app-text">{metric.value}</span>
                  <span className="text-sm text-app-textSecondary">{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStagesTab = () => (
    <div className="space-y-6">
      {/* 階段分析圖 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app-text mb-1">製作階段排放分析</h3>
            <p className="text-app-textSecondary text-sm">各階段碳排放佔比分析</p>
          </div>
        </div>
                 <div className="h-80">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={stageAnalysis} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
               <XAxis dataKey="stage" stroke="#9CA3AF" fontSize={12} />
               <YAxis stroke="#9CA3AF" fontSize={12} />
               <Tooltip 
                 contentStyle={{
                   backgroundColor: '#1E293B',
                   border: '1px solid #334155',
                   borderRadius: '12px',
                   color: '#F9FAFB'
                 }}
               />
               <Bar dataKey="percentage" fill="#EC4899" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
         </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {stageAnalysis.map((stage, index) => (
            <div key={index} className="p-4 bg-gradient-glass rounded-xl border border-app-border/20">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }}></div>
                <span className="text-sm font-medium text-app-text">{stage.stage}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-app-textSecondary">佔比</span>
                  <span className="text-sm font-bold text-app-text">{stage.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-app-textSecondary">排放量</span>
                  <span className="text-sm font-bold text-app-text">{stage.emissions} tCO₂e</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 頁面標題和控制 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-app-text mb-2">分析統計</h1>
          <p className="text-app-textSecondary">詳細的碳排放數據分析與可視化</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* 時間範圍選擇 */}
          <div className="relative">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gradient-glass backdrop-blur-sm rounded-xl px-4 py-2 border border-app-border/20 text-app-text text-sm appearance-none pr-8"
            >
              {timeRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-textSecondary pointer-events-none" />
          </div>
          
          {/* 詳細面板切換 */}
          <button
            onClick={() => setShowDetailPanel(!showDetailPanel)}
            className="bg-gradient-glass backdrop-blur-sm rounded-xl px-4 py-2 border border-app-border/20 text-app-text text-sm hover:bg-app-cardAlt/50 transition-colors flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>詳細面板</span>
            {showDetailPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {/* 導出按鈕 */}
          <button className="bg-gradient-primary hover:bg-gradient-secondary rounded-xl px-4 py-2 text-white text-sm hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-glow">
            <Download className="h-4 w-4" />
            <span>導出報告</span>
          </button>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-2 border border-app-border/30 shadow-glass">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-glow transform scale-105'
                    : 'text-app-textSecondary hover:text-app-text hover:bg-app-cardAlt/30'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="animate-fadeIn">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'projects' && renderProjectsTab()}
        {activeTab === 'operational' && renderOperationalTab()}
        {activeTab === 'stages' && renderStagesTab()}
        {activeTab === 'intensity' && (
          <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-8 border border-app-border/30 shadow-glass text-center">
            <Zap className="h-12 w-12 text-glassmorphism-cyan mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-app-text mb-2">強度分析</h3>
            <p className="text-app-textSecondary">此功能正在開發中，敬請期待...</p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-8 border border-app-border/30 shadow-glass text-center">
            <CheckCircle className="h-12 w-12 text-glassmorphism-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-app-text mb-2">報告生成</h3>
            <p className="text-app-textSecondary">此功能正在開發中，敬請期待...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Statistics 