import React from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  Tag,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  onOpenLocationModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  onOpenLocationModal,
}) => {
  const {
    items,
    canteenName,
    subtotal,
    deliveryFee,
    taxes,
    total,
    couponDiscount,
    appliedCoupon,
    updateQuantity,
    removeItem,
    clearCart,
    deliveryType,
    setDeliveryType,
    scheduledDate,
    scheduledTimeSlot,
    selectedAddress,
    isFreeDelivery,
  } = useCart();

  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Campus Cart</h3>
              <p className="text-[11px] text-slate-500">{canteenName || 'No canteen selected'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Clear Cart
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800">
          {items.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto opacity-30 text-emerald-600" />
              <p className="text-sm font-bold text-slate-700">Your food cart is empty</p>
              <p className="text-xs text-slate-400">Add delicious bites from your college canteen!</p>
            </div>
          ) : (
            <>
              {/* Delivery Zone / Address Banner */}
              <div
                onClick={onOpenLocationModal}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      Deliver to: {selectedAddress?.label || 'Hostel Block'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedAddress ? `${selectedAddress.block}, ${selectedAddress.room}` : 'Select your campus room/block'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-bold">Change</span>
              </div>

              {/* Free delivery milestone tracker */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                {isFreeDelivery ? (
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free Campus Delivery Unlocked! 🎉</span>
                  </p>
                ) : (
                  <div>
                    <div className="flex justify-between font-semibold text-emerald-900 mb-1">
                      <span>Add ₹{200 - subtotal} more for FREE Delivery</span>
                      <span>₹{subtotal} / ₹200</span>
                    </div>
                    <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / 200) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span
                        className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 mt-0.5 ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                          ₹{item.unitPrice}
                        </p>

                        {/* Customization Details */}
                        {item.customizations?.size && (
                          <p className="text-[11px] text-slate-500">
                            Portion: {item.customizations.size}
                          </p>
                        )}
                        {item.customizations?.extras && item.customizations.extras.length > 0 && (
                          <p className="text-[11px] text-slate-500">
                            Extras: {item.customizations.extras.join(', ')}
                          </p>
                        )}
                        {item.customizations?.spiceLevel && (
                          <p className="text-[11px] text-orange-600">
                            Spice: {item.customizations.spiceLevel}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Note: "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 shrink-0">
                      <button
                        onClick={() => updateQuantity(idx, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </button>
                      <span className="w-4 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Campus Delivery</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST & Canteen Packaging</span>
                  <span className="font-semibold text-slate-900">₹{taxes}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>To Pay</span>
                  <span className="text-emerald-700 text-base">₹{total}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <div>
              <p className="text-[10px] text-slate-500 font-medium">Grand Total</p>
              <p className="text-base font-black text-slate-900">₹{total}</p>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="flex-1 max-w-[260px] bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
