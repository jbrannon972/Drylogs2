import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../../hooks/useJobs';
import { useAuth } from '../../../hooks/useAuth';
import { Job, PSMPhaseStatus } from '../../../types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  LogOut,
  Printer,
  Search,
} from 'lucide-react';

interface FilterOptions {
  status: PSMPhaseStatus | 'all';
  zone: string;
  searchText: string;
  severity: 'all' | 'critical' | 'high';
}

export const PSMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { allJobs: jobs, isLoading } = useJobs();

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    zone: 'all',
    searchText: '',
    severity: 'all',
  });

  // PSM sees ALL jobs - they are the bridge to insurance
  // No filtering - PSM needs visibility into every job regardless of phase
  const psmJobs = jobs;

  // Apply filters
  const filteredJobs = psmJobs.filter(job => {
    if (filters.status !== 'all' && job.psmData?.psmPhase.status !== filters.status) {
      return false;
    }
    if (filters.zone !== 'all' && job.scheduledZone !== filters.zone) {
      return false;
    }
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      return (
        job.jobId.toLowerCase().includes(searchLower) ||
        job.customerInfo.name.toLowerCase().includes(searchLower) ||
        job.customerInfo.address.toLowerCase().includes(searchLower)
      );
    }
    if (filters.severity !== 'all') {
      const hasCriticalFlags = job.psmData?.redFlags.some(
        flag => !flag.resolved && flag.severity === filters.severity
      );
      if (!hasCriticalFlags) return false;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: psmJobs.length,
    critical: psmJobs.filter(j =>
      j.psmData?.redFlags.some(f => !f.resolved && f.severity === 'critical')
    ).length,
    pending: psmJobs.filter(j =>
      j.psmData?.psmPhase.status === 'reviewing' ||
      j.psmData?.psmPhase.status === 'field-complete'
    ).length,
    awaitingAdjuster: psmJobs.filter(j =>
      j.psmData?.psmPhase.status === 'awaiting-adjuster'
    ).length,
  };

  const getSeverityColor = (job: Job): string => {
    const criticalFlags = job.psmData?.redFlags.filter(
      f => !f.resolved && f.severity === 'critical'
    );
    const highFlags = job.psmData?.redFlags.filter(
      f => !f.resolved && f.severity === 'high'
    );

    if (criticalFlags && criticalFlags.length > 0) return 'border-l-4 border-l-red-500';
    if (highFlags && highFlags.length > 0) return 'border-l-4 border-l-orange-500';
    return 'border-l-4 border-l-gray-200';
  };

  const generateReport = (job: Job, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to job detail

    // Generate comprehensive IICRC dry log report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dry Log Report - ${job.jobId}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
            .page-break { page-break-after: always; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
            font-size: 11pt;
          }
          .header {
            border-bottom: 4px solid #ea580c;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ea580c;
            letter-spacing: 1px;
          }
          .report-title {
            font-size: 22px;
            font-weight: 600;
            margin-top: 8px;
            color: #1f2937;
          }
          .section {
            margin-bottom: 25px;
            break-inside: avoid;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #fff;
            background: #374151;
            padding: 8px 12px;
            margin-bottom: 12px;
            border-left: 5px solid #ea580c;
          }
          .subsection-title {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin: 15px 0 8px 0;
            padding-bottom: 4px;
            border-bottom: 1px solid #d1d5db;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 6px;
            line-height: 1.5;
          }
          .label {
            font-weight: 600;
            color: #4b5563;
          }
          .value {
            color: #1f2937;
          }
          .room-box {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            background: #f9fafb;
          }
          .room-header {
            font-size: 15px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid #ea580c;
          }
          .moisture-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10pt;
          }
          .moisture-table th {
            background: #374151;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: 600;
          }
          .moisture-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .moisture-table tr:nth-child(even) {
            background: #f3f4f6;
          }
          .dry-standard {
            background: #dcfce7 !important;
            font-weight: 600;
          }
          .material-list {
            list-style: none;
            padding: 0;
            margin: 8px 0;
          }
          .material-item {
            padding: 8px;
            margin: 4px 0;
            background: white;
            border-left: 3px solid #ea580c;
            border-radius: 4px;
          }
          .removed {
            background: #fee2e2 !important;
            border-left-color: #dc2626 !important;
          }
          .equipment-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 8px;
            border-radius: 4px;
            margin: 2px;
            font-size: 10pt;
          }
          .water-class {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: 600;
            margin: 4px;
          }
          .class-1 { background: #dbeafe; color: #1e40af; }
          .class-2 { background: #fef3c7; color: #92400e; }
          .class-3 { background: #fed7aa; color: #9a3412; }
          .class-4 { background: #fee2e2; color: #991b1b; }
          .category-1 { background: #dcfce7; color: #166534; }
          .category-2 { background: #fef3c7; color: #854d0e; }
          .category-3 { background: #fee2e2; color: #991b1b; }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #ea580c;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .print-button:hover {
            background: #c2410c;
          }
          .highlight-box {
            background: #fffbeb;
            border: 2px solid #fbbf24;
            border-radius: 6px;
            padding: 12px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Print Dry Log</button>

        <div class="header">
          <div class="logo">ENTRUSTED RESTORATION</div>
          <div class="report-title">WATER DAMAGE RESTORATION DRY LOG</div>
          <div style="color: #6b7280; margin-top: 8px; font-size: 11pt;">
            IICRC S500 Compliant Documentation<br>
            Report Generated: ${new Date().toLocaleString()}
          </div>
        </div>

        <!-- Job & Property Information -->
        <div class="section">
          <div class="section-title">JOB & PROPERTY INFORMATION</div>
          <div class="info-grid">
            <div class="label">Job Number:</div>
            <div class="value"><strong>${job.jobId}</strong></div>
            <div class="label">Customer Name:</div>
            <div class="value">${job.customerInfo.name}</div>
            <div class="label">Property Address:</div>
            <div class="value">${job.customerInfo.address}, ${job.customerInfo.city}, ${job.customerInfo.state} ${job.customerInfo.zipCode}</div>
            <div class="label">Contact Phone:</div>
            <div class="value">${job.customerInfo.phoneNumber}</div>
            <div class="label">Insurance Carrier:</div>
            <div class="value">${job.insuranceInfo.carrierName}</div>
            <div class="label">Claim Number:</div>
            <div class="value">${job.insuranceInfo.claimNumber}</div>
            <div class="label">Adjuster:</div>
            <div class="value">${job.insuranceInfo.adjusterName} (${job.insuranceInfo.adjusterPhone})</div>
          </div>
        </div>

        <!-- Cause of Loss & Classification -->
        <div class="section">
          <div class="section-title">CAUSE OF LOSS & WATER DAMAGE CLASSIFICATION</div>
          <div class="highlight-box">
            <div class="info-grid">
              <div class="label">Loss Type:</div>
              <div class="value"><strong>${job.causeOfLoss.type}</strong></div>
              <div class="label">Loss Location:</div>
              <div class="value">${job.causeOfLoss.location}</div>
              <div class="label">Date Discovered:</div>
              <div class="value">${job.causeOfLoss.discoveryDate ? new Date(job.causeOfLoss.discoveryDate.seconds * 1000).toLocaleString() : 'N/A'}</div>
              <div class="label">Date of Event:</div>
              <div class="value">${job.causeOfLoss.eventDate ? new Date(job.causeOfLoss.eventDate.seconds * 1000).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
          <div style="margin-top: 10px;">
            <strong>Description:</strong><br>
            ${job.causeOfLoss.description}
          </div>
          <div style="margin-top: 15px;">
            <strong>IICRC Water Damage Classification:</strong><br>
            <span class="water-class category-${job.insuranceInfo.categoryOfWater?.includes('1') ? '1' : job.insuranceInfo.categoryOfWater?.includes('2') ? '2' : '3'}">
              ${job.insuranceInfo.categoryOfWater || 'Category 2'}
            </span>
            <span class="water-class class-${job.equipment?.calculations?.waterClass?.includes('1') ? '1' : job.equipment?.calculations?.waterClass?.includes('2') ? '2' : job.equipment?.calculations?.waterClass?.includes('3') ? '3' : '2'}">
              ${job.equipment?.calculations?.waterClass || 'Class 2'}
            </span>
          </div>
        </div>

        <!-- Equipment Deployment -->
        <div class="section">
          <div class="section-title">EQUIPMENT DEPLOYMENT & DRYING PLAN</div>
          <div class="info-grid">
            <div class="label">Drying Method:</div>
            <div class="value">${job.equipment?.calculations?.calculationMethod || 'IICRC S500'}</div>
            <div class="label">Affected Sq. Ft.:</div>
            <div class="value">${job.equipment?.calculations?.totalAffectedSquareFootage || 0} sq ft</div>
            <div class="label">Cubic Footage:</div>
            <div class="value">${job.equipment?.calculations?.totalCubicFootage || 0} cu ft</div>
            <div class="label">Estimated Drying Time:</div>
            <div class="value">${job.equipment?.calculations?.estimatedDryingDays || 3} days</div>
          </div>
          <div style="margin-top: 12px;">
            <strong>Equipment Deployed:</strong><br>
            <div style="margin-top: 6px;">
              ${job.equipment?.calculations?.recommendedDehumidifierCount ?
                `<span class="equipment-badge">${job.equipment.calculations.recommendedDehumidifierCount} Dehumidifier(s)</span>` : ''}
              ${job.equipment?.calculations?.recommendedAirMoverCount ?
                `<span class="equipment-badge">${job.equipment.calculations.recommendedAirMoverCount} Air Mover(s)</span>` : ''}
              ${job.equipment?.calculations?.recommendedAirScrubberCount ?
                `<span class="equipment-badge">${job.equipment.calculations.recommendedAirScrubberCount} Air Scrubber(s)</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Room-by-Room Dry Log -->
        <div class="section page-break">
          <div class="section-title">ROOM-BY-ROOM DRY LOG & MOISTURE DOCUMENTATION</div>
          ${job.rooms && job.rooms.length > 0 ? job.rooms.map(room => `
            <div class="room-box">
              <div class="room-header">${room.roomName} (${room.roomType})</div>

              <div class="subsection-title">Room Dimensions & Affected Areas</div>
              <div class="info-grid" style="margin-bottom: 10px;">
                <div class="label">Dimensions:</div>
                <div class="value">${room.dimensions?.length || 0}' L × ${room.dimensions?.width || 0}' W × ${room.dimensions?.height || 0}' H</div>
                <div class="label">Square Footage:</div>
                <div class="value">${room.dimensions?.squareFootage || 0} sq ft</div>
                <div class="label">Status:</div>
                <div class="value"><strong>${room.affectedStatus?.toUpperCase() || 'AFFECTED'}</strong></div>
                ${room.waterDamageClassification ? `
                  <div class="label">Water Class/Category:</div>
                  <div class="value">Category ${room.waterDamageClassification.category}, Class ${room.waterDamageClassification.class}</div>
                ` : ''}
              </div>

              ${room.affectedAreas ? `
                <div class="subsection-title">Affected Materials Breakdown</div>
                ${room.affectedAreas.floor ? `
                  <div style="margin: 8px 0;">
                    <strong>Floor:</strong> ${room.affectedAreas.floor.affectedSqFt} sq ft affected (${room.affectedAreas.floor.percentAffected}%)<br>
                    ${room.affectedAreas.floor.materials?.map(m =>
                      `&nbsp;&nbsp;• ${m.type}: ${m.sqFt} sq ft`
                    ).join('<br>') || ''}
                  </div>
                ` : ''}
                ${room.affectedAreas.walls ? `
                  <div style="margin: 8px 0;">
                    <strong>Walls:</strong> ${room.affectedAreas.walls.affectedSqFt} sq ft affected (${room.affectedAreas.walls.percentAffected}%)<br>
                    <em>Water line height: ${room.affectedAreas.walls.wetHeightAvg} feet</em><br>
                    ${room.affectedAreas.walls.materials?.map(m =>
                      `&nbsp;&nbsp;• ${m.type}: ${m.sqFt} sq ft`
                    ).join('<br>') || ''}
                  </div>
                ` : ''}
                ${room.affectedAreas.ceiling ? `
                  <div style="margin: 8px 0;">
                    <strong>Ceiling:</strong> ${room.affectedAreas.ceiling.affectedSqFt} sq ft affected (${room.affectedAreas.ceiling.percentAffected}%)<br>
                    ${room.affectedAreas.ceiling.materials?.map(m =>
                      `&nbsp;&nbsp;• ${m.type}: ${m.sqFt} sq ft`
                    ).join('<br>') || ''}
                  </div>
                ` : ''}
              ` : ''}

              ${room.materialsAffected && room.materialsAffected.length > 0 ? `
                <div class="subsection-title">Materials Removed & Reason</div>
                <ul class="material-list">
                  ${room.materialsAffected.map(mat => `
                    <li class="material-item ${mat.removalDate ? 'removed' : ''}">
                      <strong>${mat.materialType}</strong> - ${mat.condition}<br>
                      <em>${mat.squareFootageAffected} sq ft</em>
                      ${mat.removalDate ? `<br>✗ REMOVED: ${new Date(mat.removalDate.seconds * 1000).toLocaleDateString()}` : ''}
                      ${mat.exposedMaterials && mat.exposedMaterials.length > 0 ?
                        `<br>Exposed: ${mat.exposedMaterials.map(e => e.materialType).join(', ')}` : ''}
                    </li>
                  `).join('')}
                </ul>
              ` : '<em>No materials removed from this room</em>'}

              ${room.moistureReadings && room.moistureReadings.length > 0 ? `
                <div class="subsection-title">Moisture Readings Log</div>
                <table class="moisture-table">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Location</th>
                      <th>Material</th>
                      <th>Moisture %</th>
                      <th>Temp °F</th>
                      <th>RH %</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${room.moistureReadings.sort((a, b) => a.recordedAt.seconds - b.recordedAt.seconds).map(reading => `
                      <tr class="${reading.isDryStandard ? 'dry-standard' : ''}">
                        <td>${new Date(reading.recordedAt.seconds * 1000).toLocaleString()}</td>
                        <td>${reading.location}</td>
                        <td>${reading.material}</td>
                        <td><strong>${reading.moisturePercentage}%</strong></td>
                        <td>${reading.temperature}°</td>
                        <td>${reading.humidity}%</td>
                        <td>${reading.isDryStandard ? '🌟 DRY STANDARD' : reading.readingType}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div style="margin-top: 6px; font-size: 10pt; color: #6b7280;">
                  <strong>Note:</strong> Dry standard readings (highlighted) are baseline moisture levels from unaffected areas.
                  Per IICRC S500, materials within 3-4% of dry standard are considered dry.
                </div>
              ` : '<em>No moisture readings recorded for this room</em>'}
            </div>
          `).join('') : `
            <div class="highlight-box">
              <strong>Note:</strong> This job does not have detailed room-by-room documentation yet.
              Room data will be populated as technicians complete install, check service, and demo workflows.
              <br><br>
              <em>Expected data includes: room dimensions, affected materials, moisture readings, and removal documentation.</em>
            </div>
          `}
        </div>

        <!-- Workflow & Mitigation Timeline -->
        <div class="section">
          <div class="section-title">MITIGATION WORKFLOW TIMELINE</div>
          <div class="info-grid">
            <div class="label">Install Phase:</div>
            <div class="value"><strong>${job.workflowPhases.install.status.toUpperCase()}</strong>
              ${job.workflowPhases.install.completedAt ?
                ` - Completed ${new Date(job.workflowPhases.install.completedAt.seconds * 1000).toLocaleDateString()}` : ''}
            </div>
            <div class="label">Demo Phase:</div>
            <div class="value"><strong>${job.workflowPhases.demo.status.toUpperCase()}</strong>
              ${job.workflowPhases.demo.completedAt ?
                ` - Completed ${new Date(job.workflowPhases.demo.completedAt.seconds * 1000).toLocaleDateString()}` : ''}
            </div>
            <div class="label">Check Service:</div>
            <div class="value"><strong>${job.workflowPhases.checkService.status.toUpperCase()}</strong>
              (${job.workflowPhases.checkService.visits?.length || 0} visits completed)
            </div>
            <div class="label">Pull Phase:</div>
            <div class="value"><strong>${job.workflowPhases.pull.status.toUpperCase()}</strong>
              ${job.workflowPhases.pull.completedAt ?
                ` - Completed ${new Date(job.workflowPhases.pull.completedAt.seconds * 1000).toLocaleDateString()}` : ''}
            </div>
          </div>
        </div>

        <!-- PSM & Insurance Documentation -->
        ${job.psmData ? `
        <div class="section">
          <div class="section-title">PSM REVIEW & INSURANCE APPROVAL STATUS</div>
          <div class="info-grid">
            <div class="label">PSM Assigned:</div>
            <div class="value">${job.psmData.psmPhase.assignedPSM}</div>
            <div class="label">Review Status:</div>
            <div class="value"><strong>${job.psmData.psmPhase.status.replace(/-/g, ' ').toUpperCase()}</strong></div>
            <div class="label">Days in Review:</div>
            <div class="value">${job.psmData.psmPhase.daysInPhase} days</div>
            <div class="label">Demo Scope:</div>
            <div class="value">${job.psmData.approvalStatus.demoScope.toUpperCase()}</div>
            <div class="label">Demo Amount:</div>
            <div class="value">Requested: $${job.psmData.approvalStatus.demoAmount.requested.toLocaleString()} |
              Approved: $${job.psmData.approvalStatus.demoAmount.approved.toLocaleString()}</div>
            <div class="label">Equipment Plan:</div>
            <div class="value">${job.psmData.approvalStatus.equipmentPlan.toUpperCase()}</div>
            <div class="label">Documentation Ready:</div>
            <div class="value">${job.psmData.documentationReview?.readyForSubmission ? '✓ YES' : '✗ NO'}</div>
          </div>
          ${job.psmData.redFlags && job.psmData.redFlags.length > 0 ? `
            <div class="subsection-title" style="margin-top: 15px;">Red Flags & Issues</div>
            ${job.psmData.redFlags.map(flag => `
              <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 10px; margin: 6px 0; border-radius: 4px;">
                <strong>${flag.type.toUpperCase()} - ${flag.severity.toUpperCase()}</strong><br>
                ${flag.description}<br>
                <em>Status: ${flag.resolved ? '✓ RESOLVED' : '⚠ UNRESOLVED'}</em>
              </div>
            `).join('')}
          ` : ''}
        </div>
        ` : ''}

        <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          This report was generated by Entrusted Restoration PSM Dashboard<br>
          For internal and insurance company use only
        </div>
      </body>
      </html>
    `;

    // Open report in new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-poppins font-bold text-gray-900">
                PSM Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Project Support Management - ultrabridge
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">{user?.displayName}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Total Jobs</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">Critical Flags</span>
              </div>
              <p className="text-2xl font-bold text-red-700 mt-2">{stats.critical}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-700">Pending Review</span>
              </div>
              <p className="text-2xl font-bold text-orange-700 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">With Adjuster</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-2">{stats.awaitingAdjuster}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by ID, customer, or address..."
                value={filters.searchText}
                onChange={e => setFilters({ ...filters, searchText: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
              />
            </div>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value as PSMPhaseStatus | 'all' })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="all">All Status</option>
              <option value="field-complete">Field Complete</option>
              <option value="reviewing">Reviewing</option>
              <option value="awaiting-adjuster">Awaiting Adjuster</option>
              <option value="approved">Approved</option>
              <option value="invoiced">Invoiced</option>
            </select>
            <select
              value={filters.zone}
              onChange={e => setFilters({ ...filters, zone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="all">All Zones</option>
              <option value="Zone 1">Zone 1</option>
              <option value="Zone 2">Zone 2</option>
              <option value="Zone 3">Zone 3</option>
              <option value="2nd Shift">2nd Shift</option>
            </select>
            <select
              value={filters.severity}
              onChange={e => setFilters({ ...filters, severity: e.target.value as 'all' | 'critical' | 'high' })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical Only</option>
              <option value="high">High+ Only</option>
            </select>
          </div>
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No jobs match your filters</p>
            </div>
          ) : (
            filteredJobs.map(job => {
              const psmData = job.psmData;
              const unresolvedFlags = psmData?.redFlags.filter(f => !f.resolved) || [];
              const missingItems = psmData?.documentationReview.missingItems || [];

              return (
                <div
                  key={job.jobId}
                  className={`bg-white rounded-lg border ${getSeverityColor(job)} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => navigate(`/psm/job/${job.jobId}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{job.jobId}
                          </h3>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {job.scheduledZone}
                          </span>
                          {psmData?.psmPhase.status && (
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              psmData.psmPhase.status === 'field-complete' ? 'bg-yellow-100 text-yellow-700' :
                              psmData.psmPhase.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                              psmData.psmPhase.status === 'awaiting-adjuster' ? 'bg-orange-100 text-orange-700' :
                              psmData.psmPhase.status === 'approved' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {psmData.psmPhase.status.replace(/-/g, ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium">{job.customerInfo.name}</p>
                        <p className="text-gray-600 text-sm">{job.customerInfo.address}</p>

                        {/* Flags and Missing Items */}
                        <div className="flex items-center gap-4 mt-3">
                          {unresolvedFlags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className={`w-4 h-4 ${
                                unresolvedFlags.some(f => f.severity === 'critical') ? 'text-red-500' : 'text-orange-500'
                              }`} />
                              <span className="text-sm text-gray-700">
                                {unresolvedFlags.length} flag{unresolvedFlags.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {missingItems.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm text-gray-700">
                                Missing: {missingItems.join(', ')}
                              </span>
                            </div>
                          )}
                          {unresolvedFlags.length === 0 && missingItems.length === 0 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-700">All documentation complete</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <button
                          onClick={(e) => generateReport(job, e)}
                          className="flex items-center gap-2 px-3 py-2 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                          title="Generate printable report for insurance"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print Report</span>
                        </button>
                        <p className="text-sm text-gray-600">
                          {psmData?.psmPhase.daysInPhase || 0} day{psmData?.psmPhase.daysInPhase !== 1 ? 's' : ''} in phase
                        </p>
                        {psmData?.psmPhase.assignedPSM && (
                          <p className="text-sm text-gray-900 font-medium">
                            Assigned: {psmData.psmPhase.assignedPSM}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
