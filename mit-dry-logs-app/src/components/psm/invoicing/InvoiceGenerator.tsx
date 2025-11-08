import React, { useState, useEffect } from 'react';
import { Job, InvoiceLineItem, ApprovalStatus } from '../../../types';
import { FileText, Download, Mail, CheckCircle, XCircle, Clock, Plus, X } from 'lucide-react';

interface InvoiceGeneratorProps {
  job: Job;
  onSave: (invoice: any) => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ job, onSave }) => {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => {
    // Auto-generate line items from job data
    const generatedItems = generateLineItemsFromJob(job);
    setLineItems(generatedItems);
  }, [job]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.0625; // 6.25%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const amountDue = total - job.insuranceInfo.deductible;

  const approvedTotal = lineItems
    .filter(item => item.approvalStatus === 'approved')
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const pendingTotal = lineItems
    .filter(item => item.approvalStatus === 'pending')
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const deniedTotal = lineItems
    .filter(item => item.approvalStatus === 'denied')
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSave = () => {
    const invoice = {
      generated: true,
      generatedAt: new Date() as any,
      generatedBy: 'Current User',
      invoiceNumber: `INV-${job.jobId}-${Date.now()}`,
      lineItems,
      subtotal,
      tax,
      total,
      amountDue,
      status: 'draft' as const,
    };
    onSave(invoice);
  };

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-poppins font-bold text-gray-900">Invoice Generator</h2>
          <p className="text-gray-600 mt-1">Job #{job.jobId}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email to Adjuster
          </button>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Bill To</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-gray-900">{job.customerInfo.name}</p>
            <p className="text-gray-700">{job.customerInfo.address}</p>
            <p className="text-gray-700">
              {job.customerInfo.city}, {job.customerInfo.state} {job.customerInfo.zipCode}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Insurance</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-gray-900">{job.insuranceInfo.carrierName}</p>
            <p className="text-gray-700">Claim #: {job.insuranceInfo.claimNumber}</p>
            <p className="text-gray-700">Policy #: {job.insuranceInfo.policyNumber}</p>
            <p className="text-gray-700">Adjuster: {job.insuranceInfo.adjusterName}</p>
          </div>
        </div>
      </div>

      {/* Approval Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Approved</span>
          </div>
          <p className="text-2xl font-bold text-green-700">${approvedTotal.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">${pendingTotal.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">Denied</span>
          </div>
          <p className="text-2xl font-bold text-red-700">${deniedTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Line Items</h3>
          <button
            onClick={() => setShowAddItem(true)}
            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lineItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    ${item.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">{getStatusIcon(item.approvalStatus)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="max-w-sm ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tax (6.25%):</span>
              <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-gray-700">Deductible:</span>
              <span className="font-medium text-red-700">
                -${job.insuranceInfo.deductible.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-entrusted-orange border-t pt-2">
              <span>Amount Due:</span>
              <span>${amountDue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Save Invoice
        </button>
      </div>
    </div>
  );
};

// Helper function to generate line items from job data
function generateLineItemsFromJob(job: Job): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [];

  // Add demo work
  if (
    job.workflowPhases.demo.status === 'completed' ||
    job.workflowPhases.install.partialDemoPerformed
  ) {
    // Simplified - in real app, would parse from additionalWork
    items.push({
      description: 'Drywall Removal',
      quantity: 340,
      unitPrice: 2.5,
      totalPrice: 850,
      approvalStatus: job.psmData?.approvalStatus.demoScope || 'pending',
    });
  }

  // Add equipment
  const daysOnSite = Math.max(
    1,
    job.workflowPhases.checkService.visits.length || 1
  );

  const dehuCount = job.equipment.chambers.reduce(
    (sum, ch) => sum + ch.dehumidifiers.length,
    0
  );
  if (dehuCount > 0) {
    items.push({
      description: `Dehumidifier Rental (${daysOnSite} days)`,
      quantity: dehuCount,
      unitPrice: 45,
      totalPrice: dehuCount * 45 * daysOnSite,
      approvalStatus: job.psmData?.approvalStatus.equipmentPlan || 'pending',
    });
  }

  const moverCount = job.equipment.chambers.reduce(
    (sum, ch) => sum + ch.airMovers.length,
    0
  );
  if (moverCount > 0) {
    items.push({
      description: `Air Mover Rental (${daysOnSite} days)`,
      quantity: moverCount,
      unitPrice: 15,
      totalPrice: moverCount * 15 * daysOnSite,
      approvalStatus: job.psmData?.approvalStatus.equipmentPlan || 'pending',
    });
  }

  // Add labor
  items.push({
    description: 'Labor - Installation',
    quantity: 8,
    unitPrice: 75,
    totalPrice: 600,
    approvalStatus: 'approved',
  });

  return items;
}
