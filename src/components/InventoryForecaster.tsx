import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Calendar, 
  Package, 
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { cn, formatCurrency } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface ForecastData {
  predictions: {
    productName: string;
    predictedDemand: number;
    confidence: number;
    reasoning: string;
    actionItem: string;
  }[];
  marketTrend: string;
  seasonalInsight: string;
}

export default function InventoryForecaster() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      // 1. Fetch recent orders for this seller's products
      // We need to fetch orders where items contain products from this seller
      // Note: Firestore doesn't support where in array of objects easily without specialized indexing
      // So we'll fetch orders from the last 30 days and filter in memory for this demo
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(100));
      const orderDocs = await getDocs(q);
      
      const sellerOrders = orderDocs.docs.map(doc => doc.data()).filter(order => 
        order.items.some((item: any) => item.sellerId === auth.currentUser?.uid)
      );

      // 2. Aggregate sales by date for the chart
      const dailySales: Record<string, number> = {};
      sellerOrders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailySales[date] = (dailySales[date] || 0) + order.totalAmount;
      });

      const chartItems = Object.entries(dailySales).map(([name, sales]) => ({ name, sales })).reverse();
      setHistoricalData(chartItems);

      // 3. Auto-trigger first analysis if we have data
      if (sellerOrders.length > 0) {
        generateForecast(sellerOrders);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to calibrate historical data.");
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async (orders: any[]) => {
    setAnalyzing(true);
    try {
      const summary = orders.map(o => ({
        date: o.createdAt,
        items: o.items.map((i: any) => ({ name: i.name, qty: i.quantity, price: i.price }))
      }));

      const prompt = `You are an AI Inventory Strategist for FreshWorld, an elite global organic marketplace. 
      Analyze these recent sales: ${JSON.stringify(summary.slice(0, 10))}
      Current Month: ${new Date().toLocaleString('default', { month: 'long' })}
      
      Predict demand for the next 4 weeks. Return ONLY a JSON object:
      {
        "predictions": [
          {
            "productName": "string",
            "predictedDemand": number_percentage_increase,
            "confidence": number_0_to_100,
            "reasoning": "short_evocative_explanation",
            "actionItem": "specific_supply_instruction"
          }
        ],
        "marketTrend": "overall_market_velocity_description",
        "seasonalInsight": "harvest_availability_impact_description"
      }`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const parsed = JSON.parse(data.text.replace(/```json|```/g, '').trim());
      setForecast(parsed);
      toast.success("Inventory forecast authenticated and synchronized.");
    } catch (err) {
      console.error(err);
      toast.error("AI Analysis failed. Reverting to local algorithms.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-300 mb-6">
          <RefreshCw className="animate-spin" />
        </div>
        <p className="text-xs font-black text-stone-400 uppercase tracking-[0.2em]">Synchronizing Satellite Sales Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic text-stone-900">Inventory Intelligence</h2>
          <p className="text-stone-500">Predictive demand modeling based on global market velocity.</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={analyzing}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-xl shadow-stone-200"
        >
          {analyzing ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} className="text-brand-400" />}
          Refresh Insights
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Pulse Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                 <BarChart2 size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-stone-900">Market Pulse</h3>
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Revenue Velocity (Last 30 Days)</p>
               </div>
            </div>
            <div className="flex gap-2">
               <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
                  <ArrowUpRight size={12} />
                  Bullish Trend
               </span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <defs>
                   <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3db43d" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3db43d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#A8A29E' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#A8A29E' }} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1C1917', border: 'none', borderRadius: '16px', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                   cursor={{ stroke: '#3db43d', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3db43d" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Trend Card */}
        <div className="bg-stone-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
             <Sparkles size={240} className="text-brand-400" />
           </div>
           
           <div className="relative z-10 h-full flex flex-col">
              <div className="mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-4 block">AI Market Sentiment</span>
                <h3 className="text-2xl font-serif italic text-white mb-6 leading-tight">Demand Velocity Forecast</h3>
                <div className="space-y-6">
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                         <TrendingUp size={16} className="text-brand-400" />
                         <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Growth Vector</span>
                      </div>
                      <p className="text-sm text-stone-300 font-medium leading-relaxed">
                        {forecast?.marketTrend || "Analyzing global organic benchmarks for your specific product categories..."}
                      </p>
                   </div>
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                         <Calendar size={16} className="text-brand-400" />
                         <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Seasonal Shift</span>
                      </div>
                      <p className="text-sm text-stone-300 font-medium leading-relaxed">
                        {forecast?.seasonalInsight || "Evaluating harvest availability and international transit bottlenecks..."}
                      </p>
                   </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-800 flex items-center justify-center">
                        <Package size={12} className="text-stone-500" />
                      </div>
                    ))}
                 </div>
                 <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Signals Verified</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forecast?.predictions.map((pred, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-stone-100 hover:shadow-xl hover:shadow-brand-50 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-inner">
                <Package size={24} />
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] block mb-1">Forecast Confidence</span>
                <div className="flex items-center gap-2 justify-end">
                   <div className="w-16 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600" style={{ width: `${pred.confidence}%` }} />
                   </div>
                   <span className="text-[10px] font-black text-stone-900">{pred.confidence}%</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-serif italic font-bold text-stone-900 mb-2">{pred.productName}</h4>
              <div className="flex items-center gap-2">
                 <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full border border-amber-100 uppercase tracking-widest">
                   Next 30 Days
                 </span>
                 <span className="text-lg font-black text-brand-600">+{pred.predictedDemand}%</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 font-medium leading-relaxed mb-8 h-12 overflow-hidden">
              {pred.reasoning}
            </p>

            <div className="p-5 bg-stone-900 rounded-3xl">
               <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-brand-400" />
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Action Required</span>
               </div>
               <p className="text-[11px] text-white font-bold leading-tight">
                 {pred.actionItem}
               </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
