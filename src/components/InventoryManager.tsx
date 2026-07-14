import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Eye, 
  AlertCircle,
  Package,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/productService';
import { Product } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

interface InventoryManagerProps {
  user: any;
}

export default function InventoryManager({ user }: InventoryManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const isAdmin = user.role === 'admin' || user.email === 'santoshprasad8891@gmail.com';

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await productService.getAllProducts();
      } else {
        data = await productService.getProductsBySeller(user.uid);
      }
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully");
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-serif italic text-stone-900">Inventory Management</h2>
          <p className="text-stone-500">Manage your product catalog and global availability.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-stone-200 hover:bg-brand-600 transition-all"
        >
          <Plus size={20} /> Add New Listing
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden p-8">
        <div className="flex flex-wrap items-center gap-6 mb-8 border-b border-stone-50 pb-8">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-stone-50 border-none rounded-2xl w-full outline-none focus:ring-2 ring-brand-500/20 transition-all font-medium text-sm"
            />
          </div>
          
          <div className="flex gap-2 bg-stone-50 p-1 rounded-2xl">
            {['All', 'Vegetables', 'Fruits'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  filterCategory === cat ? "bg-white text-brand-600 shadow-sm" : "text-stone-400 hover:text-stone-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
             <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-xl border transition-all", viewMode === 'grid' ? "bg-stone-900 border-stone-900 text-white" : "bg-white border-stone-100 text-stone-400")}
             >
                <LayoutGrid size={18} />
             </button>
             <button 
              onClick={() => setViewMode('table')}
              className={cn("p-2 rounded-xl border transition-all", viewMode === 'table' ? "bg-stone-900 border-stone-900 text-white" : "bg-white border-stone-100 text-stone-400")}
             >
                <ListIcon size={18} />
             </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-600"></div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Accessing Secure Vault...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 mb-6">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-serif italic text-stone-900 mb-2">No items found</h3>
            <p className="text-stone-500 max-w-xs mx-auto mb-8">Start your global trade journey by adding your first product listing.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-brand-50 text-brand-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-100 transition-all"
            >
              Initialize First Listing
            </button>
          </div>
        ) : (
          viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] border-b border-stone-50 bg-stone-50/50">
                    <th className="px-6 py-5">Product Details</th>
                    <th className="px-6 py-5">Origin</th>
                    <th className="px-6 py-5">Value</th>
                    <th className="px-6 py-5">Availability</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredProducts.map((product) => (
                    <motion.tr 
                      layout
                      key={product.id} 
                      className="group hover:bg-stone-50/80 transition-colors"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={product.image} 
                            className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-stone-100" 
                            alt="" 
                          />
                          <div>
                            <p className="text-sm font-black text-stone-900 group-hover:text-brand-600 transition-colors">{product.name}</p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-stone-700">{product.originCountry}</span>
                           {product.isOrganic && (
                             <span className="text-[9px] font-black text-brand-600 uppercase tracking-tighter">Organic Certified</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                         <div className="flex flex-col">
                           <span className="text-sm font-black text-stone-900">{formatCurrency(product.price)}</span>
                           <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">per {product.unit}</span>
                         </div>
                      </td>
                      <td className="px-6 py-6">
                         <div className="space-y-1.5">
                            <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                               <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  product.stock === 0 ? "bg-red-600" :
                                  product.stock <= (product.lowStockThreshold || 5) ? "bg-amber-500" : "bg-brand-600"
                                )}
                                style={{ width: `${Math.max(2, Math.min(100, (product.stock / 250) * 100))}%` }}
                               />
                            </div>
                            <div className="flex items-center gap-1.5">
                               <p className={cn(
                                 "text-[10px] font-bold uppercase tracking-tight",
                                 product.stock <= (product.lowStockThreshold || 5) ? "text-brand-600" : "text-stone-400"
                               )}>
                                 {product.stock} {product.unit} In Stock
                               </p>
                               {product.stock <= (product.lowStockThreshold || 5) && (
                                 <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                               )}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-6">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                           product.status === 'active' ? "bg-brand-100 text-brand-600" : "bg-stone-100 text-stone-500"
                         )}>
                            {product.status}
                         </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => setEditingProduct(product)}
                            className="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                           >
                              <Edit2 size={16} />
                           </button>
                           <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                           >
                              <Trash2 size={16} />
                           </button>
                           <button className="p-2 text-stone-400 hover:text-stone-900 bg-stone-50 rounded-xl transition-all">
                              <MoreVertical size={16} />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               <AnimatePresence>
                 {filteredProducts.map((product) => (
                   <motion.div 
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-stone-50/50 rounded-[32px] border border-stone-100 p-5 hover:bg-white hover:shadow-xl hover:shadow-stone-100 transition-all"
                   >
                     <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-5 bg-stone-200 relative">
                        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        <div className="absolute top-4 right-4 flex gap-2">
                           <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-stone-600 hover:text-brand-600 transition-colors shadow-sm">
                              <Edit2 size={14} />
                           </button>
                           <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-stone-600 hover:text-red-600 transition-colors shadow-sm">
                              <Trash2 size={14} />
                           </button>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-sm font-black text-stone-900 group-hover:text-brand-600 transition-colors">{product.name}</h4>
                           <span className="text-sm font-black text-stone-900">{formatCurrency(product.price)}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                           <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.category}</p>
                           <div className="w-1 h-1 bg-stone-200 rounded-full" />
                           <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.stock} {product.unit} Available</p>
                        </div>
                        <button className="w-full py-3 rounded-2xl bg-white border border-stone-200 text-[10px] font-black text-stone-600 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-stone-900 hover:text-white transition-all group-hover:border-stone-900">
                           View Details <ExternalLink size={12} />
                        </button>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          )
        )}
      </div>

      <AnimatePresence>
        {(isAdding || editingProduct) && (
          <ProductForm 
            user={user}
            product={editingProduct} 
            onClose={() => {
              setIsAdding(false);
              setEditingProduct(null);
            }} 
            onSuccess={() => {
              setIsAdding(false);
              setEditingProduct(null);
              fetchProducts();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProductFormProps {
  user: any;
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ProductForm({ user, product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: '',
    category: 'Vegetables',
    description: '',
    price: 0,
    unit: 'kg',
    stock: 100,
    sellerId: user.uid,
    sellerName: user.businessName || user.displayName,
    originCountry: user.country || 'International',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=1974&auto=format&fit=crop',
    status: 'active',
    rating: 5.0,
    reviewCount: 0
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (product) {
        await productService.updateProduct(product.id, formData);
        toast.success("Product updated successfully");
      } else {
        await productService.addProduct(formData as Omit<Product, 'id' | 'createdAt'>);
        toast.success("Product published to global market");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-stone-900/40 px-6"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl shadow-stone-950/20 overflow-hidden"
      >
        <div className="flex items-center justify-between p-10 pb-6 border-b border-stone-50">
          <div>
            <h3 className="text-2xl font-serif italic text-stone-900">{product ? 'Update Global Listing' : 'New Market Exposure'}</h3>
            <p className="text-stone-500 text-sm">Define the terroir and commercial terms for your produce.</p>
          </div>
          <button onClick={onClose} className="p-4 bg-stone-50 rounded-2xl text-stone-400 hover:text-stone-900 transition-colors">
            <Trash2 size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Product Designation</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ruby Red Sicilian Tomatoes"
                  className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 ring-brand-500/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none cursor-pointer"
                  >
                    <option>Fruits</option>
                    <option>Vegetables</option>
                    <option>Dairy</option>
                    <option>Grains</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Pricing Unit</label>
                  <select 
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none cursor-pointer"
                  >
                    <option value="kg">Per Kilogram</option>
                    <option value="unit">Per Unit</option>
                    <option value="box">Per Box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Market Price (USD)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Available Stock</label>
                  <input 
                    required
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Low Stock Threshold</label>
                  <input 
                    required
                    type="number" 
                    value={formData.lowStockThreshold || 5}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) })}
                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none"
                  />
                  <p className="text-[9px] text-stone-400 font-medium px-1 mt-2 tracking-tight">System will trigger global alerts when stock falls below this level.</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Market Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none cursor-pointer"
                  >
                    <option value="active">Active Listing</option>
                    <option value="draft">Draft Mode</option>
                    <option value="out_of_stock">Archived (Out of Stock)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Terroir & Origin Narrative</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the soil, climate, and unique sensory profile..."
                  className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block px-1">Visual Asset URL</label>
                  <input 
                    required
                    type="url" 
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none mb-4"
                  />
                  <div className="aspect-video rounded-3xl bg-stone-100 overflow-hidden border border-stone-200">
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-stone-300">
                        <Package size={40} />
                      </div>
                    )}
                  </div>
               </div>

               <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Sustainability Matrix</p>
                     <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={formData.isOrganic}
                          onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                          className="w-5 h-5 rounded-lg border-brand-200 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-xs font-bold text-brand-900">Certified Organic</span>
                     </div>
                  </div>
                  <p className="text-[10px] text-brand-600/60 leading-relaxed font-medium">Checking this ensures the product passes our neural-audit for sustainable farming practices.</p>
               </div>

               <div className="p-6 bg-stone-900 rounded-3xl text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle size={16} className="text-brand-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Export Compliance</p>
                  </div>
                  <p className="text-[11px] text-stone-400 font-medium leading-relaxed">
                    By submitting, you certify that this produce meets international phytosanitary standards for cross-border trade.
                  </p>
               </div>
            </div>
          </div>

          <div className="flex gap-4 mt-12 pb-10">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-5 rounded-[2rem] bg-stone-50 text-xs font-black text-stone-600 uppercase tracking-widest hover:bg-stone-100 transition-all"
            >
              Cancel Edit
            </button>
            <button 
              disabled={saving}
              type="submit"
              className="flex-[2] py-5 rounded-[2rem] bg-stone-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-2xl shadow-stone-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <>Deploy to Global Network <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
