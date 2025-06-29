import React, { useState } from 'react'
import { 
  BarChart3, TrendingUp, TrendingDown, Activity, Target, 
  Calendar, ArrowUpRight, ArrowDownRight, PieChart, 
  Users, Clock, CheckCircle, Zap, Leaf, Filter, Download,
  ChevronDown, ChevronUp, Eye, Settings, Sparkles, TrendingUpIcon
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
    { id: 'overview', name: '總覽', icon: BarChart3, gradient: 'from-blue-500 to-purple-600' },
    { id: 'projects', name: '專案分析', icon: Target, gradient: 'from-green-500 to-teal-600' },
    { id: 'operational', name: '營運分析', icon: Activity, gradient: 'from-orange-500 to-red-600' },
    { id: 'stages', name: '階段分析', icon: Clock, gradient: 'from-purple-500 to-pink-600' },
    { id: 'intensity', name: '強度分析', icon: Zap, gradient: 'from-yellow-500 to-orange-600' },
    { id: 'reports', name: '報告', icon: CheckCircle, gradient: 'from-emerald-500 to-cyan-600' },
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
    <div className="space-y-8">
      {/* 主要趨勢圖 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-3xl p-8 border border-app-border/30 shadow-glass hover:shadow-glass-hover transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-app-text mb-2">碳排放趨勢分析</h3>
            <p className="text-app-textSecondary text-base">實際排放 vs 目標值對比</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-glassmorphism-pink rounded-full shadow-lg"></div>
              <span className="text-sm font-medium text-app-textSecondary">實際排放</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-glassmorphism-green rounded-full shadow-lg"></div>
              <span className="text-sm font-medium text-app-textSecondary">目標值</span>
            </div>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overviewData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={14} fontWeight={500} />
              <YAxis stroke="#9CA3AF" fontSize={14} fontWeight={500} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(51, 65, 85, 0.8)',
                  borderRadius: '16px',
                  color: '#F9FAFB',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(16px)'
                }}
              />
              <Area type="monotone" dataKey="emissions" stroke="#EC4899" strokeWidth={4} fillOpacity={1} fill="url(#colorEmissions)" />
              <Area type="monotone" dataKey="target" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorTarget)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 分類排放分析 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 圓餅圖 */}
        <div className="bg-gradient-card backdrop-blur-xl rounded-3xl p-8 border border-app-border/30 shadow-glass hover:shadow-glass-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-app-text">排放類別分佈</h3>
            <div className="p-3 bg-glassmorphism-purple/20 rounded-2xl">
              <PieChart className="h-6 w-6 text-glassmorphism-purple" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie 
                  data={emissionByCategory} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={100} 
                  paddingAngle={8} 
                  dataKey="value"
                >
                  {emissionByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(51, 65, 85, 0.8)',
                    borderRadius: '16px',
                    color: '#F9FAFB',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(16px)'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {emissionByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-glass rounded-2xl border border-app-border/20 hover:border-app-border/40 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: item.color }}></div>
                  <span className="text-base font-medium text-app-text">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-app-text">{item.value}%</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
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
        <div className="bg-gradient-card backdrop-blur-xl rounded-3xl p-8 border border-app-border/30 shadow-glass hover:shadow-glass-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-app-text">效率指標</h3>
            <div className="p-3 bg-glassmorphism-green/20 rounded-2xl">
              <Target className="h-6 w-6 text-glassmorphism-green" />
            </div>
          </div>
          <div className="space-y-6">
            {efficiencyMetrics.map((metric, index) => (
              <div key={index} className="p-6 bg-gradient-glass rounded-2xl border border-app-border/20 hover:border-app-border/40 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-medium text-app-textSecondary">{metric.metric}</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    metric.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-app-text">{metric.value}</span>
                    <span className="text-base text-app-textSecondary">{metric.unit}</span>
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

  const renderIntensityTab = () => (
    <div className="space-y-6">
      {/* 碳排放強度分析 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app-text mb-1">碳排放強度分析</h3>
            <p className="text-app-textSecondary text-sm">單位產出或收入的碳排放量</p>
          </div>
          <Zap className="h-5 w-5 text-glassmorphism-cyan" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-gradient-glass rounded-xl border border-app-border/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-app-textSecondary">單位收入強度</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">-15%</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-app-text">0.32</span>
              <span className="text-sm text-app-textSecondary">tCO₂/萬元</span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-glass rounded-xl border border-app-border/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-app-textSecondary">單位時間強度</span>
              <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">+3%</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-app-text">2.1</span>
              <span className="text-sm text-app-textSecondary">tCO₂/天</span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-glass rounded-xl border border-app-border/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-app-textSecondary">人均強度</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">-8%</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-app-text">1.25</span>
              <span className="text-sm text-app-textSecondary">tCO₂/人</span>
            </div>
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
              <Line type="monotone" dataKey="efficiency" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', strokeWidth: 2, r: 6 }} name="效率指標" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 行業基準對比 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <h3 className="text-lg font-semibold text-app-text mb-4">行業基準對比</h3>
        <div className="space-y-4">
          {[
            { type: '電影製作', industry: 0.45, current: 0.32, status: 'excellent' },
            { type: '廣告製作', industry: 0.28, current: 0.25, status: 'good' },
            { type: '紀錄片', industry: 0.35, current: 0.38, status: 'warning' },
            { type: 'MV製作', industry: 0.22, current: 0.19, status: 'excellent' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-glass rounded-xl border border-app-border/20">
              <div>
                <p className="text-sm font-medium text-app-text">{item.type}</p>
                <p className="text-xs text-app-textSecondary">行業平均: {item.industry} tCO₂/萬元</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-app-text">{item.current}</span>
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'excellent' ? 'bg-glassmorphism-green' :
                  item.status === 'good' ? 'bg-glassmorphism-cyan' :
                  'bg-glassmorphism-pink'
                } animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* 報告生成工具 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app-text mb-1">報告生成</h3>
            <p className="text-app-textSecondary text-sm">生成詳細的碳排放分析報告</p>
          </div>
          <CheckCircle className="h-5 w-5 text-glassmorphism-green" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { title: '月度報告', desc: '當月碳排放統計', icon: Calendar, color: 'text-glassmorphism-cyan' },
            { title: '專案報告', desc: '特定專案分析', icon: Target, color: 'text-glassmorphism-pink' },
            { title: '年度報告', desc: '年度總結分析', icon: BarChart3, color: 'text-glassmorphism-green' },
            { title: '對比報告', desc: '期間對比分析', icon: TrendingUp, color: 'text-glassmorphism-purple' },
            { title: '效率報告', desc: '效率指標分析', icon: Zap, color: 'text-glassmorphism-orange' },
            { title: '自定義報告', desc: '客製化報告', icon: Settings, color: 'text-glassmorphism-blue' },
          ].map((report, index) => {
            const Icon = report.icon
            return (
              <button key={index} className="p-4 bg-gradient-glass rounded-xl border border-app-border/20 hover:scale-105 transition-all duration-200 text-left group">
                <div className="w-10 h-10 rounded-lg bg-app-cardAlt/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className={`h-5 w-5 ${report.color}`} />
                </div>
                <h4 className="text-sm font-semibold text-app-text mb-1">{report.title}</h4>
                <p className="text-xs text-app-textSecondary">{report.desc}</p>
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-glass rounded-xl border border-app-border/20">
          <div>
            <h4 className="text-sm font-medium text-app-text">快速生成報告</h4>
            <p className="text-xs text-app-textSecondary">選擇時間範圍和報告類型</p>
          </div>
          <button className="bg-gradient-primary hover:bg-gradient-secondary rounded-lg px-4 py-2 text-white text-sm hover:scale-105 transition-all duration-200 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>生成報告</span>
          </button>
        </div>
      </div>
      
      {/* 最近報告 */}
      <div className="bg-gradient-card backdrop-blur-xl rounded-2xl p-6 border border-app-border/30 shadow-glass">
        <h3 className="text-lg font-semibold text-app-text mb-4">最近報告</h3>
        <div className="space-y-3">
          {[
            { name: '2024年6月月度報告', date: '2024-07-01', size: '2.3MB', status: '已完成' },
            { name: '電影專案：綠色星球 - 階段報告', date: '2024-06-28', size: '1.8MB', status: '已完成' },
            { name: '第二季度效率分析報告', date: '2024-06-30', size: '3.1MB', status: '已完成' },
            { name: '廣告專案對比分析', date: '2024-06-25', size: '1.5MB', status: '已完成' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gradient-glass rounded-xl border border-app-border/20 hover:bg-app-cardAlt/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-glassmorphism-blue/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-glassmorphism-blue" />
                </div>
        <div>
                  <p className="text-sm font-medium text-app-text">{report.name}</p>
                  <p className="text-xs text-app-textSecondary">{report.date} • {report.size}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">{report.status}</span>
                <button className="text-app-textSecondary hover:text-app-text transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-background via-app-background to-app-cardAlt/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 頁面標題和控制 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-app-text to-app-textSecondary bg-clip-text text-transparent">
              分析統計
            </h1>
            <p className="text-lg text-app-textSecondary font-medium">詳細的碳排放數據分析與可視化</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
          {/* 時間範圍選擇 */}
          <div className="relative">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gradient-card backdrop-blur-xl rounded-2xl px-6 py-3 border border-app-border/30 text-app-text font-medium appearance-none pr-12 shadow-glass hover:shadow-glass-hover transition-all duration-300"
            >
              {timeRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-textSecondary pointer-events-none" />
          </div>
          
          {/* 詳細面板切換 */}
          <button
            onClick={() => setShowDetailPanel(!showDetailPanel)}
              className="bg-gradient-card backdrop-blur-xl rounded-2xl px-6 py-3 border border-app-border/30 text-app-text font-medium hover:border-app-border/50 transition-all duration-300 flex items-center space-x-3 shadow-glass hover:shadow-glass-hover"
          >
              <Eye className="h-5 w-5" />
            <span>詳細面板</span>
              {showDetailPanel ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {/* 導出按鈕 */}
            <button className="bg-gradient-primary hover:bg-gradient-secondary rounded-2xl px-6 py-3 text-white font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-3 shadow-glow">
              <Download className="h-5 w-5" />
            <span>導出報告</span>
          </button>
        </div>
      </div>

      {/* 標籤導航 */}
        <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center px-6 py-4 rounded-2xl font-semibold transition-all duration-500 group overflow-hidden ${
                  activeTab === tab.id
                      ? 'text-white transform scale-105 shadow-2xl'
                      : 'text-slate-300 hover:text-white hover:scale-102'
                  }`}
                >
                  {/* 動態背景 */}
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} opacity-100`
                      : 'bg-white/5 opacity-0 group-hover:opacity-100'
                  }`}></div>
                  
                  {/* 光暈效果 */}
                  {activeTab === tab.id && (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tab.gradient} blur-xl opacity-30 animate-pulse`}></div>
                  )}
                  
                  {/* 內容 */}
                  <div className="relative flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{tab.name}</span>
                  </div>
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
          {activeTab === 'intensity' && renderIntensityTab()}
          {activeTab === 'reports' && renderReportsTab()}
          </div>
      </div>
    </div>
  )
}

export default Statistics 