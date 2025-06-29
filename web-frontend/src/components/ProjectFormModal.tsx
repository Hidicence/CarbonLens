import React, { useState, useEffect } from 'react'
import { X, Calendar, MapPin, DollarSign, Building, FileText, Upload, Wifi, WifiOff, CheckCircle } from 'lucide-react'
import { Project, projectApi } from '../services/api'
import firebaseService from '../services/firebaseService'

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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'api' | 'firebase' | 'complete' | 'error'>('idle')

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
    setSyncStatus('api')
    
    try {
      // 清理數據，移除所有 undefined 值（Firebase 不支援）
      const cleanData = (obj: any): any => {
        if (obj === null || obj === undefined) return null
        if (typeof obj !== 'object') return obj
        
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            cleaned[key] = typeof value === 'object' ? cleanData(value) : value
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : null
      }

      const projectData = cleanData({
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        budget: formData.budget ? Number(formData.budget) : null,
        category: formData.category || null,
        carbonBudget: formData.enableCarbonBudget ? cleanData({
          total: Number(formData.carbonBudgetTotal),
          stages: cleanData({
            'pre-production': formData.carbonBudgetPreProduction ? Number(formData.carbonBudgetPreProduction) : null,
            production: formData.carbonBudgetProduction ? Number(formData.carbonBudgetProduction) : null,
            'post-production': formData.carbonBudgetPostProduction ? Number(formData.carbonBudgetPostProduction) : null
          })
        }) : null
      })
      
      let savedProject: Project
      
      // 嘗試使用後端 API，如果失敗則直接使用 Firebase
      try {
        if (project) {
          // 更新現有專案
          const updateData = {
            ...projectData,
            emissionSummary: project.emissionSummary // 保持現有的排放摘要
          } as Partial<Project>
          savedProject = await projectApi.updateProject(project.id, updateData)
        } else {
          // 創建新專案，添加必需的欄位
          const createData = {
            ...projectData,
            emissionSummary: {
              projectId: '',
              directEmissions: 0,
              allocatedEmissions: 0,
              totalEmissions: 0,
              directRecordCount: 0,
              allocatedRecordCount: 0
            }
          }
          savedProject = await projectApi.createProject(createData)
        }
        console.log('✅ 專案已保存到後端 API')
        // 確保返回的專案有正確的 ID
        if (!savedProject.id) {
          console.error('⚠️ 後端返回的專案缺少 ID');
        }
      } catch (apiError) {
        console.warn('⚠️ 後端 API 不可用，使用 Firebase 直接保存:', apiError)
        setSyncStatus('firebase')
        
        // 如果後端不可用，直接使用 Firebase
        if (project) {
          await firebaseService.updateProject(project.id, projectData as any)
          savedProject = { ...project, ...projectData }
        } else {
          const projectId = await firebaseService.createProject(projectData as any)
          savedProject = {
            id: projectId,
            ...projectData,
            createdAt: new Date().toISOString(),
            emissionSummary: {
              projectId: projectId,
              directEmissions: 0,
              allocatedEmissions: 0,
              totalEmissions: 0,
              directRecordCount: 0,
              allocatedRecordCount: 0
            }
          }
        }
        console.log('✅ 專案已保存到 Firebase')
      }
      
      // 確保數據同步到 Firebase（即使後端成功也要同步）
      try {
        setSyncStatus('firebase')
      if (project) {
          await firebaseService.updateProject(savedProject.id, projectData as any)
      } else {
          await firebaseService.createProject(savedProject as any)
        }
        console.log('🔄 專案已同步到 Firebase')
        setSyncStatus('complete')
      } catch (syncError) {
        console.warn('⚠️ Firebase 同步失敗，但專案已保存:', syncError)
      }
      
      onSave(savedProject)
    } catch (error) {
      console.error('儲存專案失敗:', error)
      setSyncStatus('error')
      setErrors({ submit: '儲存專案失敗，請檢查網路連接或稍後再試' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setSyncStatus('idle'), 2000)
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
          <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">
            {project ? '編輯專案' : '新建專案'}
          </h2>
            {/* 同步狀態指示器 */}
            {syncStatus !== 'idle' && (
              <div className="flex items-center gap-2 text-sm">
                {syncStatus === 'api' && (
                  <>
                    <Wifi className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-blue-400">連接後端...</span>
                  </>
                )}
                {syncStatus === 'firebase' && (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span className="text-orange-400">同步到雲端...</span>
                  </>
                )}
                {syncStatus === 'complete' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">同步完成</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <X className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">同步失敗</span>
                  </>
                )}
              </div>
            )}
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
          {/* 同步提示 */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-green-400 font-medium mb-1">雙軌同步保障</p>
                <p className="text-green-300/80">
                  專案將自動同步到 APP 端和 Firebase 雲端，確保數據在所有平台保持一致
                </p>
              </div>
            </div>
          </div>

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
                  onChange={(e) => setFormData(prev => ({ ...prev, enableCarbonBudget: e.target.checked }))}
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