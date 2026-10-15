import React, { useState } from 'react';
import { Globe, Search, Check, X, Sparkles, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useLanguage, GLOBAL_LANGUAGES, Language } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'footer' | 'floating' | 'modal';
  className?: string;
}

export default function LanguageSelector({ variant = 'navbar', className }: LanguageSelectorProps) {
  const { currentLanguage, setLanguageByCode, t, isPageMinimized, setIsPageMinimized } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegionFilter, setActiveRegionFilter] = useState<string>('All');

  const filteredLanguages = GLOBAL_LANGUAGES.filter(lang => {
    const matchesQuery = 
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = activeRegionFilter === 'All' || lang.region === activeRegionFilter;

    return matchesQuery && matchesRegion;
  });

  const regions = ['All', 'Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa', 'South Asia'];

  const handleSelect = (code: string) => {
    setLanguageByCode(code);
    setIsOpen(false);
  };

  const handleMinimizeAndShowAll = () => {
    setIsOpen(false);
    setIsPageMinimized(true);
  };

  if (variant === 'floating') {
    if (isPageMinimized) return null; // Hide floating trigger when already in minimized view

    return (
      <>
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={handleMinimizeAndShowAll}
            className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-3 rounded-full shadow-2xl border border-brand-400/40 text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
            title="Minimize webpage to clearly view all available languages"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span className="hidden sm:inline">Minimize & View All Languages</span>
            <span className="sm:hidden">All Languages</span>
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "bg-stone-900/90 text-white backdrop-blur-md px-4 py-3 rounded-full shadow-2xl border border-stone-700/80 hover:bg-stone-800 transition-all flex items-center gap-2 group hover:scale-105",
              className
            )}
            title="Open quick language selector"
          >
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="text-xs font-bold font-serif italic">{currentLanguage.nativeName}</span>
            <span className="text-[10px] font-black uppercase text-brand-400 bg-brand-950/80 px-2 py-0.5 rounded-full border border-brand-800">
              {currentLanguage.currency.code}
            </span>
            <Globe size={14} className="text-stone-400 group-hover:rotate-45 transition-transform" />
          </button>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-stone-900 text-white rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-hidden border border-stone-800 shadow-2xl relative flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif italic text-white font-medium">
                        Global Marketplace Localization
                      </h3>
                      <p className="text-xs text-stone-400">
                        Select from 32+ major world languages & automatic currency pairing
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Prominent Minimize Webpage Banner */}
                <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-brand-900/60 via-stone-800 to-emerald-950/60 border border-brand-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Full Screen Panoramic Overview</h4>
                      <p className="text-[11px] text-stone-300">Minimize the webpage to see all 32+ languages laid out clearly side-by-side</p>
                    </div>
                  </div>
                  <button
                    onClick={handleMinimizeAndShowAll}
                    className="px-3.5 py-2 bg-brand-500 hover:bg-brand-400 text-stone-950 rounded-xl text-xs font-black whitespace-nowrap shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Minimize Webpage</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Search & Region Filters */}
                <div className="p-6 border-b border-stone-800 space-y-4 bg-stone-950/40">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search language name (e.g., Spanish, Español, हिंदी, 中文, العربية)..."
                      className="w-full bg-stone-800 border border-stone-700 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-stone-500 outline-none focus:border-brand-500 transition-colors"
                    />
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {regions.map(r => (
                      <button
                        key={r}
                        onClick={() => setActiveRegionFilter(r)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all",
                          activeRegionFilter === r
                            ? "bg-brand-600 text-white"
                            : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Grid */}
                <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {filteredLanguages.map(lang => {
                    const isSelected = currentLanguage.code === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all flex items-center justify-between group",
                          isSelected
                            ? "bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-600/20"
                            : "bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800 hover:border-stone-600"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                                {lang.nativeName}
                              </span>
                              {lang.dir === 'rtl' && (
                                <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.2 rounded font-mono">
                                  RTL
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 block">
                              {lang.name} • {lang.currency.code} ({lang.currency.symbol})
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-brand-500 text-stone-950 flex items-center justify-center">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer status */}
                <div className="p-4 border-t border-stone-800 bg-stone-950 text-center text-[11px] text-stone-400 flex items-center justify-between px-6">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    AI Real-time Translation Enabled
                  </span>
                  <span>Active: <strong className="text-white">{currentLanguage.name} ({currentLanguage.nativeName})</strong></span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Navbar or compact dropdown variant
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-800 transition-all text-xs font-bold border border-stone-200/60",
          className
        )}
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden sm:inline font-serif italic">{currentLanguage.nativeName}</span>
        <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
          {currentLanguage.currency.code}
        </span>
        <Globe size={14} className="text-stone-500" />
      </button>

      {/* Reusable modal trigger */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 text-white rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-hidden border border-stone-800 shadow-2xl relative flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif italic text-white font-medium">
                      Select Marketplace Language
                    </h3>
                    <p className="text-xs text-stone-400">
                      Supports 32+ languages with localized currency rates and RTL support
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Prominent Minimize Webpage Banner */}
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-brand-900/60 via-stone-800 to-emerald-950/60 border border-brand-500/40 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Full Screen Panoramic Overview</h4>
                    <p className="text-[11px] text-stone-300">Minimize the webpage to see all 32+ languages laid out clearly side-by-side</p>
                  </div>
                </div>
                <button
                  onClick={handleMinimizeAndShowAll}
                  className="px-3.5 py-2 bg-brand-500 hover:bg-brand-400 text-stone-950 rounded-xl text-xs font-black whitespace-nowrap shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Minimize Webpage</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Search & Region Filters */}
              <div className="p-6 border-b border-stone-800 space-y-4 bg-stone-950/40">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search language (e.g., French, Español, हिंदी, 日本語)..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-stone-500 outline-none focus:border-brand-500 transition-colors"
                  />
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {regions.map(r => (
                    <button
                      key={r}
                      onClick={() => setActiveRegionFilter(r)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all",
                        activeRegionFilter === r
                          ? "bg-brand-600 text-white"
                          : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Grid */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {filteredLanguages.map(lang => {
                  const isSelected = currentLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all flex items-center justify-between group",
                        isSelected
                          ? "bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-600/20"
                          : "bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800 hover:border-stone-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                              {lang.nativeName}
                            </span>
                            {lang.dir === 'rtl' && (
                              <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.2 rounded font-mono">
                                RTL
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 block">
                            {lang.name} • {lang.currency.code} ({lang.currency.symbol})
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-brand-500 text-stone-950 flex items-center justify-center">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer status */}
              <div className="p-4 border-t border-stone-800 bg-stone-950 text-center text-[11px] text-stone-400 flex items-center justify-between px-6">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  AI Dynamic Language Engine
                </span>
                <span>Current: <strong className="text-white">{currentLanguage.name} ({currentLanguage.nativeName})</strong></span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
