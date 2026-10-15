import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  QrCode, 
  Copy, 
  CreditCard, 
  Sparkles, 
  Calendar, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  Lock, 
  Tag, 
  FileText, 
  Smartphone,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { SubscriptionPlan, CustomerSubscription, SubscriptionPayment, FRESH_WORLD_PAYEE } from '../types';
import { subscriptionService } from '../services/subscriptionService';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  user: any;
  onSuccess?: (sub: CustomerSubscription, payment: SubscriptionPayment) => void;
}

export default function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  plan,
  user,
  onSuccess
}: SubscriptionCheckoutModalProps) {
  const [autoRenewAuthorized, setAutoRenewAuthorized] = useState<boolean>(plan.autoRenewEligible);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'RAZORPAY'>('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  
  // UPI states
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedData, setCompletedData] = useState<{
    subscription: CustomerSubscription;
    payment: SubscriptionPayment;
  } | null>(null);

  // Razorpay simulation states
  const [razorpayOption, setRazorpayOption] = useState<'card' | 'upi' | 'netbanking'>('upi');

  if (!isOpen) return null;

  // Calculation
  const basePrice = Math.max(0, plan.price - appliedDiscount);
  const taxAmount = Number(((basePrice * plan.taxPercentage) / 100).toFixed(2));
  const totalAmount = Number((basePrice + taxAmount + plan.applicationFee).toFixed(2));

  // Next expected payment date
  const expectedNextDate = new Date(Date.now() + plan.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // UPI deep link & QR code
  const upiId = FRESH_WORLD_PAYEE.upiId; // 9279120271@ybl
  const payeeName = 'FreshWorld Global Platform';
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Sub_${plan.id}_${user?.uid?.slice(0, 6) || 'usr'}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiIntentUrl)}&color=0f172a&bgcolor=ffffff&margin=10`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    toast.success('UPI ID 9279120271@ybl copied!');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    const res = await subscriptionService.validateCoupon(couponCode, plan.price);
    setIsValidatingCoupon(false);
    if (res.valid) {
      setAppliedDiscount(res.discountAmount);
      setCouponMessage(res.message);
      toast.success(res.message);
    } else {
      setAppliedDiscount(0);
      setCouponMessage(res.message);
      toast.error(res.message);
    }
  };

  const handleCompletePayment = async () => {
    if (!user) {
      toast.error('Please log in to activate your subscription.');
      return;
    }

    if (paymentMethod === 'UPI') {
      if (!utrNumber.trim()) {
        toast.error('Please enter the 12-digit UPI Reference / UTR Number.');
        return;
      }
      if (utrNumber.trim().length < 6) {
        toast.error('Please provide a valid UTR or payment reference.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const razorpayId = paymentMethod === 'RAZORPAY' ? `pay_rzp_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}` : undefined;
      const razorpayOrder = paymentMethod === 'RAZORPAY' ? `order_rzp_${Date.now()}` : undefined;

      const result = await subscriptionService.purchaseAndActivateSubscription({
        userId: user.uid,
        customerName: user.displayName || user.email?.split('@')[0] || 'Subscriber',
        customerEmail: user.email || 'customer@freshworld.com',
        plan,
        autoRenewAuthorized,
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId : undefined,
        utrNumber: paymentMethod === 'UPI' ? utrNumber.trim() : undefined,
        razorpayPaymentId: razorpayId,
        razorpayOrderId: razorpayOrder,
        couponCode: couponCode || undefined,
        appliedDiscount
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setCompletedData(result);
      if (onSuccess) {
        onSuccess(result.subscription, result.payment);
      }
      toast.success('Subscription successfully activated!');
    } catch (err: any) {
      console.error('Subscription error:', err);
      toast.error(err.message || 'Payment activation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-100 px-6 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Universal SaaS Subscription
              </span>
              <span className="text-xs text-stone-500">·</span>
              <span className="text-xs font-mono text-stone-500">
                {plan.billingInterval.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-1">
              {completedData ? 'Subscription Activated' : `Checkout: ${plan.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {completedData ? (
            /* Success View */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} />
              </div>

              <div>
                <h3 className="text-2xl font-black text-stone-900">
                  Welcome to {completedData.subscription.planName}!
                </h3>
                <p className="text-stone-600 max-w-lg mx-auto mt-2 text-sm">
                  Your payment has been verified and your subscription access is now fully active across all platforms, APIs, and marketplace channels.
                </p>
              </div>

              {/* Validity & Invoice Summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-left max-w-xl mx-auto space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-stone-200/80 pb-3">
                  <span className="text-stone-500">Invoice Number</span>
                  <span className="font-mono font-bold text-stone-900">{completedData.payment.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-200/80 pb-3">
                  <span className="text-stone-500">Start Date</span>
                  <span className="font-bold text-stone-900">
                    {new Date(completedData.subscription.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-200/80 pb-3">
                  <span className="text-stone-500">Expiration Date</span>
                  <span className="font-bold text-brand-700">
                    {new Date(completedData.subscription.expirationDate).toLocaleDateString()} ({plan.validityDays} Days)
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-200/80 pb-3">
                  <span className="text-stone-500">Next Billing Date</span>
                  <span className="font-bold text-stone-900">
                    {new Date(completedData.subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-200/80 pb-3">
                  <span className="text-stone-500">Auto-Renewal</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${completedData.subscription.autoRenewAuthorized ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
                    {completedData.subscription.autoRenewAuthorized ? 'Enabled (Authorized)' : 'Manual Renewal Only'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500">Total Paid</span>
                  <span className="text-lg font-black text-stone-900">
                    ₹{completedData.payment.totalAmount} ({completedData.payment.paymentProvider})
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  Go to Dashboard & Manage Subscriptions
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> Print Tax Receipt
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Flow */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Plan Summary, Auto-Renewal Terms & Transparent Breakdown */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Selected Plan</span>
                    <h3 className="text-xl font-black text-stone-900">{plan.name}</h3>
                    <p className="text-xs text-stone-500 mt-1">{plan.description}</p>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-2 pt-2 border-t border-stone-200/80">
                    <span className="text-xs font-bold text-stone-700">Included Features:</span>
                    <ul className="space-y-1.5 text-xs text-stone-600">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check size={14} className="text-brand-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mandatory Disclosure Box (per prompt) */}
                  <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-stone-500">Amount Payable Now</span>
                      <span className="font-bold text-stone-900 tabular-nums">₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-stone-500">Recurring Renewal Amount</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        {plan.renewablePrice > 0 ? `₹${plan.renewablePrice} + Tax` : 'None (Lifetime)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-stone-500">Billing Frequency</span>
                      <span className="font-semibold text-stone-800">
                        {plan.billingInterval === '12_months' ? 'Annually (365 Days)' : plan.billingInterval.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-stone-500">Next Expected Renewal</span>
                      <span className="font-semibold text-brand-700">{expectedNextDate}</span>
                    </div>
                  </div>
                </div>

                {/* Explicit Auto-Renewal Authorization Selector (per user prompt) */}
                {plan.autoRenewEligible && (
                  <div className={`p-4 rounded-2xl border transition-all ${autoRenewAuthorized ? 'bg-emerald-50/80 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRenewAuthorized}
                        onChange={(e) => setAutoRenewAuthorized(e.target.checked)}
                        className="mt-1 h-4 w-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                      />
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <RefreshCw size={14} className={autoRenewAuthorized ? 'text-emerald-600 animate-spin-slow' : 'text-stone-400'} />
                          Enable Automatic Renewal
                        </span>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          By checking this box, you explicitly authorize automatic recurring renewal billing on <strong>{expectedNextDate}</strong> for ₹{plan.renewablePrice} plus applicable taxes.
                        </p>
                      </div>
                    </label>

                    <div className="mt-3 pt-3 border-t border-emerald-200/60 text-[11px] text-stone-500 space-y-1">
                      <p>• <strong>Renewal Reminders:</strong> Advance email alerts will be sent 30, 15, 7, 3, and 1 day before expiration.</p>
                      <p>• <strong>Easy Cancellation:</strong> You can cancel recurring authorization at any time directly in your Customer Dashboard with one click.</p>
                      <p>• <strong>Strict Grace Policy:</strong> We never charge after cancellation, and no renewal occurs without confirmed authorization.</p>
                    </div>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <Tag size={14} className="text-brand-600" />
                    <span>Have a Promo Coupon?</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FRESHWORLD20 or ANNUAL100"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-grow px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs uppercase font-mono font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      {isValidatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-xs ${appliedDiscount > 0 ? 'text-emerald-600 font-medium' : 'text-red-500'}`}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Transparent Financial Ledger */}
                <div className="space-y-2 text-xs border-t border-stone-200 pt-3">
                  <div className="flex justify-between text-stone-600">
                    <span>Base Subscription Price</span>
                    <span className="font-mono">₹{plan.price.toFixed(2)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount</span>
                      <span className="font-mono">-₹{appliedDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span>Applicable GST/Tax ({plan.taxPercentage}%)</span>
                    <span className="font-mono">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  {plan.applicationFee > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Platform Application Fee</span>
                      <span className="font-mono">₹{plan.applicationFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-stone-900 border-t border-stone-200 pt-2">
                    <span>Total Amount Payable</span>
                    <span className="text-base text-brand-700 font-mono">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Modular Payment Integration Layer */}
              <div className="lg:col-span-7 space-y-6">
                {/* Payment Gateway Tabs */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-2 uppercase tracking-wider">
                    Select Payment Method (Indian & Global Business)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${paymentMethod === 'UPI' ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20' : 'border-stone-200 hover:bg-stone-50'}`}
                    >
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                        <QrCode size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-900">UPI Instant QR & ID</div>
                        <div className="text-xs text-stone-500">Scan via GPay, PhonePe, Paytm</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('RAZORPAY')}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${paymentMethod === 'RAZORPAY' ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20' : 'border-stone-200 hover:bg-stone-50'}`}
                    >
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-900">Razorpay Gateway</div>
                        <div className="text-xs text-stone-500">Cards, NetBanking & Mandates</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tab 1: UPI Gateway */}
                {paymentMethod === 'UPI' && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                      <div>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Official Platform Payee
                        </span>
                        <h4 className="font-black text-stone-900 text-base mt-1">UPI Payment & Verification</h4>
                      </div>
                      <span className="text-xs text-stone-500 font-mono">Real-time QR</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                      {/* Live QR Code */}
                      <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-center">
                        <img
                          src={qrCodeUrl}
                          alt="Payee UPI QR"
                          className="w-44 h-44 rounded-lg object-contain"
                        />
                        <span className="text-[11px] font-mono text-stone-500 mt-2">
                          Scan with any UPI App · ₹{totalAmount}
                        </span>
                        <a
                          href={upiIntentUrl}
                          className="mt-2 text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
                        >
                          <Smartphone size={13} /> Open in UPI App
                        </a>
                      </div>

                      {/* Payee Details */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-stone-500 uppercase">Payee UPI ID</label>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-sm font-bold text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-lg select-all">
                              {upiId}
                            </span>
                            <button
                              type="button"
                              onClick={copyUpi}
                              className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-600 transition-colors"
                              title="Copy UPI ID"
                            >
                              {copiedUpi ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-500 uppercase">Beneficiary Name</label>
                          <p className="text-xs font-medium text-stone-800">{FRESH_WORLD_PAYEE.merchantName}</p>
                          <p className="text-[11px] text-stone-400 font-mono">{FRESH_WORLD_PAYEE.developerEmail}</p>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-500 uppercase">Total Amount</label>
                          <p className="text-lg font-black text-brand-700 tabular-nums">₹{totalAmount}</p>
                        </div>
                      </div>
                    </div>

                    {/* UTR Input */}
                    <div className="pt-2 border-t border-stone-200">
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        Enter 12-Digit UPI Transaction ID / UTR Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 529381729012"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                        className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-mono tracking-wider focus:ring-2 focus:ring-brand-500 outline-none"
                        maxLength={24}
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        After completing the UPI payment in your banking app, paste the UTR/Reference number above to activate instantly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Razorpay Gateway */}
                {paymentMethod === 'RAZORPAY' && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                      <div>
                        <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          Razorpay Indian Business
                        </span>
                        <h4 className="font-black text-stone-900 text-base mt-1">Merchant Checkout</h4>
                      </div>
                      <span className="text-xs font-mono text-stone-500">Key: rzp_test_FW_SUB</span>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {(['upi', 'card', 'netbanking'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setRazorpayOption(opt)}
                            className={`py-2 px-3 rounded-lg text-xs font-bold text-center border transition-all ${razorpayOption === opt ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'}`}
                          >
                            {opt === 'upi' ? 'UPI Autopay' : opt === 'card' ? 'Credit / Debit Card' : 'Net Banking'}
                          </button>
                        ))}
                      </div>

                      <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-500">Merchant Account</span>
                          <span className="font-bold text-stone-900">Fresh World Global Commerce</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-500">Amount</span>
                          <span className="font-bold text-stone-900">₹{totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-500">Recurring Mandate</span>
                          <span className={`font-semibold ${autoRenewAuthorized ? 'text-emerald-700' : 'text-stone-500'}`}>
                            {autoRenewAuthorized ? 'E-Mandate Registered (Cancel Anytime)' : 'Single Order (No Mandate)'}
                          </span>
                        </div>

                        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                          <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                          <span>
                            PCI-DSS Level 1 compliant gateway. 256-bit SSL encrypted. Simulated for test credentials without live charge.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    onClick={handleCompletePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-base rounded-2xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={18} className="animate-spin" /> Verifying & Activating...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Confirm & Activate Subscription (₹{totalAmount})</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-stone-400 mt-2">
                    🔒 Protected by 14-day zero-risk refund policy. Tax invoice generated automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
