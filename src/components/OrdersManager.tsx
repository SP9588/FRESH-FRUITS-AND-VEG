import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Order, FRESH_WORLD_PAYEE } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  QrCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  User,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PayeeCommissionModal from './PayeeCommissionModal';
import CartInvoiceModal from './CartInvoiceModal';

export default function OrdersManager({ user }: { user: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'confirmed' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
  const [selectedOrderForPayee, setSelectedOrderForPayee] = useState<Order | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const currentUid = auth.currentUser.uid;
    const isSellerOrAdmin = user?.role === 'seller' || user?.role === 'admin';

    // Query orders for this user
    let q;
    if (user?.role === 'admin') {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'orders'),
        where('customerId', '==', currentUid)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Order[] = snapshot.docs.map((d) => ({
          ...(d.data() as Order),
          id: d.id,
        }));
        // Sort descending by creation date if indexed in client
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetched);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.utrNumber && order.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Order #${orderId} marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold mb-2">
            <ShieldCheck size={14} /> Official Platform Clearing Hub
          </div>
          <h2 className="text-3xl font-serif italic font-bold text-stone-900">
            Order & Settlement History
          </h2>
          <p className="text-stone-500 text-xs mt-1">
            Tracking customer purchases, UPI Payee settlements ({FRESH_WORLD_PAYEE.upiId}), and cold-chain dispatches.
          </p>
        </div>

        {/* Global Payee Quick Action */}
        <button
          onClick={() => {
            setSelectedOrderForPayee(null);
            setIsPayeeModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold shadow-sm transition-all self-start md:self-auto"
        >
          <QrCode size={16} className="text-amber-700" />
          <span>Payee UPI: <strong className="font-mono">{FRESH_WORLD_PAYEE.upiId}</strong></span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'confirmed', 'shipped', 'delivered'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {filter === 'all' ? 'All Orders' : filter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Item, or UTR..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-brand-600"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-xs font-medium">Loading orders from ledger...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300 p-8">
          <Package size={48} className="mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-serif italic font-bold text-stone-800">No Orders Found</h3>
          <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No orders match your search criteria.'
              : 'You haven’t placed any orders yet. Visit the global marketplace to source fresh produce.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const inrTotal = Math.round(order.totalAmount * 85.5);
            const inrCommission = Math.round((order.commissionAmount || 0) * 85.5);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black text-stone-900 font-mono">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      ≈ ₹{inrTotal.toLocaleString('en-IN')} INR
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-stone-50 p-3 rounded-2xl"
                    >
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-brand-600" />
                        <span className="font-bold text-stone-800">{item.name}</span>
                        <span className="text-stone-400">× {item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-stone-700">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Settlement & UPI Payee Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50/70 p-4 rounded-2xl border border-stone-100 text-xs">
                  <div className="space-y-1">
                    <div className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                      Settlement & Payee
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Method:</span>
                      <span className="font-bold text-stone-800">{order.paymentMethod || 'UPI_DIRECT'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Payee UPI:</span>
                      <span className="font-mono font-bold text-brand-700">
                        {order.payeeUpiId || FRESH_WORLD_PAYEE.upiId}
                      </span>
                    </div>
                    {order.utrNumber && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">UTR / Ref:</span>
                        <span className="font-mono font-bold text-stone-900">{order.utrNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-stone-200 pt-2 md:pt-0 md:pl-4">
                    <div className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                      Platform Fee Allocation
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Developer Fee ({order.commissionRate || 10}%):</span>
                      <span className="font-mono font-bold text-amber-800">
                        {formatCurrency(order.commissionAmount || 0)} (₹{inrCommission.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Developer Email:</span>
                      <span className="text-stone-700">{order.payeeEmail || FRESH_WORLD_PAYEE.developerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-800 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3.5 py-1.5 rounded-xl border border-brand-200 transition-colors shadow-sm"
                    >
                      <FileText size={13} /> View Commercial Invoice & QR
                    </button>

                    <button
                      onClick={() => {
                        setSelectedOrderForPayee(order);
                        setIsPayeeModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/70 transition-colors"
                    >
                      <QrCode size={13} /> Payee Details
                    </button>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400 font-bold">Admin Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                        className="bg-stone-100 border border-stone-200 text-xs rounded-xl px-3 py-1 font-bold outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Viewer Modal for Existing Orders */}
      {selectedOrderForInvoice && (
        <CartInvoiceModal
          isOpen={!!selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
          items={selectedOrderForInvoice.items || []}
          subtotal={selectedOrderForInvoice.subtotalAmount || selectedOrderForInvoice.totalAmount - (selectedOrderForInvoice.shippingAmount || 15)}
          shipping={selectedOrderForInvoice.shippingAmount || 15}
          total={selectedOrderForInvoice.totalAmount}
          platformCommissionRate={selectedOrderForInvoice.commissionRate || 10}
        />
      )}

      {/* Payee Commission Modal */}
      <PayeeCommissionModal
        isOpen={isPayeeModalOpen}
        onClose={() => {
          setIsPayeeModalOpen(false);
          setSelectedOrderForPayee(null);
        }}
        customAmount={
          selectedOrderForPayee ? Math.round(selectedOrderForPayee.totalAmount * 85.5) : undefined
        }
      />
    </div>
  );
}

