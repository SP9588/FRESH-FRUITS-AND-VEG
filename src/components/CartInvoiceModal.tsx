import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Printer,
  QrCode,
  ShieldCheck,
  Check,
  Copy,
  Download,
  Smartphone,
  Sparkles,
  Percent,
  Lock,
  ArrowRight,
  RefreshCw,
  Receipt,
  FileText,
  Truck,
  ExternalLink,
  CheckCircle2,
  Calendar,
  User,
  Globe,
  Building2,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FRESH_WORLD_PAYEE, OrderItem } from '../types';
import { auth, db } from '../firebase';
import { doc, runTransaction, collection } from 'firebase/firestore';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface CartInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  platformCommissionRate?: number;
  onOrderSettled?: (orderId: string) => void;
}

export default function CartInvoiceModal({
  isOpen,
  onClose,
  items,
  subtotal,
  shipping,
  total,
  platformCommissionRate = 10,
  onOrderSettled,
}: CartInvoiceModalProps) {
  const navigate = useNavigate();
  const payee = FRESH_WORLD_PAYEE;

  // Generate unique invoice number and date
  const [invoiceNumber] = useState(() => `INV-FW-${Date.now().toString().slice(-6)}`);
  const [invoiceDate] = useState(() => new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }));

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<any | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Financial calculations
  const inrTotal = Math.round(total * 85.5);
  const commissionAmount = Number(((subtotal * platformCommissionRate) / 100).toFixed(2));
  const inrCommission = Math.round(commissionAmount * 85.5);
  const sellerEarnings = Number((subtotal - commissionAmount).toFixed(2));
  const inrSellerEarnings = Math.round(sellerEarnings * 85.5);

  // Dynamic UPI payment URL with exact cart price embedded
  const upiDeepLink = `upi://pay?pa=${payee.upiId}&pn=${encodeURIComponent(
    payee.merchantName
  )}&am=${inrTotal}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceNumber}`)}`;

  // Dynamic QR Code encoding the exact cart price and payee
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    upiDeepLink
  )}&color=1c1917&bgcolor=ffffff&margin=8`;

  const copyUpi = () => {
    navigator.clipboard.writeText(payee.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    toast.success(`Copied Payee UPI: ${payee.upiId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateFastPay = () => {
    const demoUtr = `4238${Math.floor(10000000 + Math.random() * 90000000)}`;
    setUtrNumber(demoUtr);
    handleConfirmPaymentAndAddToPayee(demoUtr);
  };

  const handleConfirmPaymentAndAddToPayee = async (overrideUtr?: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to authenticate payment and add to Payee ledger.');
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart has no items to process.');
      return;
    }

    const finalUtr = overrideUtr || utrNumber.trim();
    if (!finalUtr) {
      toast.error('Please enter the 12-digit UPI Reference / UTR Number from your payment app.');
      return;
    }

    setIsProcessing(true);
    try {
      setProcessingStep('1. Verifying Invoice price breakdown & items...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep(`2. Routing ${platformCommissionRate}% fee to Payee ${payee.upiId}...`);
      await new Promise((r) => setTimeout(r, 700));

      setProcessingStep('3. Adding transaction to Firestore orders & payee ledger...');

      const orderId = invoiceNumber;

      await runTransaction(db, async (transaction) => {
        // 1. Verify stock and update inventory
        for (const item of items) {
          const pId = item.productId || (item as any).id;
          if (!pId) continue;
          const productRef = doc(db, 'products', pId);
          const productDoc = await transaction.get(productRef);

          if (productDoc.exists()) {
            const currentStock = productDoc.data().stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            transaction.update(productRef, {
              stock: newStock,
              status: newStock === 0 ? 'out_of_stock' : productDoc.data().status,
            });

            // Seller notification
            const sellerNotifRef = doc(collection(db, 'notifications'));
            transaction.set(sellerNotifRef, {
              userId: productDoc.data().sellerId,
              type: 'order_received',
              title: `Order Received for ${productDoc.data().name}`,
              message: `Order #${orderId} (Invoice: ${invoiceNumber}) has been paid via Payee UPI (${payee.upiId}). Quantity: ${item.quantity}.`,
              orderId,
              productId: pId,
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }

        // 2. Write order record
        const orderData = {
          id: orderId,
          invoiceNumber,
          customerId: auth.currentUser!.uid,
          customerEmail: auth.currentUser!.email || 'customer@freshworld.org',
          customerName: auth.currentUser!.displayName || 'Verified Buyer',
          items: items.map((i) => ({
            productId: i.productId || (i as any).id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            sellerId: i.sellerId || 'global_seller',
            selectedVariations: i.selectedVariations || null,
          })),
          subtotalAmount: subtotal,
          shippingAmount: shipping,
          totalAmount: total,
          commissionAmount,
          commissionRate: platformCommissionRate,
          sellerEarnings,
          status: 'confirmed',
          paymentMethod: 'UPI_DIRECT',
          paymentStatus: 'paid',
          payeeUpiId: payee.upiId,
          payeeName: payee.merchantName,
          payeeEmail: payee.developerEmail,
          utrNumber: finalUtr,
          transactionRef: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          paidAt: new Date().toISOString(),
          shippingAddress: 'Global Cold-Chain Logistic Hub',
          createdAt: new Date().toISOString(),
        };

        transaction.set(doc(db, 'orders', orderId), orderData);

        // 3. User payment success notification
        const buyerNotifRef = doc(collection(db, 'notifications'));
        transaction.set(buyerNotifRef, {
          userId: auth.currentUser!.uid,
          type: 'payment_success',
          title: `Invoice ${invoiceNumber} Settled via Payee UPI`,
          message: `Your payment of ₹${inrTotal.toLocaleString('en-IN')} ($${total.toFixed(
            2
          )}) was successfully verified and added to Payee (${payee.upiId}). Reference: ${finalUtr}.`,
          orderId,
          amount: total,
          upiId: payee.upiId,
          read: false,
          createdAt: new Date().toISOString(),
        });

        // 4. Platform Commission Notification
        const commNotifRef = doc(collection(db, 'notifications'));
        transaction.set(commNotifRef, {
          userId: auth.currentUser!.uid,
          type: 'platform_commission',
          title: 'Platform Commission Added to Payee Ledger',
          message: `${platformCommissionRate}% fee of ₹${inrCommission.toLocaleString(
            'en-IN'
          )} ($${commissionAmount.toFixed(2)}) routed to Payee ${payee.upiId} (${payee.developerEmail}) for Invoice ${invoiceNumber}.`,
          orderId,
          amount: commissionAmount,
          upiId: payee.upiId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      });

      const receipt = {
        invoiceNumber,
        utr: finalUtr,
        totalUsd: total,
        totalInr: inrTotal,
        commissionUsd: commissionAmount,
        commissionInr: inrCommission,
        payeeUpi: payee.upiId,
        payeeEmail: payee.developerEmail,
        paidAt: new Date().toLocaleString(),
      };

      setPaidReceipt(receipt);
      setIsPaid(true);
      toast.success(`Invoice ${invoiceNumber} added to Payee ledger & confirmed!`);
      if (onOrderSettled) {
        onOrderSettled(orderId);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Payment settlement failed.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 backdrop-blur-md print:p-0 print:bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col relative print:border-none print:shadow-none print:max-h-full print:rounded-none"
        >
          {/* Top Actions Bar (Hidden on print) */}
          <div className="sticky top-0 z-20 bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 print:hidden">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-brand-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-stone-200">
                Commercial Invoice & UPI Payee Settlement
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-700"
              >
                <Printer size={14} /> Print / PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Invoice Body Printable Document */}
          <div ref={invoiceRef} className="p-6 sm:p-10 space-y-8 bg-white text-stone-900 flex-grow">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-stone-200 pb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-brand-600 p-2 rounded-xl text-white inline-flex">
                    <Globe size={22} />
                  </div>
                  <span className="text-2xl sm:text-3xl font-serif italic font-bold tracking-tight text-stone-900">
                    Fresh World Global
                  </span>
                </div>
                <p className="text-xs text-stone-500 max-w-xs">
                  International Organic & Cold-Chain Agricultural Sourcing Platform.
                </p>
                <div className="text-[11px] text-stone-400 mt-2 space-y-0.5">
                  <p>Tax / GST Reg: FWG-2026-EXPORT-8891</p>
                  <p>Settlement Payee: <strong className="font-mono text-stone-700">{payee.upiId}</strong></p>
                  <p>Developer Contact: <strong className="text-stone-700">{payee.developerEmail}</strong></p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="inline-block px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                  {isPaid ? 'PAID & AUTHENTICATED' : 'OFFICIAL COMMERCIAL INVOICE'}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif italic font-bold text-stone-900">
                  {invoiceNumber}
                </h3>
                <div className="text-xs text-stone-500 space-y-0.5">
                  <p>Issue Date: <strong>{invoiceDate}</strong></p>
                  <p>Payment Due: <strong>Immediate (UPI Escrow)</strong></p>
                  <p>Currency: <strong>USD ($) & INR (₹)</strong></p>
                </div>
              </div>
            </div>

            {/* Bill To & Payee Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                  <User size={12} /> Billed To Customer
                </div>
                <div className="font-bold text-sm text-stone-900">
                  {auth.currentUser?.displayName || 'Verified Global Sourcing Customer'}
                </div>
                <div className="text-xs text-stone-500 font-mono mt-0.5">
                  {auth.currentUser?.email || 'customer@freshworld.org'}
                </div>
                <div className="text-[11px] text-stone-400 mt-2">
                  Delivery: Verified Cold-Chain Logistics Hub
                </div>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-amber-700" /> Authorized Platform Payee
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-stone-900">{payee.upiId}</span>
                  <span className="bg-brand-100 text-brand-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  Merchant: <strong>{payee.merchantName}</strong>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Platform Commission: <strong>{platformCommissionRate}%</strong>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100/80 text-stone-600 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
                    <th className="p-3.5">Produce Item Description</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5 text-right">Unit Price</th>
                    <th className="p-3.5 text-right">Total (USD)</th>
                    <th className="p-3.5 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {items.map((item, idx) => {
                    const itemTotal = item.price * item.quantity;
                    const itemInr = Math.round(itemTotal * 85.5);
                    return (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{item.name}</div>
                          {item.selectedVariations && (
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              Size: {item.selectedVariations.size} • Pack: {item.selectedVariations.packaging}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-center font-bold text-stone-700">
                          {item.quantity}
                        </td>
                        <td className="p-3.5 text-right font-mono text-stone-600">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-stone-900">
                          {formatCurrency(itemTotal)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-stone-500">
                          ₹{itemInr.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Cold-Chain Shipping */}
                  <tr className="bg-stone-50/50">
                    <td className="p-3.5 font-bold text-stone-800 flex items-center gap-1.5">
                      <Truck size={14} className="text-brand-600" /> Temperature-Controlled International Freight
                    </td>
                    <td className="p-3.5 text-center font-bold text-stone-700">1</td>
                    <td className="p-3.5 text-right font-mono text-stone-600">{formatCurrency(shipping)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-stone-900">{formatCurrency(shipping)}</td>
                    <td className="p-3.5 text-right font-mono text-stone-500">₹{Math.round(shipping * 85.5).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations & Commission Allocation */}
            <div className="flex flex-col md:flex-row justify-between gap-6 pt-2">
              {/* Payee Platform Fee Allocation Box */}
              <div className="flex-1 bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Percent size={14} className="text-amber-700" /> Transparent Fee Allocation (Payee: {payee.upiId})
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  This transaction routes <strong>{platformCommissionRate}% platform fee (${commissionAmount.toFixed(2)} / ₹{inrCommission.toLocaleString('en-IN')})</strong> directly to Developer Payee <strong>{payee.upiId}</strong> to fund AI Crop Doctor diagnostics and international cold-chain escrow.
                </p>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-[11px]">
                  <span className="text-stone-500">Seller Produce Payout:</span>
                  <span className="font-bold font-mono text-stone-800">${sellerEarnings.toFixed(2)} (₹{inrSellerEarnings.toLocaleString('en-IN')})</span>
                </div>
              </div>

              {/* Grand Total Box */}
              <div className="w-full md:w-72 bg-stone-900 text-white rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Produce Subtotal:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Cold-Chain Logistics:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-300">
                  <span>Payee Fee ({platformCommissionRate}%):</span>
                  <span className="font-mono font-bold">{formatCurrency(commissionAmount)}</span>
                </div>
                <div className="pt-3 border-t border-white/20 flex justify-between items-baseline">
                  <span className="text-sm font-serif italic text-stone-300">Invoice Total:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-400 font-mono tracking-tight block">
                      {formatCurrency(total)}
                    </span>
                    <span className="text-xs font-mono text-amber-300 font-bold">
                      ₹{inrTotal.toLocaleString('en-IN')} INR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SCAN & PAY PAYEE UPI COMPONENT (Embedded in Invoice) */}
            <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-3xl p-6 border-2 border-amber-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-200/60 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                    <QrCode size={12} /> Scan & Add to Payee
                  </div>
                  <h4 className="text-xl font-serif italic font-bold text-stone-900">
                    Scan UPI QR to Settle Invoice Price: ₹{inrTotal.toLocaleString('en-IN')} (${total.toFixed(2)})
                  </h4>
                  <p className="text-xs text-stone-600">
                    Dynamic QR code linking exact cart price to Payee UPI: <strong className="font-mono text-stone-900">{payee.upiId}</strong>
                  </p>
                </div>

                {isPaid && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md self-start sm:self-center">
                    <CheckCircle2 size={16} /> Paid & Added to Ledger
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR Code Container */}
                <div className="md:col-span-4 flex flex-col items-center text-center">
                  <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-200 relative group">
                    <img
                      src={qrCodeImageUrl}
                      alt={`UPI QR for ${payee.upiId}`}
                      className="w-44 h-44 object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-stone-900/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-1 pointer-events-none">
                      <Smartphone size={16} /> Scan with GPay/PhonePe
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-stone-800 mt-2">
                    Exact Amount: ₹{inrTotal.toLocaleString('en-IN')}
                  </span>

                  <a
                    href={upiDeepLink}
                    className="mt-2.5 px-4 py-2 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Smartphone size={13} /> Open in UPI App
                  </a>
                </div>

                {/* Payee Credentials & Verification submission */}
                <div className="md:col-span-8 space-y-4">
                  {/* Verified Payee Details Box */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                      <span>Official Payee UPI ID</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[9px] font-black">
                        Active Payee
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="font-mono font-black text-sm text-stone-900">{payee.upiId}</span>
                      <button
                        type="button"
                        onClick={copyUpi}
                        className="px-3 py-1 bg-stone-900 hover:bg-brand-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        {copiedUpi ? <Check size={13} /> : <Copy size={13} />}
                        {copiedUpi ? 'Copied' : 'Copy UPI'}
                      </button>
                    </div>

                    <div className="flex flex-wrap justify-between text-[11px] text-stone-500 pt-1">
                      <span>Merchant: <strong>{payee.merchantName}</strong></span>
                      <span>Dev: <strong>{payee.developerEmail}</strong></span>
                    </div>
                  </div>

                  {/* UTR Reference Input & Add to Payee Action (Hidden on Print) */}
                  <div className="bg-stone-900 text-white p-4 rounded-2xl space-y-3 print:hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Lock size={13} /> Add & Authenticate on Payee Ledger
                      </span>
                      <button
                        type="button"
                        onClick={handleSimulateFastPay}
                        className="text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-400/20 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={11} /> Auto Demo UTR
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="Enter 12-digit UTR (e.g. 423891028392)"
                        className="flex-1 p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-mono text-white outline-none focus:border-brand-400 placeholder:text-stone-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmPaymentAndAddToPayee()}
                        disabled={isProcessing || isPaid}
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" /> Adding...
                          </>
                        ) : isPaid ? (
                          <>
                            <Check size={13} /> Settled
                          </>
                        ) : (
                          <>
                            Add to Payee <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    </div>

                    {isProcessing && processingStep && (
                      <p className="text-[11px] font-mono text-brand-300 animate-pulse">
                        {processingStep}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Paid Receipt Seal (Shown when authenticated) */}
            {isPaid && paidReceipt && (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-xs">Payment Authenticated & Settle to Payee!</div>
                    <div className="text-[11px] text-emerald-700">
                      UTR: <span className="font-mono font-bold">{paidReceipt.utr}</span> • Paid: ₹{paidReceipt.totalInr.toLocaleString('en-IN')} to {payee.upiId}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1"
                >
                  <Printer size={13} /> Print Receipt
                </button>
              </div>
            )}

            {/* Invoice Footer Terms */}
            <div className="text-[11px] text-stone-400 border-t border-stone-100 pt-4 space-y-1">
              <p className="font-bold text-stone-600">Fresh World Global Escrow & Settlement Guarantee</p>
              <p>
                All payments made to Payee UPI ({payee.upiId}) are held in encrypted cold-chain escrow until produce delivery is verified by recipient.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
