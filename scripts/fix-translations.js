const fs = require('fs');
const path = require('path');

// 需要添加翻譯鍵的硬編碼字符串映射
const translations = {
  // 狀態相關
  '規劃中': 'status.planning',
  '進行中': 'status.active', 
  '已完成': 'status.completed',
  '暫停中': 'status.on-hold',
  '未知狀態': 'status.unknown',
  '未設定': 'common.not.set',
  '未指定': 'common.not.specified',
  
  // 階段相關
  '前期製作': 'stage.pre-production',
  '拍攝階段': 'stage.production',
  '後期製作': 'stage.post-production',
  
  // 月份
  '一月': 'date.month.jan',
  '二月': 'date.month.feb',
  '三月': 'date.month.mar',
  '四月': 'date.month.apr',
  '五月': 'date.month.may',
  '六月': 'date.month.jun',
  '七月': 'date.month.jul',
  '八月': 'date.month.aug',
  '九月': 'date.month.sep',
  '十月': 'date.month.oct',
  '十一月': 'date.month.nov',
  '十二月': 'date.month.dec',
  
  // 星期
  '日': 'date.day.sun',
  '一': 'date.day.mon',
  '二': 'date.day.tue', 
  '三': 'date.day.wed',
  '四': 'date.day.thu',
  '五': 'date.day.fri',
  '六': 'date.day.sat',
  
  // 角色相關
  '擁有者': 'role.owner',
  '管理員': 'role.admin',
  '編輯者': 'role.editor',
  '貢獻者': 'role.contributor',
  '檢視者': 'role.viewer',
  '未知': 'common.unknown',
  
  // 權限相關
  '專案權限': 'permissions.project',
  '排放記錄權限': 'permissions.emissions',
  '數據與報告權限': 'permissions.data.reports',
  '其他權限': 'permissions.other',
  
  // 常用按鈕
  '取消': 'common.cancel',
  '保存': 'common.save',
  '儲存': 'common.save',
  '確定': 'common.confirm',
  '新增協作者': 'collaborators.add',
  '移除協作者': 'collaborators.remove',
  '分享專案': 'projects.share',
  
  // 提示信息
  '選擇日期': 'ui.placeholder.select.date',
  '輸入姓名': 'ui.placeholder.enter.name',
  '輸入電子郵件': 'ui.placeholder.enter.email',
  
  // 工作組
  '導演組': 'crew.director',
  '攝影組': 'crew.camera',
  '燈光組': 'crew.lighting',
  '收音組': 'crew.sound',
  '梳化組': 'crew.makeup',
  '製片組': 'crew.production',
  '其他': 'common.other',
  
  // 單位
  '小時': 'unit.hour',
  '單位': 'common.unit'
};

// 需要更新translations.ts文件的新翻譯
const newTranslations = {
  // 狀態
  'status.unknown': '未知狀態',
  'common.not.set': '未設定',
  'common.not.specified': '未指定',
  
  // 日期相關
  'date.month.jan': '一月',
  'date.month.feb': '二月',
  'date.month.mar': '三月',
  'date.month.apr': '四月',
  'date.month.may': '五月',
  'date.month.jun': '六月',
  'date.month.jul': '七月',
  'date.month.aug': '八月',
  'date.month.sep': '九月',
  'date.month.oct': '十月',
  'date.month.nov': '十一月',
  'date.month.dec': '十二月',
  
  'date.day.sun': '日',
  'date.day.mon': '一',
  'date.day.tue': '二',
  'date.day.wed': '三',
  'date.day.thu': '四',
  'date.day.fri': '五',
  'date.day.sat': '六',
  
  // 角色
  'role.owner': '擁有者',
  'role.admin': '管理員',
  'role.editor': '編輯者',
  'role.contributor': '貢獻者',
  'role.viewer': '檢視者',
  
  // 權限
  'permissions.project': '專案權限',
  'permissions.emissions': '排放記錄權限',
  'permissions.data.reports': '數據與報告權限',
  'permissions.other': '其他權限',
  
  // 協作者
  'collaborators.add': '新增協作者',
  'collaborators.remove': '移除協作者',
  'projects.share': '分享專案',
  
  // 工作組
  'crew.director': '導演組',
  'crew.camera': '攝影組',
  'crew.lighting': '燈光組',
  'crew.sound': '收音組',
  'crew.makeup': '梳化組',
  'crew.production': '製片組',
  
  // 單位
  'unit.hour': '小時'
};

// 新的英文翻譯
const englishTranslations = {
  'status.unknown': 'Unknown Status',
  'common.not.set': 'Not Set',
  'common.not.specified': 'Not Specified',
  
  'date.month.jan': 'January',
  'date.month.feb': 'February',
  'date.month.mar': 'March',
  'date.month.apr': 'April',
  'date.month.may': 'May',
  'date.month.jun': 'June',
  'date.month.jul': 'July',
  'date.month.aug': 'August',
  'date.month.sep': 'September',
  'date.month.oct': 'October',
  'date.month.nov': 'November',
  'date.month.dec': 'December',
  
  'date.day.sun': 'Sun',
  'date.day.mon': 'Mon',
  'date.day.tue': 'Tue',
  'date.day.wed': 'Wed',
  'date.day.thu': 'Thu',
  'date.day.fri': 'Fri',
  'date.day.sat': 'Sat',
  
  'role.owner': 'Owner',
  'role.admin': 'Admin',
  'role.editor': 'Editor',
  'role.contributor': 'Contributor',
  'role.viewer': 'Viewer',
  
  'permissions.project': 'Project Permissions',
  'permissions.emissions': 'Emission Record Permissions',
  'permissions.data.reports': 'Data & Report Permissions',
  'permissions.other': 'Other Permissions',
  
  'collaborators.add': 'Add Collaborator',
  'collaborators.remove': 'Remove Collaborator',
  'projects.share': 'Share Project',
  
  'crew.director': 'Director',
  'crew.camera': 'Camera',
  'crew.lighting': 'Lighting',
  'crew.sound': 'Sound',
  'crew.makeup': 'Makeup',
  'crew.production': 'Production',
  
  'unit.hour': 'hour'
};

// 首先更新translations.ts文件
function updateTranslationsFile() {
  const translationsPath = path.join(__dirname, '..', 'constants', 'translations.ts');
  let content = fs.readFileSync(translationsPath, 'utf8');
  
  // 在zh部分末尾添加新的翻譯
  const zhEndPattern = /(\s+)\/\/ Analytics[\s\S]*?},(\s+)en:/;
  const match = content.match(zhEndPattern);
  
  if (match) {
    const indent = match[1];
    let newKeys = '';
    
    for (const [key, value] of Object.entries(newTranslations)) {
      newKeys += `${indent}'${key}': '${value}',\n`;
    }
    
    content = content.replace(zhEndPattern, `$1// Analytics${match[0].substring(match[0].indexOf('// Analytics') + 12, match[0].indexOf('},'))},\n${newKeys}${match[2]}en:`);
  }
  
  // 在en部分末尾添加新的翻譯
  const enEndPattern = /(en:\s*{[\s\S]*?)(\s+)(}\s*};\s*$)/;
  const enMatch = content.match(enEndPattern);
  
  if (enMatch) {
    const indent = enMatch[2];
    let newEnKeys = '';
    
    for (const [key, value] of Object.entries(englishTranslations)) {
      newEnKeys += `${indent}'${key}': '${value}',\n`;
    }
    
    content = content.replace(enEndPattern, `$1$2${newEnKeys}$2$3`);
  }
  
  fs.writeFileSync(translationsPath, content);
  console.log('✅ Updated translations.ts');
}

// 處理單個文件的翻譯替換
function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 檢查是否需要添加useTranslation導入
  const needsTranslation = Object.keys(translations).some(text => 
    content.includes(`'${text}'`) || content.includes(`"${text}"`)
  );
  
  if (needsTranslation && !content.includes('useTranslation')) {
    // 添加useTranslation導入
    if (content.includes("import { ")) {
      content = content.replace(
        /import { ([^}]+) } from ['"]@\/hooks\/useTranslation['"];?/,
        "import { useTranslation } from '@/hooks/useTranslation';"
      );
      if (!content.includes("import { useTranslation }")) {
        const importMatch = content.match(/import.*?from ['"]react['"];?\n/);
        if (importMatch) {
          content = content.replace(
            importMatch[0],
            importMatch[0] + "import { useTranslation } from '@/hooks/useTranslation';\n"
          );
        }
      }
    }
    
    // 在函數組件中添加useTranslation hook
    const functionMatch = content.match(/export default function (\w+)\([^)]*\)\s*{/);
    if (functionMatch) {
      content = content.replace(
        functionMatch[0],
        functionMatch[0] + '\n  const { t } = useTranslation();'
      );
    }
    
    modified = true;
  }
  
  // 替換硬編碼字符串
  for (const [chineseText, translationKey] of Object.entries(translations)) {
    const patterns = [
      new RegExp(`'${chineseText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'),
      new RegExp(`"${chineseText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g')
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        // 在JSX屬性中需要使用花括號
        content = content.replace(
          new RegExp(`(\\w+)\\s*=\\s*['"]${chineseText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
          `$1={t('${translationKey}')}`
        );
        
        // 普通的字符串替換
        content = content.replace(pattern, `t('${translationKey}')`);
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

// 主函數
function main() {
  console.log('🚀 開始修復翻譯...');
  
  // 更新translations.ts文件
  updateTranslationsFile();
  
  // 需要處理的文件列表
  const filesToProcess = [
    'components/StatusBadge.tsx',
    'components/ProjectCard.tsx',
    'components/CollaboratorsList.tsx',
    'components/CollaboratorPermissionsModal.tsx',
    'components/CustomDatePicker.tsx',
    'components/DatePickerField.tsx',
    'components/EmissionRecordItem.tsx',
    'constants/crews.tsx'
  ];
  
  // 處理每個文件
  filesToProcess.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    processFile(fullPath);
  });
  
  console.log('✨ 翻譯修復完成！');
}

main(); 