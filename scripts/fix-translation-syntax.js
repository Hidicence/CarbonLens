const fs = require('fs');
const path = require('path');

// 修復翻譯語法錯誤的精確腳本
class TranslationSyntaxFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
  }

  // 修復模式
  getFixPatterns() {
    return [
      // 修復三元運算符中的 {t('...')} 錯誤
      {
        pattern: /\?\s*\{t\('([^']+)'\)\}/g,
        replacement: "? t('$1')",
        description: "修復三元運算符中的翻譯函數"
      },
      {
        pattern: /:\s*\{t\('([^']+)'\)\}/g,
        replacement: ": t('$1')",
        description: "修復三元運算符中的翻譯函數"
      },
      
      // 修復對象屬性中的 {t('...')} 錯誤
      {
        pattern: /title:\s*\{t\('([^']+)'\)\}/g,
        replacement: "title: t('$1')",
        description: "修復對象屬性中的翻譯函數"
      },
      {
        pattern: /placeholder:\s*\{t\('([^']+)'\)\}/g,
        replacement: "placeholder: t('$1')",
        description: "修復placeholder屬性中的翻譯函數"
      },
      
      // 修復其他常見屬性中的錯誤
      {
        pattern: /label:\s*\{t\('([^']+)'\)\}/g,
        replacement: "label: t('$1')",
        description: "修復label屬性中的翻譯函數"
      },
      {
        pattern: /subtitle:\s*\{t\('([^']+)'\)\}/g,
        replacement: "subtitle: t('$1')",
        description: "修復subtitle屬性中的翻譯函數"
      },
      
      // 修復JSX屬性中的錯誤（但保留正確的JSX內容）
      {
        pattern: /=\s*\{t\('([^']+)'\)\}\s*,/g,
        replacement: "={t('$1')},",
        description: "修復JSX屬性中的翻譯函數"
      }
    ];
  }

  // 檢查文件是否需要修復
  needsFix(content) {
    const patterns = this.getFixPatterns();
    return patterns.some(pattern => pattern.pattern.test(content));
  }

  // 修復單個文件
  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (!this.needsFix(content)) {
        console.log(`✓ ${filePath} - 無需修復`);
        return false;
      }

      let fixedContent = content;
      const patterns = this.getFixPatterns();
      let hasChanges = false;

      patterns.forEach(({ pattern, replacement, description }) => {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
          fixedContent = fixedContent.replace(pattern, replacement);
          hasChanges = true;
          console.log(`  🔧 ${description}: ${matches.length} 個修復`);
          
          // 記錄修復詳情
          matches.forEach(match => {
            this.fixes.push({
              file: filePath,
              original: match[0],
              fixed: match[0].replace(pattern, replacement),
              description
            });
          });
        }
      });

      if (hasChanges) {
        // 備份原文件
        const backupPath = filePath + '.backup-' + Date.now();
        fs.writeFileSync(backupPath, content);
        
        // 寫入修復後的內容
        fs.writeFileSync(filePath, fixedContent);
        console.log(`✅ ${filePath} - 已修復並備份到 ${path.basename(backupPath)}`);
        return true;
      }

      return false;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ ${filePath} - 修復失敗: ${error.message}`);
      return false;
    }
  }

  // 遞歸搜索並修復文件
  fixDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.fixDirectory(filePath, extensions);
      } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
        this.fixFile(filePath);
      }
    });
  }

  // 生成修復報告
  generateReport() {
    console.log('\n📊 修復報告');
    console.log('='.repeat(50));
    
    if (this.fixes.length > 0) {
      console.log(`✅ 成功修復: ${this.fixes.length} 個問題`);
      
      // 按文件分組顯示修復
      const fixesByFile = this.fixes.reduce((acc, fix) => {
        if (!acc[fix.file]) acc[fix.file] = [];
        acc[fix.file].push(fix);
        return acc;
      }, {});
      
      Object.entries(fixesByFile).forEach(([file, fixes]) => {
        console.log(`\n📄 ${file}:`);
        fixes.forEach(fix => {
          console.log(`  • ${fix.description}`);
          console.log(`    ${fix.original} → ${fix.fixed}`);
        });
      });
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ 修復失敗: ${this.errors.length} 個文件`);
      this.errors.forEach(error => {
        console.log(`  • ${error.file}: ${error.error}`);
      });
    }
    
    if (this.fixes.length === 0 && this.errors.length === 0) {
      console.log('✨ 所有文件都正常，無需修復！');
    }
  }
}

// 主執行邏輯
function main() {
  console.log('🔧 翻譯語法修復工具');
  console.log('='.repeat(50));
  
  const fixer = new TranslationSyntaxFixer();
  
  // 修復指定文件
  const targetFiles = [
    'app/(tabs)/analytics.tsx',
    'components/DatePickerField.tsx',
    'app/project/add-record.tsx'
  ];
  
  console.log('📋 檢查目標文件...\n');
  
  targetFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fixer.fixFile(file);
    } else {
      console.log(`⚠️  文件不存在: ${file}`);
    }
  });
  
  // 也可以掃描整個項目（可選）
  console.log('\n🔍 掃描其他可能的問題文件...');
  
  const dirs = ['app', 'components', 'lib'];
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fixer.fixDirectory(dir);
    }
  });
  
  fixer.generateReport();
  
  // 建議下一步操作
  console.log('\n📋 建議下一步操作:');
  console.log('1. 運行 TypeScript 檢查: npx tsc --noEmit --skipLibCheck');
  console.log('2. 測試應用是否正常運行');
  console.log('3. 如果有問題，可以從備份文件恢復');
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = TranslationSyntaxFixer; 