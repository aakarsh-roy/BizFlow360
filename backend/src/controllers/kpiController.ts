import { Request, Response } from 'express';
import KPI from '../models/KPI';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all KPIs with filtering and aggregation
// @route   GET /api/kpi
// @access  Private
export const getKPIs = async (req: AuthRequest, res: Response) => {
  try {
    console.log(`🔍 KPI Request received - User:`, req.user);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = { 
      companyId: req.user.companyId || req.user._id,
      isActive: true 
    };
    
    console.log(`🔍 Initial filter:`, filter);
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Handle period filtering with time ranges
    if (req.query.period) {
      const period = req.query.period as string;
      
      // If period is a time range like '7d', '30d', etc., use date filtering instead
      if (period.match(/^\d+d$/)) {
        const days = parseInt(period.replace('d', ''));
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);
        filter.date = { $gte: dateFrom };
        console.log(`🔍 Time range filter: ${days} days, from ${dateFrom}`);
      } else {
        // Direct period match for exact period values
        filter.period = period;
      }
    }
    
    if (req.query.dateFrom || req.query.dateTo) {
      if (!filter.date) filter.date = {};
      if (req.query.dateFrom) {
        filter.date.$gte = new Date(req.query.dateFrom as string);
      }
      if (req.query.dateTo) {
        filter.date.$lte = new Date(req.query.dateTo as string);
      }
    }

    const kpis = await KPI.find(filter)
      .populate('metadata.updatedBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await KPI.countDocuments(filter);

    console.log(`📊 KPI Query Result: Found ${kpis.length} KPIs out of ${total} total`);
    console.log(`🔍 Filter used:`, filter);
    console.log(`📄 Pagination: page ${page}, limit ${limit}, skip ${skip}`);

    res.json({
      success: true,
      data: {
        kpis,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get KPI dashboard summary
// @route   GET /api/kpi/dashboard
// @access  Private
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user.companyId || req.user._id;
    
    // Get latest KPIs by category
    const latestKPIs = await KPI.aggregate([
      {
        $match: {
          companyId: companyId,
          isActive: true
        }
      },
      {
        $sort: { date: -1, createdAt: -1 }
      },
      {
        $group: {
          _id: '$category',
          latestKPI: { $first: '$$ROOT' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get trend data for charts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendData = await KPI.aggregate([
      {
        $match: {
          companyId: companyId,
          isActive: true,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            category: '$category',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
          },
          totalValue: { $sum: '$value' },
          averageValue: { $avg: '$value' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Calculate overall performance
    const totalKPIs = await KPI.countDocuments({ companyId, isActive: true });
    const achievedTargets = await KPI.countDocuments({ 
      companyId, 
      isActive: true,
      $expr: { $gte: ['$value', '$target'] }
    });
    
    const performanceRate = totalKPIs > 0 ? (achievedTargets / totalKPIs) * 100 : 0;

    res.json({
      success: true,
      data: {
        categories: latestKPIs,
        trends: trendData,
        summary: {
          totalKPIs,
          achievedTargets,
          performanceRate: Math.round(performanceRate),
          lastUpdated: new Date()
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get advanced analytics data
// @route   GET /api/kpi/analytics
// @access  Private
export const getAdvancedAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user.companyId || req.user._id;
    const days = parseInt(req.query.days as string) || 30;
    
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Performance trends by category
    const categoryTrends = await KPI.aggregate([
      {
        $match: {
          companyId: companyId,
          isActive: true,
          date: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: '$category',
          avgPerformance: { $avg: { $divide: ['$value', '$target'] } },
          totalMetrics: { $sum: 1 },
          achievedTargets: {
            $sum: {
              $cond: [{ $gte: ['$value', '$target'] }, 1, 0]
            }
          },
          trends: {
            $push: {
              date: '$date',
              value: '$value',
              target: '$target',
              achievement: { $divide: ['$value', '$target'] }
            }
          }
        }
      },
      {
        $addFields: {
          achievementRate: { $divide: ['$achievedTargets', '$totalMetrics'] }
        }
      }
    ]);

    // Monthly comparison data
    const monthlyComparison = await KPI.aggregate([
      {
        $match: {
          companyId: companyId,
          isActive: true,
          date: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          avgValue: { $avg: '$value' },
          avgTarget: { $avg: '$target' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top and bottom performers
    const performers = await KPI.aggregate([
      {
        $match: {
          companyId: companyId,
          isActive: true
        }
      },
      {
        $addFields: {
          performance: { $divide: ['$value', '$target'] }
        }
      },
      {
        $sort: { performance: -1 }
      },
      {
        $group: {
          _id: null,
          topPerformers: { $push: { $cond: [{ $lte: ['$$ROOT.performance', 2] }, '$$ROOT', '$$REMOVE'] } },
          bottomPerformers: { $push: { $cond: [{ $gte: ['$$ROOT.performance', 0.5] }, '$$ROOT', '$$REMOVE'] } }
        }
      },
      {
        $project: {
          topPerformers: { $slice: ['$topPerformers', 5] },
          bottomPerformers: { $slice: [{ $reverseArray: '$bottomPerformers' }, 5] }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryTrends,
        monthlyComparison,
        performers: performers[0] || { topPerformers: [], bottomPerformers: [] },
        analysisDate: new Date(),
        timeRange: `${days} days`
      }
    });
  } catch (error: any) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get forecasting data
// @route   GET /api/kpi/forecast
// @access  Private
export const getForecastData = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user.companyId || req.user._id;
    const metricId = req.query.metricId as string;
    const forecastDays = parseInt(req.query.days as string) || 30;

    let filter: any = { companyId: companyId, isActive: true };
    if (metricId) {
      filter._id = metricId;
    }

    // Get historical data for the last 90 days
    const historicalDate = new Date();
    historicalDate.setDate(historicalDate.getDate() - 90);
    filter.date = { $gte: historicalDate };

    const historicalData = await KPI.find(filter)
      .sort({ date: 1 })
      .limit(100);

    // Simple linear regression for forecasting (mock implementation)
    const generateForecast = (data: any[]) => {
      if (data.length < 2) return [];
      
      const forecast = [];
      const lastValue = data[data.length - 1].value;
      const trend = data.length > 1 ? 
        (data[data.length - 1].value - data[0].value) / data.length : 0;

      for (let i = 1; i <= forecastDays; i++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + i);
        
        const forecastValue = lastValue + (trend * i);
        forecast.push({
          date: forecastDate,
          predictedValue: Math.max(0, forecastValue),
          confidence: Math.max(0.3, 1 - (i / forecastDays) * 0.4) // Decreasing confidence
        });
      }
      
      return forecast;
    };

    const forecast = generateForecast(historicalData);

    res.json({
      success: true,
      data: {
        historical: historicalData,
        forecast: forecast,
        metadata: {
          forecastDays,
          dataPoints: historicalData.length,
          generatedAt: new Date()
        }
      }
    });
  } catch (error: any) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new KPI
// @route   POST /api/kpi
// @access  Private
export const createKPI = async (req: AuthRequest, res: Response) => {
  try {
    const kpiData = {
      ...req.body,
      companyId: req.user.companyId || req.user._id,
      metadata: {
        ...req.body.metadata,
        updatedBy: req.user._id,
        lastUpdated: new Date()
      }
    };

    const kpi = await KPI.create(kpiData);
    
    const populatedKPI = await KPI.findById(kpi._id)
      .populate('metadata.updatedBy', 'name email');

    res.status(201).json({ 
      success: true, 
      message: 'KPI created successfully',
      data: populatedKPI 
    });
  } catch (error: any) {
    console.error('Error creating KPI:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update KPI
// @route   PUT /api/kpi/:id
// @access  Private
export const updateKPI = async (req: AuthRequest, res: Response) => {
  try {
    const kpi = await KPI.findById(req.params.id);

    if (!kpi) {
      return res.status(404).json({ success: false, message: 'KPI not found' });
    }

    // Store previous value for trend calculation
    const updateData = {
      ...req.body,
      previousValue: kpi.value,
      metadata: {
        ...req.body.metadata,
        updatedBy: req.user._id,
        lastUpdated: new Date()
      }
    };

    const updatedKPI = await KPI.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('metadata.updatedBy', 'name email');

    res.json({
      success: true,
      message: 'KPI updated successfully',
      data: updatedKPI
    });
  } catch (error: any) {
    console.error('Error updating KPI:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete KPI
// @route   DELETE /api/kpi/:id
// @access  Private
export const deleteKPI = async (req: Request, res: Response) => {
  try {
    const kpi = await KPI.findById(req.params.id);

    if (!kpi) {
      return res.status(404).json({ success: false, message: 'KPI not found' });
    }

    // Soft delete
    await KPI.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ 
      success: true, 
      message: 'KPI deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting KPI:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get KPI analytics and insights
// @route   GET /api/kpi/analytics
// @access  Private
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user.companyId || req.user._id;
    
    // Performance analytics by category
    const categoryAnalytics = await KPI.aggregate([
      {
        $match: {
          companyId: companyId,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          totalKPIs: { $sum: 1 },
          averageValue: { $avg: '$value' },
          averageTarget: { $avg: '$target' },
          achievementRate: {
            $avg: {
              $multiply: [
                { $divide: ['$value', '$target'] },
                100
              ]
            }
          },
          topPerformer: { $max: '$value' },
          lowestPerformer: { $min: '$value' }
        }
      }
    ]);

    // Monthly trends
    const monthlyTrends = await KPI.aggregate([
      {
        $match: {
          companyId: companyId,
          isActive: true,
          date: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          totalValue: { $sum: '$value' },
          averageValue: { $avg: '$value' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryAnalytics,
        monthlyTrends,
        generatedAt: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
