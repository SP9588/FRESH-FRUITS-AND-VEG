import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Check, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  Compass,
  Coins,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, GLOBAL_LANGUAGES, Language } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface MinimizedWebpageLanguageArenaProps {
  children: React.ReactNode;
}

export default function MinimizedWebpageLanguageArena({ children }: MinimizedWebpageLanguageArenaProps) {
  const { 
    currentLanguage, 
    setLanguageByCode, 
    isPageMinimized, 
    setIsPageMinimized,
    togglePageMinimized 
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'alphabetical'>('default');
  const [isInteractivePreview, setIsInteractivePreview] = useState<boolean>(false);

  const regions = ['All', 'South Asia', 'Asia-Pacific', 'Europe', 'Middle East & Africa', 'Americas'];

  // Filter languages
  let filtered = GLOBAL_LANGUAGES.filter(lang => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query) ||
      lang.country.toLowerCase().includes(query) ||
      lang.currency.code.toLowerCase().includes(query) ||
      lang.currency.symbol.toLowerCase().includes(query) ||
      lang.greeting.toLowerCase().includes(query);

    const matchesRegion = selectedRegion === 'All' || lang.region === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  if (sortBy === 'alphabetical') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  const handleSelectLanguage = (code: string, shouldMaximize = false) => {
    const selected = GLOBAL_LANGUAGES.find(l => l.code === code);
    setLanguageByCode(code);
    
    if (selected) {
      toast.success(
        `Language switched to ${selected.name} (${selected.nativeName})! Currency: ${selected.currency.code} (${selected.currency.symbol})`,
        { icon: selected.flag, duration: 3000 }
      );
    }

    if (shouldMaximize) {
      setIsPageMinimized(false);
    }
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", isPageMinimized ? "bg-stone-950 text-stone-100" : "")}>
      {/* Minimized View Header & Controls */}
      <AnimatePresence>
        {isPageMinimized && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-2xl px-4 sm:px-6 py-3"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold border border-brand-500/30">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-serif italic font-bold text-white tracking-wide">
                      Fresh World Language Arena
                    </h2>
                    <span className="text-[10px] bg-brand-500/20 text-brand-300 font-mono font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
                      Webpage Minimized
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    All 32 available world languages visible clearly below with live reactive webpage preview
                  </p>
                </div>
              </div>

              {/* Active language info & Maximize button */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-stone-800/80 border border-stone-700/80 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-base">{currentLanguage.flag}</span>
                  <span className="font-bold text-white">{currentLanguage.nativeName}</span>
                  <span className="text-[10px] bg-stone-700 text-stone-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {currentLanguage.currency.code}
                  </span>
                </div>

                <button
                  onClick={() => setIsPageMinimized(false)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                  title="Restore full screen webpage (Press ESC anytime)"
                >
                  <Maximize2 size={14} />
                  <span>Maximize Webpage</span>
                  <span className="text-[9px] bg-stone-950/20 px-1.5 py-0.5 rounded font-mono">ESC</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webpage Container: Scales down when minimized */}
      <div 
        className={cn(
          "transition-all duration-500 ease-out",
          isPageMinimized 
            ? "max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2" 
            : ""
        )}
      >
        {isPageMinimized ? (
          <div className="space-y-4">
            {/* Minimized Browser Chrome / Bezel */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl ring-2 ring-brand-500/30">
              {/* Window Controls Header */}
              <div className="bg-stone-900 px-4 py-2.5 border-b border-stone-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsPageMinimized(false)}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
                    title="Maximize / Restore Webpage"
                  />
                  <button 
                    onClick={() => setIsInteractivePreview(!isInteractivePreview)}
                    className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors"
                    title="Toggle Preview Interactivity"
                  />
                  <button 
                    onClick={() => setIsPageMinimized(false)}
                    className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
                    title="Maximize Webpage Fullscreen"
                  />
                </div>

                {/* Minimized URL Bar */}
                <div 
                  onClick={() => setIsPageMinimized(false)}
                  className="cursor-pointer bg-stone-950 border border-stone-800 hover:border-brand-500/50 rounded-xl px-4 py-1 text-[11px] text-stone-300 font-mono flex items-center gap-2 max-w-md w-full justify-center transition-all group"
                  title="Click to Maximize Webpage"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">https://freshworld.global/marketplace [Active: {currentLanguage.name} • {currentLanguage.currency.code}]</span>
                  <Maximize2 size={11} className="text-stone-500 group-hover:text-brand-400 transition-colors ml-auto" />
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsInteractivePreview(!isInteractivePreview)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-lg border transition-all",
                      isInteractivePreview 
                        ? "bg-brand-600 border-brand-500 text-white" 
                        : "bg-stone-800 border-stone-700 text-stone-400 hover:text-white"
                    )}
                  >
                    {isInteractivePreview ? 'Live Interactive Mode' : 'Click Preview to Maximize'}
                  </button>

                  <button
                    onClick={() => setIsPageMinimized(false)}
                    className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
                    title="Maximize Webpage"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              {/* Minimized Viewport Frame */}
              <div 
                className={cn(
                  "relative bg-stone-100 overflow-hidden select-none transition-all",
                  "max-h-[380px] sm:max-h-[460px] overflow-y-auto",
                  !isInteractivePreview && "cursor-pointer group"
                )}
                onClick={() => {
                  if (!isInteractivePreview) {
                    setIsPageMinimized(false);
                  }
                }}
              >
                {/* Scale wrapper for the live website */}
                <div 
                  className={cn(
                    "origin-top transform transition-transform duration-300",
                    "scale-[0.80] sm:scale-[0.85] w-[125%] sm:w-[117.6%]"
                  )}
                >
                  {children}
                </div>

                {/* Hover overlay hint when not in interactive mode */}
                {!isInteractivePreview && (
                  <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/20 backdrop-blur-[0.5px] transition-all flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 px-5 py-2.5 bg-stone-900/90 text-white rounded-2xl border border-stone-700 shadow-2xl flex items-center gap-2 text-xs font-bold">
                      <Maximize2 size={14} className="text-brand-400" />
                      <span>Click anywhere on preview to Maximize Webpage</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Normal Fullscreen View */
          children
        )}
      </div>

      {/* ALL AVAILABLE LANGUAGES PANORAMA (Shown prominently when webpage is minimized) */}
      <AnimatePresence>
        {isPageMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8"
          >
            {/* Section Title & Subtitle */}
            <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-brand-400 text-xs font-black uppercase tracking-widest mb-1.5">
                  <Compass size={14} /> Global Localization Matrix
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-white tracking-tight">
                  All Available Languages ({GLOBAL_LANGUAGES.length} Languages)
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm max-w-2xl mt-1">
                  Click any language below to immediately localize produce names, navigation, seasonal recipes, AI crop diagnostics, and currency settlement. Watch the minimized webpage update live!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">
                  Showing <strong className="text-white font-mono">{filtered.length}</strong> of {GLOBAL_LANGUAGES.length}
                </span>
                <button
                  onClick={() => setSortBy(sortBy === 'default' ? 'alphabetical' : 'default')}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold rounded-xl border border-stone-800 transition-colors"
                >
                  Sort: {sortBy === 'default' ? 'By Region' : 'A-Z'}
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-stone-900/80 p-4 sm:p-5 rounded-3xl border border-stone-800 space-y-4">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by language name, native script (हिन्दी, Español, 日本語, বাংলা, العربية...), country, or currency..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-stone-500 outline-none focus:border-brand-500 transition-colors"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Region Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {regions.map(r => {
                  const count = r === 'All' 
                    ? GLOBAL_LANGUAGES.length 
                    : GLOBAL_LANGUAGES.filter(l => l.region === r).length;
                  const isActive = selectedRegion === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                        isActive
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                          : "bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-white border border-stone-800/80"
                      )}
                    >
                      <span>{r}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                        isActive ? "bg-brand-700 text-white" : "bg-stone-800 text-stone-400"
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(lang => {
                const isSelected = currentLanguage.code === lang.code;
                return (
                  <div
                    key={lang.code}
                    className={cn(
                      "group p-5 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between",
                      isSelected
                        ? "bg-stone-900 border-brand-500/80 shadow-2xl shadow-brand-500/10 ring-2 ring-brand-500/40"
                        : "bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 hover:border-stone-700 hover:shadow-xl"
                    )}
                  >
                    <div>
                      {/* Top Row: Flag & Region / RTL Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-3xl filter drop-shadow-sm">{lang.flag}</span>
                        <div className="flex items-center gap-1.5">
                          {lang.dir === 'rtl' && (
                            <span className="text-[9px] bg-amber-950/80 text-amber-400 border border-amber-800/60 font-mono font-bold px-1.5 py-0.5 rounded">
                              RTL
                            </span>
                          )}
                          <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-mono">
                            {lang.region}
                          </span>
                        </div>
                      </div>

                      {/* Native Name (Prominent & Clear) */}
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                        {lang.nativeName}
                      </h3>

                      {/* English Name & Country */}
                      <p className="text-xs text-stone-400 font-medium">
                        {lang.name} <span className="text-stone-600">•</span> {lang.country}
                      </p>

                      {/* Native Greeting */}
                      <div className="mt-2.5 px-3 py-1.5 bg-stone-950/60 rounded-xl border border-stone-800/60 text-[11px] text-stone-300 flex items-center gap-1.5">
                        <span className="text-brand-400 font-bold">Greeting:</span>
                        <span className="truncate italic">{lang.greeting}</span>
                      </div>

                      {/* Currency Details */}
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-stone-800/60">
                        <div className="flex items-center gap-1.5 text-stone-400">
                          <Coins size={13} className="text-amber-400" />
                          <span className="font-mono font-bold text-white">
                            {lang.currency.code} ({lang.currency.symbol})
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          1 USD ≈ {lang.currency.rateVsUsd} {lang.currency.code}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleSelectLanguage(lang.code, false)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                          isSelected
                            ? "bg-brand-600 text-white"
                            : "bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white"
                        )}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} /> Active
                          </>
                        ) : (
                          'Select'
                        )}
                      </button>

                      <button
                        onClick={() => handleSelectLanguage(lang.code, true)}
                        className="p-2 bg-stone-800 hover:bg-brand-600 text-stone-400 hover:text-white rounded-xl transition-all"
                        title="Apply & Maximize Webpage"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Currently Selected: {currentLanguage.name} ({currentLanguage.nativeName})
                  </h4>
                  <p className="text-xs text-stone-400">
                    Live currency conversion active with {currentLanguage.currency.code} ({currentLanguage.currency.symbol})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPageMinimized(false)}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-brand-600/20 transition-all hover:scale-105"
              >
                <Maximize2 size={16} />
                <span>Return to Full Webpage</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Quick Button when page is minimized */}
      {isPageMinimized && (
        <button
          onClick={() => setIsPageMinimized(false)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs hover:scale-105 transition-all ring-4 ring-black/40"
        >
          <Maximize2 size={16} />
          <span>Maximize Webpage</span>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">ESC</span>
        </button>
      )}
    </div>
  );
}
