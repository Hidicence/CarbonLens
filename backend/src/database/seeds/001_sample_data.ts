import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 清理現有數據
  await knex('emission_records').del();
  await knex('emission_categories').del();
  await knex('projects').del();

  // 插入示例項目
  await knex('projects').insert([
    {
      id: 'proj1',
      name: '電影《綠色故事》',
      description: '一部關於環保主題的劇情片',
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      location: '台北市',
      status: 'active',
      color: '#10B981',
      budget: 5000000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'proj2',
      name: '廣告《永續品牌》',
      description: '企業永續發展宣傳廣告',
      start_date: '2024-02-15',
      end_date: '2024-04-15',
      location: '高雄市',
      status: 'planning',
      color: '#3B82F6',
      budget: 2000000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'proj3',
      name: '紀錄片《海洋守護者》',
      description: '關於海洋保護的紀錄片',
      start_date: '2024-03-01',
      end_date: '2024-08-31',
      location: '花蓮縣',
      status: 'completed',
      color: '#8B5CF6',
      budget: 3500000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  // 插入排放類別
  await knex('emission_categories').insert([
    {
      id: 'cat1',
      name: '運輸',
      description: '人員和設備運輸產生的排放',
      color: '#EF4444',
      default_factor: 0.2,
      unit: 'kgCO2e/km',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat2',
      name: '設備用電',
      description: '攝影、燈光等設備用電排放',
      color: '#F59E0B',
      default_factor: 0.5,
      unit: 'kgCO2e/kWh',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat3',
      name: '住宿',
      description: '劇組住宿產生的排放',
      color: '#06B6D4',
      default_factor: 12.5,
      unit: 'kgCO2e/晚',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat4',
      name: '餐飲',
      description: '劇組餐飲產生的排放',
      color: '#84CC16',
      default_factor: 2.8,
      unit: 'kgCO2e/餐',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat5',
      name: '場景建設',
      description: '拍攝場景建設和道具製作',
      color: '#A855F7',
      default_factor: 45.0,
      unit: 'kgCO2e/m²',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat6',
      name: '廢料處理',
      description: '拍攝後廢料處理和回收',
      color: '#64748B',
      default_factor: 0.8,
      unit: 'kgCO2e/kg',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]);

  // 插入示例排放記錄
  const records: any[] = [];
  const projectIds = ['proj1', 'proj2', 'proj3'];
  const categories = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6'];
  const stages = ['pre_production', 'production', 'post_production'];

  // 為每個項目生成示例數據
  for (let i = 0; i < 100; i++) {
    const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
    const categoryId = categories[Math.floor(Math.random() * categories.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    
    // 隨機生成日期 (最近6個月)
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 180));
    
    records.push({
      id: `rec${i + 1}`,
      project_id: projectId,
      category_id: categoryId,
      stage: stage,
      description: `示例排放記錄 ${i + 1}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      unit: 'kg',
      amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      date: randomDate.toISOString().split('T')[0],
      location: ['台北市', '高雄市', '台中市', '花蓮縣'][Math.floor(Math.random() * 4)],
      notes: Math.random() > 0.7 ? `備註信息 ${i + 1}` : '',
      people_count: Math.floor(Math.random() * 20) + 5,
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: new Date().toISOString()
    });
  }

  await knex('emission_records').insert(records);

  console.log('✅ 示例數據已插入');
} 