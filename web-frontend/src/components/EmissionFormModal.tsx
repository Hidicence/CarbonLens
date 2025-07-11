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
  Trash2
} from 'lucide-react'
import { EmissionRecord, Project, emissionApi } from '../services/api'

interface EmissionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (emission: EmissionRecord) => void
  emission?: EmissionRecord | null
  projects: Project[]
}

// 排放因子數據庫
const EMISSION_FACTORS: Record<string, { factor: number; unit: string; description: string }> = {
  'transport-car': { factor: 0.21, unit: 'kg CO₂e/km', description: '小客車平均排放' },
  'transport-truck': { factor: 0.68, unit: 'kg CO₂e/km', description: '小型貨車排放' },
  'transport-motorcycle': { factor: 0.063, unit: 'kg CO₂e/km', description: '機車排放' },
  'transport-public': { factor: 0.055, unit: 'kg CO₂e/km', description: '大眾運輸排放' },
  'electricity-general': { factor: 0.509, unit: 'kg CO₂e/kWh', description: '台灣電網排放係數' },
  'fuel-gasoline': { factor: 2.31, unit: 'kg CO₂e/L', description: '汽油燃燒排放' },
  'fuel-diesel': { factor: 2.68, unit: 'kg CO₂e/L', description: '柴油燃燒排放' },
  'accommodation-hotel': { factor: 12.2, unit: 'kg CO₂e/房晚', description: '一般旅館住宿' },
  'catering-meal': { factor: 3.2, unit: 'kg CO₂e/餐', description: '平均餐飲排放' },
  'waste-general': { factor: 0.45, unit: 'kg CO₂e/kg', description: '一般廢棄物處理' },
  'materials-paper': { factor: 1.8, unit: 'kg CO₂e/kg', description: '紙張材料' }
}

const EmissionFormModal: React.FC<EmissionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  emission,
  projects
}) => {
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    subcategory: '',
    projectId: '',
    stage: '',
    amount: '',
    date: '',
    location: '',
    equipment: '',
    // 計算欄位
    quantity: '',
    emissionFactor: '',
    useCalculator: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFactorKey, setSelectedFactorKey] = useState('')

  useEffect(() => {
    if (emission) {
      setFormData({
        description: emission.description || '',
        category: emission.category || '',
        subcategory: emission.subcategory || '',
        projectId: emission.projectId || '',
        stage: emission.stage || '',
        amount: emission.amount.toString(),
        date: emission.date ? emission.date.split('T')[0] : '',
        location: emission.location || '',
        equipment: emission.equipment || '',
        quantity: '',
        emissionFactor: '',
        useCalculator: false
      })
    } else {
      // Reset form for new emission
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        description: '',
        category: '',
        subcategory: '',
        projectId: '',
        stage: '',
        amount: '',
        date: today,
        location: '',
        equipment: '',
        quantity: '',
        emissionFactor: '',
        useCalculator: false
      })
    }
    setErrors({})
    setSelectedFactorKey('')
  }, [emission, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.description.trim()) {
      newErrors.description = '描述為必填'
    }
    
    if (!formData.category) {
      newErrors.category = '類別為必填'
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
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        projectId: formData.projectId || undefined,
        stage: (formData.stage as 'pre-production' | 'production' | 'post-production') || undefined,
        amount: Number(formData.amount),
        date: formData.date,
        location: formData.location || undefined,
        equipment: formData.equipment || undefined,
        createdAt: emission?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      let savedEmission: EmissionRecord
      if (emission) {
        savedEmission = await emissionApi.updateEmissionRecord(emission.id, emissionData)
      } else {
        savedEmission = await emissionApi.createEmissionRecord(emissionData)
      }
      
      onSave(savedEmission)
    } catch (error) {
      console.error('儲存排放記錄失敗:', error)
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

  const handleFactorSelect = (factorKey: string) => {
    const factor = EMISSION_FACTORS[factorKey]
    if (factor) {
      setSelectedFactorKey(factorKey)
      setFormData(prev => ({ ...prev, emissionFactor: factor.factor.toString() }))
    }
  }

  const calculateEmission = () => {
    const quantity = Number(formData.quantity)
    const factor = Number(formData.emissionFactor)
    
    if (quantity > 0 && factor > 0) {
      const amount = quantity * factor
      setFormData(prev => ({ ...prev, amount: amount.toFixed(2) }))
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'transport': <Car className="w-4 h-4" />,
      'electricity': <Zap className="w-4 h-4" />,
      'fuel': <Thermometer className="w-4 h-4" />,
      'accommodation': <Building className="w-4 h-4" />,
      'catering': <Droplets className="w-4 h-4" />,
      'waste': <Trash2 className="w-4 h-4" />,
      'materials': <Target className="w-4 h-4" />,
      'other': <Activity className="w-4 h-4" />
    }
    return icons[category] || <Activity className="w-4 h-4" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {emission ? '編輯排放記錄' : '新增排放記錄'}
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
          {/* 基本資訊 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">基本資訊</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                描述 *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                  errors.description ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="輸入排放活動描述"
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  排放類別 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                    errors.category ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">選擇類別</option>
                  <option value="transport">交通運輸</option>
                  <option value="electricity">電力</option>
                  <option value="fuel">燃料</option>
                  <option value="accommodation">住宿</option>
                  <option value="catering">餐飲</option>
                  <option value="waste">廢棄物</option>
                  <option value="materials">物料耗材</option>
                  <option value="other">其他</option>
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  子類別
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="輸入子類別（可選）"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  所屬專案
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="">營運排放（不屬於特定專案）</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              {formData.projectId && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    製作階段
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => handleInputChange('stage', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="">選擇階段</option>
                    <option value="pre-production">前期製作</option>
                    <option value="production">製作期</option>
                    <option value="post-production">後期製作</option>
                  </select>
                </div>
              )}
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
                  className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
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
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="輸入地點（可選）"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                設備/器材
              </label>
              <input
                type="text"
                value={formData.equipment}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                placeholder="使用的設備或器材（可選）"
              />
            </div>
          </div>

          {/* 排放量計算 */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">排放量計算</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.useCalculator}
                  onChange={(e) => handleInputChange('useCalculator', e.target.checked.toString())}
                  className="w-4 h-4 text-green-600 bg-slate-900 border-slate-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-slate-300">使用排放係數計算</span>
              </label>
            </div>

            {formData.useCalculator && (
              <div className="space-y-4 bg-slate-900/30 rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    選擇排放係數
                  </label>
                  <select
                    value={selectedFactorKey}
                    onChange={(e) => handleFactorSelect(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="">選擇排放係數</option>
                    <optgroup label="交通運輸">
                      <option value="transport-car">小客車 (0.21 kg CO₂e/km)</option>
                      <option value="transport-truck">小型貨車 (0.68 kg CO₂e/km)</option>
                      <option value="transport-motorcycle">機車 (0.063 kg CO₂e/km)</option>
                      <option value="transport-public">大眾運輸 (0.055 kg CO₂e/km)</option>
                    </optgroup>
                    <optgroup label="電力與燃料">
                      <option value="electricity-general">電力 (0.509 kg CO₂e/kWh)</option>
                      <option value="fuel-gasoline">汽油 (2.31 kg CO₂e/L)</option>
                      <option value="fuel-diesel">柴油 (2.68 kg CO₂e/L)</option>
                    </optgroup>
                    <optgroup label="其他">
                      <option value="accommodation-hotel">住宿 (12.2 kg CO₂e/房晚)</option>
                      <option value="catering-meal">餐飲 (3.2 kg CO₂e/餐)</option>
                      <option value="waste-general">廢棄物 (0.45 kg CO₂e/kg)</option>
                      <option value="materials-paper">紙張 (1.8 kg CO₂e/kg)</option>
                    </optgroup>
                  </select>
                  {selectedFactorKey && (
                    <p className="text-xs text-slate-400 mt-1">
                      {EMISSION_FACTORS[selectedFactorKey].description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      數量
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      排放係數
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.emissionFactor}
                      onChange={(e) => handleInputChange('emissionFactor', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      placeholder="0.000"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={calculateEmission}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      計算
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                碳排放量 (kg CO₂e) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-4 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                  errors.amount ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
            </div>
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
              {isLoading ? '儲存中...' : (emission ? '更新記錄' : '新增記錄')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmissionFormModal 