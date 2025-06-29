import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SimpleLoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('請輸入電子郵件和密碼');
      return;
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      console.error('認證失敗:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google登入失敗:', error);
    }
  };

  const fillTestCredentials = () => {
    setEmail('demo@carbonlens.com');
    setPassword('demo123456');
  };

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

  // 專業圖標組件
  const CameraIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );

  const FlaskIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6l-1 9h-4l-1-9Z"/>
      <path d="m6 14 3-9"/>
      <path d="m18 14-3-9"/>
      <path d="M6 14h12v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"/>
    </svg>
  );

  const MailIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-10 5L2 7"/>
    </svg>
  );

  const LockIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );

  const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  );

  const GoogleIcon = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const UserIcon = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  const ZapIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
    </svg>
  );

  const ArrowRightIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 20% 80%, ${colors.primary}15 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${colors.accent}15 0%, transparent 50%),
        linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundLight} 100%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'auto',
    }}>
      {/* 裝飾背景元素 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `${colors.primary}10`,
          filter: 'blur(40px)',
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `${colors.accent}10`,
          filter: 'blur(30px)',
        }}></div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '520px',
        zIndex: 10,
        position: 'relative',
      }}>
        {/* 頭部區域 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          <div style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            boxShadow: `
              0 20px 40px ${colors.primary}30,
              0 0 0 1px ${colors.primary}20,
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          }}>
            <CameraIcon size={40} color="white" />
          </div>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            background: `linear-gradient(135deg, ${colors.text}, ${colors.textSecondary})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
            letterSpacing: '-1px',
          }}>CarbonLens</h1>
          <p style={{
            fontSize: '18px',
            color: colors.textSecondary,
            lineHeight: '28px',
            maxWidth: '400px',
            margin: '0 auto',
            fontWeight: '400',
          }}>
            專為影視製作行業設計的智慧碳足跡追蹤與管理平台
          </p>
        </div>

        {/* 登入卡片 */}
        <div style={{
          backgroundColor: colors.card,
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          border: `1px solid ${colors.border}`,
          boxShadow: `
            0 32px 64px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 頂部光效 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }}></div>
          
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '8px',
            }}>
              {isLogin ? '歡迎回來' : '創建新帳戶'}
            </h2>
            <p style={{
              fontSize: '16px',
              color: colors.textSecondary,
              lineHeight: '24px',
            }}>
              {isLogin ? '請登入您的帳戶以繼續使用' : '註冊新帳戶開始您的碳足跡管理之旅'}
            </p>
          </div>
          
          {/* 測試帳號提示 */}
          {isLogin && (
            <div style={{
              background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}10)`,
              border: `1px solid ${colors.primary}40`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <FlaskIcon size={16} color={colors.primary} />
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.primary,
                }}>測試登入資訊</span>
              </div>
              <div style={{
                fontSize: '14px',
                color: colors.text,
                lineHeight: '20px',
                marginBottom: '16px',
              }}>
                <strong>電子郵件:</strong> demo@carbonlens.com<br/>
                <strong>密碼:</strong> demo123456<br/>
                <em>或使用 Google 登入進行快速體驗</em>
              </div>
              <button 
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`,
                  color: colors.primary,
                  border: `1px solid ${colors.primary}30`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={fillTestCredentials}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary}30, ${colors.primary}20)`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <ZapIcon size={12} color={colors.primary} />
                快速填入
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* 電子郵件輸入 */}
            <div style={{ position: 'relative' }}>
              <div 
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: colors.background,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '14px',
                  padding: '16px 20px',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{
                  marginRight: '14px',
                  color: colors.textMuted,
                  transition: 'color 0.3s ease',
                }}>
                  <MailIcon size={20} />
                </span>
                <input
                  type="email"
                  placeholder="輸入您的電子郵件"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: colors.text,
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    fontWeight: '400',
                  }}
                  required
                />
              </div>
            </div>

            {/* 密碼輸入 */}
            <div style={{ position: 'relative' }}>
              <div 
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: colors.background,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '14px',
                  padding: '16px 20px',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{
                  marginRight: '14px',
                  color: colors.textMuted,
                  transition: 'color 0.3s ease',
                }}>
                  <LockIcon size={20} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="輸入您的密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: colors.text,
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    fontWeight: '400',
                  }}
                  required
                />
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* 選項行 */}
            {isLogin && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '24px 0',
              }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '10px',
                  }}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: `2px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    fontSize: '12px',
                    fontWeight: '600',
                    ...(rememberMe ? {
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                      borderColor: colors.primary,
                      color: 'white',
                      boxShadow: `0 4px 12px ${colors.primary}40`,
                    } : {})
                  }}>
                    {rememberMe && '✓'}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    fontWeight: '500',
                  }}>記住我</span>
                </div>
                <a 
                  href="#" 
                  style={{
                    fontSize: '14px',
                    color: colors.primary,
                    textDecoration: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}
                >
                  忘記密碼？
                </a>
              </div>
            )}

            {/* 主要按鈕 */}
            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '14px',
                border: 'none',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 8px 25px ${colors.primary}40`,
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 12px 35px ${colors.primary}50`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${colors.primary}40`;
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  處理中...
                </>
              ) : (
                <>
                  {isLogin ? '登入帳戶' : '創建帳戶'}
                  <ArrowRightIcon size={16} />
                </>
              )}
            </button>
          </form>

          {/* 分隔線 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '28px 0',
            gap: '16px',
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)`,
            }}></div>
            <span style={{
              fontSize: '14px',
              color: colors.textMuted,
              fontWeight: '500',
              padding: '0 8px',
            }}>或</span>
            <div style={{
              flex: 1,
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)`,
            }}></div>
          </div>
          
          {/* 社交登入 */}
          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            <button 
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.background,
                color: colors.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.cardHover;
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background;
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <GoogleIcon size={18} />
              Google 登入
            </button>
            <button 
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.background,
                color: colors.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => {
                setEmail('guest@example.com');
                setPassword('guest123');
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.cardHover;
                e.currentTarget.style.borderColor = colors.accent;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background;
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <UserIcon size={18} />
              訪客體驗
            </button>
          </div>

          {/* 模式切換 */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            padding: '20px',
            borderTop: `1px solid ${colors.border}`,
          }}>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              marginBottom: '8px',
            }}>
              {isLogin ? '還沒有帳號？' : '已經有帳號了？'}
            </p>
            <a 
              href="#" 
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'color 0.3s ease',
              }}
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(!isLogin);
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryLight}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}
            >
              {isLogin ? '立即註冊' : '返回登入'}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimpleLoginPage; 