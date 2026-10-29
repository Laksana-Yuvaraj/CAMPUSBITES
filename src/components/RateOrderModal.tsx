import React, { useState } from 'react';
import { X, Star, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';

interface RateOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewed: () => void;
}

export const RateOrderModal: React.FC<RateOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onReviewed,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const quickTags = [
    'Piping Hot',
    'Crispy & Fresh',
    'Generous Portions',
    'Super Fast Delivery',
    'Great Packaging',
    'Value for Money',
  ];

  const handleToggleTag = (t: string) => {
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.rateOrder(order.id, rating, comment, selectedTags);
      onReviewed();
      onClose();
    } catch (e) {
      console.error('Failed to submit review:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rate Canteen & Meal</h3>
            <p className="text-[11px] text-slate-500">{order.canteenName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-slate-800 text-center">
          <p className="text-xs text-slate-600">
            How was your food experience from {order.canteenName}?
          </p>

          {/* Star selector */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700">
            {rating === 5
              ? 'Awesome! Loved it 😋'
              : rating === 4
              ? 'Very Good 👍'
              : rating === 3
              ? 'Decent / Average 😐'
              : 'Could be better 😕'}
          </span>

          {/* Quick compliment tags */}
          <div className="text-left pt-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              What did you like most?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment input */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your detailed feedback for fellow students..."
            rows={3}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            {loading ? 'Submitting Review...' : 'Submit Student Review'}
          </button>
        </div>
      </div>
    </div>
  );
};
