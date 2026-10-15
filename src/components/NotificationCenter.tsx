import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertCircle, 
  ShoppingBag, 
  Info, 
  X, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  Leaf, 
  CreditCard,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { AppNotification, FRESH_WORLD_PAYEE } from '../types';
import { notificationService } from '../services/notificationService';
import PayeeCommissionModal from './PayeeCommissionModal';
import { toast } from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      setNotifications(docs);
      setUnreadCount(docs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedSampleNotifications = async () => {
    if (!auth.currentUser) return;
    setIsSeedingDemo(true);
    try {
      await notificationService.sendPlatformCommissionAlert(
        auth.currentUser.uid,
        185.50,
        `FW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      );
      await notificationService.sendPaymentSuccessAlert(
        auth.currentUser.uid,
        1855.00,
        '423891028392'
      );
      await notificationService.sendDeveloperNotice(auth.currentUser.uid);
      toast.success('Sample platform notifications generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to trigger sample notifications.');
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'platform_commission':
        return <Percent className="text-amber-600" size={18} />;
      case 'payment_success':
        return <ShieldCheck className="text-emerald-600" size={18} />;
      case 'developer_notice':
        return <Sparkles className="text-purple-600" size={18} />;
      case 'low_stock':
        return <AlertCircle className="text-red-600" size={18} />;
      case 'order_received':
        return <ShoppingBag className="text-emerald-600" size={18} />;
      case 'crop_doctor_update':
        return <Leaf className="text-brand-600" size={18} />;
      case 'payout_ready':
        return <CreditCard className="text-blue-600" size={18} />;
      default:
        return <Info className="text-stone-600" size={18} />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'platform_commission':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'payment_success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'developer_notice':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'low_stock':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'order_received':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-stone-50 rounded-2xl border border-stone-200 hover:bg-white hover:shadow-lg transition-all group"
        title="Notifications & Alerts"
      >
        <Bell size={20} className={cn("text-stone-500 group-hover:text-stone-900 transition-colors", unreadCount > 0 && "text-brand-600 animate-pulse")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-[420px] max-w-[90vw] bg-white rounded-[32px] shadow-2xl border border-stone-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-600" />
                    <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest">
                      Fresh World Notifications
                    </h3>
                  </div>
                  <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                    Live orders, platform commission & payee alerts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline px-2 py-1 bg-brand-50 rounded-lg"
                    >
                      Clear Unread
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-900 p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Developer Payee Quick Bar */}
              <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-3.5 px-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <QrCode size={16} className="text-amber-400" />
                  <div>
                    <span className="font-mono text-[11px] font-bold text-amber-300">
                      UPI: {FRESH_WORLD_PAYEE.upiId}
                    </span>
                    <span className="text-[10px] text-stone-400 block truncate max-w-[180px]">
                      {FRESH_WORLD_PAYEE.developerEmail}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsPayeeModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Payee Hub
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-stone-100">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center px-6 space-y-3">
                    <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center text-stone-300">
                      <Bell size={28} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-700">No active notifications</p>
                      <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
                        You'll receive instant alerts for orders, platform commissions, and developer payee transactions.
                      </p>
                    </div>
                    <button
                      onClick={handleSeedSampleNotifications}
                      disabled={isSeedingDemo}
                      className="mt-2 text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 rounded-xl"
                    >
                      <PlusCircle size={14} /> Send Test Alert
                    </button>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 sm:p-5 flex items-start gap-3.5 transition-all hover:bg-stone-50 group",
                        !n.read ? "bg-amber-50/30" : "bg-white"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-2xl h-fit border shadow-sm flex-shrink-0",
                        getBadgeStyle(n.type)
                      )}>
                        {getIcon(n.type)}
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-black text-stone-900 tracking-tight">
                            {n.title}
                          </h4>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-brand-600 mt-1 flex-shrink-0" />}
                        </div>

                        <p className="text-[11px] text-stone-600 font-medium leading-relaxed mb-2 break-words">
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] font-bold text-stone-400">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>

                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {!n.read && (
                              <button 
                                onClick={() => markAsRead(n.id)}
                                title="Mark as read"
                                className="p-1 bg-white border border-stone-200 rounded-md text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                              >
                                <Check size={11} />
                              </button>
                            )}
                            <button 
                              onClick={() => deleteNotification(n.id)}
                              title="Delete alert"
                              className="p-1 bg-white border border-stone-200 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[10px] font-bold text-stone-500 px-5">
                <span>Developer: {FRESH_WORLD_PAYEE.developerEmail}</span>
                <button
                  onClick={handleSeedSampleNotifications}
                  disabled={isSeedingDemo}
                  className="text-brand-600 hover:underline flex items-center gap-1"
                >
                  <PlusCircle size={12} /> Test Alert
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payee & Platform Commission Modal */}
      <PayeeCommissionModal
        isOpen={isPayeeModalOpen}
        onClose={() => setIsPayeeModalOpen(false)}
      />
    </div>
  );
}
