import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Globe, Leaf, Zap, ShieldCheck } from 'lucide-react';

export default function Auth() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left Pane - Visual */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-brand-950">
        <img 
          src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1992&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" 
          alt="Fresh Farm" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-x-12 bottom-20 z-10">
           <div className="flex gap-4 mb-8">
             <div className="bg-brand-600 p-4 rounded-3xl text-white shadow-xl">
               <Globe size={40} />
             </div>
             <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl text-white border border-white/10 shadow-xl">
               <Leaf size={40} />
             </div>
           </div>
           <h2 className="text-6xl font-serif italic text-white mb-6 leading-tight">Fresh harvest from <br /> every corner of <br /> the earth.</h2>
           <p className="text-brand-200 text-lg max-w-sm font-medium">Join the global revolution in fresh produce trading.</p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif italic text-stone-900 mb-2">Welcome Back</h1>
            <p className="text-stone-500 font-medium">Continue your journey with FreshWorld</p>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleLogin}
              className="w-full bg-white border-2 border-stone-100 py-4 px-6 rounded-[24px] flex items-center justify-center gap-4 hover:border-brand-500 hover:shadow-xl transition-all group font-bold text-stone-700"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg" className="h-6 w-6" alt="Google" />
              Sign in with Google
            </button>
            
            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
               <div className="relative flex justify-center text-xs uppercase font-black text-stone-300 tracking-[0.2em]"><span className="bg-stone-50 px-4">Secure Gateway</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white rounded-2xl border border-stone-100 text-center">
                 <Zap className="mx-auto mb-2 text-amber-500" size={20} />
                 <p className="text-[10px] font-black uppercase text-stone-400">Fast Access</p>
               </div>
               <div className="p-4 bg-white rounded-2xl border border-stone-100 text-center">
                 <ShieldCheck className="mx-auto mb-2 text-brand-600" size={20} />
                 <p className="text-[10px] font-black uppercase text-stone-400">Secure Data</p>
               </div>
            </div>
          </div>

          <p className="mt-12 text-center text-xs text-stone-400 leading-relaxed font-medium">
            New here? Simply sign in with Google to create your account. <br />
            By signing in, you agree to our <a href="#" className="underline text-stone-600">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
