import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, CheckCircle, ShieldCheck, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Review } from '../types';
import { reviewService } from '../services/reviewService';
import { cn } from '../lib/utils';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
  } | null;
  isVerifiedBuyer: boolean;
  onReviewSubmitted: (newReview: Review) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  currentUser,
  isVerifiedBuyer,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  const [freshnessRating, setFreshnessRating] = useState<number>(5);
  const [packagingRating, setPackagingRating] = useState<number>(5);
  const [tasteRating, setTasteRating] = useState<number>(5);

  const [comment, setComment] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const RATING_LABELS: Record<number, string> = {
    1: 'Poor - Did not meet fresh standards',
    2: 'Below Average - Subpar quality',
    3: 'Average - Standard produce',
    4: 'Very Good - Crisp and delicious',
    5: 'Exceptional - Supreme harvest quality!',
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    if (images.length >= 3) {
      toast.error('Maximum 3 photos allowed per review.');
      return;
    }
    setImages([...images, imageUrl.trim()]);
    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please sign in to leave a review.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      toast.error('Please provide a feedback comment of at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await reviewService.addReview({
        productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Verified Customer',
        userPhoto: currentUser.photoURL,
        rating,
        comment: comment.trim(),
        verifiedPurchase: isVerifiedBuyer,
        freshnessRating,
        packagingRating,
        tasteRating,
        images: images.length > 0 ? images : undefined,
      });

      toast.success('Thank you! Your product review has been published.');
      onReviewSubmitted(created);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-stone-100 my-8"
        >
          {/* Header */}
          <div className="bg-stone-900 text-white p-6 sm:p-8 relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-brand-500 text-stone-900 rounded-lg">
                <Sparkles size={14} />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400">
                Produce Review & Trust
              </span>
            </div>
            <h2 className="text-2xl font-serif italic font-bold leading-tight">
              Rate {productName}
            </h2>
            <p className="text-stone-400 text-xs mt-1">
              Share your authentic feedback to help fellow buyers and support direct farm producers.
            </p>

            {/* Verified buyer status */}
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10 text-xs">
              {isVerifiedBuyer ? (
                <>
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="font-bold text-emerald-300">Verified Customer Order</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="text-amber-400" />
                  <span className="text-stone-300">Community Reviewer</span>
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Overall Rating Star Selector */}
            <div>
              <label className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-2">
                Overall Produce Rating *
              </label>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={cn(
                        'transition-colors',
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-200 fill-stone-100'
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-brand-700 h-5">
                {RATING_LABELS[hoverRating || rating]}
              </p>
            </div>

            {/* Sub Quality Ratings */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-3">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Detailed Quality Metrics
              </h4>

              {/* Freshness */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Freshness & Ripeness</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFreshnessRating(s)}
                      className="p-1"
                    >
                      <Star
                        size={16}
                        className={cn(
                          s <= freshnessRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Packaging */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Cold-Chain & Packaging</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPackagingRating(s)}
                      className="p-1"
                    >
                      <Star
                        size={16}
                        className={cn(
                          s <= packagingRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Taste */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Taste & Flavor Profile</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTasteRating(s)}
                      className="p-1"
                    >
                      <Star
                        size={16}
                        className={cn(
                          s <= tasteRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Text Area */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  Your Detailed Feedback *
                </label>
                <span className="text-[10px] text-stone-400 font-bold">
                  {comment.length} / 500 chars
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the freshness, texture, and taste? Did it arrive well packaged? How was the delivery speed?"
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 placeholder-stone-400 outline-none focus:border-brand-600 focus:bg-white transition-all"
              />
            </div>

            {/* Photo Attachment (URL) */}
            <div>
              <label className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-2">
                Add Photos of Received Produce (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL (e.g. https://...)"
                  className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium outline-none focus:border-brand-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 bg-stone-900 text-white rounded-xl font-bold text-xs hover:bg-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <Camera size={14} /> Add
                </button>
              </div>

              {images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-stone-200 flex-shrink-0">
                      <img src={img} alt="Product review photo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-stone-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-stone-100 text-stone-700 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="flex-[2] py-3.5 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-brand-500 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} /> Publish Verified Review
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
