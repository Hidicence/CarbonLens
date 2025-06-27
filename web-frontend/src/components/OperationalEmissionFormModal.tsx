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
  Percent,
  DollarSign
} from 'lucide-react'
import { EmissionRecord, Project, emissionApi } from '../services/api'

interface OperationalEmissionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (emission: EmissionRecord) => void
  emission?: EmissionRecord | null
  projects: Project[]
}

// 營運排放類別
const OPERATIONAL_CATEGORIES = [
  { id: 'office-electricity', name: '辦公用電', color: '#10B981', icon: Zap },
  { id: 'office-transport', name: '員工通勤', color: '#06B6D4', icon: Car },
  { id: 'office-equipment', name: '設備維護', color: '#8B5CF6', icon: Target },
  { id: 'office-supplies', name: '辦公用品', color: '#F59E0B', icon: FileText },
  { id: 'office-waste', name: '廢棄物處理', color: '#EF4444', icon: Trash2 },
  { id: 'office-catering', name: '員工餐飲', color: '#EC4899', icon: Droplets },
  { id: 'office-other', name: '其他營運', color: '#6B7280', icon: Activity }
]

// 營運排放源
const OPERATIONAL_SOURCES = {
  'office-electricity': [
    { id: 'electricity-office', name: '辦公室用電', factor: 0.509, unit: 'kWh' },
    { id: 'electricity-server', name: '伺服器用電', factor: 0.509, unit: 'kWh' },
    { id: 'electricity-ac', name: '空調用電', factor: 0.509, unit: 'kWh' }
  ],
  'office-transport': [
    { id: 'commute-car', name: '員工開車通勤', factor: 0.21, unit: 'km' },
    { id: 'commute-motorcycle', name: '員工騎車通勤', factor: 0.063, unit: 'km' },
    { id: 'commute-public', name: '員工搭乘大眾運輸', factor: 0.055, unit: 'km' }
  ],
  'office-equipment': [
    { id: 'equipment-maintenance', name: '設備維護', factor: 2.5, unit: '次' },
    { id: 'equipment-purchase', name: '設備採購', factor: 15.0, unit: '件' }
  ],
  'office-supplies': [
    { id: 'paper-usage', name: '紙張使用', factor: 1.8, unit: 'kg' },
    { id: 'office-materials', name: '辦公用品', factor: 3.2, unit: 'kg' }
  ],
  'office-waste': [
    { id: 'general-waste', name: '一般廢棄物', factor: 0.45, unit: 'kg' },
    { id: 'recyclable-waste', name: '資源回收', factor: 0.15, unit: 'kg' }
  ],
  'office-catering': [
    { id: 'employee-meals', name: '員工餐飲', factor: 3.2, unit: '餐' },
    { id: 'office-coffee', name: '辦公室茶水', factor: 0.8, unit: '杯' }
  ],
  'office-other': [
    { id: 'other-operational', name: '其他營運活動', factor: 1.0, unit: '項目' }
  ]
}

// 分攤方法
const ALLOCATION_METHODS = [
  { id: 'budget', name: '依預算比例', description: '根據專案預算比例分攤' },
  { id: 'emissions', name: '依排放比例', description: '根據專案現有排放比例分攤' },
  { id: 'equal', name: '平均分攤', description: '所有專案平均分攤' },
  { id: 'custom', name: '自訂比例', description: '手動設定各專案分攤比例' }
]

const OperationalEmissionFormModal: React.FC<OperationalEmissionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  emission,
  projects
}) => {
  const [formData, setFormData] = useState({
    description: '',
    categoryId: '',
    sourceId: '',
    quantity: '',
    amount: '',
    date: '',
    location: '',
    notes: '',
    // 分攤相關
    isAllocated: false,
    allocationMethod: 'budget',
    targetProjects: [] as string[],
    customPercentages: {} as Record<string, number>
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // 獲取選中類別的排放源
  const selectedCategory = OPERATIONAL_CATEGORIES.find(cat => cat.id === formData.categoryId)
  const availableSources = formData.categoryId ? OPERATIONAL_SOURCES[formData.categoryId as keyof typeof OPERATIONAL_SOURCES] || [] : []
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
        categoryId: emission.category || '',
        sourceId: emission.subcategory || '',
        quantity: '',
        amount: emission.amount.toString(),
        date: emission.date ? emission.date.split('T')[0] : '',
        location: emission.location || '',
        notes: '',
        isAllocated: false,
        allocationMethod: 'budget',
        targetProjects: [],
        customPercentages: {}
      })
    } else {
      // Reset form for new emission
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        description: '',
        categoryId: '',
        sourceId: '',
        quantity: '',
        amount: '',
        date: today,
        location: '',
        notes: '',
        isAllocated: false,
        allocationMethod: 'budget',
        targetProjects: [],
        customPercentages: {}
      })
    }
    setErrors({})
  }, [emission, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.description.trim()) {
      newErrors.description = '描述為必填'
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

    if (formData.isAllocated && formData.targetProjects.length === 0) {
      newErrors.targetProjects = '請選擇至少一個分攤專案'
    }

    if (formData.allocationMethod === 'custom' && formData.isAllocated) {
      const total = Object.values(formData.customPercentages).reduce((sum, val) => sum + val, 0)
      if (Math.abs(total - 100) > 0.01) {
        newErrors.customPercentages = '自訂比例總和必須為100%'
      }
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
        // 營運排放不屬於特定專案
        projectId: undefined,
        stage: undefined,
        amount: Number(formData.amount),
        date: formData.date,
        location: formData.location || undefined,
        equipment: undefined
      }
      
      let savedEmission: EmissionRecord
      if (emission) {
        savedEmission = await emissionApi.updateEmissionRecord(emission.id, emissionData)
      } else {
        savedEmission = await emissionApi.createEmissionRecord(emissionData)
      }
      
      onSave(savedEmission)
    } catch (error) {
      console.error('儲存營運排放記錄失敗:', error)
      setErrors({ submit: '儲存失敗，請稍後再試' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleProjectSelection = (projectId: string) => {
    const newTargetProjects = formData.targetProjects.includes(projectId)
      ? formData.targetProjects.filter(id => id !== projectId)
      : [...formData.targetProjects, projectId]
    
    handleInputChange('targetProjects', newTargetProjects)
    
    // 如果是自訂比例，初始化百分比
    if (formData.allocationMethod === 'custom') {
      const newPercentages = { ...formData.customPercentages }
      if (!formData.targetProjects.includes(projectId)) {
        newPercentages[projectId] = 0
      } else {
        delete newPercentages[projectId]
      }
      setFormData(prev => ({ ...prev, customPercentages: newPercentages }))
    }
  }

  const updateCustomPercentage = (projectId: string, percentage: number) => {
    setFormData(prev => ({
      ...prev,
      customPercentages: {
        ...prev.customPercentages,
        [projectId]: percentage
      }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {emission ? '編輯營運排放記錄' : '新增營運排放記錄'}
              </h2>
              <p className="text-sm text-slate-400">日常營運碳排放記錄</p>
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
          {/* 基本資訊 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              基本資訊
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                活動描述 *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                  errors.description ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="例如：辦公室電費、員工通勤、設備維護等"
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  營運類別 *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    handleInputChange('categoryId', e.target.value)
                    handleInputChange('sourceId', '') // 重置排放源
                  }}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                    errors.categoryId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">選擇營運類別</option>
                  {OPERATIONAL_CATEGORIES.map(category => (
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
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 disabled:opacity-50 ${
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
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
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
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
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
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                    errors.date ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  地點
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  placeholder="輸入地點（可選）"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                備註
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                placeholder="輸入備註（可選）"
              />
            </div>
          </div>

          {/* 分攤設定 */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Percent className="w-5 h-5" />
                分攤設定
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAllocated}
                  onChange={(e) => handleInputChange('isAllocated', e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-slate-900 border-slate-600 rounded focus:ring-yellow-500"
                />
                <span className="text-sm text-slate-300">分攤到專案</span>
              </label>
            </div>

            {formData.isAllocated && (
              <div className="space-y-4 bg-slate-900/30 rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    分攤方法
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ALLOCATION_METHODS.map(method => (
                      <label key={method.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors">
                        <input
                          type="radio"
                          name="allocationMethod"
                          value={method.id}
                          checked={formData.allocationMethod === method.id}
                          onChange={(e) => handleInputChange('allocationMethod', e.target.value)}
                          className="mt-1 w-4 h-4 text-yellow-600 bg-slate-900 border-slate-600 focus:ring-yellow-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{method.name}</div>
                          <div className="text-xs text-slate-400">{method.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    目標專案 *
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {projects.map(project => (
                      <label key={project.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.targetProjects.includes(project.id)}
                          onChange={() => toggleProjectSelection(project.id)}
                          className="w-4 h-4 text-yellow-600 bg-slate-900 border-slate-600 rounded focus:ring-yellow-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{project.name}</div>
                          <div className="text-xs text-slate-400">{project.description}</div>
                        </div>
                        {formData.allocationMethod === 'custom' && formData.targetProjects.includes(project.id) && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={formData.customPercentages[project.id] || 0}
                              onChange={(e) => updateCustomPercentage(project.id, parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs"
                              placeholder="0"
                            />
                            <span className="text-xs text-slate-400">%</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.targetProjects && <p className="text-red-400 text-sm mt-1">{errors.targetProjects}</p>}
                  {errors.customPercentages && <p className="text-red-400 text-sm mt-1">{errors.customPercentages}</p>}
                </div>
              </div>
            )}
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
              className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default OperationalEmissionFormModal 