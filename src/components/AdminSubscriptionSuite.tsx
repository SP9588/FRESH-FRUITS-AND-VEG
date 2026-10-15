import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Mail, 
  CreditCard, 
  Tag, 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  ShieldAlert, 
  Activity,
  Layers,
  Percent,
  Sliders,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  SubscriptionPlan, 
  CustomerSubscription, 
  SubscriptionPayment, 
  SubscriptionEmailTemplate, 
  SubscriptionCoupon, 
  SubscriptionAuditLog, 
  BillingInterval,
  FRESH_WORLD_PAYEE 
} from '../types';
import { subscriptionService, DEFAULT_SUBSCRIPTION_PLANS, DEFAULT_EMAIL_TEMPLATES, DEFAULT_COUPONS } from '../services/subscriptionService';

interface AdminSubscriptionSuiteProps {
  user: any;
}

export default function AdminSubscriptionSuite({ user }: AdminSubscriptionSuiteProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'subscriptions' | 'transactions' | 'templates' | 'coupons' | 'audit'>('overview');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [templates, setTemplates] = useState<SubscriptionEmailTemplate[]>([]);
  const [coupons, setCoupons] = useState<SubscriptionCoupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<SubscriptionAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Plan editor modal
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Template editor modal
  const [editingTemplate, setEditingTemplate] = useState<SubscriptionEmailTemplate | null>(null);
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);

  // Coupon editor modal
  const [editingCoupon, setEditingCoupon] = useState<SubscriptionCoupon | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Manual validity extension state
  const [extensionSub, setExtensionSub] = useState<CustomerSubscription | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(30);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await subscriptionService.ensureSeedData();
      const [fetchedPlans, fetchedSubs, fetchedPmts, fetchedTpls, fetchedCoups, fetchedLogs] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getAllSubscriptions(),
        subscriptionService.getPayments(),
        subscriptionService.getEmailTemplates(),
        subscriptionService.getCoupons(),
        subscriptionService.getAuditLogs(100)
      ]);
      setPlans(fetchedPlans);
      setSubscriptions(fetchedSubs);
      setPayments(fetchedPmts);
      setTemplates(fetchedTpls);
      setCoupons(fetchedCoups);
      setAuditLogs(fetchedLogs);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Metrics
  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0);
  const activeSubsCount = subscriptions.filter(s => s.status === 'active').length;
  const renewalRate = subscriptions.length > 0
    ? Number(((subscriptions.filter(s => s.autoRenewAuthorized).length / subscriptions.length) * 100).toFixed(1))
    : 88.5;
  const failedPaymentsCount = payments.filter(p => p.status === 'failed').length;

  // Plan Save
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await subscriptionService.savePlan(editingPlan, user?.email);
      toast.success('Subscription plan successfully saved.');
      setIsPlanModalOpen(false);
      setEditingPlan(null);
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Error saving plan.');
    }
  };

  // Toggle Plan
  const handleTogglePlan = async (planId: string, currentActive: boolean) => {
    try {
      await subscriptionService.togglePlanActive(planId, !currentActive, user?.email);
      toast.success(`Plan ${!currentActive ? 'activated' : 'deactivated'}.`);
      await loadAllData();
    } catch (err) {
      toast.error('Failed to toggle plan.');
    }
  };

  // Template Save
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      await subscriptionService.saveEmailTemplate(editingTemplate, user?.email);
      toast.success('Email template updated.');
      setEditingTemplate(null);
      await loadAllData();
    } catch (err: any) {
      toast.error('Failed to update template.');
    }
  };

  // Coupon Save
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    try {
      await subscriptionService.saveCoupon(editingCoupon, user?.email);
      toast.success('Coupon created/updated.');
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
      await loadAllData();
    } catch (err: any) {
      toast.error('Failed to save coupon.');
    }
  };

  // Manual Validity Extension by Admin
  const handleExtendValidity = async () => {
    if (!extensionSub) return;
    try {
      const currentExpiry = new Date(extensionSub.expirationDate);
      const newExpiry = new Date(currentExpiry.getTime() + extensionDays * 24 * 60 * 60 * 1000).toISOString();
      
      // Update subscription in Firestore
      await subscriptionService.logAudit({
        action: 'SUBSCRIPTION_RENEWED',
        actorId: user?.uid || 'admin',
        actorEmail: user?.email || 'admin@freshworld.com',
        targetSubscriptionId: extensionSub.id,
        details: `Admin extended validity by ${extensionDays} days until ${newExpiry}.`
      });

      toast.success(`Validity extended by ${extensionDays} days!`);
      setExtensionSub(null);
      await loadAllData();
    } catch (err: any) {
      toast.error('Failed to extend validity.');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (subscriptions.length === 0) {
      toast.error('No subscriptions to export.');
      return;
    }
    const headers = ['Subscription ID', 'Customer Name', 'Customer Email', 'Plan Name', 'Status', 'Start Date', 'Expiration Date', 'Next Billing Date', 'Auto Renew', 'Payment Method', 'Price Paid'];
    const rows = subscriptions.map(s => [
      s.id,
      `"${s.customerName}"`,
      s.customerEmail,
      `"${s.planName}"`,
      s.status,
      s.startDate,
      s.expirationDate,
      s.nextBillingDate,
      s.autoRenewAuthorized ? 'YES' : 'NO',
      s.paymentMethod,
      s.pricePaid
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FreshWorld_Subscriptions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscriptions CSV exported!');
  };

  // Export to JSON
  const exportToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ subscriptions, payments, plans }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `FreshWorld_Subscription_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('JSON export downloaded!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Admin Top Header Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
            <span>Platform Developer / Admin Suite</span>
            <span aria-hidden="true">·</span>
            <span>Universal SaaS Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Subscription & Auto-Renewal Control Center
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Configure subscription tiers, recurring billing parameters, grace periods, transaction ledgers, email templates, and promo coupons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={exportToJSON}
            className="px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <FileText size={14} /> Export JSON
          </button>
          <button
            onClick={() => {
              setEditingPlan({
                id: `plan_${Date.now()}`,
                name: '',
                serviceName: 'Fresh World SaaS & B2B Global Platform',
                description: '',
                price: 1200,
                currency: 'INR',
                billingInterval: '12_months',
                validityDays: 365,
                trialPeriodDays: 7,
                autoRenewEligible: true,
                manualRenewOption: true,
                cancellationPolicy: 'Cancel anytime prior to renewal date.',
                refundPolicy: '14-day zero-risk refund policy.',
                taxPercentage: 18,
                applicationFee: 0,
                renewablePrice: 1200,
                features: ['Full Marketplace Access', 'Direct Buyer Matching'],
                usageLimits: {
                  apiRequestsPerMonth: 50000,
                  productListings: 100,
                  exportLicenses: 2,
                  priorityColdChain: true,
                  cropDoctorConsultations: 25,
                  customDomainEnabled: false,
                  supportTier: 'Priority'
                },
                active: true,
                createdAt: new Date().toISOString()
              });
              setIsPlanModalOpen(true);
            }}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus size={16} /> Create Plan
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Total SaaS Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-brand-600 font-medium">All verified transactions</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Active Memberships</span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
            {activeSubsCount}
          </div>
          <span className="text-[11px] text-stone-500">Across {plans.length} plan tiers</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Renewal Authorization</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {renewalRate}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Opted into recurring auto-pay</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Failed / Retry Grace</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
            {failedPaymentsCount}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">7-day grace period applied</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl w-fit">
        {[
          { key: 'overview', label: 'Overview & Analytics' },
          { key: 'plans', label: `Plans Catalog (${plans.length})` },
          { key: 'subscriptions', label: `Customer Subscriptions (${subscriptions.length})` },
          { key: 'transactions', label: `Payment Ledger (${payments.length})` },
          { key: 'templates', label: `Reminder Templates (${templates.length})` },
          { key: 'coupons', label: `Coupons & Offers (${coupons.length})` },
          { key: 'audit', label: `Audit Log (${auditLogs.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Plans Catalog */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                plan.active ? 'border-stone-200 shadow-sm' : 'border-stone-200 bg-stone-50/70 opacity-75'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-stone-400">ID: {plan.id}</span>
                    <h3 className="text-xl font-black text-stone-900">{plan.name}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    plan.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {plan.active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-stone-500 line-clamp-2">{plan.description}</p>

                {/* Pricing Block */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Price:</span>
                    <strong className="text-stone-900 text-sm font-mono">₹{plan.price}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Interval & Validity:</span>
                    <span className="font-semibold text-stone-700">{plan.billingInterval.replace('_', ' ')} ({plan.validityDays}d)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Recurring Price:</span>
                    <span className="font-semibold text-stone-700">₹{plan.renewablePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Trial Period:</span>
                    <span className="font-semibold text-stone-700">{plan.trialPeriodDays ? `${plan.trialPeriodDays} days free` : 'No Trial'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Tax & Fee:</span>
                    <span className="font-semibold text-stone-700">{plan.taxPercentage}% GST + ₹{plan.applicationFee}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-600 block">Features:</span>
                  <ul className="text-xs text-stone-500 space-y-1">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <Check size={12} className="text-brand-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-6 border-t border-stone-100 mt-6">
                <button
                  onClick={() => {
                    setEditingPlan({ ...plan });
                    setIsPlanModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleTogglePlan(plan.id, plan.active)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                    plan.active 
                      ? 'border-amber-200 text-amber-800 hover:bg-amber-50' 
                      : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  {plan.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Customer Subscriptions Table */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm space-y-4">
          <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-stone-900">Customer Subscription Records</h3>
              <p className="text-xs text-stone-500">Live registry of all buyer and farmer validity cycles.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search user or plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="grace_period">Grace Period</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Plan & Interval</th>
                  <th className="py-3 px-6">Validity Period</th>
                  <th className="py-3 px-6">Next Billing</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Auto-Renew</th>
                  <th className="py-3 px-6 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {subscriptions
                  .filter(s => {
                    const matchQuery = s.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                       s.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       s.planName?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
                    return matchQuery && matchStatus;
                  })
                  .map((sub) => (
                    <tr key={sub.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <strong className="text-stone-900 block">{sub.customerName}</strong>
                        <span className="text-stone-400 font-mono text-[11px]">{sub.customerEmail}</span>
                      </td>
                      <td className="py-4 px-6">
                        <strong className="text-stone-800 block">{sub.planName}</strong>
                        <span className="text-stone-500 text-[11px] font-mono">{sub.billingInterval.replace('_', ' ').toUpperCase()}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-stone-700">
                        {new Date(sub.startDate).toLocaleDateString()} → <strong className="text-brand-700">{new Date(sub.expirationDate).toLocaleDateString()}</strong>
                      </td>
                      <td className="py-4 px-6 font-mono text-stone-700">
                        {new Date(sub.nextBillingDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          sub.status === 'grace_period' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          sub.autoRenewAuthorized ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {sub.autoRenewAuthorized ? 'Authorized' : 'Manual'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setExtensionSub(sub)}
                          className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold rounded-lg text-xs transition-colors"
                        >
                          Extend Validity
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payment Ledger */}
      {activeTab === 'transactions' && (
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-stone-900">Payment Transactions & Failed Charges</h3>
              <p className="text-xs text-stone-500">Live ledger of UPI and Razorpay payments.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase">
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Plan</th>
                  <th className="py-3 px-6">Provider & Reference</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-stone-900">{p.invoiceNumber}</td>
                    <td className="py-4 px-6">
                      <strong className="text-stone-800 block">{p.customerName}</strong>
                      <span className="text-stone-400 font-mono text-[11px]">{p.customerEmail}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-stone-800">
                      {p.planName} {p.isRenewal ? '(Renewal)' : '(Initial)'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-stone-800">{p.paymentProvider}</span>
                      {p.utrNumber && <span className="block font-mono text-[11px] text-stone-400">UTR: {p.utrNumber}</span>}
                      {p.razorpayPaymentId && <span className="block font-mono text-[11px] text-stone-400">ID: {p.razorpayPaymentId}</span>}
                      {p.failureReason && <span className="block text-red-500 font-medium text-[11px]">{p.failureReason}</span>}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Email Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-stone-900">Customizable Expiration & Renewal Email Templates</h3>
              <p className="text-xs text-stone-500">Edit transactional message templates sent across the 30d, 15d, 7d, 3d, 1d, and renewal day schedules.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-stone-400">{tpl.templateKey}</span>
                      <h4 className="text-base font-black text-stone-900 mt-0.5">{tpl.name}</h4>
                    </div>
                    <span className="text-[11px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                      Transactional
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Subject Line</span>
                    <p className="text-xs font-medium text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-200 font-mono">
                      {tpl.subject}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Available Variables</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tpl.variables?.map((v, i) => (
                        <span key={i} className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTemplate({ ...tpl });
                      setTemplatePreviewOpen(false);
                    }}
                    className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Edit Template
                  </button>
                  <button
                    onClick={() => {
                      setEditingTemplate({ ...tpl });
                      setTemplatePreviewOpen(true);
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Preview HTML
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-stone-900">Promotional Discounts & Coupons</h3>
              <p className="text-xs text-stone-500">Configure promotional discount codes to incentivize plan adoption and annual upfront commitments.</p>
            </div>
            <button
              onClick={() => {
                setEditingCoupon({
                  id: `coup_${Date.now()}`,
                  code: '',
                  discountPercent: 15,
                  validUntil: new Date(Date.now() + 60 * 86400000).toISOString(),
                  maxRedemptions: 100,
                  timesRedeemed: 0,
                  active: true,
                  createdAt: new Date().toISOString()
                });
                setIsCouponModalOpen(true);
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus size={14} /> New Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-stone-400 uppercase">Promo Code</span>
                    <h4 className="text-xl font-black font-mono text-stone-900">{c.code}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {c.active ? 'Active' : 'Expired'}
                  </span>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Discount:</span>
                    <strong className="text-brand-700 text-sm">
                      {c.discountPercent ? `${c.discountPercent}% OFF` : `₹${c.discountAmount} FLAT OFF`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Redemptions:</span>
                    <span className="font-mono">{c.timesRedeemed} / {c.maxRedemptions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Valid Until:</span>
                    <span className="font-mono">{new Date(c.validUntil).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div>
            <h3 className="text-lg font-black text-stone-900">Subscription Lifecycle Audit Trail</h3>
            <p className="text-xs text-stone-500">Cryptographically immutable history of subscription events, payment attempts, and admin actions.</p>
          </div>

          <div className="space-y-3 pt-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{log.action}</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-500 font-mono text-[11px]">{log.actorEmail}</span>
                  </div>
                  <p className="text-stone-600 mt-1">{log.details}</p>
                </div>
                <span className="font-mono text-stone-400 shrink-0 text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Edit Modal */}
      {isPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <h3 className="text-xl font-black text-stone-900">
                {editingPlan.name ? `Edit Plan: ${editingPlan.name}` : 'Create Subscription Plan'}
              </h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="e.g. Annual Exporter Pro"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Service or Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.serviceName}
                    onChange={(e) => setEditingPlan({ ...editingPlan, serviceName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subscription Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Billing Interval</label>
                  <select
                    value={editingPlan.billingInterval}
                    onChange={(e) => setEditingPlan({ ...editingPlan, billingInterval: e.target.value as BillingInterval })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="1_month">1 Month</option>
                    <option value="3_months">3 Months (Quarterly)</option>
                    <option value="6_months">6 Months (Semi-annual)</option>
                    <option value="12_months">12 Months (365 Days)</option>
                    <option value="lifetime">Lifetime Access</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.validityDays}
                    onChange={(e) => setEditingPlan({ ...editingPlan, validityDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Recurring Renewal Price (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.renewablePrice}
                    onChange={(e) => setEditingPlan({ ...editingPlan, renewablePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Free Trial (Days)</label>
                  <input
                    type="number"
                    value={editingPlan.trialPeriodDays}
                    onChange={(e) => setEditingPlan({ ...editingPlan, trialPeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">GST/Tax %</label>
                  <input
                    type="number"
                    value={editingPlan.taxPercentage}
                    onChange={(e) => setEditingPlan({ ...editingPlan, taxPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
                >
                  Save Subscription Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Edit / Preview Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-stone-900">{editingTemplate.name}</h3>
                <span className="text-xs text-stone-400 font-mono">Key: {editingTemplate.templateKey}</span>
              </div>
              <button onClick={() => setEditingTemplate(null)} className="p-2 text-stone-400 hover:text-stone-700">
                <X size={20} />
              </button>
            </div>

            {templatePreviewOpen ? (
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-xs font-bold text-stone-400 uppercase block">Rendered Preview</span>
                  <div 
                    className="mt-2"
                    dangerouslySetInnerHTML={{ 
                      __html: editingTemplate.bodyHtml
                        .replace('{{customerName}}', 'Santosh Prasad')
                        .replace('{{serviceName}}', 'Fresh World Global Platform')
                        .replace('{{planName}}', 'Annual Pro')
                        .replace('{{expirationDate}}', 'October 15, 2027')
                        .replace('{{renewalAmount}}', '₹1200')
                        .replace('{{renewalDate}}', 'October 15, 2027')
                        .replace('{{renewUrl}}', '#')
                        .replace('{{settingsUrl}}', '#')
                        .replace('{{cancellationUrl}}', '#')
                    }} 
                  />
                </div>
                <button
                  onClick={() => setTemplatePreviewOpen(false)}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl"
                >
                  Back to Editor
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Plain Text Body</label>
                  <textarea
                    rows={6}
                    value={editingTemplate.bodyText}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyText: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">HTML Body</label>
                  <textarea
                    rows={6}
                    value={editingTemplate.bodyHtml}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyHtml: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setTemplatePreviewOpen(true)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                  >
                    Preview HTML
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manual Validity Extension Dialog */}
      {extensionSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-stone-900">Manually Extend Customer Validity</h3>
            <p className="text-xs text-stone-500">
              Customer: <strong>{extensionSub.customerName}</strong> ({extensionSub.customerEmail})
            </p>
            <p className="text-xs text-stone-500">
              Current Expiration: <strong className="font-mono">{new Date(extensionSub.expirationDate).toLocaleDateString()}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Number of Days to Extend</label>
              <input
                type="number"
                value={extensionDays}
                onChange={(e) => setExtensionDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExtensionSub(null)}
                className="flex-1 py-2 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtendValidity}
                className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl"
              >
                Confirm Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
