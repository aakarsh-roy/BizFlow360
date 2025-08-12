# BizFlow360 - Complete Database Schema Setup

## 📊 **MONGODB COLLECTIONS REQUIRED**

### **1. Core Authentication & Users**
```javascript
// Users Collection (Enhanced)
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // bcrypt hashed
  role: String, // admin, manager, user, hr, finance, sales
  department: String,
  permissions: [String], // granular permissions
  profile: {
    avatar: String,
    phone: String,
    address: Object,
    preferences: Object
  },
  twoFactorEnabled: Boolean,
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Inventory Management**
```javascript
// Products Collection
{
  _id: ObjectId,
  sku: String,
  name: String,
  description: String,
  category: String,
  brand: String,
  unitPrice: Number,
  costPrice: Number,
  stockQuantity: Number,
  minStockLevel: Number,
  maxStockLevel: Number,
  reorderPoint: Number,
  unit: String,
  barcode: String,
  images: [String],
  isActive: Boolean,
  supplier: ObjectId,
  warehouse: ObjectId,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Suppliers Collection
{
  _id: ObjectId,
  name: String,
  companyName: String,
  email: String,
  phone: String,
  address: Object,
  contactPerson: Object,
  paymentTerms: Object,
  taxInfo: Object,
  rating: Number,
  isActive: Boolean,
  products: [ObjectId],
  totalOrders: Number,
  totalOrderValue: Number,
  lastOrderDate: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Stock Movements Collection
{
  _id: ObjectId,
  product: ObjectId,
  warehouse: ObjectId,
  movementType: String, // in, out, transfer, adjustment
  quantity: Number,
  unitCost: Number,
  totalValue: Number,
  referenceType: String,
  referenceId: ObjectId,
  reason: String,
  notes: String,
  performedBy: ObjectId,
  approvedBy: ObjectId,
  isApproved: Boolean,
  stockBefore: Number,
  stockAfter: Number,
  movementDate: Date,
  createdAt: Date,
  updatedAt: Date
}

// Warehouses Collection
{
  _id: ObjectId,
  name: String,
  code: String,
  location: Object,
  manager: ObjectId,
  capacity: Number,
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **3. CRM Module**
```javascript
// Customers Collection
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  company: String,
  address: Object,
  customerType: String, // individual, business
  status: String, // active, inactive, prospect
  assignedTo: ObjectId, // sales rep
  source: String, // website, referral, cold_call
  tags: [String],
  notes: String,
  totalOrders: Number,
  totalValue: Number,
  lastContactDate: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Leads Collection
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  company: String,
  source: String,
  status: String, // new, contacted, qualified, lost, converted
  score: Number, // lead scoring
  assignedTo: ObjectId,
  estimatedValue: Number,
  expectedCloseDate: Date,
  notes: String,
  activities: [Object],
  convertedTo: ObjectId, // customer id if converted
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Opportunities Collection
{
  _id: ObjectId,
  name: String,
  customer: ObjectId,
  stage: String, // prospect, proposal, negotiation, closed_won, closed_lost
  value: Number,
  probability: Number,
  expectedCloseDate: Date,
  actualCloseDate: Date,
  assignedTo: ObjectId,
  products: [Object],
  notes: String,
  activities: [Object],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **4. Finance Module**
```javascript
// Accounts Collection (Chart of Accounts)
{
  _id: ObjectId,
  code: String,
  name: String,
  type: String, // asset, liability, equity, income, expense
  parentAccount: ObjectId,
  isActive: Boolean,
  balance: Number,
  createdAt: Date,
  updatedAt: Date
}

// Transactions Collection
{
  _id: ObjectId,
  transactionNumber: String,
  date: Date,
  description: String,
  reference: String,
  entries: [Object], // debit/credit entries
  totalAmount: Number,
  status: String, // draft, posted, cancelled
  createdBy: ObjectId,
  approvedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Invoices Collection
{
  _id: ObjectId,
  invoiceNumber: String,
  customer: ObjectId,
  issueDate: Date,
  dueDate: Date,
  items: [Object],
  subtotal: Number,
  taxAmount: Number,
  totalAmount: Number,
  paidAmount: Number,
  status: String, // draft, sent, paid, overdue, cancelled
  paymentTerms: String,
  notes: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Expenses Collection
{
  _id: ObjectId,
  description: String,
  category: String,
  amount: Number,
  date: Date,
  receipt: String, // file path
  vendor: String,
  paymentMethod: String,
  status: String, // pending, approved, rejected, paid
  submittedBy: ObjectId,
  approvedBy: ObjectId,
  account: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **5. Project Management**
```javascript
// Projects Collection
{
  _id: ObjectId,
  name: String,
  description: String,
  status: String, // planning, active, on_hold, completed, cancelled
  priority: String, // low, medium, high, critical
  startDate: Date,
  endDate: Date,
  budget: Number,
  actualCost: Number,
  progress: Number, // percentage
  manager: ObjectId,
  team: [ObjectId],
  client: ObjectId,
  tags: [String],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Tasks Collection
{
  _id: ObjectId,
  title: String,
  description: String,
  project: ObjectId,
  assignedTo: ObjectId,
  status: String, // todo, in_progress, review, done
  priority: String,
  startDate: Date,
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  dependencies: [ObjectId], // other task ids
  tags: [String],
  attachments: [String],
  comments: [Object],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Timesheets Collection
{
  _id: ObjectId,
  user: ObjectId,
  project: ObjectId,
  task: ObjectId,
  date: Date,
  hours: Number,
  description: String,
  billable: Boolean,
  hourlyRate: Number,
  status: String, // draft, submitted, approved
  approvedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **6. HR & Payroll**
```javascript
// Employees Collection
{
  _id: ObjectId,
  employeeId: String,
  userId: ObjectId, // link to users collection
  personalInfo: Object,
  jobInfo: Object,
  salary: Object,
  benefits: Object,
  emergencyContacts: [Object],
  documents: [Object],
  isActive: Boolean,
  joinDate: Date,
  terminationDate: Date,
  createdAt: Date,
  updatedAt: Date
}

// Attendance Collection
{
  _id: ObjectId,
  employee: ObjectId,
  date: Date,
  checkIn: Date,
  checkOut: Date,
  workingHours: Number,
  overtimeHours: Number,
  status: String, // present, absent, half_day, leave
  location: Object, // GPS coordinates
  notes: String,
  createdAt: Date,
  updatedAt: Date
}

// Leave Requests Collection
{
  _id: ObjectId,
  employee: ObjectId,
  leaveType: String, // annual, sick, maternity, etc.
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  reason: String,
  status: String, // pending, approved, rejected
  approvedBy: ObjectId,
  appliedDate: Date,
  createdAt: Date,
  updatedAt: Date
}

// Payroll Collection
{
  _id: ObjectId,
  employee: ObjectId,
  payPeriod: String,
  basicSalary: Number,
  allowances: Object,
  deductions: Object,
  grossPay: Number,
  taxDeductions: Number,
  netPay: Number,
  status: String, // draft, processed, paid
  payDate: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **7. Workflow & Automation**
```javascript
// Workflows Collection
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String, // hr, finance, sales, etc.
  trigger: Object, // what starts the workflow
  steps: [Object], // workflow steps with conditions
  isActive: Boolean,
  template: Boolean, // is this a template
  usage: Number, // how many times used
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Workflow Instances Collection
{
  _id: ObjectId,
  workflow: ObjectId,
  initiatedBy: ObjectId,
  currentStep: Number,
  status: String, // running, completed, failed, cancelled
  data: Object, // workflow data
  history: [Object], // step execution history
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Approvals Collection
{
  _id: ObjectId,
  type: String, // expense, leave, purchase_order, etc.
  referenceId: ObjectId,
  requestedBy: ObjectId,
  approvers: [Object], // sequence of approvers
  currentApprover: ObjectId,
  status: String, // pending, approved, rejected
  comments: [Object],
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **8. Communication & Collaboration**
```javascript
// Messages Collection
{
  _id: ObjectId,
  sender: ObjectId,
  recipients: [ObjectId],
  subject: String,
  content: String,
  attachments: [Object],
  readBy: [Object], // who read and when
  messageType: String, // direct, group, workflow
  relatedTo: Object, // related entity
  createdAt: Date,
  updatedAt: Date
}

// Files Collection
{
  _id: ObjectId,
  name: String,
  originalName: String,
  path: String,
  size: Number,
  mimeType: String,
  versions: [Object], // version history
  uploadedBy: ObjectId,
  relatedTo: Object, // what entity this file belongs to
  permissions: Object, // who can view/edit
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### **9. Analytics & Reporting**
```javascript
// Reports Collection
{
  _id: ObjectId,
  name: String,
  type: String, // financial, inventory, sales, hr
  parameters: Object, // report parameters
  schedule: Object, // scheduled reports
  recipients: [ObjectId],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Dashboard Widgets Collection
{
  _id: ObjectId,
  userId: ObjectId,
  dashboardName: String,
  widgets: [Object], // widget configurations
  layout: Object, // grid layout
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **10. AI & Automation**
```javascript
// AI Suggestions Collection
{
  _id: ObjectId,
  type: String, // process_optimization, inventory_forecast, etc.
  suggestion: String,
  confidence: Number,
  data: Object, // supporting data
  status: String, // pending, implemented, rejected
  implementedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Process Analytics Collection
{
  _id: ObjectId,
  processType: String,
  metrics: Object, // performance metrics
  bottlenecks: [Object],
  suggestions: [Object],
  date: Date,
  createdAt: Date
}
```

### **11. Security & Audit**
```javascript
// Audit Logs Collection
{
  _id: ObjectId,
  userId: ObjectId,
  action: String, // create, update, delete, login, etc.
  entity: String, // what was changed
  entityId: ObjectId,
  oldData: Object,
  newData: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}

// Permissions Collection
{
  _id: ObjectId,
  role: String,
  module: String,
  permissions: [String], // read, write, delete, approve
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 **NEXT STEPS**

1. **Database Setup**: Create all these collections in MongoDB
2. **Interactive Frontend**: Build React components with full CRUD operations
3. **AI Integration**: Implement predictive analytics and automation
4. **Real-time Features**: Add Socket.IO for live updates
5. **Security**: Implement 2FA and audit trails

Should I proceed with creating the interactive frontend components and database setup scripts?
