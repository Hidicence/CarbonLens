// 簡單的多語言支持Hook，可以在以後擴展為更複雜的實現
export function 使用多語言() {
  // 簡單的翻譯函數，返回給定key的翻譯或key本身
  const t = (key: string): string => {
    // 簡單的翻譯映射，實際應用中可能會從某個存儲或配置中獲取
    const translations: Record<string, string> = {
      'app.tagline': '專為影視製作行業設計的碳足跡追蹤與管理工具',
      'auth.welcome': '歡迎使用',
      'auth.login': '登入',
      'auth.email': '電子郵件',
      'auth.password': '密碼',
      'auth.remember.me': '記住我',
      'auth.forgot.password': '忘記密碼？',
      'auth.or': '或者',
      'auth.social.login.error': '社交登入失敗',
      'auth.no.account': '還沒有帳號？',
      'auth.register': '註冊',
      'auth.continue.guest': '以訪客身份繼續',
      'auth.guest.login.error': '訪客登入失敗',
      'auth.invalid.credentials': '無效的登入憑證',
      'common.error': '錯誤',
      'common.required': '必填'
    };
    
    // 返回翻譯或鍵名本身（如果沒有找到翻譯）
    return translations[key] || key;
  };
  
  return t;
} 