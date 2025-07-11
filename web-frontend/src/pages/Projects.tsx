import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp, 
  Edit3, 
  Trash2,
  Eye,
  Leaf,
  Zap,
  Target,
  Folder,
  Play,
  Pause,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import ProjectFormModal from '../components/ProjectFormModal';
import type { Project, ProjectEmissionRecord } from '../../../types/project';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [emissionRecords, setEmissionRecords] = useState<ProjectEmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
  };

  // 專業圖標組件
  const ProjectIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );

  const CalendarIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );

  const UsersIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );

  const DollarSignIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );

  const TrendingUpIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
      <polyline points="16,7 22,7 22,13"/>
    </svg>
  );

  const PlayIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  );

  const CheckCircleIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  );

  const ClockIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  );

  const PauseIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  );

  const PlusIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );

  const FilterIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
    </svg>
  );

  const SearchIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );

  const MoreVerticalIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/>
      <circle cx="12" cy="5" r="1"/>
      <circle cx="12" cy="19" r="1"/>
    </svg>
  );

  useEffect(() => {
    setLoading(true);
    
    // 設置實時監聽專案數據
    const unsubscribeProjects = firebaseService.subscribeToProjects((projectsData) => {
      console.log('📡 接收到專案數據更新:', projectsData.length, '個專案');
      
      // 去重處理，確保沒有重複的專案 ID
      const uniqueProjects = projectsData.reduce((acc: any[], project: any) => {
        const exists = acc.find(p => p.id === project.id);
        if (!exists) {
          acc.push(project);
        } else {
          console.warn('發現重複專案，已跳過:', project.id, project.name);
        }
        return acc;
      }, []);
      
      setProjects(uniqueProjects);
      setLoading(false);
    });
    
    // 設置實時監聽排放記錄
    const unsubscribeEmissions = firebaseService.subscribeToEmissionRecords((emissionsData) => {
      console.log('📡 接收到排放記錄更新:', emissionsData.length, '條記錄');
      setEmissionRecords(emissionsData);
    });

    // 清理函數
    return () => {
      console.log('🔌 取消專案和排放記錄的實時監聽');
      unsubscribeProjects();
      unsubscribeEmissions();
    };
  }, []);

  // 計算專案排放摘要
  const getProjectEmissionSummary = (projectId: string) => {
    const projectEmissions = emissionRecords.filter(record => record.projectId === projectId);
    const totalEmissions = projectEmissions.reduce((sum, record) => sum + (record.amount || 0), 0);
    return {
      total: totalEmissions,
      count: projectEmissions.length,
    };
  };

  // 處理新增專案
  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  // 處理編輯專案
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  // 處理保存專案
  const handleSaveProject = async (savedProject: any) => {
    try {
      if (editingProject) {
        // 更新專案 - 直接使用從 Modal 返回的完整專案數據
        setProjects(prev => prev.map(p => p.id === editingProject.id ? savedProject : p));
      } else {
        // 新增專案 - 檢查是否已存在，避免重複添加
        setProjects(prev => {
          const exists = prev.find(p => p.id === savedProject.id);
          if (exists) {
            console.warn('專案已存在，更新而非新增:', savedProject.id);
            return prev.map(p => p.id === savedProject.id ? savedProject : p);
          }
          return [savedProject, ...prev];
        });
      }
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('保存專案失敗:', error);
    }
    };

  // 處理刪除專案
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('確定要刪除這個專案嗎？這個操作無法撤銷。')) {
      try {
        await firebaseService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        console.error('刪除專案失敗:', error);
      }
    }
  };

  // 過濾專案
  const filteredProjects = projects.filter(project => {
    if (selectedStatus === 'all') return true;
    return project.status === selectedStatus;
  });

  // 狀態配置
  const statusConfig = {
    planning: { 
      label: '規劃中', 
      color: colors.warning, 
      icon: ClockIcon,
      bgColor: `${colors.warning}15` 
    },
    active: { 
      label: '進行中', 
      color: colors.primary, 
      icon: PlayIcon,
      bgColor: `${colors.primary}15` 
    },
    completed: { 
      label: '已完成', 
      color: colors.success, 
      icon: CheckCircleIcon,
      bgColor: `${colors.success}15` 
    },
    'on-hold': { 
      label: '暫停', 
      color: colors.error, 
      icon: PauseIcon,
      bgColor: `${colors.error}15` 
    },
  };

  // 過濾選項
  const filterOptions = [
    { value: 'all', label: '全部專案', count: projects.length },
    { value: 'planning', label: '規劃中', count: projects.filter(p => p.status === 'planning').length },
    { value: 'active', label: '進行中', count: projects.filter(p => p.status === 'active').length },
    { value: 'completed', label: '已完成', count: projects.filter(p => p.status === 'completed').length },
    { value: 'on-hold', label: '暫停', count: projects.filter(p => p.status === 'on-hold').length },
  ];

  // 清理重複專案的工具函數
  const cleanupDuplicateProjects = async () => {
    try {
      const projectsData = await firebaseService.getProjects();
      const seenIds = new Set<string>();
      const duplicates: Project[] = [];
      
      for (const project of projectsData) {
        if (seenIds.has(project.id)) {
          duplicates.push(project);
        } else {
          seenIds.add(project.id);
        }
      }
      
      if (duplicates.length > 0) {
        console.warn(`發現 ${duplicates.length} 個重複專案:`, duplicates);
        // 可以選擇自動刪除重複項
        // for (const duplicate of duplicates) {
        //   await firebaseService.deleteProject(duplicate.id);
        // }
      }
    } catch (error) {
      console.error('清理重複專案失敗:', error);
    }
  };

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
          載入專案數據...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      color: colors.text,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* 頁面標題和操作 */}
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
            專案管理
          </h1>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            margin: 0,
          }}>
            管理您的影視製作專案和碳足跡追蹤
          </p>
          </div>
        
        <button 
          onClick={handleCreateProject}
          style={{
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
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 20px ${colors.primary}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}30`;
        }}>
          <PlusIcon size={18} />
          新增專案
        </button>
          </div>

      {/* 過濾和搜尋區域 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        background: colors.card,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
      }}>
        {/* 狀態過濾 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flex: 1,
        }}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: `1px solid ${selectedStatus === option.value ? colors.primary : colors.border}`,
                background: selectedStatus === option.value 
                  ? `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`
                  : colors.background,
                color: selectedStatus === option.value ? colors.primary : colors.textSecondary,
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setSelectedStatus(option.value)}
              onMouseEnter={(e) => {
                if (selectedStatus !== option.value) {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.color = colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedStatus !== option.value) {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
            >
              {option.label}
              <span style={{
                background: selectedStatus === option.value ? colors.primary : colors.textMuted,
                color: selectedStatus === option.value ? 'white' : colors.background,
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                minWidth: '18px',
                textAlign: 'center',
              }}>
                {option.count}
              </span>
            </button>
          ))}
        </div>

        {/* 搜尋框 */}
        <div style={{
          position: 'relative',
          minWidth: '280px',
        }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}>
            <SearchIcon size={18} color={colors.textMuted} />
          </div>
          <input
            type="text"
            placeholder="搜尋專案名稱..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              background: colors.background,
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* 專案列表 */}
      {filteredProjects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: colors.card,
          borderRadius: '16px',
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `${colors.primary}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <ProjectIcon size={40} color={colors.primary} />
              </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 8px 0',
          }}>
            {selectedStatus === 'all' ? '尚無專案' : `無${filterOptions.find(o => o.value === selectedStatus)?.label}專案`}
          </h3>
          <p style={{
            fontSize: '16px',
            color: colors.textMuted,
            margin: '0 0 24px 0',
            lineHeight: '24px',
          }}>
            {selectedStatus === 'all' 
              ? '開始創建您的第一個影視專案，追蹤碳足跡數據'
              : '切換到其他狀態查看專案，或創建新專案'
            }
          </p>
          <button style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
            <PlusIcon size={16} />
            創建新專案
              </button>
            </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px',
        }}>
          {filteredProjects.map((project) => {
            const emissionSummary = getProjectEmissionSummary(project.id);
            const statusInfo = statusConfig[project.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo?.icon || ClockIcon;
            
            return (
              <div
                key={project.id}
                style={{
                  background: colors.card,
                  borderRadius: '16px',
                  padding: '24px',
                  border: `1px solid ${colors.border}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 12px 30px rgba(0, 0, 0, 0.2)`;
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                {/* 頂部光效 */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${statusInfo?.color || colors.primary}, transparent)`,
                }}></div>

                {/* 專案標題和狀態 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: colors.text,
                      margin: '0 0 8px 0',
                      lineHeight: '24px',
                    }}>
                      {project.name}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: colors.textMuted,
                      margin: 0,
                      lineHeight: '20px',
                    }}>
                      {project.description || '暫無描述'}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginLeft: '16px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: statusInfo?.bgColor,
                      border: `1px solid ${statusInfo?.color}30`,
                    }}>
                      <StatusIcon size={14} color={statusInfo?.color} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: statusInfo?.color,
                      }}>
                        {statusInfo?.label}
                      </span>
          </div>
          
                    <button style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      background: colors.background,
                      color: colors.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.cardHover;
                      e.currentTarget.style.color = colors.text;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.background;
                      e.currentTarget.style.color = colors.textMuted;
                    }}>
                      <MoreVerticalIcon size={16} />
                    </button>
                  </div>
            </div>
            
                {/* 專案詳情 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: colors.textSecondary,
                  }}>
                    <CalendarIcon size={14} color={colors.textMuted} />
                    <span>開始: {project.startDate ? new Date(project.startDate).toLocaleDateString('zh-TW') : 'N/A'}</span>
        </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: colors.textSecondary,
                  }}>
                    <DollarSignIcon size={14} color={colors.textMuted} />
                    <span>預算: ${project.budget?.toLocaleString() || 'N/A'}</span>
          </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: colors.textSecondary,
                  }}>
                    <UsersIcon size={14} color={colors.textMuted} />
                    <span>團隊: {0} 人</span>
          </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: colors.textSecondary,
                  }}>
                    <TrendingUpIcon size={14} color={colors.textMuted} />
                    <span>記錄: {emissionSummary.count} 筆</span>
        </div>
      </div>

                {/* 排放摘要 */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: colors.background,
                  border: `1px solid ${colors.border}`,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: colors.textSecondary,
                    }}>
                      總碳排放量
                    </span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: colors.text,
                    }}>
                      {emissionSummary.total.toFixed(1)} kg CO₂
                    </span>
        </div>

                  {/* 進度條（可以根據目標顯示） */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: colors.border,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: '65%', // 這裡可以根據實際進度計算
                      height: '100%',
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
                      borderRadius: '3px',
                    }}></div>
            </div>
          </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 專案表單模態框 */}
      <ProjectFormModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject as any}
      />
    </div>
  );
};

export default Projects; 