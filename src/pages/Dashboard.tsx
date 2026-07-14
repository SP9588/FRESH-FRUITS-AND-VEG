import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  PieChart, 
  TrendingUp, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Target,
  ShieldHalf,
  Percent
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cn, formatCurrency } from '../lib/utils';
import SellerApprovals from '../components/SellerApprovals';
import AdminSettings from '../components/AdminSettings';
import InventoryManager from '../components/InventoryManager';
import InventoryForecaster from '../components/InventoryForecaster';

const data = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
];

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Total Revenue', value: '$84,240', change: '+12.5%', icon: TrendingUp, color: 'text-brand-600' },
        { label: 'Active Orders', value: '1,284', change: '+3.2%', icon: ShoppingCart, color: 'text-amber-500' },
        { label: 'Total Products', value: '42', change: '0%', icon: Package, color: 'text-blue-500' },
        { label: 'Global Reach', value: '12 Countries', change: '+2', icon: Target, color: 'text-purple-500' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-3 rounded-2xl bg-stone-50", stat.color)}>
              <stat.icon size={24} />
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">{stat.change}</span>
          </div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
          <h3 className="text-2xl font-black text-stone-900 tracking-tight">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
}

function MainOverview() {
  const [sellerProfile, setSellerProfile] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userUid = auth.currentUser?.uid;
        if (userUid) {
          const q = query(collection(db, 'sellers'), where('uid', '==', userUid));
          const docSnap = await getDocs(q);
          if (!docSnap.empty) {
            setSellerProfile(docSnap.docs[0].data());
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif italic text-stone-900">Performance Snapshot</h2>
          <p className="text-stone-500">Real-time analytics for your global operations.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {sellerProfile && (
            <div className="hidden sm:flex bg-brand-50 border border-brand-100 px-5 py-2.5 rounded-2xl items-center gap-3">
               <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center text-white">
                  <Percent size={16} />
               </div>
               <div>
                  <p className="text-[8px] font-black text-brand-600 uppercase tracking-widest leading-none mb-1">Commission Rate</p>
                  <p className="text-base font-black text-stone-900">{sellerProfile.commissionRate || 8}%</p>
               </div>
            </div>
          )}
          <div className="flex gap-3">
             <button className="bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-sm shadow-xl shadow-stone-200">
               <Plus size={18} /> Add New Product
             </button>
          </div>
        </div>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-stone-900">Revenue Growth</h3>
            <select className="bg-stone-50 border-none rounded-xl text-sm font-bold px-4 py-2 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3db43d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3db43d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#A8A29E' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#A8A29E' }} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1C1917', border: 'none', borderRadius: '16px', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3db43d" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-stone-900 p-8 rounded-[40px] shadow-2xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110">
             <ShieldHalf size={120} className="text-brand-400" />
           </div>
           <div className="relative z-10 h-full flex flex-col">
              <div className="mb-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-4 block">AI Insights</span>
                <h3 className="text-2xl font-serif italic text-white mb-6">Inventory Prediction</h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-8">
                  Based on seasonal trends in <span className="text-white font-bold">Western Europe</span>, we recommend increasing your <span className="text-brand-400 font-bold">Organic Tomato</span> stock by 25% for the next 2 weeks.
                </p>
                <div className="space-y-4">
                   <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between">
                     <span className="text-xs text-stone-300">Confidence Score</span>
                     <span className="text-sm font-bold text-brand-400">92%</span>
                   </div>
                   <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between">
                     <span className="text-xs text-stone-300">Expected ROI</span>
                     <span className="text-sm font-bold text-brand-400">+14.2%</span>
                   </div>
                </div>
              </div>
              <button className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black text-sm mt-8 hover:bg-brand-500 transition-all">
                Execute AI Suggestion
              </button>
           </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-8 pb-0 flex items-center justify-between">
           <h3 className="text-xl font-bold text-stone-900">Recent Shipments</h3>
           <button className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">View All <ExternalLink size={12} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-50">
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Origin</th>
                <th className="px-8 py-6">Destination</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: '#FW-9284', product: 'Ruby Red Tomatoes', origin: '🇮🇹 Italy', dest: '🇺🇸 USA', status: 'In Transit', amount: '$420.00' },
                { id: '#FW-9285', product: 'Honey Mangoes', origin: '🇹🇭 Thailand', dest: '🇦🇪 UAE', status: 'Delivered', amount: '$1,240.00' },
                { id: '#FW-9286', product: 'Spanish Garlic', origin: '🇪🇸 Spain', dest: '🇬🇧 UK', status: 'Confirmed', amount: '$185.00' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors cursor-pointer group">
                  <td className="px-8 py-5 font-bold text-stone-900">{row.id}</td>
                  <td className="px-8 py-5 font-medium text-stone-600">{row.product}</td>
                  <td className="px-8 py-5">{row.origin}</td>
                  <td className="px-8 py-5">{row.dest}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                      row.status === 'In Transit' ? "bg-amber-100 text-amber-600" : 
                      row.status === 'Delivered' ? "bg-brand-100 text-brand-600" : "bg-stone-100 text-stone-600"
                    )}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-stone-900">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ user }: { user: any }) {
  const location = useLocation();
  const isAdminUser = user.role === 'admin' || user.email === 'santoshprasad8891@gmail.com';

  const navItems = [
    { icon: BarChart3, label: 'Overview', path: '/dashboard' },
    { icon: Package, label: 'Inventory', path: '/dashboard/inventory' },
    { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders' },
    { icon: Users, label: 'Customers', path: '/dashboard/customers' },
    ...(isAdminUser ? [{ icon: ShieldHalf, label: 'Seller Approvals', path: '/dashboard/approvals' }] : []),
    { icon: PieChart, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-100 p-8 hidden lg:flex flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-[28px] border border-stone-100">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="h-10 w-10 rounded-2xl object-cover" alt="" referrerPolicy="no-referrer" />
            <div className="overflow-hidden">
               <p className="text-sm font-black text-stone-900 truncate">{user.displayName}</p>
               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mt-1">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all group border-2 border-transparent",
                  isActive ? "bg-stone-900 text-white shadow-xl shadow-stone-200" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-brand-400" : "text-stone-400 group-hover:text-stone-900")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12">
        <Routes>
          <Route path="/" element={<MainOverview />} />
          <Route path="/approvals" element={<SellerApprovals />} />
          <Route path="/settings" element={isAdminUser ? <AdminSettings /> : <div className="font-serif italic text-3xl">Account Settings...</div>} />
          <Route path="/orders" element={<div className="font-serif italic text-3xl">Active Orders Logic...</div>} />
          <Route path="/inventory" element={<InventoryManager user={user} />} />
          <Route path="/analytics" element={<InventoryForecaster />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}
