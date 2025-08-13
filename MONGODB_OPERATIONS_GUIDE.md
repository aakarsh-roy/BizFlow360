

# BizFlow360 - MongoDB Operations Documentation

## Overview
BizFlow360 is a comprehensive Business Process Automation platform where **EVERY business operation is stored in MongoDB**. This document outlines all the database operations and how they ensure complete data persistence and audit trails.

## 🗄️ **Core Principle: All Operations Stored in MongoDB**

Every action in the platform creates permanent records in MongoDB:
- ✅ **Stock Updates** → `stockMovements` collection
- ✅ **Task Operations** → `tasks` collection  
- ✅ **Sales Transactions** → `salesTransactions` collection
- ✅ **Process Executions** → `processInstances` collection
- ✅ **KPI Metrics** → `kpiMetrics` collection
- ✅ **User Actions** → `auditLogs` collection
- ✅ **Workflow Steps** → `processInstances.auditLog` array
- ✅ **System Events** → `auditLogs` collection

---

## 📊 **Database Collections**

### 1. **Stock Operations** (`stockMovements`)
Every inventory change is permanently recorded:

```javascript
{
  _id: ObjectId("..."),
  productId: ObjectId("..."),           // Product reference
  movementType: "in|out|transfer|adjustment|loss|return",
  quantity: 100,                        // Amount changed
  previousQuantity: 50,                 // Stock before
  newQuantity: 150,                     // Stock after
  unitCost: 25.50,                      // Cost per unit
  totalValue: 2550.00,                  // Total transaction value
  reason: "Purchase Order PO-2024-001", // Business reason
  reference: "PO-2024-001",             // Reference document
  warehouseFrom: ObjectId("..."),       // Source warehouse
  warehouseTo: ObjectId("..."),         // Destination warehouse
  batchNumber: "BATCH-2024-001",        // Batch tracking
  expiryDate: ISODate("2025-12-31"),    // Expiry tracking
  processedBy: ObjectId("..."),         // User who processed
  approvedBy: ObjectId("..."),          // User who approved
  notes: "Urgent restocking required",   // Additional notes
  relatedDocuments: [{                  // Linked documents
    type: "purchase_order",
    documentId: "...",
    documentNumber: "PO-2024-001"
  }],
  companyId: ObjectId("..."),           // Multi-tenant isolation
  createdAt: ISODate("2024-08-12T10:30:00Z"),
  updatedAt: ISODate("2024-08-12T10:30:00Z")
}
```

**API Endpoints:**
- `POST /api/operations/stock/movement` - Record stock changes
- `GET /api/operations/history?entityType=stock` - View stock history

### 2. **Task Management** (`tasks`)
All task operations and lifecycle events stored:

```javascript
{
  _id: ObjectId("..."),
  processInstanceId: ObjectId("..."),   // Linked workflow
  taskName: "Review Purchase Request",   // Task description
  description: "Review and approve...",  // Detailed description
  type: "approval",                     // Task type
  status: "in-progress",                // Current status
  priority: "high",                     // Business priority
  assignedTo: ObjectId("..."),          // Current assignee
  assignedBy: ObjectId("..."),          // Who assigned
  dueDate: ISODate("2024-08-15T17:00:00Z"),
  startedAt: ISODate("2024-08-12T09:00:00Z"),
  completedAt: null,                    // When completed
  estimatedHours: 2,                    // Time estimate
  actualHours: 1.5,                     // Actual time spent
  attachments: [{                       // File attachments
    filename: "quote.pdf",
    originalName: "Supplier Quote.pdf",
    path: "/uploads/quote.pdf",
    size: 1024576,
    mimetype: "application/pdf",
    uploadedAt: ISODate("..."),
    uploadedBy: ObjectId("...")
  }],
  comments: [{                          // Task discussions
    content: "Approved with conditions",
    author: ObjectId("..."),
    timestamp: ISODate("..."),
    isInternal: false,
    mentions: [ObjectId("...")]
  }],
  worklog: [{                           // Time tracking
    description: "Initial review",
    timeSpent: 60,                      // Minutes
    date: ISODate("..."),
    author: ObjectId("..."),
    category: "review"
  }],
  tags: ["urgent", "procurement"],      // Classification
  customFields: {                       // Custom data
    "approvalAmount": 5000,
    "budgetCode": "PROC-2024"
  },
  companyId: ObjectId("..."),
  departmentId: "procurement",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**API Endpoints:**
- `POST /api/operations/tasks` - Create new tasks
- `PATCH /api/operations/tasks/:taskId/status` - Update task status
- `GET /api/operations/history?entityType=task` - View task history

### 3. **Sales Transactions** (`salesTransactions`)
Complete sales order lifecycle tracking:

```javascript
{
  _id: ObjectId("..."),
  orderNumber: "SO-2024-001",           // Unique order ID
  customerId: ObjectId("..."),          // Customer reference
  salesPersonId: ObjectId("..."),      // Sales rep
  orderDate: ISODate("..."),            // Order creation
  deliveryDate: ISODate("..."),         // Promised delivery
  status: "confirmed",                  // Order status
  items: [{                             // Order line items
    productId: ObjectId("..."),
    quantity: 10,
    unitPrice: 99.99,
    discount: 5.00,
    tax: 9.50,
    totalPrice: 1044.40,
    notes: "Gift wrapping requested"
  }],
  subtotal: 999.90,                     // Before tax/shipping
  totalDiscount: 50.00,                 // Total discounts
  totalTax: 94.95,                      // Total taxes
  shippingCost: 15.00,                  // Shipping charges
  grandTotal: 1059.85,                  // Final amount
  paymentStatus: "paid",                // Payment state
  paymentMethod: "card",                // Payment method
  shippingAddress: {                    // Delivery address
    street: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA"
  },
  billingAddress: {                     // Invoice address
    street: "456 Business Ave",
    city: "New York", 
    state: "NY",
    postalCode: "10002",
    country: "USA"
  },
  notes: "Customer prefers morning delivery",
  internalNotes: "VIP customer - priority handling",
  companyId: ObjectId("..."),
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**API Endpoints:**
- `POST /api/operations/sales` - Create sales orders
- `GET /api/operations/history?entityType=sales` - View sales history

### 4. **Process Instances** (`processInstances`)
Workflow execution tracking with complete audit trail:

```javascript
{
  _id: ObjectId("..."),
  processDefinitionId: ObjectId("..."), // Workflow template
  businessKey: "PO-APPROVAL-2024-001", // Business identifier
  status: "running",                    // Execution status
  variables: {                          // Process variables
    "purchaseAmount": 15000,
    "department": "IT",
    "approver": "manager@company.com",
    "urgentFlag": true
  },
  currentStep: "manager_approval",      // Current workflow step
  startTime: ISODate("..."),            // Process started
  endTime: null,                        // Process completed
  duration: null,                       // Total duration (ms)
  initiatedBy: ObjectId("..."),         // Who started
  assignedTo: [ObjectId("...")],        // Current assignees
  priority: "high",                     // Process priority
  auditLog: [{                          // Complete step history
    timestamp: ISODate("..."),
    action: "step_completed",
    userId: ObjectId("..."),
    details: {
      stepName: "initial_review",
      decision: "approved",
      comments: "All requirements met"
    },
    previousState: {
      currentStep: "start",
      status: "running"
    },
    newState: {
      currentStep: "manager_approval", 
      status: "running"
    }
  }],
  companyId: ObjectId("..."),
  departmentId: "procurement",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**API Endpoints:**
- `POST /api/operations/workflow/step` - Process workflow steps
- `GET /api/operations/history?entityType=process` - View process history

### 5. **KPI Metrics** (`kpiMetrics`)
Performance metrics and business intelligence:

```javascript
{
  _id: ObjectId("..."),
  metricName: "Order Processing Time",   // KPI name
  category: "operational",               // KPI category
  value: 2.5,                           // Actual value
  target: 2.0,                          // Target value
  unit: "hours",                        // Measurement unit
  period: "daily",                      // Measurement period
  periodStart: ISODate("2024-08-12T00:00:00Z"),
  periodEnd: ISODate("2024-08-12T23:59:59Z"),
  calculationMethod: "Average time from order to fulfillment",
  processId: ObjectId("..."),           // Related process
  departmentId: "sales",                // Department
  userId: ObjectId("..."),              // User context
  metadata: {                           // Additional context
    "orderCount": 45,
    "avgValue": 1250.00,
    "region": "North America"
  },
  companyId: ObjectId("..."),
  calculatedAt: ISODate("..."),         // When calculated
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**API Endpoints:**
- `POST /api/operations/kpi` - Record KPI metrics
- `GET /api/operations/metrics` - Get business metrics

### 6. **Audit Logs** (`auditLogs`)
Complete system activity tracking:

```javascript
{
  _id: ObjectId("..."),
  action: "stock_out",                  // Action performed
  entityType: "stock",                  // Entity affected
  entityId: ObjectId("..."),            // Specific entity
  userId: ObjectId("..."),              // User who acted
  userEmail: "user@company.com",        // User identifier
  ipAddress: "192.168.1.100",          // Source IP
  userAgent: "Mozilla/5.0...",          // Browser info
  previousState: {                      // Before change
    currentStock: 100,
    stockValue: 2500.00
  },
  newState: {                           // After change
    currentStock: 75,
    stockValue: 1875.00
  },
  changes: [{                           // Specific changes
    field: "currentStock",
    oldValue: 100,
    newValue: 75
  }],
  metadata: {                           // Additional context
    reason: "Sales Order SO-2024-001",
    reference: "SO-2024-001",
    productSku: "PROD-001"
  },
  severity: "medium",                   // Event severity
  companyId: ObjectId("..."),
  timestamp: ISODate("..."),            // When occurred
  createdAt: ISODate("...")
}
```

**API Endpoints:**
- `GET /api/operations/history` - Complete audit trail
- `GET /api/operations/audit/:entityId` - Entity-specific audit

---

## 🔧 **API Operations**

### **Stock Management**
```bash
# Record stock intake
POST /api/operations/stock/movement
{
  "productId": "64f...",
  "movementType": "in",
  "quantity": 100,
  "reason": "Purchase delivery",
  "reference": "PO-2024-001",
  "unitCost": 25.50
}

# Record stock outbound
POST /api/operations/stock/movement  
{
  "productId": "64f...",
  "movementType": "out",
  "quantity": 25,
  "reason": "Sales order",
  "reference": "SO-2024-001"
}
```

### **Task Operations**
```bash
# Create new task
POST /api/operations/tasks
{
  "taskName": "Review Purchase Order",
  "description": "Review PO for accuracy",
  "type": "approval",
  "priority": "high",
  "assignedTo": "64f...",
  "dueDate": "2024-08-15T17:00:00Z"
}

# Update task status
PATCH /api/operations/tasks/64f.../status
{
  "status": "completed",
  "notes": "Approved and forwarded"
}
```

### **Sales Processing**
```bash
# Create sales transaction
POST /api/operations/sales
{
  "customerId": "64f...",
  "items": [{
    "productId": "64f...",
    "quantity": 5,
    "unitPrice": 99.99
  }],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "postalCode": "02101",
    "country": "USA"
  },
  "billingAddress": { /* same format */ }
}
```

### **KPI Recording**
```bash
# Record performance metric
POST /api/operations/kpi
{
  "metricName": "Daily Sales Volume",
  "category": "financial",
  "value": 25000,
  "target": 30000,
  "unit": "USD",
  "period": "daily",
  "periodStart": "2024-08-12T00:00:00Z",
  "periodEnd": "2024-08-12T23:59:59Z",
  "calculationMethod": "Sum of all sales orders"
}
```

### **Workflow Processing**
```bash
# Process workflow step
POST /api/operations/workflow/step
{
  "processInstanceId": "64f...",
  "stepName": "approval_completed",
  "variables": {
    "approvedBy": "manager@company.com",
    "approvedAmount": 15000,
    "comments": "Approved with budget constraints"
  },
  "action": "step_completed"
}
```

---

## 📊 **Data Retrieval & Analytics**

### **Operation History**
```bash
# Get complete audit trail
GET /api/operations/history?entityType=stock&startDate=2024-08-01&endDate=2024-08-12&page=1&limit=50

# Get task history
GET /api/operations/history?entityType=task&page=1&limit=25

# Get sales history  
GET /api/operations/history?entityType=sales&startDate=2024-08-01&page=1
```

### **Real-time Metrics**
```bash
# Get daily business metrics
GET /api/operations/metrics?period=daily

# Get weekly summary
GET /api/operations/metrics?period=weekly

# Get monthly analytics
GET /api/operations/metrics?period=monthly
```

### **Entity Audit Trail**
```bash
# Get audit trail for specific product
GET /api/operations/audit/64f1a2b3c4d5e6f7g8h9i0j1

# Get audit trail for specific task
GET /api/operations/audit/64f2b3c4d5e6f7g8h9i0j1k2
```

---

## 🔒 **Data Integrity & Security**

### **Transaction Safety**
- All operations use **MongoDB transactions** for atomicity
- **Rollback capability** for failed operations
- **Concurrent access protection** with optimistic locking

### **Audit Compliance**
- **Complete audit trail** for all business operations
- **Immutable logs** - audit records cannot be modified
- **User tracking** with IP address and browser information
- **Change tracking** with before/after state comparison

### **Multi-tenant Isolation**
- **Company-level data segregation** with `companyId` filtering
- **Department-level access** control with `departmentId`
- **User-level permissions** with role-based access control

### **Data Validation**
- **Schema validation** at MongoDB level
- **Business rule validation** in service layer
- **Input sanitization** and SQL injection prevention
- **Type checking** and format validation

---

## 📈 **Performance Optimization**

### **Database Indexing**
```javascript
// Stock movements - optimized for queries
{ "companyId": 1, "productId": 1, "createdAt": -1 }
{ "movementType": 1, "companyId": 1, "createdAt": -1 }
{ "reference": 1, "companyId": 1 }

// Tasks - optimized for assignment and status
{ "assignedTo": 1, "status": 1, "dueDate": 1 }
{ "companyId": 1, "status": 1, "priority": 1 }
{ "processInstanceId": 1, "status": 1 }

// Sales transactions - optimized for reporting
{ "companyId": 1, "orderDate": -1 }
{ "customerId": 1, "orderDate": -1 }
{ "status": 1, "paymentStatus": 1 }

// Audit logs - optimized for history queries
{ "companyId": 1, "timestamp": -1 }
{ "entityType": 1, "entityId": 1, "timestamp": -1 }
{ "userId": 1, "timestamp": -1 }
```

### **Query Optimization**
- **Pagination** for large result sets
- **Field projection** to limit data transfer
- **Aggregation pipelines** for complex analytics
- **Caching** frequently accessed data

---

## 🚀 **Benefits of Complete MongoDB Storage**

### **Business Intelligence**
- **Complete operational history** for analytics
- **Real-time performance tracking** with KPIs
- **Trend analysis** and forecasting capabilities
- **Compliance reporting** with audit trails

### **Operational Efficiency**
- **End-to-end traceability** of all business processes
- **Automated audit trail** generation
- **Real-time monitoring** of business operations
- **Data-driven decision making** with comprehensive metrics

### **Risk Management**
- **Complete change tracking** for compliance
- **User accountability** with detailed audit logs
- **Transaction integrity** with ACID properties
- **Data recovery** capabilities with backup/restore

### **Scalability**
- **Horizontal scaling** with MongoDB sharding
- **Multi-tenant architecture** for SaaS deployment
- **High availability** with replica sets
- **Performance optimization** with proper indexing

---

## 📝 **Summary**

**BizFlow360 ensures that EVERY business operation is permanently stored in MongoDB:**

✅ **Stock Updates** → Complete inventory tracking with audit trail  
✅ **Task Management** → Full task lifecycle with time tracking  
✅ **Sales Operations** → End-to-end sales process recording  
✅ **Workflow Execution** → Complete process instance tracking  
✅ **KPI Metrics** → Performance measurement and analytics  
✅ **User Actions** → Comprehensive audit logging  
✅ **System Events** → Complete activity monitoring  

This comprehensive data storage approach enables:
- **Complete business transparency**
- **Regulatory compliance**
- **Advanced analytics and reporting**
- **Operational efficiency optimization**
- **Risk mitigation and accountability**

**Result: A fully auditable, compliant, and intelligent business process automation platform with complete MongoDB persistence.**
