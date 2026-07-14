import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { Toaster } from 'react-hot-toast';

// Pages (Lazy loading for better performance later, but standard for now)
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import SellerRegistration from './pages/SellerRegistration';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Cart from './pages/Cart';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'customer',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <WishlistProvider>
        <CartProvider>
          <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar user={user} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/market" element={<Marketplace />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/register-seller" element={<SellerRegistration user={user} />} />
                <Route path="/dashboard/*" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
                <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
                <Route path="/cart" element={<Cart />} />
              </Routes>
            </main>
            <footer className="bg-stone-900 text-stone-400 py-12 px-6">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <h2 className="text-2xl font-serif italic text-white mb-4">FreshWorld Global</h2>
                  <p className="max-w-xs">Connecting the world's finest farmers directly to your table. Sustainable, transparent, and international.</p>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-4">Marketplace</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/market" className="hover:text-brand-400">All Products</a></li>
                    <li><a href="/market?cat=fruits" className="hover:text-brand-400">Fruits</a></li>
                    <li><a href="/market?cat=vegetables" className="hover:text-brand-400">Vegetables</a></li>
                    <li><a href="/market?type=organic" className="hover:text-brand-400">Organic Only</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-4">Sell</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/register-seller" className="hover:text-brand-400">Become a Seller</a></li>
                    <li><a href="/dashboard" className="hover:text-brand-400">Seller Dashboard</a></li>
                    <li><a href="#" className="hover:text-brand-400">Shipping Info</a></li>
                  </ul>
                </div>
              </div>
              <div className="max-w-7xl mx-auto border-t border-stone-800 mt-12 pt-8 text-xs flex justify-between items-center">
                <p>&copy; 2026 FreshWorld Global. All rights reserved.</p>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-white">Privacy Policy</a>
                  <a href="#" className="hover:text-white">Terms of Service</a>
                </div>
              </div>
            </footer>
            <Toaster position="bottom-right" />
          </div>
        </CartProvider>
      </WishlistProvider>
    </Router>
  );
}

