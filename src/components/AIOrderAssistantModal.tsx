import React, { useState } from 'react';
import { X, Sparkles, Plus, Check, Loader2, Utensils, Users, DollarSign } from 'lucide-react';
import { api } from '../services/api.ts';
import { MenuItem, Canteen } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface AIOrderAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  canteensMenu: MenuItem[];
  canteenName?: string;
  canteenId?: string;
}

export const AIOrderAssistantModal: React.FC<AIOrderAssistantModalProps> = ({
  isOpen,
  onClose,
  canteensMenu: initialMenu,
  canteenName = 'Aryabhatta Central Canteen',
  canteenId: initialCanteenId = 'canteen-1',
}) => {
  const { addItem } = useCart();
  const [canteenId, setCanteenId] = useState(initialCanteenId);
  const [currentCanteenName, setCurrentCanteenName] = useState(canteenName);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenu || []);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [budget, setBudget] = useState<number>(180);
  const [dietary, setDietary] = useState<'any' | 'veg' | 'non-veg'>('veg');
  const [mealType, setMealType] = useState('Lunch');
  const [peopleCount, setPeopleCount] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    recommendationTitle: string;
    rationale: string;
    recommendedItems: { itemId: string; quantity: number; reason: string }[];
    totalPrice: number;
  } | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      api.getCanteens().then((res) => {
        setCanteens(res.canteens);
      }).catch(() => {});

      api.getMenu().then((res) => {
        setMenuItems(res.items);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setRecommendation(null);
    setAddedSuccess(false);

    try {
      const res = await api.aiOrderAssistant({
        budget,
        dietaryPreference: dietary,
        mealType,
        peopleCount,
        canteenId,
      });
      setRecommendation(res);
    } catch (e) {
      console.error('Failed to generate recommendation:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!recommendation) return;
    recommendation.recommendedItems.forEach((rec) => {
      const item = menuItems.find((m) => m.id === rec.itemId);
      if (item) {
        addItem(item, currentCanteenName, rec.quantity);
      }
    });
    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">CampusBites AI Dining Assistant</h3>
              <p className="text-xs text-emerald-100">Curate meals tailored to your budget & cravings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form & Recommendations */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800">
          {/* Controls */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            {/* Budget */}
            <div>
              <div className="flex justify-between font-bold mb-1.5 text-slate-900">
                <span>Maximum Budget</span>
                <span className="text-emerald-700 font-extrabold text-sm">₹{budget}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>₹50 (Pocket snack)</span>
                <span>₹250 (Full feast)</span>
                <span>₹500 (Study group)</span>
              </div>
            </div>

            {/* Dietary */}
            <div>
              <label className="font-bold text-slate-900 block mb-1.5">Dietary Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'veg', label: 'Pure Veg 🌱' },
                  { id: 'non-veg', label: 'Non-Veg 🍗' },
                  { id: 'any', label: 'Anything 🍽️' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietary(d.id as any)}
                    className={`py-2 px-2 rounded-xl border text-center font-bold transition-all ${
                      dietary === d.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Type & People */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Occasion / Time</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Breakfast">Breakfast Fuel</option>
                  <option value="Lunch">Wholesome Lunch</option>
                  <option value="Evening Snacks">Evening Tea & Snack</option>
                  <option value="Dinner">Dinner Feast</option>
                  <option value="Midnight Exam Fuel">Midnight Exam Fuel</option>
                  <option value="Post Workout Protein">Post Workout High-Protein</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Students Count</label>
                <select
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1">1 Person (Solo)</option>
                  <option value="2">2 Persons (Roommates)</option>
                  <option value="3">3 Persons</option>
                  <option value="4">4 Persons (Study Group)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Curating with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Find Best Meal Combo</span>
                </>
              )}
            </button>
          </div>

          {/* AI Output Card */}
          {recommendation && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    AI Suggested Combo
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {recommendation.recommendationTitle}
                  </h4>
                </div>
                <span className="text-sm font-extrabold text-emerald-800">
                  ₹{recommendation.totalPrice}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{recommendation.rationale}"
              </p>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                {recommendation.recommendedItems.map((rec) => {
                  const item = menuItems.find((m) => m.id === rec.itemId);
                  if (!item) return null;
                  return (
                    <div
                      key={rec.itemId}
                      className="flex items-center justify-between p-2 bg-white rounded-xl border border-emerald-100 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">
                            {rec.quantity}x {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{rec.reason}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0 ml-2">
                        ₹{item.price * rec.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAddAllToCart}
                disabled={addedSuccess}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Entire Combo to Cart (₹{recommendation.totalPrice})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
