import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Copy,
  Check,
  Mail,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Percent,
  X,
  CreditCard,
  Send,
  HelpCircle,
  ExternalLink,
  Award,
  BellRing
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FRESH_WORLD_PAYEE } from '../types';
import { notificationService } from '../services/notificationService';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

interface PayeeCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customAmount?: number;
  orderId?: string;
}

export default function PayeeCommissionModal({
  isOpen,
  onClose,
  customAmount,
  orderId,
}: PayeeCommissionModalProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [calcAmount, setCalcAmount] = useState<number>(customAmount !== undefined ? customAmount : 0);
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<any | null>(null);

  const payee = FRESH_WORLD_PAYEE;
  const calculatedCommission = Number(
    ((calcAmount * payee.commissionRate) / 100).toFixed(2)
  );

  // Generate UPI QR Code URL
  const qrAmount = customAmount ? `&am=${customAmount}` : '';
  const upiDeepLink = `${payee.upiQrUrl}${qrAmount}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    upiDeepLink
  )}&color=1c1917&bgcolor=ffffff&margin=10`;

  const copyToClipboard = (text: string, type: 'upi' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
      toast.success('UPI ID copied to clipboard!');
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success('Developer email copied to clipboard!');
    }
  };

  const handleVerifyPayment = async () => {
    if (!utrNumber.trim()) {
      toast.error('Please enter the 12-digit UPI Reference / UTR Number.');
      return;
    }
    if (utrNumber.trim().length < 6) {
      toast.error('Please enter a valid Transaction Reference ID.');
      return;
    }

    setIsSubmittingUtr(true);
    try {
      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const receipt = {
        receiptId: `FW-REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        amount: customAmount || calcAmount,
        commission: calculatedCommission,
        upiId: payee.upiId,
        developerEmail: payee.developerEmail,
        utr: utrNumber.trim(),
        date: new Date().toLocaleString(),
        status: 'AUTHENTICATED',
      };

      setSubmittedReceipt(receipt);

      // Dispatch real notification to user's notifications center if logged in
      if (auth.currentUser?.uid) {
        await notificationService.sendPaymentSuccessAlert(
          auth.currentUser.uid,
          receipt.amount,
          receipt.utr
        );
        await notificationService.sendPlatformCommissionAlert(
          auth.currentUser.uid,
          receipt.commission,
          orderId || receipt.receiptId
        );
      }

      toast.success('Payee settlement successfully logged and verified!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit verification.');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-[36px] shadow-2xl border border-stone-200 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="bg-stone-900 text-white p-6 sm:p-8 flex items-start justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                <Sparkles size={12} /> Official Platform Commercial Gateway
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif italic font-bold">
                {payee.platformName} Payee & Commission Hub
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-lg">
                Official payee credentials for platform usage fees, developer commercial commission, and direct UPI settlements.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Background flourish */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-8">
            {submittedReceipt ? (
              /* Receipt View */
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-2xl font-serif italic font-bold text-stone-900">
                  Payment & Commission Verified
                </h3>
                <p className="text-stone-600 text-xs max-w-md mx-auto">
                  Your settlement has been recorded in the Fresh World ledger. A confirmation alert has also been sent to your Notification Center.
                </p>

                <div className="bg-white rounded-2xl p-5 border border-emerald-100 text-left space-y-2 text-xs">
                  <div className="flex justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium">Receipt ID</span>
                    <span className="font-bold text-stone-900">{submittedReceipt.receiptId}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium">Payee UPI ID</span>
                    <span className="font-mono font-bold text-brand-700">{submittedReceipt.upiId}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium">Developer Email</span>
                    <span className="font-bold text-stone-900">{submittedReceipt.developerEmail}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium">Reference / UTR</span>
                    <span className="font-mono font-bold text-stone-900">{submittedReceipt.utr}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-black text-sm text-stone-900">
                    <span>Platform Commission Allocation</span>
                    <span className="text-emerald-700">₹{submittedReceipt.commission} ({payee.commissionRate}%)</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmittedReceipt(null);
                      setUtrNumber('');
                    }}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
                  >
                    Make Another Payment
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Payee Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* QR Code Container */}
                  <div className="flex flex-col items-center bg-stone-50 p-6 rounded-3xl border border-stone-200/80 text-center">
                    <div className="relative p-3 bg-white rounded-2xl shadow-md border border-stone-100 mb-4 group">
                      <img
                        src={qrCodeImageUrl}
                        alt={`UPI QR Code for ${payee.upiId}`}
                        className="w-52 h-52 object-contain rounded-xl"
                      />
                      <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-1 pointer-events-none">
                        <Smartphone size={16} /> Scan via any UPI App
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                      <QrCode size={16} className="text-brand-600" />
                      Scan to Pay Developer Payee
                    </div>
                    <p className="text-[11px] text-stone-400 font-medium">
                      Supports GPay, PhonePe, Paytm, BHIM & all UPI apps
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <a
                        href={upiDeepLink}
                        className="px-4 py-2 bg-stone-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Smartphone size={14} /> Open UPI App
                      </a>
                    </div>
                  </div>

                  {/* Payee Credentials Cards */}
                  <div className="space-y-4">
                    {/* Payee UPI Box */}
                    <div className="bg-white p-5 rounded-3xl border-2 border-brand-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-400 font-bold uppercase tracking-wider">
                        <span>Official Payee UPI ID</span>
                        <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-black">
                          Verified Payee
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200">
                        <span className="font-mono font-black text-base text-stone-900 tracking-tight">
                          {payee.upiId}
                        </span>
                        <button
                          onClick={() => copyToClipboard(payee.upiId, 'upi')}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                          {copiedUpi ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium">
                        Payee Name: <strong className="text-stone-800">{payee.merchantName}</strong>
                      </p>
                    </div>

                    {/* Developer Email Box */}
                    <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-400 font-bold uppercase tracking-wider">
                        <span>Published Developer Email</span>
                        <Mail size={14} className="text-stone-400" />
                      </div>
                      <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200">
                        <span className="font-mono font-bold text-xs sm:text-sm text-stone-900 truncate mr-2">
                          {payee.developerEmail}
                        </span>
                        <button
                          onClick={() => copyToClipboard(payee.developerEmail, 'email')}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all flex-shrink-0"
                        >
                          {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                          {copiedEmail ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={`mailto:${payee.developerEmail}?subject=Fresh%20World%20Commercial%20Platform%20Inquiry`}
                          className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <Send size={12} /> Contact Developer directly
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commercial Commission Architecture */}
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-100 text-brand-700 rounded-xl">
                      <Percent size={18} />
                    </div>
                    <div>
                      <h4 className="text-base font-serif italic font-bold text-stone-900">
                        Commercial Platform Commission Model ({payee.commissionRate}%)
                      </h4>
                      <p className="text-xs text-stone-500 font-medium">
                        How Fresh World earns revenue to maintain high-performance global operations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-4 rounded-2xl border border-stone-100">
                      <div className="font-black text-stone-900 mb-1">1. Developer Support</div>
                      <p className="text-stone-500 text-[11px] leading-relaxed">
                        Funds continuous AI Crop Doctor fine-tuning, security audits, and real-time performance.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-stone-100">
                      <div className="font-black text-stone-900 mb-1">2. Cold-Chain Routing</div>
                      <p className="text-stone-500 text-[11px] leading-relaxed">
                        Powers automated refrigerated logistics matching and GPS temperature monitors.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-stone-100">
                      <div className="font-black text-stone-900 mb-1">3. Escrow Security</div>
                      <p className="text-stone-500 text-[11px] leading-relaxed">
                        Ensures buyer payment protection until farm-fresh goods pass quality inspection.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Calculator */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-100 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                      Commission Calculator
                    </span>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Order / Transaction Value (INR ₹)
                        </label>
                        <input
                          type="number"
                          value={calcAmount}
                          onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 outline-none focus:border-brand-600"
                        />
                      </div>
                      <div className="w-full sm:w-auto p-4 bg-brand-50 rounded-2xl border border-brand-100 text-center sm:text-right">
                        <span className="text-[10px] font-bold text-brand-800 uppercase block">
                          Developer Platform Slice ({payee.commissionRate}%)
                        </span>
                        <span className="text-2xl font-black text-brand-900 font-mono">
                          ₹{calculatedCommission}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Reference / UTR Number for Instant Notification */}
                <div className="bg-stone-900 text-white p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2">
                    <BellRing size={18} className="text-brand-400" />
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider">
                        Confirm UPI Settlement & Dispatch Notification
                      </h4>
                      <p className="text-stone-400 text-xs">
                        Enter your 12-digit UPI Reference / UTR number after scanning the QR code.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 423589123456 (12-digit UTR)"
                      className="flex-1 p-3.5 bg-stone-800 border border-stone-700 rounded-2xl text-xs font-mono text-white outline-none focus:border-brand-400 placeholder:text-stone-500"
                    />
                    <button
                      onClick={handleVerifyPayment}
                      disabled={isSubmittingUtr}
                      className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingUtr ? 'Verifying...' : 'Submit & Notify'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-stone-500">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Certified Payee: {payee.upiId} ({payee.developerEmail})</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 text-stone-600 hover:text-stone-900 font-bold"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
