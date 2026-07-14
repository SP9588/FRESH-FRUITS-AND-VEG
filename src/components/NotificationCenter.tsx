import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Bell, Check, Trash2, AlertCircle, ShoppingBag, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  userId: string;
  type: 'low_stock' | 'order_received' | 'system';
  title: string;
  message: string;
  productId?: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <AlertCircle className="text-brand-600" size={18} />;
      case 'order_received': return <ShoppingBag className="text-emerald-600" size={18} />;
      default: return <Info className="text-blue-600" size={18} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-white hover:shadow-lg transition-all group"
      >
        <Bell size={20} className={cn("text-stone-400 group-hover:text-stone-900", unreadCount > 0 && "text-brand-600")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
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
              className="absolute right-0 mt-4 w-[400px] bg-white rounded-[32px] shadow-2xl border border-stone-100 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-stone-50 flex items-center justify-between bg-stone-50/50">
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Global Alerts</h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-1">Market Activity & Inventory</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline"
                    >
                      Clear Unread
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-stone-300 hover:text-stone-900">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="max-h-[480px] overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-16 flex flex-col items-center text-center px-8">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 mb-4">
                      <Bell size={32} />
                    </div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest leading-relaxed">Your satellite array is silent. No active alerts.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-6 flex items-start gap-4 transition-all hover:bg-stone-50 group",
                          !n.read && "bg-brand-50/20"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-2xl h-fit",
                          n.type === 'low_stock' ? "bg-brand-50" : "bg-emerald-50"
                        )}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-black text-stone-900 tracking-tight">{n.title}</h4>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5" />}
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium leading-relaxed mb-3">{n.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.read && (
                                <button 
                                  onClick={() => markAsRead(n.id)}
                                  className="p-1.5 bg-white border border-stone-100 rounded-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                              <button 
                                onClick={() => deleteNotification(n.id)}
                                className="p-1.5 bg-white border border-stone-100 rounded-lg text-stone-300 hover:text-red-600 transition-all shadow-sm"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-stone-50/50 border-t border-stone-50 text-center">
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest italic">All signals are encrypted and verified</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
