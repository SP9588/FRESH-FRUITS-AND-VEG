import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2, Globe, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, runTransaction, collection, addDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const { items, removeFromCart, clearCart } = useCart();
  const [platformCommission, setPlatformCommission] = React.useState(10);

  React.useEffect(() => {
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
  const internationalShipping = items.length > 0 ? 15.00 : 0;
  const total = subtotal + internationalShipping;

  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

  const handlePlaceOrder = async () => {
    if (!auth.currentUser) {
      toast.error("Please sign in to place an order");
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderId = `FW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const commissionRate = platformCommission / 100; 
      const commissionAmount = subtotal * commissionRate;

      await runTransaction(db, async (transaction) => {
        const productUpdates: { docRef: any, newStock: number, originalData: any }[] = [];
        
        // 1. Verify and prepare stock updates
        for (const item of items) {
          const productRef = doc(db, 'products', item.id);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            throw new Error(`Product ${item.name} no longer exists.`);
          }
          
          const currentStock = productDoc.data().stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}`);
          }
          
          productUpdates.push({
            docRef: productRef,
            newStock: currentStock - item.quantity,
            originalData: productDoc.data()
          });
        }

        // 2. Perform stock updates and create notifications
        for (const update of productUpdates) {
          transaction.update(update.docRef, { 
            stock: update.newStock,
            status: update.newStock === 0 ? 'out_of_stock' : update.originalData.status
          });

          // Create notification for seller if stock is low
          const threshold = update.originalData.lowStockThreshold || 5;
          if (update.newStock <= threshold) {
            const notificationTitle = update.newStock === 0 ? "Inventory Depleted" : "Low Stock Alert";
            const notificationMsg = update.newStock === 0 
              ? `Crucial Alert: ${update.originalData.name} is now out of stock.`
              : `Warning: ${update.originalData.name} has only ${update.newStock} ${update.originalData.unit} remaining.`;

            const notificationRef = doc(collection(db, 'notifications'));
            transaction.set(notificationRef, {
              userId: update.originalData.sellerId,
              type: 'low_stock',
              title: notificationTitle,
              message: notificationMsg,
              productId: update.docRef.id,
              read: false,
              createdAt: new Date().toISOString()
            });
          }

          // Create notification for seller about the order
          const orderNotificationRef = doc(collection(db, 'notifications'));
          transaction.set(orderNotificationRef, {
            userId: update.originalData.sellerId,
            type: 'order_received',
            title: "New Global Order Received",
            message: `A new order (${orderId}) has been logged for ${update.originalData.name}. Quantity: ${items.find(i => i.id === update.docRef.id)?.quantity}`,
            orderId: orderId,
            productId: update.docRef.id,
            read: false,
            createdAt: new Date().toISOString()
          });
        }

        // 3. Create the order
        const orderData = {
          id: orderId,
          customerId: auth.currentUser!.uid,
          items: items.map(i => ({
            productId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            sellerId: i.sellerId,
          })),
          totalAmount: total,
          commissionAmount: commissionAmount,
          status: 'pending',
          shippingAddress: 'Verified Global Address',
          createdAt: new Date().toISOString()
        };

        transaction.set(doc(db, 'orders', orderId), orderData);
      });
      
      clearCart();
      toast.success("Transaction authenticated. Order successfully logged.");
      setTimeout(() => navigate('/dashboard/orders'), 2000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to authenticate transaction");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left - Items */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-5xl font-serif italic text-stone-900 mb-12 flex items-center gap-4">
            Shipping Bag <span className="text-xl font-sans not-italic text-stone-400">({items.length} Items)</span>
          </h1>

          <div className="space-y-8">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-8 group pb-8 border-b border-stone-100"
              >
                <div className="h-40 w-32 bg-stone-100 rounded-[32px] overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={item.image} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow pt-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-2xl font-serif italic text-stone-900 group-hover:text-brand-600 transition-colors">{item.name}</h3>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                        <Globe size={12} /> {item.originCountry} Origin
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedVariations)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-8">
                    <div className="flex-grow">
                      {item.selectedVariations && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                            Size: <span className="text-stone-900">{item.selectedVariations.size}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                            Maturity: <span className="text-stone-900">{item.selectedVariations.ripeness}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                            Pack: <span className="text-stone-900">{item.selectedVariations.packaging}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                            Delivery: <span className="text-stone-900">{item.selectedVariations.delivery}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                            Expected: <span className="text-stone-900">{new Date(item.selectedVariations.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-bold text-stone-400">
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
            <div className="text-center py-20 bg-stone-50 rounded-[40px] border border-dashed border-stone-200">
               <ShoppingBag size={48} className="mx-auto mb-4 text-stone-300" />
               <p className="text-stone-500 font-medium">Your bag is currently empty.</p>
               <Link to="/market" className="text-brand-600 font-bold mt-4 inline-block hover:underline">Go to Marketplace</Link>
            </div>
          )}

          <Link to="/market" className="mt-12 inline-flex items-center gap-2 font-bold text-stone-400 hover:text-stone-900 transition-colors">
            <ArrowRight className="rotate-180" size={18} /> Continue Sourcing More
          </Link>
        </div>

        {/* Right - Summary */}
        <div className="w-full lg:w-1/3">
           <div className="bg-stone-900 rounded-[48px] p-10 text-white sticky top-24 shadow-2xl shadow-stone-200">
              <h2 className="text-3xl font-serif italic mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-10 pb-8 border-b border-white/10">
                 <div className="flex justify-between">
                    <span className="text-stone-400 font-medium font-serif italic">Subtotal</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-stone-400 font-medium font-serif italic flex items-center gap-2">
                      International Cold-Chain <Truck size={14} className="text-brand-400" />
                    </span>
                    <span className="font-bold">{formatCurrency(internationalShipping)}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-stone-400 font-medium font-serif italic">Commission (Inc.)</span>
                    <span className="font-bold text-brand-400 italic">{platformCommission}% Platform Slice</span>
                 </div>
              </div>

              <div className="flex justify-between items-center mb-10">
                 <span className="text-xl font-serif italic">Total Pay</span>
                 <span className="text-4xl font-black text-brand-400 tracking-tighter">{formatCurrency(total)}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || items.length === 0}
                className="w-full bg-brand-600 py-6 rounded-3xl font-black text-xl hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/30 flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                 {isPlacingOrder ? "Processing..." : "Place Secure Order"} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 flex gap-4 justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
