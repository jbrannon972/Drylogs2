# MIT DRY LOGS APP - COMPREHENSIVE DEVELOPMENT PLAN
## Production-Ready Implementation Guide

**Version:** 1.0  
**Last Updated:** November 2025  
**Project Status:** Development Phase 1 (Core Mobile + Lead Dashboard)  
**Tech Stack:** React 18+, TypeScript, Firebase, PWA, Stripe

---

# TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Firebase Schema & Data Structure](#firebase-schema--data-structure)
4. [Sample Data & Seeding Strategy](#sample-data--seeding-strategy)
5. [React Component Architecture](#react-component-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [Offline Functionality](#offline-functionality)
8. [UI/UX Specifications](#uiux-specifications)
9. [Feature Implementation Roadmap](#feature-implementation-roadmap)
10. [User Story Mapping](#user-story-mapping)
11. [Equipment Calculations (IICRC Standards)](#equipment-calculations-iicrc-standards)
12. [Data Export & Reporting](#data-export--reporting)
13. [Testing Strategy](#testing-strategy)
14. [Deployment & Setup](#deployment--setup)

---

# PROJECT OVERVIEW

## Application Scope

**MIT Dry Logs App** is a dual-interface (mobile + web) Progressive Web Application for water damage restoration mitigation teams.

### MVP Deliverables (Phase 1)

**MIT Tech Mobile Interface (iOS/Android via PWA):**
- Job selection and daily workflow management
- Real-time data entry for all 4 mitigation phases (Install, Demo, Check Service, Pull)
- Photo capture and organization
- Equipment tracking and IICRC-based calculations
- Offline capability with automatic sync
- Stripe payment collection (cash jobs)

**MIT Lead Web Dashboard:**
- Job schedule overview
- Red flag detection and monitoring
- Job approval workflow
- Equipment verification
- Reporting and data export
- Work order management and editing

### Tech Stack Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend Framework** | React 18+ with TypeScript | Type safety, performance, ecosystem |
| **Backend/Database** | Firebase (Firestore + RTDB) | Real-time sync, authentication, easy offline |
| **Authentication** | Firebase Auth | Email/password, persistent tokens, role support |
| **Cloud Storage** | Firebase Cloud Storage | Photos, documents, cost-effective |
| **Local Storage** | IndexedDB + Service Workers | Offline-first capability, large data handling |
| **State Management** | Zustand + React Context | Lightweight, easier than Redux for this project |
| **Styling** | Tailwind CSS + Entrusted Brand CSS | Rapid development, brand consistency |
| **PWA** | create-react-app + Workbox | Native app-like experience |
| **Payments** | Stripe SDK | PCI compliance, reliability |
| **PDF Export** | jsPDF + html2canvas | Client-side generation |
| **Forms** | React Hook Form + Zod | Validation, performance, UX |

---

# TECHNICAL ARCHITECTURE

## Application Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIT TECH MOBILE (PWA)                         │
│                   MIT LEAD WEB DASHBOARD                         │
└────────────┬────────────────────────────────────────────────────┘
             │
    ┌────────┴────────────────────┐
    │   React Router Navigation    │
    │  (Role-based routing)        │
    └────────┬────────────────────┘
             │
┌────────────┴──────────────────────────────────────────────────┐
│              Zustand Store + React Context                     │
│  ├─ Auth Context (user, roles, permissions)                   │
│  ├─ Jobs Store (current jobs, filters)                        │
│  ├─ Sync Store (offline queue, sync status)                   │
│  └─ UI Store (notifications, modals, filters)                 │
└────────────┬──────────────────────────────────────────────────┘
             │
    ┌────────┴──────────────────┐
    │   Service Layer / Hooks    │
    │  ├─ useJobs()              │
    │  ├─ usePhotos()            │
    │  ├─ useEquipment()         │
    │  ├─ useSync()              │
    │  └─ useRealtimeUpdates()   │
    └────────┬──────────────────┘
             │
┌────────────┴──────────────────────────────────────────────────┐
│         Firebase Integration Layer                             │
│  ├─ Firebase Auth (email/password)                             │
│  ├─ Firestore (realtime reads/writes)                          │
│  ├─ Realtime Database (sync coordination)                      │
│  ├─ Cloud Storage (photos, PDFs)                               │
│  └─ Cloud Functions (calculations, validations)                │
└────────────┬──────────────────────────────────────────────────┘
             │
┌────────────┴──────────────────────────────────────────────────┐
│        Offline Sync Layer                                      │
│  ├─ Service Workers (cache, background sync)                   │
│  ├─ IndexedDB (local data persistence)                         │
│  ├─ Sync Queue (pending changes)                               │
│  └─ Conflict Resolution (last-write-wins)                      │
└─────────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

### Online Flow
```
User Action → Zustand Store → Firebase Service → Firebase Backend → 
Store Updated → Component Re-render → User Sees Change (0-500ms)
```

### Offline Flow
```
User Action → Zustand Store → IndexedDB + Service Worker Cache → 
Component Re-render → Add to Sync Queue → 
[Connection Returns] → Sync Service → Firebase Backend → 
Merge/Conflict Resolution → Store Updated
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│  GitHub Repository (source code)        │
│  └─ Main branch (production)            │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Firebase Hosting (React Build)         │
│  └─ Both MIT Tech + MIT Lead apps       │
│     (route-based separation)            │
└────────────┬────────────────────────────┘
             │
         ┌───┴──────┬──────────┐
         │          │          │
    ┌────▼────┐ ┌──▼───┐ ┌───▼────┐
    │Firestore│ │Cloud │ │Storage  │
    │(data)   │ │Func  │ │(photos) │
    │         │ │(logic)│ │         │
    └─────────┘ └──────┘ └─────────┘
```

---

# FIREBASE SCHEMA & DATA STRUCTURE

## Complete Firestore Collections

### Collection: `users`

```typescript
{
  uid: string,                           // Firebase Auth UID
  email: string,
  displayName: string,
  phoneNumber: string,
  role: 'MIT_TECH' | 'MIT_LEAD' | 'ADMIN',
  zone: string,                          // Zone 1, Zone 2, Zone 3, 2nd Shift
  assignedJobs: string[],               // Array of job IDs
  createdAt: timestamp,
  lastLogin: timestamp,
  isActive: boolean,
  preferences: {
    notifications: boolean,
    darkMode: boolean,
    preferredTimeZone: string,
    language: string
  },
  qualifications: {
    iicrcCertified: boolean,
    certificationExpiry: timestamp,
    trainingLevel: 'junior' | 'mid' | 'senior'
  },
  metadata: {
    totalJobsCompleted: number,
    totalEquipmentScans: number,
    accuracyScore: number,
    lastActivityAt: timestamp
  }
}
```

**Indexes Needed:**
- `role` + `isActive`
- `zone` + `role`
- `email` (unique)

---

### Collection: `jobs`

```typescript
{
  jobId: string,                         // UUID
  
  // BASIC INFO
  customerInfo: {
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    phoneNumber: string,
    email: string,
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  
  // INSURANCE & CLAIM
  insuranceInfo: {
    carrierName: string,
    policyNumber: string,
    claimNumber: string,
    adjusterName: string,
    adjusterPhone: string,
    adjusterEmail: string,
    deductible: number,
    estimatedValue: number,
    categoryOfWater: 'Category 1' | 'Category 2' | 'Category 3'
  },
  
  // CAUSE OF LOSS
  causeOfLoss: {
    type: string,                        // 'Burst Pipe' | 'Flooding' | 'Ice Dam' | etc.
    description: string,
    location: string,                    // Where the loss occurred
    discoveryDate: timestamp,
    eventDate: timestamp
  },
  
  // JOB STATUS & WORKFLOW
  jobStatus: 'Pre-Install' | 'Install' | 'Demo' | 'Check Service' | 'Pull' | 'Complete' | 'On Hold',
  workflowPhases: {
    install: {
      status: 'pending' | 'in-progress' | 'completed',
      startedAt: timestamp,
      completedAt: timestamp,
      technician: string,                // UID of MIT Tech
      notes: string
    },
    demo: {
      status: 'pending' | 'in-progress' | 'completed',
      startedAt: timestamp,
      completedAt: timestamp,
      technician: string,
      notes: string,
      scheduledDate: timestamp
    },
    checkService: {
      status: 'pending' | 'in-progress' | 'completed',
      visits: [
        {
          visitNumber: number,
          startedAt: timestamp,
          completedAt: timestamp,
          technician: string,
          notes: string,
          readingsVerified: boolean
        }
      ]
    },
    pull: {
      status: 'pending' | 'in-progress' | 'completed',
      startedAt: timestamp,
      completedAt: timestamp,
      technician: string,
      notes: string
    }
  },
  
  // ROOM DATA
  rooms: [
    {
      roomId: string,
      roomName: string,
      roomType: string,                  // 'Bedroom' | 'Bathroom' | 'Kitchen' | etc.
      affectedStatus: 'affected' | 'unaffected' | 'partially-affected',
      dimensions: {
        length: number,                  // in feet
        width: number,
        height: number,
        squareFootage: number            // calculated
      },
      materialsAffected: [
        {
          materialId: string,
          materialType: string,          // 'Drywall' | 'Flooring' | 'Carpet' | etc.
          condition: 'wet' | 'damp' | 'dry',
          squareFootageAffected: number,
          removalDate: timestamp,
          removalPhotos: string[],       // URLs to Firebase Storage
          exposedMaterials: [
            {
              materialId: string,
              materialType: string,
              exposedAt: timestamp,
              readingsRequired: boolean
            }
          ]
        }
      ],
      moistureReadings: [
        {
          readingId: string,
          material: string,
          moisturePercentage: number,
          temperature: number,
          humidity: number,
          recordedAt: timestamp,
          readingType: 'pre-demo' | 'post-demo' | 'daily-check' | 'final',
          technicianId: string,
          photoUrl: string
        }
      ],
      photos: [
        {
          photoId: string,
          url: string,
          timestamp: timestamp,
          step: 'arrival' | 'assessment' | 'pre-demo' | 'demo' | 'post-demo' | 'daily-check' | 'final',
          caption: string,
          room: string,
          uploadedBy: string              // UID
        }
      ],
      dryingChamber: string,              // Chamber ID this room belongs to
      isClosed: boolean,
      closureNotes: string
    }
  ],
  
  // EQUIPMENT
  equipment: {
    chambers: [
      {
        chamberId: string,
        chamberName: string,
        assignedRooms: string[],         // Room IDs
        deploymentDate: timestamp,
        removalDate: timestamp,
        status: 'planned' | 'deployed' | 'removed',
        dehumidifiers: [
          {
            equipmentId: string,
            serialNumber: string,
            model: string,
            scanCode: string,
            deploymentTime: timestamp,
            removalTime: timestamp,
            readings: [
              {
                readingId: string,
                timestamp: timestamp,
                temperature: number,
                humidity: number,
                hoursRunning: number,
                ppd: number                // Pints per day
              }
            ],
            conditionOnRemoval: 'good' | 'needs-repair' | 'damaged'
          }
        ],
        airMovers: [
          {
            equipmentId: string,
            serialNumber: string,
            model: string,
            scanCode: string,
            deploymentTime: timestamp,
            removalTime: timestamp,
            conditionOnRemoval: 'good' | 'needs-repair' | 'damaged'
          }
        ],
        airScrubbers: [
          {
            equipmentId: string,
            serialNumber: string,
            model: string,
            scanCode: string,
            deploymentTime: timestamp,
            removalTime: timestamp,
            conditionOnRemoval: 'good' | 'needs-repair' | 'damaged'
          }
        ]
      }
    ],
    calculations: {
      totalAffectedSquareFootage: number,
      estimatedDryingDays: number,
      recommendedDehumidifierCount: number,
      recommendedAirMoverCount: number,
      recommendedAirScrubberCount: number,
      calculationMethod: string,          // 'IICRC Standard'
      lastCalculatedAt: timestamp,
      calculatedBy: string                // UID
    }
  },
  
  // SAFETY & COMPLIANCE
  safetyChecklist: {
    preArrivalInspection: boolean,
    containmentSetup: boolean,
    ppeEquipped: boolean,
    safetyConesPlaced: boolean,
    utilityLocations: {
      electrical: boolean,
      gas: boolean,
      water: boolean,
      verified: boolean,
      verifiedAt: timestamp
    },
    hazardsIdentified: [
      {
        hazardId: string,
        type: string,
        description: string,
        mitigationSteps: string,
        resolved: boolean
      }
    ]
  },
  
  // CUSTOMER COMMUNICATION
  communication: {
    groundRulesPresented: boolean,
    estimatedTimeline: string,
    customerConcerns: string[],
    preExistingConditions: [
      {
        conditionId: string,
        description: string,
        location: string,
        photoUrl: string
      }
    ]
  },
  
  // FINANCIAL
  financial: {
    insuranceDeductible: number,
    estimatedMaterials: number,
    estimatedLabor: number,
    estimatedTotal: number,
    actualExpenses: {
      materials: number,
      labor: number,
      equipment: number,
      total: number
    },
    paymentStatus: 'unpaid' | 'partial' | 'paid',
    paymentMethod: 'cash' | 'insurance' | 'mixed',
    payments: [
      {
        paymentId: string,
        amount: number,
        timestamp: timestamp,
        method: 'cash' | 'stripe' | 'insurance',
        stripeTransactionId: string,
        processedBy: string,
        receiptUrl: string
      }
    ]
  },
  
  // DOCUMENTATION
  documentation: {
    matterportScan: {
      completed: boolean,
      url: string,
      scanDate: timestamp
    },
    certificateOfSatisfaction: {
      obtained: boolean,
      signedDate: timestamp,
      customerSignature: string          // Base64 or storage URL
    },
    dryReleaseWaiver: {
      needed: boolean,
      obtained: boolean,
      signedDate: timestamp,
      customerSignature: string
    }
  },
  
  // SCHEDULING
  scheduling: {
    assignedTechnician: string,           // UID of primary tech
    assignedZone: string,
    scheduledDates: {
      install: timestamp,
      demo: timestamp,
      checkServices: [timestamp],
      pull: timestamp
    },
    estimatedCompletion: timestamp,
    actualCompletion: timestamp
  },
  
  // TRACKING & METADATA
  metadata: {
    createdAt: timestamp,
    createdBy: string,                   // UID
    lastModifiedAt: timestamp,
    lastModifiedBy: string,
    isSyncPending: boolean,              // For offline tracking
    isArchived: boolean,
    tags: string[],
    internalNotes: string
  }
}
```

**Indexes Needed:**
- `jobStatus` + `scheduledDates.install`
- `assignedTechnician` + `jobStatus`
- `metadata.createdAt` (descending)
- `assignedZone` + `jobStatus`

---

### Collection: `equipment`

```typescript
{
  equipmentId: string,                   // UUID
  serialNumber: string,
  model: string,
  type: 'dehumidifier' | 'air-mover' | 'air-scrubber',
  category: 'standard' | 'commercial' | 'heavy-duty',
  
  // SPECIFICATIONS
  specifications: {
    manufacturer: string,
    purchaseDate: timestamp,
    purchasePrice: number,
    capacity: {
      ppd: number,                       // Pints Per Day (for dehumidifiers)
      cfm: number,                       // Cubic Feet per Minute (for movers/scrubbers)
      description: string
    },
    dimensions: {
      width: number,
      depth: number,
      height: number
    },
    weight: number,
    powerRequirements: {
      voltage: number,
      amperage: number,
      wattage: number
    }
  },
  
  // STATUS & TRACKING
  currentStatus: 'available' | 'deployed' | 'maintenance' | 'damaged' | 'retired',
  currentLocation: {
    jobId: string,
    chamberId: string,
    deployedAt: timestamp,
    expectedRemovalAt: timestamp
  },
  
  // MAINTENANCE
  maintenance: {
    lastServiceDate: timestamp,
    nextServiceDate: timestamp,
    maintenanceHistory: [
      {
        serviceId: string,
        date: timestamp,
        type: 'regular' | 'repair' | 'inspection',
        description: string,
        technician: string,
        cost: number
      }
    ],
    issuesDetected: [
      {
        issueId: string,
        date: timestamp,
        description: string,
        severity: 'low' | 'medium' | 'high',
        resolved: boolean,
        resolution: string
      }
    ]
  },
  
  // SCANNING & QR CODE
  scanCode: string,                      // QR code identifier
  tagNumber: string,                     // Physical tag on equipment
  
  metadata: {
    createdAt: timestamp,
    createdBy: string,
    lastModifiedAt: timestamp,
    totalDeployments: number,
    totalDaysDeployed: number
  }
}
```

---

### Collection: `workOrders`

```typescript
{
  workOrderId: string,
  jobId: string,
  
  orderType: 'install' | 'demo' | 'check-service' | 'pull' | 'equipment-removal',
  
  scheduling: {
    plannedDate: timestamp,
    plannedStartTime: string,            // HH:MM format
    plannedEndTime: string,
    actualStartTime: timestamp,
    actualEndTime: timestamp,
    estimatedDuration: number,           // minutes
    actualDuration: number
  },
  
  assignment: {
    assignedTechnician: string,          // UID
    assignedBy: string,                  // UID of MIT Lead
    notes: string,
    priority: 'low' | 'normal' | 'high' | 'urgent'
  },
  
  tasks: [
    {
      taskId: string,
      taskName: string,
      taskType: string,                  // 'inspection' | 'removal' | 'assessment' etc.
      required: boolean,
      completed: boolean,
      completedAt: timestamp,
      completedBy: string,
      notes: string
    }
  ],
  
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold',
  
  estimatedScope: string,
  actualScope: string,
  
  completionChecklistItems: [
    {
      itemId: string,
      description: string,
      required: boolean,
      checked: boolean,
      checkedAt: timestamp,
      checkedBy: string
    }
  ],
  
  metadata: {
    createdAt: timestamp,
    createdBy: string,
    lastModifiedAt: timestamp,
    lastModifiedBy: string,
    isSyncPending: boolean
  }
}
```

---

### Collection: `redFlags`

```typescript
{
  flagId: string,
  jobId: string,
  
  flagType: 'missing-photos' | 'missing-readings' | 'missing-documentation' | 
            'overdue-job' | 'equipment-discrepancy' | 'unusual-reading' | 
            'incomplete-checklist' | 'payment-issue',
  
  severity: 'low' | 'medium' | 'high' | 'critical',
  
  description: string,
  detail: string,                        // Specific information about the flag
  
  createdAt: timestamp,
  triggeredBy: string,                   // What action triggered the flag
  
  flagStatus: 'open' | 'acknowledged' | 'resolved' | 'dismissed',
  
  assignedTo: string,                    // UID of MIT Lead
  resolvedAt: timestamp,
  resolvedBy: string,
  resolutionNotes: string,
  
  autoGenerated: boolean                 // Was this created by system or manual?
}
```

---

### Collection: `notifications`

```typescript
{
  notificationId: string,
  userId: string,                        // UID of recipient
  
  type: 'job-assigned' | 'red-flag' | 'approval-needed' | 'schedule-change' | 
        'equipment-scan' | 'payment-received' | 'sync-error' | 'offline-mode',
  
  title: string,
  message: string,
  
  relatedEntity: {
    entityType: 'job' | 'work-order' | 'flag' | 'equipment',
    entityId: string
  },
  
  createdAt: timestamp,
  readAt: timestamp,
  actionUrl: string,                     // Where to navigate when clicked
  
  metadata: {
    priority: 'low' | 'normal' | 'high',
    dismissible: boolean
  }
}
```

---

### Collection: `syncQueue` (For offline tracking)

```typescript
{
  queueId: string,
  userId: string,                        // UID of the user
  
  action: 'create' | 'update' | 'delete',
  entityType: 'job' | 'room' | 'photo' | 'reading' | 'equipment',
  entityId: string,
  
  data: object,                          // The data to sync
  timestamp: timestamp,
  retries: number,
  lastRetryAt: timestamp,
  
  status: 'pending' | 'synced' | 'error',
  errorMessage: string
}
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    function isMITLead() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MIT_LEAD';
    }
    
    function isMITTech() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MIT_TECH';
    }
    
    function isOwnUser() {
      return request.auth.uid == resource.data.uid;
    }
    
    // Users collection
    match /users/{uid} {
      allow read: if isSignedIn() && (isOwnUser() || isMITLead() || isAdmin());
      allow create: if isSignedIn() && isOwnUser();
      allow update: if isSignedIn() && (isOwnUser() || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Jobs collection
    match /jobs/{jobId} {
      allow read: if isSignedIn() && (
        request.auth.uid == resource.data.scheduledTechnician ||
        isMITLead() ||
        isAdmin()
      );
      allow create: if isSignedIn() && (isMITLead() || isAdmin());
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.scheduledTechnician ||
        isMITLead() ||
        isAdmin()
      );
      allow delete: if isAdmin();
      
      // Nested collections
      match /photos/{photoId} {
        allow read: if isSignedIn();
        allow create: if isSignedIn();
        allow update, delete: if isSignedIn() && request.auth.uid == resource.data.uploadedBy;
      }
    }
    
    // Equipment collection
    match /equipment/{equipmentId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (isMITLead() || isAdmin());
      allow update: if isSignedIn() && (isMITLead() || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Work Orders collection
    match /workOrders/{workOrderId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (isMITLead() || isAdmin());
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.assignment.assignedTechnician ||
        isMITLead() ||
        isAdmin()
      );
      allow delete: if isAdmin();
    }
    
    // Red Flags collection
    match /redFlags/{flagId} {
      allow read: if isSignedIn() && (
        request.auth.uid == resource.data.assignedTo ||
        isMITLead() ||
        isAdmin()
      );
      allow create: if isSignedIn() && (isMITLead() || isAdmin());
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.assignedTo ||
        isMITLead() ||
        isAdmin()
      );
      allow delete: if isAdmin();
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, update: if isSignedIn() && request.auth.uid == resource.data.userId;
      allow create: if isSignedIn() && isAdmin();
      allow delete: if isAdmin();
    }
    
    // Sync Queue (internal only)
    match /syncQueue/{queueId} {
      allow read, write: if isSignedIn();
    }
  }
}
```

---

# SAMPLE DATA & SEEDING STRATEGY

## Seed Data Overview

### Data to Generate (30 jobs total)

- **8 jobs in Install phase** (various stages of progress)
- **7 jobs in Demo phase** (some with demo completed, some ongoing)
- **9 jobs in Check Service phase** (1-5 check services each)
- **6 jobs in Pull phase** (at various completion states)

### Sample User Accounts (Pre-created)

```typescript
// MIT TECH USERS
{
  email: 'marcus.johnson@entrusted.com',
  password: 'Demo@12345',
  role: 'MIT_TECH',
  displayName: 'Marcus Johnson',
  zone: 'Zone 1'
}

{
  email: 'sarah.williams@entrusted.com',
  password: 'Demo@12345',
  role: 'MIT_TECH',
  displayName: 'Sarah Williams',
  zone: 'Zone 2'
}

{
  email: 'james.lee@entrusted.com',
  password: 'Demo@12345',
  role: 'MIT_TECH',
  displayName: 'James Lee',
  zone: 'Zone 1'
}

{
  email: 'jessica.martinez@entrusted.com',
  password: 'Demo@12345',
  role: 'MIT_TECH',
  displayName: 'Jessica Martinez',
  zone: 'Zone 3'
}

// MIT LEAD USERS
{
  email: 'derek.pool@entrusted.com',
  password: 'Demo@12345',
  role: 'MIT_LEAD',
  displayName: 'Derek Pool',
  zone: 'All Zones'
}

{
  email: 'luke.giraudeau@entrusted.com',
  password: 'Demo@12345',
  role: 'MIT_LEAD',
  displayName: 'Luke Giraudeau',
  zone: 'All Zones'
}

// ADMIN USER
{
  email: 'jason.brannon@entrusted.com',
  password: 'Demo@12345',
  role: 'ADMIN',
  displayName: 'Jason Brannon'
}
```

### Sample Equipment Fleet

```typescript
// DEHUMIDIFIERS
[
  { model: 'Dehumidifier PRO-400', ppd: 400, type: 'dehumidifier' },
  { model: 'Dehumidifier PRO-500', ppd: 500, type: 'dehumidifier' },
  { model: 'Dehumidifier PRO-600', ppd: 600, type: 'dehumidifier' },
  { model: 'Dehumidifier COMPACT-200', ppd: 200, type: 'dehumidifier' }
]

// AIR MOVERS
[
  { model: 'TurboDry 3000', cfm: 3000, type: 'air-mover' },
  { model: 'TurboDry 4000', cfm: 4000, type: 'air-mover' },
  { model: 'TurboDry 5000', cfm: 5000, type: 'air-mover' }
]

// AIR SCRUBBERS
[
  { model: 'PureAir 1000', type: 'air-scrubber', cfm: 1000 },
  { model: 'PureAir 1500', type: 'air-scrubber', cfm: 1500 }
]
```

## Seed Data Generation Script

```typescript
// scripts/seedDatabase.ts
import admin from 'firebase-admin';
import faker from '@faker-js/faker';

const db = admin.firestore();

async function seedDatabase() {
  console.log('Starting database seed...');
  
  // 1. Create sample users
  await seedUsers();
  
  // 2. Create equipment inventory
  await seedEquipment();
  
  // 3. Create 30 sample jobs across all phases
  await seedJobs();
  
  // 4. Create work orders
  await seedWorkOrders();
  
  // 5. Create red flags
  await seedRedFlags();
  
  console.log('Seed complete!');
}

async function seedUsers() {
  const users = [
    // MIT TECH users
    {
      email: 'marcus.johnson@entrusted.com',
      displayName: 'Marcus Johnson',
      role: 'MIT_TECH',
      zone: 'Zone 1'
    },
    // ... more users
  ];
  
  for (const user of users) {
    try {
      const auth = await admin.auth().createUser({
        email: user.email,
        password: 'Demo@12345',
        displayName: user.displayName
      });
      
      await db.collection('users').doc(auth.uid).set({
        uid: auth.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        zone: user.zone,
        createdAt: admin.firestore.Timestamp.now(),
        metadata: {
          totalJobsCompleted: Math.floor(Math.random() * 50),
          totalEquipmentScans: Math.floor(Math.random() * 200)
        }
      });
    } catch (error: any) {
      if (error.code !== 'auth/email-already-exists') {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
  }
}

async function seedEquipment() {
  const equipment = [
    // Dehumidifiers
    {
      model: 'Dehumidifier PRO-400',
      type: 'dehumidifier',
      serialNumber: `DEHU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ppd: 400,
      currentStatus: 'available'
    },
    // ... more equipment
  ];
  
  for (const item of equipment) {
    await db.collection('equipment').add({
      ...item,
      createdAt: admin.firestore.Timestamp.now()
    });
  }
}

async function seedJobs() {
  const phases = ['Install', 'Demo', 'Check Service', 'Pull'];
  const zones = ['Zone 1', 'Zone 2', 'Zone 3', '2nd Shift'];
  
  for (let i = 0; i < 30; i++) {
    const phase = phases[Math.floor(i / 7.5)];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    
    const jobData = {
      jobId: `JOB-${Date.now()}-${i}`,
      customerInfo: {
        name: faker.person.fullName(),
        address: faker.location.streetAddress(),
        city: 'Houston',
        state: 'TX',
        zipCode: faker.location.zipCode('7####'),
        phoneNumber: faker.phone.number('(###) ###-####'),
        email: faker.internet.email()
      },
      insuranceInfo: {
        carrierName: faker.company.name(),
        policyNumber: faker.string.alphaNumeric(10).toUpperCase(),
        claimNumber: `CLM-${faker.string.numeric(8)}`,
        deductible: [500, 1000, 2500, 5000][Math.floor(Math.random() * 4)]
      },
      jobStatus: phase,
      // ... more data
      createdAt: admin.firestore.Timestamp.now()
    };
    
    await db.collection('jobs').doc(jobData.jobId).set(jobData);
  }
}

// Run seed
seedDatabase().catch(console.error);
```

---

# REACT COMPONENT ARCHITECTURE

## Project Structure

```
src/
├── public/
│   ├── manifest.json                   # PWA manifest
│   ├── service-worker.js               # Service worker for offline
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── entrusted-logo.svg
│
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx              # Main app layout with navigation
│   │   ├── Navbar.tsx                  # Top navigation
│   │   ├── Sidebar.tsx                 # Left navigation menu
│   │   └── NotificationBanner.tsx      # In-app notifications
│   │
│   ├── auth/
│   │   ├── LoginPage.tsx               # Email login
│   │   ├── OfflineLoginPrompt.tsx      # Cached login option
│   │   └── ProtectedRoute.tsx          # Role-based routing
│   │
│   ├── mit-tech/
│   │   ├── dashboard/
│   │   │   ├── DailyJobList.tsx        # List of today's jobs
│   │   │   ├── JobCard.tsx             # Individual job summary card
│   │   │   └── JobDetailView.tsx       # Full job details (read-only, for reference)
│   │   │
│   │   ├── workflows/
│   │   │   ├── install/
│   │   │   │   ├── OfficeStep.tsx      # At Office workflows
│   │   │   │   ├── TruckPrepStep.tsx
│   │   │   │   ├── PropertyArrivalStep.tsx
│   │   │   │   ├── ClockInStep.tsx
│   │   │   │   ├── ReviewJobDetailsStep.tsx
│   │   │   │   ├── FrontDoorStep.tsx
│   │   │   │   ├── CustomerIntroStep.tsx
│   │   │   │   ├── GroundRulesStep.tsx
│   │   │   │   ├── PropertyWalkthroughStep.tsx
│   │   │   │   ├── InsideHouseStep.tsx
│   │   │   │   ├── RoomEvaluationStep.tsx
│   │   │   │   ├── EquipmentCalculationsStep.tsx
│   │   │   │   ├── EquipmentPlacementStep.tsx
│   │   │   │   ├── DryingChamberSetupStep.tsx
│   │   │   │   ├── FinalDocumentationStep.tsx
│   │   │   │   └── LeavingHouseStep.tsx
│   │   │   │
│   │   │   ├── demo/
│   │   │   │   ├── PreDemoSetupStep.tsx
│   │   │   │   ├── PreDemoDocumentationStep.tsx
│   │   │   │   ├── RoomByRoomDemoStep.tsx
│   │   │   │   ├── DisposalDocumentationStep.tsx
│   │   │   │   ├── PostDemoAssessmentStep.tsx
│   │   │   │   ├── EquipmentAdjustmentStep.tsx
│   │   │   │   └── FinalDocumentationStep.tsx
│   │   │   │
│   │   │   ├── checkservice/
│   │   │   │   ├── ChamberReadingsStep.tsx
│   │   │   │   ├── RoomByRoomAssessmentStep.tsx
│   │   │   │   ├── ProgressEvaluationStep.tsx
│   │   │   │   └── FinalDocumentationStep.tsx
│   │   │   │
│   │   │   └── pull/
│   │   │       ├── FinalMoistureReadingsStep.tsx
│   │   │       ├── EquipmentRemovalStep.tsx
│   │   │       ├── SiteRestorationStep.tsx
│   │   │       ├── PaymentCollectionStep.tsx
│   │   │       ├── MatterportVerificationStep.tsx
│   │   │       ├── DryReleaseWaiverStep.tsx
│   │   │       └── CompletionVerificationStep.tsx
│   │   │
│   │   ├── rooms/
│   │   │   ├── RoomList.tsx            # List all rooms in job
│   │   │   ├── RoomDetail.tsx          # View/edit room details
│   │   │   ├── RoomForm.tsx            # Add/edit room form
│   │   │   └── MaterialsAffectedSection.tsx
│   │   │
│   │   ├── photos/
│   │   │   ├── PhotoCapture.tsx        # Camera interface
│   │   │   ├── PhotoGallery.tsx        # View all photos
│   │   │   ├── PhotoOrganization.tsx   # Organize by room/step
│   │   │   └── PhotoUploadQueue.tsx    # Pending photo uploads
│   │   │
│   │   ├── equipment/
│   │   │   ├── EquipmentScanner.tsx    # QR code scanning
│   │   │   ├── EquipmentList.tsx       # List equipment in job
│   │   │   ├── EquipmentPlacement.tsx  # Chamber/room assignment
│   │   │   └── EquipmentReadings.tsx   # Temperature/humidity readings
│   │   │
│   │   ├── safety/
│   │   │   ├── SafetyChecklist.tsx
│   │   │   └── HazardTracking.tsx
│   │   │
│   │   ├── notes/
│   │   │   └── JobNotes.tsx
│   │   │
│   │   └── completion/
│   │       ├── CompletionChecklist.tsx
│   │       └── JobSummary.tsx
│   │
│   ├── mit-lead/
│   │   ├── dashboard/
│   │   │   ├── ScheduleOverview.tsx    # Daily schedule view
│   │   │   ├── ZoneView.tsx            # Jobs by zone
│   │   │   ├── JobStatusSummary.tsx    # Cards showing status counts
│   │   │   └── QuickStats.tsx          # KPIs and metrics
│   │   │
│   │   ├── job-monitoring/
│   │   │   ├── JobList.tsx             # All jobs, searchable/filterable
│   │   │   ├── JobDetailPanel.tsx      # View full job details
│   │   │   ├── JobApprovalPanel.tsx    # Approve completed jobs
│   │   │   └── JobEditModal.tsx        # Edit job details
│   │   │
│   │   ├── red-flags/
│   │   │   ├── RedFlagDashboard.tsx    # All red flags
│   │   │   ├── RedFlagCard.tsx         # Individual flag card
│   │   │   ├── FlagDetail.tsx          # Detailed flag info & resolution
│   │   │   └── FlagStatusFilter.tsx    # Filter by severity/type
│   │   │
│   │   ├── work-orders/
│   │   │   ├── WorkOrderList.tsx
│   │   │   ├── WorkOrderForm.tsx       # Create/edit work order
│   │   │   ├── WorkOrderScheduler.tsx  # Calendar-based scheduling
│   │   │   └── WorkOrderDetail.tsx
│   │   │
│   │   ├── equipment-verification/
│   │   │   ├── EquipmentInventory.tsx  # All equipment status
│   │   │   ├── DeploymentTracking.tsx  # Where equipment is deployed
│   │   │   └── EquipmentIssues.tsx     # Maintenance & damage tracking
│   │   │
│   │   ├── reporting/
│   │   │   ├── ReportGenerator.tsx     # Choose report type
│   │   │   ├── DryLogReport.tsx        # PDF dry log
│   │   │   ├── EquipmentReport.tsx     # Equipment summary
│   │   │   ├── InvoicingReport.tsx     # Data for invoicing
│   │   │   └── ExportPanel.tsx         # CSV/PDF export
│   │   │
│   │   └── team-management/
│   │       ├── TechnicianList.tsx
│   │       ├── TechnicianDetail.tsx    # Performance, assigned jobs
│   │       └── TechnicianAssignment.tsx
│   │
│   ├── shared/
│   │   ├── forms/
│   │   │   ├── MoistureReadingForm.tsx
│   │   │   ├── PhotoUploadForm.tsx
│   │   │   ├── RoomDimensionForm.tsx
│   │   │   ├── EquipmentForm.tsx
│   │   │   └── PaymentForm.tsx         # Stripe integration
│   │   │
│   │   ├── modals/
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── PhotoViewerModal.tsx
│   │   │   ├── EquipmentScanModal.tsx
│   │   │   └── ErrorModal.tsx
│   │   │
│   │   ├── cards/
│   │   │   ├── JobCard.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   ├── EquipmentCard.tsx
│   │   │   └── ReadingCard.tsx
│   │   │
│   │   ├── charts/
│   │   │   ├── MoistureProgressChart.tsx
│   │   │   ├── TemperatureChart.tsx
│   │   │   ├── HumidityChart.tsx
│   │   │   └── EquipmentUsageChart.tsx
│   │   │
│   │   ├── inputs/
│   │   │   ├── MoistureInput.tsx
│   │   │   ├── TemperatureInput.tsx
│   │   │   ├── DimensionInput.tsx
│   │   │   └── SquareFootageInput.tsx
│   │   │
│   │   ├── buttons/
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   ├── DangerButton.tsx
│   │   │   ├── CtaButton.tsx           # Call-to-action (orange)
│   │   │   └── SmallButton.tsx
│   │   │
│   │   ├── loaders/
│   │   │   ├── Spinner.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   └── status-indicators/
│   │       ├── JobStatusBadge.tsx
│   │       ├── SyncStatus.tsx          # Online/offline indicator
│   │       ├── PhaseProgressIndicator.tsx
│   │       └── RedFlagIndicator.tsx
│   │
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── UserManagement.tsx
│       ├── SystemLogs.tsx
│       └── DataManagement.tsx
│
├── hooks/
│   ├── useAuth.ts                      # Authentication context
│   ├── useJobs.ts                      # Jobs data & operations
│   ├── usePhotos.ts                    # Photo upload & management
│   ├── useEquipment.ts                 # Equipment scanning & tracking
│   ├── useWorkOrders.ts                # Work order management
│   ├── useRedFlags.ts                  # Red flag detection & tracking
│   ├── useOfflineSync.ts               # Offline sync logic
│   ├── useNotifications.ts             # In-app notifications
│   ├── useRealtimeUpdates.ts           # Real-time Firestore listeners
│   ├── usePagination.ts                # Pagination helper
│   └── useQueryFilter.ts               # Search & filter logic
│
├── services/
│   ├── firebase/
│   │   ├── config.ts                   # Firebase initialization
│   │   ├── auth.ts                     # Auth service methods
│   │   ├── jobs.ts                     # Job CRUD operations
│   │   ├── rooms.ts                    # Room management
│   │   ├── photos.ts                   # Photo upload/download
│   │   ├── equipment.ts                # Equipment operations
│   │   ├── workOrders.ts               # Work order operations
│   │   ├── redFlags.ts                 # Red flag operations
│   │   └── notifications.ts            # Notification operations
│   │
│   ├── offline/
│   │   ├── indexedDB.ts                # IndexedDB operations
│   │   ├── syncQueue.ts                # Manage pending syncs
│   │   ├── conflictResolver.ts         # Resolve sync conflicts
│   │   └── serviceWorkerUtils.ts
│   │
│   ├── equipment/
│   │   ├── calculations.ts             # IICRC calculations
│   │   ├── qrScanner.ts                # QR code scanning
│   │   └── equipmentDatabase.ts        # Equipment specs
│   │
│   ├── exports/
│   │   ├── pdfGenerator.ts             # PDF dry log generation
│   │   ├── csvExporter.ts              # CSV export
│   │   └── reportBuilder.ts            # Report compilation
│   │
│   ├── validation/
│   │   ├── jobValidation.ts
│   │   ├── roomValidation.ts
│   │   ├── readingValidation.ts
│   │   └── fieldValidators.ts
│   │
│   └── stripe/
│       └── paymentService.ts           # Stripe integration
│
├── stores/
│   ├── authStore.ts                    # Zustand auth state
│   ├── jobsStore.ts                    # Zustand jobs state
│   ├── uiStore.ts                      # Zustand UI state (modals, filters)
│   ├── syncStore.ts                    # Zustand sync state
│   └── notificationStore.ts            # Zustand notification state
│
├── types/
│   ├── index.ts                        # All TypeScript types/interfaces
│   ├── job.ts
│   ├── room.ts
│   ├── equipment.ts
│   ├── workOrder.ts
│   ├── redFlag.ts
│   ├── user.ts
│   └── firebase.ts
│
├── styles/
│   ├── globals.css                     # Global styles
│   ├── tailwind.css                    # Tailwind config
│   ├── brand.css                       # Entrusted brand colors/fonts
│   ├── responsive.css                  # Responsive utilities
│   └── animations.css                  # Transitions & animations
│
├── utils/
│   ├── dateUtils.ts                    # Date formatting & calculations
│   ├── numberUtils.ts                  # Number formatting
│   ├── fileUtils.ts                    # File operations
│   ├── debounce.ts
│   ├── throttle.ts
│   ├── getLocation.ts                  # Geolocation
│   ├── logging.ts                      # Debug logging
│   └── constants.ts                    # App constants
│
├── App.tsx                             # Main app component
├── AppRouter.tsx                       # Route configuration
├── index.tsx                           # Entry point
└── reportWebVitals.ts                  # Performance monitoring
```

---

# AUTHENTICATION & AUTHORIZATION

## Email-Based Authentication Flow

```typescript
// services/firebase/auth.ts

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, 
         signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const authService = {
  async register(email: string, password: string, displayName: string, role: 'MIT_TECH' | 'MIT_LEAD') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      role,
      zone: role === 'MIT_TECH' ? 'Zone 1' : 'All Zones',
      createdAt: new Date(),
      isActive: true,
      preferences: {
        notifications: true,
        darkMode: false,
        preferredTimeZone: 'America/Chicago'
      }
    });
    
    return userCredential.user;
  },
  
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },
  
  async logout() {
    await signOut(auth);
  },
  
  async getUserData(uid: string) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.data();
  },
  
  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }
};
```

## Offline Login with Cached Credentials

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications } from '@/hooks/useNotifications';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const authStore = useAuthStore();
  const { addNotification } = useNotifications();
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try online login first
      const user = await authService.login(email, password);
      
      // Cache credentials for offline use
      localStorage.setItem('cachedEmail', email);
      localStorage.setItem('cachedHash', btoa(password)); // Simple obfuscation
      localStorage.setItem('cachedUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }));
      
      authStore.setUser(user);
      authStore.setOnlineStatus(true);
    } catch (error) {
      // Try offline login with cached credentials
      const cachedEmail = localStorage.getItem('cachedEmail');
      const cachedHash = localStorage.getItem('cachedHash');
      
      if (cachedEmail === email && cachedHash === btoa(password)) {
        const cachedUser = JSON.parse(localStorage.getItem('cachedUser') || '{}');
        authStore.setUser(cachedUser);
        authStore.setOnlineStatus(false);
        addNotification({
          type: 'offline-mode',
          title: 'Offline Mode',
          message: 'You are using cached credentials. Changes will sync when online.'
        });
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return { login, logout: authService.logout, isLoading };
};
```

## Role-Based Access Control

```typescript
// components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'MIT_TECH' | 'MIT_LEAD' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, role, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

---

# OFFLINE FUNCTIONALITY

## Service Worker Implementation

```typescript
// public/service-worker.js

const CACHE_NAME = 'mit-dry-logs-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  // Add manifest, icons, etc.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network first for API calls, cache fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Background sync for pending changes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jobs') {
    event.waitUntil(syncPendingChanges());
  }
});

async function syncPendingChanges() {
  // Trigger sync from IndexedDB
  const message = { type: 'SYNC_DATA' };
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
}
```

## IndexedDB Management

```typescript
// services/offline/indexedDB.ts

import { openDB } from 'idb';

const DB_NAME = 'MIT_DRY_LOGS_DB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for job data
      if (!db.objectStoreNames.contains('jobs')) {
        db.createObjectStore('jobs', { keyPath: 'jobId' });
      }
      
      // Store for rooms
      if (!db.objectStoreNames.contains('rooms')) {
        const roomStore = db.createObjectStore('rooms', { keyPath: 'roomId' });
        roomStore.createIndex('jobId', 'jobId');
      }
      
      // Store for photos (metadata only, actual photos in Cloud Storage)
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'photoId' });
        photoStore.createIndex('jobId', 'jobId');
        photoStore.createIndex('syncStatus', 'syncStatus');
      }
      
      // Store for readings
      if (!db.objectStoreNames.contains('readings')) {
        const readingStore = db.createObjectStore('readings', { keyPath: 'readingId' });
        readingStore.createIndex('jobId', 'jobId');
        readingStore.createIndex('roomId', 'roomId');
      }
      
      // Store for sync queue
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('status', 'status');
      }
    }
  });
};

export const idbService = {
  async saveJob(job: any) {
    const db = await initDB();
    return db.put('jobs', job);
  },
  
  async getJob(jobId: string) {
    const db = await initDB();
    return db.get('jobs', jobId);
  },
  
  async getAllJobs() {
    const db = await initDB();
    return db.getAll('jobs');
  },
  
  async savePhoto(photo: any) {
    const db = await initDB();
    return db.put('photos', photo);
  },
  
  async addToSyncQueue(action: 'create' | 'update' | 'delete', entity: any) {
    const db = await initDB();
    return db.add('syncQueue', {
      action,
      entity,
      timestamp: Date.now(),
      status: 'pending'
    });
  },
  
  async getSyncQueue() {
    const db = await initDB();
    const allIndex = db.transaction('syncQueue').store.index('status');
    return allIndex.getAll('pending');
  },
  
  async markSynced(queueId: number) {
    const db = await initDB();
    const item = await db.get('syncQueue', queueId);
    item.status = 'synced';
    return db.put('syncQueue', item);
  }
};
```

## Sync Manager

```typescript
// services/offline/syncManager.ts

import { idbService } from './indexedDB';
import { useAuthStore } from '@/stores/authStore';

export const syncManager = {
  async syncData() {
    const { isOnline } = useAuthStore();
    
    if (!isOnline) {
      console.log('Offline: queuing changes for sync');
      return;
    }
    
    console.log('Starting sync...');
    const queue = await idbService.getSyncQueue();
    
    for (const item of queue) {
      try {
        switch (item.action) {
          case 'create':
            await firebase.firestore().collection(item.entity.type).add(item.entity.data);
            break;
          case 'update':
            await firebase.firestore()
              .collection(item.entity.type)
              .doc(item.entity.id)
              .update(item.entity.data);
            break;
          case 'delete':
            await firebase.firestore()
              .collection(item.entity.type)
              .doc(item.entity.id)
              .delete();
            break;
        }
        
        await idbService.markSynced(item.id);
      } catch (error) {
        console.error('Sync error:', error);
        // Keep in queue for retry
      }
    }
    
    console.log('Sync complete');
  },
  
  watchOnlineStatus() {
    window.addEventListener('online', () => {
      console.log('Back online');
      this.syncData();
    });
    
    window.addEventListener('offline', () => {
      console.log('Went offline');
    });
  }
};
```

---

# UI/UX SPECIFICATIONS

## Design System

### Color Palette (Entrusted Brand)

```css
/* Brand Colors */
--color-primary-orange: #f87b4d;
--color-gray: #a4a4a5;
--color-gray-light: #d6d8d7;
--color-white: #ffffff;

/* Status Colors */
--color-success: #4CAF50;
--color-warning: #FFC107;
--color-error: #F44336;
--color-info: #2196F3;

/* Neutral */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f5f5f5;
--color-text-primary: #a4a4a5;
--color-text-secondary: #757575;
--color-border: #e0e0e0;
```

### Typography

```css
/* Headers: Poppins Bold */
h1 { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 48px; }
h2 { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 32px; }
h3 { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 28px; }
h4 { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 24px; }

/* Body: Inter Regular */
body { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 16px; line-height: 1.5; }
.text-emphasis { font-family: 'Inter', sans-serif; font-weight: 500; }
```

### Spacing System

```
Base: 8px
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

## MIT TECH Mobile Interfaces

### Home Screen / Daily Job List

```
┌─────────────────────────────────────────┐
│ [📍 Zone 1]  [Username ▼]   [⚙️]        │ ← Header with zone, user, settings
├─────────────────────────────────────────┤
│                                          │
│  Today's Jobs  [Filter▼]  [Search]     │ ← Title + controls
│                                          │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │ 🟢 INSTALL - In Progress            ││
│  │ Johnson Family - 6003 Soaring Pine  ││
│  │ Started: 9:45 AM • 2h 15min         ││
│  │ [Clock Out] [View Job]              ││
│  └─────────────────────────────────────┘│
│                                          │
│  ┌─────────────────────────────────────┐│
│  │ ⚪ DEMO - Scheduled                  ││
│  │ Williams Residence - 123 Oak Street  ││
│  │ Scheduled: 2:00 PM • Next Stop      ││
│  │ [Start] [Details]                   ││
│  └─────────────────────────────────────┘│
│                                          │
│  ┌─────────────────────────────────────┐│
│  │ ⚪ CHECK SERVICE - Not Yet Started   ││
│  │ Lee Property - 456 Pine Ave         ││
│  │ Scheduled: Tomorrow 10:00 AM        ││
│  │ [Details]                           ││
│  └─────────────────────────────────────┘│
│                                          │
└─────────────────────────────────────────┘
```

### Job Workflow Step Screen (Install Example)

```
┌────────────────────────────────────────────────┐
│ [◄] Install Workflow - Room Evaluation      [X]│ ← Navigation
├────────────────────────────────────────────────┤
│                                                 │
│  Step 4 of 15: Room by Room Evaluation        │ ← Progress indicator
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                 │
├────────────────────────────────────────────────┤
│                                                 │
│  📍 Current Location: Inside the House         │ ← Location context
│                                                 │
│  For each room: name it, take overall photos, │ ← Instructions
│  capture measurements, take thermal imaging  │
│  and moisture meter readings of affected and │
│  unaffected materials.                        │
│                                                 │
├────────────────────────────────────────────────┤
│                                                 │
│  AFFECTED ROOMS                                │ ← Section title
│                                                 │
│  ┌──────────────────────────────────────────┐ │
│  │ [+] Add Room                             │ │ ← Add button
│  └──────────────────────────────────────────┘ │
│                                                 │
│  [Master Bedroom]                             │ ← Room card
│  Length: 15ft • Width: 12ft • Height: 8ft    │
│  Footage: 180 sq ft                          │
│  [ Edit ] [ Delete ]                         │
│                                                 │
│  [Living Room]                                │
│  Length: 20ft • Width: 18ft • Height: 9ft    │
│  Footage: 360 sq ft                          │
│  [ Edit ] [ Delete ]                         │
│                                                 │
├────────────────────────────────────────────────┤
│                                                 │
│  [⬅️ Previous Step]  [Next Step ➜]            │ ← Navigation buttons
│                                                 │
└────────────────────────────────────────────────┘
```

### Photo Capture & Gallery

```
┌─────────────────────────────────────────────┐
│ [◄] Photos - Install Day               [🔧] │
├─────────────────────────────────────────────┤
│                                              │
│ [📸 Take Photo] [📷 Upload] [Filter ▼]     │ ← Actions
│                                              │
├─────────────────────────────────────────────┤
│                                              │
│ MASTER BEDROOM - Overall (2 photos)        │ ← Room grouping
│ ┌─────────┐ ┌─────────┐                   │
│ │ [Photo] │ │ [Photo] │  [+ Add]          │
│ │ 9:34 AM │ │ 9:42 AM │                   │
│ │ [📝]    │ │ [📝]    │                   │
│ └─────────┘ └─────────┘                   │
│                                              │
│ MASTER BEDROOM - Moisture Reading (1)      │
│ ┌─────────┐                                │
│ │ [Photo] │  [+ Add]                      │
│ │ 10:12 AM│                               │
│ │ [📝]    │                               │
│ └─────────┘                                │
│                                              │
│ KITCHEN - Cause of Loss (1)                │
│ ┌─────────┐                                │
│ │ [Photo] │  [+ Add]                      │
│ │ 10:15 AM│                               │
│ │ [📝]    │                               │
│ └─────────┘                                │
│                                              │
└─────────────────────────────────────────────┘
```

### Equipment Calculator & Placement

```
┌────────────────────────────────────────────┐
│ [◄] Equipment Calculations              [ℹ️] │
├────────────────────────────────────────────┤
│                                             │
│ IICRC STANDARD CALCULATIONS                │
│                                             │
│ Total Affected Square Footage:  │ 1,850 ft²│ ← Auto-calculated
│ Water Category:                 │Cat 3     │
│ Estimated Drying Time:          │5-7 days  │
│                                             │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│ RECOMMENDED EQUIPMENT                      │
│                                             │
│ Dehumidifiers:      4 x PRO-500 (500 PPD) │
│ Air Movers:         6 x TurboDry 4000      │
│ Air Scrubbers:      2 x PureAir 1500       │
│                                             │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│ DRYING CHAMBERS                             │
│                                             │
│ Chamber 1: Master Bedroom + Master Bath   │ ← Drag to assign
│   ┌─────────────────────┐                 │
│   │ • PRO-500 Dehu      │                 │
│   │ • TurboDry 4000 x2  │                 │
│   │ • PureAir 1500      │                 │
│   └─────────────────────┘                 │
│                                             │
│ Chamber 2: Living Room + Kitchen           │
│   ┌─────────────────────┐                 │
│   │ • PRO-500 Dehu x2   │                 │
│   │ • TurboDry 4000 x3  │                 │
│   │ • PureAir 1500      │                 │
│   └─────────────────────┘                 │
│                                             │
│ [⬅️ Previous]  [Save & Next ➜]             │
└────────────────────────────────────────────┘
```

## MIT LEAD Web Dashboard

### Daily Schedule Overview

```
┌──────────────────────────────────────────────────────────┐
│ [Entrusted Logo]  Daily Schedule  [Derek Pool ▼] [🔔]  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ [All Zones ▼]  [Today] [This Week] [This Month]         │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  SUMMARY                                                  │
│  ┌────────┬────────┬────────┬────────┐                   │
│  │ Install│  Demo  │ Check  │ Pull   │                   │
│  │   8    │   5    │   12   │   5    │                   │
│  └────────┴────────┴────────┴────────┘                   │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  SCHEDULE BY ZONE                                        │
│                                                           │
│  ZONE 1 (Marcus Johnson, Sarah Williams)                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 9:00 AM  INSTALL | Johnson Family               │    │
│  │          6003 Soaring Pine | 🟢 In Progress     │    │
│  │ 2:00 PM  DEMO    | Williams Residence           │    │
│  │          123 Oak Street | ⚪ Not Started        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ZONE 2 (James Lee)                                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 10:30 AM CHECK   | Lee Property                 │    │
│  │          456 Pine Ave | 🟢 In Progress          │    │
│  │ 1:00 PM  PULL    | Martinez Home                │    │
│  │          789 Elm St | ⚪ Not Started            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Red Flag Dashboard

```
┌──────────────────────────────────────────────────────────┐
│ [◄] Red Flags Dashboard  [Filter ▼] [Sort ▼]           │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ 🔴 CRITICAL (3)   🟠 HIGH (7)   🟡 MEDIUM (12)          │
│                                                           │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ 🔴 CRITICAL                                               │
│                                                           │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Missing Final Readings - JOB-25-WILLIAMS         │    │
│ │ Job pulled 3 days ago, no final moisture readings│    │
│ │ Assigned to: Derek Pool | Open                   │    │
│ │ [Investigate] [Resolve]                         │    │
│ └──────────────────────────────────────────────────┘    │
│                                                           │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Equipment Discrepancy - JOB-24-GARCIA            │    │
│ │ 2x PRO-500 Dehu scanned out but not returned    │    │
│ │ Assigned to: Derek Pool | Open                   │    │
│ │ [Investigate] [Resolve]                         │    │
│ └──────────────────────────────────────────────────┘    │
│                                                           │
│ 🟠 HIGH                                                   │
│                                                           │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Missing Photos - JOB-26-CHEN                     │    │
│ │ Check service completed, only 2 photos uploaded │    │
│ │ Assigned to: Luke Giraudeau | Open              │    │
│ │ [Investigate] [Resolve]                         │    │
│ └──────────────────────────────────────────────────┘    │
│                                                           │
│ [Load More]                                              │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Job Approval Panel

```
┌──────────────────────────────────────────────────────────┐
│ [◄] Job Approval - JOB-25-WILLIAMS                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ CUSTOMER: Johnson Family                                 │
│ ADDRESS: 6003 Soaring Pine Ct, Kingwood, TX            │
│ CLAIM: AGW 215138 | CARRIER: Wellington                │
│ CATEGORY: Cat 1 | DEDUCTIBLE: $5,900                   │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ COMPLETION CHECKLIST                                    │
│                                                           │
│ ✅ All materials documented                              │
│ ✅ Final moisture readings verified                      │
│ ✅ All equipment removed                                 │
│ ✅ Certificate of Satisfaction signed                    │
│ ✅ Dry Release Waiver signed (if applicable)             │
│ ⚠️  Payment verified (PENDING - see below)               │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ MATERIALS REMOVED                                        │
│                                                           │
│ Master Bedroom:                                          │
│   • Drywall: 180 sq ft                                  │
│   • Carpet & Pad: 180 sq ft                             │
│ Kitchen:                                                 │
│   • Baseboards: 45 linear ft                            │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ FINANCIAL SUMMARY                                        │
│                                                           │
│ Estimated Total:        $8,450                          │
│ Actual Expenses:        $7,920                          │
│ Insurance Deductible:   $5,900                          │
│ Client Responsibility:  $2,020                          │
│ Client Payment Received: $2,020 ✅                      │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ TECHNICIAN NOTES                                        │
│                                                           │
│ "Job completed successfully. Customer satisfied with    │
│ work. All materials properly disposed. Ready for         │
│ invoicing." - Marcus Johnson                            │
│                                                           │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ [❌ Reject]  [✅ Approve & Close Job]                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

# FEATURE IMPLEMENTATION ROADMAP

## Sprint 1 (Weeks 1-2): Foundation & Authentication

- [ ] Firebase project setup
- [ ] React project scaffolding with TypeScript
- [ ] Firebase Auth implementation (email/password)
- [ ] User roles and permissions system
- [ ] Offline login with cached credentials
- [ ] Basic routing and layout components
- [ ] Entrusted brand CSS implementation
- [ ] Database seed data generation

## Sprint 2 (Weeks 3-4): Core MIT Tech App - Install Workflow

- [ ] Job selection and daily list view
- [ ] Install workflow step components (At Office through Leaving House)
- [ ] Room management (add, edit, view rooms)
- [ ] Moisture reading data entry
- [ ] Equipment calculator (IICRC standard)
- [ ] Equipment scanning (QR code integration)
- [ ] Drying chamber setup interface
- [ ] Local state management with Zustand

## Sprint 3 (Weeks 5-6): Photos & Documentation

- [ ] Photo capture from mobile camera
- [ ] Firebase Cloud Storage integration
- [ ] Photo gallery and organization (by room/step)
- [ ] Photo upload queue for offline scenario
- [ ] Photo tagging and captioning
- [ ] Document upload (certificates, waivers)

## Sprint 4 (Weeks 7-8): Demo & Check Service Workflows

- [ ] Demo workflow step components
- [ ] Check Service workflow step components
- [ ] Equipment adjustment and movement tracking
- [ ] Daily readings data entry
- [ ] Material removal documentation

## Sprint 5 (Weeks 9-10): Pull & Completion Workflows

- [ ] Pull workflow step components
- [ ] Final moisture readings
- [ ] Equipment removal & scanning
- [ ] Safety verification checklist
- [ ] Job completion summary

## Sprint 6 (Weeks 11-12): Payments & Offline Sync

- [ ] Stripe payment integration
- [ ] Payment collection UI (cash jobs)
- [ ] Receipt generation and storage
- [ ] Offline data queuing (IndexedDB)
- [ ] Sync manager and conflict resolution
- [ ] Service worker setup

## Sprint 7 (Weeks 13-14): MIT Lead Dashboard - Monitoring

- [ ] Daily schedule overview
- [ ] Job status by zone
- [ ] Red flag system and alerts
- [ ] Job detail viewing panel
- [ ] Equipment tracking

## Sprint 8 (Weeks 15-16): MIT Lead Dashboard - Management

- [ ] Job approval workflow
- [ ] Work order creation and editing
- [ ] Work order scheduler
- [ ] Technician assignment
- [ ] Equipment inventory management

## Sprint 9 (Weeks 17-18): Reporting & Export

- [ ] PDF dry log generation
- [ ] CSV export (jobs, equipment, readings)
- [ ] Report templates
- [ ] Financial report generation
- [ ] Equipment usage report

## Sprint 10 (Weeks 19-20): Testing & Polish

- [ ] E2E testing (real device on iOS/Android)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] UX refinement based on testing
- [ ] Bug fixes and edge cases

---

# USER STORY MAPPING

[Detailed mapping of all 389+ user stories to specific components and features will follow - this is where your Excel sheet inputs directly]

## Example Mapping Structure

```
USER STORY: "As a MIT Tech, I want to capture room dimensions so that equipment can be properly calculated"

COMPONENT: RoomForm.tsx
FEATURE: Install Workflow → Inside House → Room by Room Evaluation
FIREBASE COLLECTION: jobs → rooms[roomId]
DATA FIELDS:
  - roomName: string
  - dimensions.length: number
  - dimensions.width: number
  - dimensions.height: number
  - dimensions.squareFootage: number (calculated)

UI ELEMENTS:
  - TextInput for room name
  - NumberInput for length/width/height
  - Auto-calculated square footage display
  - Save button
  - Cancel button

VALIDATION:
  - Room name required
  - Dimensions > 0
  - Height typically 8-12 feet (warn if outside)

OFFLINE: ✅ (stored in IndexedDB until sync)
PHOTO EVIDENCE: ✅ (room photo attached)
```

---

# EQUIPMENT CALCULATIONS (IICRC STANDARDS)

## IICRC Dehumidification Formula

```typescript
// services/equipment/calculations.ts

interface RoomCalculation {
  squareFootage: number;
  waterCategory: 'Category 1' | 'Category 2' | 'Category 3';
  ceilingHeight: number;
  roomVolume: number;
}

export const equipmentCalculations = {
  // Calculate total cubic footage for a room
  calculateVolume(length: number, width: number, height: number): number {
    return length * width * height;
  },
  
  // IICRC standard dehumidifier PPD requirement
  // Rule: 1 PPD per 100 cubic feet for normal conditions
  // Adjusted for water category and humidity
  calculateDehumidifierNeeds(calculation: RoomCalculation): number {
    const { roomVolume, waterCategory } = calculation;
    
    let baseMultiplier = 1;
    
    switch (waterCategory) {
      case 'Category 1':  // Clean water
        baseMultiplier = 1;
        break;
      case 'Category 2':  // Gray water
        baseMultiplier = 1.3;
        break;
      case 'Category 3':  // Contaminated water
        baseMultiplier = 1.5;
        break;
    }
    
    // Base: 1 PPD per 100 cubic feet
    const basePPD = roomVolume / 100;
    return Math.ceil(basePPD * baseMultiplier);
  },
  
  // Air mover calculations
  // Rule: 1 CFM per 100 square feet for drying
  calculateAirMoverNeeds(squareFootage: number): number {
    return Math.ceil(squareFootage / 100);
  },
  
  // Air scrubber calculations
  // Rule: 1 unit per 200-300 square feet for water damage
  calculateAirScrubberNeeds(squareFootage: number): number {
    return Math.ceil(squareFootage / 250);
  },
  
  // Estimate drying time (IICRC standard)
  // Typical: 3-5 days for Category 1, 5-7 for Cat 2, 7-14 for Cat 3
  estimateDryingTime(waterCategory: string): { min: number; max: number; } {
    const estimates = {
      'Category 1': { min: 3, max: 5 },
      'Category 2': { min: 5, max: 7 },
      'Category 3': { min: 7, max: 14 }
    };
    return estimates[waterCategory as keyof typeof estimates] || { min: 5, max: 7 };
  },
  
  // Get recommended equipment models based on PPD requirement
  recommendEquipmentModels(ppdNeeded: number) {
    const dehumidifiers = [
      { model: 'COMPACT-200', ppd: 200 },
      { model: 'PRO-400', ppd: 400 },
      { model: 'PRO-500', ppd: 500 },
      { model: 'PRO-600', ppd: 600 }
    ];
    
    let remaining = ppdNeeded;
    const recommended = [];
    
    // Use largest units first for efficiency
    for (let i = dehumidifiers.length - 1; i >= 0; i--) {
      while (remaining >= dehumidifiers[i].ppd) {
        recommended.push(dehumidifiers[i]);
        remaining -= dehumidifiers[i].ppd;
      }
    }
    
    // Cover remainder
    if (remaining > 0) {
      recommended.push(dehumidifiers[0]); // Add smallest unit
    }
    
    return recommended;
  }
};
```

---

# DATA EXPORT & REPORTING

## PDF Dry Log Generation

```typescript
// services/exports/pdfGenerator.ts

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const pdfService = {
  async generateDryLog(jobId: string): Promise<Blob> {
    const job = await getJobData(jobId);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Header with logo and job info
    doc.setFillColor(248, 123, 77);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('Arial', 'bold');
    doc.text('DRY LOG REPORT', 15, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Job ID: ${job.jobId}`, 15, 40);
    doc.text(`Customer: ${job.customerInfo.name}`, 15, 47);
    doc.text(`Address: ${job.customerInfo.address}`, 15, 54);
    doc.text(`Claim #: ${job.insuranceInfo.claimNumber}`, 15, 61);
    
    // Rooms section
    let yPosition = 75;
    doc.setFont('Arial', 'bold');
    doc.setFontSize(14);
    doc.text('AFFECTED ROOMS & MATERIALS', 15, yPosition);
    yPosition += 15;
    
    for (const room of job.rooms) {
      doc.setFont('Arial', 'bold');
      doc.setFontSize(12);
      doc.text(`${room.roomName} (${room.squareFootage} sq ft)`, 20, yPosition);
      yPosition += 8;
      
      doc.setFont('Arial', 'normal');
      doc.setFontSize(10);
      for (const material of room.materialsAffected) {
        doc.text(
          `• ${material.materialType}: ${material.squareFootageAffected} sq ft removed`,
          25,
          yPosition
        );
        yPosition += 6;
      }
      yPosition += 3;
    }
    
    // Equipment section
    yPosition += 10;
    doc.setFont('Arial', 'bold');
    doc.setFontSize(14);
    doc.text('EQUIPMENT DEPLOYED', 15, yPosition);
    yPosition += 15;
    
    for (const chamber of job.equipment.chambers) {
      doc.setFont('Arial', 'bold');
      doc.setFontSize(11);
      doc.text(`Chamber: ${chamber.chamberName}`, 20, yPosition);
      yPosition += 8;
      
      doc.setFont('Arial', 'normal');
      doc.setFontSize(10);
      doc.text(`• Dehumidifiers: ${chamber.dehumidifiers.length}`, 25, yPosition);
      yPosition += 5;
      doc.text(`• Air Movers: ${chamber.airMovers.length}`, 25, yPosition);
      yPosition += 5;
      doc.text(`• Air Scrubbers: ${chamber.airScrubbers.length}`, 25, yPosition);
      yPosition += 8;
    }
    
    // Convert to blob
    return doc.output('blob');
  },
  
  async downloadPDF(jobId: string) {
    const blob = await this.generateDryLog(jobId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dry_Log_${jobId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }
};
```

## CSV Export

```typescript
// services/exports/csvExporter.ts

export const csvService = {
  generateJobsCSV(jobs: any[]): string {
    const headers = [
      'Job ID',
      'Customer Name',
      'Address',
      'Status',
      'Claim Number',
      'Total Area (sq ft)',
      'Install Date',
      'Completion Date',
      'Assigned Tech'
    ];
    
    const rows = jobs.map(job => [
      job.jobId,
      job.customerInfo.name,
      job.customerInfo.address,
      job.jobStatus,
      job.insuranceInfo.claimNumber,
      job.equipment.calculations.totalAffectedSquareFootage,
      new Date(job.workflowPhases.install.startedAt).toLocaleDateString(),
      job.workflowPhases.pull?.completedAt
        ? new Date(job.workflowPhases.pull.completedAt).toLocaleDateString()
        : 'N/A',
      job.scheduledTechnician
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  },
  
  downloadCSV(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
```

---

# TESTING STRATEGY

## Unit Tests

```typescript
// __tests__/services/equipment/calculations.test.ts

import { equipmentCalculations } from '@/services/equipment/calculations';

describe('Equipment Calculations', () => {
  describe('calculateDehumidifierNeeds', () => {
    it('should calculate PPD for Category 1 water', () => {
      const result = equipmentCalculations.calculateDehumidifierNeeds({
        squareFootage: 1000,
        waterCategory: 'Category 1',
        ceilingHeight: 8,
        roomVolume: 8000
      });
      
      // 8000 cubic feet / 100 = 80 PPD * 1 multiplier = 80
      expect(result).toBe(80);
    });
    
    it('should calculate PPD for Category 3 water with higher multiplier', () => {
      const result = equipmentCalculations.calculateDehumidifierNeeds({
        squareFootage: 1000,
        waterCategory: 'Category 3',
        ceilingHeight: 8,
        roomVolume: 8000
      });
      
      // 8000 / 100 = 80 * 1.5 = 120
      expect(result).toBe(120);
    });
  });
  
  describe('estimateDryingTime', () => {
    it('should return 3-5 days for Category 1', () => {
      const result = equipmentCalculations.estimateDryingTime('Category 1');
      expect(result).toEqual({ min: 3, max: 5 });
    });
  });
});
```

## Integration Tests

```typescript
// __tests__/integration/jobWorkflow.test.ts

describe('Job Workflow Integration', () => {
  it('should complete full install → pull workflow', async () => {
    // Create job
    let job = await jobService.createJob({
      customerInfo: { /* ... */ },
      insuranceInfo: { /* ... */ }
    });
    
    // Add rooms
    await roomService.addRoom(job.jobId, { roomName: 'Master Bedroom' });
    
    // Start install
    await jobService.updateJobStatus(job.jobId, 'Install');
    
    // Add readings
    await readingService.addReading(job.jobId, { /* ... */ });
    
    // Complete phases
    job = await jobService.moveToNextPhase(job.jobId); // Demo
    job = await jobService.moveToNextPhase(job.jobId); // Check Service
    job = await jobService.moveToNextPhase(job.jobId); // Pull
    
    expect(job.jobStatus).toBe('Complete');
  });
});
```

## E2E Tests (Cypress)

```typescript
// cypress/e2e/mit-tech-workflow.cy.ts

describe('MIT Tech App - Complete Workflow', () => {
  beforeEach(() => {
    cy.login('marcus.johnson@entrusted.com', 'Demo@12345');
  });
  
  it('should complete install day workflow', () => {
    // Dashboard - select job
    cy.contains('INSTALL').click();
    cy.contains('Johnson Family').click();
    
    // Office step
    cy.get('[data-test="review-jobs"]').click();
    cy.get('[data-test="next-step"]').click();
    
    // Add room
    cy.get('[data-test="add-room"]').click();
    cy.get('input[name="roomName"]').type('Master Bedroom');
    cy.get('input[name="length"]').type('15');
    cy.get('input[name="width"]').type('12');
    cy.get('input[name="height"]').type('8');
    cy.get('[data-test="save-room"]').click();
    
    // Take photos
    cy.get('[data-test="take-photo"]').click();
    cy.get('button:contains("Allow")').click(); // Camera permission
    
    // Continue through workflow steps
    cy.get('[data-test="next-step"]').click();
    // ... more steps
  });
});
```

---

# DEPLOYMENT & SETUP

## Firebase Setup Checklist

```
Project Configuration:
☐ Create Firebase project in console
☐ Enable Firestore Database
☐ Enable Cloud Storage
☐ Enable Firebase Authentication (Email/Password)
☐ Enable Realtime Database (for sync coordination)
☐ Set security rules (copy from schema section above)
☐ Create service account for seed data script
☐ Set up Stripe webhook in Firebase Functions
☐ Configure CORS for Cloud Storage

Hosting:
☐ Enable Firebase Hosting
☐ Configure domain/custom URL
☐ Set up SSL certificate
```

## React PWA Setup Checklist

```
Web App Configuration:
☐ Generate app icons (192px, 512px)
☐ Create manifest.json with app metadata
☐ Register service worker in index.tsx
☐ Configure webpack for PWA (create-react-app handles this)
☐ Test add-to-home-screen on iOS/Android
☐ Configure offline page
☐ Set up workbox caching strategies

Environment Variables (.env):
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_STRIPE_PUBLIC_KEY=...
REACT_APP_API_BASE_URL=...
```

## Deployment Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Run tests
npm test -- --coverage

# Deploy to Firebase
firebase deploy --only hosting

# View logs
firebase functions:log
```

---

# CONCLUSION & NEXT STEPS

This development plan provides a comprehensive roadmap for building the MIT Dry Logs App. The modular architecture allows for parallel development across components, and the detailed specifications ensure consistency with Entrusted's brand and business requirements.

**Key Success Factors:**
1. **Real-time collaboration** - Use Firestore listeners for multi-user scenarios
2. **Offline-first mentality** - Test every feature without network
3. **Validation & error handling** - Catch issues early for data quality
4. **User feedback loops** - Regular testing with MIT techs and leads
5. **Performance monitoring** - Track app performance and user behavior

**For Developer Implementation:**
- Start with Sprint 1 foundation
- Build components in isolated branches
- Integrate frequently into development branch
- Test offline scenarios extensively
- Gather user feedback after each major feature

---

**END OF DEVELOPMENT PLAN**

For additional details, data examples, or code snippets for specific features, please request clarification.
