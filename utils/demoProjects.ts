import { Project, EmissionRecord } from '@/types/project';

// 生成隨機ID
const generateId = () => `demo-${Math.random().toString(36).substr(2, 9)}`;

// 示例排放記錄
const demoEmissionRecords: Record<string, EmissionRecord[]> = {
  'demo-movie': [
    {
      id: 'demo-record-1',
      projectId: 'demo-movie',
      stage: 'pre-production',
      category: '運輸',
      categoryId: 'transport',
      title: '前期勘景用車',
      description: '前期場地勘景使用的車輛油耗',
      quantity: 50,
      unit: '公升',
      amount: 115,
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '使用汽油車輛',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      equipmentList: '劇組車輛',
    },
    {
      id: 'demo-record-2',
      projectId: 'demo-movie',
      stage: 'production',
      category: '電力',
      categoryId: 'electricity',
      title: '攝影機及照明設備用電',
      description: '攝影機及照明設備消耗的電量',
      quantity: 120,
      unit: '度',
      amount: 60,
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '使用一般電網供電',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      equipmentList: '攝影機、照明設備',
    },
    {
      id: 'demo-record-3',
      projectId: 'demo-movie',
      stage: 'production',
      category: '住宿',
      categoryId: 'accommodation',
      title: '劇組員工住宿',
      description: '劇組人員外地拍攝住宿',
      quantity: 10,
      unit: '晚',
      amount: 150,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '三星級酒店',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      peopleCount: 5,
    },
    {
      id: 'demo-record-4',
      projectId: 'demo-movie',
      stage: 'production',
      category: '伙食',
      categoryId: 'catering',
      title: '劇組餐飲',
      description: '劇組日常餐飲',
      quantity: 50,
      unit: '人次',
      amount: 75,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '使用當地食材，減少運輸排放',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      peopleCount: 25,
    }
  ],
  'demo-tv': [
    {
      id: 'demo-record-5',
      projectId: 'demo-tv',
      stage: 'pre-production',
      category: '前期規劃',
      categoryId: 'planning',
      title: '遠程會議',
      description: '使用電腦進行遠程會議代替面對面會議',
      quantity: 30,
      unit: '度',
      amount: 15,
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '減少交通排放',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      equipmentList: '電腦設備',
      peopleCount: 8,
    }
  ]
};

// 創建示例專案數據
export const demoProjects: Project[] = [
  {
    id: 'demo-movie',
    name: '示範電影：綠色未來',
    description: '這是一個低碳電影製作案例，展示如何記錄和減少碳排放。',
    status: 'active',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天前
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60天後
    location: '台北市',
    budget: 5000000,
    carbonBudget: {
      total: 1000,
      preProduction: 200,
      production: 600,
      postProduction: 200
    },
    totalEmissions: 400, // 已記錄的總排放量
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059',
    collaborators: [
      { id: 'demo-user-1', name: '王導演', email: 'director@example.com', role: 'owner', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 'demo-user-2', name: '李製片', email: 'producer@example.com', role: 'editor', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    ],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-tv',
    name: '示範紀錄片：生態之旅',
    description: '探索台灣自然生態的紀錄片，強調可持續製作流程。',
    status: 'planning',
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15天後
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(), // 75天後
    location: '台灣各地',
    budget: 2000000,
    carbonBudget: {
      total: 500,
      preProduction: 100,
      production: 300,
      postProduction: 100
    },
    totalEmissions: 15, // 已記錄的總排放量
    thumbnail: 'https://images.unsplash.com/photo-1532190715524-2b0ddafb9d36?q=80&w=2070',
    collaborators: [
      { id: 'demo-user-2', name: '李製片', email: 'producer@example.com', role: 'owner', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 'demo-user-3', name: '張攝影', email: 'camera@example.com', role: 'editor', avatar: 'https://randomuser.me/api/portraits/men/68.jpg' },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// 添加示例專案到專案庫
export const loadDemoProjects = (projectStore: any, recordStore?: any) => {
  // 添加專案
  demoProjects.forEach(project => {
    projectStore.addProject(project);
    
    // 如果提供了記錄存儲，添加相關排放記錄
    if (recordStore && demoEmissionRecords[project.id]) {
      demoEmissionRecords[project.id].forEach(record => {
        recordStore.addRecord(project.id, record);
      });
    }
  });
};

// 移除示例專案
export const removeDemoProjects = (projectStore: any, recordStore?: any) => {
  demoProjects.forEach(project => {
    // 如果提供了記錄存儲，移除相關排放記錄
    if (recordStore && demoEmissionRecords[project.id]) {
      demoEmissionRecords[project.id].forEach(record => {
        recordStore.removeRecord(record.id);
      });
    }
    
    // 移除專案
    projectStore.removeProject(project.id);
  });
}; 