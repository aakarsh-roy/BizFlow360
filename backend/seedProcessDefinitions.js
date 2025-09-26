const mongoose = require('mongoose');
require('dotenv').config();

// ProcessDefinition Schema (simplified for seeding)
const processDefinitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, default: '1.0' },
  description: { type: String },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  definition: { type: mongoose.Schema.Types.Mixed },
  permissions: [String],
  tags: [String],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

const ProcessDefinition = mongoose.model('ProcessDefinition', processDefinitionSchema);

async function seedProcessDefinitions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if process definitions already exist
    const existingCount = await ProcessDefinition.countDocuments();
    console.log(`Found ${existingCount} existing process definitions`);

    // Clear existing definitions first to ensure correct structure
    if (existingCount > 0) {
      await ProcessDefinition.deleteMany({});
      console.log('Cleared existing process definitions');
    }

    if (true) { // Always recreate for now
      console.log('Seeding process definitions...');
      
      const sampleDefinitions = [
        {
          name: 'Invoice Approval Process',
          version: '1.2',
          description: 'Standard invoice approval workflow for finance department',
          category: 'Finance',
          isActive: true,
          definition: {
            nodes: [
              { id: 'start_1', type: 'start', name: 'Start', position: { x: 100, y: 100 }, config: {}, connections: ['finance_review'] },
              { id: 'finance_review', type: 'task', name: 'Finance Review', position: { x: 200, y: 100 }, config: {}, connections: ['manager_approval'] },
              { id: 'manager_approval', type: 'approval', name: 'Manager Approval', position: { x: 300, y: 100 }, config: {}, connections: ['payment_processing'] },
              { id: 'payment_processing', type: 'service', name: 'Payment Processing', position: { x: 400, y: 100 }, config: {}, connections: ['end_1'] },
              { id: 'end_1', type: 'end', name: 'End', position: { x: 500, y: 100 }, config: {}, connections: [] }
            ],
            variables: {}
          },
          tags: ['finance', 'approval', 'invoice'],
          permissions: ['FINANCE_USER', 'MANAGER']
        },
        {
          name: 'Employee Onboarding',
          version: '2.1',
          description: 'New employee onboarding process for HR department',
          category: 'HR',
          isActive: true,
          definition: {
            nodes: [
              { id: 'start_1', type: 'start', name: 'Start', position: { x: 100, y: 100 }, config: {}, connections: ['create_profile'] },
              { id: 'create_profile', type: 'task', name: 'Create Employee Profile', position: { x: 200, y: 100 }, config: {}, connections: ['background_check'] },
              { id: 'background_check', type: 'service', name: 'Background Check', position: { x: 300, y: 100 }, config: {}, connections: ['equipment_assignment'] },
              { id: 'equipment_assignment', type: 'task', name: 'Equipment Assignment', position: { x: 400, y: 100 }, config: {}, connections: ['training_schedule'] },
              { id: 'training_schedule', type: 'task', name: 'Training Schedule', position: { x: 500, y: 100 }, config: {}, connections: ['end_1'] },
              { id: 'end_1', type: 'end', name: 'End', position: { x: 600, y: 100 }, config: {}, connections: [] }
            ],
            variables: {}
          },
          tags: ['hr', 'onboarding', 'employee'],
          permissions: ['HR_USER', 'MANAGER']
        },
        {
          name: 'Vendor Payment Process',
          version: '1.0',
          description: 'Vendor payment authorization workflow for procurement',
          category: 'Procurement',
          isActive: true,
          definition: {
            nodes: [
              { id: 'start_1', type: 'start', name: 'Start', position: { x: 100, y: 100 }, config: {}, connections: ['verify_invoice'] },
              { id: 'verify_invoice', type: 'task', name: 'Verify Invoice', position: { x: 200, y: 100 }, config: {}, connections: ['budget_check'] },
              { id: 'budget_check', type: 'service', name: 'Budget Check', position: { x: 300, y: 100 }, config: {}, connections: ['cfo_approval'] },
              { id: 'cfo_approval', type: 'approval', name: 'CFO Approval', position: { x: 400, y: 100 }, config: {}, connections: ['execute_payment'] },
              { id: 'execute_payment', type: 'service', name: 'Execute Payment', position: { x: 500, y: 100 }, config: {}, connections: ['end_1'] },
              { id: 'end_1', type: 'end', name: 'End', position: { x: 600, y: 100 }, config: {}, connections: [] }
            ],
            variables: {}
          },
          tags: ['procurement', 'payment', 'vendor'],
          permissions: ['PROCUREMENT_USER', 'CFO']
        },
        {
          name: 'Purchase Order Approval',
          version: '1.5',
          description: 'Purchase order approval workflow with multi-level approval',
          category: 'Procurement',
          isActive: true,
          definition: {
            nodes: [
              { id: 'start_1', type: 'start', name: 'Start', position: { x: 100, y: 100 }, config: {}, connections: ['department_approval'] },
              { id: 'department_approval', type: 'approval', name: 'Department Head Approval', position: { x: 200, y: 100 }, config: {}, connections: ['budget_validation'] },
              { id: 'budget_validation', type: 'service', name: 'Budget Validation', position: { x: 300, y: 100 }, config: {}, connections: ['procurement_review'] },
              { id: 'procurement_review', type: 'task', name: 'Procurement Review', position: { x: 400, y: 100 }, config: {}, connections: ['final_approval'] },
              { id: 'final_approval', type: 'approval', name: 'Final Approval', position: { x: 500, y: 100 }, config: {}, connections: ['end_1'] },
              { id: 'end_1', type: 'end', name: 'End', position: { x: 600, y: 100 }, config: {}, connections: [] }
            ],
            variables: {}
          },
          tags: ['procurement', 'purchase-order', 'approval'],
          permissions: ['PROCUREMENT_USER', 'DEPARTMENT_HEAD', 'MANAGER']
        },
        {
          name: 'Leave Request Process',
          version: '1.1',
          description: 'Employee leave request and approval process',
          category: 'HR',
          isActive: true,
          definition: {
            nodes: [
              { id: 'start_1', type: 'start', name: 'Start', position: { x: 100, y: 100 }, config: {}, connections: ['manager_review'] },
              { id: 'manager_review', type: 'approval', name: 'Manager Review', position: { x: 200, y: 100 }, config: {}, connections: ['hr_validation'] },
              { id: 'hr_validation', type: 'task', name: 'HR Validation', position: { x: 300, y: 100 }, config: {}, connections: ['calendar_update'] },
              { id: 'calendar_update', type: 'service', name: 'Update Calendar', position: { x: 400, y: 100 }, config: {}, connections: ['end_1'] },
              { id: 'end_1', type: 'end', name: 'End', position: { x: 500, y: 100 }, config: {}, connections: [] }
            ],
            variables: {}
          },
          tags: ['hr', 'leave', 'approval'],
          permissions: ['EMPLOYEE', 'MANAGER', 'HR_USER']
        }
      ];

      const result = await ProcessDefinition.insertMany(sampleDefinitions);
      console.log(`Successfully created ${result.length} process definitions`);
      
      // Display the created definitions
      result.forEach(def => {
        console.log(`- ${def.name} (${def.category}) - ${def.version}`);
      });
    } else {
      console.log('Process definitions already exist, skipping seeding');
      
      // Display existing definitions
      const definitions = await ProcessDefinition.find({}, 'name category version isActive');
      console.log('Existing process definitions:');
      definitions.forEach(def => {
        console.log(`- ${def.name} (${def.category}) - ${def.version} - Active: ${def.isActive}`);
      });
    }

    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding process definitions:', error);
    process.exit(1);
  }
}

seedProcessDefinitions();