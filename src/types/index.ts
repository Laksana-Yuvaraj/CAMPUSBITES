export type UserRole = 'student' | 'canteen' | 'agent' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  collegeId: string;
  profilePhoto?: string;
  walletBalance: number;
  hostelOrDept?: string;
  room?: string;
  createdAt: string;
  canteenId?: string; // If role is 'canteen', bound to specific canteen
  agentDetails?: {
    vehicleType: 'bicycle' | 'e-scooter' | 'walking';
    isAvailable: boolean;
    currentCampusLocation: string;
  };
}

export type FoodCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Snacks'
  | 'Beverages'
  | 'Combos'
  | 'Healthy'
  | 'Desserts';

export interface MenuItemCustomization {
  sizes?: { name: string; price: number }[];
  extras?: { name: string; price: number }[];
  spiceLevels?: string[];
  removableIngredients?: string[];
}

export interface MenuItem {
  id: string;
  canteenId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: FoodCategory;
  isVeg: boolean;
  spiceLevel: 0 | 1 | 2 | 3; // 0=none, 1=mild, 2=medium, 3=hot
  calories: number;
  stock: number;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  customizationOptions?: MenuItemCustomization;
  popular?: boolean;
}

export interface Canteen {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  openingTime: string; // "07:30"
  closingTime: string; // "22:30"
  isOpen: boolean;
  rating: number;
  ratingCount: number;
  minimumOrderValue: number;
  avgPrepTimeMinutes: number;
  deliveryZones: string[];
  rushCapacityPercent: number; // 0 - 100%
  holidayNotice?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // e.g., "My Hostel Room", "Computer Lab 3"
  block: string; // e.g. "Aryabhatta Hostel Block B", "Ramanujan Academic Block"
  room?: string; // e.g. "Room 304"
  landmark?: string;
  locationType: 'Hostel' | 'Academic' | 'Library' | 'Sports' | 'Department' | 'Custom';
}

export interface CartItem {
  menuItemId: string;
  name: string;
  isVeg: boolean;
  unitPrice: number;
  quantity: number;
  customizations?: {
    size?: string;
    extras?: string[];
    spiceLevel?: string;
    removed?: string[];
  };
  notes?: string;
}

export interface Cart {
  canteenId: string | null;
  items: CartItem[];
  couponCode?: string;
  deliveryType: 'now' | 'scheduled';
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  deliveryAddressId?: string;
}

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'agent_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  canteenId: string;
  canteenName: string;
  items: CartItem[];
  status: OrderStatus;
  orderType: 'now' | 'scheduled';
  scheduledFor?: string; // e.g. "2026-10-29 13:15"
  deliveryAddress: {
    label: string;
    block: string;
    room?: string;
    landmark?: string;
    locationType: string;
  };
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  paymentStatus: 'completed' | 'pending' | 'refunded' | 'failed';
  transactionId: string;
  placedAt: string;
  acceptedAt?: string;
  readyAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  estimatedDeliveryMinutes: number;
  deliveryOtp: string;
  cancelReason?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentPhone?: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    title: string;
    description: string;
  }[];
}

export interface DeliveryTask {
  id: string;
  orderId: string;
  canteenId: string;
  canteenName: string;
  canteenLocation: string;
  dropBlock: string;
  dropRoom?: string;
  dropLandmark?: string;
  itemCount: number;
  itemsSummary: string;
  payout: number;
  distanceMeters: number;
  scheduledDeliveryTime?: string;
  agentId?: string;
  agentName?: string;
  agentPhone?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  status: 'available' | 'accepted' | 'picked_up' | 'delivered';
  customerName: string;
  customerPhone: string;
  deliveryOtp: string;
  proofOfDelivery?: {
    otpVerified: boolean;
    photoUrl?: string;
    timestamp: string;
  };
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  value: number; // e.g. 20 for 20% or 50 for ₹50
  minOrder: number;
  maxDiscount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'delivery' | 'canteen' | 'system';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  canteenId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  tags?: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  orderId?: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  aiDraftResponse?: string;
  resolutionNote?: string;
  createdAt: string;
}

export interface CampusDeliveryZone {
  id: string;
  name: string;
  distanceMeters: number;
  baseFee: number;
  freeDeliveryThreshold: number;
}
