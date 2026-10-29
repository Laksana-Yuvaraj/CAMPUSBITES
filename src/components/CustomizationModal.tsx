import React, { useState } from 'react';
import { X, Plus, Minus, Flame, Check } from 'lucide-react';
import { MenuItem, CartItem } from '../types/index.ts';

interface CustomizationModalProps {
  item: MenuItem;
  canteenName: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    canteenName: string,
    quantity: number,
    customizations: CartItem['customizations'],
    notes?: string
  ) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  canteenName,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(
    item.customizationOptions?.sizes?.[0]?.name || ''
  );
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedSpice, setSelectedSpice] = useState<string>(
    item.customizationOptions?.spiceLevels?.[0] || ''
  );
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Calculate unit price with size and extras
  let currentUnitPrice = item.price;
  if (selectedSize && item.customizationOptions?.sizes) {
    const s = item.customizationOptions.sizes.find((size) => size.name === selectedSize);
    if (s) currentUnitPrice += s.price;
  }
  if (selectedExtras.length > 0 && item.customizationOptions?.extras) {
    selectedExtras.forEach((extraName) => {
      const e = item.customizationOptions?.extras?.find((ex) => ex.name === extraName);
      if (e) currentUnitPrice += e.price;
    });
  }

  const handleToggleExtra = (extraName: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraName) ? prev.filter((e) => e !== extraName) : [...prev, extraName]
    );
  };

  const handleToggleRemoved = (ingName: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingName) ? prev.filter((i) => i !== ingName) : [...prev, ingName]
    );
  };

  const handleConfirm = () => {
    onAddToCart(
      item,
      canteenName,
      quantity,
      {
        size: selectedSize || undefined,
        extras: selectedExtras.length > 0 ? selectedExtras : undefined,
        spiceLevel: selectedSpice || undefined,
        removed: removedIngredients.length > 0 ? removedIngredients : undefined,
      },
      notes.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="relative h-44 bg-slate-100 overflow-hidden shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-slate-900/60 text-white rounded-full hover:bg-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-4 h-4 rounded-xs border flex items-center justify-center ${
                  item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                {item.category}
              </span>
              <span className="text-xs text-slate-200">🔥 {item.calories} kcal</span>
            </div>
            <h3 className="text-lg font-bold leading-tight truncate">{item.name}</h3>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-5 overflow-y-auto space-y-5 divide-y divide-slate-100">
          {/* Size Choice */}
          {item.customizationOptions?.sizes && item.customizationOptions.sizes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Choose Portion / Size
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {item.customizationOptions.sizes.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSize(s.name)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedSize === s.name
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="font-bold text-slate-900">
                      {s.price === 0 ? 'Standard' : `+₹${s.price}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spice Level */}
          {item.customizationOptions?.spiceLevels && item.customizationOptions.spiceLevels.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Spice Preference</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.customizationOptions.spiceLevels.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedSpice(lvl)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      selectedSpice === lvl
                        ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-on Extras */}
          {item.customizationOptions?.extras && item.customizationOptions.extras.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Add-on Extras & Combos
              </h4>
              <div className="space-y-2">
                {item.customizationOptions.extras.map((extra) => {
                  const isChecked = selectedExtras.includes(extra.name);
                  return (
                    <button
                      key={extra.name}
                      type="button"
                      onClick={() => handleToggleExtra(extra.name)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-medium">{extra.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">+₹{extra.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Removable Ingredients */}
          {item.customizationOptions?.removableIngredients &&
            item.customizationOptions.removableIngredients.length > 0 && (
              <div className="pt-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Dietary Exclusions / Customize Recipe
                </h4>
                <div className="flex flex-wrap gap-2">
                  {item.customizationOptions.removableIngredients.map((ing) => {
                    const isRemoved = removedIngredients.includes(ing);
                    return (
                      <button
                        key={ing}
                        type="button"
                        onClick={() => handleToggleRemoved(ing)}
                        className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                          isRemoved
                            ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold line-through'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {ing}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Item Special Instructions / Notes */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Kitchen Notes for Canteen
            </h4>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Make it extra crisp, keep chutney on the side..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              maxLength={120}
            />
          </div>
        </div>

        {/* Footer with Quantity Stepper & Add to Cart button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold text-slate-900">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(item.stock, q + 1))}
              disabled={quantity >= item.stock}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-2xl text-sm font-bold flex items-center justify-between shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
          >
            <span>Add to Cart</span>
            <span>₹{currentUnitPrice * quantity}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
