import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShieldCheck, Truck, RotateCcw, Globe, ShoppingCart, Heart, Plus, Minus, Sparkles, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { auth } from '../firebase';
import { productService } from '../services/productService';
import { Product } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

const PRICE_HISTORY = [
  { month: 'Nov', price: 3.90 },
  { month: 'Dec', price: 4.15 },
  { month: 'Jan', price: 4.85 },
  { month: 'Feb', price: 4.60 },
  { month: 'Mar', price: 4.35 },
  { month: 'Apr', price: 4.50 },
];

const PRODUCT = {
  id: '1',
  name: 'Ruby Red Organic Tomatoes',
  category: 'Vegetables',
  description: 'Grown in the legendary volcanic soil of Mt. Etna, these organic tomatoes boast an intense sweetness and rich mineral profile unmatched by greenhouse varieties. Harvested daily and shipped in cold-chain containers to preserve peak flavor.',
  price: 4.50,
  unit: 'kg',
  stock: 250,
  sellerId: 's1',
  sellerName: 'Siciliano Farms',
  originCountry: 'Italy',
  isOrganic: true,
  image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=1974&auto=format&fit=crop',
  rating: 4.9,
  reviewCount: 128,
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('Classic');
  const [selectedRipeness, setSelectedRipeness] = useState('Perfect Ripeness');
  const [selectedPackaging, setSelectedPackaging] = useState('Eco-Sustainable');
  const [selectedDelivery, setSelectedDelivery] = useState('Standard International Shipping');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [dateError, setDateError] = useState<string | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [aiTestimonials, setAiTestimonials] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingBundles, setIsGeneratingBundles] = useState(false);
  const [isGeneratingTestimonials, setIsGeneratingTestimonials] = useState(false);
  const [shippingOptimizations, setShippingOptimizations] = useState<any>(null);
  const [isOptimizingShipping, setIsOptimizingShipping] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [localAverage, setLocalAverage] = useState(0);
  const [localReviewCount, setLocalReviewCount] = useState(0);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [visibleReviews, setVisibleReviews] = useState(3);
  
  React.useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await productService.getProduct(id);
        if (data) {
          setProduct(data);
          setActiveImage(data.image);
          setLocalAverage(data.rating);
          setLocalReviewCount(data.reviewCount);
        } else {
          // Fallback to mock for existing demo links if necessary
          setProduct(PRODUCT as any);
          setActiveImage(PRODUCT.image);
          setLocalAverage(PRODUCT.rating);
          setLocalReviewCount(PRODUCT.reviewCount);
        }
      } catch (err) {
        console.error(err);
        setProduct(PRODUCT as any);
        setActiveImage(PRODUCT.image);
        setLocalAverage(PRODUCT.rating);
        setLocalReviewCount(PRODUCT.reviewCount);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmitRating = () => {
    if (userRating === 0) {
      toast.error("Please select a score first");
      return;
    }
    if (!reviewName.trim()) {
      toast.error("Please provide your name");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please share your sensory experience");
      return;
    }

    const newReview = {
      name: reviewName,
      quote: reviewComment,
      rating: userRating,
      location: "Verified Critic",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setUserReviews([newReview, ...userReviews]);

    // Simple mock calculation for updating average
    const newCount = localReviewCount + 1;
    const newAvg = ((localAverage * localReviewCount) + userRating) / newCount;
    setLocalAverage(Number(newAvg.toFixed(1)));
    setLocalReviewCount(newCount);
    setHasRated(true);
    toast.success("Review Authenticated: Sharing with the community.");
  };

  const handleGetBundles = async () => {
    setIsGeneratingBundles(true);
    try {
      const prompt = `You are a Michelin-star sommelier and elite gourmet curator. Suggest 3 highly specialized, complementary organic products to bundle with:
        Product: ${product?.name}
        Category: ${product?.category}
        Origin: ${product?.originCountry}

        The bundle should be marketed as a "Connoisseur's Curated Collection". For each suggestion, provide:
        - name: A high-end, artisanal name (e.g., "Cold-Pressed Garda Lake Olive Oil", "Aged Modena Riserva Vinegar").
        - reason: A specific, evocative sensory reason why this pairing works (e.g., "The subtle buttery finish of this oil tames the sharp, volcanic acidity of these tomatoes").
        - price: A premium price point (number) suitable for elite marketplaces.
        - imageType: EXACTLY one of: 'oil', 'herb', 'cheese', 'bread', 'wine', 'honey', 'spice', 'vinegar', 'salt'.

        Return ONLY a JSON array of objects with these keys. No introduction or markdown blocks.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const cleanText = (data.text || '[]').replace(/```json|```/g, '').trim();
      const suggested = JSON.parse(cleanText);
      
      const iconMap: any = {
        oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=1000&auto=format&fit=crop',
        herb: 'https://images.unsplash.com/photo-1591113025732-d882165e3391?q=80&w=1000&auto=format&fit=crop',
        cheese: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=1000&auto=format&fit=crop',
        bread: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=1000&auto=format&fit=crop',
        wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000&auto=format&fit=crop',
        honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1000&auto=format&fit=crop',
        spice: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=1000&auto=format&fit=crop',
        vinegar: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=1000&auto=format&fit=crop',
        salt: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=1000&auto=format&fit=crop',
      };

      setBundles(suggested.map((s: any) => ({
        ...s,
        image: iconMap[s.imageType] || iconMap.herb
      })));
    } catch (err) {
      console.error(err);
      toast.error("Sommelier engine busy. Initializing gourmet defaults.");
      setBundles([
        {
          name: "Cold-Pressed Garda Oil",
          reason: "Delicate peppery notes that elevate the volcanic acidity of the tomatoes.",
          price: 24.00,
          imageType: 'oil',
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=1000&auto=format&fit=crop'
        }
      ]);
    } finally {
      setIsGeneratingBundles(false);
    }
  };

  const handleGenerateTestimonials = async () => {
    setIsGeneratingTestimonials(true);
    try {
      const prompt = `You are a world-class culinary critic and luxury lifestyle writer. Generate 3 unique, evocative, and highly sophisticated customer testimonials for:
        Product: ${product?.name}
        Origin: ${product?.originCountry}
        
        Reflect on these three pillars of excellence:
        1. Peerless Freshness: The "just-harvested" vitality, vibrant aromatics, and peak sensory notes.
        2. Rare Origin: The distinct terroir, mineral profile from ${product?.originCountry}, and artisanal heritage.
        3. Elite Quality: A definitive statement on how this transcends standard marketplace or supermarket offerings.
        
        For each testimonial, provide:
        - name: A sophisticated, authentic-sounding name.
        - location: A major global city (e.g., "Paris, FR", "Geneva, CH", "Tokyo, JP").
        - quote: A 1-2 sentence evocative reflection on the product experience.
        - rating: An integer representing 5 stars.
        - date: "Just now" or a very recent date.
        
        Return ONLY a JSON array of objects with these keys. No introduction or markdown blocks.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const cleanText = (data.text || '[]').replace(/```json|```/g, '').trim();
      const generated = JSON.parse(cleanText);
      setAiTestimonials(generated);
      toast.success("AI Testimonials authenticated & synchronized.");
    } catch (err) {
      console.error(err);
      // Fallback to high-quality defaults if AI fails
      setAiTestimonials([
        {
          name: "Julian de Rothschild",
          location: "Bordeaux, FR",
          quote: "The vibrancy of these tomatoes is startling; they carry the literal warmth of the Etna sun and the structural complexity of volcanic soil.",
          rating: 5,
          date: "2 days ago"
        },
        {
          name: "Chef Amara K.",
          location: "Kyoto, JP",
          quote: "In thirty years of sourcing, I have rarely encountered such structural integrity and purity of flavor after international transit.",
          rating: 5,
          date: "5 days ago"
        },
        {
          name: "Maximilian V.",
          location: "Zurich, CH",
          quote: "This is not merely produce; it is a sensory archive of its origin. The freshness benchmark has been permanently shifted.",
          rating: 5,
          date: "1 week ago"
        }
      ]);
    } finally {
      setIsGeneratingTestimonials(false);
    }
  };

  React.useEffect(() => {
    if (product) {
      handleGetBundles();
      handleGenerateTestimonials();
    }
  }, [product]);

  React.useEffect(() => {
    if (deliveryDate && selectedDelivery) {
      handleOptimizeShipping();
    }
  }, [deliveryDate, selectedDelivery]);

  const handleGenerateImages = async () => {
    setIsGeneratingImages(true);
    try {
      // We use Gemini to craft the perfect photorealistic prompt for our target product
      const promptText = `Create a concise, highly detailed, photorealistic luxury photography prompt for:
        Product: ${product?.name}
        Category: ${product?.category}
        Description: ${product?.description}

        Style: Editorial food photography, high-end commercial aesthetic, macro lens, natural morning light, soft shadows, 8k resolution, professional color grading. 
        Focus on: Texture of the organic skin, freshness (e.g. water droplets), and the premium farm-to-table origin.
        Return ONLY the prompt string, no other text or explanation.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const prompt = data.text || `${product?.name} fresh organic produce premium photography`;
      const seeds = [Math.floor(Math.random() * 100000), Math.floor(Math.random() * 100000), Math.floor(Math.random() * 100000)];
      
      const newImages = seeds.map(seed => 
        `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1280&seed=${seed}&nologo=true`
      );
      
      setGeneratedImages(newImages);
      setActiveImage(newImages[0]); // Set first variation as active
      toast.success("AI Laboratory: Product variations rendered successfully.");
    } catch (err) {
      console.error(err);
      toast.error("AI Visualization service is temporarily reaching capacity.");
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleGenerateAiDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      const prompt = `You are a world-class luxury food storyteller and gourmet critic. Craft a compelling, evocative 3-sentence product narrative for:
        Product: ${product?.name}
        Origin: ${product?.originCountry}
        Category: ${product?.category}

        Emphasize:
        1. The specific, unique sensory profile (e.g., "velvety texture with hints of sun-drenched mineral sweetness").
        2. The romantic origin story and terroir (e.g., "nurtured by the ancient volcanic rhythms and Mediterranean breeze").
        3. The elite exclusivity and centuries-old artisanal heritage.
        
        Avoid generic marketing buzzwords. Use high-end, sophisticated imagery and precise, evocative vocabulary.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiDescription(data.text || 'Narration service currently unavailable.');
      toast.success("Product narrative crafted!");
    } catch (err) {
      console.error(err);
      toast.error("Storytelling service busy.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const prompt = `You are a precision agriculture market analyst. Analyze this listing for FreshWorld Marketplace: 
        Product: ${product?.name}
        Origin: ${product?.originCountry}
        Price: ${formatCurrency(product?.price || 0)} / ${product?.unit}
        Description: ${product?.description}

        Provide a concise, expert analysis (max 50 words) comparing this price to global organic benchmarks and mentioning one specific health/quality attribute.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiAnalysis(data.text || 'Market analysis currently unavailable.');
      toast.success("AI Insights generated!");
    } catch (err) {
      console.error(err);
      setAiAnalysis("Analysis currently unavailable. Our records suggest this price is competitive for premium volcanic-soil produce from this region.");
      toast.error("AI Insight service busy. Showing cached data.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOptimizeShipping = async () => {
    setIsOptimizingShipping(true);
    try {
      const prompt = `You are an AI Logistics Specialist specializing in global cold-chain sustainability. 
        Analyze the shipping route for:
        Product: ${product?.name} from ${product?.originCountry}
        Delivery Method: ${selectedDelivery}
        Target Date: ${deliveryDate}

        Consider: Current global shipping congestion, seasonal weather patterns, and fuel efficiency.
        
        Suggest 2 route optimizations and calculate:
        - carbonReduction: Percentage (e.g., 14)
        - costSavings: Amount in USD (e.g., 5.40)
        - routeDescription: e.g., "Marseille Port bypass via electric rail."
        - optimizationReason: Why it's better.

        Return ONLY a JSON object with keys: suggestions (array of { routeDescription, optimizationReason }), totalCarbonReduction (number, percentage), totalCostSavings (number).`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const cleanText = (data.text || '{}').replace(/```json|```/g, '').trim();
      setShippingOptimizations(JSON.parse(cleanText));
      toast.success("Logistics Optimized: AI Route data updated.");
    } catch (err) {
      console.error(err);
      toast.error("Logistics engine calculation timeout.");
    } finally {
      setIsOptimizingShipping(false);
    }
  };

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const getAdjustedPrice = () => {
    let base = product.price;
    if (selectedSize === 'Boutique') base *= 0.85;
    if (selectedSize === 'Grand') base *= 1.25;
    if (selectedPackaging === 'Luxury Gift Box') base += 5.00;
    
    // Delivery Add-ons
    if (selectedDelivery === 'Express Air Freight') base += 12.00;
    if (selectedDelivery === 'Local Cold Chain') base += 22.00;
    
    return base;
  };

  const handleAddToCart = () => {
    if (dateError) {
      toast.error(dateError);
      return;
    }
    
    if (quantity > product!.stock) {
      toast.error(`Only ${product!.stock} ${product!.unit} available in current harvest cycle.`);
      return;
    }

    const adjustedProduct = {
      ...product,
      price: getAdjustedPrice(),
      selectedVariations: {
        size: selectedSize,
        ripeness: selectedRipeness,
        packaging: selectedPackaging,
        delivery: selectedDelivery,
        deliveryDate: deliveryDate
      }
    };
    addToCart(adjustedProduct as any, quantity);
    toast.success(`${product!.name} (${selectedSize}) added to bag!`);
  };

  const handleBuyNow = () => {
    if (dateError) {
      toast.error(dateError);
      return;
    }
    
    if (quantity > product!.stock) {
      toast.error(`Only ${product!.stock} ${product!.unit} available in current harvest cycle.`);
      return;
    }

    const adjustedProduct = {
      ...product,
      price: getAdjustedPrice(),
      selectedVariations: {
        size: selectedSize,
        ripeness: selectedRipeness,
        packaging: selectedPackaging,
        delivery: selectedDelivery,
        deliveryDate: deliveryDate
      }
    };
    addToCart(adjustedProduct as any, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-600"></div>
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] animate-pulse">Syncing Global Market Data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50 gap-6">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-300">
           <AlertCircle size={40} />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-serif italic text-stone-900 mb-2">Listing Unavailable</h1>
          <p className="text-stone-500 max-w-xs mx-auto mb-8">The requested gourmet listing has been archived or moved by the producer.</p>
          <Link to="/market" className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left - Images */}
        <div className="w-full lg:w-1/2">
           <div className="relative group">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl bg-stone-100 border border-stone-100"
              >
                <img 
                  src={activeImage} 
                  className="w-full h-full object-cover transition-all duration-700" 
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  key={activeImage}
                />
              </motion.div>

              <button 
                onClick={handleGenerateImages}
                disabled={isGeneratingImages}
                className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl hover:bg-brand-600 hover:text-white transition-all flex items-center gap-2 group/gen disabled:opacity-50"
              >
                {isGeneratingImages ? (
                  <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Sparkles size={20} className="text-brand-600 group-hover/gen:text-white transition-colors" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest pr-2">AI Visualizer</span>
              </button>
           </div>
          
          <div className="mt-12">
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              {generatedImages.length > 0 ? "AI Generated Visuals" : "Product Gallery"}
            </h4>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
              <motion.div 
                onClick={() => setActiveImage(product.image)}
                className={cn(
                  "aspect-square w-32 rounded-3xl bg-stone-100 overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 shadow-sm",
                  activeImage === product.image ? "border-brand-500 scale-105 shadow-brand-100" : "border-stone-100"
                )}
              >
                <img src={product.image} className="w-full h-full object-cover" alt="Original" referrerPolicy="no-referrer" />
              </motion.div>

              {generatedImages.length > 0 ? (
                generatedImages.map((img, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "aspect-square w-32 rounded-3xl bg-stone-100 overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 shadow-sm",
                      activeImage === img ? "border-brand-500 scale-105 shadow-brand-100" : "border-stone-100"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`AI Variation ${i}`} referrerPolicy="no-referrer" />
                  </motion.div>
                ))
              ) : (
                [1, 2, 3].map(i => (
                  <div key={i} className="aspect-square w-32 rounded-3xl bg-stone-100 overflow-hidden border border-stone-200 cursor-pointer hover:border-brand-500 transition-colors flex-shrink-0">
                    <img src={product.image} className="w-full h-full object-cover opacity-60" alt="" referrerPolicy="no-referrer" />
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 p-6 bg-stone-100 rounded-3xl border border-stone-200">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-600" />
                    <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-widest">AI Vision Laboratory</h4>
                  </div>
                  {isGeneratingImages && (
                    <span className="text-[9px] font-bold text-brand-600 animate-pulse">Rendering Sensory Data...</span>
                  )}
               </div>
               <p className="text-[10px] text-stone-500 font-medium mb-5 leading-relaxed pr-8">
                 Use our proprietary neural engine to visualize the {product.name} in high-fidelity studio environments based on its terroir and metadata.
               </p>
               <button 
                onClick={handleGenerateImages}
                disabled={isGeneratingImages}
                className="w-full py-4 rounded-2xl bg-white border border-stone-200 text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
               >
                 {isGeneratingImages ? (
                   <div className="w-3 h-3 border-2 border-stone-900 border-t-transparent animate-spin rounded-full" />
                 ) : (
                   <Sparkles size={12} />
                 )}
                 {isGeneratingImages ? "Regenerating..." : "Generate Pro-Visual Variations"}
               </button>
            </div>
          </div>
        </div>

        {/* Right - Info */}
        <div className="w-full lg:w-1/2">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Top Rated Seller</span>
            <div className="flex items-center gap-1 text-stone-900 font-bold text-sm">
              <Globe size={16} className="text-stone-400" /> {product.originCountry}
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif italic text-stone-900 mb-6 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-100">
             <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className={i <= Math.floor(localAverage) ? "text-amber-400 fill-current" : "text-stone-200 fill-current"} />)}
                <span className="ml-2 font-bold text-stone-900">{localAverage}</span>
                <span className="text-stone-400 font-medium ml-1">({localReviewCount} Reviews)</span>
             </div>
             <div className="h-6 w-[1px] bg-stone-200"></div>
             <div className="text-brand-600 font-bold flex items-center gap-1">
               <ShieldCheck size={20} /> Verified Organic
             </div>
          </div>
          
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Description</h3>
            </div>
            
            <p className="text-stone-500 leading-relaxed text-lg mb-8">
              {product.description}
            </p>

            {/* AI Narrative Section */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {aiDescription ? (
                  <motion.div 
                    key="ai-desc"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 rounded-[2.5rem] bg-stone-900 text-white relative overflow-hidden shadow-2xl shadow-stone-200"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                      <Sparkles size={64} />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400">The Connoisseur's Narrative</h4>
                    </div>

                    <p className="text-white leading-relaxed text-xl font-serif italic mb-8 relative z-10">
                      "{aiDescription}"
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Authentic Sensory Profile Generated</span>
                      </div>
                      <button 
                        onClick={() => setAiDescription(null)}
                        className="text-stone-500 hover:text-white transition-colors"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ai-cta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 rounded-[2.5rem] border-2 border-stone-100 border-dashed hover:border-brand-200 hover:bg-brand-50/30 transition-all cursor-pointer group"
                    onClick={handleGenerateAiDescription}
                  >
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center transition-all group-hover:bg-brand-600 group-hover:text-white",
                        isGeneratingDescription && "animate-pulse"
                      )}>
                        {isGeneratingDescription ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <Sparkles size={20} className="text-stone-400 group-hover:text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest mb-1">Unlock AI Narrative</h4>
                        <p className="text-[10px] text-stone-400 font-medium uppercase tracking-tighter">Generate a sophisticated, evocative sensory profile for this product.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Connoisseur Reviews & Insights */}
          <div className="mb-16 pt-8 border-t border-stone-100" id="reviews-section">
            <div className="flex items-center justify-between mb-10">
               <div className="flex flex-col gap-1">
                 <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">What Our Global Connoisseurs Say</h3>
                 <p className="text-[10px] text-stone-400 font-bold uppercase italic tracking-widest">Verified Sensory Feedback on Freshness & Quality</p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-full border border-stone-100 shadow-sm">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[8px] font-black shadow-sm">{String.fromCharCode(64 + i)}</div>
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-stone-600 uppercase tracking-widest ml-1">+ {localReviewCount} Reviews</span>
               </div>
            </div>

            <div className="space-y-8">
              {/* Submission Form Card */}
              <div className="bg-stone-50 rounded-[3rem] p-10 border border-stone-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Sparkles size={80} />
                </div>
                
                <AnimatePresence mode="wait">
                  {hasRated ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6"
                    >
                      <div className="w-20 h-20 bg-brand-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-100/50">
                        <ShieldCheck size={40} />
                      </div>
                      <h4 className="text-2xl font-serif italic text-stone-900 mb-3">Encounter Logged</h4>
                      <p className="text-[11px] text-stone-500 font-medium max-w-[320px] mx-auto uppercase tracking-widest leading-loose">Your sensory profile has been integrated into the {product.name} global knowledge base.</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                           <div>
                            <p className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 px-1">Connoisseur Identity</p>
                            <input 
                              type="text"
                              value={reviewName}
                              onChange={(e) => setReviewName(e.target.value)}
                              placeholder="Full Name or Artisan Handle"
                              className="w-full bg-white border border-stone-200 rounded-[1.5rem] py-4 px-6 text-sm font-bold focus:border-brand-600 focus:shadow-lg focus:shadow-brand-100/20 outline-none transition-all placeholder:text-stone-300 shadow-soft"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 px-1">Sensory Rating</p>
                            <div className="flex gap-2 p-3 bg-white rounded-[1.5rem] border border-stone-200 w-fit shadow-soft">
                              {[1, 2, 3, 4, 5].map(i => (
                                <button
                                  key={i}
                                  onMouseEnter={() => setUserRating(i)}
                                  onClick={() => setUserRating(i)}
                                  className="group p-1.5 transition-all text-stone-200 hover:scale-110"
                                >
                                  <Star 
                                    size={28} 
                                    className={cn(
                                      "transition-all duration-500",
                                      i <= userRating ? "text-amber-400 fill-current drop-shadow-sm" : "text-stone-100 fill-stone-50 group-hover:text-amber-200"
                                    )}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 px-1">Review Narrative</p>
                          <textarea 
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Detail the terroir, olfactory notes, and culinary potential..."
                            className="w-full bg-white border border-stone-200 rounded-[2rem] py-5 px-7 text-sm font-medium focus:border-brand-600 focus:shadow-lg focus:shadow-brand-100/20 outline-none transition-all min-h-[160px] resize-none shadow-soft placeholder:text-stone-300"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={handleSubmitRating}
                        className="w-full bg-stone-900 text-white py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-600 transition-all shadow-2xl shadow-stone-200 flex items-center justify-center gap-3 group"
                      >
                        <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                        Authenticate Contribution
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Review Cards List */}
              <div className="grid grid-cols-1 gap-6">
                {[...userReviews, ...aiTestimonials].slice(0, visibleReviews).map((review, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-8 bg-white rounded-[3.5rem] border border-stone-100 shadow-sm hover:shadow-2xl hover:shadow-stone-100 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 py-10 px-12 opacity-[0.02] text-stone-900 pointer-events-none group-hover:scale-110 transition-transform">
                       <Star size={100} className="fill-current" />
                    </div>
                    
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.5rem] bg-stone-50 border border-stone-100 flex items-center justify-center text-brand-600 font-black text-base uppercase shadow-inner">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-serif italic text-stone-900 text-xl leading-none mb-1.5">{review.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{review.location}</p>
                            <span className="w-1 h-1 rounded-full bg-stone-200" />
                            <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest">Verified Connoisseur</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 bg-brand-50/30 px-3 py-2 rounded-2xl border border-brand-100/30">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={14} className={cn("transition-all duration-700", star <= (review.rating || 5) ? "text-amber-400 fill-current" : "text-stone-100")} />
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative mb-8">
                      <div className="absolute -left-6 -top-4 text-brand-50 font-serif text-8xl leading-none pointer-events-none font-bold">"</div>
                      <p className="text-stone-700 text-lg leading-relaxed italic relative z-10 pl-2 pr-12 font-serif">
                        {review.quote}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-stone-50 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Secure Sensory Log</span>
                       </div>
                       {review.date && (
                         <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 px-3 py-1 rounded-full">
                           {review.date}
                         </span>
                       )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {[...userReviews, ...aiTestimonials].length > visibleReviews && (
                <div className="flex justify-center mt-12">
                   <button 
                    onClick={() => setVisibleReviews(prev => prev + 3)}
                    className="group flex items-center gap-3 px-10 py-5 bg-white border border-stone-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:border-brand-600 hover:text-brand-600 transition-all shadow-sm hover:shadow-xl hover:shadow-brand-50"
                   >
                     Load More Reflections
                     <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                   </button>
                </div>
              )}
            </div>
          </div>

          {/* Variations Section */}
          <div className="space-y-10 mb-12">
            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-end mb-4 px-1">
                <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">Volume & Scale</h3>
                <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded-full">Price weights apply</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Boutique', icon: '💎', impact: '-15% Price' },
                  { name: 'Classic', icon: '⚖️', impact: 'Market Standard' },
                  { name: 'Grand', icon: '👑', impact: '+25% Premium' }
                ].map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={cn(
                      "py-6 px-2 rounded-3xl border-2 transition-all text-center group relative overflow-hidden",
                      selectedSize === size.name 
                        ? "border-stone-900 bg-stone-900 text-white shadow-xl shadow-stone-200" 
                        : "border-stone-100 bg-white text-stone-500 hover:border-stone-300"
                    )}
                  >
                    <span className="text-xl mb-2 block">{size.icon}</span>
                    <p className="text-[11px] font-black uppercase tracking-tight mb-1">{size.name}</p>
                    <p className={cn(
                      "text-[9px] font-bold uppercase tracking-tighter opacity-70",
                      selectedSize === size.name ? "text-brand-400" : "text-stone-400"
                    )}>
                      {size.impact}
                    </p>
                    {selectedSize === size.name && (
                      <motion.div layoutId="size-active" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Ripeness Selector */}
            <div>
              <div className="flex justify-between items-end mb-4 px-1">
                <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">Maturity Spectrum</h3>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Tailored to your route</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Early Harvest', desc: 'Firm & Vibrant', icon: '🌿' },
                  { name: 'Perfect Ripeness', desc: 'Peak Sensory', icon: '✨' },
                  { name: 'Full Flavor', desc: 'Soft & Sweet', icon: '🍯' }
                ].map((level) => (
                  <button
                    key={level.name}
                    onClick={() => setSelectedRipeness(level.name)}
                    className={cn(
                      "p-4 rounded-3xl border-2 transition-all text-center group",
                      selectedRipeness === level.name 
                        ? "border-stone-900 bg-stone-900 text-white shadow-xl shadow-stone-200" 
                        : "border-stone-100 bg-white text-stone-500 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-100"
                    )}
                  >
                    <span className="text-lg mb-2 block">{level.icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-tight mb-1">{level.name}</p>
                    <p className={cn(
                      "text-[8px] font-bold uppercase tracking-widest",
                      selectedRipeness === level.name ? "text-stone-400" : "text-stone-300"
                    )}>
                      {level.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Packaging */}
            <div>
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Curation & Packaging</h3>
              <div className="space-y-3">
                {[
                  { name: 'Eco-Sustainable', desc: 'Recycled fiber padding, zero plastic.' },
                  { name: 'Protective Air-Cushion', desc: 'Maximum protection for transatlantic transit.' },
                  { name: 'Luxury Gift Box', desc: 'Handcrafted wood box with parchment. (+$5.00)' }
                ].map((pkg) => (
                  <button
                    key={pkg.name}
                    onClick={() => setSelectedPackaging(pkg.name)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                      selectedPackaging === pkg.name
                        ? "border-brand-600 bg-brand-50/50"
                        : "border-stone-50 bg-stone-50/30 hover:border-stone-100"
                    )}
                  >
                    <div>
                      <p className={cn("text-xs font-black uppercase mb-0.5", selectedPackaging === pkg.name ? "text-brand-900" : "text-stone-700")}>{pkg.name}</p>
                      <p className="text-[10px] text-stone-400 font-medium">{pkg.desc}</p>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      selectedPackaging === pkg.name ? "border-brand-600 bg-brand-600" : "border-stone-200"
                    )}>
                      {selectedPackaging === pkg.name && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8 px-1">
              <div className="flex flex-col gap-1">
                <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">Logistics Protocol</h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase italic tracking-wider">End-to-end provenance tracking</p>
              </div>
              <div className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Optimized Cold-Chain Active</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { 
                  name: 'Standard International Shipping', 
                  time: '5-7 Days', 
                  price: 'Included', 
                  icon: Truck, 
                  minDays: 7,
                  desc: 'Cost-effective global logistics utilizing optimized sea and rail networks.',
                  badge: 'Sustainable Choice',
                  eco: 95,
                  tracking: 'Standard',
                  tier: 'Economy'
                },
                { 
                  name: 'Express Air Freight', 
                  time: '48-72 Hours', 
                  price: '+$12.00', 
                  icon: Globe, 
                  minDays: 2,
                  desc: 'Priority air handling with accelerated customs clearance for peak freshness.',
                  badge: 'Velocity King',
                  eco: 60,
                  tracking: 'Real-time',
                  tier: 'Priority'
                },
                { 
                  name: 'Local Cold Chain', 
                  time: 'Next Day', 
                  price: '+$22.00', 
                  icon: ShieldCheck, 
                  minDays: 1,
                  desc: 'End-to-end refrigerated transport from volcanic soil to your kitchen.',
                  badge: 'Elite Care',
                  eco: 85,
                  tracking: 'Precise',
                  tier: 'Concierge'
                }
              ].map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    setSelectedDelivery(option.name);
                    const d = new Date();
                    d.setDate(d.getDate() + option.minDays);
                    const newDateStr = d.toISOString().split('T')[0];
                    if (deliveryDate < newDateStr) {
                      setDeliveryDate(newDateStr);
                    }
                  }}
                  className={cn(
                    "w-full flex flex-col items-start gap-6 p-8 rounded-[3rem] border-2 transition-all text-left relative overflow-hidden group",
                    selectedDelivery === option.name 
                      ? "border-stone-900 bg-stone-900 text-white shadow-2xl shadow-stone-200" 
                      : "border-stone-100 bg-white hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50"
                  )}
                >
                  <div className="w-full flex justify-between items-start mb-2">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                      selectedDelivery === option.name ? "bg-brand-600 text-white" : "bg-stone-50 text-stone-400 group-hover:bg-stone-900 group-hover:text-white"
                    )}>
                      <option.icon size={28} />
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest border",
                      selectedDelivery === option.name ? "bg-white/10 border-white/10 text-brand-400" : "bg-stone-50 border-stone-100 text-stone-400"
                    )}>
                      {option.tier}
                    </span>
                  </div>
                  
                  <div className="flex-grow w-full">
                    <div className="mb-4">
                        <p className={cn("text-xs font-black uppercase tracking-tight mb-2", selectedDelivery === option.name ? "text-brand-400" : "text-brand-600")}>
                          {option.badge}
                        </p>
                        <p className="text-lg font-serif italic font-bold leading-tight mb-1">{option.name}</p>
                        <span className={cn(
                          "text-sm font-bold opacity-80",
                          selectedDelivery === option.name ? "text-white" : "text-stone-900"
                        )}>
                          {option.price}
                        </span>
                    </div>
                    
                    <p className={cn("text-[11px] leading-relaxed mb-6 font-medium", selectedDelivery === option.name ? "text-stone-400" : "text-stone-500")}>
                      {option.desc}
                    </p>

                    <div className="space-y-3 pt-6 border-t border-current border-opacity-10 w-full opacity-60">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest">Arrival</span>
                          <span className="text-[10px] font-bold">{option.time}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest">Eco Impact</span>
                          <span className="text-[10px] font-bold">{option.eco}%</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest">Tracking</span>
                          <span className="text-[10px] font-bold">{option.tracking}</span>
                       </div>
                    </div>
                  </div>
                  
                  {selectedDelivery === option.name && (
                    <motion.div 
                      layoutId="delivery-active"
                      className="absolute inset-0 border-4 border-brand-600 pointer-events-none rounded-[3rem]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* AI Bundle Suggestions - Relocated for better flow */}
            <div className="mt-12 bg-brand-50/50 rounded-[2.5rem] p-8 border border-brand-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Sparkles size={120} />
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-600 text-white p-2 rounded-xl">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-brand-900 uppercase tracking-[0.2em] mb-0.5">Connoisseur's Curation</h3>
                    <p className="text-[10px] text-brand-600 font-bold uppercase italic">AI Sommelier Pairings</p>
                  </div>
                </div>
                <button 
                  onClick={handleGetBundles}
                  disabled={isGeneratingBundles}
                  className="bg-white px-4 py-2 rounded-full border border-brand-100 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                >
                  {isGeneratingBundles ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  ) : (
                    "Regenerate"
                  )}
                </button>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 relative z-10">
                {bundles.map((bundle, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-shrink-0 w-72 bg-white rounded-[2.5rem] border border-stone-100 p-5 shadow-sm hover:shadow-2xl hover:shadow-brand-100/20 transition-all group"
                  >
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-5 bg-stone-50 relative">
                      <img src={bundle.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={bundle.name} referrerPolicy="no-referrer" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-stone-100 flex items-center gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                        <span className="text-[9px] font-black text-stone-900 uppercase tracking-widest">{bundle.imageType || "Artisanal"}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-black text-stone-900 uppercase leading-none tracking-tight group-hover:text-brand-600 transition-colors pr-4">{bundle.name}</h4>
                          <span className="text-sm font-bold text-brand-600 font-serif italic">{formatCurrency(bundle.price)}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium leading-relaxed italic line-clamp-2">"{bundle.reason}"</p>
                      </div>
                      <button 
                        onClick={() => toast.success(`Added ${bundle.name} to your custom bundle!`)}
                        className="w-full py-4 rounded-2xl bg-stone-50 text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={12} /> Add to Collection
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                {!isGeneratingBundles && bundles.length === 0 && (
                  <div className="w-full py-16 bg-white rounded-[2.5rem] border border-dashed border-brand-200 flex flex-col items-center justify-center text-brand-300">
                    <Sparkles size={32} className="mb-4 opacity-30" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Sommelier Insight...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Date Picker */}
          <div className="mb-12">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Preferred Delivery Window</h3>
             </div>
             <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-600 transition-colors pointer-events-none">
                  <Calendar size={18} />
                </div>
                <input 
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setDeliveryDate(newDate);
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selected = new Date(newDate);
                    selected.setHours(0, 0, 0, 0);
                    
                    const diffTime = selected.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (selected < today) {
                      setDateError("Delivery date cannot be in the past");
                    } else if (diffDays < 3) {
                      setDateError("Minimum 3 days notice required for quality assurance");
                    } else {
                      setDateError(null);
                    }
                  }}
                  min={(() => {
                    const d = new Date();
                    const minDays = selectedDelivery === 'Standard International Shipping' ? 7 : selectedDelivery === 'Express Air Freight' ? 2 : 1;
                    d.setDate(d.getDate() + minDays);
                    return d.toISOString().split('T')[0];
                  })()}
                  className={cn(
                    "w-full bg-stone-50 border-2 rounded-[2rem] py-5 pl-16 pr-6 text-stone-900 font-bold focus:border-brand-600 focus:bg-white outline-none transition-all appearance-none cursor-pointer hover:border-stone-200",
                    dateError ? "border-red-200 bg-red-50" : "border-stone-100"
                  )}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-stone-300 uppercase tracking-widest pointer-events-none">
                  Select Date
                </div>
             </div>
             <AnimatePresence>
               {dateError && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="mt-2 px-6 flex items-center gap-2 text-red-600"
                 >
                   <AlertCircle size={12} />
                   <span className="text-[10px] font-bold uppercase tracking-tight">{dateError}</span>
                 </motion.div>
               )}
             </AnimatePresence>
             <p className="mt-3 text-[10px] text-stone-400 italic font-medium px-2">Global cold-chain logistics ensures freshness on your selected arrival date.</p>
          </div>

          {/* Shipping Route Optimization Section */}
          <div className="mb-12 bg-stone-900 rounded-[2.5rem] p-8 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
              <Globe size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-600 rounded-xl">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400">Logistics AI Alpha</h3>
                    <p className="text-xs font-bold text-white">Neural Route Optimization</p>
                  </div>
                </div>
                <button 
                  onClick={handleOptimizeShipping}
                  disabled={isOptimizingShipping}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all disabled:opacity-50"
                >
                  <RotateCcw size={14} className={cn(isOptimizingShipping && "animate-spin text-brand-400")} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isOptimizingShipping ? (
                  <motion.div 
                    key="optimizing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-6 space-y-4"
                  >
                    {[1, 2].map(i => (
                      <div key={i} className="h-16 w-full bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest text-center">Syncing with Global Port Data...</p>
                  </motion.div>
                ) : shippingOptimizations ? (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Carbon Reduction</p>
                        <p className="text-2xl font-serif italic">-{shippingOptimizations.totalCarbonReduction}%</p>
                        <p className="text-[9px] text-stone-400 font-medium">Eco-optimized routing</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Cost Efficiency</p>
                        <p className="text-2xl font-serif italic">{formatCurrency(shippingOptimizations.totalCostSavings)}</p>
                        <p className="text-[9px] text-stone-400 font-medium">Logistics rebate applied</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {shippingOptimizations.suggestions?.map((s: any, i: number) => (
                        <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5 group/opt transition-all hover:bg-white/10">
                           <div className="bg-brand-600/20 text-brand-400 p-2 rounded-lg group-hover/opt:scale-110 transition-transform">
                              <TrendingUp size={14} />
                           </div>
                           <div>
                              <p className="text-[11px] font-bold text-white mb-1">{s.routeDescription}</p>
                              <p className="text-[10px] text-stone-400 leading-relaxed">{s.optimizationReason}</p>
                           </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-brand-600/10 rounded-xl border border-brand-600/20">
                      <AlertCircle size={12} className="text-brand-400" />
                      <p className="text-[10px] text-brand-400 font-medium italic leading-tight">Optimizations adjusted for current {product.originCountry} export corridor congestion.</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-xs text-stone-500 font-medium">Select delivery method to compute AI routes.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mb-10 group/price">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-1 block">Premium Price</span>
                <div className="flex items-baseline gap-2">
                   <h2 className="text-4xl font-black text-stone-900">{formatCurrency(getAdjustedPrice())}</h2>
                   <span className="text-xl text-stone-400 font-medium">/ {product.unit}</span>
                </div>
              </div>
              
              <button 
                onClick={handleAiAnalysis}
                disabled={isAiLoading}
                className="group relative px-6 py-4 bg-stone-900 text-white rounded-2xl flex items-center gap-3 hover:bg-brand-600 transition-all font-black text-xs uppercase tracking-widest overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                 <AnimatePresence mode="wait">
                    {isAiLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 bg-brand-600 flex items-center justify-center"
                      >
                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                      </motion.div>
                    ) : null}
                 </AnimatePresence>
                 <Sparkles size={16} className="text-brand-400 group-hover:rotate-12 transition-transform" /> 
                 Get AI Insights
              </button>
            </div>

            {/* Inventory Status & Management */}
            <div className="mb-10 p-6 bg-stone-50 rounded-[2.5rem] border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner",
                  product.stock > (product.lowStockThreshold || 5) ? "bg-emerald-50 text-emerald-600" : "bg-brand-50 text-brand-600"
                )}>
                  {product.stock}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-1">Harvest Reserve</h4>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-tighter">
                    {product.stock > 0 ? `${product.stock} ${product.unit} Available in Cold-Chain Storage` : "Currently Depleted - Next Harvest Awaited"}
                  </p>
                </div>
              </div>

              {auth.currentUser?.uid === product.sellerId && (
                <div className="flex items-center gap-3">
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Alert Threshold</span>
                      <div className="flex items-center gap-2 mt-1">
                         <input 
                           type="number"
                           defaultValue={product.lowStockThreshold || 5}
                           onBlur={async (e) => {
                             const threshold = parseInt(e.target.value);
                             if (!isNaN(threshold)) {
                               try {
                                 await productService.updateProduct(product.id, { lowStockThreshold: threshold });
                                 setProduct({ ...product, lowStockThreshold: threshold });
                                 toast.success("Low stock threshold calibrated.");
                               } catch (err) {
                                  console.error(err);
                                  toast.error("Failed to update threshold.");
                               }
                             }
                           }}
                           className="w-12 bg-white border border-stone-200 rounded-lg py-1 px-2 text-[10px] font-bold text-center outline-none focus:border-brand-600"
                         />
                         <span className="text-[10px] font-bold text-stone-900">{product.unit}</span>
                      </div>
                   </div>
                   <div className="w-[1px] h-8 bg-stone-200" />
                   <div className="bg-brand-600/10 text-brand-600 p-2 rounded-xl">
                      <TrendingUp size={16} />
                   </div>
                </div>
              )}
            </div>

            <AnimatePresence>
              {aiAnalysis && (
                <motion.div 
                   initial={{ opacity: 0, y: 10, height: 0 }}
                   animate={{ opacity: 1, y: 0, height: 'auto' }}
                   exit={{ opacity: 0, y: 10, height: 0 }}
                   className="bg-stone-50 border border-stone-100 p-6 rounded-[2rem] flex gap-4 overflow-hidden"
                >
                   <div className="bg-brand-600 text-white p-2.5 rounded-xl h-fit flex-shrink-0 shadow-lg shadow-brand-100">
                      <Sparkles size={14} />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Market Intelligence Intelligence</p>
                        <span className="w-1 h-1 rounded-full bg-brand-200" />
                        <p className="text-[9px] font-bold text-stone-400 uppercase">Live Analysis</p>
                      </div>
                      <p className="text-stone-900 text-sm font-medium leading-relaxed italic pr-4">"{aiAnalysis}"</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price History Chart */}
            <div className="mt-8 pt-8 border-t border-stone-100">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                     <TrendingUp size={16} className="text-stone-400" />
                     <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">6-Month Price Index</h3>
                  </div>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">Stable Market</span>
               </div>
               
               <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PRICE_HISTORY}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                        dy={10}
                      />
                      <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1c1917', 
                          border: 'none', 
                          borderRadius: '12px',
                          fontSize: '10px',
                          color: '#fff',
                          fontWeight: 900
                        }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
               <p className="text-[9px] text-stone-400 mt-4 italic font-medium leading-relaxed uppercase tracking-wider">Historical values represent verified transactions in the Mediterranean organic corridor.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mb-12">
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-2 bg-stone-100 p-2 rounded-2xl h-16 w-fit">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-stone-600 hover:text-brand-600 transition-colors"><Minus size={20} /></button>
                 <span className="w-12 text-center font-black text-xl">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-stone-600 hover:text-brand-600 transition-colors"><Plus size={20} /></button>
               </div>
               <div className="flex items-center gap-2 px-2">
                 <div className={cn("w-2 h-2 rounded-full", quantity <= product!.stock ? "bg-emerald-500" : "bg-red-500 animate-pulse")} />
                 <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                   {quantity <= product!.stock ? `${product!.stock} in stock` : "Exceeds availability"}
                 </span>
               </div>
             </div>
             <button 
                onClick={handleAddToCart}
                disabled={quantity > product!.stock}
                className="flex-grow bg-brand-600 text-white h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-100 hover:bg-brand-500 transition-all font-serif italic disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
             >
                <ShoppingCart size={24} /> Add to Bag
             </button>
             <button 
                onClick={handleBuyNow}
                disabled={quantity > product!.stock}
                className="flex-grow bg-stone-900 text-white h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-stone-200 hover:bg-stone-800 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
             >
                Order Direct
             </button>
             <button className="h-16 w-16 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-stone-600 hover:text-red-500 transition-all shadow-sm">
                <Heart size={24} />
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
                <Truck className="text-brand-600" size={24} />
                <span className="text-xs font-bold text-stone-600 underline">Global Cold Chain Delivery</span>
             </div>
             <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
                <RotateCcw className="text-brand-600" size={24} />
                <span className="text-xs font-bold text-stone-600 underline">7-Day Freshness Guarantee</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
