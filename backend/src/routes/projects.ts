import { Router, Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { getDatabase } from '../database/setup';

export const projectRoutes = Router();

// 獲取所有項目
projectRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  
  try {
    const projects = await db('projects')
      .select('*')
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    throw new CustomError('獲取項目列表失敗', 500);
  }
}));

// 獲取單個項目
projectRoutes.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  
  try {
    const project = await db('projects')
      .where('id', id)
      .first();

    if (!project) {
      throw new CustomError('項目不存在', 404);
    }

    // 獲取項目的排放記錄統計
    const emissionStats = await db('emission_records')
      .where('project_id', id)
      .select(
        db.raw('COUNT(*) as total_records'),
        db.raw('SUM(amount) as total_emissions'),
        db.raw('AVG(amount) as average_emission')
      )
      .first();

    res.json({
      success: true,
      data: {
        ...project,
        emission_stats: emissionStats
      }
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('獲取項目詳情失敗', 500);
  }
}));

// 創建新項目
projectRoutes.post('/', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const projectData = req.body;
  
  try {
    // 基本數據驗證
    if (!projectData.name) {
      throw new CustomError('項目名稱不能為空', 400);
    }

    const newProject = {
      id: Math.random().toString(36).substring(2, 15),
      name: projectData.name,
      description: projectData.description || '',
      start_date: projectData.start_date || null,
      end_date: projectData.end_date || null,
      location: projectData.location || '',
      status: projectData.status || 'planning',
      color: projectData.color || '#10B981',
      budget: projectData.budget || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db('projects').insert(newProject);

    res.status(201).json({
      success: true,
      data: newProject,
      message: '項目創建成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('創建項目失敗', 500);
  }
}));

// 更新項目
projectRoutes.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    const existingProject = await db('projects')
      .where('id', id)
      .first();

    if (!existingProject) {
      throw new CustomError('項目不存在', 404);
    }

    const updatedProject = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    await db('projects')
      .where('id', id)
      .update(updatedProject);

    const project = await db('projects')
      .where('id', id)
      .first();

    res.json({
      success: true,
      data: project,
      message: '項目更新成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('更新項目失敗', 500);
  }
}));

// 刪除項目
projectRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  
  try {
    const existingProject = await db('projects')
      .where('id', id)
      .first();

    if (!existingProject) {
      throw new CustomError('項目不存在', 404);
    }

    // 刪除相關的排放記錄
    await db('emission_records')
      .where('project_id', id)
      .del();

    // 刪除項目
    await db('projects')
      .where('id', id)
      .del();

    res.json({
      success: true,
      message: '項目刪除成功'
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('刪除項目失敗', 500);
  }
}));

// 獲取項目統計
projectRoutes.get('/:id/stats', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  
  try {
    const project = await db('projects')
      .where('id', id)
      .first();

    if (!project) {
      throw new CustomError('項目不存在', 404);
    }

    // 總體統計
    const totalStats = await db('emission_records')
      .where('project_id', id)
      .select(
        db.raw('COUNT(*) as total_records'),
        db.raw('SUM(amount) as total_emissions'),
        db.raw('AVG(amount) as average_emission'),
        db.raw('MIN(amount) as min_emission'),
        db.raw('MAX(amount) as max_emission')
      )
      .first();

    // 按階段統計
    const stageStats = await db('emission_records')
      .where('project_id', id)
      .select('stage')
      .sum('amount as total')
      .count('* as count')
      .groupBy('stage');

    // 按月份統計
    const monthlyStats = await db('emission_records')
      .where('project_id', id)
      .select(
        db.raw("strftime('%Y-%m', date) as month"),
        db.raw('SUM(amount) as emissions'),
        db.raw('COUNT(*) as records')
      )
      .groupBy(db.raw("strftime('%Y-%m', date)"))
      .orderBy('month');

    res.json({
      success: true,
      data: {
        project: project,
        total: totalStats,
        by_stage: stageStats,
        by_month: monthlyStats
      }
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('獲取項目統計失敗', 500);
  }
})); 