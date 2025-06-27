import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface PDFOptions {
  fileName?: string;
  quality?: 'low' | 'normal' | 'high';
  format?: 'A4' | 'Letter';
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  orientation?: 'portrait' | 'landscape';
  enableHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export class PDFService {
  private static defaultOptions: PDFOptions = {
    fileName: 'carbon-report',
    quality: 'high',
    format: 'A4',
    orientation: 'portrait',
    margins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
    enableHeaderFooter: false,
  };

  /**
   * 將 HTML 內容轉換為 PDF 檔案
   */
  static async generatePDF(
    htmlContent: string, 
    options: PDFOptions = {}
  ): Promise<string> {
    try {
      const mergedOptions = { ...this.defaultOptions, ...options };
      
      // 優化 HTML 內容以適合 PDF 輸出
      const optimizedHTML = this.optimizeHTMLForPDF(htmlContent);
      
      // 生成 PDF
      const { uri } = await Print.printToFileAsync({
        html: optimizedHTML,
        base64: false,
        width: mergedOptions.format === 'A4' ? 595 : 612, // A4: 595pt, Letter: 612pt
        height: mergedOptions.format === 'A4' ? 842 : 792, // A4: 842pt, Letter: 792pt
        margins: mergedOptions.margins,
        orientation: mergedOptions.orientation,
      });

      // 重新命名檔案
      const finalFileName = `${mergedOptions.fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
      const documentsDirectory = FileSystem.documentDirectory;
      const finalUri = `${documentsDirectory}${finalFileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: finalUri,
      });

      console.log('✅ PDF 生成成功:', finalUri);
      return finalUri;
    } catch (error) {
      console.error('❌ PDF 生成失敗:', error);
      throw new Error(`PDF 生成失敗: ${error.message}`);
    }
  }

  /**
   * 生成並分享 PDF 檔案
   */
  static async generateAndSharePDF(
    htmlContent: string,
    options: PDFOptions = {}
  ): Promise<void> {
    try {
      const pdfUri = await this.generatePDF(htmlContent, options);
      
      // 檢查是否可以分享
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: '分享碳足跡報告書',
          UTI: 'com.adobe.pdf',
        });
      } else {
        console.log('📁 PDF 已儲存至:', pdfUri);
        // 在不支援分享的平台上，可以顯示檔案路徑
        alert(`PDF 已儲存至: ${pdfUri}`);
      }
    } catch (error) {
      console.error('❌ PDF 分享失敗:', error);
      throw error;
    }
  }

  /**
   * 優化 HTML 內容以適合 PDF 輸出
   */
  private static optimizeHTMLForPDF(htmlContent: string): string {
    // 移除可能導致問題的動畫和互動元素
    let optimizedHTML = htmlContent;

    // 移除動畫相關的 CSS
    optimizedHTML = optimizedHTML.replace(
      /@keyframes[^}]+\}|animation:[^;]+;|transform:[^;]+;/g,
      ''
    );

    // 移除懸浮效果
    optimizedHTML = optimizedHTML.replace(
      /:hover\s*\{[^}]*\}/g,
      ''
    );

    // 確保所有圖片和圖標都能正確顯示
    optimizedHTML = optimizedHTML.replace(
      /<svg([^>]*)>/g,
      '<svg$1 style="display: inline-block; vertical-align: middle;">'
    );

    // 添加 PDF 專用樣式
    const pdfStyles = `
    <style>
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .no-page-break {
          page-break-inside: avoid;
        }
        
        .pdf-hide {
          display: none !important;
        }
        
        /* 確保背景色和邊框在 PDF 中顯示 */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    </style>
    `;

    // 插入 PDF 專用樣式
    if (optimizedHTML.includes('</head>')) {
      optimizedHTML = optimizedHTML.replace('</head>', `${pdfStyles}</head>`);
    } else if (optimizedHTML.includes('<style>')) {
      optimizedHTML = optimizedHTML.replace('<style>', `<style>${pdfStyles}`);
    } else {
      optimizedHTML = `${pdfStyles}${optimizedHTML}`;
    }

    return optimizedHTML;
  }

  /**
   * 預覽 PDF（在支援的平台上）
   */
  static async previewPDF(htmlContent: string, options: PDFOptions = {}): Promise<void> {
    try {
      const optimizedHTML = this.optimizeHTMLForPDF(htmlContent);
      
      await Print.printAsync({
        html: optimizedHTML,
        orientation: options.orientation || 'portrait',
        margins: options.margins || this.defaultOptions.margins,
      });
    } catch (error) {
      console.error('❌ PDF 預覽失敗:', error);
      throw new Error(`PDF 預覽失敗: ${error.message}`);
    }
  }

  /**
   * 批量生成多個 PDF 檔案
   */
  static async generateMultiplePDFs(
    reports: Array<{ html: string; fileName: string; options?: PDFOptions }>
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (const report of reports) {
      try {
        const uri = await this.generatePDF(report.html, {
          fileName: report.fileName,
          ...report.options,
        });
        results.push(uri);
      } catch (error) {
        console.error(`❌ 生成 ${report.fileName} 失敗:`, error);
        // 繼續處理其他檔案，不中斷整個批次
      }
    }
    
    return results;
  }

  /**
   * 取得已生成的 PDF 檔案列表
   */
  static async getGeneratedPDFs(): Promise<Array<{ name: string; uri: string; size: number; modificationTime: number }>> {
    try {
      const documentsDirectory = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(documentsDirectory);
      
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      const fileInfos = [];
      
      for (const fileName of pdfFiles) {
        const fileUri = `${documentsDirectory}${fileName}`;
        const info = await FileSystem.getInfoAsync(fileUri);
        
        if (info.exists) {
          fileInfos.push({
            name: fileName,
            uri: fileUri,
            size: info.size || 0,
            modificationTime: info.modificationTime || 0,
          });
        }
      }
      
      // 按修改時間排序（最新的在前）
      return fileInfos.sort((a, b) => b.modificationTime - a.modificationTime);
    } catch (error) {
      console.error('❌ 取得 PDF 檔案列表失敗:', error);
      return [];
    }
  }

  /**
   * 刪除指定的 PDF 檔案
   */
  static async deletePDF(uri: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      console.log('🗑️ PDF 檔案已刪除:', uri);
      return true;
    } catch (error) {
      console.error('❌ 刪除 PDF 檔案失敗:', error);
      return false;
    }
  }

  /**
   * 清理所有舊的 PDF 檔案（保留最近 N 個）
   */
  static async cleanupOldPDFs(keepCount: number = 10): Promise<number> {
    try {
      const pdfFiles = await this.getGeneratedPDFs();
      
      if (pdfFiles.length <= keepCount) {
        return 0; // 沒有需要清理的檔案
      }
      
      const filesToDelete = pdfFiles.slice(keepCount);
      let deletedCount = 0;
      
      for (const file of filesToDelete) {
        if (await this.deletePDF(file.uri)) {
          deletedCount++;
        }
      }
      
      console.log(`🧹 已清理 ${deletedCount} 個舊的 PDF 檔案`);
      return deletedCount;
    } catch (error) {
      console.error('❌ 清理 PDF 檔案失敗:', error);
      return 0;
    }
  }
}

// 導出便捷函數
export const generatePDF = PDFService.generatePDF.bind(PDFService);
export const generateAndSharePDF = PDFService.generateAndSharePDF.bind(PDFService);
export const previewPDF = PDFService.previewPDF.bind(PDFService); 