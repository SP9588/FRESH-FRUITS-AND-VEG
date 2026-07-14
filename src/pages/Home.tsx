import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, ShieldCheck, Zap, Star, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Fresh produce" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 text-brand-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
              <Globe size={14} /> International Freshness Guaranteed
            </div>
            <h1 className="text-6xl md:text-8xl font-serif text-white italic leading-[1.1] mb-8">
              The World's <br />
              <span className="not-italic font-sans font-black tracking-tighter text-brand-400">Fresh Market</span>
            </h1>
            <p className="text-xl text-stone-300 mb-10 max-w-lg leading-relaxed">
              Skip the middleman. Buy directly from premium farmers across 150+ countries. Fresh harvest to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/market" className="bg-brand-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-600/30 group">
                Shop Marketplace <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register-seller" className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center">
                Become a Seller
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats / Global Reach */}
      <section className="bg-white py-12 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between gap-8 text-center md:text-left">
          <div>
            <span className="block text-4xl font-black text-stone-900 tracking-tighter">15k+</span>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Verified Farmers</span>
          </div>
          <div className="h-10 w-[1px] bg-stone-100 hidden md:block"></div>
          <div>
            <span className="block text-4xl font-black text-stone-900 tracking-tighter">120+</span>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Global Categories</span>
          </div>
          <div className="h-10 w-[1px] bg-stone-100 hidden md:block"></div>
          <div>
            <span className="block text-4xl font-black text-stone-900 tracking-tighter">2M+</span>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Global Deliveries</span>
          </div>
          <div className="h-10 w-[1px] bg-stone-100 hidden md:block"></div>
          <div>
            <span className="block text-4xl font-black text-stone-900 tracking-tighter">98%</span>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Freshness Index</span>
          </div>
          <div className="h-10 w-[1px] bg-stone-100 hidden md:block text-brand-600">
            <Star size={32} fill="currentColor" />
          </div>
        </div>
      </section>

      {/* Featured Categories - Bento Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif italic text-stone-900 mb-2">Curated Collections</h2>
            <p className="text-stone-500">Discover the best from every corner of the planet.</p>
          </div>
          <Link to="/market" className="text-brand-600 font-bold flex items-center gap-2 hover:underline">
            Explore All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-3xl h-[600px] shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Organic Vegetables" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <span className="bg-brand-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-3 inline-block">Trending Now</span>
              <h3 className="text-3xl font-serif italic text-white mb-2">Mediterranean Greens</h3>
              <p className="text-stone-300 text-sm max-w-xs mb-6">Hand-picked from the sunny coasts of Italy and Greece. Pure nutrients.</p>
              <button className="bg-white text-stone-900 px-6 py-3 rounded-xl font-bold text-sm">Shop Collection</button>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl h-[288px] shadow-lg">
             <img 
              src="https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1965&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Exotic Fruits" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <h3 className="text-2xl font-serif italic text-white mb-1">Exotic Fruits</h3>
              <p className="text-stone-200 text-xs">Rare finds from tropical regions.</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl h-[288px] shadow-lg">
             <img 
              src="https://images.unsplash.com/photo-1590779033100-9f60705a2f3b?q=80&w=1974&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Indian Herbs" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <h3 className="text-2xl font-serif italic text-white mb-1">Herbal Bliss</h3>
              <p className="text-stone-200 text-xs">Fresh herbs from the foothills of the Himalayas.</p>
            </div>
          </div>

          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl h-[288px] shadow-lg">
             <img 
              src="https://images.unsplash.com/photo-1566385101042-1a000c1267c4?q=80&w=2070&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Farm Fresh" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-950/60"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="bg-brand-600/30 p-4 rounded-full mb-4">
                <Leaf className="text-brand-400" size={32} />
              </div>
              <h3 className="text-3xl font-serif italic text-white mb-1">100% Organic Earth</h3>
              <p className="text-stone-200 text-sm">Certified pesticide-free produce from across the globe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-stone-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-brand-600 mb-8">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Verified Authenticity</h3>
              <p className="text-stone-500 leading-relaxed">Every seller undergoes a rigorous 12-point verification process including farm visits and document audits.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-brand-600 mb-8">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Express Global Shipping</h3>
              <p className="text-stone-500 leading-relaxed">Our cold-chain logistics ensure your produce travels at peak freshness with real-time GPS tracking.</p>
            </div>
             <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-brand-600 mb-8">
                <Leaf size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Zero Waste Policy</h3>
              <p className="text-stone-500 leading-relaxed">We use innovative bio-degradable packaging and optimize routes to reduce carbon footprint by 40%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-brand-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-500 rounded-full blur-[100px] opacity-50"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-5xl md:text-7xl font-serif italic mb-8">Ready to taste the <br /> global harvest?</h2>
          <p className="text-xl text-brand-100 mb-12 max-w-xl mx-auto">Join thousands of customers who prioritize quality, transparency, and the planet.</p>
          <Link to="/market" className="bg-white text-brand-600 px-12 py-6 rounded-2xl font-black text-xl hover:bg-stone-50 transition-all shadow-2xl">
            Start Shopping Now
          </Link>
        </div>
      </section>
    </div>
  );
}
