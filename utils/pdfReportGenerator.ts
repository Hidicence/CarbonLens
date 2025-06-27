import { Project, ProjectEmissionSummary } from '../types/project';
import { 
  generateCarbonFootprintReport,
  generateGovernmentComplianceReport,
  generateGovernmentComplianceReportHTML,
  ReportOptions
} from './reportGenerator';

/**
 * 簡單的 HTML 轉 PDF 功能
 */
export class PDFReportGenerator {
  
  /**
   * 將標準報告 HTML 轉成 PDF 並分享
   */
  static async generateStandardPDF(
    projects: Project[],
    projectSummaries: { [key: string]: ProjectEmissionSummary },
    organizationInfo?: any
  ): Promise<string> {
    try {
      console.log('🔄 生成標準報告 PDF...');
      
      // 生成 HTML 報告
      const htmlContent = await generateCarbonFootprintReport(
        projects,
        projectSummaries,
        {
          includeOrganizationInfo: true,
          includeExecutiveSummary: true,
          includeEmissionInventory: true,
          includeLifecycleAnalysis: true,
          includeEfficiencyMetrics: true,
          includeRecommendations: true,
          includeDataSources: true,
          format: 'comprehensive'
        },
        organizationInfo
      );

      // 導入 PDF 服務並轉換
      const { generateAndSharePDF } = await import('../services/pdfService');
      
      await generateAndSharePDF(htmlContent, {
        fileName: `CarbonLens_Report_${new Date().toISOString().split('T')[0]}`,
        format: 'A4',
        orientation: 'portrait'
      });

      return '標準 PDF 報告已生成並分享';
    } catch (error) {
      console.error('❌ 標準 PDF 生成失敗:', error);
      throw error;
    }
  }

  /**
   * 將政府報告 HTML 轉成 PDF 並分享
   */
  static async generateGovernmentPDF(
    projects: Project[],
    projectSummaries: { [key: string]: ProjectEmissionSummary },
    organizationInfo: any
  ): Promise<string> {
    try {
      console.log('🔄 生成政府報告 PDF...');
      
      // 生成政府報告數據
      const report = await generateGovernmentComplianceReport(
        projects,
        projectSummaries,
        organizationInfo
      );

      // 生成 HTML 內容
      const htmlContent = generateGovernmentComplianceReportHTML(report);

      // 導入 PDF 服務並轉換
      const { generateAndSharePDF } = await import('../services/pdfService');
      
      await generateAndSharePDF(htmlContent, {
        fileName: `Government_Report_${new Date().toISOString().split('T')[0]}`,
        format: 'A4',
        orientation: 'portrait'
      });

      return '政府標準 PDF 報告已生成並分享';
    } catch (error) {
      console.error('❌ 政府 PDF 生成失敗:', error);
      throw error;
    }
  }
}

// 導出便捷函數
export const generateStandardPDF = PDFReportGenerator.generateStandardPDF;
export const generateGovernmentPDF = PDFReportGenerator.generateGovernmentPDF; 