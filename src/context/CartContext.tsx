import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, Address, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CartContextType {
  items: CartItem[];
  canteenId: string | null;
  canteenName: string | null;
  deliveryType: 'now' | 'scheduled';
  scheduledDate: string;
  scheduledTimeSlot: string;
  selectedAddress: Address | null;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  isFreeDelivery: boolean;
  addItem: (
    item: MenuItem,
    canteenName: string,
    quantity?: number,
    customizations?: CartItem['customizations'],
    notes?: string
  ) => boolean;
  updateQuantity: (index: number, newQty: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  setDeliveryType: (type: 'now' | 'scheduled') => void;
  setScheduledDetails: (date: string, slot: string) => void;
  setSelectedAddress: (address: Address | null) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setPaymentMethod: (method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusbites_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [canteenId, setCanteenId] = useState<string | null>(() => {
    return localStorage.getItem('campusbites_cart_canteen_id') || null;
  });

  const [canteenName, setCanteenName] = useState<string | null>(() => {
    return localStorage.getItem('campusbites_cart_canteen_name') || null;
  });

  const [deliveryType, setDeliveryType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-10-29');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>('13:15');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('upi');

  // Persist cart items
  useEffect(() => {
    localStorage.setItem('campusbites_cart_items', JSON.stringify(items));
    if (canteenId) localStorage.setItem('campusbites_cart_canteen_id', canteenId);
    else localStorage.removeItem('campusbites_cart_canteen_id');

    if (canteenName) localStorage.setItem('campusbites_cart_canteen_name', canteenName);
    else localStorage.removeItem('campusbites_cart_canteen_name');
  }, [items, canteenId, canteenName]);

  // Load default address if not set
  useEffect(() => {
    if (!selectedAddress) {
      api.getAddresses().then((res) => {
        if (res.addresses && res.addresses.length > 0) {
          setSelectedAddress(res.addresses[0]);
        }
      }).catch(() => {});
    }
  }, [selectedAddress]);

  const addItem = (
    item: MenuItem,
    canteenTitle: string,
    quantity = 1,
    customizations?: CartItem['customizations'],
    notes?: string
  ): boolean => {
    // Check if adding from different canteen
    if (canteenId && canteenId !== item.canteenId && items.length > 0) {
      const confirmed = window.confirm(
        `Your cart contains items from "${canteenName}". You can only order from one campus canteen at a time. Do you want to reset your cart and add this item from "${canteenTitle}"?`
      );
      if (!confirmed) return false;
      setItems([]);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }

    setCanteenId(item.canteenId);
    setCanteenName(canteenTitle);

    // Calculate item unit price with extras
    let itemPrice = item.price;
    if (customizations?.size && item.customizationOptions?.sizes) {
      const foundSize = item.customizationOptions.sizes.find((s) => s.name === customizations.size);
      if (foundSize) itemPrice += foundSize.price;
    }
    if (customizations?.extras && item.customizationOptions?.extras) {
      customizations.extras.forEach((extraName) => {
        const foundExtra = item.customizationOptions?.extras?.find((e) => e.name === extraName);
        if (foundExtra) itemPrice += foundExtra.price;
      });
    }

    setItems((prev) => {
      // Check if exact same item and customizations already in cart
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.menuItemId === item.id &&
          JSON.stringify(ci.customizations) === JSON.stringify(customizations) &&
          ci.notes === notes
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            isVeg: item.isVeg,
            unitPrice: itemPrice,
            quantity,
            customizations,
            notes,
          },
        ];
      }
    });

    return true;
  };

  const updateQuantity = (index: number, newQty: number) => {
    setItems((prev) => {
      if (newQty <= 0) {
        const next = prev.filter((_, i) => i !== index);
        if (next.length === 0) {
          setCanteenId(null);
          setCanteenName(null);
          setAppliedCoupon(null);
          setCouponDiscount(0);
        }
        return next;
      }
      const copy = [...prev];
      copy[index].quantity = newQty;
      return copy;
    });
  };

  const removeItem = (index: number) => {
    updateQuantity(index, 0);
  };

  const clearCart = () => {
    setItems([]);
    setCanteenId(null);
    setCanteenName(null);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const setScheduledDetails = (date: string, slot: string) => {
    setScheduledDate(date);
    setScheduledTimeSlot(slot);
    setDeliveryType('scheduled');
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Delivery fee calculation
  const freeThreshold = 200;
  const isFreeDelivery = subtotal >= freeThreshold || appliedCoupon?.code === 'FREEDEL';
  const baseFee = 20;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : baseFee;
  const taxes = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.max(0, Math.round((subtotal + deliveryFee + taxes - couponDiscount) * 100) / 100);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        setCouponDiscount(res.discount);
        return { success: true, message: res.message };
      }
      return { success: false, message: 'Invalid coupon' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Coupon could not be applied' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        canteenId,
        canteenName,
        deliveryType,
        scheduledDate,
        scheduledTimeSlot,
        selectedAddress,
        appliedCoupon,
        couponDiscount,
        paymentMethod,
        itemCount,
        subtotal,
        deliveryFee,
        taxes,
        total,
        isFreeDelivery,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setDeliveryType,
        setScheduledDetails,
        setSelectedAddress,
        applyCoupon,
        removeCoupon,
        setPaymentMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
