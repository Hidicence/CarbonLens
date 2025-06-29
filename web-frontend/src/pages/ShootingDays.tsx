import React, { useState, useEffect } from 'react'
import { 
  Camera, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Zap,
  Edit3,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react'
import { firebaseService } from '../services/firebaseService'
import ShootingDayFormModal from '../components/ShootingDayFormModal'
import type { ShootingDayEmission, Project, FilmCrew } from '../../../types/project'

// 工作組別配置 - 與APP端完全一致
const CREW_CONFIG = {
  director: { name: '導演組', color: '#FF6B6B', bgColor: '#FF6B6B15' },
  camera: { name: '攝影組', color: '#4ECDC4', bgColor: '#4ECDC415' },
  lighting: { name: '燈光組', color: '#FFE66D', bgColor: '#FFE66D15' },
  sound: { name: '收音組', color: '#A8E6CF', bgColor: '#A8E6CF15' },
  makeup: { name: '梳化組', color: '#FFB3BA', bgColor: '#FFB3BA15' },
  costume: { name: '服裝組', color: '#BFACC8', bgColor: '#BFACC815' },
  props: { name: '道具組', color: '#FFD93D', bgColor: '#FFD93D15' },
  art: { name: '美術組', color: '#6BCF7F', bgColor: '#6BCF7F15' },
  gaffer: { name: '燈光師組', color: '#4D96FF', bgColor: '#4D96FF15' },
  grip: { name: '器材組', color: '#9B59B6', bgColor: '#9B59B615' },
  production: { name: '製片組', color: '#D4E6B7', bgColor: '#D4E6B715' },
  transport: { name: '交通組', color: '#F39C12', bgColor: '#F39C1215' },
  catering: { name: '餐飲組', color: '#E74C3C', bgColor: '#E74C3C15' },
  location: { name: '場地組', color: '#1ABC9C', bgColor: '#1ABC9C15' },
  post: { name: '後期組', color: '#95A5A6', bgColor: '#95A5A615' },
  other: { name: '其他', color: '#BDC3C7', bgColor: '#BDC3C715' }
} as const

const ShootingDays: React.FC = () => {
  const [shootingRecords, setShootingRecords] = useState<ShootingDayEmission[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedCrew, setSelectedCrew] = useState<string>('all')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ShootingDayEmission | null>(null)

  const colors = {
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    secondary: '#064E3B',
    background: '#0F172A',
    backgroundLight: '#1E293B',
    card: '#1E293B',
    cardHover: '#334155',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#334155',
    borderLight: '#475569',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    accent: '#8B5CF6',
    info: '#3B82F6',
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [recordsData, projectsData] = await Promise.all([
        firebaseService.getShootingDayRecords(),
        firebaseService.getProjects()
      ])
      setShootingRecords(recordsData)
      setProjects(projectsData)
    } catch (error) {
      console.error('載入數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 過濾記錄
  const filteredRecords = shootingRecords.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = selectedProject === 'all' || record.projectId === selectedProject
    const matchesCrew = selectedCrew === 'all' || record.crew === selectedCrew
    
    return matchesSearch && matchesProject && matchesCrew
  })

  // 統計數據
  const stats = {
    totalRecords: shootingRecords.length,
    totalEmissions: shootingRecords.reduce((sum, record) => sum + record.amount, 0),
    crewStats: Object.keys(CREW_CONFIG).map(crew => ({
      crew: crew as FilmCrew,
      count: shootingRecords.filter(r => r.crew === crew).length,
      emissions: shootingRecords.filter(r => r.crew === crew).reduce((sum, r) => sum + r.amount, 0)
    })).filter(stat => stat.count > 0).sort((a, b) => b.emissions - a.emissions)
  }

  const handleCreateRecord = () => {
    setEditingRecord(null)
    setShowFormModal(true)
  }

  const handleEditRecord = (record: ShootingDayEmission) => {
    setEditingRecord(record)
    setShowFormModal(true)
  }

  const handleSaveRecord = async (recordData: ShootingDayEmission) => {
    try {
      if (editingRecord) {
        await firebaseService.updateShootingDayRecord(editingRecord.id, recordData)
        setShootingRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...r, ...recordData } : r))
      } else {
        const recordId = await firebaseService.createShootingDayRecord(recordData)
        setShootingRecords(prev => [{ ...recordData, id: recordId }, ...prev])
      }
      setShowFormModal(false)
      setEditingRecord(null)
    } catch (error) {
      console.error('儲存記錄失敗:', error)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('確定要刪除此拍攝記錄嗎？')) return
    
    try {
      await firebaseService.deleteShootingDayRecord(recordId)
      setShootingRecords(prev => prev.filter(r => r.id !== recordId))
    } catch (error) {
      console.error('刪除記錄失敗:', error)
    }
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || '未知專案'
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: colors.textMuted
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.border}`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      color: colors.text
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Camera className="w-8 h-8 text-purple-400" />
            拍攝日記錄
          </h1>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            lineHeight: '24px'
          }}>
            按工作組別記錄拍攝活動的碳排放數據
          </p>
        </div>

        <button
          onClick={handleCreateRecord}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${colors.accent}, #6366F1)`,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 12px ${colors.accent}30`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = `0 8px 20px ${colors.accent}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent}30`
          }}
        >
          <Plus size={18} />
          新增拍攝記錄
        </button>
      </div>

      {/* 統計卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: colors.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${colors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={24} color={colors.primary} />
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: colors.textSecondary,
                fontWeight: '500'
              }}>
                總記錄數
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.text
              }}>
                {stats.totalRecords}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: colors.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${colors.warning}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={24} color={colors.warning} />
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: colors.textSecondary,
                fontWeight: '500'
              }}>
                總排放量
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.text
              }}>
                {stats.totalEmissions.toFixed(1)}
                <span style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  fontWeight: '500',
                  marginLeft: '4px'
                }}>
                  kg CO₂e
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: colors.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${colors.info}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} color={colors.info} />
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: colors.textSecondary,
                fontWeight: '500'
              }}>
                活躍組別
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.text
              }}>
                {stats.crewStats.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 過濾器 */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${colors.border}`,
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '8px'
            }}>
              搜尋
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                color={colors.textMuted}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋描述或地點..."
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: colors.backgroundLight,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '8px'
            }}>
              專案篩選
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: colors.backgroundLight,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '14px'
              }}
            >
              <option value="all">全部專案</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '8px'
            }}>
              工作組別
            </label>
            <select
              value={selectedCrew}
              onChange={(e) => setSelectedCrew(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: colors.backgroundLight,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '14px'
              }}
            >
              <option value="all">全部組別</option>
              {Object.entries(CREW_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 記錄列表 */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden'
      }}>
        {filteredRecords.length > 0 ? (
          <div>
            {filteredRecords.map((record) => {
              const crewConfig = CREW_CONFIG[record.crew as keyof typeof CREW_CONFIG]
              return (
                <div
                  key={record.id}
                  style={{
                    padding: '20px',
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.cardHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <div
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: crewConfig.color,
                            background: crewConfig.bgColor
                          }}
                        >
                          {crewConfig.name}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: colors.textMuted
                        }}>
                          {getProjectName(record.projectId)}
                        </div>
                      </div>

                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: '8px'
                      }}>
                        {record.description}
                      </h3>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '14px',
                        color: colors.textSecondary,
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {record.shootingDate}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          {record.location}
                        </div>
                        {record.sceneNumber && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Camera size={14} />
                            場次 {record.sceneNumber}
                          </div>
                        )}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: colors.primary
                        }}>
                          {record.amount.toFixed(2)} kg CO₂e
                        </div>
                        {record.quantity && record.unit && (
                          <div style={{
                            fontSize: '14px',
                            color: colors.textMuted
                          }}>
                            ({record.quantity} {record.unit})
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => handleEditRecord(record)}
                        style={{
                          padding: '8px',
                          background: 'transparent',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          color: colors.textSecondary,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.primary
                          e.currentTarget.style.color = colors.primary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border
                          e.currentTarget.style.color = colors.textSecondary
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        style={{
                          padding: '8px',
                          background: 'transparent',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          color: colors.textSecondary,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.error
                          e.currentTarget.style.color = colors.error
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border
                          e.currentTarget.style.color = colors.textSecondary
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: colors.textMuted
          }}>
            <Camera size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              {shootingRecords.length === 0 ? '還沒有拍攝記錄' : '沒有符合條件的記錄'}
            </div>
            <div style={{ fontSize: '14px' }}>
              {shootingRecords.length === 0
                ? '開始記錄您的拍攝活動碳排放'
                : '嘗試調整篩選條件或搜尋關鍵字'
              }
            </div>
          </div>
        )}
      </div>

      {/* 表單模態框 */}
      <ShootingDayFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingRecord(null)
        }}
        onSave={handleSaveRecord}
        projects={projects}
        selectedProjectId={selectedProject !== 'all' ? selectedProject : undefined}
        record={editingRecord}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ShootingDays 