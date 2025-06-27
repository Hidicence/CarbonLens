import React, { useState, useEffect } from 'react'
import { X, Calendar, MapPin, DollarSign, Building, FileText, Upload } from 'lucide-react'
import { Project, projectApi } from '../services/api'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: Project) => void
  project?: Project | null
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    status: 'planning' as 'planning' | 'active' | 'paused' | 'completed',
    startDate: '',
    endDate: '',
    budget: '',
    category: '',
    // Carbon budget fields
    enableCarbonBudget: false,
    carbonBudgetTotal: '',
    carbonBudgetPreProduction: '',
    carbonBudgetProduction: '',
    carbonBudgetPostProduction: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        location: project.location || '',
        status: project.status || 'planning',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        budget: project.budget?.toString() || '',
        category: project.category || '',
        enableCarbonBudget: !!project.carbonBudget,
        carbonBudgetTotal: project.carbonBudget?.total?.toString() || '',
        carbonBudgetPreProduction: project.carbonBudget?.stages?.['pre-production']?.toString() || '',
        carbonBudgetProduction: project.carbonBudget?.stages?.production?.toString() || '',
        carbonBudgetPostProduction: project.carbonBudget?.stages?.['post-production']?.toString() || ''
      })
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        description: '',
        location: '',
        status: 'planning',
        startDate: '',
        endDate: '',
        budget: '',
        category: '',
        enableCarbonBudget: false,
        carbonBudgetTotal: '',
        carbonBudgetPreProduction: '',
        carbonBudgetProduction: '',
        carbonBudgetPostProduction: ''
      })
    }
    setErrors({})
  }, [project, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '專案名稱為必填'
    }
    
    if (!formData.startDate) {
      newErrors.startDate = '開始日期為必填'
    }
    
    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = '結束日期必須晚於開始日期'
    }
    
    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = '預算必須為有效數字'
    }

    // Carbon budget validation
    if (formData.enableCarbonBudget) {
      if (!formData.carbonBudgetTotal || isNaN(Number(formData.carbonBudgetTotal))) {
        newErrors.carbonBudgetTotal = '總碳預算必須為有效數字'
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    
    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        category: formData.category || undefined,
        carbonBudget: formData.enableCarbonBudget ? {
          total: Number(formData.carbonBudgetTotal),
          stages: {
            'pre-production': formData.carbonBudgetPreProduction ? Number(formData.carbonBudgetPreProduction) : undefined,
            production: formData.carbonBudgetProduction ? Number(formData.carbonBudgetProduction) : undefined,
            'post-production': formData.carbonBudgetPostProduction ? Number(formData.carbonBudgetPostProduction) : undefined
          }
        } : undefined
      }
      
      let savedProject: Project
      if (project) {
        savedProject = await projectApi.updateProject(project.id, projectData)
      } else {
        savedProject = await projectApi.createProject(projectData)
      }
      
      onSave(savedProject)
    } catch (error) {
      console.error('儲存專案失敗:', error)
      setErrors({ submit: '儲存專案失敗，請稍後再試' })
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
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {project ? '編輯專案' : '新建專案'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">基本資訊</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                專案名稱 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                  errors.name ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="輸入專案名稱"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                專案描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                placeholder="輸入專案描述"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  專案地點
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="輸入專案地點"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  專案狀態
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="planning">規劃中</option>
                  <option value="active">進行中</option>
                  <option value="paused">暫停</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  開始日期 *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                    errors.startDate ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  結束日期
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                    errors.endDate ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  專案預算 (NT$)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                    errors.budget ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="0"
                />
                {errors.budget && <p className="text-red-400 text-sm mt-1">{errors.budget}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  專案類別
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="">請選擇類別</option>
                  <option value="movie">電影</option>
                  <option value="tv">電視劇</option>
                  <option value="commercial">廣告</option>
                  <option value="documentary">紀錄片</option>
                  <option value="music-video">音樂錄影帶</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
          </div>

          {/* Carbon Budget Section */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">碳預算設定</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enableCarbonBudget}
                  onChange={(e) => handleInputChange('enableCarbonBudget', e.target.checked.toString())}
                  className="w-4 h-4 text-green-600 bg-slate-900 border-slate-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-slate-300">啟用碳預算</span>
              </label>
            </div>

            {formData.enableCarbonBudget && (
              <div className="space-y-4 bg-slate-900/30 rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    總碳預算 (kg CO₂e) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.carbonBudgetTotal}
                    onChange={(e) => handleInputChange('carbonBudgetTotal', e.target.value)}
                    className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                      errors.carbonBudgetTotal ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="0.0"
                  />
                  {errors.carbonBudgetTotal && <p className="text-red-400 text-sm mt-1">{errors.carbonBudgetTotal}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      前期製作 (kg CO₂e)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.carbonBudgetPreProduction}
                      onChange={(e) => handleInputChange('carbonBudgetPreProduction', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      製作期 (kg CO₂e)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.carbonBudgetProduction}
                      onChange={(e) => handleInputChange('carbonBudgetProduction', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      後期製作 (kg CO₂e)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.carbonBudgetPostProduction}
                      onChange={(e) => handleInputChange('carbonBudgetPostProduction', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? '儲存中...' : (project ? '更新專案' : '創建專案')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectFormModal 