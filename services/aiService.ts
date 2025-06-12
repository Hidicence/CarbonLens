// DeepSeek AI 智能助手服務
interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface EmissionIntent {
  category: string;
  stage: 'pre-production' | 'production' | 'post-production';
  amount?: number;
  unit?: string;
  description: string;
  confidence: number;
  needsMoreInfo?: string[];
}

interface ParsedEmissionData {
  emissions: EmissionIntent[];
  questions?: string[];
  summary: string;
}

class DeepSeekAIService {
  private apiKey: string;
  private baseURL = 'https://api.deepseek.com/v1/chat/completions';

  constructor() {
    // 從環境變數或配置中獲取 API Key
    this.apiKey = process.env.DEEPSEEK_API_KEY || 'sk-3ca8a2c16a504c1a830041f9fcff6853';
  }

  /**
   * 智能解析用戶輸入的碳排放描述
   */
  async parseEmissionDescription(userInput: string, projectContext?: {
    projectName: string;
    currentStage: string;
    location: string;
  }): Promise<ParsedEmissionData> {
    const prompt = this.buildEmissionParsingPrompt(userInput, projectContext);
    
    try {
      const response = await this.callDeepSeek(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI 解析失敗:', error);
      return this.fallbackParsing(userInput);
    }
  }

  /**
   * 對話式引導用戶補充信息
   */
  async generateFollowUpQuestions(emissionData: EmissionIntent[]): Promise<string[]> {
    const incompleteItems = emissionData.filter(item => 
      item.needsMoreInfo && item.needsMoreInfo.length > 0
    );

    if (incompleteItems.length === 0) return [];

    const prompt = `
根據以下碳排放記錄，生成友善的問題來獲取缺失信息：

${incompleteItems.map(item => `
- ${item.description}
  缺失信息: ${item.needsMoreInfo?.join(', ')}
`).join('\n')}

請生成1-3個自然的問題，幫助用戶補充信息。回答格式為JSON數組。
    `;

    try {
      const response = await this.callDeepSeek(prompt);
      const content = JSON.parse(response.choices[0].message.content);
      return content.questions || [];
    } catch (error) {
      return this.generateDefaultQuestions(incompleteItems);
    }
  }

  /**
   * 智能建議減碳措施
   */
  async generateCarbonReductionSuggestions(
    emissionRecords: any[],
    projectType: string
  ): Promise<string[]> {
    const prompt = `
作為專業的影視碳足跡顧問，分析以下專案的碳排放數據：

專案類型：${projectType}
碳排放記錄：
${emissionRecords.map(record => `
- ${record.category}: ${record.amount} ${record.unit}
- 階段: ${record.stage}
- 描述: ${record.description}
`).join('\n')}

請提供3-5個具體可行的減碳建議，每個建議要包含：
1. 具體措施
2. 預估減碳幅度
3. 實施難度

回答格式為JSON數組，每個建議包含 suggestion, reduction, difficulty 三個字段。
    `;

    try {
      const response = await this.callDeepSeek(prompt);
      const content = JSON.parse(response.choices[0].message.content);
      return content.suggestions || [];
    } catch (error) {
      return this.getDefaultSuggestions(projectType);
    }
  }

  /**
   * 核心提示詞構建
   */
  private buildEmissionParsingPrompt(userInput: string, context?: any): string {
    return `
你是專業的影視碳足跡記錄助手。請解析用戶的描述並轉換為結構化的碳排放記錄。

影視製作階段分類：
- pre-production (前期製作): 腳本、選角、勘景、籌備等
- production (拍攝階段): 實際拍攝、現場作業
- post-production (後期製作): 剪輯、特效、配音、發行等

碳排放類別：
- transport: 交通運輸 (開車、搭車、飛機等)
- energy: 能源消耗 (用電、發電機等)
- accommodation: 住宿 (飯店、民宿等)
- catering: 餐飲 (便當、聚餐等)
- equipment: 設備器材 (攝影機、燈光等)
- waste: 廢棄物處理
- digital: 數位服務 (雲端、串流等)

用戶描述：「${userInput}」

${context ? `
專案背景：
- 專案名稱: ${context.projectName}
- 當前階段: ${context.currentStage}
- 拍攝地點: ${context.location}
` : ''}

請分析並回傳JSON格式：
{
  "emissions": [
    {
      "category": "類別代碼",
      "stage": "製作階段",
      "amount": 數量(如果能推算),
      "unit": "單位",
      "description": "描述",
      "confidence": 0.8,
      "needsMoreInfo": ["需要補充的信息"]
    }
  ],
  "questions": ["需要問用戶的問題"],
  "summary": "總結說明"
}

注意：
1. 如果信息不完整，在needsMoreInfo中列出
2. 優先推算合理的數量和單位
3. confidence表示解析信心度(0-1)
4. 用繁體中文回應
    `;
  }

  /**
   * 調用 DeepSeek API
   */
  private async callDeepSeek(prompt: string): Promise<DeepSeekResponse> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是專業的影視產業碳足跡管理助手，精通碳排放計算和影視製作流程。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API 錯誤: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 解析 AI 回應
   */
  private parseAIResponse(response: DeepSeekResponse): ParsedEmissionData {
    try {
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('無法解析 AI 回應');
    } catch (error) {
      console.error('解析 AI 回應失敗:', error);
      return this.fallbackParsing('');
    }
  }

  /**
   * 備用解析邏輯
   */
  private fallbackParsing(userInput: string): ParsedEmissionData {
    // 簡單的關鍵字匹配作為備用方案
    const keywords = {
      transport: ['開車', '搭車', '飛機', '計程車', '公車', '捷運'],
      energy: ['用電', '發電機', '充電', '攝影機', '燈光'],
      catering: ['便當', '午餐', '晚餐', '聚餐', '咖啡', '飲料'],
      accommodation: ['住宿', '飯店', '民宿', '旅館'],
    };

    const detectedCategory = Object.entries(keywords).find(([category, words]) =>
      words.some(word => userInput.includes(word))
    )?.[0] || 'energy';

    return {
      emissions: [{
        category: detectedCategory,
        stage: 'production',
        description: userInput,
        confidence: 0.5,
        needsMoreInfo: ['數量', '單位', '詳細說明']
      }],
      questions: ['請提供更多詳細信息，例如數量、時間、地點等'],
      summary: '需要更多信息來準確記錄碳排放'
    };
  }

  /**
   * 生成預設問題
   */
  private generateDefaultQuestions(incompleteItems: EmissionIntent[]): string[] {
    const questions: string[] = [];
    
    incompleteItems.forEach(item => {
      if (item.needsMoreInfo?.includes('數量')) {
        questions.push(`${item.description} 的具體數量是多少？`);
      }
      if (item.needsMoreInfo?.includes('時間')) {
        questions.push(`這個活動進行了多長時間？`);
      }
      if (item.needsMoreInfo?.includes('地點')) {
        questions.push(`具體的地點或距離是？`);
      }
    });

    return questions.slice(0, 3); // 最多3個問題
  }

  /**
   * 預設減碳建議
   */
  private getDefaultSuggestions(projectType: string): string[] {
    const defaultSuggestions = {
      'tv-commercial': [
        '優化拍攝計劃，減少不必要的移動',
        '使用LED燈光替代傳統燈具',
        '選擇離拍攝地較近的住宿'
      ],
      'documentary': [
        '規劃最佳交通路線',
        '使用可充電設備減少電池消耗',
        '選用環保餐飲服務'
      ]
    };

    return defaultSuggestions[projectType] || defaultSuggestions['tv-commercial'];
  }
}

export default new DeepSeekAIService(); 