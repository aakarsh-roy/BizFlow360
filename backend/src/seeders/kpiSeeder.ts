import mongoose from 'mongoose';
import KPI from '../models/KPI';
import User from '../models/User';

export const seedKPIData = async () => {
  try {
    console.log('🌱 Starting KPI data seeding...');

    // Get or create admin user
    let adminUser = await User.findOne({ email: 'admin@bpa.com' });
    if (!adminUser) {
      console.log('⚠️ Admin user not found, creating default admin...');
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@bpa.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
    }

    const companyId = adminUser._id; // Use user ID as company ID

    // Clear existing KPI data for this company
    await KPI.deleteMany({ companyId });

    // Generate sample KPI data for the last 30 days
    const sampleKPIs = [];
    const categories = ['revenue', 'users', 'sales', 'performance', 'finance', 'operational'];
    const kpiTemplates = [
      // Revenue KPIs
      { name: 'Monthly Revenue', category: 'revenue', unit: 'USD', target: 100000, baseValue: 85000 },
      { name: 'Quarterly Revenue', category: 'revenue', unit: 'USD', target: 300000, baseValue: 280000 },
      { name: 'Annual Revenue', category: 'revenue', unit: 'USD', target: 1200000, baseValue: 950000 },
      
      // User KPIs
      { name: 'Active Users', category: 'users', unit: 'users', target: 5000, baseValue: 4200 },
      { name: 'New User Registrations', category: 'users', unit: 'users', target: 500, baseValue: 450 },
      { name: 'User Retention Rate', category: 'users', unit: '%', target: 85, baseValue: 78 },
      { name: 'Monthly Active Users', category: 'users', unit: 'users', target: 8000, baseValue: 7200 },
      
      // Sales KPIs
      { name: 'Monthly Sales', category: 'sales', unit: 'units', target: 1000, baseValue: 850 },
      { name: 'Conversion Rate', category: 'sales', unit: '%', target: 15, baseValue: 12.5 },
      { name: 'Average Order Value', category: 'sales', unit: 'USD', target: 150, baseValue: 135 },
      { name: 'Sales Growth', category: 'sales', unit: '%', target: 20, baseValue: 18 },
      
      // Performance KPIs
      { name: 'Website Load Time', category: 'performance', unit: 'seconds', target: 2, baseValue: 2.5 },
      { name: 'Server Uptime', category: 'performance', unit: '%', target: 99.9, baseValue: 99.5 },
      { name: 'API Response Time', category: 'performance', unit: 'ms', target: 200, baseValue: 250 },
      { name: 'Error Rate', category: 'performance', unit: '%', target: 1, baseValue: 1.2 },
      
      // Finance KPIs
      { name: 'Gross Profit Margin', category: 'finance', unit: '%', target: 40, baseValue: 35 },
      { name: 'Operating Expenses', category: 'finance', unit: 'USD', target: 50000, baseValue: 52000 },
      { name: 'Cash Flow', category: 'finance', unit: 'USD', target: 20000, baseValue: 18000 },
      { name: 'ROI', category: 'finance', unit: '%', target: 25, baseValue: 22 },
      
      // Operational KPIs
      { name: 'Customer Satisfaction', category: 'operational', unit: 'score', target: 4.5, baseValue: 4.2 },
      { name: 'Task Completion Rate', category: 'operational', unit: '%', target: 95, baseValue: 88 },
      { name: 'Employee Productivity', category: 'operational', unit: 'score', target: 85, baseValue: 80 },
      { name: 'Inventory Turnover', category: 'operational', unit: 'times', target: 12, baseValue: 10 }
    ];

    // Generate data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      for (const template of kpiTemplates) {
        // Add some randomness to make data realistic
        const variance = 0.1; // 10% variance
        const randomFactor = 1 + (Math.random() - 0.5) * variance;
        const currentValue = Math.round(template.baseValue * randomFactor);
        
        // Calculate previous value for trend
        const previousValue = i < 29 ? 
          Math.round(template.baseValue * (1 + (Math.random() - 0.5) * variance)) : 
          undefined;

        const kpi = {
          name: template.name,
          category: template.category,
          value: currentValue,
          target: template.target,
          unit: template.unit,
          period: 'daily',
          date: date,
          previousValue: previousValue,
          description: `Sample ${template.name} data for ${date.toDateString()}`,
          companyId: companyId,
          isActive: true,
          metadata: {
            source: 'seeder',
            calculationMethod: 'automated',
            updatedBy: adminUser._id,
            lastUpdated: new Date()
          }
        };

        sampleKPIs.push(kpi);
      }
    }

    // Insert sample data
    const insertedKPIs = await KPI.insertMany(sampleKPIs);
    console.log(`✅ Successfully seeded ${insertedKPIs.length} KPI records`);

    // Generate summary
    const summary = await KPI.aggregate([
      { $match: { companyId } },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          avgTarget: { $avg: '$target' }
        } 
      }
    ]);

    console.log('📊 KPI Data Summary:');
    summary.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} records, Avg Value: ${cat.avgValue.toFixed(2)}, Avg Target: ${cat.avgTarget.toFixed(2)}`);
    });

    return { success: true, count: insertedKPIs.length, summary };
  } catch (error) {
    console.error('❌ Error seeding KPI data:', error);
    throw error;
  }
};

// Function to continuously update KPIs (simulate real-time data)
export const simulateRealTimeUpdates = async () => {
  try {
    const kpis = await KPI.find({ isActive: true }).limit(10);
    
    for (const kpi of kpis) {
      // Add small random changes
      const variance = 0.05; // 5% variance
      const change = (Math.random() - 0.5) * variance;
      const newValue = Math.max(0, Math.round(kpi.value * (1 + change)));
      
      await KPI.findByIdAndUpdate(kpi._id, {
        previousValue: kpi.value,
        value: newValue,
        'metadata.lastUpdated': new Date()
      });
    }
    
    console.log(`🔄 Updated ${kpis.length} KPIs with simulated real-time data`);
  } catch (error) {
    console.error('❌ Error in real-time simulation:', error);
  }
};
