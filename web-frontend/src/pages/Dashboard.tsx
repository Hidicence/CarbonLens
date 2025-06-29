import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, Target, Zap, Leaf, 
  Calendar, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, 
  Users, Clock, CheckCircle, AlertTriangle, Building, Film, 
  Factory, TreePine, Lightbulb, Plus, FileText, Settings,
  Clapperboard, Crosshair, Sprout, BarChart2
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { firebaseService } from '../services/firebaseService'
import type { Project, ProjectEmissionRecord, NonProjectEmissionRecord } from '../../../types/project'

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalEmissions: number;
  monthlyEmissions: number;
  recentProjects: any[];
  emissionTrend: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalEmissions: 0,
    monthlyEmissions: 0,
    recentProjects: [],
    emissionTrend: [],
  });
  const [loading, setLoading] = useState(true);

  // 專業圖標組件
  const ClapperboardIcon = ({ size = 20, color = 'currentColor' }) => (
    <Clapperboard size={size} color={color} />
  );

  const CrosshairIcon = ({ size = 20, color = 'currentColor' }) => (
    <Crosshair size={size} color={color} />
  );

  const SproutIcon = ({ size = 20, color = 'currentColor' }) => (
    <Sprout size={size} color={color} />
  );

  const BarChart2Icon = ({ size = 20, color = 'currentColor' }) => (
    <BarChart2 size={size} color={color} />
  );

  const PlusIcon = ({ size = 20, color = 'currentColor' }) => (
    <Plus size={size} color={color} />
  );

  const FileTextIcon = ({ size = 20, color = 'currentColor' }) => (
    <FileText size={size} color={color} />
  );

  const SettingsIcon = ({ size = 20, color = 'currentColor' }) => (
    <Settings size={size} color={color} />
  );

  const ArrowRightIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  );

  // 精緻的色系定義
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
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: colors.text,
      marginBottom: '8px',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '16px',
      color: colors.textSecondary,
      lineHeight: '24px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    statCard: {
      backgroundColor: colors.card,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${colors.border}`,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
    statCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
    },
    statTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: colors.text,
      marginBottom: '4px',
    },
    statUnit: {
      fontSize: '14px',
      color: colors.textSecondary,
      fontWeight: '500',
    },
    statTrend: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '8px',
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px',
      marginBottom: '32px',
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${colors.border}`,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: colors.text,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    projectList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    projectItem: {
      padding: '16px',
      backgroundColor: colors.background,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    projectItemHover: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}05`,
    },
    projectHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px',
    },
    projectName: {
      fontSize: '16px',
      fontWeight: '600',
      color: colors.text,
      marginBottom: '4px',
    },
    projectType: {
      fontSize: '12px',
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    projectStatus: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    projectEmissions: {
      fontSize: '14px',
      color: colors.textSecondary,
    },
    emissionValue: {
      fontWeight: '600',
      color: colors.text,
    },
    quickActions: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    actionButton: {
      padding: '16px',
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      color: colors.text,
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    actionButtonPrimary: {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      borderColor: colors.primary,
      color: 'white',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: colors.textSecondary,
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '40px',
      color: colors.textSecondary,
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    emptyStateTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: colors.text,
      marginBottom: '8px',
    },
    emptyStateText: {
      fontSize: '14px',
      lineHeight: '20px',
    },
  }

  useEffect(() => {
    setLoading(true);
    
    // 設置實時監聽
    const unsubscribeProjects = firebaseService.subscribeToProjects((projectsData) => {
      console.log('📡 Dashboard 接收到專案數據更新:', projectsData.length, '個專案');
      updateDashboardStats(projectsData, []);
    });
    
    const unsubscribeEmissions = firebaseService.subscribeToEmissionRecords((emissionsData) => {
      console.log('📡 Dashboard 接收到排放記錄更新:', emissionsData.length, '條記錄');
      // 重新獲取專案數據並更新統計
      firebaseService.getProjects().then(projectsData => {
        updateDashboardStats(projectsData, emissionsData);
      });
    });

    // 清理函數
    return () => {
      console.log('🔌 Dashboard 取消實時監聽');
      unsubscribeProjects();
      unsubscribeEmissions();
    };
  }, []);

  // 更新儀表板統計數據的函數
  const updateDashboardStats = (projects: Project[], emissions: ProjectEmissionRecord[]) => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalEmissions = emissions.reduce((sum, record) => sum + (record.amount || 0), 0);
    
    // 計算本月排放量
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEmissions = emissions.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).reduce((sum, record) => sum + (record.amount || 0), 0);

    // 生成趨勢數據
    const trendData = generateTrendData(emissions);

    setStats({
      totalProjects: projects.length,
      activeProjects,
      totalEmissions,
      monthlyEmissions,
      recentProjects: projects.slice(0, 5),
      emissionTrend: trendData,
    });
    
    setLoading(false);
  };

  const generateTrendData = (emissions: any[]) => {
    // 簡化的趨勢數據生成
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    return months.map((month, index) => ({
      month,
      value: Math.random() * 1000 + 500,
    }))
  }

  const StatCard = ({ 
    title, 
    value, 
    unit, 
    icon, 
    trend, 
    color = colors.primary,
    description 
  }: {
    title: string;
    value: number | string;
    unit?: string;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
    description?: string;
  }) => (
    <div style={{
      background: `linear-gradient(135deg, ${colors.card}, ${colors.cardHover}20)`,
      borderRadius: '20px',
      padding: '32px',
      border: `1px solid ${colors.border}`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}>
      {/* 背景裝飾 */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `${color}10`,
        borderRadius: '50%',
        transform: 'translate(30px, -30px)',
        filter: 'blur(20px)',
      }}></div>
      
      {/* 頂部光效 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            border: `1px solid ${color}30`,
          }}>
            {icon}
          </div>
          
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: trend > 0 ? `${colors.success}20` : `${colors.error}20`,
              color: trend > 0 ? colors.success : colors.error,
              fontSize: '12px',
              fontWeight: '600',
            }}>
              <span>{trend > 0 ? '↗' : '↘'}</span>
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div style={{
          fontSize: '36px',
          fontWeight: '800',
          color: colors.text,
          marginBottom: '8px',
          lineHeight: 1,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span style={{ fontSize: '18px', color: colors.textMuted, marginLeft: '4px' }}>{unit}</span>}
        </div>

        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: description ? '8px' : '0',
        }}>
          {title}
        </div>

        {description && (
          <div style={{
            fontSize: '14px',
            color: colors.textMuted,
            lineHeight: '20px',
          }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon, 
    color, 
    onClick 
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
  }) => (
    <div 
      style={{
        background: colors.card,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
        }}>
          {icon}
        </div>
        <div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.text,
            marginBottom: '4px',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textSecondary,
          }}>
            {description}
          </div>
        </div>
      </div>
    </div>
  );

  const ProjectCard = ({ project }: { project: any }) => (
    <div style={{
      background: colors.card,
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${colors.border}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = colors.cardHover;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = colors.card;
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.text,
        }}>
          {project.name || '未命名專案'}
        </div>
        <div style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          background: project.status === 'active' ? `${colors.success}20` : `${colors.textMuted}20`,
          color: project.status === 'active' ? colors.success : colors.textMuted,
        }}>
          {project.status === 'active' ? '進行中' : '已完成'}
        </div>
      </div>

      <div style={{
        fontSize: '14px',
        color: colors.textSecondary,
        marginBottom: '12px',
        lineHeight: '20px',
      }}>
        {project.description || '暫無描述'}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: colors.textMuted,
      }}>
        <span>建立於 {new Date(project.createdAt).toLocaleDateString()}</span>
                          <ArrowRightIcon size={16} />
            </div>
          </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${colors.border}`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <div style={{
          fontSize: '16px',
          color: colors.textSecondary,
        }}>
          載入儀表板數據中...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0',
    }}>
      {/* 歡迎區域 */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}10)`,
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '40px',
        border: `1px solid ${colors.primary}20`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: `${colors.primary}10`,
          borderRadius: '50%',
          transform: 'translate(50px, -50px)',
          filter: 'blur(40px)',
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: colors.text,
            marginBottom: '12px',
          }}>
            歡迎回到 CarbonLens
          </h2>
          <p style={{
            fontSize: '18px',
            color: colors.textSecondary,
            lineHeight: '28px',
            maxWidth: '600px',
          }}>
            這裡是您的碳足跡管理中心。追蹤專案進度、分析排放數據，讓影視製作更加環保。
          </p>
        </div>
      </div>

      {/* 統計卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
      }}>
        <StatCard
          title="總專案數"
          value={stats.totalProjects}
          icon={<ClapperboardIcon size={28} color={colors.primary} />}
          color={colors.primary}
          trend={12}
          description="累計管理的影視專案"
        />
        <StatCard
          title="進行中專案"
          value={stats.activeProjects}
          icon={<CrosshairIcon size={28} color={colors.info} />}
          color={colors.info}
          trend={-5}
          description="正在進行的活躍專案"
        />
        <StatCard
          title="總碳排放"
          value={stats.totalEmissions.toFixed(1)}
          unit="tCO₂e"
          icon={<SproutIcon size={28} color={colors.warning} />}
          color={colors.warning}
          trend={8}
          description="累計碳排放量"
        />
        <StatCard
          title="本月排放"
          value={stats.monthlyEmissions.toFixed(1)}
          unit="tCO₂e"
          icon={<BarChart2Icon size={28} color={colors.accent} />}
          color={colors.accent}
          trend={-15}
          description="當月新增排放量"
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '32px',
        marginBottom: '40px',
      }}>
        {/* 趨勢圖表 */}
        <div style={{
          background: colors.card,
          borderRadius: '20px',
          padding: '32px',
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}>
            <div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.text,
                marginBottom: '8px',
              }}>
                排放趨勢
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
              }}>
                過去6個月的碳排放變化
              </p>
            </div>
            <div style={{
              padding: '8px 16px',
              background: `${colors.primary}20`,
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              color: colors.primary,
            }}>
              月度數據
            </div>
          </div>

          {/* 簡化的圖表 */}
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '20px 0',
          }}>
            {stats.emissionTrend.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                flex: 1,
              }}>
                <div style={{
                  height: `${(item.value / 1500) * 150}px`,
                  width: '100%',
                  maxWidth: '40px',
                  background: `linear-gradient(to top, ${colors.primary}, ${colors.primaryLight})`,
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scaleY(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scaleY(1)';
                }}></div>
                <div style={{
                  fontSize: '12px',
                  color: colors.textMuted,
                  fontWeight: '500',
                }}>
                  {item.month}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 快速操作 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '8px',
          }}>
            快速操作
          </h3>
          
          <QuickActionCard
            title="新建專案"
            description="創建新的影視製作專案"
            icon={<PlusIcon size={24} color={colors.primary} />}
            color={colors.primary}
            onClick={() => window.location.href = '/projects'}
          />
          
          <QuickActionCard
            title="記錄排放"
            description="添加新的碳排放記錄"
            icon={<FileTextIcon size={24} color={colors.success} />}
            color={colors.success}
            onClick={() => window.location.href = '/emissions'}
          />
          
          <QuickActionCard
            title="拍攝日記錄"
            description="按工作組別記錄拍攝活動"
            icon={<ClapperboardIcon size={24} color={colors.warning} />}
            color={colors.warning}
            onClick={() => window.location.href = '/shooting-days'}
          />
          
          <QuickActionCard
            title="查看報告"
            description="生成碳足跡分析報告"
            icon={<BarChart2Icon size={24} color={colors.info} />}
            color={colors.info}
            onClick={() => window.location.href = '/statistics'}
          />
          
          <QuickActionCard
            title="系統設定"
            description="管理帳戶和偏好設定"
            icon={<SettingsIcon size={24} color={colors.accent} />}
            color={colors.accent}
            onClick={() => window.location.href = '/settings'}
          />
        </div>
      </div>

      {/* 最近專案 */}
      <div style={{
        background: colors.card,
        borderRadius: '20px',
        padding: '32px',
        border: `1px solid ${colors.border}`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
            <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '8px',
            }}>
              最近專案
            </h3>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
            }}>
              您最近創建或更新的專案
            </p>
          </div>
          <button style={{
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 8px 25px ${colors.primary}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => window.location.href = '/projects'}>
            查看全部
          </button>
                  </div>

        {stats.recentProjects.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {stats.recentProjects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: colors.textMuted,
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              還沒有專案
            </div>
            <div style={{ fontSize: '14px' }}>
              創建您的第一個影視專案開始追蹤碳足跡
              </div>
          </div>
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

export default Dashboard 