import React, { useState, useMemo, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, Target, Zap, Leaf, 
  Calendar, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, 
  Users, Clock, CheckCircle, AlertTriangle, Building, Film, 
  Factory, TreePine, Lightbulb
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { getStatisticsOverview, getProjectsRanking } from '../services/api'

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)
  const [projectRanking, setProjectRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 載入統計數據
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [statsData, rankingData] = await Promise.all([
          getStatisticsOverview(),
          getProjectsRanking({ period: '30', limit: '5' })
        ])
        setStatistics(statsData)
        setProjectRanking(rankingData.ranking || [])
      } catch (error) {
        console.error('載入儀表板數據失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // 計算核心 KPI
  const kpiData = useMemo(() => {
    if (!statistics) return []

    const totalProjects = statistics.projects?.total || 0
    const totalEmissions = statistics.emissions?.total || 0
    const activeProjects = statistics.projects?.byStatus?.find((s: any) => s.status === 'active')?.count || 0
    const completedProjects = statistics.projects?.byStatus?.find((s: any) => s.status === 'completed')?.count || 0

    // 計算平均專案排放量
    const avgEmissionPerProject = totalProjects > 0 ? (totalEmissions / totalProjects) : 0
    
    // 計算完成率
    const completionRate = totalProjects > 0 ? ((completedProjects / totalProjects) * 100) : 0

    return [
      {
        title: "專案排放總量",
        value: totalEmissions.toFixed(1),
        unit: "kg CO₂e",
        change: "-8.2%", // 這裡可以後續從API計算實際變化
        trend: "down",
        gradient: "from-green-500 to-emerald-600",
        icon: TreePine,
        description: "本月總碳排放量"
      },
      {
        title: "營運排放總量", 
        value: "1,234.5", // 後續從營運排放API獲取
        unit: "kg CO₂e",
        change: "+12.3%",
        trend: "up",
        gradient: "from-orange-500 to-red-600",
        icon: Factory,
        description: "日常營運碳排放"
      },
      {
        title: "活躍專案數",
        value: activeProjects.toString(),
        unit: "個專案",
        change: "+2",
        trend: "up", 
        gradient: "from-blue-500 to-purple-600",
        icon: Film,
        description: "進行中的影視專案"
      },
      {
        title: "專案完成率",
        value: completionRate.toFixed(1),
        unit: "%",
        change: "+5.2%",
        trend: "up",
        gradient: "from-emerald-500 to-teal-600", 
        icon: Target,
        description: "專案執行效率"
      },
      {
        title: "平均專案排放",
        value: avgEmissionPerProject.toFixed(1),
        unit: "kg CO₂e",
        change: "-15.8%",
        trend: "down",
        gradient: "from-purple-500 to-pink-600",
        icon: Activity,
        description: "每個專案平均排放量"
      },
      {
        title: "碳效率指標",
        value: "2.4",
        unit: "g/NT$",
        change: "-3.1%", 
        trend: "down",
        gradient: "from-yellow-500 to-orange-600",
        icon: Lightbulb,
        description: "每元預算的碳排放量"
      }
    ]
  }, [statistics])

  // 月度排放趨勢數據
  const monthlyTrendData = useMemo(() => {
    if (!statistics?.emissions?.monthly) return []
    
    return statistics.emissions.monthly.map((item: any) => ({
      month: item.month,
      專案排放: item.emissions || 0,
      營運排放: Math.random() * 200 + 100, // 模擬數據，後續從API獲取
      總排放: (item.emissions || 0) + (Math.random() * 200 + 100)
    }))
  }, [statistics])

  // 階段排放分布
  const stageDistribution = useMemo(() => {
    if (!statistics?.emissions?.byStage) return []
    
    const stageNames = {
      'pre-production': '前期製作',
      'production': '製作期',
      'post-production': '後期製作'
    }
    
    return statistics.emissions.byStage.map((item: any) => ({
      name: stageNames[item.stage as keyof typeof stageNames] || item.stage,
      value: item.total || 0,
      count: item.count || 0
    }))
  }, [statistics])

  // 類別排放分布
  const categoryDistribution = useMemo(() => {
    if (!statistics?.emissions?.byCategory) return []
    
    return statistics.emissions.byCategory.slice(0, 6).map((item: any, index: number) => ({
      name: item.name,
      value: item.total || 0,
      count: item.count || 0,
      color: item.color || `hsl(${index * 60}, 70%, 50%)`
    }))
  }, [statistics])

  const activateSearch = () => {
    setIsSearchActive(true)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchActive(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'on-hold':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '進行中'
      case 'completed':
        return '已完成'
      case 'planning':
        return '規劃中'
      case 'on-hold':
        return '暫停'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg border border-gray-700"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-800 rounded-lg border border-gray-700"></div>
            <div className="h-80 bg-gray-800 rounded-lg border border-gray-700"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">碳足跡儀表板</h1>
          <p className="text-gray-300 mt-1">影視製作碳排放監控與分析</p>
        </div>
        <div className="text-sm text-gray-400">
          最後更新：{new Date().toLocaleString('zh-TW')}
        </div>
      </div>

      {/* KPI 指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <div key={index} className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl hover:border-gray-600 transition-all duration-300">
              <div className={`h-2 bg-gradient-to-r ${kpi.gradient}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${kpi.gradient} bg-opacity-20`}>
                    <Icon className={`w-6 h-6 text-transparent bg-gradient-to-r ${kpi.gradient} bg-clip-text`} />
                  </div>
                  <div className={`flex items-center text-sm ${
                    kpi.trend === 'up' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {kpi.change}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-300">{kpi.title}</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-white">{kpi.value}</span>
                    <span className="text-sm text-gray-400">{kpi.unit}</span>
                  </div>
                  <p className="text-xs text-gray-500">{kpi.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月度排放趨勢 */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">排放趨勢分析</h3>
              <p className="text-sm text-gray-300">最近12個月的碳排放變化</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    color: '#f9fafb'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="專案排放" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="營運排放" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="總排放" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 階段排放分布 */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">製作階段分析</h3>
              <p className="text-sm text-gray-300">各製作階段的排放分布</p>
            </div>
            <PieChart className="w-5 h-5 text-purple-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={stageDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {stageDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 120}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} kg CO₂e`, '排放量']}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 底部統計區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 排放類別分析 */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">排放類別分析</h3>
              <p className="text-sm text-gray-300">主要排放來源統計</p>
            </div>
            <BarChart3 className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-4">
            {categoryDistribution.map((category: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-200">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <span>{category.value.toFixed(1)} kg</span>
                  <span className="text-gray-500">({category.count} 筆)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 專案排行榜 */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">專案排放排行</h3>
              <p className="text-sm text-gray-300">近30天排放量最高的專案</p>
            </div>
            <Film className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-4">
            {projectRanking.map((project, index) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-xs font-semibold text-gray-200">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-200">{project.name}</div>
                    <div className="text-xs text-gray-400">{project.record_count} 筆記錄</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white">
                  {project.total_emissions?.toFixed(1) || '0.0'} kg
                </div>
              </div>
            ))}
            {projectRanking.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Film className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>暫無專案數據</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 