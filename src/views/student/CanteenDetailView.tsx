import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Sparkles,
  MapPin,
  Search,
  Flame,
  Plus,
  ShoppingBag,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Canteen, MenuItem, FoodCategory } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';

interface CanteenDetailViewProps {
  canteen: Canteen;
  onBack: () => void;
  onOpenItemCustomization: (item: MenuItem, canteenName: string) => void;
  onOpenReviewSummary: (canteen: Canteen) => void;
  onOpenCart: () => void;
}

export const CanteenDetailView: React.FC<CanteenDetailViewProps> = ({
  canteen,
  onBack,
  onOpenItemCustomization,
  onOpenReviewSummary,
  onOpenCart,
}) => {
  const { addItem, items: cartItems, subtotal } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    api.getMenu({ canteenId: canteen.id })
      .then((res) => setMenuItems(res.items))
      .catch((e) => console.error('Failed to load menu items:', e))
      .finally(() => setLoading(false));
  }, [canteen.id]);

  const categories = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Combos', 'Healthy', 'Desserts'];

  const filteredItems = menuItems.filter((item) => {
    if (vegOnly && !item.isVeg) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const cartItemsFromThisCanteen = cartItems.filter((_, idx) => true); // canteen already validated in context

  return (
    <div className="space-y-5 pb-28">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Canteens</span>
      </button>

      {/* Canteen Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="relative h-48 sm:h-56 bg-slate-900">
          <img
            src={canteen.image}
            alt={canteen.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges on Hero */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5 ${
                canteen.isOpen ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{canteen.isOpen ? 'Canteen Open' : 'Closed for Orders'}</span>
            </span>

            <span className="text-xs font-semibold bg-black/60 text-white px-3 py-1 rounded-full backdrop-blur-xs">
              {canteen.openingTime} - {canteen.closingTime}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black drop-shadow-sm leading-tight">
                  {canteen.name}
                </h1>
                <p className="text-xs text-slate-200 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{canteen.location}</span>
                </p>
              </div>

              <button
                onClick={() => onOpenReviewSummary(canteen)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>{canteen.rating}</span>
                <span className="text-slate-200 text-[11px]">({canteen.ratingCount})</span>
                <Sparkles className="w-3 h-3 text-emerald-300 ml-0.5" />
                <span className="text-[11px] text-emerald-200 font-semibold underline">AI Summary</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 p-3.5 text-center bg-slate-50/70 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Prep Time</p>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
              ~{canteen.avgPrepTimeMinutes} Mins
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Min Order</p>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
              ₹{canteen.minimumOrderValue}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Kitchen Load</p>
            <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
              {canteen.rushCapacityPercent}% (Active)
            </p>
          </div>
        </div>
      </div>

      {/* Menu Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
        {/* Search within canteen */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, drinks, rolls..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Veg Only</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Menu Items ({filteredItems.length})
          </h3>
          <span className="text-xs text-slate-400">All prices in INR (₹)</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
            <p className="text-xs font-semibold">No menu items match your filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setVegOnly(false);
              }}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredItems.map((item) => {
              const hasCustomizations = Boolean(
                item.customizationOptions?.sizes ||
                  item.customizationOptions?.extras ||
                  item.customizationOptions?.spiceLevels ||
                  item.customizationOptions?.removableIngredients
              );

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-all flex justify-between gap-3 ${
                    !item.isAvailable || item.stock <= 0 ? 'opacity-60 grayscale-[40%]' : ''
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Veg indicator & Spice flame */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>

                        {item.spiceLevel > 0 && (
                          <div className="flex items-center text-orange-500" title={`Spice Level ${item.spiceLevel}/3`}>
                            {Array.from({ length: item.spiceLevel }).map((_, i) => (
                              <Flame key={i} className="w-3 h-3 fill-orange-500" />
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.calories} kcal
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">₹{item.price}</span>
                      {hasCustomizations && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          Customizable
                        </span>
                      )}
                      {item.stock <= 10 && item.stock > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                          Only {item.stock} left!
                        </span>
                      )}
                      {(!item.isAvailable || item.stock <= 0) && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Image & Add button */}
                  <div className="relative w-28 h-28 shrink-0 flex flex-col items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-2xl border border-slate-100"
                    />

                    {item.isAvailable && item.stock > 0 ? (
                      <button
                        onClick={() => {
                          if (hasCustomizations) {
                            onOpenItemCustomization(item, canteen.name);
                          } else {
                            addItem(item, canteen.name, 1);
                          }
                        }}
                        className="absolute -bottom-2 bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-1.5 rounded-xl border border-emerald-200 font-extrabold text-xs shadow-md transition-all hover:scale-105"
                      >
                        ADD +
                      </button>
                    ) : (
                      <span className="absolute -bottom-2 bg-slate-200 text-slate-500 px-3 py-1 rounded-xl text-[10px] font-bold shadow-xs">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-20 left-4 right-4 max-w-lg mx-auto z-40 animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={onOpenCart}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between transition-all font-bold text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items in Cart
                </p>
                <p className="text-[11px] text-emerald-100 font-normal">From {canteen.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold">₹{subtotal}</span>
              <span className="text-xs bg-white text-emerald-800 px-2 py-1 rounded-lg">
                View Cart →
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
