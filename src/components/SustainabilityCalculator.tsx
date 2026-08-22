import React, { useState, useMemo } from 'react';
import { 
  Leaf, 
  Ship, 
  Truck, 
  Train, 
  Plane, 
  Globe, 
  TreeDeciduous, 
  Car, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Info, 
  Sliders, 
  RefreshCw 
} from 'lucide-react';
import { 
  calculateProductCarbonFootprint, 
  TRANSPORT_MODES, 
  COUNTRY_DISTANCES_KM, 
  CarbonCalculationResult 
} from '../lib/sustainability';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface SustainabilityCalculatorProps {
  productName: string;
  originCountry: string;
  isOrganic: boolean;
  quantityKg?: number;
  packagingType?: 'Eco-Sustainable' | 'Standard' | 'Luxury Gift Box';
  onOffsetAdded?: (isOffset: boolean) => void;
}

export default function SustainabilityCalculator({
  productName,
  originCountry,
  isOrganic,
  quantityKg = 1,
  packagingType = 'Eco-Sustainable',
  onOffsetAdded
}: SustainabilityCalculatorProps) {
  const defaultDistance = COUNTRY_DISTANCES_KM[originCountry] || 3500;
  const [distanceKm, setDistanceKm] = useState<number>(defaultDistance);
  const [selectedModeId, setSelectedModeId] = useState<string>('sea');
  const [isOffsetActive, setIsOffsetActive] = useState<boolean>(false);

  const calc: CarbonCalculationResult = useMemo(() => {
    return calculateProductCarbonFootprint({
      originCountry,
      isOrganic,
      quantityKg,
      selectedModeId,
      customDistanceKm: distanceKm,
      packagingType
    });
  }, [originCountry, isOrganic, quantityKg, selectedModeId, distanceKm, packagingType]);

  const handleToggleOffset = () => {
    const nextState = !isOffsetActive;
    setIsOffsetActive(nextState);
    if (onOffsetAdded) onOffsetAdded(nextState);
    if (nextState) {
      toast.success("🌱 $0.35 Reforestation Offset added! Your order is 100% Carbon Neutral.");
    } else {
      toast.success("Carbon offset removed.");
    }
  };

  const getModeIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case 'Ship': return <Ship size={size} />;
      case 'Train': return <Train size={size} />;
      case 'Truck': return <Truck size={size} />;
      case 'Plane': return <Plane size={size} />;
      default: return <Truck size={size} />;
    }
  };

  const getGradeColorClass = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-500 text-white border-emerald-400';
      case 'A': return 'bg-emerald-600 text-white border-emerald-500';
      case 'B': return 'bg-teal-600 text-white border-teal-500';
      case 'C': return 'bg-amber-500 text-white border-amber-400';
      default: return 'bg-rose-500 text-white border-rose-400';
    }
  };

  return (
    <div className="bg-stone-900 text-white rounded-[2.5rem] p-6 md:p-8 border border-stone-800 shadow-2xl space-y-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <Leaf size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Eco-Analytics & Footprint Engine
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-serif italic text-white font-medium">
              Sustainability & Carbon Impact
            </h3>
          </div>
        </div>

        {/* Live Carbon Neutrality Badge */}
        {isOffsetActive ? (
          <span className="px-4 py-2 bg-emerald-500 text-stone-950 font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={16} /> 100% Carbon Neutral Order
          </span>
        ) : (
          <span className="px-3 py-1.5 bg-stone-800 text-stone-300 border border-stone-700 font-bold text-xs rounded-full flex items-center gap-1.5">
            <Globe size={14} className="text-brand-400" /> Origin: {originCountry}
          </span>
        )}
      </div>

      {/* Main Score & Metric Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Badge Card */}
        <div className="bg-stone-800/80 p-6 rounded-3xl border border-stone-700/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
              Sustainability Score
            </span>
            <span className="text-[10px] font-bold text-stone-400">Out of 100</span>
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black font-serif italic border shadow-xl shrink-0", getGradeColorClass(calc.sustainabilityGrade))}>
              {calc.sustainabilityGrade}
            </div>

            <div>
              <div className="text-3xl font-black text-white">{calc.sustainabilityScore}</div>
              <p className="text-xs font-bold text-emerald-400">
                {calc.sustainabilityScore >= 80 ? 'Exceptional Low-Impact Produce' : 'Standard Eco Profile'}
              </p>
            </div>
          </div>

          <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-700 rounded-full"
              style={{ width: `${calc.sustainabilityScore}%` }}
            />
          </div>
        </div>

        {/* Estimated Carbon Footprint Card */}
        <div className="bg-stone-800/80 p-6 rounded-3xl border border-stone-700/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
              Shipping Carbon Footprint
            </span>
            <span className="text-[9px] font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
              {calc.mode.name}
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{calc.netCo2eKgTotal}</span>
              <span className="text-sm font-bold text-stone-400">kg CO₂e</span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium">
              ({calc.netCo2eKgPerUnit} kg CO₂e per {quantityKg} kg produce)
            </p>
          </div>

          <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between text-[11px] text-stone-400">
            <span>Gross: {calc.grossTransportCo2eKg} kg</span>
            <span className="text-emerald-400 font-bold">-{calc.organicOffsetKg} kg Offset</span>
          </div>
        </div>

        {/* Real-World Impact Equivalence Card */}
        <div className="bg-stone-800/80 p-6 rounded-3xl border border-stone-700/80 flex flex-col justify-between space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Real-World Impact Equivalents
          </span>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-stone-700 text-amber-400 flex items-center justify-center shrink-0">
                <Car size={16} />
              </div>
              <div>
                <span className="font-bold text-white">{calc.carKmEquivalent} km</span>
                <p className="text-[10px] text-stone-400">Petrol car driving equivalent</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-stone-700 text-emerald-400 flex items-center justify-center shrink-0">
                <TreeDeciduous size={16} />
              </div>
              <div>
                <span className="font-bold text-white">{calc.treeDaysEquivalent} tree-days</span>
                <p className="text-[10px] text-stone-400">Tree absorption required</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Transport & Distance Controls */}
      <div className="p-6 bg-stone-800/50 rounded-3xl border border-stone-700/60 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-widest text-stone-300 flex items-center gap-2">
            <Sliders size={16} className="text-brand-400" />
            Mode of Transport & Logistics Corridor
          </h4>
          <span className="text-[10px] text-stone-400 font-bold">Select shipping method to calculate emissions</span>
        </div>

        {/* Transport Modes Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TRANSPORT_MODES.map((mode) => {
            const isSelected = selectedModeId === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedModeId(mode.id)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2",
                  isSelected
                    ? "bg-brand-600/20 text-white border-brand-500 shadow-lg shadow-brand-600/20"
                    : "bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-xl", isSelected ? "bg-brand-500 text-white" : "bg-stone-700 text-stone-300")}>
                    {getModeIcon(mode.iconName, 18)}
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                    mode.ecoRating === 'High' ? "bg-emerald-950 text-emerald-400" :
                    mode.ecoRating === 'Medium' ? "bg-amber-950 text-amber-400" : "bg-rose-950 text-rose-400"
                  )}>
                    {mode.ecoRating} Eco
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-white">{mode.name}</div>
                  <div className="text-[10px] text-stone-400">{mode.speed}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Distance Range Slider */}
        <div className="space-y-2 pt-2 border-t border-stone-700/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-300">Transit Distance: {distanceKm.toLocaleString()} km</span>
            <button 
              type="button" 
              onClick={() => setDistanceKm(defaultDistance)}
              className="text-[10px] text-brand-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw size={10} /> Reset to Origin Default ({originCountry})
            </button>
          </div>

          <input 
            type="range"
            min={200}
            max={12000}
            step={100}
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full accent-brand-500 h-2 bg-stone-700 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold">
            <span>200 km (Local Farm)</span>
            <span>6,000 km (Trans-Continental)</span>
            <span>12,000 km (Intercontinental)</span>
          </div>
        </div>
      </div>

      {/* Sustainability Badges */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mr-2">Verified Eco Credentials:</span>
        {calc.badges.map((b, idx) => (
          <span 
            key={idx}
            className="px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Check size={12} />
            {b}
          </span>
        ))}
      </div>

      {/* Optional Reforestation Offset Action Card */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 to-stone-900 rounded-3xl border border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
            <TreeDeciduous size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Neutralize Shipping Emissions</h4>
            <p className="text-xs text-stone-300">
              Contribute $0.35 towards certified organic tree planting to make this delivery 100% carbon neutral.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleOffset}
          className={cn(
            "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
            isOffsetActive
              ? "bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/30"
              : "bg-white text-stone-900 hover:bg-emerald-400"
          )}
        >
          {isOffsetActive ? <Check size={16} /> : <Sparkles size={16} />}
          {isOffsetActive ? "Offset Active ($0.35)" : "Add Carbon Offset ($0.35)"}
        </button>
      </div>
    </div>
  );
}
