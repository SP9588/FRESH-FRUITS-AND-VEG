import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Upload, MapPin, Briefcase, FileText, Sparkles, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auditSellerApplication } from '../services/aiAuditService';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { countries } from 'countries-list';

const countryOptions = Object.entries(countries).map(([code, country]: [string, any]) => ({
  value: code,
  label: `${country.emoji || ''} ${country.name} (${country.phone})`,
  phone: country.phone,
  name: country.name
}));

export default function SellerRegistration({ user }: { user: any }) {
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    farmName: '',
    type: 'Farmer',
    phone: '',
    whatsapp: '',
    country: '',
    stdCode: '',
    postalCode: '',
    state: '',
    city: '',
    address: '',
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setIsVerifying(true);
    try {
      // Simulate small delay for UI
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const auditResult = await auditSellerApplication(formData);
      
      const sellerProfile = {
        ...formData,
        uid: user.uid,
        verified: false,
        commissionRate: 10,
        aiAudit: {
          ...auditResult,
          lastAudited: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'sellers', user.uid), sellerProfile);
      toast.success("AI Document Audit Completed!");
      setStep(4);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process registration");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-stone-200 -z-10"></div>
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              s <= step ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'bg-white border border-stone-200 text-stone-400'
            }`}
          >
            {s < step ? <Check size={18} /> : s}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-stone-200/50 p-8 md:p-12 overflow-hidden border border-stone-100">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-100 text-brand-600 p-3 rounded-2xl"><Briefcase size={28} /></div>
                <div>
                  <h2 className="text-3xl font-serif italic text-stone-900">Business Identity</h2>
                  <p className="text-stone-500 text-sm">Tell us about your brand and farm.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Business Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Green Valley Exports"
                    className="bg-stone-50 border border-stone-100 px-6 py-4 rounded-2xl outline-none focus:border-brand-500 transition-all font-medium"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Farm/Store Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sunny Brook Farm"
                    className="bg-stone-50 border border-stone-100 px-6 py-4 rounded-2xl outline-none focus:border-brand-500 transition-all font-medium"
                    value={formData.farmName}
                    onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Seller Type</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {['Farmer', 'Retailer', 'Wholesaler', 'Organic Producer', 'Exporter'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setFormData({...formData, type: t})}
                        className={`p-4 rounded-2xl text-sm font-bold border transition-all ${
                          formData.type === t ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
               key="step2"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-100 text-brand-600 p-3 rounded-2xl"><MapPin size={28} /></div>
                <div>
                  <h2 className="text-3xl font-serif italic text-stone-900">Address & Contact</h2>
                  <p className="text-stone-500 text-sm">Where are you shipping from?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Select Country</label>
                  <Select 
                    options={countryOptions}
                    placeholder="Search your country..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    onChange={(option: any) => setFormData({...formData, country: option.name, stdCode: `+${option.phone}`})}
                  />
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Phone Number</label>
                   <div className="flex gap-2">
                      <div className="bg-stone-100 px-4 py-4 rounded-2xl font-bold text-stone-500 min-w-[70px] flex items-center justify-center italic">
                        {formData.stdCode || '+??'}
                      </div>
                      <input 
                        type="text" 
                        placeholder="98765 43210"
                        className="flex-grow bg-stone-50 border border-stone-100 px-6 py-4 rounded-2xl outline-none focus:border-brand-500 transition-all font-medium"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Whatsapp (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Same as phone"
                    className="bg-stone-50 border border-stone-100 px-6 py-4 rounded-2xl outline-none focus:border-brand-500 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">City / Town</label>
                  <input 
                    type="text" 
                    className="bg-stone-50 border border-stone-100 px-6 py-4 rounded-2xl outline-none focus:border-brand-500 transition-all font-medium"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Postal / ZIP Code</label>
                  <input 
                    type="text" 
                    className="bg-stone-50 border border-stone-100 px-6 py-4 rounded-2xl outline-none focus:border-brand-500 transition-all font-medium"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
               key="step3"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="text-center"
            >
              <div className="flex items-center justify-center mb-8">
                <div className="bg-brand-100 text-brand-600 p-6 rounded-full"><FileText size={48} /></div>
              </div>
              <h2 className="text-3xl font-serif italic text-stone-900 mb-2">Verification Documents</h2>
              <p className="text-stone-500 text-sm mb-12">Submit your credentials for international approval.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="border-2 border-dashed border-stone-200 rounded-[32px] p-10 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer group">
                  <input type="file" className="hidden" />
                  <Upload className="mx-auto mb-4 text-stone-300 group-hover:text-brand-500 transition-colors" size={40} />
                  <span className="block font-bold text-stone-700">National ID / Passport</span>
                  <span className="text-xs text-stone-400 italic">Clear photo of the front</span>
                </label>
                 <label className="border-2 border-dashed border-stone-200 rounded-[32px] p-10 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer group">
                  <input type="file" className="hidden" />
                  <Upload className="mx-auto mb-4 text-stone-300 group-hover:text-brand-500 transition-colors" size={40} />
                  <span className="block font-bold text-stone-700">Business License</span>
                  <span className="text-xs text-stone-400 italic">PDF or High-res image</span>
                </label>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
               key="step4"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center py-10"
            >
              <div className="w-24 h-24 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-200">
                <Check size={48} strokeWidth={3} />
              </div>
              <h2 className="text-4xl font-serif italic text-stone-900 mb-4">Application Submitted!</h2>
              <p className="text-stone-500 max-w-sm mx-auto mb-10 leading-relaxed">
                Thank you for joining FreshWorld Global. Our team will verify your documents within 48 hours. 
                You'll receive an email notification soon.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-brand-100 hover:bg-brand-500 transition-all"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <div className="mt-16 flex justify-between items-center">
            {step > 1 ? (
               <button 
                onClick={prevStep}
                className="flex items-center gap-2 text-stone-400 font-bold hover:text-stone-900 transition-colors"
              >
                <ArrowLeft size={18} /> Previous Step
              </button>
            ) : (
              <div></div>
            )}
            
            <button 
              onClick={step === 3 ? handleSubmit : nextStep}
              disabled={isVerifying}
              className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-brand-600 transition-all shadow-xl shadow-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> AI Auditing...
                </>
              ) : (
                <>
                  {step === 3 ? 'Finalize Registration' : 'Next Step'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-stone-400 mt-12 font-medium">
        By registering, you agree to our <a href="#" className="underline">Seller Terms & Conditions</a> and <a href="#" className="underline">Global Shipping Policy</a>.
      </p>
    </div>
  );
}
