import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Percent, Save, ShieldCheck, Info, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminSettings() {
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'platform');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDefaultCommission(docSnap.data().defaultCommissionRate || 10);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'platform'), {
        defaultCommissionRate: defaultCommission,
        lastUpdatedBy: auth.currentUser?.uid,
        updatedAt: new Date().toISOString()
      });
      toast.success("Global settings updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-400">Loading platform configuration...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl">
      <div className="mb-12">
        <h2 className="text-3xl font-serif italic text-stone-900">Platform Settings</h2>
        <p className="text-stone-500">Configure global parameters for FreshWorld Marketplace.</p>
      </div>

      <div className="space-y-8">
        {/* Commission Section */}
        <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
             <Percent size={120} className="text-stone-900" />
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                <Percent size={24} />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Global Seller Commission</h3>
            </div>
            
            <p className="text-stone-500 text-sm mb-8 leading-relaxed">
              This rate is automatically applied as a default when approving new sellers. 
              You can still override this per-seller during the individual approval process.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Default Platform Slice (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={defaultCommission}
                    onChange={(e) => setDefaultCommission(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-100 px-6 py-4 rounded-2xl font-black text-2xl text-brand-600 outline-none focus:border-brand-500 transition-all shadow-inner"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 font-serif italic text-xl">%</div>
                </div>
              </div>
              
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-stone-900 text-white h-[64px] px-8 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-brand-600 transition-all shadow-xl shadow-stone-100 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-brand-50 boder border-brand-100 p-6 rounded-3xl flex gap-4">
           <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Info size={20} />
           </div>
           <div>
              <p className="text-sm font-bold text-stone-900 mb-1">Impact of Commission Rates</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Changes to the global default will ONLY affect new registrations. Existing verified sellers retain their currently assigned rates until manually updated in their individual profiles.
              </p>
           </div>
        </div>

        {/* Security Badge */}
        <div className="pt-8 border-t border-stone-100 flex items-center gap-3 text-stone-300">
           <ShieldCheck size={20} />
           <span className="text-xs font-bold uppercase tracking-widest">Admin Authorization Verified</span>
        </div>
      </div>
    </div>
  );
}
