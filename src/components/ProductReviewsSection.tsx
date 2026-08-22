import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  ShieldCheck, 
  Filter, 
  CheckCircle, 
  Sparkles, 
  User, 
  ChevronDown, 
  Send, 
  Store, 
  Award, 
  Smile, 
  Package, 
  Leaf 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Review, Product } from '../types';
import { reviewService } from '../services/reviewService';
import ReviewModal from './ReviewModal';
import { cn } from '../lib/utils';
import { auth } from '../firebase';

interface ProductReviewsSectionProps {
  product: Product;
  currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
  } | null;
  onRatingUpdated?: (newRating: number, newCount: number) => void;
}

export default function ProductReviewsSection({
  product,
  currentUser,
  onRatingUpdated,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState<boolean>(false);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Seller reply state
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  // Image lightbox preview
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);

  const isSellerOfProduct = currentUser?.uid === product.sellerId;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getReviewsForProduct(product.id);
      setReviews(data);

      if (currentUser?.uid) {
        const isVerified = await reviewService.checkVerifiedPurchase(currentUser.uid, product.id);
        setIsVerifiedBuyer(isVerified);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product.id, currentUser?.uid]);

  const handleReviewSubmitted = (newReview: Review) => {
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Update parent product state
    const newCount = updatedReviews.length;
    const newSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAvg = Number((newSum / newCount).toFixed(1));
    if (onRatingUpdated) {
      onRatingUpdated(newAvg, newCount);
    }
  };

  const handleHelpfulVote = async (review: Review) => {
    if (!currentUser) {
      toast.error('Please sign in to mark reviews as helpful.');
      return;
    }

    const { newCount, newUsers } = await reviewService.toggleHelpful(review, currentUser.uid);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === review.id ? { ...r, helpfulCount: newCount, helpfulUsers: newUsers } : r
      )
    );
  };

  const handleSellerReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const sellerReply = await reviewService.addSellerReply(reviewId, replyText.trim());
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, sellerReply } : r))
      );
      toast.success('Reply posted successfully.');
      setActiveReplyReviewId(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Calculate Metrics
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
      : product.rating || 4.8;

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  const avgFreshness = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + (r.freshnessRating || r.rating), 0) / reviews.length).toFixed(1))
    : 4.9;

  const avgPackaging = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + (r.packagingRating || r.rating), 0) / reviews.length).toFixed(1))
    : 4.8;

  const avgTaste = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + (r.tasteRating || r.rating), 0) / reviews.length).toFixed(1))
    : 4.9;

  const verifiedPercent = reviews.length > 0
    ? Math.round((reviews.filter(r => r.verifiedPurchase).length / reviews.length) * 100)
    : 95;

  // Filtered & Sorted Reviews
  const filteredReviews = reviews.filter((r) => {
    if (selectedStarFilter !== 'all' && r.rating !== selectedStarFilter) return false;
    if (verifiedOnly && !r.verifiedPurchase) return false;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    if (sortBy === 'helpful') {
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    }
    return 0;
  });

  return (
    <section id="reviews-section" className="mt-16 pt-12 border-t border-stone-200">
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 bg-amber-100 text-amber-700 rounded-lg">
              <Award size={16} />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
              Trust & Quality Assurance
            </span>
          </div>
          <h2 className="text-3xl font-serif italic font-bold text-stone-900">
            Customer Reviews & Ratings
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Real feedback from verified marketplace customers who purchased from {product.sellerName}.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              toast.error('Please sign in to write a review.');
            } else {
              setIsModalOpen(true);
            }
          }}
          className="px-6 py-3.5 bg-stone-900 hover:bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-2"
        >
          <Sparkles size={16} className="text-amber-400" /> Write a Review
        </button>
      </div>

      {/* Summary Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-stone-50 p-6 sm:p-8 rounded-[36px] border border-stone-200/80 mb-10">
        {/* Big Rating Card */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <span className="text-5xl font-black text-stone-900 tracking-tight">
            {averageRating}
          </span>
          <div className="flex items-center gap-1 my-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={cn(
                  Math.round(averageRating) >= star
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-stone-500">
            Based on {totalReviews} customer {totalReviews === 1 ? 'review' : 'reviews'}
          </p>

          <div className="mt-4 pt-4 border-t border-stone-100 w-full flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">
              {verifiedPercent}% Verified Purchases
            </span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="lg:col-span-4 space-y-2.5 justify-center flex flex-col">
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
            Star Distribution
          </h4>
          {starCounts.map(({ star, count, percentage }) => (
            <div
              key={star}
              onClick={() =>
                setSelectedStarFilter(selectedStarFilter === star ? 'all' : star)
              }
              className="flex items-center gap-3 text-xs font-semibold text-stone-600 cursor-pointer group"
            >
              <span className="w-12 flex items-center gap-1 font-bold group-hover:text-brand-600">
                {star} <Star size={12} className="fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 text-right text-stone-400 font-bold">
                {percentage}%
              </span>
            </div>
          ))}
        </div>

        {/* Quality Metrics */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-4 bg-white/60 p-6 rounded-3xl border border-stone-100">
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
            Produce Quality Scorecard
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Leaf size={14} />
                </div>
                <span className="text-xs font-bold text-stone-800">Freshness & Ripeness</span>
              </div>
              <span className="text-xs font-black text-stone-900 bg-stone-100 px-2.5 py-1 rounded-full">
                {avgFreshness} / 5
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Package size={14} />
                </div>
                <span className="text-xs font-bold text-stone-800">Cold-Chain Packaging</span>
              </div>
              <span className="text-xs font-black text-stone-900 bg-stone-100 px-2.5 py-1 rounded-full">
                {avgPackaging} / 5
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Smile size={14} />
                </div>
                <span className="text-xs font-bold text-stone-800">Taste & Sweetness</span>
              </div>
              <span className="text-xs font-black text-stone-900 bg-stone-100 px-2.5 py-1 rounded-full">
                {avgTaste} / 5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Filter size={14} /> Filter:
          </span>

          {/* Star Filter Tabs */}
          <button
            onClick={() => setSelectedStarFilter('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
              selectedStarFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            All Reviews ({reviews.length})
          </button>

          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStarFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1',
                selectedStarFilter === s
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {s} <Star size={12} className="fill-amber-400 text-amber-400" />
            </button>
          ))}

          <label className="flex items-center gap-2 ml-2 cursor-pointer bg-stone-100 px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 hover:bg-stone-200 transition-colors">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-brand-600 rounded"
            />
            Verified Buyers Only
          </label>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 px-3 py-1.5 outline-none focus:border-brand-600"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-600" />
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Loading Customer Reviews...
            </p>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="py-12 bg-stone-50 rounded-3xl text-center p-8 border border-stone-100">
            <MessageSquare size={36} className="text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-serif italic text-stone-800 mb-1">
              No Reviews Match Your Criteria
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Be the first verified buyer to leave feedback for {product.name}!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-500 transition-colors"
            >
              Write First Review
            </button>
          </div>
        ) : (
          sortedReviews.map((review) => {
            const hasVotedHelpful =
              currentUser?.uid && review.helpfulUsers?.includes(currentUser.uid);

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-8 rounded-[32px] border border-stone-100 shadow-sm transition-all hover:border-stone-200"
              >
                {/* Author info & Stars */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 flex items-center justify-center text-stone-400 font-bold flex-shrink-0">
                      {review.userPhoto ? (
                        <img
                          src={review.userPhoto}
                          alt={review.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-stone-900">
                          {review.userName}
                        </h4>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                            <CheckCircle size={10} /> Verified Customer
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Reviewed on{' '}
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-2xl border border-stone-100 w-fit">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={cn(
                            s <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-200'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-stone-800 ml-1">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                {/* Sub ratings chips */}
                {(review.freshnessRating || review.packagingRating || review.tasteRating) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.freshnessRating && (
                      <span className="text-[10px] font-bold bg-stone-50 text-stone-600 px-2.5 py-1 rounded-lg border border-stone-100">
                        Freshness: {review.freshnessRating}/5 ★
                      </span>
                    )}
                    {review.packagingRating && (
                      <span className="text-[10px] font-bold bg-stone-50 text-stone-600 px-2.5 py-1 rounded-lg border border-stone-100">
                        Packaging: {review.packagingRating}/5 ★
                      </span>
                    )}
                    {review.tasteRating && (
                      <span className="text-[10px] font-bold bg-stone-50 text-stone-600 px-2.5 py-1 rounded-lg border border-stone-100">
                        Taste: {review.tasteRating}/5 ★
                      </span>
                    )}
                  </div>
                )}

                {/* Review Comment Body */}
                <p className="text-stone-800 text-sm font-medium leading-relaxed mb-4">
                  "{review.comment}"
                </p>

                {/* Attached Customer Photos */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-3 mb-5 overflow-x-auto">
                    {review.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveImagePreview(img)}
                        className="w-20 h-20 rounded-2xl overflow-hidden border border-stone-200 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0 shadow-sm"
                      >
                        <img
                          src={img}
                          alt="Customer produce photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Seller Reply Box (If exists) */}
                {review.sellerReply && (
                  <div className="mt-4 p-5 bg-brand-50/60 rounded-2xl border border-brand-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-brand-700" />
                        <span className="text-xs font-black text-brand-900 uppercase tracking-wider">
                          Official Response from {product.sellerName}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400">
                        {new Date(review.sellerReply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-800 font-medium italic pt-1">
                      "{review.sellerReply.reply}"
                    </p>
                  </div>
                )}

                {/* Review Footer Actions */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleHelpfulVote(review)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      hasVotedHelpful
                        ? 'bg-brand-100 text-brand-800'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                    )}
                  >
                    <ThumbsUp size={14} className={hasVotedHelpful ? 'fill-brand-700' : ''} />
                    Helpful ({review.helpfulCount || 0})
                  </button>

                  {/* Reply trigger for Seller */}
                  {isSellerOfProduct && !review.sellerReply && (
                    <button
                      onClick={() =>
                        setActiveReplyReviewId(
                          activeReplyReviewId === review.id ? null : review.id
                        )
                      }
                      className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                    >
                      <MessageSquare size={14} /> Respond as Seller
                    </button>
                  )}
                </div>

                {/* Inline Seller Reply Input Form */}
                {activeReplyReviewId === review.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-stone-100"
                  >
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Write response from {product.sellerName}:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Thank customer or offer resolution..."
                        className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium outline-none focus:border-brand-600"
                      />
                      <button
                        onClick={() => handleSellerReplySubmit(review.id)}
                        disabled={isSubmittingReply || !replyText.trim()}
                        className="px-4 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-500 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send size={14} /> Send
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Write Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={product.id}
        productName={product.name}
        currentUser={currentUser}
        isVerifiedBuyer={isVerifiedBuyer}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Lightbox Image Preview Modal */}
      {activeImagePreview && (
        <div
          onClick={() => setActiveImagePreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={activeImagePreview}
              alt="Expanded view"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </section>
  );
}
