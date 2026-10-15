import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2, Globe, Truck, QrCode, ShieldCheck, Sparkles, Percent, Lock, CreditCard, ChevronLeft, FileText, Printer, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FRESH_WORLD_PAYEE, OrderItem } from '../types';
import PayeeCommissionModal from '../components/PayeeCommissionModal';
import CheckoutPaymentProcessor from '../components/CheckoutPaymentProcessor';
import CartInvoiceModal from '../components/CartInvoiceModal';

export default function Cart() {
  const { items, removeFromCart, clearCart } = useCart();
  const [platformCommission, setPlatformCommission] = useState(FRESH_WORLD_PAYEE.commissionRate || 10);
  const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'platform'));
        if (docSnap.exists()) {
          setPlatformCommission(docSnap.data().defaultCommissionRate || 10);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCommission();
  }, []);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  // Default shopping logistics fixed to 0 Rupees (Free promotional cold-chain delivery)
  const internationalShipping = 0;
  const total = subtotal + internationalShipping;
  const inrTotal = Math.round(total * 85.5);

  const handleStartCheckout = () => {
    if (!auth.currentUser) {
      toast.error("Please sign in to complete checkout");
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsCheckingOut(true);
    // Smooth scroll to top of checkout section
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (orderId: string) => {
    clearCart();
    toast.success(`Order #${orderId} confirmed with Payee UPI ${FRESH_WORLD_PAYEE.upiId}!`);
  };

  const orderItemsFormatted: OrderItem[] = items.map(item => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    sellerId: item.sellerId,
    selectedVariations: item.selectedVariations
  }));

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb / Status Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <Link to="/market" className="text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <ChevronLeft size={16} /> Marketplace
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 text-xs font-bold uppercase tracking-wider">
            {isCheckingOut ? 'Secure Payment Processing' : 'Shopping Bag'}
          </span>
        </div>

        {/* Action Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="View invoice with default 0 Rupees"
          >
            <FileText size={13} className="text-brand-600" />
            <span>Cart Invoice & Payee QR</span>
            <span className="text-[10px] bg-brand-200 text-brand-900 px-2 py-0.5 rounded font-mono font-bold">
              {inrTotal === 0 ? 'Default: ₹0 (0 Rupees)' : `₹${inrTotal.toLocaleString('en-IN')}`}
            </span>
          </button>

          <button
            onClick={() => setIsPayeeModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-full text-xs font-bold text-amber-800 transition-all shadow-sm"
          >
            <QrCode size={13} className="text-amber-700" />
            <span>Payee: <strong className="font-mono">{FRESH_WORLD_PAYEE.upiId}</strong></span>
            <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.2 rounded font-black">{platformCommission}% Fee</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isCheckingOut ? (
          /* Payment Processing Step */
          <motion.div
            key="payment-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsCheckingOut(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ChevronLeft size={16} /> Back to Bag ({items.length} items)
              </button>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline mr-2"
                >
                  <FileText size={13} /> View Invoice & Payee QR
                </button>
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>SSL Encrypted Platform Checkout</span>
              </div>
            </div>

            {/* Core Payment Processing Component */}
            <CheckoutPaymentProcessor
              items={orderItemsFormatted}
              subtotal={subtotal}
              shipping={internationalShipping}
              total={total}
              platformCommissionRate={platformCommission}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={() => setIsCheckingOut(false)}
            />
          </motion.div>
        ) : (
          /* Cart Review Step */
          <motion.div
            key="cart-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col lg:flex-row gap-12"
          >
            {/* Left - Items */}
            <div className="w-full lg:w-2/3">
              <h1 className="text-4xl sm:text-5xl font-serif italic text-stone-900 mb-10 flex items-center gap-4">
                Shipping Bag <span className="text-xl font-sans not-italic text-stone-400">({items.length} Items)</span>
              </h1>

              <div className="space-y-6">
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-6 group pb-6 border-b border-stone-100"
                  >
                    <div className="h-32 w-32 bg-stone-100 rounded-3xl overflow-hidden flex-shrink-0 shadow-inner">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow pt-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-serif italic text-stone-900 group-hover:text-brand-600 transition-colors">{item.name}</h3>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <Globe size={12} /> {item.originCountry} Origin
                          </p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedVariations)}
                          className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-4">
                        <div className="flex-grow">
                          {item.selectedVariations && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                                Size: <span className="text-stone-900">{item.selectedVariations.size}</span>
                              </span>
                              <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                                Maturity: <span className="text-stone-900">{item.selectedVariations.ripeness}</span>
                              </span>
                              <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                                Pack: <span className="text-stone-900">{item.selectedVariations.packaging}</span>
                              </span>
                            </div>
                          )}
                          <div className="text-xs font-bold text-stone-400">
                            Qty: <span className="text-stone-900 ml-1">{item.quantity} {item.unit}</span>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-stone-900">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {items.length === 0 && (
                <div className="text-center py-16 px-6 bg-stone-50 rounded-[40px] border border-dashed border-stone-200 space-y-4">
                  <ShoppingBag size={48} className="mx-auto text-stone-300" />
                  <div>
                    <h3 className="text-xl font-serif italic text-stone-900 mb-1">Your shipping bag is currently empty</h3>
                    <p className="text-stone-500 text-sm">Default shopping price and invoice are initialized to 0 Rupees (₹0.00 INR).</p>
                  </div>

                  {/* Default Pricing Highlights */}
                  <div className="inline-flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm text-xs">
                    <span className="font-bold text-stone-700">Default Shopping Price:</span>
                    <span className="font-mono font-black text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded">₹0 (0 Rupees)</span>
                    <span className="text-stone-300">|</span>
                    <span className="font-bold text-stone-700">Default Invoice:</span>
                    <span className="font-mono font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded">₹0 (0 Rupees)</span>
                  </div>

                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setIsInvoiceModalOpen(true)}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <FileText size={14} /> Preview Default Invoice (₹0 Rupees)
                    </button>
                    <Link to="/market" className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all">
                      Explore Global Marketplace
                    </Link>
                  </div>
                </div>
              )}

              <Link to="/market" className="mt-8 inline-flex items-center gap-2 font-bold text-stone-400 hover:text-stone-900 transition-colors text-sm">
                <ArrowRight className="rotate-180" size={16} /> Continue Sourcing Fresh Produce
              </Link>
            </div>

            {/* Right - Order Summary & Payment Gateway Preview */}
            <div className="w-full lg:w-1/3">
              <div className="bg-stone-900 rounded-[40px] p-8 text-white sticky top-24 shadow-2xl shadow-stone-300/40">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif italic">Order Summary</h2>
                  <span className="text-[10px] font-mono bg-stone-800 px-2 py-1 rounded text-stone-400">
                    256-Bit Escrow
                  </span>
                </div>
                
                <div className="space-y-4 mb-8 pb-6 border-b border-white/10 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-serif italic">Produce Subtotal</span>
                    <span className="font-bold font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 font-serif italic flex items-center gap-1.5">
                      Cold-Chain Logistics <Truck size={14} className="text-brand-400" />
                    </span>
                    <span className="font-bold font-mono">{formatCurrency(internationalShipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-serif italic">Platform Fee (Inc.)</span>
                    <span className="font-bold text-brand-400 italic">{platformCommission}% Platform Slice</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-lg font-serif italic text-stone-300">Total Settlement</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-brand-400 tracking-tighter block font-mono">{formatCurrency(total)}</span>
                    <span className="text-[11px] text-amber-300 font-mono font-bold">
                      {inrTotal === 0 ? '₹0 INR (0 Rupees Default)' : `≈ ₹${inrTotal.toLocaleString('en-IN')} INR`}
                    </span>
                  </div>
                </div>

                {/* Developer Payee & Invoice Generation Action */}
                <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Sparkles size={13} /> Platform Payee Gateway
                    </div>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-black">
                      {platformCommission}% Fee
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Payee UPI:</span>
                      <span className="font-mono font-bold text-white">{FRESH_WORLD_PAYEE.upiId}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-stone-400">Merchant:</span>
                    <span className="text-stone-200">{FRESH_WORLD_PAYEE.merchantName}</span>
                  </div>
                  </div>

                  {/* Generate & Scan Invoice Button */}
                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <FileText size={14} /> {items.length === 0 ? 'Preview Default Invoice & Payee QR (₹0 Rupees)' : 'Generate Invoice & Scan Payee QR'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPayeeModalOpen(true)}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <QrCode size={13} /> Payee Info Hub
                  </button>
                </div>

                <button 
                  onClick={handleStartCheckout}
                  disabled={items.length === 0}
                  className="w-full bg-brand-600 hover:bg-brand-500 py-4 rounded-2xl font-black text-base transition-all shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <Lock size={18} /> Proceed to UPI Payment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-6 flex gap-4 justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3.5" alt="Visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3.5" alt="Mastercard" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-3.5" alt="Paypal" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commercial Cart Invoice & Payee QR Modal */}
      <CartInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        items={orderItemsFormatted}
        subtotal={subtotal}
        shipping={internationalShipping}
        total={total}
        platformCommissionRate={platformCommission}
        onOrderSettled={(orderId) => {
          clearCart();
          setIsInvoiceModalOpen(false);
          navigate('/dashboard/orders');
        }}
      />

      {/* Payee Commission Modal */}
      <PayeeCommissionModal
        isOpen={isPayeeModalOpen}
        onClose={() => setIsPayeeModalOpen(false)}
        customAmount={Math.round(total * 85.5)}
      />
    </div>
  );
}

