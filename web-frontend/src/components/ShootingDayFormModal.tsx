import React, { useState, useEffect } from 'react'
import { X, Calendar, MapPin, Users, Camera, Zap } from 'lucide-react'
import type { ShootingDayEmission, FilmCrew, Project } from '../../../types/project'

// 工作組別選項 - 與APP端完全一致
const CREW_OPTIONS = [
  { key: 'director', name: '導演組', color: '#FF6B6B' },
  { key: 'camera', name: '攝影組', color: '#4ECDC4' },
  { key: 'lighting', name: '燈光組', color: '#FFE66D' },
  { key: 'sound', name: '收音組', color: '#A8E6CF' },
  { key: 'makeup', name: '梳化組', color: '#FFB3BA' },
  { key: 'costume', name: '服裝組', color: '#BFACC8' },
  { key: 'props', name: '道具組', color: '#FFD93D' },
  { key: 'art', name: '美術組', color: '#6BCF7F' },
  { key: 'gaffer', name: '燈光師組', color: '#4D96FF' },
  { key: 'grip', name: '器材組', color: '#9B59B6' },
  { key: 'production', name: '製片組', color: '#D4E6B7' },
  { key: 'transport', name: '交通組', color: '#F39C12' },
  { key: 'catering', name: '餐飲組', color: '#E74C3C' },
  { key: 'location', name: '場地組', color: '#1ABC9C' },
  { key: 'post', name: '後期組', color: '#95A5A6' },
  { key: 'other', name: '其他', color: '#BDC3C7' }
] as const

// 排放類別 - 與APP端完全一致
const EMISSION_CATEGORIES = [
  { key: 'transport', name: '交通運輸', factor: 0.21, unit: 'km' },
  { key: 'equipment', name: '設備用電', factor: 0.5, unit: 'kWh' },
  { key: 'catering', name: '餐飲服務', factor: 3.2, unit: '餐' },
  { key: 'accommodation', name: '住宿服務', factor: 15.0, unit: '房晚' },
  { key: 'materials', name: '物料耗材', factor: 2.1, unit: 'kg' },
  { key: 'waste', name: '廢棄物處理', factor: 0.5, unit: 'kg' },
  { key: 'other', name: '其他活動', factor: 1.0, unit: 'kg CO₂e' }
] as const

interface ShootingDayFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (record: ShootingDayEmission) => void
  projects: Project[]
  selectedProjectId?: string
  record?: ShootingDayEmission | null
}

const ShootingDayFormModal: React.FC<ShootingDayFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
  selectedProjectId,
  record
}) => {
  const [formData, setFormData] = useState({
    projectId: selectedProjectId || '',
    shootingDate: '',
    location: '',
    sceneNumber: '',
    crew: 'director' as FilmCrew,
    category: '',
    description: '',
    quantity: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // 獲取選中的組別和類別信息
  const selectedCrew = CREW_OPTIONS.find(c => c.key === formData.crew)
  const selectedCategory = EMISSION_CATEGORIES.find(c => c.key === formData.category)

  // 計算排放量
  const calculateEmission = () => {
    if (!selectedCategory || !formData.quantity) return 0
    return parseFloat(formData.quantity) * selectedCategory.factor
  }

  useEffect(() => {
    if (record) {
      setFormData({
        projectId: record.projectId,
        shootingDate: record.shootingDate,
        location: record.location,
        sceneNumber: record.sceneNumber || '',
        crew: record.crew,
        category: record.category,
        description: record.description,
        quantity: record.quantity?.toString() || '',
        notes: record.notes || ''
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        projectId: selectedProjectId || '',
        shootingDate: today,
        location: '',
        sceneNumber: '',
        crew: 'director',
        category: '',
        description: '',
        quantity: '',
        notes: ''
      })
    }
    setErrors({})
  }, [record, selectedProjectId, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.projectId) {
      newErrors.projectId = '請選擇專案'
    }
    
    if (!formData.shootingDate) {
      newErrors.shootingDate = '請選擇拍攝日期'
    }
    
    if (!formData.location.trim()) {
      newErrors.location = '請輸入拍攝地點'
    }
    
    if (!formData.category) {
      newErrors.category = '請選擇排放類別'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '請輸入活動描述'
    }
    
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = '請輸入有效的數量'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    
    try {
      const emission = calculateEmission()
      
      const recordData: ShootingDayEmission = {
        id: record?.id || Date.now().toString(),
        projectId: formData.projectId,
        shootingDate: formData.shootingDate,
        location: formData.location.trim(),
        sceneNumber: formData.sceneNumber.trim() || undefined,
        crew: formData.crew,
        category: formData.category,
        description: formData.description.trim(),
        amount: emission,
        quantity: Number(formData.quantity),
        unit: selectedCategory?.unit,
        notes: formData.notes.trim() || undefined,
        createdAt: record?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      onSave(recordData)
    } catch (error) {
      console.error('儲存拍攝記錄失敗:', error)
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
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {record ? '編輯拍攝日記錄' : '新增拍攝日記錄'}
              </h2>
              <p className="text-sm text-slate-400">按工作組別記錄拍攝活動碳排放</p>
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
          {/* 拍攝信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              拍攝信息
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  所屬專案 *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
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
                  拍攝日期 *
                </label>
                <input
                  type="date"
                  value={formData.shootingDate}
                  onChange={(e) => handleInputChange('shootingDate', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    errors.shootingDate ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.shootingDate && <p className="text-red-400 text-sm mt-1">{errors.shootingDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  拍攝地點 *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    errors.location ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="輸入拍攝地點"
                />
                {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  場次編號 (選填)
                </label>
                <input
                  type="text"
                  value={formData.sceneNumber}
                  onChange={(e) => handleInputChange('sceneNumber', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="例如：001, A01"
                />
              </div>
            </div>
          </div>

          {/* 工作組別 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              工作組別
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CREW_OPTIONS.map((crew) => (
                <button
                  key={crew.key}
                  type="button"
                  onClick={() => handleInputChange('crew', crew.key)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.crew === crew.key
                      ? `border-[${crew.color}] bg-[${crew.color}]/10`
                      : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                  }`}
                  style={{
                    borderColor: formData.crew === crew.key ? crew.color : undefined,
                    backgroundColor: formData.crew === crew.key ? `${crew.color}15` : undefined
                  }}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium" style={{ color: formData.crew === crew.key ? crew.color : '#e2e8f0' }}>
                      {crew.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 排放活動 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              排放活動
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  活動類別 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    errors.category ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">選擇活動類別</option>
                  {EMISSION_CATEGORIES.map(category => (
                    <option key={category.key} value={category.key}>
                      {category.name} ({category.unit})
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  數量 * {selectedCategory && `(${selectedCategory.unit})`}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    errors.quantity ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="輸入數量"
                />
                {errors.quantity && <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                活動描述 *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  errors.description ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="例如：外景拍攝交通、攝影機使用、劇組餐飲等"
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* 排放量預覽 */}
            {calculateEmission() > 0 && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">預估排放量</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {calculateEmission().toFixed(2)} kg CO₂e
                </div>
                {selectedCategory && (
                  <div className="text-xs text-slate-400 mt-1">
                    計算公式：{formData.quantity || '0'} {selectedCategory.unit} × {selectedCategory.factor} = {calculateEmission().toFixed(2)} kg CO₂e
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                備註 (選填)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="其他備註信息"
              />
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
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '儲存中...' : (record ? '更新記錄' : '新增記錄')}
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

export default ShootingDayFormModal 