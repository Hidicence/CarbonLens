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
import { firebaseService } from '../services/firebaseService'
import type { ProjectEmissionRecord, NonProjectEmissionRecord } from '../../../types/project'

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
  const [projectEmissions, setProjectEmissions] = useState<ProjectEmissionRecord[]>([])
  const [operationalEmissions, setOperationalEmissions] = useState<NonProjectEmissionRecord[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'project' | 'operational'>('project')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isOperationalModalOpen, setIsOperationalModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingEmission, setEditingEmission] = useState<EmissionRecord | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

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
  }

  // 專業圖標組件
  const EmissionIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )

  const FactoryIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M17 18h1"/>
      <path d="M12 18h1"/>
      <path d="M7 18h1"/>
    </svg>
  )

  const CalendarIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )

  const TagIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )

  const TrendingUpIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
      <polyline points="16,7 22,7 22,13"/>
    </svg>
  )

  const FilterIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
    </svg>
  )

  const PlusIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )

  const DownloadIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )

  const EditIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )

  const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  )

  useEffect(() => {
    setLoading(true);
    
    // 設置實時監聽專案數據
    const unsubscribeProjects = firebaseService.subscribeToProjects((projectsData) => {
      console.log('📡 Emissions 接收到專案數據更新:', projectsData.length, '個專案');
      
      // 將Firebase專案數據轉換為本地Project類型
      const convertedProjects: Project[] = projectsData.map(project => ({
        ...project,
        startDate: project.startDate || new Date().toISOString(),
        status: project.status === 'on-hold' ? 'paused' : project.status as 'planning' | 'active' | 'paused' | 'completed',
        emissionSummary: {
          projectId: project.id,
          directEmissions: 0,
          allocatedEmissions: 0,
          totalEmissions: 0,
          directRecordCount: 0,
          allocatedRecordCount: 0
        }
      }));
      
      setProjects(convertedProjects);
    });
    
    // 設置實時監聽專案排放記錄
    const unsubscribeProjectEmissions = firebaseService.subscribeToEmissionRecords((emissionsData) => {
      console.log('📡 Emissions 接收到專案排放記錄更新:', emissionsData.length, '條記錄');
      setProjectEmissions(emissionsData);
    });
    
    // 設置實時監聽營運排放記錄
    const unsubscribeOperationalEmissions = firebaseService.subscribeToOperationalRecords((operationalData) => {
      console.log('📡 Emissions 接收到營運排放記錄更新:', operationalData.length, '條記錄');
      setOperationalEmissions(operationalData);
      setLoading(false);
    });

    // 清理函數
    return () => {
      console.log('🔌 Emissions 取消實時監聽');
      unsubscribeProjects();
      unsubscribeProjectEmissions();
      unsubscribeOperationalEmissions();
    };
  }, []);

  // 過濾專案排放記錄
  const filteredProjectEmissions = projectEmissions.filter(emission => {
    if (selectedProject === 'all') return true
    return emission.projectId === selectedProject
  })

  // 計算統計數據
  const totalProjectEmissions = filteredProjectEmissions.reduce((sum, record) => sum + (record.amount || 0), 0)
  const totalOperationalEmissions = operationalEmissions.reduce((sum, record) => sum + (record.amount || 0), 0)

  // 專業圖標組件
  const CarIcon = ({ size = 16, color = 'currentColor' }) => (
    <Car size={size} color={color} />
  );

  const ZapIcon = ({ size = 16, color = 'currentColor' }) => (
    <Zap size={size} color={color} />
  );

  const CameraIcon = ({ size = 16, color = 'currentColor' }) => (
    <Camera size={size} color={color} />
  );

  const UtensilsIcon = ({ size = 16, color = 'currentColor' }) => (
    <Droplets size={size} color={color} />
  );

  const HotelIcon = ({ size = 16, color = 'currentColor' }) => (
    <Building size={size} color={color} />
  );

  const Trash2Icon = ({ size = 16, color = 'currentColor' }) => (
    <Trash2 size={size} color={color} />
  );

  const ClipboardIcon = ({ size = 16, color = 'currentColor' }) => (
    <Activity size={size} color={color} />
  );

  // 排放類別映射
  const emissionCategoryMap = {
    'transport': { label: '交通運輸', color: colors.warning, icon: <CarIcon size={16} /> },
    'energy': { label: '能源使用', color: colors.error, icon: <ZapIcon size={16} /> },
    'equipment': { label: '設備器材', color: colors.accent, icon: <CameraIcon size={16} /> },
    'catering': { label: '餐飲服務', color: colors.success, icon: <UtensilsIcon size={16} /> },
    'accommodation': { label: '住宿服務', color: colors.primary, icon: <HotelIcon size={16} /> },
    'waste': { label: '廢棄物處理', color: colors.textMuted, icon: <Trash2Icon size={16} /> },
    'other': { label: '其他', color: colors.textSecondary, icon: <ClipboardIcon size={16} /> },
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: colors.textSecondary,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '16px',
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${colors.border}`,
            borderTop: `2px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          載入排放數據...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      color: colors.text,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* 頁面標題 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            margin: '0 0 8px 0',
            color: colors.text,
          }}>
            排放記錄
          </h1>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            margin: 0,
          }}>
            管理和追蹤專案與營運的碳排放數據
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.card,
            color: colors.textSecondary,
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
            <DownloadIcon size={16} />
            匯出數據
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 12px ${colors.primary}30`,
          }}>
            <PlusIcon size={18} />
            新增記錄
            </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}10)`,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.primary}20`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }}></div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textSecondary,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              專案排放
            </h3>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `${colors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <EmissionIcon size={20} color={colors.primary} />
            </div>
          </div>
          
          <p style={{
            fontSize: '24px',
            fontWeight: '800',
            color: colors.text,
            margin: '0 0 4px 0',
          }}>
            {totalProjectEmissions.toFixed(1)} kg
          </p>
          <p style={{
            fontSize: '13px',
            color: colors.textMuted,
            margin: 0,
          }}>
            CO₂ 當量 • {filteredProjectEmissions.length} 筆記錄
          </p>
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}10)`,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.accent}20`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
          }}></div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textSecondary,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              營運排放
            </h3>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `${colors.accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FactoryIcon size={20} color={colors.accent} />
            </div>
          </div>
          
          <p style={{
            fontSize: '24px',
            fontWeight: '800',
            color: colors.text,
            margin: '0 0 4px 0',
          }}>
            {totalOperationalEmissions.toFixed(1)} kg
          </p>
          <p style={{
            fontSize: '13px',
            color: colors.textMuted,
            margin: 0,
          }}>
            CO₂ 當量 • {operationalEmissions.length} 筆記錄
          </p>
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${colors.warning}15, ${colors.warning}10)`,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.warning}20`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${colors.warning}, transparent)`,
          }}></div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textSecondary,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              總排放量
            </h3>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `${colors.warning}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUpIcon size={20} color={colors.warning} />
          </div>
        </div>

          <p style={{
            fontSize: '24px',
            fontWeight: '800',
            color: colors.text,
            margin: '0 0 4px 0',
          }}>
            {(totalProjectEmissions + totalOperationalEmissions).toFixed(1)} kg
          </p>
          <p style={{
            fontSize: '13px',
            color: colors.textMuted,
            margin: 0,
          }}>
            CO₂ 當量 • 總計 {filteredProjectEmissions.length + operationalEmissions.length} 筆
          </p>
        </div>
      </div>

      {/* 標籤頁和過濾器 */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${colors.border}`,
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          {/* 標籤頁 */}
          <div style={{
            display: 'flex',
            background: colors.background,
            borderRadius: '12px',
            padding: '4px',
            border: `1px solid ${colors.border}`,
          }}>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'project' ? colors.primary : 'transparent',
                color: activeTab === 'project' ? 'white' : colors.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setActiveTab('project')}
            >
              <EmissionIcon size={16} />
              專案排放
            </button>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'operational' ? colors.primary : 'transparent',
                color: activeTab === 'operational' ? 'white' : colors.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setActiveTab('operational')}
            >
              <FactoryIcon size={16} />
              營運排放
            </button>
          </div>

          {/* 專案過濾器 (僅在專案排放標籤時顯示) */}
          {activeTab === 'project' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <FilterIcon size={16} color={colors.textMuted} />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  background: colors.background,
                  color: colors.text,
                  fontSize: '14px',
                  outline: 'none',
                  minWidth: '180px',
                }}
              >
                <option value="all">所有專案</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
                      </div>
                    )}
                  </div>
      </div>

      {/* 排放記錄列表 */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }}></div>
          
          <div style={{
            padding: '24px',
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: colors.text,
              margin: 0,
            }}>
              {activeTab === 'project' ? '專案排放記錄' : '營運排放記錄'}
            </h2>
          </div>
        </div>

        {activeTab === 'project' ? (
          filteredProjectEmissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: colors.textMuted,
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `${colors.primary}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <EmissionIcon size={32} color={colors.primary} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textSecondary,
                margin: '0 0 8px 0',
              }}>
                尚無專案排放記錄
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                margin: 0,
              }}>
                開始記錄您的專案碳排放數據
              </p>
            </div>
          ) : (
            <div style={{ padding: '0 24px 24px' }}>
              {filteredProjectEmissions.map((emission, index) => {
                const project = projects.find(p => p.id === emission.projectId)
                const categoryInfo = emissionCategoryMap[emission.categoryId as keyof typeof emissionCategoryMap]
                
                return (
                  <div
                    key={emission.id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      background: colors.background,
                      border: `1px solid ${colors.border}`,
                      marginBottom: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.cardHover
                      e.currentTarget.style.borderColor = colors.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.background
                      e.currentTarget.style.borderColor = colors.border
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${categoryInfo?.color || colors.primary}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}>
                      {categoryInfo?.icon || <ClipboardIcon size={20} />}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: colors.text,
                        margin: '0 0 4px 0',
                      }}>
                        {emission.description || '排放記錄'}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '13px',
                        color: colors.textMuted,
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <CalendarIcon size={12} />
                          {new Date(emission.date).toLocaleDateString('zh-TW')}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <TagIcon size={12} />
                          {project?.name || '未知專案'}
                        </div>
                        <div style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: `${categoryInfo?.color || colors.primary}15`,
                          color: categoryInfo?.color || colors.primary,
                          fontSize: '11px',
                          fontWeight: '500',
                        }}>
                          {categoryInfo?.label || emission.categoryId}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'right',
                    }}>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: colors.text,
                        margin: '0 0 4px 0',
                      }}>
                        {(emission.amount || 0).toFixed(2)} kg
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: colors.textMuted,
                        margin: 0,
                      }}>
                        CO₂ 當量
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                    }}>
                      <button style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                        background: colors.card,
                        color: colors.textMuted,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}>
                        <EditIcon size={14} />
                      </button>
                      <button style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.error}30`,
                        background: `${colors.error}10`,
                        color: colors.error,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}>
                        <TrashIcon size={14} />
                      </button>
                      </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          // 營運排放記錄
          operationalEmissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: colors.textMuted,
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `${colors.accent}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <FactoryIcon size={32} color={colors.accent} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textSecondary,
                margin: '0 0 8px 0',
              }}>
                尚無營運排放記錄
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                margin: 0,
              }}>
                開始記錄您的營運碳排放數據
              </p>
            </div>
          ) : (
            <div style={{ padding: '0 24px 24px' }}>
              {operationalEmissions.map((emission, index) => {
                const categoryInfo = emissionCategoryMap[emission.categoryId as keyof typeof emissionCategoryMap]
                
                return (
                  <div
                    key={emission.id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      background: colors.background,
                      border: `1px solid ${colors.border}`,
                      marginBottom: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.cardHover
                      e.currentTarget.style.borderColor = colors.accent
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.background
                      e.currentTarget.style.borderColor = colors.border
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${categoryInfo?.color || colors.accent}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}>
                      {categoryInfo?.icon || <FactoryIcon size={20} />}
                      </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: colors.text,
                        margin: '0 0 4px 0',
                      }}>
                        {emission.description || '營運排放記錄'}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '13px',
                        color: colors.textMuted,
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <CalendarIcon size={12} />
                          {new Date(emission.date).toLocaleDateString('zh-TW')}
                        </div>
                        <div style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: `${categoryInfo?.color || colors.accent}15`,
                          color: categoryInfo?.color || colors.accent,
                          fontSize: '11px',
                          fontWeight: '500',
                        }}>
                          {categoryInfo?.label || emission.categoryId}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'right',
                    }}>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: colors.text,
                        margin: '0 0 4px 0',
                      }}>
                        {(emission.amount || 0).toFixed(2)} kg
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: colors.textMuted,
                        margin: 0,
                      }}>
                        CO₂ 當量
                      </p>
                </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px',
                    }}>
                      <button style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                        background: colors.card,
                        color: colors.textMuted,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}>
                        <EditIcon size={14} />
                  </button>
                      <button style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.error}30`,
                        background: `${colors.error}10`,
                        color: colors.error,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}>
                        <TrashIcon size={14} />
                  </button>
                </div>
              </div>
                )
              })}
            </div>
          )
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Emissions 