import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, QrCode, Mail, ShieldCheck, Heart, Sparkles, Percent, Smartphone, Globe } from 'lucide-react';
import { FRESH_WORLD_PAYEE } from '../types';
import PayeeCommissionModal from './PayeeCommissionModal';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
  const { setIsPageMinimized } = useLanguage();
  const payee = FRESH_WORLD_PAYEE;

  return (
    <>
      <footer className="bg-stone-950 text-stone-400 py-16 px-6 border-t border-stone-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-serif italic font-bold text-white tracking-tight">
                {payee.platformName}
              </span>
              <span className="px-2.5 py-0.5 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                Global Agri Network
              </span>
            </div>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              Direct farm-to-table global marketplace with AI Crop Health Diagnostics, cold-chain logistics, and automated low-stock protection.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsPayeeModalOpen(true)}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
              >
                <QrCode size={16} /> Payee UPI: {payee.upiId}
              </button>
            </div>
          </div>

          {/* Payee & Commission Commercial Column */}
          <div className="space-y-4 lg:col-span-1 bg-stone-900/60 p-5 rounded-3xl border border-stone-800/80">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} /> Payee & Commission
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Official UPI ID</span>
                <button
                  onClick={() => setIsPayeeModalOpen(true)}
                  className="font-mono font-bold text-amber-300 hover:underline flex items-center gap-1"
                >
                  <Smartphone size={12} /> {payee.upiId}
                </button>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Developer Contact</span>
                <a
                  href={`mailto:${payee.developerEmail}`}
                  className="font-mono text-stone-300 hover:text-white truncate block text-[11px]"
                >
                  {payee.developerEmail}
                </a>
              </div>

              <div className="pt-1">
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Platform Fee</span>
                <span className="text-emerald-400 font-bold">{payee.commissionRate}% Commercial Slice</span>
              </div>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4">Marketplace</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/pricing" className="hover:text-brand-400 flex items-center gap-1.5 font-bold text-amber-400">
                  <Sparkles size={13} /> Subscriptions & SaaS Plans
                </Link>
              </li>
              <li>
                <Link to="/market" className="hover:text-brand-400 transition-colors">
                  All Fresh Produce
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="hover:text-brand-400 flex items-center gap-1.5 font-semibold text-brand-400">
                  <Utensils size={13} /> Seasonal Recipes
                </Link>
              </li>
              <li>
                <Link to="/market?cat=fruits" className="hover:text-brand-400 transition-colors">
                  Orchard & Tropical Fruits
                </Link>
              </li>
              <li>
                <Link to="/market?cat=vegetables" className="hover:text-brand-400 transition-colors">
                  Organic Vegetables
                </Link>
              </li>
              <li>
                <Link to="/dashboard/crop-doctor" className="hover:text-brand-400 transition-colors font-bold text-brand-500">
                  AI Crop Doctor Diagnostics
                </Link>
              </li>
            </ul>
          </div>

          {/* Seller & Platform Links */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4">Commercial & Sellers</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register-seller" className="hover:text-brand-400 transition-colors">
                  Register as Global Farmer
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-400 transition-colors">
                  Seller Portal & Analytics
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsPayeeModalOpen(true)}
                  className="hover:text-brand-400 transition-colors text-left flex items-center gap-1"
                >
                  <Percent size={12} /> Fee Structure & Settlements
                </button>
              </li>
              <li>
                <a
                  href={`mailto:${payee.developerEmail}?subject=Fresh%20World%20Commercial%20Partnership`}
                  className="hover:text-brand-400 transition-colors flex items-center gap-1"
                >
                  <Mail size={12} /> Commercial Inquiries
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto border-t border-stone-900 mt-12 pt-8 text-xs flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-400">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} {payee.platformName}.</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="text-stone-400">
              Developer: <strong className="text-stone-300">{payee.developerEmail}</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setIsPageMinimized(true)} 
              className="hover:text-emerald-400 text-stone-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Globe size={13} className="text-emerald-400" /> All 32 Languages (Minimize View)
            </button>
            <button onClick={() => setIsPayeeModalOpen(true)} className="hover:text-amber-400 flex items-center gap-1">
              <QrCode size={13} /> Payee QR Code ({payee.upiId})
            </button>
            <Link to="/market" className="hover:text-white">Directory</Link>
            <Link to="/dashboard/crop-doctor" className="hover:text-white">AI Doctor</Link>
          </div>
        </div>
      </footer>

      {/* Global Payee & Commission Modal */}
      <PayeeCommissionModal
        isOpen={isPayeeModalOpen}
        onClose={() => setIsPayeeModalOpen(false)}
      />
    </>
  );
}
