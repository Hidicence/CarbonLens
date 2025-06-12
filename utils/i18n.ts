import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 中文翻譯
const zhTranslations = {
  // 通用
  'analytics': '數據分析',
  'home': '首頁',
  'settings': '設置',
  'projects': '專案',
  'categories': '類別',
  'stages': '階段',
  'overview': '概覽',
  
  // 分析頁面
  'total_emissions': '總碳排放量',
  'recent_record': '最近記錄',
  'monthly_trend': '月度排放趨勢',
  'category_distribution': '排放類別分佈',
  'project_comparison': '專案排放比較',
  'stage_analysis': '製作階段分析',
  'monthly_chart_subtitle': '過去6個月的碳排放量變化',
  'category_chart_subtitle': '各類別佔總排放量的比例',
  'project_chart_subtitle': '各專案的碳排放量對比',
  'view_all': '查看全部',
  
  // 階段
  'pre-production': '前期製作',
  'production': '拍攝製作',
  'post-production': '後期製作',
};

// 初始化i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: {
        translation: zhTranslations
      }
    },
    lng: 'zh',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 