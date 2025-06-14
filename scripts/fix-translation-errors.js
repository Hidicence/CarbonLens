const fs = require('fs');
const path = require('path');

// 全面修復翻譯錯誤的腳本
class ComprehensiveTranslationFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
  }

  // 檢查文件是否使用了翻譯函數但缺少導入
  needsTranslationImport(content) {
    const hasTranslationUsage = /\bt\(['"]/g.test(content);
    const hasImport = /import.*useTranslation.*from/g.test(content);
    return hasTranslationUsage && !hasImport;
  }

  // 添加翻譯導入
  addTranslationImport(content) {
    // 查找是否已有其他 hook 導入
    const existingHookImport = content.match(/import\s*\{[^}]*\}\s*from\s*['"]@\/hooks\/[^'"]*['"]/);
    
    if (existingHookImport) {
      // 在現有 hook 導入中添加 useTranslation
      const importLine = existingHookImport[0];
      if (!importLine.includes('useTranslation')) {
        const newImportLine = importLine.replace(/\{([^}]*)\}/, (match, hooks) => {
          const hooksList = hooks.split(',').map(h => h.trim()).filter(h => h);
          hooksList.push('useTranslation');
          return `{ ${hooksList.join(', ')} }`;
        });
        return content.replace(existingHookImport[0], newImportLine);
      }
    } else {
      // 添加新的導入行
      const importPosition = content.indexOf('import React') !== -1 
        ? content.indexOf('\n', content.indexOf('import React')) + 1
        : content.indexOf('import') !== -1 
        ? content.indexOf('import')
        : 0;
      
      const importLine = "import { useTranslation } from '@/hooks/useTranslation';\n";
      return content.slice(0, importPosition) + importLine + content.slice(importPosition);
    }
    
    return content;
  }

  // 添加翻譯 hook 使用
  addTranslationHook(content) {
    // 查找組件函數的開始
    const componentMatch = content.match(/(const\s+\w+.*?=.*?\([^)]*\)\s*=>\s*\{)/);
    if (componentMatch) {
      const insertPosition = componentMatch.index + componentMatch[0].length;
      const hookLine = "\n  const { t } = useTranslation();\n";
      return content.slice(0, insertPosition) + hookLine + content.slice(insertPosition);
    }
    
    return content;
  }

  // 修復具體的翻譯語法錯誤
  fixTranslationSyntax(content) {
    let fixed = content;
    
    // 修復常見的語法問題
    const fixes = [
      // 修復三元運算符中的錯誤
      { pattern: /\?\s*\{t\('([^']+)'\)\}/g, replacement: "? t('$1')" },
      { pattern: /:\s*\{t\('([^']+)'\)\}/g, replacement: ": t('$1')" },
      
      // 修復對象屬性中的錯誤
      { pattern: /title:\s*\{t\('([^']+)'\)\}/g, replacement: "title: t('$1')" },
      { pattern: /placeholder:\s*\{t\('([^']+)'\)\}/g, replacement: "placeholder: t('$1')" },
      { pattern: /name:\s*\{t\('([^']+)'\)\}/g, replacement: "name: t('$1')" },
      
      // 修復陣列中的錯誤
      { pattern: /\[\s*\{t\('([^']+)'\)\}/g, replacement: "[t('$1')" },
      { pattern: /,\s*\{t\('([^']+)'\)\}/g, replacement: ", t('$1')" },
    ];
    
    fixes.forEach(({ pattern, replacement }) => {
      fixed = fixed.replace(pattern, replacement);
    });
    
    return fixed;
  }

  // 修復特定文件的問題
  fixSpecificFiles() {
    // 修復 CustomDatePicker.tsx
    this.fixCustomDatePicker();
    
    // 修復 constants/crews.tsx
    this.fixCrewsConstant();
    
    // 修復其他問題文件
    this.fixCollaboratorComponents();
  }

  fixCustomDatePicker() {
    const filePath = 'components/CustomDatePicker.tsx';
    if (!fs.existsSync(filePath)) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      let fixed = content;
      
      // 替換所有 t() 調用為硬編碼字符串
      const monthReplacements = {
        "t('date.month.jan')": "'一月'",
        "t('date.month.feb')": "'二月'",
        "t('date.month.mar')": "'三月'",
        "t('date.month.apr')": "'四月'",
        "t('date.month.may')": "'五月'",
        "t('date.month.jun')": "'六月'",
        "t('date.month.jul')": "'七月'",
        "t('date.month.aug')": "'八月'",
        "t('date.month.sep')": "'九月'",
        "t('date.month.oct')": "'十月'",
        "t('date.month.nov')": "'十一月'",
        "t('date.month.dec')": "'十二月'"
      };
      
      const dayReplacements = {
        "t('date.day.sun')": "'日'",
        "t('date.day.mon')": "'一'",
        "t('date.day.tue')": "'二'",
        "t('date.day.wed')": "'三'",
        "t('date.day.thu')": "'四'",
        "t('date.day.fri')": "'五'",
        "t('date.day.sat')": "'六'"
      };
      
      Object.entries({ ...monthReplacements, ...dayReplacements }).forEach(([search, replace]) => {
        fixed = fixed.replace(new RegExp(search.replace(/[()]/g, '\\$&'), 'g'), replace);
      });
      
      // 修復 days 陣列類型問題
      fixed = fixed.replace(
        /const days: never\[\] = \[\];/g,
        'const days: Array<{ day: number; isCurrentMonth: boolean; isSelected?: boolean; isDisabled?: boolean }> = [];'
      );
      
      fs.writeFileSync(filePath, fixed);
      console.log(`✅ 修復 ${filePath}`);
      
    } catch (error) {
      console.error(`❌ 修復 ${filePath} 失敗: ${error.message}`);
    }
  }

  fixCrewsConstant() {
    const filePath = 'constants/crews.tsx';
    if (!fs.existsSync(filePath)) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 確保文件有翻譯導入
      let fixed = this.addTranslationImport(content);
      
      // 將常數移到函數內部或使用硬編碼字符串
      const crewReplacements = {
        "t('crew.director')": "'導演組'",
        "t('crew.camera')": "'攝影組'",
        "t('crew.lighting')": "'燈光組'",
        "t('crew.sound')": "'收音組'",
        "t('crew.makeup')": "'化妝組'",
        "t('crew.production')": "'製片組'",
        "t('common.other')": "'其他'"
      };
      
      Object.entries(crewReplacements).forEach(([search, replace]) => {
        fixed = fixed.replace(new RegExp(search.replace(/[()]/g, '\\$&'), 'g'), replace);
      });
      
      fs.writeFileSync(filePath, fixed);
      console.log(`✅ 修復 ${filePath}`);
      
    } catch (error) {
      console.error(`❌ 修復 ${filePath} 失敗: ${error.message}`);
    }
  }

  fixCollaboratorComponents() {
    const files = [
      'components/CollaboratorPermissionsModal.tsx',
      'components/CollaboratorsList.tsx'
    ];
    
    files.forEach(filePath => {
      if (!fs.existsSync(filePath)) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 添加翻譯導入和 hook
        let fixed = this.addTranslationImport(content);
        fixed = this.addTranslationHook(fixed);
        
        fs.writeFileSync(filePath, fixed);
        console.log(`✅ 修復 ${filePath}`);
        
      } catch (error) {
        console.error(`❌ 修復 ${filePath} 失敗: ${error.message}`);
      }
    });
  }

  // 修復單個文件
  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      let fixed = content;
      let hasChanges = false;
      
      // 檢查是否需要添加翻譯導入
      if (this.needsTranslationImport(content)) {
        fixed = this.addTranslationImport(fixed);
        fixed = this.addTranslationHook(fixed);
        hasChanges = true;
        console.log(`  🔧 添加翻譯導入: ${filePath}`);
      }
      
      // 修復語法錯誤
      const syntaxFixed = this.fixTranslationSyntax(fixed);
      if (syntaxFixed !== fixed) {
        fixed = syntaxFixed;
        hasChanges = true;
        console.log(`  🔧 修復語法錯誤: ${filePath}`);
      }
      
      if (hasChanges) {
        // 備份原文件
        const backupPath = filePath + '.backup-' + Date.now();
        fs.writeFileSync(backupPath, content);
        
        // 寫入修復後的內容
        fs.writeFileSync(filePath, fixed);
        console.log(`✅ ${filePath} - 已修復並備份`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ ${filePath} - 修復失敗: ${error.message}`);
      return false;
    }
  }

  // 運行修復
  run() {
    console.log('🔧 全面翻譯錯誤修復工具');
    console.log('='.repeat(50));
    
    // 先修復特定文件
    console.log('\n📋 修復特定問題文件...');
    this.fixSpecificFiles();
    
    // 再掃描其他文件
    console.log('\n🔍 掃描其他文件...');
    const dirs = ['app', 'components', 'constants'];
    dirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir);
      }
    });
    
    console.log('\n📊 修復完成！');
    console.log('建議接下來運行: npx tsc --noEmit --skipLibCheck');
  }

  scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.scanDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
        this.fixFile(filePath);
      }
    });
  }
}

// 運行修復
if (require.main === module) {
  const fixer = new ComprehensiveTranslationFixer();
  fixer.run();
}

module.exports = ComprehensiveTranslationFixer; 