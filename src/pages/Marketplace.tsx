import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List, Globe } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { productService } from '../services/productService';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ruby Red Organic Tomatoes',
    category: 'Vegetables',
    description: 'Sun-ripened organic tomatoes from the volcanic soil of Sicily.',
    price: 4.50,
    discountPrice: 5.90,
    unit: 'kg',
    stock: 250,
    sellerId: 's1',
    sellerName: 'Siciliano Farms',
    originCountry: 'Italy',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=1974&auto=format&fit=crop',
    rating: 4.9,
    reviewCount: 128,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Kashmiri Saffron Apples',
    category: 'Fruits',
    description: 'Crisp apples grown in the cold valleys of Kashmir, known for their unique sweetness.',
    price: 3.20,
    unit: 'kg',
    stock: 500,
    sellerId: 's2',
    sellerName: 'Himalayan Harvest',
    originCountry: 'India',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=2069&auto=format&fit=crop',
    rating: 4.8,
    reviewCount: 85,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Thai Honey Mangoes',
    category: 'Fruits',
    description: 'Exotic premium mangoes from Thailand with a smooth, buttery texture.',
    price: 12.00,
    discountPrice: 15.00,
    unit: 'box',
    stock: 45,
    sellerId: 's3',
    sellerName: 'Siam Tropics',
    originCountry: 'Thailand',
    isOrganic: false,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1974&auto=format&fit=crop',
    rating: 5.0,
    reviewCount: 320,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Spanish Purple Garlic',
    category: 'Vegetables',
    description: 'Intense flavor profile, perfect for professional culinary use.',
    price: 8.50,
    unit: 'kg',
    stock: 120,
    sellerId: 's4',
    sellerName: 'La Mancha Garlic',
    originCountry: 'Spain',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?q=80&w=2070&auto=format&fit=crop',
    rating: 4.7,
    reviewCount: 64,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'California Hass Avocados',
    category: 'Fruits',
    description: 'Perfectly ripe avocados with 20% more oil content for better texture.',
    price: 1.50,
    unit: 'unit',
    stock: 1000,
    sellerId: 's5',
    sellerName: 'West Coast Greens',
    originCountry: 'USA',
    isOrganic: false,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=1975&auto=format&fit=crop',
    rating: 4.6,
    reviewCount: 412,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Japanese Fuji Cauliflower',
    category: 'Vegetables',
    description: 'Clean, dense florets with a mild sweet finish. Premium export quality.',
    price: 6.00,
    unit: 'kg',
    stock: 80,
    sellerId: 's6',
    sellerName: 'Kyoto Farm',
    originCountry: 'Japan',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1510627489930-0c1b0ba05d87?q=80&w=2070&auto=format&fit=crop',
    rating: 4.9,
    reviewCount: 52,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All Countries');
  const [sortBy, setSortBy] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        if (data.length > 0) {
          setProducts(data);
        } else {
          // If no products in DB, fallback to mock for now
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.error(err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const countriesList = ['All Countries', ...Array.from(new Set([...products, ...MOCK_PRODUCTS].map(p => p.originCountry)))].sort();

  const filteredProducts = products.filter(p => {
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesCountry = filterCountry === 'All Countries' || p.originCountry === filterCountry;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.originCountry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesCountry && matchesSearch;
  });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-serif italic text-stone-900 mb-2">Global Market</h1>
          <p className="text-stone-500">Live prices from verified international sellers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products or countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-stone-200 rounded-2xl w-full md:w-80 outline-none focus:border-brand-500 transition-all font-medium text-sm"
            />
          </div>
          <button className="p-3 bg-white border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-50 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-10 pb-6 border-b border-stone-100">
        <div className="flex gap-2 bg-stone-100 p-1 rounded-2xl w-fit">
          {['All', 'Fruits', 'Vegetables'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filterCategory === cat ? 'bg-white text-brand-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Country Filter */}
        <div className="relative flex items-center gap-3 bg-stone-100 px-4 py-2 rounded-2xl w-fit">
          <Globe size={16} className="text-stone-400" />
          <select 
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="bg-transparent outline-none text-sm font-bold text-stone-700 appearance-none pr-6 cursor-pointer"
          >
            {countriesList.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 pointer-events-none text-stone-400" />
        </div>

        <div className="lg:ml-auto flex items-center gap-4">
           {loading && (
             <div className="flex items-center gap-2 mr-4">
               <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" />
               <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Updating Market...</span>
             </div>
           )}
           <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sort By:</span>
            <button className="flex items-center gap-1 text-sm font-bold text-stone-700">
              {sortBy} <ChevronDown size={14} />
            </button>
          </div>
          <div className="h-4 w-[1px] bg-stone-200"></div>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
             <button className="p-1.5 bg-white shadow-sm rounded-lg text-brand-600"><LayoutGrid size={16} /></button>
             <button className="p-1.5 text-stone-400"><List size={16} /></button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-40">
           <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
             <Search size={40} />
           </div>
           <h3 className="text-2xl font-serif italic text-stone-900 mb-2">No products found</h3>
           <p className="text-stone-500">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}
