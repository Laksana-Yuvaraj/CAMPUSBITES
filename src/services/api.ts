import {
  User,
  Canteen,
  MenuItem,
  Order,
  DeliveryTask,
  Coupon,
  Address,
  Notification,
  SupportTicket,
  CampusDeliveryZone,
} from '../types/index.ts';

const API_BASE = '/api';

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('campusbites_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}`, 'x-user-id': token } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    collegeId: string;
    hostelOrDept?: string;
    room?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDemoUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return handleResponse(res);
  },

  // Canteens
  async getCanteens(): Promise<{ canteens: Canteen[] }> {
    const res = await fetch(`${API_BASE}/canteens`);
    return handleResponse(res);
  },

  async getCanteen(id: string): Promise<{ canteen: Canteen }> {
    const res = await fetch(`${API_BASE}/canteens/${id}`);
    return handleResponse(res);
  },

  async updateCanteen(id: string, updates: Partial<Canteen>): Promise<{ canteen: Canteen }> {
    const res = await fetch(`${API_BASE}/canteens/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async getCanteenReviewSummary(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/canteens/${id}/reviews/ai-summary`);
    return handleResponse(res);
  },

  // Menu
  async getMenu(params?: { canteenId?: string; category?: string; search?: string }): Promise<{ items: MenuItem[] }> {
    const query = new URLSearchParams();
    if (params?.canteenId) query.append('canteenId', params.canteenId);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/menu?${query.toString()}`);
    return handleResponse(res);
  },

  async createMenuItem(item: Partial<MenuItem>): Promise<{ item: MenuItem }> {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<{ item: MenuItem }> {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async deleteMenuItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Orders
  async getOrders(params?: { canteenId?: string; status?: string }): Promise<{ orders: Order[] }> {
    const query = new URLSearchParams();
    if (params?.canteenId) query.append('canteenId', params.canteenId);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/orders?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getOrder(id: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async placeOrder(orderData: any): Promise<{ order: Order; deliveryOtp: string }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note }),
    });
    return handleResponse(res);
  },

  async cancelOrder(id: string, reason?: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  async rateOrder(id: string, rating: number, comment: string, tags?: string[]): Promise<any> {
    const res = await fetch(`${API_BASE}/orders/${id}/rate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment, tags }),
    });
    return handleResponse(res);
  },

  // Deliveries
  async getDeliveries(): Promise<{ tasks: DeliveryTask[] }> {
    const res = await fetch(`${API_BASE}/deliveries`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async acceptDelivery(id: string): Promise<{ task: DeliveryTask }> {
    const res = await fetch(`${API_BASE}/deliveries/${id}/accept`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async pickupDelivery(id: string): Promise<{ task: DeliveryTask }> {
    const res = await fetch(`${API_BASE}/deliveries/${id}/pickup`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async completeDelivery(id: string, otp: string, photoUrl?: string): Promise<{ task: DeliveryTask }> {
    const res = await fetch(`${API_BASE}/deliveries/${id}/deliver`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ otp, photoUrl }),
    });
    return handleResponse(res);
  },

  // Coupons
  async getCoupons(): Promise<{ coupons: Coupon[] }> {
    const res = await fetch(`${API_BASE}/coupons`);
    return handleResponse(res);
  },

  async validateCoupon(code: string, subtotal: number): Promise<any> {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, subtotal }),
    });
    return handleResponse(res);
  },

  // Addresses
  async getAddresses(): Promise<{ addresses: Address[] }> {
    const res = await fetch(`${API_BASE}/addresses`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async addAddress(data: Partial<Address>): Promise<{ address: Address }> {
    const res = await fetch(`${API_BASE}/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteAddress(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/addresses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Campus Zones
  async getCampusZones(): Promise<{ zones: CampusDeliveryZone[] }> {
    const res = await fetch(`${API_BASE}/campus-zones`);
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Support Tickets
  async getSupportTickets(): Promise<{ tickets: SupportTicket[] }> {
    const res = await fetch(`${API_BASE}/support/tickets`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createSupportTicket(data: Partial<SupportTicket>): Promise<{ ticket: SupportTicket }> {
    const res = await fetch(`${API_BASE}/support/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<{ ticket: SupportTicket }> {
    const res = await fetch(`${API_BASE}/support/tickets/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Gemini AI features
  async aiFoodSearch(query: string, canteenId?: string): Promise<{
    matchingItemIds: string[];
    explanation: string;
    suggestedTags: string[];
  }> {
    const res = await fetch(`${API_BASE}/ai/food-search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, canteenId }),
    });
    return handleResponse(res);
  },

  async aiOrderAssistant(data: {
    budget: number;
    dietaryPreference: string;
    mealType: string;
    peopleCount: number;
    canteenId?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/order-assistant`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async aiDeliverySlotSuggestion(data: {
    canteenId: string;
    orderPrepTime: number;
    itemCount: number;
    targetDate: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/delivery-slot-suggestion`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async aiSupportAssistant(message: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/support-assistant`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async adminAssignAgent(orderId: string, agentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/assign-agent`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, agentId }),
    });
    return handleResponse(res);
  },

  async adminRefund(orderId: string, amount: number, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/refund`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, amount, reason }),
    });
    return handleResponse(res);
  },

  async adminResetDemoData(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reset-demo-data`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
