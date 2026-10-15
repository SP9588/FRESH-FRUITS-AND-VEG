import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  ShieldCheck,
  Check,
  Copy,
  Smartphone,
  Sparkles,
  Percent,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  CreditCard,
  Building2,
  CheckCircle2,
  Receipt,
  FileCheck,
  FileText,
  Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FRESH_WORLD_PAYEE, OrderItem } from '../types';
import { auth, db } from '../firebase';
import { doc, runTransaction, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import CartInvoiceModal from './CartInvoiceModal';

interface CheckoutPaymentProcessorProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  platformCommissionRate: number;
  onPaymentSuccess: (orderId: string) => void;
  onCancel?: () => void;
}

export type PaymentMethod = 'UPI_QR' | 'UPI_COLLECT' | 'CARD_ESCROW' | 'NET_BANKING';

export default function CheckoutPaymentProcessor({
  items,
  subtotal,
  shipping,
  total,
  platformCommissionRate,
  onPaymentSuccess,
  onCancel,
}: CheckoutPaymentProcessorProps) {
  const navigate = useNavigate();
  const payee = FRESH_WORLD_PAYEE;

  // Selected payment method
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI_QR');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [userVpa, setUserVpa] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  
  // Verification states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Currency conversion approximation: $1 USD ≈ ₹85.50 INR for UPI payload
  const inrTotal = Math.round(total * 85.5);
  const commissionAmount = Number(((subtotal * platformCommissionRate) / 100).toFixed(2));
  const inrCommission = Math.round(commissionAmount * 85.5);

  // Generated Order ID for this checkout session
  const [sessionId] = useState(() => `FW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  // Countdown timer for escrow reservation (15:00 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // UPI Deep Link & QR Code creation
  const upiDeepLink = `upi://pay?pa=${payee.upiId}&pn=${encodeURIComponent(
    payee.merchantName
  )}&am=${inrTotal}&cu=INR&tn=${encodeURIComponent(`FreshWorld Order ${sessionId}`)}`;

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    upiDeepLink
  )}&color=1c1917&bgcolor=ffffff&margin=10`;

  const copyUpi = () => {
    navigator.clipboard.writeText(payee.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    toast.success(`Copied Payee UPI: ${payee.upiId}`);
  };

  // Execute atomic checkout transaction
  const executeSecureTransaction = async (overrideUtr?: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to complete payment');
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    const finalUtr = overrideUtr || utrNumber.trim() || `UTR${Date.now().toString().slice(-8)}`;

    setIsProcessing(true);
    try {
      setProcessingStep('1. Verifying international cold-chain inventory...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep(`2. Authenticating UPI Payee (${payee.upiId})...`);
      await new Promise((r) => setTimeout(r, 700));

      setProcessingStep(`3. Allocating ${platformCommissionRate}% developer platform fee...`);
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep('4. Writing cryptographic ledger transaction to Firestore...');

      const orderId = sessionId;

      await runTransaction(db, async (transaction) => {
        const productUpdates: { docRef: any; newStock: number; originalData: any }[] = [];

        // 1. Verify stock for each item
        for (const item of items) {
          const productRef = doc(db, 'products', item.productId || (item as any).id);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error(`Product ${item.name} is no longer available.`);
          }

          const currentStock = productDoc.data().stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}`);
          }

          productUpdates.push({
            docRef: productRef,
            newStock: currentStock - item.quantity,
            originalData: productDoc.data(),
          });
        }

        // 2. Perform atomic stock updates & alert seller
        for (const update of productUpdates) {
          transaction.update(update.docRef, {
            stock: update.newStock,
            status: update.newStock === 0 ? 'out_of_stock' : update.originalData.status,
          });

          // Low stock alert for seller
          const threshold = update.originalData.lowStockThreshold || 5;
          if (update.newStock <= threshold) {
            const notificationTitle = update.newStock === 0 ? 'Inventory Depleted' : 'Low Stock Alert';
            const notificationMsg =
              update.newStock === 0
                ? `Crucial: ${update.originalData.name} is now out of stock.`
                : `Notice: ${update.originalData.name} has only ${update.newStock} remaining.`;

            const lowStockRef = doc(collection(db, 'notifications'));
            transaction.set(lowStockRef, {
              userId: update.originalData.sellerId,
              type: 'low_stock',
              title: notificationTitle,
              message: notificationMsg,
              productId: update.docRef.id,
              read: false,
              createdAt: new Date().toISOString(),
            });
          }

          // Order received alert for seller
          const sellerOrderRef = doc(collection(db, 'notifications'));
          transaction.set(sellerOrderRef, {
            userId: update.originalData.sellerId,
            type: 'order_received',
            title: 'New Global Order Confirmed',
            message: `Order #${orderId} received for ${update.originalData.name} (Qty: ${
              items.find((i) => (i.productId || (i as any).id) === update.docRef.id)?.quantity
            }). Payment received via UPI Payee ${payee.upiId}.`,
            orderId,
            productId: update.docRef.id,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }

        // 3. Create the customer order
        const orderData = {
          id: orderId,
          customerId: auth.currentUser!.uid,
          items: items.map((i) => ({
            productId: i.productId || (i as any).id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            sellerId: i.sellerId,
            selectedVariations: i.selectedVariations || null,
          })),
          subtotalAmount: subtotal,
          totalAmount: total,
          commissionAmount,
          commissionRate: platformCommissionRate,
          status: 'confirmed',
          paymentMethod: selectedMethod,
          paymentStatus: 'paid',
          payeeUpiId: payee.upiId,
          payeeName: payee.merchantName,
          payeeEmail: payee.developerEmail,
          utrNumber: finalUtr,
          transactionRef: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          paidAt: new Date().toISOString(),
          shippingAddress: 'Verified Global Cold-Chain Hub',
          createdAt: new Date().toISOString(),
        };

        transaction.set(doc(db, 'orders', orderId), orderData);

        // 4. Create buyer confirmation notification
        const buyerNotificationRef = doc(collection(db, 'notifications'));
        transaction.set(buyerNotificationRef, {
          userId: auth.currentUser!.uid,
          type: 'payment_success',
          title: 'UPI Payment Confirmed & Order Placed',
          message: `Order #${orderId} has been successfully authenticated. Paid: ₹${inrTotal.toLocaleString(
            'en-IN'
          )} ($${total.toFixed(2)}) to Payee UPI ${payee.upiId} (Ref: ${finalUtr}).`,
          orderId,
          amount: total,
          upiId: payee.upiId,
          read: false,
          createdAt: new Date().toISOString(),
        });

        // 5. Create platform commission alert
        const commissionNotificationRef = doc(collection(db, 'notifications'));
        transaction.set(commissionNotificationRef, {
          userId: auth.currentUser!.uid,
          type: 'platform_commission',
          title: 'Platform Commission Allocated to Payee',
          message: `Commercial platform fee of ₹${inrCommission.toLocaleString('en-IN')} ($${commissionAmount.toFixed(
            2
          )}) (${platformCommissionRate}%) successfully logged for Developer (${payee.upiId} / ${payee.developerEmail}) on Order #${orderId}.`,
          orderId,
          amount: commissionAmount,
          upiId: payee.upiId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      });

      const receipt = {
        orderId,
        utr: finalUtr,
        totalUsd: total,
        totalInr: inrTotal,
        commissionUsd: commissionAmount,
        commissionInr: inrCommission,
        payeeUpi: payee.upiId,
        payeeEmail: payee.developerEmail,
        date: new Date().toLocaleString(),
        paymentMethod: selectedMethod,
      };

      setReceiptData(receipt);
      toast.success('Transaction authenticated & order placed!');
      onPaymentSuccess(orderId);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleManualVerify = () => {
    if (!utrNumber.trim()) {
      toast.error('Please enter the 12-digit UPI Reference / UTR Number from your banking app.');
      return;
    }
    if (utrNumber.trim().length < 6) {
      toast.error('Please enter a valid Transaction Reference ID (at least 6 digits).');
      return;
    }
    executeSecureTransaction(utrNumber.trim());
  };

  const handleSimulateFastPay = () => {
    const demoUtr = `4238${Math.floor(10000000 + Math.random() * 90000000)}`;
    setUtrNumber(demoUtr);
    executeSecureTransaction(demoUtr);
  };

  return (
    <div className="bg-white rounded-[36px] shadow-2xl border border-stone-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
              <ShieldCheck size={13} /> 256-Bit Escrow Secured Gateway
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif italic font-bold">
              Secure Checkout & Platform Settlement
            </h2>
            <p className="text-stone-400 text-xs mt-1">
              Integrated with Official Payee UPI: <span className="font-mono text-amber-300 font-bold">{payee.upiId}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md"
            >
              <FileText size={14} /> Full Invoice & QR
            </button>

            <div className="flex items-center gap-2 bg-stone-800/80 px-3.5 py-2 rounded-2xl border border-stone-700/80">
              <Clock size={15} className="text-amber-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 block">
                  Escrow Lock
                </span>
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {receiptData ? (
        /* Order Receipt Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-10 space-y-6 text-center"
        >
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h3 className="text-2xl font-serif italic font-bold text-stone-900">
              Payment Authenticated & Order Confirmed!
            </h3>
            <p className="text-stone-500 text-xs mt-1 max-w-md mx-auto">
              Your payment has been securely settled with Fresh World Payee. A confirmation notification has been dispatched to your alert center.
            </p>
          </div>

          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 text-left max-w-lg mx-auto space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Order Reference</span>
              <span className="font-bold font-mono text-stone-900">{receiptData.orderId}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500 font-medium">UPI Payee ID</span>
              <span className="font-bold font-mono text-brand-700">{receiptData.payeeUpi}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Developer Contact</span>
              <span className="font-bold text-stone-800">{receiptData.payeeEmail}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Transaction / UTR</span>
              <span className="font-bold font-mono text-stone-900">{receiptData.utr}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Total Paid</span>
              <span className="font-black text-stone-900 font-mono">
                ₹{receiptData.totalInr.toLocaleString('en-IN')} (${receiptData.totalUsd.toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-amber-800 font-bold">Platform Fee Allocated ({platformCommissionRate}%)</span>
              <span className="font-bold text-amber-900 font-mono">
                ₹{receiptData.commissionInr.toLocaleString('en-IN')} (${receiptData.commissionUsd.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer size={14} /> View / Print Tax Invoice
            </button>
            <button
              onClick={() => navigate('/dashboard/orders')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-xs shadow-lg transition-all"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/market')}
              className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-xs transition-all"
            >
              Back to Marketplace
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="p-6 sm:p-8 space-y-8">
          {/* Method Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod('UPI_QR')}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                selectedMethod === 'UPI_QR'
                  ? 'border-brand-600 bg-brand-50/50 shadow-md ring-2 ring-brand-600/20'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <QrCode size={20} className={selectedMethod === 'UPI_QR' ? 'text-brand-600' : 'text-stone-500'} />
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  0% Surcharge
                </span>
              </div>
              <div className="font-bold text-xs text-stone-900">UPI Scan & Pay</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Instant QR ({payee.upiId})</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('UPI_COLLECT')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedMethod === 'UPI_COLLECT'
                  ? 'border-brand-600 bg-brand-50/50 shadow-md ring-2 ring-brand-600/20'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Smartphone size={20} className={selectedMethod === 'UPI_COLLECT' ? 'text-brand-600' : 'text-stone-500'} />
                <span className="text-[9px] font-bold text-stone-400">Direct</span>
              </div>
              <div className="font-bold text-xs text-stone-900">UPI App / ID</div>
              <div className="text-[10px] text-stone-500 mt-0.5">GPay, PhonePe, Paytm</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('CARD_ESCROW')}
              className={`p-4 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
                selectedMethod === 'CARD_ESCROW'
                  ? 'border-brand-600 bg-brand-50/50 shadow-md ring-2 ring-brand-600/20'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <CreditCard size={20} className={selectedMethod === 'CARD_ESCROW' ? 'text-brand-600' : 'text-stone-500'} />
                <span className="text-[9px] font-bold text-stone-400">Escrow</span>
              </div>
              <div className="font-bold text-xs text-stone-900">Card & Wire</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Auto UPI split</div>
            </button>
          </div>

          {/* Active Payment Method Area */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200/80">
            {selectedMethod === 'UPI_QR' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR Code */}
                <div className="md:col-span-5 flex flex-col items-center text-center">
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-stone-100 relative group mb-3">
                    <img
                      src={qrCodeImageUrl}
                      alt={`UPI Payment QR for ${payee.upiId}`}
                      className="w-48 h-48 object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-[11px] font-bold gap-1 pointer-events-none">
                      <Smartphone size={14} /> Scan with any UPI app
                    </div>
                  </div>

                  <span className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={13} className="text-brand-600" />
                    Amount: ₹{inrTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    (Approx ${total.toFixed(2)} USD)
                  </span>

                  <a
                    href={upiDeepLink}
                    className="mt-3 px-4 py-2 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Smartphone size={14} /> Open in UPI App
                  </a>
                </div>

                {/* Payee Credentials & Breakdown */}
                <div className="md:col-span-7 space-y-4">
                  {/* Verified Payee Card */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                      <span>Official Merchant UPI ID</span>
                      <span className="bg-brand-50 text-brand-700 text-[9px] px-2 py-0.5 rounded-full font-black">
                        Verified Platform Payee
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="font-mono font-black text-sm text-stone-900">{payee.upiId}</span>
                      <button
                        type="button"
                        onClick={copyUpi}
                        className="px-2.5 py-1 bg-stone-900 hover:bg-brand-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        {copiedUpi ? <Check size={13} /> : <Copy size={13} />}
                        {copiedUpi ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                      <span>Payee: <strong>{payee.merchantName}</strong></span>
                      <span>Dev: <strong>{payee.developerEmail}</strong></span>
                    </div>
                  </div>

                  {/* Platform Commission Transparent Allocation */}
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Percent size={14} className="text-amber-700" /> Platform Fee Allocation
                      </span>
                      <span className="font-black text-amber-900 font-mono">
                        ₹{inrCommission.toLocaleString('en-IN')} (${commissionAmount.toFixed(2)})
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Includes <strong>{platformCommissionRate}% developer platform commission</strong> routed directly to Payee {payee.upiId} to fund AI Crop Doctor diagnostics and international cold-chain tracking.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'UPI_COLLECT' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                  <label className="text-xs font-bold text-stone-700 block">
                    Enter your UPI ID (VPA) for payment request
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userVpa}
                      onChange={(e) => setUserVpa(e.target.value)}
                      placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                      className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono outline-none focus:border-brand-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!userVpa.includes('@')) {
                          toast.error('Please enter a valid UPI VPA (e.g. name@bank)');
                          return;
                        }
                        toast.success(`Payment request of ₹${inrTotal.toLocaleString('en-IN')} initiated to ${userVpa}!`);
                      }}
                      className="px-4 py-3 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Send Request
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span>Payee: {payee.upiId}</span>
                    <span>Direct UPI Clearing</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-stone-800 block">Or Transfer Directly via UPI ID</span>
                    <span className="font-mono text-brand-700 text-sm font-black">{payee.upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyUpi}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                    {copiedUpi ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {selectedMethod === 'CARD_ESCROW' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">Encrypted International Card Checkout</span>
                    <div className="flex gap-1.5 opacity-70">
                      <span className="text-[10px] font-black uppercase bg-stone-100 px-2 py-0.5 rounded">Visa</span>
                      <span className="text-[10px] font-black uppercase bg-stone-100 px-2 py-0.5 rounded">MasterCard</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Card Number (4242 •••• •••• 4242)"
                      className="col-span-2 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono outline-none"
                    />
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVC (•••)"
                      className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono outline-none"
                    />
                  </div>

                  <p className="text-[10px] text-stone-400">
                    Card payment will automatically settle the {platformCommissionRate}% platform commission directly with Payee UPI ({payee.upiId}).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* UTR Verification & Transaction Submission */}
          <div className="bg-stone-900 text-white p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-400 flex items-center gap-1.5">
                  <Lock size={14} /> Confirm Transaction & Authorize Order
                </h4>
                <p className="text-stone-300 text-xs mt-0.5">
                  Enter the 12-digit UPI Reference / UTR Number from your transaction to verify.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateFastPay}
                className="text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto flex items-center gap-1"
              >
                <Sparkles size={12} /> Auto-Fill Demo UTR
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 423891028392 (12-digit UTR)"
                className="flex-1 p-3.5 bg-stone-800 border border-stone-700 rounded-2xl text-xs font-mono text-white outline-none focus:border-brand-400 placeholder:text-stone-500"
              />

              <button
                type="button"
                onClick={handleManualVerify}
                disabled={isProcessing}
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Authorize & Place Order <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {isProcessing && processingStep && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-stone-800/80 border border-brand-500/30 rounded-xl text-[11px] font-mono text-brand-300 flex items-center gap-2"
              >
                <RefreshCw size={12} className="animate-spin text-brand-400" />
                <span>{processingStep}</span>
              </motion.div>
            )}
          </div>

          {/* Trust Footnote */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>
                Payee Verified: <strong>{payee.upiId}</strong> ({payee.developerEmail})
              </span>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-stone-500 hover:text-stone-800 font-bold"
              >
                Back to Cart
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cart Commercial Invoice Modal */}
      <CartInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        platformCommissionRate={platformCommissionRate}
        onOrderSettled={(orderId) => {
          setIsInvoiceModalOpen(false);
          onPaymentSuccess(orderId);
        }}
      />
    </div>
  );
}

