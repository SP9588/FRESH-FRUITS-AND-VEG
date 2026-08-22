import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Sparkles, 
  Clock, 
  ChefHat, 
  ShoppingBag, 
  Check, 
  Filter, 
  Search, 
  RefreshCw, 
  Flame, 
  BookOpen, 
  Share2, 
  Printer, 
  X, 
  Plus, 
  CheckCircle2, 
  Leaf, 
  ArrowRight,
  Heart,
  Globe,
  Award,
  Zap
} from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export interface SeasonalRecipe {
  id: string;
  title: string;
  subtitle: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  cuisine: string;
  mealType: string;
  matchedMarketplaceProducts: string[];
  pantryIngredients: string[];
  instructions: string[];
  chefTip: string;
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fiber: string;
  };
  image?: string;
}

// Fallback high quality imagery for generated recipes based on keywords
const RECIPE_IMAGES: Record<string, string> = {
  tomato: "https://images.unsplash.com/photo-1592417817098-8f3d6eb16082?w=800&auto=format&fit=crop&q=80",
  apple: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&auto=format&fit=crop&q=80",
  mango: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
  garlic: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&auto=format&fit=crop&q=80",
  avocado: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3d5d6281293?w=800&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80"
};

const DEFAULT_SEASONAL_RECIPES: SeasonalRecipe[] = [
  {
    id: "rec-1",
    title: "Siciliano Roasted Tomato & Garlic Gazpacho",
    subtitle: "Chilled organic soup burst with sun-ripened volcanic tomatoes & crushed purple garlic.",
    prepTime: "15 mins",
    cookTime: "0 mins",
    servings: 4,
    difficulty: "Easy",
    cuisine: "Sicilian / Mediterranean",
    mealType: "Lunch",
    matchedMarketplaceProducts: ["Ruby Red Organic Tomatoes", "Spanish Purple Garlic"],
    pantryIngredients: [
      "1/4 cup Extra virgin olive oil",
      "2 tbsp Sherry vinegar",
      "1 tsp Sea salt flakes",
      "Fresh sourdough crostini for garnish"
    ],
    instructions: [
      "Coarsely chop the fresh Ruby Red Organic Tomatoes and crush 2 cloves of Spanish Purple Garlic.",
      "Combine tomatoes, garlic, extra virgin olive oil, and sherry vinegar in a high-speed blender.",
      "Puree until silky smooth, season with sea salt to taste.",
      "Chill in refrigerator for 30 minutes. Serve drizzled with olive oil and topped with sourdough crostini."
    ],
    chefTip: "Pair with a crisp Sicilian Grillo or Sauvignon Blanc to accentuate the tomato acidity.",
    nutrition: {
      calories: "220 kcal",
      protein: "4g",
      carbs: "18g",
      fiber: "5g"
    },
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb16082?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "rec-2",
    title: "Kashmiri Apple & Hass Avocado Superfood Salad",
    subtitle: "Crisp saffron valley apples paired with creamy California Hass avocados and toasted walnuts.",
    prepTime: "10 mins",
    cookTime: "0 mins",
    servings: 2,
    difficulty: "Easy",
    cuisine: "Himalayan Fusion",
    mealType: "Salad",
    matchedMarketplaceProducts: ["Kashmiri Saffron Apples", "California Hass Avocados"],
    pantryIngredients: [
      "3 cups Fresh organic baby spinach",
      "1/4 cup Toasted walnuts",
      "2 tbsp Raw wild honey",
      "1 tbsp Fresh lemon juice"
    ],
    instructions: [
      "Thinly slice the crisp Kashmiri Saffron Apples and scoop out the California Hass Avocado into bite-sized wedges.",
      "Toss baby spinach, apple slices, and avocado gently in a wide wooden salad bowl.",
      "Whisk raw honey and lemon juice together for a light golden dressing.",
      "Drizzle dressing over salad and top with warm toasted walnuts."
    ],
    chefTip: "Dip apple slices in lemon water immediately after cutting to preserve crisp white color.",
    nutrition: {
      calories: "340 kcal",
      protein: "6g",
      carbs: "32g",
      fiber: "9g"
    },
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "rec-3",
    title: "Thai Honey Mango & Coconut Sticky Rice",
    subtitle: "A royal Bangkok dessert with ripe honey mangoes and warm jasmine coconut reduction.",
    prepTime: "20 mins",
    cookTime: "25 mins",
    servings: 4,
    difficulty: "Medium",
    cuisine: "Thai Royal",
    mealType: "Dessert / Smoothie",
    matchedMarketplaceProducts: ["Thai Honey Mangoes"],
    pantryIngredients: [
      "1 cup Sweet glutinous sticky rice",
      "1 cup Pure coconut cream",
      "3 tbsp Organic cane sugar",
      "1 tbsp Toasted sesame seeds"
    ],
    instructions: [
      "Steam glutinous sticky rice until soft and translucent.",
      "Warm coconut cream with cane sugar until dissolved.",
      "Pour half the warm coconut cream over sticky rice and let soak for 15 minutes.",
      "Peel and slice Thai Honey Mangoes into elegant fans. Arrange beside sweet rice and top with sesame seeds."
    ],
    chefTip: "Ensure mangoes are served at room temperature for maximum aromatics and sweetness.",
    nutrition: {
      calories: "410 kcal",
      protein: "5g",
      carbs: "62g",
      fiber: "4g"
    },
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"
  }
];

export default function SeasonalRecipes() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<SeasonalRecipe[]>(DEFAULT_SEASONAL_RECIPES);
  const [selectedProductFilter, setSelectedProductFilter] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string>('All');
  const [mealType, setMealType] = useState<string>('All');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SeasonalRecipe | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    loadMarketplaceProducts();
  }, []);

  const loadMarketplaceProducts = async () => {
    try {
      const fetched = await productService.getAllProducts();
      if (fetched && fetched.length > 0) {
        setProducts(fetched);
      } else {
        // Fallback default sample items
        setProducts([
          { id: '1', name: 'Ruby Red Organic Tomatoes', category: 'Vegetables', description: '', price: 4.5, unit: 'kg', stock: 100, sellerId: 's1', sellerName: 'Siciliano', originCountry: 'Italy', isOrganic: true, image: '', rating: 5, reviewCount: 10, status: 'active', createdAt: '' },
          { id: '2', name: 'Kashmiri Saffron Apples', category: 'Fruits', description: '', price: 3.2, unit: 'kg', stock: 100, sellerId: 's2', sellerName: 'Himalayan', originCountry: 'India', isOrganic: true, image: '', rating: 5, reviewCount: 10, status: 'active', createdAt: '' },
          { id: '3', name: 'Thai Honey Mangoes', category: 'Fruits', description: '', price: 12.0, unit: 'box', stock: 45, sellerId: 's3', sellerName: 'Siam', originCountry: 'Thailand', isOrganic: false, image: '', rating: 5, reviewCount: 10, status: 'active', createdAt: '' },
          { id: '4', name: 'Spanish Purple Garlic', category: 'Vegetables', description: '', price: 8.5, unit: 'kg', stock: 120, sellerId: 's4', sellerName: 'La Mancha', originCountry: 'Spain', isOrganic: true, image: '', rating: 5, reviewCount: 10, status: 'active', createdAt: '' },
          { id: '5', name: 'California Hass Avocados', category: 'Fruits', description: '', price: 1.5, unit: 'unit', stock: 200, sellerId: 's5', sellerName: 'West Coast', originCountry: 'USA', isOrganic: false, image: '', rating: 5, reviewCount: 10, status: 'active', createdAt: '' }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleProductFilter = (productName: string) => {
    setSelectedProductFilter(prev => 
      prev.includes(productName)
        ? prev.filter(p => p !== productName)
        : [...prev, productName]
    );
  };

  const handleGenerateRecipes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGenerating(true);

    try {
      const activeProducts = selectedProductFilter.length > 0
        ? products.filter(p => selectedProductFilter.includes(p.name))
        : products;

      const res = await fetch('/api/ai/seasonal-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableProducts: activeProducts,
          userQuery: customPrompt,
          dietaryPreference: dietary !== 'All' ? dietary : '',
          mealType: mealType !== 'All' ? mealType : ''
        })
      });

      if (!res.ok) {
        throw new Error("Failed to craft AI seasonal recipes");
      }

      const data = await res.json();
      if (data.recipes && data.recipes.length > 0) {
        // Map images to recipes
        const recipesWithImages = data.recipes.map((r: SeasonalRecipe, index: number) => {
          let matchedImg = RECIPE_IMAGES.default;
          const titleLower = r.title.toLowerCase();
          if (titleLower.includes('tomato')) matchedImg = RECIPE_IMAGES.tomato;
          else if (titleLower.includes('apple')) matchedImg = RECIPE_IMAGES.apple;
          else if (titleLower.includes('mango')) matchedImg = RECIPE_IMAGES.mango;
          else if (titleLower.includes('garlic')) matchedImg = RECIPE_IMAGES.garlic;
          else if (titleLower.includes('avocado')) matchedImg = RECIPE_IMAGES.avocado;
          else if (titleLower.includes('salad')) matchedImg = RECIPE_IMAGES.salad;
          else if (titleLower.includes('pasta')) matchedImg = RECIPE_IMAGES.pasta;

          return {
            ...r,
            image: r.image || matchedImg
          };
        });

        setRecipes(recipesWithImages);
        toast.success("AI Master Chef crafted new seasonal recipes based on fresh harvest!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("AI Recipe creation encountered a bottleneck. Showing curated seasonal classics.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddMatchedToCart = (recipe: SeasonalRecipe) => {
    let addedCount = 0;
    recipe.matchedMarketplaceProducts.forEach(matchedName => {
      // Find matching product in inventory
      const foundProduct = products.find(p => 
        p.name.toLowerCase().includes(matchedName.toLowerCase()) || 
        matchedName.toLowerCase().includes(p.name.toLowerCase())
      );
      if (foundProduct) {
        addToCart(foundProduct, 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} fresh harvest produce items to cart!`);
    } else {
      toast.success(`Ingredients highlighted for ${recipe.title}`);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Hero Header */}
      <section className="bg-stone-900 text-white relative overflow-hidden py-16 px-6 md:px-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                  <ChefHat size={14} />
                  AI Farm-to-Table Kitchen
                </span>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" />
                  Live Harvest Matched
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic font-medium leading-tight">
                Seasonal Farm-to-Table Recipes
              </h1>
              <p className="text-stone-300 text-sm md:text-base leading-relaxed">
                Discover culinary masterpieces created dynamically by AI based on fresh fruits & vegetables available right now in our global marketplace. From vine-ripened tomatoes to high-altitude saffron apples.
              </p>
            </div>

            <div className="bg-stone-800/80 backdrop-blur-md p-6 rounded-[2rem] border border-stone-700/60 w-full md:w-auto shrink-0 space-y-3">
              <div className="flex items-center gap-2 text-brand-400">
                <Award size={18} />
                <span className="text-xs font-black uppercase tracking-widest text-white">Harvest Season</span>
              </div>
              <div className="text-2xl font-serif italic text-white">
                Late Summer Peak
              </div>
              <p className="text-[11px] text-stone-400 font-medium">
                {products.length} Fresh Produce Varieties Available
              </p>
            </div>
          </div>

          {/* Available Produce Selector Ticker */}
          <div className="pt-6 border-t border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <Leaf size={14} className="text-brand-400" />
                Select Fresh Ingredients in Stock to Match
              </span>
              {selectedProductFilter.length > 0 && (
                <button 
                  onClick={() => setSelectedProductFilter([])}
                  className="text-[10px] font-bold text-brand-400 hover:underline"
                >
                  Clear Selection ({selectedProductFilter.length})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {products.map((p) => {
                const isSelected = selectedProductFilter.includes(p.name);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProductFilter(p.name)}
                    className={cn(
                      "px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 shrink-0",
                      isSelected
                        ? "bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-600/30"
                        : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white"
                    )}
                  >
                    {isSelected ? <Check size={14} /> : <Plus size={14} />}
                    {p.name}
                    {p.isOrganic && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-black">
                        Organic
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-10">
        {/* Ask Chef Gemini AI Prompt Box */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Ask AI Executive Chef</h3>
                <p className="text-xs text-stone-400">Specify special culinary desires or dietary goals</p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Gemini 3.6 Flash Engine
            </span>
          </div>

          <form onSubmit={handleGenerateRecipes} className="space-y-4">
            <div className="relative">
              <input 
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., 'Craft a quick 15-minute Mediterranean dinner using organic tomatoes and garlic for 4 guests...'"
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-32 text-xs md:text-sm font-medium text-stone-900 outline-none focus:border-brand-600 transition-colors shadow-inner"
              />
              <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              
              <button
                type="submit"
                disabled={generating}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {generating ? <RefreshCw className="animate-spin text-brand-400" size={14} /> : <Zap size={14} className="text-brand-400" />}
                Craft
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mr-2">Dietary:</span>
                {['All', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Low-Carb'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDietary(d)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      dietary === d 
                        ? "bg-stone-900 text-white" 
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mr-2">Course:</span>
                {['All', 'Lunch', 'Dinner', 'Salad', 'Dessert / Smoothie'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMealType(m)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      mealType === m 
                        ? "bg-stone-900 text-white" 
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Recipes Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif italic text-stone-900">
                Curated Farm-to-Table Seasonal Menu
              </h2>
              <p className="text-xs text-stone-500">
                Matched to fresh produce harvest stock currently available for immediate order.
              </p>
            </div>

            <button
              onClick={() => handleGenerateRecipes()}
              disabled={generating}
              className="flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-4 py-2 rounded-full border border-brand-200"
            >
              <RefreshCw className={cn(generating && "animate-spin")} size={14} />
              Regenerate Menu
            </button>
          </div>

          {generating ? (
            <div className="py-20 text-center space-y-4 bg-white rounded-[2.5rem] border border-stone-200">
              <div className="w-16 h-16 rounded-full bg-brand-50 border-2 border-brand-500 text-brand-600 flex items-center justify-center mx-auto animate-spin">
                <ChefHat size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-stone-900">AI Chef Creating Bespoke Recipes</h4>
                <p className="text-xs text-stone-400">Selecting peak freshness harvest produce and balancing nutrition...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe) => {
                const isBookmarked = bookmarkedIds.includes(recipe.id);
                return (
                  <motion.div
                    key={recipe.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] border border-stone-200/80 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="relative aspect-video bg-stone-900 overflow-hidden">
                      <img 
                        src={recipe.image || RECIPE_IMAGES.default} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {recipe.cuisine}
                        </span>
                        
                        <button
                          onClick={() => toggleBookmark(recipe.id)}
                          className={cn(
                            "p-2.5 rounded-full backdrop-blur-md border transition-all",
                            isBookmarked 
                              ? "bg-red-500 text-white border-red-400" 
                              : "bg-black/60 text-white border-white/20 hover:bg-black"
                          )}
                        >
                          <Heart size={14} className={cn(isBookmarked && "fill-current")} />
                        </button>
                      </div>

                      {/* Bottom Image Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-bold">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-brand-400" />
                            {recipe.prepTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Flame size={12} className="text-amber-400" />
                            {recipe.nutrition?.calories || '350 kcal'}
                          </span>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2.5 py-0.5 rounded-md">
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-serif italic font-bold text-stone-900 leading-snug group-hover:text-brand-700 transition-colors">
                          {recipe.title}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {recipe.subtitle}
                        </p>
                      </div>

                      {/* Matched Marketplace Ingredients */}
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 block">
                          Matched Marketplace Produce:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.matchedMarketplaceProducts.map((item, idx) => (
                            <span 
                              key={idx}
                              className="px-2.5 py-1 bg-brand-50 text-brand-800 border border-brand-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <CheckCircle2 size={10} className="text-brand-600" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                          className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <BookOpen size={14} />
                          View Recipe
                        </button>

                        <button
                          onClick={() => handleAddMatchedToCart(recipe)}
                          className="py-3 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all shadow-md shadow-brand-600/20"
                          title="Add Matched Fresh Ingredients to Cart"
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Recipe Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="relative aspect-video bg-stone-900 overflow-hidden">
                <img 
                  src={selectedRecipe.image || RECIPE_IMAGES.default} 
                  alt={selectedRecipe.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black transition-all"
                >
                  <X size={18} />
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      {selectedRecipe.cuisine}
                    </span>
                    <span className="text-xs font-bold text-stone-300">
                      Serves {selectedRecipe.servings}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif italic font-bold">
                    {selectedRecipe.title}
                  </h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                  <div>
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">Prep Time</span>
                    <span className="text-sm font-bold text-stone-900">{selectedRecipe.prepTime}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">Cook Time</span>
                    <span className="text-sm font-bold text-stone-900">{selectedRecipe.cookTime}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">Calories</span>
                    <span className="text-sm font-bold text-stone-900">{selectedRecipe.nutrition.calories}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">Fiber</span>
                    <span className="text-sm font-bold text-stone-900">{selectedRecipe.nutrition.fiber}</span>
                  </div>
                </div>

                {/* Ingredients List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Leaf size={16} className="text-brand-600" />
                      Required Ingredients
                    </span>
                    <button
                      onClick={() => handleAddMatchedToCart(selectedRecipe)}
                      className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
                    >
                      <ShoppingBag size={14} /> Add Produce to Cart
                    </button>
                  </h3>

                  <div className="space-y-2">
                    {/* Marketplace matched produce */}
                    {selectedRecipe.matchedMarketplaceProducts.map((p, i) => (
                      <div key={i} className="p-3 bg-brand-50 rounded-xl border border-brand-200/80 flex items-center justify-between text-xs font-bold text-brand-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-brand-600" />
                          {p}
                        </span>
                        <span className="text-[10px] font-black uppercase text-brand-700 bg-white px-2 py-0.5 rounded-md border border-brand-200">
                          Fresh Market Stock
                        </span>
                      </div>
                    ))}

                    {/* Pantry ingredients */}
                    {selectedRecipe.pantryIngredients.map((ing, i) => (
                      <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 flex items-center gap-2 text-xs text-stone-700 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                        {ing}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                    <Utensils size={16} className="text-brand-600" />
                    Step-by-Step Preparation
                  </h3>

                  <div className="space-y-3">
                    {selectedRecipe.instructions.map((step, idx) => (
                      <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-start gap-4">
                        <div className="w-7 h-7 rounded-full bg-stone-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-stone-700 font-medium leading-relaxed pt-1">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chef Secret Tip */}
                <div className="p-5 bg-stone-900 text-white rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-brand-400">
                    <ChefHat size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Master Chef's Secret</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed italic">
                    "{selectedRecipe.chefTip}"
                  </p>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900"
                  >
                    <Printer size={14} /> Print Recipe Card
                  </button>

                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="px-6 py-2.5 bg-stone-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-stone-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
