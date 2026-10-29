import React, { useState, useEffect } from 'react';
import { X, Sparkles, Star, ThumbsUp, AlertTriangle, Heart, Loader2 } from 'lucide-react';
import { api } from '../services/api.ts';
import { Canteen, Review } from '../types/index.ts';

interface AIReviewSummaryModalProps {
  canteen: Canteen | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIReviewSummaryModal: React.FC<AIReviewSummaryModalProps> = ({
  canteen,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    summary: string;
    pros: string[];
    cons: string[];
    highlightDish: string;
    studentSentimentScore: number;
  } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (isOpen && canteen) {
      setLoading(true);
      api.getCanteenReviewSummary(canteen.id)
        .then((res) => {
          setSummaryData(res.summary);
          setReviews(res.reviews || []);
        })
        .catch((e) => {
          console.error('Failed to load review summary:', e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, canteen]);

  if (!isOpen || !canteen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-green-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Gemini Student Review Insights</h3>
              <p className="text-xs text-emerald-100">{canteen.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Gemini is synthesizing verified campus reviews...</p>
            </div>
          ) : summaryData ? (
            <>
              {/* Score Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Campus Sentiment
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold text-emerald-800">
                      {summaryData.studentSentimentScore}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">Positive Feedback</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-amber-500 font-extrabold text-base">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{canteen.rating}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {canteen.ratingCount} Student Ratings
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Overall Synthesis
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                  "{summaryData.summary}"
                </p>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pros */}
                <div className="bg-green-50/70 border border-green-200 p-3.5 rounded-2xl">
                  <h5 className="text-xs font-bold text-green-900 flex items-center gap-1.5 mb-2">
                    <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
                    <span>Top Student Praises</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-green-800">
                    {summaryData.pros.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-green-600 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl">
                  <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Watchouts & Peaks</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-amber-800">
                    {summaryData.cons.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Highlight Loved Dish */}
              {summaryData.highlightDish && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0 fill-rose-500" />
                  <div className="text-xs">
                    <span className="font-bold text-rose-900">Campus Crowd Favorite: </span>
                    <span className="text-rose-800 font-semibold">{summaryData.highlightDish}</span>
                  </div>
                </div>
              )}

              {/* Verified Student Reviews */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Recent Verified Reviews ({reviews.length})
                </h4>
                <div className="space-y-2">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{r.userName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600">{r.comment}</p>
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.tags.map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
