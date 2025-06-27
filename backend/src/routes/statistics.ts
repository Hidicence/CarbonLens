import { Router, Request, Response } from 'express';
import { getDatabase } from '../database/setup';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';

export const statisticsRoutes = Router();

// 總體統計概覽
statisticsRoutes.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  
  try {
    // 項目總數和狀態分布
    const projectStats = await db('projects')
      .select('status')
      .count('* as count')
      .groupBy('status');

    // 總碳排放量
    const totalEmissions = await db('emission_records')
      .sum('amount as total')
      .first();

    // 月度排放趨勢 (最近12個月)
    const monthlyEmissions = await db('emission_records')
      .select(
        db.raw("strftime('%Y-%m', date) as month"),
        db.raw('SUM(amount) as emissions'),
        db.raw('COUNT(*) as records')
      )
      .where('date', '>=', format(subMonths(new Date(), 12), 'yyyy-MM-dd'))
      .groupBy(db.raw("strftime('%Y-%m', date)"))
      .orderBy('month');

    // 分類排放統計
    const categoryStats = await db('emission_records as er')
      .join('emission_categories as ec', 'er.category_id', 'ec.id')
      .select('ec.name', 'ec.color')
      .sum('er.amount as total')
      .count('er.id as count')
      .groupBy('ec.id', 'ec.name', 'ec.color')
      .orderBy('total', 'desc');

    // 階段分布
    const stageStats = await db('emission_records')
      .select('stage')
      .sum('amount as total')
      .count('* as count')
      .groupBy('stage');

    res.json({
      success: true,
      data: {
        projects: {
          total: projectStats.reduce((sum, stat) => sum + Number(stat.count), 0),
          byStatus: projectStats
        },
        emissions: {
          total: totalEmissions?.total || 0,
          monthly: monthlyEmissions,
          byCategory: categoryStats,
          byStage: stageStats
        }
      }
    });
  } catch (error) {
    throw new CustomError('獲取統計概覽失敗', 500);
  }
}));

// 項目排放排行榜
statisticsRoutes.get('/projects/ranking', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { period = '30', limit = '10' } = req.query;
  
  const days = parseInt(period as string);
  const limitNum = parseInt(limit as string);
  const dateFrom = format(subDays(new Date(), days), 'yyyy-MM-dd');

  const ranking = await db('emission_records as er')
    .join('projects as p', 'er.project_id', 'p.id')
    .select('p.id', 'p.name', 'p.color')
    .sum('er.amount as total_emissions')
    .count('er.id as record_count')
    .where('er.date', '>=', dateFrom)
    .groupBy('p.id', 'p.name', 'p.color')
    .orderBy('total_emissions', 'desc')
    .limit(limitNum);

  res.json({
    success: true,
    data: {
      period: `${days} 天`,
      ranking
    }
  });
}));

// 時間範圍統計
statisticsRoutes.get('/timeline', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { start_date, end_date, granularity = 'day' } = req.query;

  if (!start_date || !end_date) {
    throw new CustomError('需要提供開始和結束日期', 400);
  }

  let dateFormat = '%Y-%m-%d';
  let groupBy = "strftime('%Y-%m-%d', date)";

  if (granularity === 'month') {
    dateFormat = '%Y-%m';
    groupBy = "strftime('%Y-%m', date)";
  } else if (granularity === 'year') {
    dateFormat = '%Y';
    groupBy = "strftime('%Y', date)";
  }

  const timeline = await db('emission_records as er')
    .leftJoin('projects as p', 'er.project_id', 'p.id')
    .leftJoin('emission_categories as ec', 'er.category_id', 'ec.id')
    .select(
      db.raw(`${groupBy} as period`),
      db.raw('SUM(er.amount) as emissions'),
      db.raw('COUNT(er.id) as records'),
      db.raw('COUNT(DISTINCT er.project_id) as active_projects')
    )
    .whereBetween('er.date', [start_date as string, end_date as string])
    .groupBy(db.raw(groupBy))
    .orderBy('period');

  res.json({
    success: true,
    data: {
      granularity,
      period: {
        start: start_date,
        end: end_date
      },
      timeline
    }
  });
}));

// 排放類別深度分析
statisticsRoutes.get('/categories/analysis', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  const { category_id } = req.query;

  let query = db('emission_records as er')
    .join('emission_categories as ec', 'er.category_id', 'ec.id')
    .leftJoin('projects as p', 'er.project_id', 'p.id');

  if (category_id) {
    query = query.where('ec.id', category_id);
  }

  // 按階段分析
  const stageAnalysis = await query.clone()
    .select('er.stage', 'ec.name as category')
    .sum('er.amount as total')
    .avg('er.amount as average')
    .count('er.id as count')
    .groupBy('er.stage', 'ec.name');

  // 按月份趋势
  const monthlyTrend = await query.clone()
    .select(
      db.raw("strftime('%Y-%m', er.date) as month"),
      'ec.name as category'
    )
    .sum('er.amount as emissions')
    .where('er.date', '>=', format(subMonths(new Date(), 6), 'yyyy-MM-dd'))
    .groupBy(db.raw("strftime('%Y-%m', er.date)"), 'ec.name')
    .orderBy('month');

  // 前十大排放記錄
  const topRecords = await query.clone()
    .select('er.description', 'er.amount', 'er.date', 'p.name as project', 'ec.name as category')
    .orderBy('er.amount', 'desc')
    .limit(10);

  res.json({
    success: true,
    data: {
      stageAnalysis,
      monthlyTrend,
      topRecords
    }
  });
}));

// 效率分析
statisticsRoutes.get('/efficiency', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();

  // 計算各項目的排放效率 (排放量/天數)
  const projectEfficiency = await db('projects as p')
    .leftJoin('emission_records as er', 'p.id', 'er.project_id')
    .select(
      'p.id',
      'p.name',
      'p.start_date',
      'p.end_date',
      db.raw('SUM(er.amount) as total_emissions'),
      db.raw('COUNT(er.id) as record_count'),
      db.raw(`
        CASE 
          WHEN p.end_date IS NOT NULL THEN 
            julianday(p.end_date) - julianday(p.start_date) + 1
          ELSE 
            julianday('now') - julianday(p.start_date) + 1
        END as duration_days
      `),
      db.raw(`
        CASE 
          WHEN p.end_date IS NOT NULL THEN 
            SUM(er.amount) / (julianday(p.end_date) - julianday(p.start_date) + 1)
          ELSE 
            SUM(er.amount) / (julianday('now') - julianday(p.start_date) + 1)
        END as emissions_per_day
      `)
    )
    .where('p.start_date', 'is not', null)
    .groupBy('p.id')
    .havingRaw('SUM(er.amount) > 0')
    .orderBy('emissions_per_day', 'desc');

  // 階段效率比較
  const stageEfficiency = await db('emission_records')
    .select('stage')
    .sum('amount as total')
    .count('* as records')
    .avg('amount as average_per_record')
    .groupBy('stage')
    .orderBy('total', 'desc');

  res.json({
    success: true,
    data: {
      projectEfficiency,
      stageEfficiency
    }
  });
}));

// 預測和趨勢分析
statisticsRoutes.get('/forecast', asyncHandler(async (req: Request, res: Response) => {
  const db = getDatabase();
  
  // 簡單的線性趨勢預測 (基於最近3個月數據)
  const recentData = await db('emission_records')
    .select(
      db.raw("strftime('%Y-%m', date) as month"),
      db.raw('SUM(amount) as emissions')
    )
    .where('date', '>=', format(subMonths(new Date(), 3), 'yyyy-MM-dd'))
    .groupBy(db.raw("strftime('%Y-%m', date)"))
    .orderBy('month');

  // 計算趨勢 (簡化版本)
  let trend = 'stable';
  if (recentData.length >= 2) {
    const recent = recentData[recentData.length - 1].emissions;
    const previous = recentData[recentData.length - 2].emissions;
    const change = ((recent - previous) / previous) * 100;
    
    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';
  }

  res.json({
    success: true,
    data: {
      recentData,
      trend,
      insights: [
        trend === 'increasing' ? '排放量呈上升趨勢，建議加強減排措施' : 
        trend === 'decreasing' ? '排放量呈下降趨勢，減排效果良好' :
        '排放量相對穩定'
      ]
    }
  });
})); 