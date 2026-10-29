import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  CreditCard,
  QrCode,
  Wallet,
  Banknote,
  Building,
  CheckCircle2,
  AlertCircle,
  Plus,
  Tag,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Address, Order } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderPlaced }) => {
  const {
    items,
    canteenId,
    canteenName,
    subtotal,
    deliveryFee,
    taxes,
    total,
    couponDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    deliveryType,
    setDeliveryType,
    scheduledDate,
    scheduledTimeSlot,
    setScheduledDetails,
    paymentMethod,
    setPaymentMethod,
    clearCart,
  } = useCart();

  const { user, refreshUser } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Slot suggestion state
  const [isAiSlotLoading, setIsAiSlotLoading] = useState(false);
  const [aiSlotRecommendation, setAiSlotRecommendation] = useState<{
    recommendedSlot: string;
    reason: string;
  } | null>(null);

  // New address modal toggle inside checkout
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Hostel Room');
  const [newBlock, setNewBlock] = useState('Aryabhatta Hostel Block B');
  const [newRoom, setNewRoom] = useState('Room 304');
  const [newLandmark, setNewLandmark] = useState('');
  const [newLocationType, setNewLocationType] = useState<'Hostel' | 'Academic' | 'Library' | 'Sports'>('Hostel');

  // UPI payment simulation
  const [simulatedUpiApproved, setSimulatedUpiApproved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getAddresses().then((res) => {
        setAddresses(res.addresses);
        if (res.addresses.length > 0) {
          setSelectedAddressId(res.addresses[0].id);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput.trim();
    if (!code) return;
    setCouponError('');
    setCouponSuccess('');
    const res = await applyCoupon(code);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleSmartSlotSuggestion = async () => {
    if (!canteenId) return;
    setIsAiSlotLoading(true);
    try {
      const res = await api.aiDeliverySlotSuggestion({
        canteenId,
        orderPrepTime: 15,
        itemCount: items.length,
        targetDate: scheduledDate,
      });
      if (res.recommendedSlot) {
        setAiSlotRecommendation({
          recommendedSlot: res.recommendedSlot,
          reason: res.reason,
        });
        setScheduledDetails(scheduledDate, res.recommendedSlot);
      }
    } catch (e) {
      console.warn('Smart slot suggestion failed:', e);
    } finally {
      setIsAiSlotLoading(false);
    }
  };

  const handleSaveNewAddress = async () => {
    if (!newBlock) return;
    try {
      const res = await api.addAddress({
        label: newLabel,
        block: newBlock,
        room: newRoom,
        landmark: newLandmark,
        locationType: newLocationType,
      });
      setAddresses((prev) => [...prev, res.address]);
      setSelectedAddressId(res.address.id);
      setShowAddAddress(false);
    } catch (e: any) {
      setError(e.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!canteenId || items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId) || {
      label: 'Campus Drop',
      block: 'Aryabhatta Hostel Block B',
      room: 'Room 304',
      landmark: 'Near Staircase 2',
      locationType: 'Hostel',
    };

    if (paymentMethod === 'wallet' && user && user.walletBalance < total) {
      setError(`Insufficient campus wallet balance (₹${user.walletBalance}). Total is ₹${total}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.placeOrder({
        canteenId,
        items,
        orderType: deliveryType,
        scheduledFor: deliveryType === 'scheduled' ? `${scheduledDate} ${scheduledTimeSlot}` : undefined,
        deliveryAddress: selectedAddr,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      await refreshUser();
      onClose();
      onOrderPlaced(res.order);
    } catch (e: any) {
      setError(e.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">Checkout & Payment</h3>
            <p className="text-xs text-slate-500">{canteenName} • {items.length} item(s)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Delivery Timing Mode: Now vs Scheduled */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Delivery Timing
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('now')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  deliveryType === 'now'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Deliver Now (~18 mins)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('scheduled')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  deliveryType === 'scheduled'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Delivery</span>
              </button>
            </div>

            {/* Scheduled details view */}
            {deliveryType === 'scheduled' && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Select Date & 15-min Slot</span>
                  <button
                    type="button"
                    onClick={handleSmartSlotSuggestion}
                    disabled={isAiSlotLoading}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{isAiSlotLoading ? 'Analyzing load...' : 'AI Best Slot'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={scheduledDate}
                    onChange={(e) => setScheduledDetails(e.target.value, scheduledTimeSlot)}
                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="2026-10-29">Today, Oct 29</option>
                    <option value="2026-10-30">Tomorrow, Oct 30</option>
                    <option value="2026-10-31">Saturday, Oct 31</option>
                  </select>

                  <select
                    value={scheduledTimeSlot}
                    onChange={(e) => setScheduledDetails(scheduledDate, e.target.value)}
                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="12:30">12:30 PM (Lunch Start)</option>
                    <option value="13:00">01:00 PM (Peak Break)</option>
                    <option value="13:15">01:15 PM (AI Recommended)</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="16:00">04:00 PM (Evening Snacks)</option>
                    <option value="18:30">06:30 PM</option>
                    <option value="20:30">08:30 PM (Dinner)</option>
                    <option value="23:30">11:30 PM (Night Owl Slot)</option>
                  </select>
                </div>

                {aiSlotRecommendation && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Slot Recommended: {aiSlotRecommendation.recommendedSlot}</p>
                      <p className="text-emerald-700">{aiSlotRecommendation.reason}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Campus Delivery Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Campus Drop Location
              </label>
              <button
                type="button"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room / Block</span>
              </button>
            </div>

            {showAddAddress ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Add New Campus Address</span>
                  <button onClick={() => setShowAddAddress(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Label (e.g. My Hostel)"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Aryabhatta Hostel Block A">Aryabhatta Hostel Block A</option>
                    <option value="Aryabhatta Hostel Block B">Aryabhatta Hostel Block B</option>
                    <option value="Kalpana Chawla Girls Hostel">Kalpana Chawla Girls Hostel</option>
                    <option value="Central Library & Reading Pavilions">Central Library</option>
                    <option value="Ramanujan Academic Block">Ramanujan Academic Block</option>
                    <option value="Science & Technology Lab Complex">Science & Tech Complex</option>
                    <option value="Sports Arena & Gymnasium">Sports Arena</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Room/Cubicle (e.g. Room 304)"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    placeholder="Landmark (e.g. Near Staircase)"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveNewAddress}
                  className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Save Campus Location
                </button>
              </div>
            ) : null}

            <div className="space-y-2">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{addr.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-medium">
                          {addr.locationType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 truncate">{addr.block}</p>
                      {addr.room && <p className="text-[11px] text-slate-500">{addr.room} • {addr.landmark}</p>}
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Campus Coupon Code */}
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
              Campus Vouchers & Coupons
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. CAMPUS50)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Apply
              </button>
            </div>

            {couponSuccess && (
              <p className="text-xs font-medium text-emerald-700 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{couponSuccess}</span>
              </p>
            )}
            {couponError && (
              <p className="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{couponError}</span>
              </p>
            )}

            {appliedCoupon ? (
              <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800">Applied: {appliedCoupon.code} (-₹{couponDiscount})</span>
                <button onClick={removeCoupon} className="text-rose-600 hover:underline font-semibold text-[11px]">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['CAMPUS50', 'FRESHER20', 'FREEDEL', 'EXAMFUEL'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleApplyCoupon(c)}
                    className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                  >
                    🏷️ {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Payment Gateway Selection (Sandbox Mode) */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Payment Option
              </label>
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                🧪 Test Sandbox Gateway
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">UPI Instant</p>
                  <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</p>
                </div>
              </button>

              {/* Campus Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Campus Wallet</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    Bal: ₹{user?.walletBalance ?? 0}
                  </p>
                </div>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Debit / Card</p>
                  <p className="text-[10px] text-slate-500">Visa, Mastercard, RuPay</p>
                </div>
              </button>

              {/* Cash On Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Cash on Drop</p>
                  <p className="text-[10px] text-slate-500">Pay runner in cash</p>
                </div>
              </button>
            </div>

            {/* UPI QR Mock Box */}
            {paymentMethod === 'upi' && (
              <div className="mt-3 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=campusbites@okaxis%26pn=CampusBites%26am=${total}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400">Scan & Pay ₹{total}</p>
                    <p className="text-[10px] text-slate-400 font-mono">campusbites@okaxis</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Auto-verifies upon placement</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-lg font-semibold shrink-0">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* 5. Bill Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Item Total</span>
              <span className="font-semibold text-slate-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Campus Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-emerald-700">FREE</span>
              ) : (
                <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes & Canteen Packing (5% GST)</span>
              <span className="font-semibold text-slate-900">₹{taxes}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Voucher Discount</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Grand Total</span>
              <span className="text-emerald-700 text-base">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-[11px] text-slate-500">Total Payable</p>
            <p className="text-lg font-extrabold text-slate-900">₹{total}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="flex-1 max-w-[260px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 px-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
          >
            {loading ? (
              <span>Confirming with Canteen...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Place Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
