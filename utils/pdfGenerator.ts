import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Project, ProjectEmissionRecord } from '@/types/project';
import { formatEmissions, getStageLabel, getStageColor } from '@/utils/helpers';

interface ReportData {
  project: Project;
  records: ProjectEmissionRecord[];
  categories: any[];
  options: {
    includeProjectInfo: boolean;
    includeEmissionSummary: boolean;
    includeStageAnalysis: boolean;
    includeCategoryBreakdown: boolean;
    includeDetailedRecords: boolean;
    includeCollaborators: boolean;
    includeTips: boolean;
  };
  categoryData: any[];
  stageData: any[];
  language: (key: string) => string;
  date: string;
}

// 模擬PDF生成，實際應用中需要使用react-native-html-to-pdf或類似庫
export const generatePDF = async (data: ReportData): Promise<string> => {
  try {
    // 在Web環境中，我們只能模擬PDF生成
    if (Platform.OS === 'web') {
      console.log('PDF generation is not supported on web');
      return '';
    }
    
    // 創建HTML內容
    const htmlContent = generateReportHTML(data);
    
    // 在實際應用中，這裡應該使用react-native-html-to-pdf將HTML轉換為PDF
    // 由於我們不能安裝額外的原生庫，這裡只是模擬PDF生成過程
    
    // 創建一個臨時HTML文件
    const htmlFilePath = `${FileSystem.cacheDirectory}report_${Date.now()}.html`;
    await FileSystem.writeAsStringAsync(htmlFilePath, htmlContent);
    
    // 在實際應用中，這裡應該將HTML轉換為PDF
    // 由於我們不能安裝額外的原生庫，這裡只是返回HTML文件路徑
    
    console.log('Report generated at:', htmlFilePath);
    
    return htmlFilePath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// 生成報告的HTML內容
const generateReportHTML = (data: ReportData): string => {
  const { project, records, options, categoryData, stageData, language } = data;
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };
  
  // 生成HTML頭部
  const htmlHead = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${project.name} - ${language('reports.title')}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #1a1a2e;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
        }
        .section {
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }
        .section:last-child {
          border-bottom: none;
        }
        h1 {
          font-size: 24px;
          margin: 0 0 10px 0;
        }
        h2 {
          font-size: 20px;
          margin: 0 0 15px 0;
          color: #1a1a2e;
        }
        h3 {
          font-size: 18px;
          margin: 0 0 10px 0;
          color: #1a1a2e;
        }
        p {
          margin: 0 0 10px 0;
          line-height: 1.5;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          width: 150px;
        }
        .info-value {
          flex: 1;
        }
        .summary-box {
          background-color: #f0f0f0;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #16a34a;
          text-align: center;
          margin: 10px 0;
        }
        .stage-bar {
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          margin: 10px 0;
        }
        .stage-segment {
          height: 100%;
          float: left;
        }
        .category-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .category-color {
          width: 12px;
          height: 12px;
          border-radius: 6px;
          margin-right: 10px;
        }
        .category-name {
          flex: 1;
        }
        .category-value {
          font-weight: bold;
        }
        .record-item {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
        }
        .record-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .record-detail {
          font-size: 14px;
          color: #666;
          margin-bottom: 3px;
        }
        .collaborator-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .collaborator-avatar {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          background-color: #e0e0e0;
          margin-right: 10px;
          text-align: center;
          line-height: 40px;
          font-weight: bold;
          color: #666;
        }
        .collaborator-info {
          flex: 1;
        }
        .collaborator-name {
          font-weight: bold;
        }
        .collaborator-role {
          font-size: 14px;
          color: #666;
        }
        .tip-item {
          background-color: #f0f7ff;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
        }
        .tip-title {
          font-weight: bold;
          color: #0369a1;
          margin-bottom: 5px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${project.name} - ${language('reports.title')}</h1>
          <p>${language('reports.generated')}: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
  `;
  
  // 生成項目信息部分
  const projectInfoSection = options.includeProjectInfo ? `
    <div class="section">
      <h2>${language('projects.details')}</h2>
      <div class="info-row">
        <div class="info-label">${language('projects.name')}:</div>
        <div class="info-value">${project.name}</div>
      </div>
      <div class="info-row">
        <div class="info-label">${language('projects.description')}:</div>
        <div class="info-value">${project.description}</div>
      </div>
      <div class="info-row">
        <div class="info-label">${language('projects.start.date')}:</div>
        <div class="info-value">${project.startDate ? formatDate(project.startDate) : language('common.notSet')}</div>
      </div>
      ${project.endDate ? `
        <div class="info-row">
          <div class="info-label">${language('projects.end.date')}:</div>
          <div class="info-value">${formatDate(project.endDate)}</div>
        </div>
      ` : ''}
      <div class="info-row">
        <div class="info-label">${language('projects.location')}:</div>
        <div class="info-value">${project.location}</div>
      </div>
      <div class="info-row">
        <div class="info-label">${language('projects.status')}:</div>
        <div class="info-value">${language(`status.${project.status}`)}</div>
      </div>
    </div>
  ` : '';
  
  // 生成排放摘要部分
  const emissionSummarySection = options.includeEmissionSummary ? `
    <div class="section">
      <h2>${language('emissions.summary')}</h2>
      <div class="summary-box">
        <p>${language('emissions.total')}:</p>
        <div class="summary-value">${formatEmissions(project.totalEmissions || 0)}</div>
      </div>
      
      ${project.carbonBudget ? `
        <h3>${language('projects.carbon.budget')}</h3>
        <div class="info-row">
          <div class="info-label">${language('projects.carbon.budget.total')}:</div>
          <div class="info-value">${project.carbonBudget.total} kg CO₂e</div>
        </div>
        <div class="info-row">
          <div class="info-label">${language('projects.carbon.budget.remaining')}:</div>
          <div class="info-value">${(project.carbonBudget.total - (project.totalEmissions || 0))} kg CO₂e</div>
        </div>
        <div class="info-row">
          <div class="info-label">${language('projects.carbon.budget.used')}:</div>
          <div class="info-value">${Math.min(Math.round(((project.totalEmissions || 0) / project.carbonBudget.total) * 100), 100)}%</div>
        </div>
      ` : ''}
    </div>
  ` : '';
  
  // 生成階段分析部分
  const stageAnalysisSection = options.includeStageAnalysis ? `
    <div class="section">
      <h2>${language('analytics.stage.analysis')}</h2>
      
      <div class="stage-bar">
        ${stageData.map(stage => `
          <div class="stage-segment" style="width: ${stage.percentage}%; background-color: ${getStageColor(stage.stage)}"></div>
        `).join('')}
      </div>
      
      ${stageData.map(stage => `
        <div class="category-item">
          <div class="category-color" style="background-color: ${getStageColor(stage.stage)}"></div>
          <div class="category-name">${getStageLabel(stage.stage)}</div>
          <div class="category-value">${formatEmissions(stage.emissions)} (${stage.percentage.toFixed(1)}%)</div>
        </div>
      `).join('')}
    </div>
  ` : '';
  
  // 生成類別分析部分
  const categoryBreakdownSection = options.includeCategoryBreakdown ? `
    <div class="section">
      <h2>${language('analytics.category.distribution')}</h2>
      
      ${categoryData.map((category, index) => `
        <div class="category-item">
          <div class="category-color" style="background-color: ${category.color}"></div>
          <div class="category-name">${category.name}</div>
          <div class="category-value">${formatEmissions(category.value)} (${((category.value / (project.totalEmissions || 1)) * 100).toFixed(1)}%)</div>
        </div>
      `).join('')}
    </div>
  ` : '';
  
  // 生成詳細記錄部分
  const detailedRecordsSection = options.includeDetailedRecords ? `
    <div class="section">
      <h2>${language('emissions.title')}</h2>
      
      ${records.length > 0 ? records.map(record => `
        <div class="record-item">
          <div class="record-title">${record.description}</div>
          <div class="record-detail">${language('emissions.amount')}: ${formatEmissions(record.amount)}</div>
          <div class="record-detail">${language('emissions.category')}: ${categoryData.find(c => c.id === record.categoryId)?.name || 'Unknown'}</div>
          <div class="record-detail">${language('stage.' + record.stage)}</div>
          <div class="record-detail">${language('emissions.date')}: ${formatDate(record.date)}</div>
          ${record.location ? `<div class="record-detail">${language('emissions.location')}: ${record.location}</div>` : ''}
          ${record.notes ? `<div class="record-detail">${language('emissions.notes')}: ${record.notes}</div>` : ''}
        </div>
      `).join('') : `<p>${language('emissions.empty')}</p>`}
    </div>
  ` : '';
  
  // 生成協作者部分
  const collaboratorsSection = options.includeCollaborators && project.collaborators && project.collaborators.length > 0 ? `
    <div class="section">
      <h2>${language('collaborators.title')}</h2>
      
      ${project.collaborators.map(collaborator => `
        <div class="collaborator-item">
          <div class="collaborator-avatar">${collaborator.name.charAt(0)}</div>
          <div class="collaborator-info">
            <div class="collaborator-name">${collaborator.name}</div>
            <div class="collaborator-role">${language('collaborators.role.' + collaborator.role)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';
  
  // 生成減碳建議部分
  const tipsSection = options.includeTips ? `
    <div class="section">
      <h2>${language('tips.title')}</h2>
      
      <div class="tip-item">
        <div class="tip-title">${language('tips.category.transportation')}</div>
        <p>使用電動車或混合動力車輛進行拍攝現場交通，減少碳排放。</p>
        <p>盡可能選擇公共交通工具，減少私家車使用。</p>
      </div>
      
      <div class="tip-item">
        <div class="tip-title">${language('tips.category.equipment')}</div>
        <p>使用LED燈具替代傳統燈光設備，節省能源並減少熱量產生。</p>
        <p>盡可能使用可充電電池而非一次性電池。</p>
      </div>
      
      <div class="tip-item">
        <div class="tip-title">${language('tips.category.catering')}</div>
        <p>選擇當地食材，減少食物運輸產生的碳排放。</p>
        <p>減少肉類消費，增加植物性食品比例。</p>
        <p>使用可重複使用的餐具，避免一次性塑料製品。</p>
      </div>
    </div>
  ` : '';
  
  // 生成HTML尾部
  const htmlFooter = `
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CarbonLens - ${language('reports.footer')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // 組合所有部分
  return htmlHead + 
         projectInfoSection + 
         emissionSummarySection + 
         stageAnalysisSection + 
         categoryBreakdownSection + 
         detailedRecordsSection + 
         collaboratorsSection + 
         tipsSection + 
         htmlFooter;
};