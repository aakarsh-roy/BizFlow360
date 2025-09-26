// Test script to verify process instances are being created correctly
const mongoose = require('mongoose');
require('dotenv').config();

// ProcessInstance Schema (simplified for testing)
const processInstanceSchema = new mongoose.Schema({
  processDefinitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcessDefinition', required: true },
  businessKey: { type: String, required: true },
  status: { type: String, enum: ['running', 'completed', 'failed', 'suspended', 'cancelled'], default: 'running' },
  variables: { type: mongoose.Schema.Types.Mixed, default: {} },
  currentStep: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  auditLog: [{
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: mongoose.Schema.Types.Mixed }
  }],
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, {
  timestamps: true
});

const ProcessInstance = mongoose.model('ProcessInstance', processInstanceSchema);

// ProcessDefinition Schema
const processDefinitionSchema = new mongoose.Schema({
  name: String,
  version: String,
  category: String,
  isActive: Boolean
});

const ProcessDefinition = mongoose.model('ProcessDefinition', processDefinitionSchema);

async function testProcessInstances() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get existing process instances
    const instances = await ProcessInstance.find({})
      .populate('processDefinitionId', 'name version category')
      .populate('initiatedBy', 'name email')
      .sort({ startTime: -1 })
      .limit(10);

    console.log(`\nFound ${instances.length} process instances:`);
    instances.forEach((instance, index) => {
      const processName = instance.processDefinitionId ? instance.processDefinitionId.name : 'Unknown';
      const initiator = instance.initiatedBy ? instance.initiatedBy.name : 'Unknown User';
      
      console.log(`${index + 1}. ${processName}`);
      console.log(`   Business Key: ${instance.businessKey}`);
      console.log(`   Status: ${instance.status}`);
      console.log(`   Started: ${instance.startTime}`);
      console.log(`   Initiated by: ${initiator}`);
      console.log(`   Current Step: ${instance.currentStep}`);
      console.log(`   Variables: ${JSON.stringify(instance.variables)}`);
      console.log('');
    });

    // Get process definitions for reference
    const definitions = await ProcessDefinition.find({ isActive: true });
    console.log(`\nAvailable Process Definitions: ${definitions.length}`);
    definitions.forEach(def => {
      console.log(`- ${def.name} (${def.category}) - v${def.version}`);
    });

    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testProcessInstances();