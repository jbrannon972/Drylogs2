import React, { useState } from 'react';
import { DollarSign, CreditCard, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface PaymentCollectionStepProps {
  job: any;
  onNext: () => void;
}

export const PaymentCollectionStep: React.FC<PaymentCollectionStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();

  const isCashJob = job.billingInfo?.paymentType === 'cash' || job.billingInfo?.paymentType === 'direct';
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'check' | 'cash' | ''>('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (isCashJob && paymentCollected) {
      updateWorkflowData('pull', {
        payment: {
          collected: true,
          method: paymentMethod,
          amount: parseFloat(paymentAmount) || 0,
          transactionId,
          checkNumber,
          notes,
          timestamp: new Date().toISOString(),
        },
      });
    } else if (!isCashJob) {
      updateWorkflowData('pull', {
        payment: {
          collected: false,
          insuranceClaim: true,
          notes: 'Insurance direct billing - no payment collected from customer',
        },
      });
    }
  }, [isCashJob, paymentCollected, paymentMethod, paymentAmount, transactionId, checkNumber, notes]);

  if (!isCashJob) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Insurance Billing</h4>
              <p className="text-sm text-blue-800">
                This is an insurance job. Payment will be collected directly from the insurance company. No customer payment required.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2">Billing Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <label className="text-xs text-gray-600">Insurance Company</label>
              <p className="font-medium">{job.insuranceInfo?.insuranceCarrier || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600">Claim Number</label>
              <p className="font-medium">{job.insuranceInfo?.claimNumber || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">
            ✓ No payment collection needed - proceed to next step
          </p>
        </div>
      </div>
    );
  }

  const isComplete = paymentCollected && paymentMethod && paymentAmount;

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-900 mb-1">Payment Collection Required</h4>
            <p className="text-sm text-orange-800">
              This is a cash/direct payment job. Collect payment before leaving the job site. Use Stripe terminal for credit card payments.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={paymentCollected}
            onChange={(e) => setPaymentCollected(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-gray-900">
            Payment has been collected from customer *
          </span>
        </label>
      </div>

      {paymentCollected && (
        <>
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('credit-card')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'credit-card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-sm font-medium">Credit Card</p>
              </button>
              <button
                onClick={() => setPaymentMethod('check')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'check'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-sm font-medium">Check</p>
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-sm font-medium">Cash</p>
              </button>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the exact amount collected from customer
            </p>
          </div>

          {/* Credit Card Details */}
          {paymentMethod === 'credit-card' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID *
              </label>
              <Input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="From Stripe terminal"
              />
              <p className="text-xs text-gray-500 mt-1">
                Transaction ID from Stripe payment terminal
              </p>
            </div>
          )}

          {/* Check Details */}
          {paymentMethod === 'check' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check Number *
              </label>
              <Input
                type="text"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                placeholder="Check #"
              />
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Important:</span> Take a photo of the check front and back before leaving the job site.
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Any notes about the payment..."
            />
          </div>

          {/* Payment Summary */}
          {isComplete && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium capitalize">{paymentMethod.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-green-600">
                    ${parseFloat(paymentAmount).toFixed(2)}
                  </span>
                </div>
                {transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{transactionId}</span>
                  </div>
                )}
                {checkNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check #:</span>
                    <span className="font-medium">{checkNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Completion Status */}
      {isComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">✓ Payment Collected</h4>
              <p className="text-sm text-green-800">
                ${parseFloat(paymentAmount).toFixed(2)} collected via {paymentMethod.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>
      ) : paymentCollected && !isComplete ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Complete all payment details before proceeding.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Check the box above once payment has been collected.
          </p>
        </div>
      )}

      {/* Stripe Integration Note */}
      {paymentMethod === 'credit-card' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <span className="font-medium">Stripe Terminal:</span> In production, this would integrate directly with Stripe Terminal for contactless payment processing. Transaction details would be automatically captured.
          </p>
        </div>
      )}
    </div>
  );
};
