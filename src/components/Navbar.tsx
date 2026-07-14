import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Globe, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ user }: { user: UserProfile | null }) {
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 premium-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-xl text-white">
              <Leaf size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-serif italic font-bold tracking-tight bg-gradient-to-r from-stone-900 to-stone-600 bg-clip-text text-transparent">
              FreshWorld
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/market" className="text-sm font-medium text-stone-600 hover:text-brand-600 transition-colors">Marketplace</Link>
            <Link to="/market?cat=fruits" className="text-sm font-medium text-stone-600 hover:text-brand-600 transition-colors">Fruits</Link>
            <Link to="/market?cat=vegetables" className="text-sm font-medium text-stone-600 hover:text-brand-600 transition-colors">Vegetables</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            >
              <Search size={20} />
            </button>

            {user && <NotificationCenter />}

            <Link to="/cart" className="p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-brand-600 text-white text-[10px] flex items-center justify-center rounded-full animate-in zoom-in duration-300">{totalItems}</span>
              )}
            </Link>
            
            <div className="h-6 w-[1px] bg-stone-200 mx-2 hidden sm:block"></div>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white border border-stone-200 rounded-full hover:shadow-md transition-all">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="h-7 w-7 rounded-full border border-stone-100" alt="" referrerPolicy="no-referrer" />
                  <span className="text-xs font-semibold text-stone-700 hidden lg:block">{user.displayName.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">Dashboard</Link>
                  <Link to="/dashboard/orders" className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">Orders</Link>
                  <hr className="my-2 border-stone-100" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-600 transition-all shadow-lg shadow-stone-200/50"
              >
                Sign In
              </button>
            )}

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-stone-100 shadow-xl py-6 px-4 flex flex-col gap-4"
          >
            <Link to="/market" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Marketplace</Link>
            <Link to="/market?cat=fruits" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Fruits</Link>
            <Link to="/market?cat=vegetables" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Vegetables</Link>
            <Link to="/register-seller" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-brand-600">Sell Internationally</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Header Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-brand-50 border-b border-brand-100"
          >
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={24} />
                <input 
                  type="text" 
                  placeholder="Search globally for tomatoes, organic apples, or garlic..." 
                  className="w-full bg-white border-2 border-brand-200 rounded-2xl pl-14 pr-6 py-4 text-lg focus:border-brand-500 outline-none transition-all shadow-inner"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-xs text-brand-600 font-semibold px-3 py-1 bg-brand-100 rounded-full whitespace-nowrap">India</span>
                <span className="text-xs text-brand-600 font-semibold px-3 py-1 bg-brand-100 rounded-full whitespace-nowrap">USA</span>
                <span className="text-xs text-brand-600 font-semibold px-3 py-1 bg-brand-100 rounded-full whitespace-nowrap">Organic</span>
                <span className="text-xs text-brand-600 font-semibold px-3 py-1 bg-brand-100 rounded-full whitespace-nowrap">Fresh Harvest</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
