import { Router, Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { getDatabase } from '../database/setup';

export const reportRoutes = Router();

// 生成項目報告
reportRoutes.get('/project/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { format = 'json', include_details = 'false' } = req.query;
  
  try {
    // 獲取項目基本信息
    const project = await db('projects')
      .where('id', id)
      .first();

    if (!project) {
      throw new CustomError('項目不存在', 404);
    }

    // 計算總排放量
    const totalEmissions = await db('emission_records')
      .where('project_id', id)
      .sum('amount as total')
      .first();

    // 按階段統計
    const stageBreakdown = await db('emission_records')
      .where('project_id', id)
      .select('stage')
      .sum('amount as total')
      .count('* as count')
      .groupBy('stage');

    // 按類別統計
    const categoryBreakdown = await db('emission_records as er')
      .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
      .where('er.project_id', id)
      .select('ec.name as category', 'ec.color')
      .sum('er.amount as total')
      .count('er.id as count')
      .groupBy('ec.id', 'ec.name', 'ec.color');

    // 時間趨勢分析
    const timeline = await db('emission_records')
      .where('project_id', id)
      .select(
        db.raw("strftime('%Y-%m', date) as month"),
        db.raw('SUM(amount) as emissions'),
        db.raw('COUNT(*) as records')
      )
      .groupBy(db.raw("strftime('%Y-%m', date)"))
      .orderBy('month');

    let reportData: any = {
      project: project,
      summary: {
        total_emissions: totalEmissions?.total || 0,
        total_records: stageBreakdown.reduce((sum, item) => sum + item.count, 0),
        stages_count: stageBreakdown.length,
        categories_count: categoryBreakdown.length,
        generated_at: new Date().toISOString()
      },
      breakdown: {
        by_stage: stageBreakdown,
        by_category: categoryBreakdown
      },
      timeline: timeline
    };

    // 如果需要詳細信息，包含所有記錄
    if (include_details === 'true') {
      const allRecords = await db('emission_records as er')
        .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
        .where('er.project_id', id)
        .select(
          'er.*',
          'ec.name as category_name'
        )
        .orderBy('er.date', 'desc');

      reportData = {
        ...reportData,
        details: allRecords
      };
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('生成項目報告失敗', 500);
  }
}));

// 生成總體報告
reportRoutes.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { 
    start_date, 
    end_date, 
    project_ids,
    format = 'json' 
  } = req.query;
  
  try {
    let dateFilter = db.raw('1=1');
    if (start_date) {
      dateFilter = db.raw('date >= ?', [start_date]);
    }
    if (end_date) {
      dateFilter = db.raw('date <= ?', [end_date]);
    }

    // 項目統計
    let projectStatsQuery = db('projects as p')
      .leftJoin(function() {
        this.select('project_id')
          .sum('amount as total_emissions')
          .count('* as total_records')
          .from('emission_records')
          .whereRaw(dateFilter)
          .groupBy('project_id')
          .as('er');
      }, 'p.id', 'er.project_id')
      .select(
        'p.id',
        'p.name',
        'p.status',
        'p.color',
        db.raw('COALESCE(er.total_emissions, 0) as total_emissions'),
        db.raw('COALESCE(er.total_records, 0) as total_records')
      );

    if (project_ids) {
      const projectIdArray = Array.isArray(project_ids) ? project_ids : [project_ids];
      projectStatsQuery = projectStatsQuery.whereIn('p.id', projectIdArray);
    }

    const projectStats = await projectStatsQuery;

    // 總體統計
    let totalEmissionsQuery = db('emission_records')
      .sum('amount as total')
      .count('* as count')
      .first();

    if (start_date || end_date) {
      totalEmissionsQuery = totalEmissionsQuery.whereRaw(dateFilter);
    }

    const totalStats = await totalEmissionsQuery;

    // 階段統計
    let stageStatsQuery = db('emission_records')
      .select('stage')
      .sum('amount as total')
      .count('* as count')
      .groupBy('stage');

    if (start_date || end_date) {
      stageStatsQuery = stageStatsQuery.whereRaw(dateFilter);
    }

    const stageStats = await stageStatsQuery;

    // 類別統計
    let categoryStatsQuery = db('emission_records as er')
      .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
      .select('ec.name as category', 'ec.color')
      .sum('er.amount as total')
      .count('er.id as count')
      .groupBy('ec.id', 'ec.name', 'ec.color');

    if (start_date || end_date) {
      categoryStatsQuery = categoryStatsQuery.whereRaw(dateFilter);
    }

    const categoryStats = await categoryStatsQuery;

    // 月度趨勢
    let monthlyTrendQuery = db('emission_records')
      .select(
        db.raw("strftime('%Y-%m', date) as month"),
        db.raw('SUM(amount) as emissions'),
        db.raw('COUNT(*) as records')
      )
      .groupBy(db.raw("strftime('%Y-%m', date)"))
      .orderBy('month');

    if (start_date || end_date) {
      monthlyTrendQuery = monthlyTrendQuery.whereRaw(dateFilter);
    }

    const monthlyTrend = await monthlyTrendQuery;

    const reportData = {
      summary: {
        total_emissions: totalStats?.total || 0,
        total_records: totalStats?.count || 0,
        projects_count: projectStats.length,
        active_projects: projectStats.filter(p => p.status === 'active').length,
        generated_at: new Date().toISOString(),
        date_range: {
          start: start_date || null,
          end: end_date || null
        }
      },
      projects: projectStats,
      breakdown: {
        by_stage: stageStats,
        by_category: categoryStats
      },
      trends: {
        monthly: monthlyTrend
      }
    };

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    throw new CustomError('生成總體報告失敗', 500);
  }
}));

// 生成排放對比報告
reportRoutes.get('/comparison', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { project_ids, period = 'month' } = req.query;
  
  try {
    if (!project_ids) {
      throw new CustomError('請提供要對比的項目ID列表', 400);
    }

    const projectIdArray = Array.isArray(project_ids) ? project_ids : [project_ids];

    // 獲取項目基本信息
    const projects = await db('projects')
      .whereIn('id', projectIdArray)
      .select('id', 'name', 'color');

    // 根據時間週期設定格式
    let timeFormat: string;
    switch (period) {
      case 'day':
        timeFormat = '%Y-%m-%d';
        break;
      case 'week':
        timeFormat = '%Y-%W';
        break;
      case 'month':
        timeFormat = '%Y-%m';
        break;
      case 'year':
        timeFormat = '%Y';
        break;
      default:
        timeFormat = '%Y-%m';
    }

    // 獲取每個項目的時間序列數據
    const timeseriesData = await db('emission_records')
      .whereIn('project_id', projectIdArray)
      .select(
        'project_id',
        db.raw(`strftime('${timeFormat}', date) as period`),
        db.raw('SUM(amount) as emissions'),
        db.raw('COUNT(*) as records')
      )
      .groupBy('project_id', db.raw(`strftime('${timeFormat}', date)`))
      .orderBy('period');

    // 獲取項目總體統計
    const projectTotals = await db('emission_records')
      .whereIn('project_id', projectIdArray)
      .select('project_id')
      .sum('amount as total_emissions')
      .count('* as total_records')
      .groupBy('project_id');

    const reportData = {
      projects: projects,
      totals: projectTotals,
      timeseries: timeseriesData,
      period: period,
      generated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('生成對比報告失敗', 500);
  }
}));

// 導出CSV格式報告
reportRoutes.get('/export/csv', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { 
    project_id, 
    start_date, 
    end_date,
    include_categories = 'true' 
  } = req.query;
  
  try {
    let query = db('emission_records as er')
      .leftJoin('projects as p', 'er.project_id', 'p.id')
      .select(
        'er.id',
        'p.name as project_name',
        'er.stage',
        'er.description',
        'er.quantity',
        'er.unit',
        'er.amount',
        'er.date',
        'er.location',
        'er.notes',
        'er.created_at'
      );

    if (include_categories === 'true') {
      query = query
        .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
        .select(db.raw('ec.name as category_name'));
    }

    if (project_id) {
      query = query.where('er.project_id', project_id);
    }

    if (start_date) {
      query = query.where('er.date', '>=', start_date);
    }

    if (end_date) {
      query = query.where('er.date', '<=', end_date);
    }

    const records = await query.orderBy('er.date', 'desc');

    // 生成CSV格式的響應頭
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="carbon_emissions_report_${new Date().toISOString().split('T')[0]}.csv"`);

    // CSV標題行
    const headers = [
      '記錄ID', '項目名稱', '階段', '描述', '數量', '單位', 
      '排放量(kgCO2e)', '日期', '地點', '備註', '創建時間'
    ];

    if (include_categories === 'true') {
      headers.splice(3, 0, '排放類別');
    }

    let csvContent = headers.join(',') + '\n';

    // 添加數據行
    records.forEach(record => {
      const row = [
        record.id,
        `"${record.project_name || ''}"`,
        record.stage,
        `"${record.description || ''}"`,
        record.quantity,
        record.unit,
        record.amount,
        record.date,
        `"${record.location || ''}"`,
        `"${record.notes || ''}"`,
        record.created_at
      ];

      if (include_categories === 'true') {
        row.splice(3, 0, `"${record.category_name || ''}"`);
      }

      csvContent += row.join(',') + '\n';
    });

    res.send(csvContent);
  } catch (error) {
    throw new CustomError('導出CSV報告失敗', 500);
  }
})); 