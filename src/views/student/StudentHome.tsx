import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Flame,
  Clock,
  Star,
  MapPin,
  ChevronRight,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Bot,
  Loader2,
  Check,
} from 'lucide-react';
import { Canteen, MenuItem, FoodCategory } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';

interface StudentHomeProps {
  onSelectCanteen: (canteen: Canteen) => void;
  onOpenAIAssistant: () => void;
  onOpenAISupport: () => void;
  onOpenReviewSummary: (canteen: Canteen) => void;
  onOpenItemCustomization: (item: MenuItem, canteenName: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  onSelectCanteen,
  onOpenAIAssistant,
  onOpenAISupport,
  onOpenReviewSummary,
  onOpenItemCustomization,
}) => {
  const { addItem } = useCart();
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyOpen, setOnlyOpen] = useState(false);

  // Gemini AI Search state
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<{
    matchingItemIds: string[];
    explanation: string;
    suggestedTags: string[];
  } | null>(null);

  const categories: { label: string; icon: string }[] = [
    { label: 'All', icon: '🍽️' },
    { label: 'Breakfast', icon: '🥞' },
    { label: 'Lunch', icon: '🍛' },
    { label: 'Snacks', icon: '🥪' },
    { label: 'Beverages', icon: '☕' },
    { label: 'Combos', icon: '🍱' },
    { label: 'Healthy', icon: '🥗' },
    { label: 'Desserts', icon: '🧁' },
  ];

  useEffect(() => {
    Promise.all([api.getCanteens(), api.getMenu()])
      .then(([canteenRes, menuRes]) => {
        setCanteens(canteenRes.canteens);
        setPopularItems(menuRes.items.filter((i) => i.popular));
      })
      .catch((e) => console.error('Failed to load home data:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleAiSearch = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : searchQuery.trim();
    if (!q) {
      setAiSearchResult(null);
      return;
    }
    setSearchQuery(q);
    setIsAiSearching(true);

    try {
      const res = await api.aiFoodSearch(q);
      setAiSearchResult(res);
    } catch (e) {
      console.error('AI search failed:', e);
    } finally {
      setIsAiSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setAiSearchResult(null);
  };

  const filteredCanteens = canteens.filter((c) => {
    if (onlyOpen && !c.isOpen) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Search Bar & AI Search Input */}
      <div className="bg-gradient-to-b from-emerald-700 via-emerald-600 to-green-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 rounded-full bg-black/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Campus Canteen Direct
            </span>
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Dining Assistant</span>
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight mb-4">
            Hungry on Campus? <br className="hidden sm:inline" />
            Order fresh meals right to your block.
          </h1>

          {/* Search Box */}
          <div className="relative">
            <div className="flex items-center bg-white rounded-2xl shadow-lg overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-emerald-400">
              <Search className="w-5 h-5 text-slate-400 ml-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                placeholder="Ask Gemini: 'spicy lunch under ₹100' or 'healthy shake'..."
                className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => handleAiSearch()}
                disabled={isAiSearching || !searchQuery.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {isAiSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] text-emerald-100 font-semibold shrink-0">Try:</span>
            {[
              'Spicy under ₹100',
              'Healthy lunch without paneer',
              'Double Cheese Maggi',
              'Kadak Kulhad Chai',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleAiSearch(chip)}
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium whitespace-nowrap transition-colors border border-white/20 shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Search Results Banner if active */}
      {aiSearchResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Gemini AI Food Recommendations
                </h3>
                <p className="text-xs text-slate-600">{aiSearchResult.explanation}</p>
              </div>
            </div>
            <button
              onClick={clearSearch}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1 rounded-lg hover:bg-slate-200/60"
            >
              Clear
            </button>
          </div>

          {/* Matching items cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {popularItems
              .filter((i) => aiSearchResult.matchingItemIds.includes(i.id))
              .map((item) => {
                const c = canteens.find((can) => can.id === item.canteenId);
                return (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{c?.name}</p>
                        <p className="text-xs font-extrabold text-emerald-700">₹{item.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenItemCustomization(item, c?.name || 'Canteen')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs"
                    >
                      Add +
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Campus Offers Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
              FREE DELIVERY
            </span>
            <h4 className="text-sm font-extrabold mt-1">Zero Delivery Fee Above ₹99</h4>
            <p className="text-xs text-amber-100">Use coupon code FREEDEL at checkout</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Percent className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
              CAMPUS FRESHER 2026
            </span>
            <h4 className="text-sm font-extrabold mt-1">Flat ₹50 Off on Any Canteen</h4>
            <p className="text-xs text-emerald-100">Use coupon code CAMPUS50 (Min ₹150)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Food Category Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Explore Categories
          </h2>
          <span className="text-xs text-slate-400">7 Campus Cuisines</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Campus Bites Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Popular On Campus Today
            </h2>
          </div>
          <span className="text-xs text-slate-500">Student Top Picks</span>
        </div>

        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
          {popularItems.map((item) => {
            const canteen = canteens.find((c) => c.id === item.canteenId);
            return (
              <div
                key={item.id}
                className="w-56 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div className="relative h-28 bg-slate-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span
                    className={`absolute top-2 left-2 w-4 h-4 rounded-xs border flex items-center justify-center bg-white/90 backdrop-blur-xs ${
                      item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                  </span>
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{item.preparationTime}m</span>
                  </span>
                </div>

                <div className="p-3 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{canteen?.name}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">₹{item.price}</span>
                      <span className="text-[10px] text-slate-400 ml-1">{item.calories} kcal</span>
                    </div>

                    <button
                      onClick={() => onOpenItemCustomization(item, canteen?.name || 'Canteen')}
                      className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Add +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canteens & Food Courts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Campus Canteens & Bistros
            </h2>
            <p className="text-xs text-slate-500">Fast delivery across all hostels and labs</p>
          </div>

          <button
            onClick={() => setOnlyOpen(!onlyOpen)}
            className={`px-3 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              onlyOpen
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Available Now Only</span>
            {onlyOpen && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Canteen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCanteens.map((canteen) => (
            <div
              key={canteen.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              {/* Image banner */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={canteen.image}
                  alt={canteen.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Open/Closed Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 ${
                      canteen.isOpen
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        canteen.isOpen ? 'bg-white animate-pulse' : 'bg-white'
                      }`}
                    />
                    <span>{canteen.isOpen ? 'Open Now' : 'Closed'}</span>
                  </span>

                  <span className="text-[10px] font-semibold bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-xs">
                    {canteen.openingTime} - {canteen.closingTime}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 text-slate-900 px-2 py-0.5 rounded-full shadow-sm text-xs font-extrabold backdrop-blur-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{canteen.rating}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({canteen.ratingCount})
                  </span>
                </div>

                {/* Bottom title on image */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-extrabold text-base leading-tight drop-shadow-xs">
                    {canteen.name}
                  </h3>
                  <p className="text-[11px] text-slate-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{canteen.location}</span>
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {canteen.description}
                </p>

                {/* Quick stats row */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Avg Prep</p>
                    <p className="text-xs font-extrabold text-slate-800">
                      ~{canteen.avgPrepTimeMinutes} mins
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Min Order</p>
                    <p className="text-xs font-extrabold text-slate-800">
                      ₹{canteen.minimumOrderValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Kitchen Load</p>
                    <p className="text-xs font-extrabold text-emerald-700">
                      {canteen.rushCapacityPercent}%
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onOpenReviewSummary(canteen)}
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                    title="View Gemini AI Review Insights"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => onSelectCanteen(canteen)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                  >
                    <span>View Menu & Order</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
