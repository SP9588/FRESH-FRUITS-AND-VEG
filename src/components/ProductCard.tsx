import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Leaf, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to bag!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isFavorite) {
      toast.success(`${product.name} added to wishlist!`);
    } else {
      toast.error(`${product.name} removed from wishlist.`);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-stone-100 group"
    >
      {/* Image Wrapper */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isOrganic && (
            <div className="bg-white/90 backdrop-blur-md text-brand-600 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <Leaf size={10} fill="currentColor" /> ORGANIC
            </div>
          )}
          <div className="bg-stone-900/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm uppercase tracking-tight">
            <Globe size={10} /> {product.originCountry}
          </div>
        </div>

        {/* Floating Actions */}
        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
          <button 
            onClick={handleToggleWishlist}
            className={cn(
              "bg-white p-3 rounded-2xl transition-all shadow-xl group/heart",
              isFavorite ? "text-red-500 bg-red-50" : "text-stone-600 hover:bg-brand-600 hover:text-white"
            )}
          >
            <Heart size={20} className={cn(isFavorite && "fill-current scale-110")} />
          </button>
          <button 
            onClick={handleAddToCart}
            className="bg-brand-600 p-3 rounded-2xl text-white hover:bg-brand-700 shadow-xl"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <Link to={`/product/${product.id}`} className="p-6 block">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-stone-900 leading-tight mb-1 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-stone-400 font-medium">By {product.sellerName}</p>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-50 rounded-lg">
            <Star size={12} className="text-amber-400 fill-current" />
            <span className="text-[10px] font-bold text-stone-600">{product.rating}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-xl font-black text-stone-900 leading-none">
            {formatCurrency(product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-stone-400 line-through decoration-stone-300">
              {formatCurrency(product.discountPrice)}
            </span>
          )}
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-auto">
            Per {product.unit}
          </span>
        </div>
        
        <div className="mt-4 w-full h-[1px] bg-stone-50"></div>
        
        <div className="mt-4 flex items-center justify-between">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              product.stock > 0 ? "text-brand-600" : "text-red-500"
            )}>
              {product.stock > 0 ? `In Stock (${product.stock} ${product.unit})` : 'Out of Stock'}
            </span>
            <button className="text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors underline underline-offset-4">
              Details
            </button>
        </div>
      </Link>
    </motion.div>
  );
}
