# PSM Desktop Interface Plan - "ultrabridge"
## The Office Synchronizer: Field Work Becomes Approved Work

**Date:** November 8, 2025
**Purpose:** Transform field documentation into adjuster approvals and paid invoices
**Philosophy:** The app assists the PSM—it doesn't make decisions for them.

---

## 1. FIELD DATA CAPTURE VERIFICATION

### ✅ What the MIT Field App ALREADY Captures

#### Customer & Insurance Foundation
- ✅ **Customer Info**: Name, address, phone, email, coordinates
- ✅ **Insurance Info**: Carrier, policy#, claim#, adjuster (name/phone/email), deductible, estimated value
- ✅ **Cause of Loss**: Type, description, location, discovery date, event date
- ✅ **Water Classification**: Category (1/2/3 - Clean/Gray/Black), determined by, timestamp

#### Room-Level Documentation
- ✅ **Room Inventory**: Name, type, dimensions (L×W×H), square footage
- ✅ **Affected Areas Breakdown**:
  - Floor: Total sq ft, affected sq ft, % affected, material types with sq ft
  - Walls: Total sq ft, affected sq ft, % affected, wet height average, material types
  - Ceiling: Total sq ft, affected sq ft, % affected, material types
- ✅ **Water Class per Room**: Class 1/2/3/4 based on % surfaces affected
- ✅ **Drying Chamber Assignment**: Which rooms share equipment

#### Photo Documentation (Organized by Workflow Step)
- ✅ **Arrival Photos**: Initial property condition
- ✅ **Assessment Photos**: Damage documentation
- ✅ **Pre-Demo Photos**: Before demolition
- ✅ **Demo Photos**: During demolition
- ✅ **Post-Demo Photos**: After demolition
- ✅ **Daily Check Photos**: Progress monitoring
- ✅ **Final Photos**: Completion documentation
- ✅ **Photo Metadata**: Timestamp, room, caption, uploaded by

#### Moisture Readings (IICRC Compliant)
- ✅ **Reading Types**: Dry standard, initial, daily, final
- ✅ **Per Reading**: Material type, location (grid system), moisture %, temp, humidity, meter type
- ✅ **Tracking**: Recorded at timestamp, technician ID, photo URL, notes
- ✅ **Progress Monitoring**: Daily readings show drying trend

#### Equipment Documentation (Full Chain of Custody)
- ✅ **Equipment Types**: Dehumidifiers (Conv/LGR/Desiccant), Air Movers, Air Scrubbers
- ✅ **Per Equipment**: Serial #, model, scan code, deployment time, removal time, condition on removal
- ✅ **Equipment Readings**: Timestamp, temp, humidity, hours running, PPD (pints per day)
- ✅ **IICRC Calculations**:
  - Recommended dehumidifier count (with type, chart factor, calculation method)
  - Recommended air mover count
  - Recommended air scrubber count (Cat 2/3)
  - Total cubic footage, affected sq ft, estimated drying days
  - Calculation details ("the math")
- ✅ **Drying Chambers**: Equipment grouped by room assignments

#### Demo Work (Detailed Tracking)
- ✅ **Materials Removed**: Type, quantity, unit (sq ft / linear ft / each), notes
- ✅ **Per Room Demo**: Materials removed, demo time (minutes), photos, notes
- ✅ **IICRC Reasons**: Unsalvageable, contaminated, facilitate drying, structural compromise, microbial growth, access leak, investigative, other
- ✅ **Logged By/At**: Technician, timestamp

#### Safety & Compliance
- ✅ **Safety Checklist**: Pre-arrival inspection, containment setup, PPE equipped, safety cones
- ✅ **Utility Locations**: Electrical, gas, water (verified, verified at timestamp)
- ✅ **Hazards Identified**: Type, description, mitigation steps, resolved status

#### Communication & Pre-Existing
- ✅ **Ground Rules Presented**: Boolean tracking
- ✅ **Estimated Timeline**: Captured
- ✅ **Customer Concerns**: Array of concerns
- ✅ **Pre-Existing Conditions**: Description, location, photo URL

#### Financial Tracking
- ✅ **Estimates**: Insurance deductible, estimated materials, labor, total
- ✅ **Actual Expenses**: Materials, labor, equipment, total
- ✅ **Payment Status**: Unpaid, partial, paid
- ✅ **Payment Method**: Cash, Stripe, insurance
- ✅ **Payment History**: Amount, timestamp, method, Stripe transaction ID, processed by, receipt URL

#### Additional Billable Work (50+ Line Items)
- ✅ **Structural**: Insulation, insulation vacuum, insulation truss, countertops, backsplash, cabinetry
- ✅ **Contents**: Contents, bags, appliance moving, floor protection, plastic coverings, area rug redelivery
- ✅ **Containment**: Sq ft, zip pole system, zippers
- ✅ **Specialized**: Water extraction, anti-microbial, cleaning, thermal imaging, mold/lead testing, category testing strips, drill holes
- ✅ **Equipment Services**: Jobsite monitoring, decontamination (dehus/air scrubbers/air movers), tool rental, ladder
- ✅ **Materials**: Plastic, bubble wrap, lumber, PPE (coveralls, respirators, gloves, eye protection, masks)
- ✅ **Disposal**: POD, delivery/pickup, dump charge, dumpster bag
- ✅ **Other Services**: Emergency call (during/after hours), temp sink hookup, Matterport, other
- ✅ **Per Item**: Performed (boolean), quantity, unit, notes, logged by/at

#### Subcontractor Requests (Emergency Escalation)
- ✅ **Request Details**: Specialist type (plumber, electrician, HVAC, asbestos, mold, structural, roofing, other)
- ✅ **Urgency**: Emergency, urgent, standard
- ✅ **Documentation**: Location, issue description, photos, customer aware
- ✅ **Status**: Pending, scheduled, completed, cancelled
- ✅ **Assignment**: Assigned to (sub company), scheduled date, assigned by MIT Lead, assigned at
- ✅ **Completion**: Completed at/by, notes, charge, charge approved

#### Workflow & Audit Trail
- ✅ **Phases Tracked**: Install, Demo, Check Service, Pull
- ✅ **Per Phase**: Status (pending/in-progress/completed), started at, completed at, technician, notes
- ✅ **Demo Phase**: Scheduled date
- ✅ **Check Service**: Visits array (visit #, started at, completed at, technician, notes, readings verified)
- ✅ **Job Metadata**: Created at/by, last modified at/by, version number
- ✅ **Scheduled**: Zone, technician, date, arrival window (9-1, 12-4, custom with start/end times)

#### Documentation & Signatures
- ✅ **Matterport Scan**: Completed, URL, scan date
- ✅ **Certificate of Satisfaction**: Obtained, signed date, customer signature
- ✅ **Dry Release Waiver**: Needed, obtained, signed date, customer signature

#### Drying Plan (Comprehensive)
- ✅ **Classification**: Water category (1/2/3), overall class (worst across all rooms), total affected sq ft
- ✅ **Breakdown**: Total floor sq ft, wall sq ft, ceiling sq ft
- ✅ **Drying Goals**: Target moisture % by material type, estimated drying days, monitoring schedule (daily/twice-daily), completion criteria
- ✅ **Equipment Plan**:
  - Calculated: Dehumidifiers, air movers, air scrubbers, calculation notes
  - Actual: Dehumidifiers, air movers, air scrubbers deployed
  - Variance: Reason, approved by (if different from calculated)
- ✅ **Created At/By**: Timestamp, technician

---

## 2. GAPS ANALYSIS

### ❌ Missing PSM-Specific Functionality

#### Adjuster Communication Tracking
- ❌ **Adjuster Contact Log**: No record of calls, emails, meetings with adjuster
- ❌ **Questions Asked**: No tracking of adjuster questions and MIT responses
- ❌ **Approval Requests**: No structured approval request workflow
- ❌ **Denial Reasons**: No tracking of what was denied and why

#### Approval Status Management
- ❌ **Line-Item Approval Status**: Can't track which billable items are approved/pending/denied
- ❌ **Scope Approval**: No tracking of demo scope approval, equipment approval, etc.
- ❌ **Conditional Approvals**: No way to flag "approved contingent on X"
- ❌ **Approval Amounts**: No tracking of approved dollar amounts vs. estimated

#### Homeowner Communication
- ❌ **Homeowner Contact Log**: No record of homeowner conversations
- ❌ **Explanation Tracking**: No documentation of what was explained to homeowner
- ❌ **Homeowner Questions**: No tracking of homeowner questions/concerns during PSM phase
- ❌ **Payment Plan**: No tracking of payment plan agreements (if deductible is high)

#### Documentation Verification Workflow
- ❌ **Completeness Checklist**: No PSM checklist to verify all required docs are present
- ❌ **Quality Review**: No way for PSM to flag "good photo" vs. "need better photo"
- ❌ **Missing Items Tracker**: No automated detection of missing documentation before adjuster call

#### Invoice & Billing
- ❌ **Invoice Generation**: No way to generate invoice from captured data
- ❌ **Line Item Pricing**: No price database for billable items
- ❌ **Invoice Status**: No tracking of invoice sent/reviewed/disputed/paid
- ❌ **Variance Explanation**: No structured way to explain estimate vs. actual differences

#### Red Flags & Quality Control
- ❌ **Automated Red Flags**: No detection of:
  - Equipment variance > 20% from IICRC calc
  - Missing photos for workflow steps
  - Moisture readings not improving over time
  - Demo work without IICRC reason
  - Missing adjuster approval before demo
- ❌ **MIT Lead Review**: No workflow for MIT Lead to review and approve PSM submissions
- ❌ **Notes for PSM**: No way for MIT Tech to leave notes specifically for PSM

#### Time Tracking & Productivity
- ❌ **PSM Time Tracking**: No way to track time spent per job in PSM phase
- ❌ **Days in Phase**: No automatic calculation of "days waiting for adjuster approval"
- ❌ **Bottleneck Identification**: No tracking of where jobs get stuck

#### Integration Points
- ❌ **Email Integration**: No way to import adjuster emails into job record
- ❌ **Calendar Integration**: No way to track adjuster callback appointments
- ❌ **Document Export**: No one-click export of all documentation for adjuster

---

## 3. HOW TO CLOSE THE GAPS

### Solution 1: PSM Job Dashboard Enhancements

**Add to Job Interface:**
```typescript
interface PSMJobData {
  // Adjuster Communication
  adjusterCommunications: Array<{
    id: string;
    communicationType: 'call' | 'email' | 'meeting' | 'portal-message';
    timestamp: Timestamp;
    contactedBy: string; // PSM name
    summary: string;
    questionsAsked: string[];
    answersProvided: string[];
    nextStep: string;
    followUpDate?: Timestamp;
  }>;

  // Approval Tracking
  approvalStatus: {
    demoScope: 'pending' | 'approved' | 'denied' | 'partial';
    demoAmount: {
      requested: number;
      approved: number;
      deniedAmount: number;
      denialReason?: string;
    };
    equipmentPlan: 'pending' | 'approved' | 'modified';
    equipmentModifications?: string;
    billableItems: Record<string, {
      status: 'pending' | 'approved' | 'denied';
      requestedQty: number;
      approvedQty: number;
      denialReason?: string;
    }>;
    conditionalApprovals: Array<{
      item: string;
      condition: string;
      conditionMet: boolean;
    }>;
  };

  // Homeowner Communication
  homeownerCommunications: Array<{
    id: string;
    timestamp: Timestamp;
    contactedBy: string;
    method: 'phone' | 'email' | 'in-person';
    topicsDiscussed: string[];
    questionsAsked: string[];
    nextContact?: Timestamp;
  }>;

  // Documentation Verification
  documentationReview: {
    checklist: {
      allRoomsPhotographed: boolean;
      moistureReadingsComplete: boolean;
      equipmentScanned: boolean;
      demoDocumented: boolean;
      customerSignatures: boolean;
      matterportCompleted: boolean;
    };
    missingItems: string[];
    reviewedBy: string;
    reviewedAt: Timestamp;
    readyForSubmission: boolean;
  };

  // Invoice & Billing
  invoice: {
    generated: boolean;
    generatedAt?: Timestamp;
    generatedBy?: string;
    invoiceNumber?: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      approvalStatus: 'approved' | 'pending' | 'denied';
    }>;
    subtotal: number;
    tax: number;
    total: number;
    amountDue: number;
    status: 'draft' | 'sent' | 'reviewed' | 'disputed' | 'approved' | 'paid';
    sentToAdjusterAt?: Timestamp;
    approvedByAdjusterAt?: Timestamp;
    paidAt?: Timestamp;
  };

  // Red Flags
  redFlags: Array<{
    id: string;
    type: 'equipment-variance' | 'missing-photos' | 'moisture-not-improving' |
          'demo-no-reason' | 'no-adjuster-approval' | 'cost-overrun' | 'timeline-delay';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Timestamp;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Timestamp;
    resolutionNotes?: string;
  }>;

  // PSM Workflow Tracking
  psmPhase: {
    status: 'field-complete' | 'reviewing' | 'awaiting-adjuster' | 'approved' | 'invoiced';
    assignedPSM: string;
    startedReviewAt?: Timestamp;
    submittedToAdjusterAt?: Timestamp;
    approvedByAdjusterAt?: Timestamp;
    invoicedAt?: Timestamp;
    completedAt?: Timestamp;
    daysInPhase: number;
    notes: string;
  };
}
```

### Solution 2: Desktop Interface Components

#### 2.1 PSM Job List View
```
┌─────────────────────────────────────────────────────────────────┐
│  JOBS AWAITING REVIEW              🔴 3 Critical  🟡 7 Pending  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Search jobs...]  [Zone: All ▼] [Status: All ▼] [Sort: ▼]     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔴 #3e1kUeQw494d1tl3HM3K • Smith Residence • Zone 1      │  │
│  │ 123 Main St, Boston MA • Install Complete 2 days ago     │  │
│  │ ❌ Missing: Final Photos, Moisture Readings              │  │
│  │ ⚠️  Equipment variance: +2 dehus (no approval)           │  │
│  │ [Open Job →]                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🟡 #4f2mVgRx595e2um4IN4L • Jones Property • Zone 2       │  │
│  │ 456 Oak Ave, Cambridge MA • Demo Complete 1 day ago      │  │
│  │ ✅ All documentation complete                            │  │
│  │ 📞 Adjuster callback scheduled: Tomorrow 2PM            │  │
│  │ [Open Job →]                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.2 PSM Job Detail View - "One Dashboard, Complete Story"

**LEFT PANEL - Field Documentation:**
```
┌────────────────────────────────────────┐
│ FIELD DOCUMENTATION                    │
├────────────────────────────────────────┤
│                                        │
│ ✅ Install Complete                   │
│    Nov 5, 2025 • Mike Chen           │
│                                        │
│ ✅ Demo Complete                      │
│    Nov 6, 2025 • Mike Chen           │
│                                        │
│ ⏸️  Check Service (2/3 visits done)   │
│    Next visit: Nov 9, 2025           │
│                                        │
│ ⬜ Pull (Scheduled Nov 11)            │
│                                        │
├────────────────────────────────────────┤
│ DOCUMENTATION COMPLETENESS             │
├────────────────────────────────────────┤
│ ✅ Customer Info                      │
│ ✅ Photos (47 total)                  │
│   • 8 Arrival                         │
│   • 12 Assessment                     │
│   • 15 Demo                           │
│   • 12 Daily Check                    │
│ ✅ Moisture Readings (23 readings)    │
│ ✅ Equipment Scanned (7 items)        │
│ ✅ Demo Documentation                 │
│ ❌ MISSING: Final Photos             │
│ ❌ MISSING: Day 3 Moisture Readings  │
│                                        │
├────────────────────────────────────────┤
│ RED FLAGS                              │
├────────────────────────────────────────┤
│ 🔴 Equipment Variance                 │
│    Deployed 5 dehus, calculated 3     │
│    +2 variance, no approval noted     │
│    [View Calculation] [Mark Resolved] │
│                                        │
│ 🟡 Timeline Delay                     │
│    Demo scheduled Day 2, happened Day 3│
│    Reason: Customer rescheduled       │
│    [Add Note]                         │
│                                        │
└────────────────────────────────────────┘
```

**CENTER PANEL - Presentation View:**
```
┌────────────────────────────────────────────────────────────────┐
│ ADJUSTER PRESENTATION VIEW                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tabs: [Overview] [Before/After] [Rooms] [Equipment] [Demo]   │
│        [Timeline] [Financials] [Documents]                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  OVERVIEW - Smith Residence Water Damage Restoration     │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  📍 123 Main St, Boston MA 02134                        │ │
│  │  📅 Loss Date: Nov 1, 2025 • Discovery: Nov 2, 2025     │ │
│  │  💧 Cause: Burst Pipe (Kitchen Sink Supply Line)        │ │
│  │  🏷️  Category 1 (Clean Water) • Class 3 (High Evap)    │ │
│  │                                                           │ │
│  │  SCOPE SUMMARY:                                          │ │
│  │  • 3 rooms affected (Kitchen, Dining, Living Room)      │ │
│  │  • 847 sq ft total affected area                        │ │
│  │  • Demo: 340 sq ft drywall, 180 sq ft flooring          │ │
│  │  • Equipment: 5 dehumidifiers, 12 air movers            │ │
│  │  • Estimated dry time: 5 days (IICRC calculated)        │ │
│  │                                                           │ │
│  │  [📄 Export Full Report] [📧 Email to Adjuster]         │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  BEFORE / AFTER COMPARISON:                                    │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │ [Before Photo]       │  │ [After Photo]        │          │
│  │ Nov 2 - Arrival      │  │ Nov 6 - Post Demo    │          │
│  │ Kitchen - North Wall │  │ Kitchen - North Wall │          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                                 │
│  MOISTURE TREND:                                               │
│  [Line graph showing moisture % declining over time]          │
│  Day 1: 45% → Day 2: 32% → Day 3: 21% → Target: <12%         │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**RIGHT PANEL - PSM Actions:**
```
┌────────────────────────────────────────┐
│ PSM WORKFLOW                           │
├────────────────────────────────────────┤
│                                        │
│ Status: 📋 Reviewing Documentation    │
│ Assigned: Sarah Johnson (PSM)         │
│ Days in Phase: 1 day                  │
│                                        │
│ [✓ Mark Ready for Adjuster]           │
│                                        │
├────────────────────────────────────────┤
│ ADJUSTER CONTACT                       │
├────────────────────────────────────────┤
│ Name: Tom Williams                     │
│ Company: State Farm                    │
│ Phone: (617) 555-1234                 │
│ Email: twilliam@statefarm.com         │
│                                        │
│ Last Contact: Nov 7, 10:30 AM         │
│ Method: Phone Call                     │
│ Summary: Reviewed scope, requested    │
│ additional photos of affected ceiling │
│                                        │
│ [➕ Log Communication]                │
│ [📧 Send Email]                       │
│ [📅 Schedule Callback]                │
│                                        │
├────────────────────────────────────────┤
│ APPROVAL STATUS                        │
├────────────────────────────────────────┤
│ ✅ Equipment Plan Approved            │
│    5 dehus, 12 air movers             │
│                                        │
│ ⏸️  Demo Scope Pending                │
│    Requested: 340 sq ft drywall       │
│    Status: Awaiting adjuster review   │
│                                        │
│ ❌ Additional Insulation Denied       │
│    Reason: Pre-existing damage        │
│    Requested: 80 sq ft                │
│                                        │
│ [Update Approval Status]              │
│                                        │
├────────────────────────────────────────┤
│ HOMEOWNER STATUS                       │
├────────────────────────────────────────┤
│ Last Contact: Nov 6, 3:00 PM          │
│ Discussed: Timeline, demo completion  │
│                                        │
│ Payment Status: Deductible Due        │
│ Amount: $1,000                        │
│                                        │
│ [➕ Log Communication]                │
│                                        │
├────────────────────────────────────────┤
│ NEXT STEPS                             │
├────────────────────────────────────────┤
│ 1. Request ceiling photos from tech   │
│ 2. Follow up with adjuster on demo    │
│ 3. Schedule final walkthrough         │
│                                        │
│ [Add Task]                            │
│                                        │
└────────────────────────────────────────┘
```

#### 2.3 Invoice Generation Interface
```
┌────────────────────────────────────────────────────────────────┐
│ INVOICE GENERATOR - Job #3e1kUeQw494d1tl3HM3K                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Customer: John Smith                                          │
│  Property: 123 Main St, Boston MA 02134                       │
│  Claim #: SF-2025-12345 (State Farm)                          │
│  Adjuster: Tom Williams                                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ LINE ITEMS                                               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Description           Qty  Unit   Price  Total   Status  │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Drywall Removal      340   sqft   $2.50  $850   ✅ Appr │ │
│  │ Carpet Removal       180   sqft   $1.75  $315   ✅ Appr │ │
│  │ Dehumidifier Daily     5   each   $45    $225   ✅ Appr │ │
│  │ Air Mover Daily       12   each   $15    $180   ✅ Appr │ │
│  │ Insulation Removal    80   sqft   $3.00  $240   ❌ Deny │ │
│  │ Antimicrobial Spray  520   sqft   $0.50  $260   ⏸️ Pend │ │
│  │ Water Extraction       1   job    $350   $350   ✅ Appr │ │
│  │ Labor - Install        8   hrs    $75    $600   ✅ Appr │ │
│  │ Labor - Demo           6   hrs    $75    $450   ✅ Appr │ │
│  │ Labor - Check          2   hrs    $75    $150   ✅ Appr │ │
│  │ Labor - Pull           3   hrs    $75    $225   ⏸️ Pend │ │
│  │                                                           │ │
│  │ Subtotal (Approved): $3,605                              │ │
│  │ Subtotal (Pending):  $  485                              │ │
│  │ Subtotal (Denied):   $  240                              │ │
│  │                                                           │ │
│  │ Tax (6.25%):        $  225                               │ │
│  │ TOTAL:              $3,830                               │ │
│  │ Deductible:        -$1,000                               │ │
│  │ AMOUNT DUE:         $2,830                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [💾 Save Draft] [📧 Email to Adjuster] [📄 Export PDF]       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. DESKTOP INTERFACE ARCHITECTURE

### 4.1 Technology Stack

**Frontend:**
```typescript
// Same stack as mobile for consistency
- React 18 + TypeScript
- Tailwind CSS (with desktop-optimized components)
- React Router for multi-view navigation
- Zustand for state management
- React Query for server state caching
```

**Desktop-Specific Enhancements:**
```typescript
// Multi-panel layouts
- react-grid-layout: Resizable panels
- react-split-pane: Adjustable sidebars
- react-window: Virtual scrolling for large lists

// Data visualization
- recharts: Moisture trend graphs, cost breakdowns
- react-pdf: PDF preview & generation
- react-to-print: Print-friendly views

// Productivity features
- react-hotkeys-hook: Keyboard shortcuts
- react-beautiful-dnd: Drag-drop job prioritization
- react-table: Advanced filtering/sorting
```

### 4.2 Component Structure

```
src/components/psm/
├── dashboard/
│   ├── PSMDashboard.tsx          # Main entry point
│   ├── JobListView.tsx            # Job queue with filters
│   ├── JobFilters.tsx             # Advanced filtering
│   └── JobPriorityQueue.tsx       # Drag-drop prioritization
│
├── job-detail/
│   ├── JobDetailView.tsx          # 3-panel layout
│   ├── FieldDocPanel.tsx          # Left: Field data summary
│   ├── PresentationPanel.tsx      # Center: Adjuster view
│   ├── PSMActionsPanel.tsx        # Right: PSM workflow
│   └── tabs/
│       ├── OverviewTab.tsx
│       ├── BeforeAfterTab.tsx
│       ├── RoomsTab.tsx
│       ├── EquipmentTab.tsx
│       ├── DemoTab.tsx
│       ├── TimelineTab.tsx
│       ├── FinancialsTab.tsx
│       └── DocumentsTab.tsx
│
├── communication/
│   ├── AdjusterContactLog.tsx     # Log adjuster communications
│   ├── HomeownerContactLog.tsx    # Log homeowner communications
│   ├── EmailComposer.tsx          # Send emails to adjuster
│   └── CallbackScheduler.tsx      # Schedule follow-ups
│
├── approvals/
│   ├── ApprovalTracker.tsx        # Track approval status
│   ├── LineItemApprovals.tsx      # Billable item approvals
│   ├── ConditionalApprovals.tsx   # Contingent approvals
│   └── DenialManager.tsx          # Track/explain denials
│
├── documentation/
│   ├── DocVerificationChecklist.tsx  # PSM review checklist
│   ├── MissingItemsAlert.tsx         # Flag missing docs
│   ├── PhotoGallery.tsx              # Browse all photos
│   ├── MoistureReadingTable.tsx      # All readings with trends
│   └── EquipmentManifest.tsx         # Equipment chain of custody
│
├── invoicing/
│   ├── InvoiceGenerator.tsx       # Build invoice from job data
│   ├── LineItemEditor.tsx         # Edit line items with pricing
│   ├── PriceDatabase.tsx          # Manage unit prices
│   └── InvoicePreview.tsx         # PDF preview before sending
│
├── red-flags/
│   ├── RedFlagDashboard.tsx       # All red flags across jobs
│   ├── RedFlagAlert.tsx           # Individual flag with resolution
│   └── AutoDetection.tsx          # Automated flag detection logic
│
└── shared/
    ├── SidePanel.tsx              # Reusable side panel
    ├── DataTable.tsx              # Sortable/filterable table
    ├── BeforeAfterCompare.tsx     # Side-by-side photo comparison
    ├── MoistureTrendChart.tsx     # Line chart for moisture over time
    ├── ExportButton.tsx           # Export to PDF/Excel
    └── PrintView.tsx              # Print-optimized layout
```

### 4.3 Login & Access Control

#### PSM User Type
```typescript
export type UserRole =
  | 'MIT_TECH'        // Field technician (mobile only)
  | 'MIT_LEAD'        // Lead tech (mobile + desktop limited)
  | 'PSM'             // Project Support Manager (desktop full access)
  | 'ADMIN';          // System admin

interface PSMUser extends User {
  role: 'PSM';
  permissions: {
    viewAllJobs: boolean;
    editApprovals: boolean;
    generateInvoices: boolean;
    contactAdjusters: boolean;
    overrideRedFlags: boolean;
  };
  assignedRegions: string[];  // e.g., ['Zone 1', 'Zone 2']
  workloadSettings: {
    maxActiveJobs: number;      // e.g., 15
    autoAssignNew: boolean;
    priority: 'oldest-first' | 'high-value-first' | 'manual';
  };
}
```

#### Login Flow - Desktop Specific
```
1. User visits app.mitdrylogs.com
2. Detects desktop viewport (>1024px width)
3. Shows desktop-optimized login:
   ┌────────────────────────────────────┐
   │                                    │
   │     [Entrusted Logo]              │
   │                                    │
   │     Welcome to MIT Dry Logs       │
   │     Project Support Portal        │
   │                                    │
   │     Email:   [____________]       │
   │     Password: [____________]      │
   │                                    │
   │     [Sign In]                     │
   │                                    │
   │     Forgot password?              │
   │                                    │
   └────────────────────────────────────┘

4. On successful login, check user role:
   - MIT_TECH → Redirect to mobile view (or show "Use mobile app")
   - MIT_LEAD → Show hybrid dashboard
   - PSM → Show PSM Dashboard
   - ADMIN → Show admin panel

5. Store session with 8-hour expiry (office workday)
```

#### Role-Based Routing
```typescript
// src/App.tsx - Desktop routes
function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* PSM Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PSM', 'ADMIN']} />}>
        <Route path="/psm" element={<PSMDashboard />} />
        <Route path="/psm/job/:jobId" element={<JobDetailView />} />
        <Route path="/psm/invoices" element={<InvoiceList />} />
        <Route path="/psm/reports" element={<ReportsView />} />
      </Route>

      {/* MIT Lead hybrid access */}
      <Route element={<ProtectedRoute allowedRoles={['MIT_LEAD', 'ADMIN']} />}>
        <Route path="/lead" element={<LeadDashboard />} />
        <Route path="/lead/approve/:jobId" element={<ApprovalView />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
```

---

## 5. KEY FEATURES SUMMARY

### For PSM Users

#### 1. **One Dashboard, Complete Story**
- Open a job, see:
  - What the MIT tech documented
  - What's needed for adjuster approval
  - What questions adjuster will ask
  - What's still missing from field

#### 2. **Field Documentation Verification**
- Automated completeness checklist
- Photo organization by room and step
- Measurements validation
- Equipment placement verification
- Moisture readings with trend analysis
- Before/after demo documentation
- Flags incomplete items before adjuster contact

#### 3. **Adjuster Conversation Ammunition**
- Side-by-side photo comparisons
- Moisture trend graphs
- Equipment placement maps
- IICRC calculation justifications
- Audit trail of all decisions
- One-click export to PDF
- Email integration

#### 4. **Homeowner Communication**
- Timeline visualization
- Equipment placement locations
- Demo scope explanation
- Insurance approval status (approved/denied/pending)
- Payment tracking

#### 5. **Partial Approvals & Contingencies**
- Track line-item approval status
- Flag conditional approvals
- Document denial reasons
- Variance explanations

#### 6. **Data Completeness Before Action**
- Automated red flag detection
- Missing item alerts
- Quality review checklist
- Never call adjuster unprepared

---

## 6. IMPLEMENTATION PHASES

### Phase 1: Core PSM Dashboard (Week 1-2)
- ✅ PSM login & authentication
- ✅ Job list view with filters
- ✅ Basic job detail view (3-panel layout)
- ✅ Documentation completeness checker
- ✅ Red flag detection (equipment variance, missing photos)

### Phase 2: Communication & Approvals (Week 3-4)
- ✅ Adjuster contact log
- ✅ Homeowner contact log
- ✅ Approval status tracker
- ✅ Line-item approval management
- ✅ Denial reason documentation

### Phase 3: Presentation & Export (Week 5-6)
- ✅ Before/After comparison view
- ✅ Moisture trend visualization
- ✅ Room-by-room breakdown
- ✅ Equipment manifest
- ✅ PDF export
- ✅ Email integration

### Phase 4: Invoicing (Week 7-8)
- ✅ Invoice generator
- ✅ Price database
- ✅ Line item editor
- ✅ Approval status integration
- ✅ Invoice status tracking

### Phase 5: Automation & Intelligence (Week 9-10)
- ✅ Automated red flag detection
- ✅ Missing documentation alerts
- ✅ Smart job prioritization
- ✅ Bottleneck identification
- ✅ Time tracking analytics

---

## 7. SUCCESS METRICS

### PSM Productivity
- **Time per job**: Target <2 hours from field-complete to adjuster-submitted
- **First-call approval rate**: Target >80% (adjuster approves on first contact)
- **Documentation completeness**: Target >95% (no missing items)
- **Invoice accuracy**: Target >98% (minimal disputes)

### Adjuster Satisfaction
- **Response time**: Adjuster receives complete documentation within 24 hours of field completion
- **Clarification requests**: <10% of submissions require additional info
- **Approval timeline**: Adjuster can review and approve within 48 hours

### Homeowner Experience
- **Communication frequency**: Homeowner contacted at each major milestone
- **Payment clarity**: Homeowner knows exact amount due before invoice
- **Timeline accuracy**: Homeowner receives realistic timeline (95% accuracy)

---

## 8. NEXT STEPS

1. **Review this plan with team** - Validate gaps analysis, prioritize features
2. **Design UI mockups** - Create high-fidelity designs for 3-panel layout
3. **Implement Phase 1** - Core PSM dashboard with job list and detail view
4. **User testing** - Get PSM feedback on workflow efficiency
5. **Iterate and improve** - Refine based on real-world usage

---

**Built with the "ultrabridge" mentality.**
*The app assists the PSM—it doesn't make decisions for them.*
*Field work becomes approved work.*
