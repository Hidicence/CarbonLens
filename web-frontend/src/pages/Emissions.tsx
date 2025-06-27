import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Building,
  Leaf,
  Activity,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Car,
  Droplets,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  Eye,
  Camera
} from 'lucide-react'
import { emissionApi, projectApi, EmissionRecord, Project } from '../services/api'
import EmissionFormModal from '../components/EmissionFormModal'
import OperationalEmissionFormModal from '../components/OperationalEmissionFormModal'
import ProjectEmissionFormModal from '../components/ProjectEmissionFormModal'

// 排放類別圖標映射
const categoryIcons: Record<string, React.ReactNode> = {
  'transport': <Car className="w-4 h-4" />,
  'electricity': <Zap className="w-4 h-4" />,
  'fuel': <Thermometer className="w-4 h-4" />,
  'accommodation': <Building className="w-4 h-4" />,
  'catering': <Droplets className="w-4 h-4" />,
  'waste': <Trash2 className="w-4 h-4" />,
  'materials': <Target className="w-4 h-4" />,
  'other': <Activity className="w-4 h-4" />
}

// 階段顏色
const stageColors: Record<string, string> = {
  'pre-production': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'production': 'text-green-400 bg-green-500/10 border-green-500/20',
  'post-production': 'text-purple-400 bg-purple-500/10 border-purple-500/20'
}

const Emissions: React.FC = () => {
  const [emissions, setEmissions] = useState<EmissionRecord[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterStage, setFilterStage] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isOperationalModalOpen, setIsOperationalModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingEmission, setEditingEmission] = useState<EmissionRecord | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [emissionsData, projectsData] = await Promise.all([
        emissionApi.getEmissionRecords(),
        projectApi.getProjects()
      ])
      
      // 确保返回的数据是数组
      setEmissions(Array.isArray(emissionsData) ? emissionsData : [])
      setProjects(Array.isArray(projectsData) ? projectsData : [])
    } catch (error) {
      console.error('載入數據失敗:', error)
      // 设置空数组以防止filter错误
      setEmissions([])
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEmission = () => {
    setEditingEmission(null)
    setIsFormModalOpen(true)
  }

  const handleEditEmission = (emission: EmissionRecord) => {
    setEditingEmission(emission)
    setIsFormModalOpen(true)
  }

  const handleDeleteEmission = async (id: string) => {
    try {
      await emissionApi.deleteEmissionRecord(id)
      setEmissions(prevEmissions => 
        Array.isArray(prevEmissions) ? prevEmissions.filter(e => e.id !== id) : []
      )
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('刪除排放記錄失敗:', error)
    }
  }

  const handleEmissionSaved = (savedEmission: EmissionRecord) => {
    if (editingEmission) {
      setEmissions(prevEmissions => 
        Array.isArray(prevEmissions) 
          ? prevEmissions.map(e => e.id === savedEmission.id ? savedEmission : e)
          : [savedEmission]
      )
    } else {
      setEmissions(prevEmissions => 
        Array.isArray(prevEmissions) 
          ? [savedEmission, ...prevEmissions]
          : [savedEmission]
      )
    }
    setIsFormModalOpen(false)
    setEditingEmission(null)
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '營運排放'
    const project = projects.find(p => p.id === projectId)
    return project?.name || '未知專案'
  }

  const getStageText = (stage?: string) => {
    switch (stage) {
      case 'pre-production': return '前期製作'
      case 'production': return '製作期'
      case 'post-production': return '後期製作'
      default: return '未分類'
    }
  }

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      'transport': '交通運輸',
      'electricity': '電力',
      'fuel': '燃料',
      'accommodation': '住宿',
      'catering': '餐飲',
      'waste': '廢棄物',
      'materials': '物料耗材',
      'other': '其他'
    }
    return categoryMap[category] || category
  }

  const filteredEmissions = Array.isArray(emissions) ? emissions.filter(emission => {
    const matchesSearch = emission?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emission?.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = filterProject === 'all' || emission.projectId === filterProject || 
                          (filterProject === 'operational' && !emission.projectId)
    const matchesStage = filterStage === 'all' || emission.stage === filterStage
    const matchesCategory = filterCategory === 'all' || emission.category === filterCategory
    
    return matchesSearch && matchesProject && matchesStage && matchesCategory
  }) : []

  // 統計數據
  const totalEmissions = Array.isArray(emissions) ? emissions.reduce((sum, e) => sum + (e?.amount || 0), 0) : 0
  const projectEmissions = Array.isArray(emissions) ? emissions.filter(e => e?.projectId).reduce((sum, e) => sum + (e?.amount || 0), 0) : 0
  const operationalEmissions = Array.isArray(emissions) ? emissions.filter(e => !e?.projectId).reduce((sum, e) => sum + (e?.amount || 0), 0) : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">排放記錄管理</h1>
        <p className="text-slate-400">管理所有碳排放記錄和分配</p>
      </div>

      {/* 工具列 */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* 搜索 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索排放記錄..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
          />
        </div>

        {/* 篩選 */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
          >
            <option value="all">所有專案</option>
            <option value="operational">營運排放</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
          >
            <option value="all">所有階段</option>
            <option value="pre-production">前期製作</option>
            <option value="production">製作期</option>
            <option value="post-production">後期製作</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
          >
            <option value="all">所有類別</option>
            <option value="transport">交通運輸</option>
            <option value="electricity">電力</option>
            <option value="fuel">燃料</option>
            <option value="accommodation">住宿</option>
            <option value="catering">餐飲</option>
            <option value="waste">廢棄物</option>
            <option value="materials">物料耗材</option>
            <option value="other">其他</option>
          </select>

          <button className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            導出
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setIsOperationalModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              營運記錄
            </button>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              專案記錄
            </button>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">總排放量</p>
              <p className="text-2xl font-bold text-white">{totalEmissions.toFixed(1)} kg</p>
            </div>
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">專案排放</p>
              <p className="text-2xl font-bold text-white">{projectEmissions.toFixed(1)} kg</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">營運排放</p>
              <p className="text-2xl font-bold text-white">{operationalEmissions.toFixed(1)} kg</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">記錄數量</p>
              <p className="text-2xl font-bold text-white">{emissions.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 排放記錄列表 */}
      <div className="space-y-4">
        {filteredEmissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">尚無排放記錄</h3>
            <p className="text-slate-400 mb-4">開始記錄您的碳排放數據</p>
            <button
              onClick={handleCreateEmission}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              新增記錄
            </button>
          </div>
        ) : (
          filteredEmissions.map((emission) => (
            <div
              key={emission.id}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      {categoryIcons[emission.category] || <Activity className="w-4 h-4" />}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{emission.description}</h3>
                    {emission.stage && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${stageColors[emission.stage] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                        {getStageText(emission.stage)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Building className="w-4 h-4" />
                      {getProjectName(emission.projectId)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Target className="w-4 h-4" />
                      {getCategoryText(emission.category)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(emission.date).toLocaleDateString('zh-TW')}
                    </div>
                    
                    {emission.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="w-4 h-4" />
                        {emission.location}
                      </div>
                    )}
                  </div>

                  {/* 排放量顯示 */}
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">碳排放量</p>
                        <p className="text-2xl font-bold text-red-400">{emission.amount.toFixed(2)} kg CO₂e</p>
                      </div>
                      {emission.subcategory && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">子類別</p>
                          <p className="text-sm text-slate-300">{emission.subcategory}</p>
                        </div>
                      )}
                      {emission.equipment && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">設備</p>
                          <p className="text-sm text-slate-300">{emission.equipment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditEmission(emission)}
                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(emission.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 排放表單模態框 */}
      <EmissionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingEmission(null)
        }}
        onSave={handleEmissionSaved}
        emission={editingEmission}
        projects={projects}
      />

      {/* 營運排放表單模態框 */}
      <OperationalEmissionFormModal
        isOpen={isOperationalModalOpen}
        onClose={() => {
          setIsOperationalModalOpen(false)
          setEditingEmission(null)
        }}
        onSave={handleEmissionSaved}
        emission={editingEmission}
        projects={projects}
      />

      {/* 專案排放表單模態框 */}
      <ProjectEmissionFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false)
          setEditingEmission(null)
        }}
        onSave={handleEmissionSaved}
        emission={editingEmission}
        projects={projects}
      />

      {/* 刪除確認模態框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">確認刪除</h3>
                <p className="text-slate-400 text-sm">此操作無法恢復</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6">
              確定要刪除此排放記錄嗎？
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteEmission(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Emissions 