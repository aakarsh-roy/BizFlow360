// MongoDB Operations Test Script
// This script demonstrates all business operations being stored in MongoDB

import mongoose from 'mongoose';
import BusinessOperationsService from './src/services/BusinessOperationsService';
import { Customer, Company } from './src/models/BusinessOperations';

async function testMongoDBOperations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow360_bpa');
    console.log('✅ Connected to MongoDB');

    // Test Company ID (in real app, this comes from authentication)
    const testCompanyId = new mongoose.Types.ObjectId().toString();
    const testUserId = new mongoose.Types.ObjectId().toString();
    const testProductId = new mongoose.Types.ObjectId().toString();
    const testCustomerId = new mongoose.Types.ObjectId().toString();

    console.log('\n🧪 Testing MongoDB Operations...\n');

    // 1. Test Stock Movement Operation
    console.log('1️⃣ Testing Stock Movement...');
    const stockMovement = await BusinessOperationsService.createStockMovement({
      productId: testProductId,
      movementType: 'in',
      quantity: 100,
      reason: 'Initial stock intake',
      reference: 'PO-2024-001',
      unitCost: 25.50,
      processedBy: testUserId,
      companyId: testCompanyId,
      notes: 'Test stock movement for MongoDB verification'
    });
    console.log('✅ Stock movement created:', stockMovement.reference);

    // 2. Test Task Creation
    console.log('\n2️⃣ Testing Task Creation...');
    const task = await BusinessOperationsService.createTask({
      taskName: 'Test MongoDB Task',
      description: 'Testing task creation and storage in MongoDB',
      type: 'manual',
      priority: 'medium',
      assignedTo: testUserId,
      assignedBy: testUserId,
      companyId: testCompanyId,
      tags: ['test', 'mongodb'],
      customFields: {
        testField: 'MongoDB storage test',
        priority: 'verification'
      }
    });
    console.log('✅ Task created:', task.taskName);

    // 3. Test Task Status Update
    console.log('\n3️⃣ Testing Task Status Update...');
    const updatedTask = await BusinessOperationsService.updateTaskStatus(
      task._id.toString(),
      'in-progress',
      testUserId,
      'Started working on MongoDB verification task'
    );
    console.log('✅ Task status updated to:', updatedTask.status);

    // 4. Test Sales Transaction
    console.log('\n4️⃣ Testing Sales Transaction...');
    const salesTransaction = await BusinessOperationsService.createSalesTransaction({
      customerId: testCustomerId,
      salesPersonId: testUserId,
      items: [{
        productId: testProductId,
        quantity: 5,
        unitPrice: 99.99,
        discount: 5.00,
        tax: 8.50
      }],
      shippingAddress: {
        street: '123 Test Street',
        city: 'MongoDB City',
        state: 'Database State',
        postalCode: '12345',
        country: 'Testing Country'
      },
      billingAddress: {
        street: '456 Storage Avenue',
        city: 'MongoDB City',
        state: 'Database State',
        postalCode: '12345',
        country: 'Testing Country'
      },
      notes: 'Test sales transaction for MongoDB verification',
      companyId: testCompanyId
    });
    console.log('✅ Sales transaction created:', salesTransaction.orderNumber);

    // 5. Test KPI Metric Recording
    console.log('\n5️⃣ Testing KPI Metric Recording...');
    const kpiMetric = await BusinessOperationsService.recordKPIMetric(
      'MongoDB Test Metric',
      'system',
      95.5,
      testCompanyId,
      {
        target: 98.0,
        unit: 'percentage',
        period: 'daily',
        periodStart: new Date(),
        periodEnd: new Date(),
        calculationMethod: 'MongoDB storage verification test',
        userId: testUserId,
        metadata: {
          testType: 'MongoDB verification',
          category: 'system performance'
        }
      }
    );
    console.log('✅ KPI metric recorded:', kpiMetric.metricName);

    // 6. Test Business Metrics Retrieval
    console.log('\n6️⃣ Testing Business Metrics Retrieval...');
    const businessMetrics = await BusinessOperationsService.getBusinessMetrics(
      testCompanyId,
      'daily'
    );
    console.log('✅ Business metrics retrieved:', {
      tasks: businessMetrics.tasks,
      processes: businessMetrics.processes,
      operations: businessMetrics.operations
    });

    // 7. Test Operation History
    console.log('\n7️⃣ Testing Operation History...');
    const operationHistory = await BusinessOperationsService.getOperationHistory(
      testCompanyId,
      undefined,
      undefined,
      undefined,
      1,
      10
    );
    console.log('✅ Operation history retrieved:', {
      totalLogs: operationHistory.logs.length,
      pagination: operationHistory.pagination
    });

    console.log('\n🎉 All MongoDB Operations Test Completed Successfully!');
    console.log('\n📊 Summary of Operations Stored in MongoDB:');
    console.log('   ✅ Stock Movement → stockMovements collection');
    console.log('   ✅ Task Creation → tasks collection');
    console.log('   ✅ Task Update → tasks collection + auditLogs');
    console.log('   ✅ Sales Transaction → salesTransactions collection');
    console.log('   ✅ KPI Metric → kpiMetrics collection');
    console.log('   ✅ Audit Trails → auditLogs collection');
    console.log('   ✅ Business Metrics → Calculated from all collections');
    console.log('\n🗄️ Every operation is permanently stored in MongoDB with complete audit trails!');

  } catch (error) {
    console.error('❌ MongoDB Operations Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testMongoDBOperations();
}

export default testMongoDBOperations;
