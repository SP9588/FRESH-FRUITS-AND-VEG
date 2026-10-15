import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  RefreshCw, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Download, 
  Printer, 
  Check, 
  X, 
  Bell, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  QrCode,
  DollarSign,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  CustomerSubscription, 
  SubscriptionPayment, 
  SubscriptionPlan, 
  FRESH_WORLD_PAYEE 
} from '../types';
import { subscriptionService, DEFAULT_SUBSCRIPTION_PLANS } from '../services/subscriptionService';
import SubscriptionCheckoutModal from './SubscriptionCheckoutModal';

interface CustomerSubscriptionManagerProps {
  user: any;
  onNavigateToPlans?: () => void;
}

export default function CustomerSubscriptionManager({
  user,
  onNavigateToPlans
}: CustomerSubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'reminders'>('subscriptions');

  // Cancellation modal state
  const [cancelModalSub, setCancelModalSub] = useState<CustomerSubscription | null>(null);
  const [cancelReason, setCancelReason] = useState('Found alternative solution');
  const [cancelConsequencesAcknowledged, setCancelConsequencesAcknowledged] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Manual renew modal state
  const [renewModalPlan, setRenewModalPlan] = useState<SubscriptionPlan | null>(null);
  const [renewModalSubId, setRenewModalSubId] = useState<string | null>(null);

  // Invoice print state
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionPayment | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await subscriptionService.ensureSeedData();
      const subs = await subscriptionService.getCustomerSubscriptions(user.uid);
      const pmts = await subscriptionService.getPayments(user.uid);
      setSubscriptions(subs);
      setPayments(pmts);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleAutoRenew = async (sub: CustomerSubscription) => {
    const nextState = !sub.autoRenewAuthorized;
    if (!nextState) {
      // Opening cancel modal instead of sudden toggle off
      setCancelModalSub(sub);
      return;
    }

    try {
      await subscriptionService.toggleAutoRenew(sub.id, true, user.email);
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, autoRenewAuthorized: true, cancellationRequested: false } : s));
      toast.success('Automatic renewal authorized.');
    } catch (err: any) {
      toast.error('Failed to update renewal preference.');
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancelModalSub) return;
    if (!cancelConsequencesAcknowledged) {
      toast.error('Please acknowledge the consequences of cancellation before proceeding.');
      return;
    }

    setIsCancelling(true);
    try {
      await subscriptionService.cancelSubscription({
        subscriptionId: cancelModalSub.id,
        reason: cancelReason,
        consequencesAcknowledged: true,
        actorEmail: user.email
      });
      toast.success('Auto-renewal cancelled. You retain full access until expiration.');
      setCancelModalSub(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error processing cancellation.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleTriggerManualRenew = (sub: CustomerSubscription) => {
    const plan = DEFAULT_SUBSCRIPTION_PLANS.find(p => p.id === sub.planId) || DEFAULT_SUBSCRIPTION_PLANS[1];
    setRenewModalPlan(plan);
    setRenewModalSubId(sub.id);
  };

  const calculateDaysRemaining = (expirationDate: string) => {
    const diff = new Date(expirationDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Header Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
            <span>Customer Account</span>
            <span aria-hidden="true">·</span>
            <span>Validity & Billing Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Subscription & Validity Management
          </h2>
          <p className="text-sm text-stone-600 mt-1.5 max-w-2xl">
            Monitor active service lifecycles, configure automatic renewal rules, download tax invoices, and manage transactional billing reminders.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 transition-colors"
            title="Refresh records"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {onNavigateToPlans && (
            <button
              onClick={onNavigateToPlans}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Browse Plans & Pricing
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 p-1.5 bg-stone-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'subscriptions' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          Active & Past Subscriptions ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'invoices' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          Payment History & Receipts ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'reminders' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          Reminder Schedules & Preferences
        </button>
      </div>

      {/* Tab 1: Subscriptions View */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {subscriptions.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
                <CreditCard size={28} />
              </div>
              <h3 className="text-xl font-black text-stone-900">No Active Subscriptions Yet</h3>
              <p className="text-sm text-stone-500">
                You haven't subscribed to any service tiers yet. Choose a 3, 6, 12-month, or Lifetime membership to unlock commercial global quotas.
              </p>
              {onNavigateToPlans && (
                <button
                  onClick={onNavigateToPlans}
                  className="px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition-all shadow-md"
                >
                  Explore Membership Plans
                </button>
              )}
            </div>
          ) : (
            subscriptions.map((sub) => {
              const daysLeft = calculateDaysRemaining(sub.expirationDate);
              const isExpired = daysLeft <= 0;
              const isGrace = sub.status === 'grace_period';
              const progressPct = Math.max(0, Math.min(100, (daysLeft / (sub.validityDays || 365)) * 100));

              return (
                <div
                  key={sub.id}
                  className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm hover:border-stone-300 transition-all"
                >
                  {/* Subscription Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {sub.serviceName}
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isExpired 
                            ? 'bg-stone-100 text-stone-600' 
                            : isGrace 
                            ? 'bg-amber-100 text-amber-800' 
                            : sub.cancellationRequested 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isExpired ? 'Expired' : isGrace ? 'Grace Period Active' : sub.cancellationRequested ? 'Cancelling at Expiry' : 'Active & Nominal'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                        {sub.planName}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center gap-3 pt-1">
                        <span>ID: <code className="font-mono text-stone-700">{sub.id}</code></span>
                        <span>·</span>
                        <span>Billing: <strong className="text-stone-800">{sub.billingInterval.replace('_', ' ').toUpperCase()}</strong></span>
                        <span>·</span>
                        <span>Amount Paid: <strong className="text-stone-800">₹{sub.pricePaid}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleTriggerManualRenew(sub)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <RefreshCw size={14} />
                        <span>Renew Subscription</span>
                      </button>
                    </div>
                  </div>

                  {/* Validity Tracker & Progress Gauge */}
                  <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                      <span className="font-bold text-stone-700 uppercase tracking-wider">
                        Product Validity Status
                      </span>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        {isExpired ? 'Validity Ended' : `${daysLeft} Days Remaining (${progressPct.toFixed(0)}% Term)`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          isExpired ? 'bg-stone-400' : daysLeft < 15 ? 'bg-amber-500' : 'bg-brand-600'
                        }`}
                        style={{ width: `${isExpired ? 0 : progressPct}%` }}
                      />
                    </div>

                    {/* Key Dates Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                      <div>
                        <span className="text-stone-400 block">Subscription Start</span>
                        <strong className="text-stone-800 font-mono">
                          {new Date(sub.startDate).toLocaleDateString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Expiration Date</span>
                        <strong className="text-brand-700 font-mono">
                          {new Date(sub.expirationDate).toLocaleDateString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Next Scheduled Billing</span>
                        <strong className="text-stone-800 font-mono">
                          {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Grace Period Deadline</span>
                        <strong className="text-amber-800 font-mono">
                          {sub.gracePeriodEndsAt ? new Date(sub.gracePeriodEndsAt).toLocaleDateString() : 'None'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Auto-Renewal & Payment Rules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                          <RefreshCw size={14} className="text-emerald-600" /> Recurring Auto-Renewal
                        </span>
                        <button
                          onClick={() => handleToggleAutoRenew(sub)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                            sub.autoRenewAuthorized 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                              : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          {sub.autoRenewAuthorized ? 'Authorized (Click to Cancel)' : 'Disabled (Click to Enable)'}
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {sub.autoRenewAuthorized 
                          ? `Your subscription will automatically charge on ${new Date(sub.nextBillingDate).toLocaleDateString()} using ${sub.paymentMethod}. Cancellation is effective immediately for future cycles.` 
                          : 'Automatic renewal is currently disabled. Your account will not be charged unless you renew manually.'}
                      </p>
                    </div>

                    <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <QrCode size={14} className="text-amber-600" /> Permitted Payment Method
                      </span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-600">Active Provider:</span>
                        <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                          {sub.paymentMethod} ({sub.paymentMethod === 'UPI' ? FRESH_WORLD_PAYEE.upiId : 'Razorpay Gateway'})
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        Supports UPI QR Code (<strong className="font-mono text-stone-700">9279120271@ybl</strong>) and Razorpay e-mandate.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Invoices & Receipts */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900">Commercial Tax Invoices & Payment Ledger</h3>
              <p className="text-xs text-stone-500 mt-0.5">Compliant receipts containing GST breakdown, UTR numbers, and developer payee references.</p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-sm">
              No payment transactions logged on this account yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Plan Description</th>
                    <th className="py-3.5 px-6">Method & Ref</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Total Amount</th>
                    <th className="py-3.5 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-stone-900">{p.invoiceNumber}</td>
                      <td className="py-4 px-6 text-stone-600 font-mono">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-medium text-stone-800">
                        {p.planName} {p.isRenewal ? '(Renewal)' : '(Initial Access)'}
                      </td>
                      <td className="py-4 px-6 text-stone-600">
                        <span className="font-bold text-stone-800">{p.paymentProvider}</span>
                        {p.utrNumber && <span className="block font-mono text-[11px] text-stone-400">UTR: {p.utrNumber}</span>}
                        {p.razorpayPaymentId && <span className="block font-mono text-[11px] text-stone-400">ID: {p.razorpayPaymentId}</span>}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          p.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black font-mono text-stone-900 text-sm">
                        ₹{p.totalAmount}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedInvoice(p)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 mx-auto"
                        >
                          <Printer size={13} /> View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reminder Schedules & Email Preferences */}
      {activeTab === 'reminders' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-black text-stone-900">Configurable Expiration Reminder Schedules</h3>
            <p className="text-xs text-stone-500 mt-1">
              Select which notifications you wish to receive. Transactional billing notices are delivered to <strong>{user?.email}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: '30 Days Before Expiration', desc: 'Advance heads-up email to plan inventory & budget allocation.', checked: true },
              { title: '15 Days Before Expiration', desc: 'Mid-term reminder with direct one-click manual renewal link.', checked: true },
              { title: '7 Days Before Expiration', desc: 'Action-required warning to prevent service quota restriction.', checked: true },
              { title: '3 Days Before Expiration', desc: 'High-priority alert with payment method verification check.', checked: true },
              { title: '1 Day Before Expiration', desc: 'Final advance alert prior to automatic billing or expiration.', checked: true },
              { title: 'On the Renewal Date', desc: 'Real-time billing receipt or renewal due notification.', checked: true },
              { title: 'After a Failed Renewal Payment', desc: 'Immediate notification with 7-day grace period schedule.', checked: true },
              { title: 'After a Successful Renewal', desc: 'Downloadable GST commercial tax invoice & extended validity dates.', checked: true }
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl">
                <input
                  type="checkbox"
                  defaultChecked={r.checked}
                  className="mt-1 h-4 w-4 text-brand-600 rounded border-stone-300 focus:ring-brand-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{r.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-700" />
              Anti-Spam & Transactional Guarantee
            </span>
            <p>
              Subscription notices are strictly transactional billing service records. They are never grouped with promotional marketing emails and will always contain secure links to renew or manage settings.
            </p>
          </div>
        </div>
      )}

      {/* Cancellation Consequence Review Modal */}
      {cancelModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-xl font-black text-stone-900">
                Cancel Automatic Renewal?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Plan: <strong>{cancelModalSub.planName}</strong>
              </p>
            </div>

            {/* Mandatory Consequences Disclosure */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs space-y-2 text-stone-700">
              <span className="font-bold text-stone-900 block text-xs uppercase tracking-wider">
                Consequences of Cancellation:
              </span>
              <ul className="space-y-1.5 list-disc pl-4 text-stone-600">
                <li>You will retain complete access through <strong>{new Date(cancelModalSub.expirationDate).toLocaleDateString()}</strong>.</li>
                <li>No automated payments will ever be attempted after expiration.</li>
                <li>Upon expiration, product listing limits will reset to free basic tier (5 items).</li>
                <li>Priority cold-chain reefer booking & dedicated 24/7 account desk will be suspended.</li>
              </ul>
            </div>

            {/* Feedback / Reason */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Temporary pause in seasonal exporting">Temporary pause in seasonal exporting</option>
                <option value="Found alternative platform">Found alternative platform</option>
                <option value="Need different billing interval">Need different billing interval</option>
                <option value="Budget adjustments">Budget adjustments</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Consent checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={cancelConsequencesAcknowledged}
                onChange={(e) => setCancelConsequencesAcknowledged(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-brand-600 rounded border-stone-300 focus:ring-brand-500"
              />
              <span className="text-xs text-stone-600 leading-snug">
                I understand the consequences and confirm that I want to cancel upcoming recurring renewals for this plan.
              </span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalSub(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={isCancelling || !cancelConsequencesAcknowledged}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail & Print Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-100 pb-5">
              <div>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase">
                  Tax Invoice / Receipt
                </span>
                <h3 className="text-2xl font-black text-stone-900 mt-1">{selectedInvoice.invoiceNumber}</h3>
                <p className="text-xs text-stone-500">Date: {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Payee & Customer Details */}
            <div className="grid grid-cols-2 gap-6 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <span className="font-bold text-stone-400 uppercase tracking-wider block">Service Provider</span>
                <strong className="text-stone-900 text-sm block mt-0.5">{FRESH_WORLD_PAYEE.merchantName}</strong>
                <span className="text-stone-600 block">Developer: {FRESH_WORLD_PAYEE.developerName}</span>
                <span className="text-stone-600 block font-mono">UPI: {FRESH_WORLD_PAYEE.upiId}</span>
                <span className="text-stone-600 block">{FRESH_WORLD_PAYEE.developerEmail}</span>
              </div>
              <div>
                <span className="font-bold text-stone-400 uppercase tracking-wider block">Billed To</span>
                <strong className="text-stone-900 text-sm block mt-0.5">{selectedInvoice.customerName}</strong>
                <span className="text-stone-600 block">{selectedInvoice.customerEmail}</span>
                <span className="text-stone-500 block font-mono">Customer ID: {selectedInvoice.customerId}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-right">Base Price</th>
                    <th className="py-2.5 px-4 text-right">Tax (18% GST)</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="py-3 px-4 font-medium text-stone-900">
                      {selectedInvoice.planName} {selectedInvoice.isRenewal ? '(Renewal Term)' : '(Initial Term)'}
                      <span className="block text-stone-400 text-[11px]">Digital Platform Validity License</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-700">₹{selectedInvoice.amount}</td>
                    <td className="py-3 px-4 text-right font-mono text-stone-700">₹{selectedInvoice.taxAmount}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">₹{selectedInvoice.totalAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Authentication Details */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck size={16} /> Payment Authenticated
              </span>
              <p>Provider: <strong>{selectedInvoice.paymentProvider}</strong></p>
              {selectedInvoice.utrNumber && <p className="font-mono">UPI Ref / UTR: <strong>{selectedInvoice.utrNumber}</strong></p>}
              {selectedInvoice.razorpayPaymentId && <p className="font-mono">Razorpay ID: <strong>{selectedInvoice.razorpayPaymentId}</strong></p>}
            </div>

            {/* Print & Close */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Printer size={15} /> Print Invoice
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Renew Modal */}
      {renewModalPlan && (
        <SubscriptionCheckoutModal
          isOpen={true}
          onClose={() => {
            setRenewModalPlan(null);
            setRenewModalSubId(null);
          }}
          plan={renewModalPlan}
          user={user}
          onSuccess={() => {
            setRenewModalPlan(null);
            setRenewModalSubId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
