import React, { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  MapPin, 
  Building, 
  Car, 
  Zap, 
  Thermometer, 
  Droplets,
  Target,
  Activity,
  Calculator,
  Users,
  FileText,
  Trash2,
  Camera,
  Monitor,
  Wrench
} from 'lucide-react'
import { EmissionRecord, Project, emissionApi } from '../services/api'

interface ProjectEmissionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (emission: EmissionRecord) => void
  emission?: EmissionRecord | null
  projects: Project[]
  selectedProjectId?: string
}

// 專案製作階段
const PROJECT_STAGES = [
  { id: 'pre-production', name: '前期製作', color: '#F59E0B', description: '劇本開發、選角、場勘等' },
  { id: 'production', name: '製作期', color: '#10B981', description: '實際拍攝製作' },
  { id: 'post-production', name: '後期製作', color: '#8B5CF6', description: '剪輯、特效、配音等' }
]

// 專案排放類別（按階段分組）
const PROJECT_CATEGORIES = {
  'pre-production': [
    { id: 'pre-transport', name: '前期交通', color: '#06B6D4', icon: Car },
    { id: 'pre-office', name: '辦公用電', color: '#10B981', icon: Zap },
    { id: 'pre-meeting', name: '會議場地', color: '#8B5CF6', icon: Building },
    { id: 'pre-materials', name: '前期物料', color: '#F59E0B', icon: FileText },
    { id: 'pre-catering', name: '前期餐飲', color: '#EC4899', icon: Droplets }
  ],
  'production': [
    { id: 'prod-transport', name: '拍攝交通', color: '#06B6D4', icon: Car },
    { id: 'prod-equipment', name: '攝影設備', color: '#8B5CF6', icon: Camera },
    { id: 'prod-catering', name: '劇組餐飲', color: '#EC4899', icon: Droplets },
    { id: 'prod-accommodation', name: '住宿', color: '#F59E0B', icon: Building },
    { id: 'prod-fuel', name: '發電機燃料', color: '#EF4444', icon: Thermometer },
    { id: 'prod-lighting', name: '燈光用電', color: '#10B981', icon: Zap },
    { id: 'prod-waste', name: '廢棄物', color: '#6B7280', icon: Trash2 }
  ],
  'post-production': [
    { id: 'post-equipment', name: '後期設備', color: '#8B5CF6', icon: Monitor },
    { id: 'post-transport', name: '後期交通', color: '#06B6D4', icon: Car },
    { id: 'post-catering', name: '後期餐飲', color: '#EC4899', icon: Droplets },
    { id: 'post-materials', name: '後期物料', color: '#F59E0B', icon: FileText },
    { id: 'post-storage', name: '數據儲存', color: '#10B981', icon: Target }
  ]
}

// 專案排放源
const PROJECT_SOURCES = {
  // 前期製作
  'pre-transport': [
    { id: 'pre-car', name: '小客車', factor: 0.21, unit: 'km' },
    { id: 'pre-truck', name: '小型貨車', factor: 0.68, unit: 'km' },
    { id: 'pre-public', name: '大眾運輸', factor: 0.055, unit: 'km' }
  ],
  'pre-office': [
    { id: 'pre-electricity', name: '辦公室用電', factor: 0.509, unit: 'kWh' }
  ],
  'pre-meeting': [
    { id: 'pre-venue', name: '會議場地', factor: 5.2, unit: '小時' }
  ],
  'pre-materials': [
    { id: 'pre-paper', name: '紙張材料', factor: 1.8, unit: 'kg' },
    { id: 'pre-props', name: '道具材料', factor: 3.5, unit: 'kg' }
  ],
  'pre-catering': [
    { id: 'pre-meals', name: '會議餐飲', factor: 3.2, unit: '餐' }
  ],
  
  // 製作期
  'prod-transport': [
    { id: 'prod-car', name: '劇組車輛', factor: 0.21, unit: 'km' },
    { id: 'prod-truck', name: '器材車', factor: 0.68, unit: 'km' },
    { id: 'prod-bus', name: '劇組巴士', factor: 0.85, unit: 'km' }
  ],
  'prod-equipment': [
    { id: 'prod-camera', name: '攝影機', factor: 1.2, unit: '小時' },
    { id: 'prod-sound', name: '收音設備', factor: 0.8, unit: '小時' },
    { id: 'prod-crane', name: '升降設備', factor: 3.5, unit: '小時' }
  ],
  'prod-catering': [
    { id: 'prod-crew-meals', name: '劇組餐飲', factor: 3.2, unit: '餐' },
    { id: 'prod-craft-service', name: '現場茶水', factor: 0.5, unit: '人/天' }
  ],
  'prod-accommodation': [
    { id: 'prod-hotel', name: '旅館住宿', factor: 12.2, unit: '房晚' },
    { id: 'prod-apartment', name: '公寓住宿', factor: 8.5, unit: '房晚' }
  ],
  'prod-fuel': [
    { id: 'prod-generator', name: '發電機燃料', factor: 2.68, unit: 'L' },
    { id: 'prod-heating', name: '暖氣燃料', factor: 2.31, unit: 'L' }
  ],
  'prod-lighting': [
    { id: 'prod-led', name: 'LED燈具', factor: 0.509, unit: 'kWh' },
    { id: 'prod-tungsten', name: '鎢絲燈具', factor: 0.509, unit: 'kWh' }
  ],
  'prod-waste': [
    { id: 'prod-general-waste', name: '一般廢棄物', factor: 0.45, unit: 'kg' },
    { id: 'prod-recyclable', name: '資源回收', factor: 0.15, unit: 'kg' }
  ],
  
  // 後期製作
  'post-equipment': [
    { id: 'post-workstation', name: '剪輯工作站', factor: 1.5, unit: '小時' },
    { id: 'post-render', name: '渲染農場', factor: 25.0, unit: '小時' },
    { id: 'post-color', name: '調色設備', factor: 2.8, unit: '小時' }
  ],
  'post-transport': [
    { id: 'post-car', name: '後期交通', factor: 0.21, unit: 'km' }
  ],
  'post-catering': [
    { id: 'post-meals', name: '後期餐飲', factor: 3.2, unit: '餐' }
  ],
  'post-materials': [
    { id: 'post-media', name: '儲存媒體', factor: 2.5, unit: '個' },
    { id: 'post-packaging', name: '包裝材料', factor: 1.2, unit: 'kg' }
  ],
  'post-storage': [
    { id: 'post-cloud', name: '雲端儲存', factor: 0.12, unit: 'GB/月' },
    { id: 'post-server', name: '伺服器儲存', factor: 0.85, unit: 'TB/月' }
  ]
}

const ProjectEmissionFormModal: React.FC<ProjectEmissionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  emission,
  projects,
  selectedProjectId
}) => {
  const [formData, setFormData] = useState({
    description: '',
    projectId: selectedProjectId || '',
    stage: '',
    categoryId: '',
    sourceId: '',
    quantity: '',
    amount: '',
    date: '',
    location: '',
    equipment: '',
    notes: '',
    peopleCount: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // 獲取選中階段的類別
  const selectedStage = PROJECT_STAGES.find(stage => stage.id === formData.stage)
  const availableCategories = formData.stage ? PROJECT_CATEGORIES[formData.stage as keyof typeof PROJECT_CATEGORIES] || [] : []
  
  // 獲取選中類別的排放源
  const selectedCategory = availableCategories.find(cat => cat.id === formData.categoryId)
  const availableSources = formData.categoryId ? PROJECT_SOURCES[formData.categoryId as keyof typeof PROJECT_SOURCES] || [] : []
  const selectedSource = availableSources.find(source => source.id === formData.sourceId)

  // 自動計算排放量
  useEffect(() => {
    if (selectedSource && formData.quantity) {
      const quantity = parseFloat(formData.quantity)
      if (!isNaN(quantity) && quantity > 0) {
        const amount = quantity * selectedSource.factor
        setFormData(prev => ({ ...prev, amount: amount.toFixed(3) }))
      } else {
        setFormData(prev => ({ ...prev, amount: '' }))
      }
    }
  }, [selectedSource, formData.quantity])

  useEffect(() => {
    if (emission) {
      setFormData({
        description: emission.description || '',
        projectId: emission.projectId || selectedProjectId || '',
        stage: emission.stage || '',
        categoryId: emission.category || '',
        sourceId: emission.subcategory || '',
        quantity: '',
        amount: emission.amount.toString(),
        date: emission.date ? emission.date.split('T')[0] : '',
        location: emission.location || '',
        equipment: emission.equipment || '',
        notes: '',
        peopleCount: ''
      })
    } else {
      // Reset form for new emission
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        description: '',
        projectId: selectedProjectId || '',
        stage: '',
        categoryId: '',
        sourceId: '',
        quantity: '',
        amount: '',
        date: today,
        location: '',
        equipment: '',
        notes: '',
        peopleCount: ''
      })
    }
    setErrors({})
  }, [emission, isOpen, selectedProjectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.description.trim()) {
      newErrors.description = '描述為必填'
    }
    
    if (!formData.projectId) {
      newErrors.projectId = '專案為必填'
    }
    
    if (!formData.stage) {
      newErrors.stage = '製作階段為必填'
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = '類別為必填'
    }
    
    if (!formData.sourceId) {
      newErrors.sourceId = '排放源為必填'
    }
    
    if (!formData.date) {
      newErrors.date = '日期為必填'
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = '排放量必須為大於0的數字'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    
    try {
      const emissionData = {
        description: formData.description.trim(),
        category: formData.categoryId,
        subcategory: formData.sourceId,
        projectId: formData.projectId,
        stage: formData.stage as 'pre-production' | 'production' | 'post-production',
        amount: Number(formData.amount),
        date: formData.date,
        location: formData.location || undefined,
        equipment: formData.equipment || undefined
      }
      
      let savedEmission: EmissionRecord
      if (emission) {
        savedEmission = await emissionApi.updateEmissionRecord(emission.id, emissionData)
      } else {
        savedEmission = await emissionApi.createEmissionRecord(emissionData)
      }
      
      onSave(savedEmission)
    } catch (error) {
      console.error('儲存專案排放記錄失敗:', error)
      setErrors({ submit: '儲存失敗，請稍後再試' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {emission ? '編輯專案排放記錄' : '新增專案排放記錄'}
              </h2>
              <p className="text-sm text-slate-400">影視製作專案碳排放記錄</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 專案與階段 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              專案資訊
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  所屬專案 *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.projectId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">選擇專案</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                {errors.projectId && <p className="text-red-400 text-sm mt-1">{errors.projectId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  製作階段 *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => {
                    handleInputChange('stage', e.target.value)
                    handleInputChange('categoryId', '') // 重置類別
                    handleInputChange('sourceId', '') // 重置排放源
                  }}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.stage ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">選擇階段</option>
                  {PROJECT_STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
                {errors.stage && <p className="text-red-400 text-sm mt-1">{errors.stage}</p>}
              </div>
            </div>

            {selectedStage && (
              <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedStage.color }}></div>
                  <span className="text-sm font-medium text-white">{selectedStage.name}</span>
                </div>
                <p className="text-sm text-slate-400">{selectedStage.description}</p>
              </div>
            )}
          </div>

          {/* 排放分類 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              排放分類
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  排放類別 *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    handleInputChange('categoryId', e.target.value)
                    handleInputChange('sourceId', '') // 重置排放源
                  }}
                  disabled={!formData.stage}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 ${
                    errors.categoryId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">選擇類別</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-400 text-sm mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  排放源 *
                </label>
                <select
                  value={formData.sourceId}
                  onChange={(e) => handleInputChange('sourceId', e.target.value)}
                  disabled={!formData.categoryId}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 ${
                    errors.sourceId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">選擇排放源</option>
                  {availableSources.map(source => (
                    <option key={source.id} value={source.id}>
                      {source.name} ({source.factor} kg CO₂e/{source.unit})
                    </option>
                  ))}
                </select>
                {errors.sourceId && <p className="text-red-400 text-sm mt-1">{errors.sourceId}</p>}
              </div>
            </div>

            {selectedCategory && (
              <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-600">
                <div className="flex items-center gap-2">
                  <selectedCategory.icon className="w-4 h-4" style={{ color: selectedCategory.color }} />
                  <span className="text-sm font-medium text-white">{selectedCategory.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* 活動詳情 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              活動詳情
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                活動描述 *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.description ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="例如：外景拍攝交通、攝影機使用、劇組餐飲等"
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  數量 *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder={selectedSource ? `輸入${selectedSource.unit}數` : "輸入數量"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  排放係數
                </label>
                <input
                  type="text"
                  value={selectedSource ? `${selectedSource.factor} kg CO₂e/${selectedSource.unit}` : ''}
                  disabled
                  className="w-full px-4 py-2 bg-slate-900/30 border border-slate-600 rounded-lg text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  排放量 (kg CO₂e) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.amount ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="自動計算或手動輸入"
                />
                {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  日期 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.date ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  拍攝地點
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="輸入拍攝地點（可選）"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Wrench className="inline w-4 h-4 mr-1" />
                  使用設備
                </label>
                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => handleInputChange('equipment', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="使用的設備或器材（可選）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  參與人數
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.peopleCount}
                  onChange={(e) => handleInputChange('peopleCount', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="參與人數（可選）"
                />
              </div>
            </div>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '儲存中...' : (emission ? '更新記錄' : '新增記錄')}
            </button>
          </div>
          
          {errors.submit && (
            <p className="text-red-400 text-sm text-center">{errors.submit}</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default ProjectEmissionFormModal
