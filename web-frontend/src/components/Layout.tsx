import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

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
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  const menuItems = [
    { path: '/', label: '儀表板', icon: 'dashboard', description: '總覽與統計' },
    { path: '/projects', label: '專案管理', icon: 'project', description: '影視專案' },
    { path: '/emissions', label: '排放記錄', icon: 'emission', description: '碳排放數據' },
    { path: '/shooting-days', label: '拍攝日記錄', icon: 'camera', description: '按組別記錄' },
    { path: '/statistics', label: '統計分析', icon: 'stats', description: '數據分析' },
    { path: '/settings', label: '系統設定', icon: 'settings', description: '帳戶設定' },
  ];

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => 
      item.path === location.pathname || 
      (item.path === '/' && location.pathname === '/dashboard')
    );
    return currentItem ? currentItem.label : '儀表板';
  };

  const getPageDescription = () => {
    const currentItem = menuItems.find(item => 
      item.path === location.pathname || 
      (item.path === '/' && location.pathname === '/dashboard')
    );
    return currentItem ? currentItem.description : '總覽與統計';
  };

  // 專業圖標組件
  const DashboardIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  );

  const ProjectIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );

  const EmissionIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );

  const StatsIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
    </svg>
  );

  const SettingsIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );

  const LogoutIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  );

  const UserIcon = ({ size = 32, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  const CameraIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );

  const Bell = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  );

  const Search = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );

  const ChevronLeftIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );

  const ChevronRightIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
    }}>
      {/* 側邊欄 */}
      <div style={{
        width: sidebarExpanded ? '300px' : '80px',
        backgroundColor: colors.card,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* 側邊欄頭部 */}
        <div style={{
          padding: sidebarExpanded ? '32px 24px' : '32px 16px',
          borderBottom: `1px solid ${colors.border}`,
          position: 'relative',
        }}>
          {/* Logo區域 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: sidebarExpanded ? '24px' : '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }} onClick={() => navigate('/')}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: `0 8px 25px ${colors.primary}30`,
              position: 'relative',
            }}>
              <CameraIcon size={20} color="white" />
            </div>
            {sidebarExpanded && (
              <div style={{
                flex: 1,
                opacity: sidebarExpanded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: '4px',
                  letterSpacing: '-0.5px',
                }}>CarbonLens</h1>
                <p style={{
                  fontSize: '12px',
                  color: colors.textMuted,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Web Dashboard</p>
              </div>
            )}
          </div>
          
          {/* 收縮按鈕 */}
          <button
            style={{
              position: 'absolute',
              top: '24px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.background,
              color: colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.cardHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.background;
              e.currentTarget.style.color = colors.textSecondary;
            }}
          >
                          {sidebarExpanded ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
          </button>

          {/* 用戶信息 */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: `${colors.primary}10`,
              borderRadius: '16px',
              border: `1px solid ${colors.primary}20`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                flexShrink: 0,
              }}>
                <UserIcon size={20} color="white" />
              </div>
              {sidebarExpanded && (
                <div style={{
                  flex: 1,
                  minWidth: 0,
                  opacity: sidebarExpanded ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.displayName || '使用者'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textMuted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.email}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

        {/* 導航區域 */}
        <nav style={{
          flex: 1,
          padding: sidebarExpanded ? '32px 16px' : '32px 12px',
          overflowY: 'auto',
        }}>
          {sidebarExpanded && (
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '20px',
              paddingLeft: '12px',
            }}>主要功能</div>
          )}
          
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path === '/' && location.pathname === '/dashboard');
              
                              const IconComponent = item.icon === 'dashboard' ? DashboardIcon : item.icon === 'project' ? ProjectIcon : item.icon === 'emission' ? EmissionIcon : item.icon === 'camera' ? CameraIcon : item.icon === 'stats' ? StatsIcon : SettingsIcon;
              
              return (
                <li key={item.path}>
                  <a
                    href="#"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: sidebarExpanded ? '16px' : '16px 12px',
                      borderRadius: '14px',
                      color: isActive ? 'white' : colors.textSecondary,
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      background: isActive 
                        ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
                        : 'transparent',
                      boxShadow: isActive 
                        ? `0 8px 25px ${colors.primary}30`
                        : 'none',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = `${colors.border}40`;
                        e.currentTarget.style.color = colors.text;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = colors.textSecondary;
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    {/* 活動指示器 */}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '24px',
                        background: 'white',
                        borderRadius: '0 2px 2px 0',
                      }}></div>
                    )}
                    
                    <span style={{
                      fontSize: '20px',
                      width: '24px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}>
                      <IconComponent size={20} />
                    </span>
                    
                    {sidebarExpanded && (
                      <div style={{
                        flex: 1,
                        opacity: sidebarExpanded ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                      }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          marginBottom: '2px',
                        }}>{item.label}</div>
                        <div style={{
                          fontSize: '12px',
                          opacity: 0.8,
                          fontWeight: '400',
                        }}>{item.description}</div>
                      </div>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
          </nav>

        {/* 側邊欄底部 */}
        <div style={{
          padding: sidebarExpanded ? '24px 16px' : '24px 12px',
          borderTop: `1px solid ${colors.border}`,
        }}>
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              gap: '12px',
              padding: sidebarExpanded ? '16px' : '16px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '14px',
              color: colors.textSecondary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={handleSignOut}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${colors.error}20`;
              e.currentTarget.style.borderColor = colors.error;
              e.currentTarget.style.color = colors.error;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.color = colors.textSecondary;
            }}
          >
            <span style={{ fontSize: '18px' }}>
              <LogoutIcon size={16} />
            </span>
            {sidebarExpanded && <span>登出</span>}
          </button>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div style={{
        flex: 1,
        marginLeft: sidebarExpanded ? '300px' : '80px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
      }}>
        {/* 頂部欄 */}
        <header style={{
          height: '100px',
          backgroundColor: colors.card,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: colors.text,
              marginBottom: '4px',
              letterSpacing: '-0.5px',
            }}>{getPageTitle()}</h1>
            <p style={{
              fontSize: '16px',
              color: colors.textSecondary,
              fontWeight: '500',
            }}>{getPageDescription()}</p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            {/* 狀態指示器 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: `${colors.success}15`,
              border: `1px solid ${colors.success}30`,
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.success,
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.success,
                animation: 'pulse 2s infinite',
              }}></div>
              已連線
            </div>

            {/* 快速操作 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <button style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.background,
                color: colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.cardHover;
                e.currentTarget.style.color = colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background;
                e.currentTarget.style.color = colors.textSecondary;
              }}>
                <Bell size={18} />
            </button>

              <button style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.background,
                color: colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.cardHover;
                e.currentTarget.style.color = colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background;
                e.currentTarget.style.color = colors.textSecondary;
              }}>
                <Search size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* 內容區域 */}
        <main style={{
          flex: 1,
          padding: '40px',
          overflow: 'auto',
          background: `
            radial-gradient(circle at 20% 80%, ${colors.primary}05 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${colors.accent}05 0%, transparent 50%)
          `,
        }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout; 