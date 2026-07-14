import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SellerProfile } from '../types';
import { Check, X, Eye, FileText, Globe, Building2, MapPin, Phone, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export default function SellerApprovals() {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);

  useEffect(() => {
    fetchPendingSellers();
    fetchDefaultCommission();
  }, []);

  const fetchDefaultCommission = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'platform'));
      if (docSnap.exists()) {
        setCustomCommission(docSnap.data().defaultCommissionRate || 10);
      }
    } catch (err) {
      console.error("Failed to fetch global commission:", err);
    }
  };

  const fetchPendingSellers = async () => {
    try {
      const q = query(collection(db, 'sellers'), where('verified', '==', false));
      const snapshot = await getDocs(q);
      const sellersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SellerProfile));
      
      // For demo purposes, if none in DB, we use mocks
      if (sellersList.length === 0) {
        setSellers([
          {
            id: 'mock-1',
            businessName: 'Siciliano Organic Exports',
            farmName: 'Etna Valley Farm',
            type: 'Exporter',
            phone: '+39 123 456 789',
            whatsapp: '+39 123 456 789',
            country: 'Italy',
            isoCode: 'IT',
            city: 'Sicily',
            address: 'Via Roma 12, Catania',
            verified: false,
            commissionRate: 8,
            documents: ['id_front.jpg', 'license.pdf'],
            aiAudit: {
              confidenceScore: 94,
              flags: [],
              summary: "Business address and phone metadata match Italian registry for Sicily exports.",
              lastAudited: new Date().toISOString()
            },
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 'mock-2',
            businessName: 'Tropical Sourcing Ltd',
            farmName: 'Andaman Orchards',
            type: 'Wholesaler',
            phone: '+66 98 765 4321',
            whatsapp: '+66 98 765 4321',
            country: 'Thailand',
            isoCode: 'TH',
            city: 'Phuket',
            address: 'Beach Rd 45, Patong',
            verified: false,
            commissionRate: 10,
            documents: ['passport.jpg'],
            aiAudit: {
              confidenceScore: 68,
              flags: ["Unverified Wholesaler Chain", "Phone number flagged in bulk sourcing list"],
              summary: "Location matches city but contact info has high risk patterns. Requires manual document inspection.",
              lastAudited: new Date().toISOString()
            },
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
          }
        ]);
      } else {
        setSellers(sellersList);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load seller applications");
    } finally {
      setLoading(false);
    }
  };

  const [customCommission, setCustomCommission] = useState(10);

  const handleApprove = async (id: string) => {
    try {
      if (id.startsWith('mock-')) {
        setSellers(prev => prev.filter(s => s.id !== id));
        toast.success(`Seller verified with ${customCommission}% commission!`);
        return;
      }
      await updateDoc(doc(db, 'sellers', id), { 
        verified: true,
        commissionRate: customCommission 
      });
      setSellers(prev => prev.filter(s => s.id !== id));
      setSelectedSeller(null);
      toast.success(`Seller verified with ${customCommission}% commission!`);
    } catch (err) {
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    const fetchSellerDefault = async () => {
      if (selectedSeller) {
        if (selectedSeller.commissionRate) {
          setCustomCommission(selectedSeller.commissionRate);
        } else {
          // If the individual seller doesn't have a rate yet, 
          // we already have the platform default in state or can re-fetch
          const platformDoc = await getDoc(doc(db, 'settings', 'platform'));
          if (platformDoc.exists()) {
            setCustomCommission(platformDoc.data().defaultCommissionRate || 10);
          }
        }
      }
    };
    fetchSellerDefault();
  }, [selectedSeller]);

  const handleReject = (id: string) => {
    // In a real app, we might delete or set status to 'rejected'
    setSellers(prev => prev.filter(s => s.id !== id));
    setSelectedSeller(null);
    toast.error("Seller registration rejected.");
  };

  if (loading) return <div className="p-12 text-center text-stone-400">Scanning global registries...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h2 className="text-3xl font-serif italic text-stone-900">Seller Approvals</h2>
        <p className="text-stone-500">Review international seller credentials for platform integrity.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sellers.map((seller) => (
          <div 
            key={seller.id}
            className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-xl hover:border-brand-100 transition-all cursor-pointer"
            onClick={() => setSelectedSeller(seller)}
          >
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 flex-shrink-0 group-hover:scale-110 transition-transform">
              <Building2 size={32} />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-stone-900">{seller.businessName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 rounded text-stone-400 uppercase tracking-widest">{seller.type}</span>
                {seller.aiAudit && (
                  <div className={cn(
                    "ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    seller.aiAudit.confidenceScore > 85 ? "bg-green-50 text-green-600" : 
                    seller.aiAudit.confidenceScore > 60 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                  )}>
                    <Sparkles size={10} /> {seller.aiAudit.confidenceScore}% AI Confidence
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                <span className="flex items-center gap-1"><Globe size={14} /> {seller.country}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {seller.city}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {seller.phone}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleApprove(seller.id); }}
                className="p-3 bg-brand-50 text-brand-600 rounded-2xl hover:bg-brand-600 hover:text-white transition-all shadow-sm"
              >
                <Check size={20} />
              </button>
               <button 
                onClick={(e) => { e.stopPropagation(); handleReject(seller.id); }}
                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <X size={20} />
              </button>
              <button 
                className="p-3 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-sm"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>
        ))}

        {sellers.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
              <Check size={40} />
            </div>
            <h3 className="text-xl font-bold text-stone-900">All caught up!</h3>
            <p className="text-stone-500">No pending seller registrations to review.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSeller && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSeller(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 overflow-y-auto">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 mb-2 block">Application Review</span>
                    <h2 className="text-5xl font-serif italic text-stone-900 mb-4">{selectedSeller.businessName}</h2>
                    <p className="text-stone-500 max-w-md">Submitted on {new Date(selectedSeller.createdAt || '').toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setSelectedSeller(null)} className="p-3 rounded-2xl bg-stone-50 text-stone-400 hover:text-stone-900">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6">Business Profile</h4>
                      <div className="space-y-4">
                         <div className="flex justify-between py-3 border-b border-stone-50">
                            <span className="text-stone-500 font-medium font-serif italic text-sm">Farm Name</span>
                            <span className="font-bold text-stone-900 text-sm">{selectedSeller.farmName}</span>
                         </div>
                         <div className="flex justify-between py-3 border-b border-stone-50">
                            <span className="text-stone-500 font-medium font-serif italic text-sm">Operation Type</span>
                            <span className="font-bold text-stone-900 text-sm">{selectedSeller.type}</span>
                         </div>
                         <div className="flex justify-between py-3 border-b border-stone-50">
                            <span className="text-stone-500 font-medium font-serif italic text-sm">Address</span>
                            <span className="font-bold text-stone-900 text-sm text-right max-w-[200px]">{selectedSeller.address}, {selectedSeller.city}, {selectedSeller.country}</span>
                         </div>
                         <div className="flex justify-between py-3 border-b border-stone-50">
                            <span className="text-stone-500 font-medium font-serif italic text-sm">Contact</span>
                            <span className="font-bold text-stone-900 text-sm">{selectedSeller.phone}</span>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Sparkles size={14} className="text-brand-600" /> AI Internal Audit
                      </h4>
                      {selectedSeller.aiAudit ? (
                        <div className="bg-stone-50 rounded-[32px] p-8 border border-stone-100">
                           <div className="flex items-center gap-4 mb-6">
                              <div className={cn(
                                "w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black",
                                selectedSeller.aiAudit.confidenceScore > 85 ? "bg-green-100 text-green-600" : 
                                selectedSeller.aiAudit.confidenceScore > 60 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                              )}>
                                 <span className="text-xl">{selectedSeller.aiAudit.confidenceScore}%</span>
                                 <span className="text-[8px] uppercase tracking-tighter leading-none">Score</span>
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-stone-900">Document Integrity Analysis</p>
                                 <p className="text-xs text-stone-500">Automated verification result</p>
                              </div>
                           </div>
                           
                           <div className="space-y-4 mb-6">
                              <p className="text-sm italic font-serif text-stone-600 leading-relaxed bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                                "{selectedSeller.aiAudit.summary}"
                              </p>
                           </div>

                           {selectedSeller.aiAudit.flags.length > 0 ? (
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <AlertTriangle size={10} /> Risk Indicators
                                 </p>
                                 {selectedSeller.aiAudit.flags.map((flag, i) => (
                                   <div key={i} className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-red-50/50 p-2 rounded-xl">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                      {flag}
                                   </div>
                                 ))}
                              </div>
                           ) : (
                             <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                <ShieldCheck size={16} /> 
                                High authenticity detected. No suspicious patterns found.
                             </div>
                           )}
                        </div>
                      ) : (
                        <div className="bg-stone-50 rounded-[32px] p-8 border border-stone-100 text-center">
                           <p className="text-stone-400 text-sm">No AI audit metadata available for this legacy record.</p>
                        </div>
                      )}

                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 mt-10">Verification Assets</h4>
                      <div className="grid grid-cols-2 gap-4">
                         {(selectedSeller.documents || ['doc1.jpg', 'doc2.jpg']).map((doc, i) => (
                           <div key={i} className="aspect-[3/4] bg-stone-100 rounded-3xl border-2 border-stone-100 hover:border-brand-400 transition-all cursor-zoom-in group relative overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100">
                                <FileText size={48} className="text-stone-300" />
                              </div>
                              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl text-[10px] font-bold text-stone-700 shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                                 {doc}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-10 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row gap-6 items-center">
                 <div className="flex flex-col gap-2 w-full sm:w-48">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Set Commission %</label>
                    <input 
                      type="number" 
                      value={customCommission}
                      onChange={(e) => setCustomCommission(Number(e.target.value))}
                      className="bg-white border border-stone-200 px-4 py-3 rounded-xl font-black text-brand-600 outline-none focus:border-brand-500"
                    />
                 </div>
                 <button 
                  onClick={() => handleApprove(selectedSeller.id)}
                  className="flex-grow bg-brand-600 text-white h-16 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-100 hover:bg-brand-500 transition-all w-full"
                >
                    <Check size={24} strokeWidth={3} /> Approve with {customCommission}% Rate
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
