import { Router, Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { getDatabase } from '../database/setup';

export const emissionRoutes = Router();

// 營運排放記錄相關路由

// 獲取所有營運排放記錄
emissionRoutes.get('/operational', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { 
    category,
    start_date, 
    end_date, 
    limit = '50', 
    offset = '0' 
  } = req.query;
  
  try {
    let query = db('operational_emissions as oe')
      .select('*');

    // 應用篩選條件
    if (category) {
      query = query.where('oe.category', category);
    }
    
    if (start_date) {
      query = query.where('oe.date', '>=', start_date);
    }
    
    if (end_date) {
      query = query.where('oe.date', '<=', end_date);
    }

    // 分頁
    const records = await query
      .orderBy('oe.date', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // 獲取總數
    const totalQuery = db('operational_emissions as oe');
    if (category) totalQuery.where('category', category);
    if (start_date) totalQuery.where('date', '>=', start_date);
    if (end_date) totalQuery.where('date', '<=', end_date);
    
    const totalCount = await totalQuery.count('* as count').first();

    res.json({
      success: true,
      data: records,
      pagination: {
        total: totalCount?.count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        has_more: records.length === parseInt(limit as string)
      }
    });
  } catch (error) {
    throw new CustomError('獲取營運排放記錄失敗', 500);
  }
}));

// 創建營運排放記錄
emissionRoutes.post('/operational', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const recordData = req.body;
  
  try {
    // 基本數據驗證
    if (!recordData.category) {
      throw new CustomError('排放類別不能為空', 400);
    }
    
    if (!recordData.amount || recordData.amount <= 0) {
      throw new CustomError('排放量必須大於0', 400);
    }

    const newRecord = {
      id: Math.random().toString(36).substring(2, 15),
      category: recordData.category,
      source: recordData.source || '',
      description: recordData.description || '',
      quantity: recordData.quantity || 1,
      unit: recordData.unit || 'kg',
      amount: parseFloat(recordData.amount),
      date: recordData.date || new Date().toISOString().split('T')[0],
      location: recordData.location || '',
      notes: recordData.notes || '',
      allocation_method: recordData.allocation_method || null,
      allocation_data: recordData.allocation_data ? JSON.stringify(recordData.allocation_data) : null,
      is_allocated: recordData.is_allocated || false,
      created_at: new Date().toISOString(),
      created_by: recordData.created_by || null,
      updated_at: new Date().toISOString()
    };

    await db('operational_emissions').insert(newRecord);

    res.status(201).json({
      success: true,
      data: newRecord,
      message: '營運排放記錄創建成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('創建營運排放記錄失敗', 500);
  }
}));

// 更新營運排放記錄
emissionRoutes.put('/operational/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    const existingRecord = await db('operational_emissions')
      .where('id', id)
      .first();

    if (!existingRecord) {
      throw new CustomError('營運排放記錄不存在', 404);
    }

    const updatedRecord = {
      ...updateData,
      allocation_data: updateData.allocation_data ? JSON.stringify(updateData.allocation_data) : existingRecord.allocation_data,
      updated_at: new Date().toISOString()
    };

    await db('operational_emissions')
      .where('id', id)
      .update(updatedRecord);

    const result = await db('operational_emissions')
      .where('id', id)
      .first();

    res.json({
      success: true,
      data: result,
      message: '營運排放記錄更新成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('更新營運排放記錄失敗', 500);
  }
}));

// 刪除營運排放記錄
emissionRoutes.delete('/operational/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  
  try {
    const existingRecord = await db('operational_emissions')
      .where('id', id)
      .first();

    if (!existingRecord) {
      throw new CustomError('營運排放記錄不存在', 404);
    }

    await db('operational_emissions')
      .where('id', id)
      .del();

    res.json({
      success: true,
      message: '營運排放記錄刪除成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('刪除營運排放記錄失敗', 500);
  }
}));

// 獲取所有排放記錄
emissionRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { 
    project_id, 
    category_id, 
    stage, 
    start_date, 
    end_date, 
    limit = '50', 
    offset = '0' 
  } = req.query;
  
  try {
    let query = db('emission_records as er')
      .leftJoin('projects as p', 'er.project_id', 'p.id')
      .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
      .select(
        'er.*',
        'p.name as project_name',
        'p.color as project_color',
        'ec.name as category_name',
        'ec.color as category_color'
      );

    // 應用篩選條件
    if (project_id) {
      query = query.where('er.project_id', project_id);
    }
    
    if (category_id) {
      query = query.where('er.category_id', category_id);
    }
    
    if (stage) {
      query = query.where('er.stage', stage);
    }
    
    if (start_date) {
      query = query.where('er.date', '>=', start_date);
    }
    
    if (end_date) {
      query = query.where('er.date', '<=', end_date);
    }

    // 分頁
    const records = await query
      .orderBy('er.date', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // 獲取總數
    const totalQuery = db('emission_records as er');
    if (project_id) totalQuery.where('project_id', project_id);
    if (category_id) totalQuery.where('category_id', category_id);
    if (stage) totalQuery.where('stage', stage);
    if (start_date) totalQuery.where('date', '>=', start_date);
    if (end_date) totalQuery.where('date', '<=', end_date);
    
    const totalCount = await totalQuery.count('* as count').first();

    res.json({
      success: true,
      data: records,
      pagination: {
        total: totalCount?.count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        has_more: records.length === parseInt(limit as string)
      }
    });
  } catch (error) {
    throw new CustomError('獲取排放記錄失敗', 500);
  }
}));

// 獲取單個排放記錄
emissionRoutes.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  
  try {
    const record = await db('emission_records as er')
      .leftJoin('projects as p', 'er.project_id', 'p.id')
      .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
      .select(
        'er.*',
        'p.name as project_name',
        'ec.name as category_name'
      )
      .where('er.id', id)
      .first();

    if (!record) {
      throw new CustomError('排放記錄不存在', 404);
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('獲取排放記錄詳情失敗', 500);
  }
}));

// 創建新排放記錄
emissionRoutes.post('/', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const recordData = req.body;
  
  try {
    // 基本數據驗證
    if (!recordData.project_id) {
      throw new CustomError('項目ID不能為空', 400);
    }
    
    if (!recordData.category_id) {
      throw new CustomError('排放類別不能為空', 400);
    }
    
    if (!recordData.amount || recordData.amount <= 0) {
      throw new CustomError('排放量必須大於0', 400);
    }

    const newRecord = {
      id: Math.random().toString(36).substring(2, 15),
      project_id: recordData.project_id,
      category_id: recordData.category_id,
      stage: recordData.stage || 'production',
      description: recordData.description || '',
      source_id: recordData.source_id || null,
      quantity: recordData.quantity || 1,
      unit: recordData.unit || 'kg',
      amount: parseFloat(recordData.amount),
      date: recordData.date || new Date().toISOString().split('T')[0],
      location: recordData.location || '',
      notes: recordData.notes || '',
      equipment_list: recordData.equipment_list || '',
      people_count: recordData.people_count || null,
      created_at: new Date().toISOString(),
      created_by: recordData.created_by || null,
      updated_at: new Date().toISOString()
    };

    await db('emission_records').insert(newRecord);

    // 返回包含關聯信息的記錄
    const createdRecord = await db('emission_records as er')
      .leftJoin('projects as p', 'er.project_id', 'p.id')
      .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
      .select(
        'er.*',
        'p.name as project_name',
        'ec.name as category_name'
      )
      .where('er.id', newRecord.id)
      .first();

    res.status(201).json({
      success: true,
      data: createdRecord,
      message: '排放記錄創建成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('創建排放記錄失敗', 500);
  }
}));

// 更新排放記錄
emissionRoutes.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    const existingRecord = await db('emission_records')
      .where('id', id)
      .first();

    if (!existingRecord) {
      throw new CustomError('排放記錄不存在', 404);
    }

    const updatedRecord = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    await db('emission_records')
      .where('id', id)
      .update(updatedRecord);

    const record = await db('emission_records as er')
      .leftJoin('projects as p', 'er.project_id', 'p.id')
      .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
      .select(
        'er.*',
        'p.name as project_name',
        'ec.name as category_name'
      )
      .where('er.id', id)
      .first();

    res.json({
      success: true,
      data: record,
      message: '排放記錄更新成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('更新排放記錄失敗', 500);
  }
}));

// 刪除排放記錄
emissionRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  
  try {
    const existingRecord = await db('emission_records')
      .where('id', id)
      .first();

    if (!existingRecord) {
      throw new CustomError('排放記錄不存在', 404);
    }

    await db('emission_records')
      .where('id', id)
      .del();

    res.json({
      success: true,
      message: '排放記錄刪除成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('刪除排放記錄失敗', 500);
  }
}));

// 批量創建排放記錄
emissionRoutes.post('/bulk', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { records } = req.body;
  
  try {
    if (!Array.isArray(records) || records.length === 0) {
      throw new CustomError('記錄數組不能為空', 400);
    }

    const newRecords = records.map(recordData => ({
      id: Math.random().toString(36).substring(2, 15),
      project_id: recordData.project_id,
      category_id: recordData.category_id,
      stage: recordData.stage || 'production',
      description: recordData.description || '',
      source_id: recordData.source_id || null,
      quantity: recordData.quantity || 1,
      unit: recordData.unit || 'kg',
      amount: parseFloat(recordData.amount),
      date: recordData.date || new Date().toISOString().split('T')[0],
      location: recordData.location || '',
      notes: recordData.notes || '',
      equipment_list: recordData.equipment_list || '',
      people_count: recordData.people_count || null,
      created_at: new Date().toISOString(),
      created_by: recordData.created_by || null,
      updated_at: new Date().toISOString()
    }));

    await db('emission_records').insert(newRecords);

    res.status(201).json({
      success: true,
      data: {
        created_count: newRecords.length,
        records: newRecords
      },
      message: `成功創建 ${newRecords.length} 筆排放記錄`
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('批量創建排放記錄失敗', 500);
  }
})); 