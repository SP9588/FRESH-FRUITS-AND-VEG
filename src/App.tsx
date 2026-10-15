import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { Toaster } from 'react-hot-toast';

// Pages (Lazy loading for better performance later, but standard for now)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import SellerRegistration from './pages/SellerRegistration';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import SeasonalRecipes from './pages/SeasonalRecipes';
import SubscriptionPricing from './pages/SubscriptionPricing';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import MinimizedWebpageLanguageArena from './components/MinimizedWebpageLanguageArena';

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
    <LanguageProvider>
      <Router>
        <WishlistProvider>
          <CartProvider>
            <MinimizedWebpageLanguageArena>
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
                    <Route path="/recipes" element={<SeasonalRecipes />} />
                    <Route path="/pricing" element={<SubscriptionPricing user={user} />} />
                    <Route path="/subscriptions" element={<Navigate to="/dashboard/subscriptions" />} />
                  </Routes>
                </main>
                <Footer />
                <LanguageSelector variant="floating" />
                <Toaster position="bottom-right" />
              </div>
            </MinimizedWebpageLanguageArena>
          </CartProvider>
        </WishlistProvider>
      </Router>
    </LanguageProvider>
  );
}

