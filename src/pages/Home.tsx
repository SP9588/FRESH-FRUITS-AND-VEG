import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Star, 
  Leaf, 
  Sparkles, 
  CreditCard, 
  RefreshCw, 
  QrCode,
  Share2,
  Copy,
  Check,
  Receipt,
  Code2,
  X,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FRESH_WORLD_PAYEE } from '../types';
import { SOCIAL_PLATFORMS } from '../services/socialShareService';
import UniversalSaaSSocialHub from '../components/UniversalSaaSSocialHub';
import { toast } from 'react-hot-toast';

export default function Home() {
  const { setIsPageMinimized, currentLanguage } = useLanguage();
  const [isShareHubModalOpen, setIsShareHubModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${siteUrl}/pricing`;
  const shareText = 'Fresh World Universal Subscription & SaaS Platform — flexible 3, 6, 12-month auto-renewals, direct UPI payment, and global SaaS embed!';
  const shareTitle = 'Fresh World Universal SaaS Platform';

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success('Point 6: Universal SaaS Share link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const topPlatforms = SOCIAL_PLATFORMS.slice(0, 8);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center pt-20 pb-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Fresh produce" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Hero Copy & Marketplace Entrance */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              <button
                onClick={() => setIsPageMinimized(true)}
                className="inline-flex items-center gap-2 bg-brand-600/30 hover:bg-brand-600/50 border border-brand-400/50 text-white px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-lg"
                title="Click to minimize webpage and view all available languages clearly"
              >
                <Globe size={14} className="text-amber-300" />
                <span>32+ World Languages Available</span>
                <span className="text-[10px] bg-brand-500/40 text-brand-200 px-2 py-0.5 rounded-full border border-brand-400/30">
                  Click to Minimize & View
                </span>
              </button>
              <h1 className="text-5xl md:text-7xl font-serif text-white italic leading-[1.1] mb-6">
                The World's <br />
                <span className="not-italic font-sans font-black tracking-tighter text-brand-400">Fresh Market</span>
              </h1>
              <p className="text-lg text-stone-300 mb-8 max-w-lg leading-relaxed">
                Skip the middleman. Buy directly from premium farmers across 150+ countries. Fresh harvest to your doorstep.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/market" className="bg-brand-600 text-white px-7 py-4 rounded-2xl font-bold text-sm hover:bg-brand-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-600/30 group">
                  Shop Marketplace <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={() => setIsPageMinimized(true)}
                  className="bg-stone-900/80 hover:bg-stone-900 text-white border border-stone-700/80 px-5 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105"
                >
                  <Globe size={17} className="text-brand-400" />
                  <span>All Languages (Minimize)</span>
                </button>
                <Link to="/register-seller" className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center">
                  Become a Seller
                </Link>
              </div>

              {/* Default Price and Invoice status chip */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Receipt size={14} className="text-emerald-400" />
                  <span>Default Shopping Price & Invoice:</span>
                  <Link 
                    to="/cart"
                    className="font-mono font-black text-emerald-400 bg-emerald-950/70 border border-emerald-600/50 px-2.5 py-0.5 rounded hover:bg-emerald-900 transition-all"
                  >
                    ₹0 (0 Rupees Default)
                  </Link>
                </div>
                <span className="text-stone-500">•</span>
                <span className="text-stone-400">
                  Payee UPI: <strong className="font-mono text-stone-200">{FRESH_WORLD_PAYEE.upiId}</strong>
                </span>
              </div>
            </motion.div>

            {/* Right Column / Right Corner: Point 6. Universal SaaS Share Hub */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-2xl border-2 border-brand-500/50 rounded-3xl p-6 shadow-2xl text-white space-y-4 relative overflow-hidden">
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Point 6 Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-400 text-stone-950 font-black text-[11px] rounded uppercase tracking-wider shadow-sm font-mono">
                      Point 6
                    </span>
                    <span className="text-xs font-black text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      Universal SaaS Share Hub
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full border border-stone-700">
                    19+ Networks
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-serif italic text-white font-bold leading-snug">
                    Global Distribution & SaaS Customization
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed mt-1">
                    Promote your membership & services globally across 19+ networking sites, or embed into any SaaS platform.
                  </p>
                </div>

                {/* Default Shopping Price & Invoice 0 Rupees Banner */}
                <div className="bg-stone-800/90 border border-stone-700 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Receipt size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-stone-300 text-[11px]">Default Invoice & Shopping Price:</span>
                  </div>
                  <Link
                    to="/cart"
                    className="font-mono font-black text-emerald-400 bg-emerald-950/70 border border-emerald-600/40 px-2 py-0.5 rounded text-xs hover:bg-emerald-900 transition-all shrink-0"
                    title="View default 0 Rupees invoice"
                  >
                    ₹0 (0 Rupees) →
                  </Link>
                </div>

                {/* Instant 1-Click Social Broadcast Grid */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-stone-400">
                    <span>Instant 1-Click Share:</span>
                    <span className="text-brand-400">19 Sites Supported</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {topPlatforms.map((p) => {
                      const link = p.shareUrlTemplate(shareUrl, shareText, shareTitle);
                      return (
                        <a
                          key={p.id}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 hover:border-brand-500/50 transition-all group"
                          title={`Share to ${p.name}`}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: p.iconColor }}
                          >
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[10px] text-stone-300 mt-1 truncate max-w-full font-medium">
                            {p.name.split(' ')[0]}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyShareUrl}
                      className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Copied Link!' : 'Copy Share URL'}</span>
                    </button>

                    <button
                      onClick={() => setIsShareHubModalOpen(true)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Share2 size={14} />
                      <span>Open Full Hub (19+)</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 px-1 pt-1">
                    <span className="flex items-center gap-1">
                      <Code2 size={12} className="text-brand-400" /> Developer REST API
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers size={12} className="text-emerald-400" /> Embed Widget & iframe
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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

      {/* AI Seasonal Recipes Banner */}
      <section className="bg-stone-900 py-20 px-6 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3.5 py-1.5 bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-black uppercase tracking-widest rounded-full inline-block">
              AI-Powered Kitchen Studio
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic leading-tight">
              Turn Fresh Marketplace Harvest into Gourmet Seasonal Dishes
            </h2>
            <p className="text-stone-300 text-base leading-relaxed">
              Not sure what to cook with today's freshly landed Sicilian tomatoes or Kashmiri apples? Our AI Master Chef generates bespoke recipes tailored specifically to the produce currently in stock.
            </p>
            <div className="pt-2">
              <Link to="/recipes" className="inline-flex items-center gap-3 bg-brand-600 hover:bg-brand-500 text-white font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-brand-600/30 transition-all hover:scale-105">
                Explore Seasonal AI Recipes <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-square">
                <img src="https://images.unsplash.com/photo-1592417817098-8f3d6eb16082?w=600&auto=format&fit=crop&q=80" alt="Gazpacho" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 bg-stone-800 rounded-2xl border border-stone-700 text-xs">
                <div className="font-bold text-white mb-1">Sicilian Tomato Gazpacho</div>
                <div className="text-stone-400">Matched to Ruby Red Tomatoes</div>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-4 bg-stone-800 rounded-2xl border border-stone-700 text-xs">
                <div className="font-bold text-white mb-1">Kashmiri Apple & Avocado Salad</div>
                <div className="text-stone-400">Matched to Fresh Hass Avocados</div>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-square">
                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80" alt="Superfood Salad" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Subscription, Auto-Renewal & Product Validity Section */}
      <section className="py-20 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-900 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <RefreshCw size={13} className="text-brand-600" />
                <span>Universal SaaS Subscription Engine</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
                Flexible Durations, Instant Validity & Auto-Renewal
              </h2>
              <p className="text-stone-600 text-sm max-w-2xl mt-2">
                Subscribe for 3 months, 6 months, 12 months (365 days), or Lifetime access. Pay directly via UPI (<strong className="font-mono text-stone-800">{FRESH_WORLD_PAYEE.upiId}</strong>) or Razorpay with automated commercial tax invoices.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/pricing"
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
              >
                <span>View All Subscription Plans</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/dashboard/subscriptions"
                className="px-6 py-3.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all"
              >
                Manage My Subscriptions
              </Link>
            </div>
          </div>

          {/* 4 Duration Cards Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                duration: '3 Months (90 Days)',
                name: 'Standard Merchant',
                price: '₹399',
                renew: '₹399 renewal',
                desc: 'Ideal for seasonal growers and emerging farm cooperatives.',
                tag: '7 Days Free Trial'
              },
              {
                duration: '12 Months (365 Days)',
                name: 'Annual Enterprise Pro',
                price: '₹1200',
                renew: '₹1200 / 365 Days',
                desc: 'Full digital infrastructure suite with priority cold-chain reefer access.',
                tag: 'Best Value (₹100/mo)',
                featured: true
              },
              {
                duration: '6 Months (180 Days)',
                name: 'Commercial Producer',
                price: '₹699',
                renew: '₹699 renewal',
                desc: 'Tailored for high-volume regional distributors and exporters.',
                tag: 'Semi-Annual Saver'
              },
              {
                duration: 'Lifetime License',
                name: 'Founders Pass',
                price: '₹4999',
                renew: 'Zero Recurring Fees',
                desc: 'Permanent non-expiring license with dedicated developer desk.',
                tag: 'One-Time Ownership'
              }
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all ${
                  tier.featured 
                    ? 'bg-stone-900 text-white ring-2 ring-brand-500 shadow-xl' 
                    : 'bg-white border border-stone-200 shadow-sm hover:border-stone-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${tier.featured ? 'text-brand-400' : 'text-stone-400'}`}>
                      {tier.duration}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.featured ? 'bg-brand-500 text-stone-950' : 'bg-stone-100 text-stone-700'}`}>
                      {tier.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-black">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono">{tier.price}</span>
                    <span className={`text-xs ${tier.featured ? 'text-stone-400' : 'text-stone-500'}`}>
                      {tier.renew}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${tier.featured ? 'text-stone-300' : 'text-stone-500'}`}>
                    {tier.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-100/20">
                  <Link
                    to="/pricing"
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                      tier.featured 
                        ? 'bg-brand-500 hover:bg-brand-400 text-stone-950' 
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    <span>View Plan Details</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Point 6. Universal SaaS Share Hub Showcase Section */}
      <section id="point-6-saas-share-hub" className="py-20 bg-stone-900 text-white border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-800 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3 font-mono">
                <Sparkles size={13} className="text-amber-400" />
                <span>Point 6 · Universal SaaS Share Hub</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Global Multi-Network Sharing & SaaS Customization
              </h2>
              <p className="text-stone-300 text-sm max-w-2xl mt-2">
                Broadcast this digital platform globally across 19+ networking sites or integrate the recurring engine into any SaaS website, mobile app, or marketplace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/cart"
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-sm"
              >
                <Receipt size={14} className="text-emerald-400" />
                <span>Default Shopping Price: <strong className="text-emerald-400 font-mono">₹0 (0 Rupees)</strong></span>
              </Link>
              <button
                onClick={() => setIsShareHubModalOpen(true)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 size={14} />
                <span>Expand Hub Modal</span>
              </button>
            </div>
          </div>

          <UniversalSaaSSocialHub />
        </div>
      </section>

      {/* Persistent Right Corner Floating Launcher for Point 6 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed right-4 bottom-6 sm:bottom-8 z-40"
      >
        <button
          onClick={() => setIsShareHubModalOpen(true)}
          className="bg-stone-900/95 hover:bg-stone-900 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-2xl shadow-2xl border-2 border-brand-500/60 hover:border-brand-400 flex items-center gap-3 hover:scale-105 transition-all cursor-pointer backdrop-blur-xl group"
          title="Point 6. Universal SaaS Share Hub (19+ Social Platforms & Embed Code)"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-stone-950 font-black shadow-md">
              <Share2 size={18} className="text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded font-mono">
                Point 6
              </span>
              <span className="text-xs font-bold text-white">Universal SaaS Share Hub</span>
            </div>
            <div className="text-[10px] text-stone-400">19+ Social Platforms · Embed SaaS</div>
          </div>
        </button>
      </motion.div>

      {/* Interactive Modal for Universal SaaS Share Hub */}
      <AnimatePresence>
        {isShareHubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-stone-900 text-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-stone-700 shadow-2xl relative my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 bg-amber-400 text-stone-950 font-black text-xs rounded-lg uppercase font-mono">
                    Point 6
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      Universal SaaS Share Hub (19+ Networks)
                    </h2>
                    <p className="text-xs text-stone-400">
                      Direct share links, developer REST API documentation, and customizable embed widgets.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsShareHubModalOpen(false)}
                  className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-all cursor-pointer"
                  title="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <UniversalSaaSSocialHub />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
