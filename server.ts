import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db } from './server/db.ts';
import {
  aiFoodSearch,
  aiOrderAssistant,
  aiDeliverySlotSuggestion,
  aiSupportAssistant,
  aiReviewSummary,
} from './server/gemini.ts';
import { Order, OrderStatus, DeliveryTask, User } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Simple Auth Middleware / Context Extractor
// In this full-featured campus app, users pass their User ID in Authorization header or x-user-id header
app.use((req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'] as string;
  let userId = userIdHeader;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7);
  }

  if (userId) {
    const user = db.getUserById(userId);
    if (user) {
      (req as any).currentUser = user;
    }
  }
  next();
});

// Helper for role protection
const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).currentUser as User | undefined;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ error: `Forbidden. Role '${user.role}' not permitted.` });
      return;
    }
    next();
  };
};

/* -------------------------------------------------------------
   AUTH ENDPOINTS
------------------------------------------------------------- */
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'No account found with this email. Please register.' });
    return;
  }
  res.json({ user, token: user.id });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, role, collegeId, hostelOrDept, room } = req.body;

  if (!name || !email || !role || !collegeId) {
    res.status(400).json({ error: 'Name, email, college ID, and role are required' });
    return;
  }

  // Validate student college email domain rule
  if (role === 'student') {
    const isCollegeEmail = email.toLowerCase().endsWith('.edu.in') || email.toLowerCase().endsWith('@examplecollege.edu.in');
    if (!isCollegeEmail) {
      res.status(400).json({
        error: 'Students must register using a valid college email domain (e.g., student@examplecollege.edu.in)',
      });
      return;
    }
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists' });
    return;
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone: phone || '+91 98000 00000',
    role,
    collegeId,
    profilePhoto: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    walletBalance: 200, // Welcome ₹200 campus wallet balance!
    hostelOrDept: hostelOrDept || 'Campus Resident',
    room: room || 'Room 101',
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);

  // Send welcome notification
  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: newUser.id,
    title: 'Welcome to CampusBites!',
    message: 'Your account is active. We credited ₹200 to your Campus Wallet to get you started!',
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ user: newUser, token: newUser.id });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).currentUser;
  if (!user) {
    res.status(401).json({ error: 'Not logged in' });
    return;
  }
  res.json({ user });
});

app.get('/api/auth/demo-users', (_req: Request, res: Response) => {
  res.json({ users: db.getUsers() });
});

/* -------------------------------------------------------------
   CANTEEN ENDPOINTS
------------------------------------------------------------- */
app.get('/api/canteens', (_req: Request, res: Response) => {
  res.json({ canteens: db.getCanteens() });
});

app.get('/api/canteens/:id', (req: Request, res: Response) => {
  const canteen = db.getCanteenById(req.params.id);
  if (!canteen) {
    res.status(404).json({ error: 'Canteen not found' });
    return;
  }
  res.json({ canteen });
});

app.patch('/api/canteens/:id', requireRole(['canteen', 'admin']), (req: Request, res: Response) => {
  const updated = db.updateCanteen(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Canteen not found' });
    return;
  }
  res.json({ canteen: updated });
});

app.get('/api/canteens/:id/reviews/ai-summary', async (req: Request, res: Response) => {
  const canteen = db.getCanteenById(req.params.id);
  if (!canteen) {
    res.status(404).json({ error: 'Canteen not found' });
    return;
  }
  const reviews = db.getReviews(canteen.id);
  const summary = await aiReviewSummary(canteen, reviews);
  res.json({ summary, reviews });
});

/* -------------------------------------------------------------
   MENU ENDPOINTS
------------------------------------------------------------- */
app.get('/api/menu', (req: Request, res: Response) => {
  const { canteenId, category, search } = req.query;
  let items = db.getMenuItems(canteenId as string | undefined);

  if (category && category !== 'All') {
    items = items.filter((i) => i.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const s = (search as string).toLowerCase();
    items = items.filter((i) => i.name.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
  }

  res.json({ items });
});

app.post('/api/menu', requireRole(['canteen', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).currentUser as User;
  const canteenId = user.canteenId || req.body.canteenId;

  if (!canteenId) {
    res.status(400).json({ error: 'Canteen ID is required' });
    return;
  }

  const newItem = {
    ...req.body,
    id: `item-${Date.now()}`,
    canteenId,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : 50,
    isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
  };

  const created = db.createMenuItem(newItem);
  res.status(201).json({ item: created });
});

app.patch('/api/menu/:id', requireRole(['canteen', 'admin']), (req: Request, res: Response) => {
  const updated = db.updateMenuItem(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  res.json({ item: updated });
});

app.delete('/api/menu/:id', requireRole(['canteen', 'admin']), (req: Request, res: Response) => {
  const success = db.deleteMenuItem(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  res.json({ success: true });
});

/* -------------------------------------------------------------
   ORDER ENDPOINTS
------------------------------------------------------------- */
app.get('/api/orders', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  const { canteenId, status } = req.query;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let orders = db.getOrders({
    userId: user.role === 'student' ? user.id : undefined,
    canteenId: user.role === 'canteen' ? user.canteenId : (canteenId as string | undefined),
    status: status as string | undefined,
  });

  res.json({ orders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ order });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Login required to place order' });
    return;
  }

  const {
    canteenId,
    items,
    orderType,
    scheduledFor,
    deliveryAddress,
    paymentMethod,
    couponCode,
  } = req.body;

  if (!canteenId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Canteen and items are required' });
    return;
  }

  const canteen = db.getCanteenById(canteenId);
  if (!canteen) {
    res.status(404).json({ error: 'Canteen not found' });
    return;
  }

  // Business Rule: Students can order only from canteens that are currently open,
  // except for future scheduled orders within operating hours.
  if (orderType !== 'scheduled' && !canteen.isOpen) {
    res.status(400).json({
      error: `${canteen.name} is currently closed. Operating hours: ${canteen.openingTime} - ${canteen.closingTime}. You can schedule an order for later.`,
    });
    return;
  }

  // Business Rule: Check stock of items and prevent ordering out-of-stock items
  let subtotal = 0;
  let estimatedPrepMinutes = canteen.avgPrepTimeMinutes || 15;

  for (const item of items) {
    const menuItem = db.getMenuItemById(item.menuItemId);
    if (!menuItem) {
      res.status(400).json({ error: `Menu item ${item.name || item.menuItemId} is not recognized` });
      return;
    }
    if (!menuItem.isAvailable || menuItem.stock <= 0) {
      res.status(400).json({ error: `Sorry, "${menuItem.name}" is currently sold out!` });
      return;
    }
    if (menuItem.stock < item.quantity) {
      res.status(400).json({ error: `Only ${menuItem.stock} portions of "${menuItem.name}" remain in stock` });
      return;
    }
    subtotal += item.unitPrice * item.quantity;
    if (menuItem.preparationTime > estimatedPrepMinutes) {
      estimatedPrepMinutes = menuItem.preparationTime;
    }
  }

  // Check minimum order value
  if (subtotal < canteen.minimumOrderValue) {
    res.status(400).json({
      error: `Minimum order value for ${canteen.name} is ₹${canteen.minimumOrderValue}. Current subtotal is ₹${subtotal}.`,
    });
    return;
  }

  // Delivery fee calculation based on campus zone
  const zones = db.getCampusZones();
  const matchedZone = zones.find((z) => deliveryAddress?.block?.includes(z.name)) || zones[0];
  const baseDeliveryFee = matchedZone ? matchedZone.baseFee : 15;
  const isFreeDelivery = subtotal >= (matchedZone ? matchedZone.freeDeliveryThreshold : 200);
  let deliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;

  // Coupon validation
  let discount = 0;
  if (couponCode) {
    const coupon = db.getCouponByCode(couponCode);
    if (coupon && subtotal >= coupon.minOrder) {
      if (coupon.code === 'FREEDEL') {
        deliveryFee = 0;
        discount = baseDeliveryFee;
      } else if (coupon.discountType === 'percentage') {
        discount = Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount);
      } else {
        discount = Math.min(coupon.value, coupon.maxDiscount);
      }
      coupon.usedCount += 1;
    }
  }

  const taxes = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const total = Math.max(0, Math.round((subtotal + deliveryFee + taxes - discount) * 100) / 100);

  // If paid via campus wallet, verify and deduct balance
  if (paymentMethod === 'wallet') {
    if (user.walletBalance < total) {
      res.status(400).json({
        error: `Insufficient campus wallet balance (₹${user.walletBalance}). Please choose UPI or top-up your wallet.`,
      });
      return;
    }
    db.updateUser(user.id, { walletBalance: Math.round((user.walletBalance - total) * 100) / 100 });
  }

  // Deduct inventory
  for (const item of items) {
    const menuItem = db.getMenuItemById(item.menuItemId);
    if (menuItem) {
      db.updateMenuItem(menuItem.id, {
        stock: Math.max(0, menuItem.stock - item.quantity),
      });
    }
  }

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const newOrder: Order = {
    id: orderId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    canteenId: canteen.id,
    canteenName: canteen.name,
    items,
    status: 'placed',
    orderType: orderType || 'now',
    scheduledFor: orderType === 'scheduled' ? scheduledFor : undefined,
    deliveryAddress: {
      label: deliveryAddress?.label || 'Campus Location',
      block: deliveryAddress?.block || 'Aryabhatta Hostel Block A',
      room: deliveryAddress?.room || '',
      landmark: deliveryAddress?.landmark || '',
      locationType: deliveryAddress?.locationType || 'Hostel',
    },
    subtotal,
    deliveryFee,
    taxes,
    discount,
    total,
    paymentMethod: paymentMethod || 'upi',
    paymentStatus: 'completed',
    transactionId: `TXN-${Date.now()}`,
    placedAt: new Date().toISOString(),
    estimatedDeliveryMinutes: estimatedPrepMinutes + 12,
    deliveryOtp,
    timeline: [
      {
        status: 'placed',
        timestamp: new Date().toISOString(),
        title: orderType === 'scheduled' ? 'Scheduled Order Received' : 'Order Placed',
        description: `Order ${orderId} received and verified via ${paymentMethod.toUpperCase()}. Sent to ${canteen.name}.`,
      },
    ],
  };

  db.createOrder(newOrder);

  // Auto create delivery task for campus runner fleet
  const task: DeliveryTask = {
    id: `task-${Date.now()}`,
    orderId: newOrder.id,
    canteenId: canteen.id,
    canteenName: canteen.name,
    canteenLocation: canteen.location,
    dropBlock: newOrder.deliveryAddress.block,
    dropRoom: newOrder.deliveryAddress.room,
    dropLandmark: newOrder.deliveryAddress.landmark,
    itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
    itemsSummary: items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
    payout: 25 + Math.floor(Math.random() * 15),
    distanceMeters: matchedZone.distanceMeters || 500,
    scheduledDeliveryTime: orderType === 'scheduled' ? scheduledFor : undefined,
    status: 'available',
    customerName: user.name,
    customerPhone: user.phone,
    deliveryOtp,
  };
  db.createDeliveryTask(task);

  // Notification for student
  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'Order Placed Successfully!',
    message: `Your order ${orderId} has been sent to ${canteen.name}. Estimated prep time: ${estimatedPrepMinutes} mins.`,
    type: 'order',
    orderId,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ order: newOrder, deliveryOtp });
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  const order = db.getOrderById(req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const validStatuses: OrderStatus[] = [
    'placed',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'agent_assigned',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status' });
    return;
  }

  const now = new Date().toISOString();
  const updates: Partial<Order> = { status };

  if (status === 'accepted') updates.acceptedAt = now;
  if (status === 'ready_for_pickup') updates.readyAt = now;
  if (status === 'out_for_delivery') updates.outForDeliveryAt = now;
  if (status === 'delivered') updates.deliveredAt = now;

  const statusTitles: Record<OrderStatus, string> = {
    placed: 'Order Placed',
    accepted: 'Accepted by Canteen',
    preparing: 'Kitchen Preparing Your Meal',
    ready_for_pickup: 'Packed & Ready for Pickup',
    agent_assigned: 'Delivery Agent Assigned',
    out_for_delivery: 'Out for Campus Delivery',
    delivered: 'Order Delivered',
    cancelled: 'Order Cancelled',
  };

  const newTimelineItem = {
    status,
    timestamp: now,
    title: statusTitles[status as OrderStatus] || 'Order Status Update',
    description: note || `Order transitioned to ${status.replace(/_/g, ' ')}.`,
  };

  updates.timeline = [...order.timeline, newTimelineItem];
  const updatedOrder = db.updateOrder(order.id, updates);

  // Update linked delivery task if exists
  const task = db.getDeliveryTaskByOrderId(order.id);
  if (task) {
    if (status === 'ready_for_pickup' && task.status === 'available') {
      // ready for fleet
    } else if (status === 'out_for_delivery') {
      db.updateDeliveryTask(task.id, { status: 'picked_up', pickedUpAt: now });
    } else if (status === 'delivered') {
      db.updateDeliveryTask(task.id, {
        status: 'delivered',
        deliveredAt: now,
        proofOfDelivery: { otpVerified: true, timestamp: now },
      });
    }
  }

  // Notify student
  const titleText = statusTitles[status as OrderStatus] || 'Order Status Update';
  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: order.userId,
    title: titleText,
    message: note || `Order ${order.id}: ${titleText}`,
    type: 'order',
    orderId: order.id,
    isRead: false,
    createdAt: now,
  });

  res.json({ order: updatedOrder });
});

// Cancel order endpoint with Business Rule:
// "Prevent order cancellation after the canteen starts preparation."
app.post('/api/orders/:id/cancel', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  const order = db.getOrderById(req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Authorization: Only customer or admin can cancel
  if (user && user.role === 'student' && order.userId !== user.id) {
    res.status(403).json({ error: 'Cannot cancel another student’s order' });
    return;
  }

  // Business Rule check
  if (['preparing', 'ready_for_pickup', 'agent_assigned', 'out_for_delivery', 'delivered'].includes(order.status)) {
    res.status(400).json({
      error: `Cancellation not allowed! The canteen has already begun preparing this order. Contact college support if there is an issue.`,
    });
    return;
  }

  const reason = req.body.reason || 'Cancelled by customer before preparation';
  const now = new Date().toISOString();

  // Refund if wallet
  if (order.paymentMethod === 'wallet' && order.paymentStatus === 'completed') {
    const student = db.getUserById(order.userId);
    if (student) {
      db.updateUser(student.id, {
        walletBalance: Math.round((student.walletBalance + order.total) * 100) / 100,
      });
    }
  }

  const updatedOrder = db.updateOrder(order.id, {
    status: 'cancelled',
    paymentStatus: 'refunded',
    cancelReason: reason,
    timeline: [
      ...order.timeline,
      {
        status: 'cancelled',
        timestamp: now,
        title: 'Order Cancelled',
        description: `Order cancelled. Reason: ${reason}. Refund initiated to original payment source.`,
      },
    ],
  });

  // Cancel delivery task
  const task = db.getDeliveryTaskByOrderId(order.id);
  if (task) {
    db.updateDeliveryTask(task.id, { status: 'delivered' }); // close task
  }

  // Restore inventory
  for (const item of order.items) {
    const menuItem = db.getMenuItemById(item.menuItemId);
    if (menuItem) {
      db.updateMenuItem(menuItem.id, { stock: menuItem.stock + item.quantity });
    }
  }

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: order.userId,
    title: 'Order Cancelled & Refunded',
    message: `Order ${order.id} was cancelled. Full refund of ₹${order.total} has been credited.`,
    type: 'order',
    orderId: order.id,
    isRead: false,
    createdAt: now,
  });

  res.json({ order: updatedOrder });
});

// Rate & Review order
app.post('/api/orders/:id/rate', (req: Request, res: Response) => {
  const { rating, comment, tags } = req.body;
  const order = db.getOrderById(req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const review = db.addReview({
    id: `rev-${Date.now()}`,
    canteenId: order.canteenId,
    userId: order.userId,
    userName: order.userName,
    rating: Number(rating) || 5,
    comment: comment || 'Great campus food!',
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ review });
});

/* -------------------------------------------------------------
   DELIVERY AGENT ENDPOINTS
------------------------------------------------------------- */
app.get('/api/deliveries', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  const tasks = db.getDeliveryTasks(user?.role === 'agent' ? user.id : undefined);
  res.json({ tasks });
});

app.post('/api/deliveries/:id/accept', requireRole(['agent', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).currentUser as User;
  const task = db.getDeliveryTaskById(req.params.id);

  if (!task) {
    res.status(404).json({ error: 'Delivery task not found' });
    return;
  }

  if (task.status !== 'available' && task.agentId && task.agentId !== user.id) {
    res.status(400).json({ error: 'This task was already claimed by another campus agent' });
    return;
  }

  const now = new Date().toISOString();
  const updatedTask = db.updateDeliveryTask(task.id, {
    status: 'accepted',
    agentId: user.id,
    agentName: user.name,
    agentPhone: user.phone,
    assignedAt: now,
  });

  // Update order status & assigned agent
  const order = db.getOrderById(task.orderId);
  if (order) {
    db.updateOrder(order.id, {
      status: 'agent_assigned',
      assignedAgentId: user.id,
      assignedAgentName: user.name,
      assignedAgentPhone: user.phone,
      timeline: [
        ...order.timeline,
        {
          status: 'agent_assigned',
          timestamp: now,
          title: 'Delivery Agent Assigned',
          description: `${user.name} (${user.agentDetails?.vehicleType || 'bicycle'}) accepted your delivery task.`,
        },
      ],
    });

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: order.userId,
      title: 'Agent Assigned to Your Order',
      message: `${user.name} has been assigned for campus delivery to ${order.deliveryAddress.block}.`,
      type: 'delivery',
      orderId: order.id,
      isRead: false,
      createdAt: now,
    });
  }

  res.json({ task: updatedTask });
});

app.post('/api/deliveries/:id/pickup', requireRole(['agent', 'admin']), (req: Request, res: Response) => {
  const task = db.getDeliveryTaskById(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Delivery task not found' });
    return;
  }

  const now = new Date().toISOString();
  const updatedTask = db.updateDeliveryTask(task.id, {
    status: 'picked_up',
    pickedUpAt: now,
  });

  const order = db.getOrderById(task.orderId);
  if (order) {
    db.updateOrder(order.id, {
      status: 'out_for_delivery',
      outForDeliveryAt: now,
      timeline: [
        ...order.timeline,
        {
          status: 'out_for_delivery',
          timestamp: now,
          title: 'Out for Campus Delivery',
          description: `${task.agentName || 'Agent'} picked up your package from ${task.canteenName} and is en route.`,
        },
      ],
    });

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: order.userId,
      title: 'Order Out for Delivery!',
      message: `${task.agentName || 'Agent'} is on the way to ${order.deliveryAddress.block}. Share OTP ${order.deliveryOtp} on arrival.`,
      type: 'delivery',
      orderId: order.id,
      isRead: false,
      createdAt: now,
    });
  }

  res.json({ task: updatedTask });
});

app.post('/api/deliveries/:id/deliver', requireRole(['agent', 'admin']), (req: Request, res: Response) => {
  const { otp, photoUrl } = req.body;
  const task = db.getDeliveryTaskById(req.params.id);

  if (!task) {
    res.status(404).json({ error: 'Delivery task not found' });
    return;
  }

  // Validate OTP
  if (otp && otp.trim() !== task.deliveryOtp) {
    res.status(400).json({ error: `Invalid delivery OTP. Student must share their 4-digit verification OTP (${task.deliveryOtp}).` });
    return;
  }

  const now = new Date().toISOString();
  const updatedTask = db.updateDeliveryTask(task.id, {
    status: 'delivered',
    deliveredAt: now,
    proofOfDelivery: {
      otpVerified: true,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&auto=format&fit=crop&q=80',
      timestamp: now,
    },
  });

  // Credit agent payout
  if (task.agentId) {
    const agent = db.getUserById(task.agentId);
    if (agent) {
      db.updateUser(agent.id, {
        walletBalance: agent.walletBalance + task.payout,
      });
    }
  }

  const order = db.getOrderById(task.orderId);
  if (order) {
    db.updateOrder(order.id, {
      status: 'delivered',
      deliveredAt: now,
      timeline: [
        ...order.timeline,
        {
          status: 'delivered',
          timestamp: now,
          title: 'Delivered Successfully',
          description: `Handed over at ${order.deliveryAddress.block}. Verified via OTP ${task.deliveryOtp}.`,
        },
      ],
    });

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: order.userId,
      title: 'Order Delivered! 🎉',
      message: `Your food from ${order.canteenName} has been delivered. Enjoy your meal!`,
      type: 'order',
      orderId: order.id,
      isRead: false,
      createdAt: now,
    });
  }

  res.json({ task: updatedTask });
});

/* -------------------------------------------------------------
   CAMPUS ZONES, COUPONS, ADDRESSES, NOTIFICATIONS
------------------------------------------------------------- */
app.get('/api/campus-zones', (_req: Request, res: Response) => {
  res.json({ zones: db.getCampusZones() });
});

app.get('/api/coupons', (_req: Request, res: Response) => {
  res.json({ coupons: db.getCoupons() });
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Coupon code required' });
    return;
  }
  const coupon = db.getCouponByCode(code);
  if (!coupon) {
    res.status(404).json({ error: 'Invalid coupon code. Try CAMPUS50 or FRESHER20.' });
    return;
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    res.status(400).json({ error: 'This coupon has reached its maximum campus usage limit.' });
    return;
  }

  if (subtotal < coupon.minOrder) {
    res.status(400).json({
      error: `Coupon "${coupon.code}" requires a minimum order of ₹${coupon.minOrder}. Current subtotal is ₹${subtotal}.`,
    });
    return;
  }

  let discount = 0;
  if (coupon.code === 'FREEDEL') {
    discount = 20; // covers standard delivery
  } else if (coupon.discountType === 'percentage') {
    discount = Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount);
  } else {
    discount = Math.min(coupon.value, coupon.maxDiscount);
  }

  res.json({
    valid: true,
    coupon,
    discount,
    message: `Coupon "${coupon.code}" applied! You save ₹${discount}.`,
  });
});

app.get('/api/addresses', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Login required' });
    return;
  }
  res.json({ addresses: db.getAddresses(user.id) });
});

app.post('/api/addresses', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Login required' });
    return;
  }

  const { label, block, room, landmark, locationType } = req.body;
  if (!label || !block) {
    res.status(400).json({ error: 'Label and Campus Block are required' });
    return;
  }

  const addr = db.addAddress({
    id: `addr-${Date.now()}`,
    userId: user.id,
    label,
    block,
    room: room || '',
    landmark: landmark || '',
    locationType: locationType || 'Hostel',
  });

  res.status(201).json({ address: addr });
});

app.delete('/api/addresses/:id', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Login required' });
    return;
  }
  const deleted = db.deleteAddress(req.params.id, user.id);
  res.json({ success: deleted });
});

app.get('/api/notifications', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Login required' });
    return;
  }
  res.json({ notifications: db.getNotifications(user.id) });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Login required' });
    return;
  }
  db.markNotificationAsRead(req.params.id, user.id);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Login required' });
    return;
  }
  db.markAllNotificationsAsRead(user.id);
  res.json({ success: true });
});

/* -------------------------------------------------------------
   SUPPORT TICKETS & ASSISTANT
------------------------------------------------------------- */
app.get('/api/support/tickets', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Login required' });
    return;
  }
  const tickets = db.getSupportTickets(user.role === 'admin' ? undefined : user.id);
  res.json({ tickets });
});

app.post('/api/support/tickets', (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  const { subject, description, priority, orderId } = req.body;

  const ticket = db.createSupportTicket({
    id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
    userId: user ? user.id : 'guest',
    userName: user ? user.name : 'Campus Student',
    userEmail: user ? user.email : 'student@examplecollege.edu.in',
    userRole: user ? user.role : 'student',
    orderId,
    subject: subject || 'Campus Support Request',
    description: description || 'Assistance requested with order.',
    status: 'open',
    priority: priority || 'medium',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ ticket });
});

app.patch('/api/support/tickets/:id', requireRole(['admin']), (req: Request, res: Response) => {
  const updated = db.updateSupportTicket(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  res.json({ ticket: updated });
});

/* -------------------------------------------------------------
   GEMINI AI ENDPOINTS
------------------------------------------------------------- */
app.post('/api/ai/food-search', async (req: Request, res: Response) => {
  const { query, canteenId } = req.body;
  const items = db.getMenuItems(canteenId);
  const result = await aiFoodSearch(query, items);
  res.json(result);
});

app.post('/api/ai/order-assistant', async (req: Request, res: Response) => {
  const { budget, dietaryPreference, mealType, peopleCount, canteenId } = req.body;
  const items = db.getMenuItems(canteenId);
  const result = await aiOrderAssistant({
    budget: Number(budget) || 150,
    dietaryPreference: dietaryPreference || 'any',
    mealType: mealType || 'Lunch',
    peopleCount: Number(peopleCount) || 1,
    menuItems: items,
  });
  res.json(result);
});

app.post('/api/ai/delivery-slot-suggestion', async (req: Request, res: Response) => {
  const { canteenId, orderPrepTime, itemCount, targetDate } = req.body;
  const canteen = db.getCanteenById(canteenId);
  if (!canteen) {
    res.status(404).json({ error: 'Canteen not found' });
    return;
  }

  const result = await aiDeliverySlotSuggestion({
    canteen,
    orderPrepTime: Number(orderPrepTime) || 15,
    itemCount: Number(itemCount) || 2,
    targetDate: targetDate || '2026-10-29',
  });
  res.json(result);
});

app.post('/api/ai/support-assistant', async (req: Request, res: Response) => {
  const user = (req as any).currentUser as User | undefined;
  const { message } = req.body;

  const recentOrders = user
    ? db.getOrders({ userId: user.id }).slice(0, 3).map((o) => ({
        id: o.id,
        status: o.status,
        total: o.total,
        canteenName: o.canteenName,
      }))
    : [];

  const result = await aiSupportAssistant({
    userMessage: message,
    userContext: {
      userName: user ? user.name : 'Campus Visitor',
      userEmail: user ? user.email : 'visitor@examplecollege.edu.in',
      role: user ? user.role : 'student',
      recentOrders,
    },
  });

  // If escalation recommended, create ticket automatically
  if (result.shouldEscalate && result.ticketDraft) {
    db.createSupportTicket({
      id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      userId: user ? user.id : 'escalated',
      userName: user ? user.name : 'Student',
      userEmail: user ? user.email : 'student@examplecollege.edu.in',
      userRole: user ? user.role : 'student',
      subject: result.ticketDraft.subject,
      description: result.ticketDraft.description,
      status: 'open',
      priority: result.ticketDraft.priority || 'high',
      aiDraftResponse: result.reply,
      createdAt: new Date().toISOString(),
    });
  }

  res.json(result);
});

/* -------------------------------------------------------------
   ADMIN & ANALYTICS ENDPOINTS
------------------------------------------------------------- */
app.get('/api/admin/analytics', requireRole(['admin']), (_req: Request, res: Response) => {
  const orders = db.getOrders();
  const canteens = db.getCanteens();
  const users = db.getUsers();

  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
  const cancellationRate = orders.length > 0 ? Math.round((cancelledOrders / orders.length) * 100) : 0;

  // Canteen revenue breakdown
  const canteenStats = canteens.map((c) => {
    const cOrders = orders.filter((o) => o.canteenId === c.id && o.status !== 'cancelled');
    const rev = cOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      id: c.id,
      name: c.name,
      ordersCount: cOrders.length,
      revenue: Math.round(rev),
      rating: c.rating,
      rushCapacityPercent: c.rushCapacityPercent,
    };
  });

  // Hourly order distribution heatmap (00:00 to 23:00)
  const hourlyLoad = Array(24).fill(0);
  orders.forEach((o) => {
    const d = new Date(o.placedAt);
    const hour = d.getHours();
    hourlyLoad[hour] += 1;
  });

  res.json({
    kpis: {
      totalOrders: orders.length,
      completedOrders,
      totalRevenue: Math.round(totalRevenue),
      cancellationRate: `${cancellationRate}%`,
      avgDeliveryMinutes: 16,
      activeStudents: users.filter((u) => u.role === 'student').length,
      activeAgents: users.filter((u) => u.role === 'agent').length,
    },
    canteenStats,
    hourlyHeatmap: hourlyLoad.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      orders: count,
    })),
  });
});

app.post('/api/admin/assign-agent', requireRole(['admin']), (req: Request, res: Response) => {
  const { orderId, agentId } = req.body;
  const agent = db.getUserById(agentId);
  const order = db.getOrderById(orderId);

  if (!agent || !order) {
    res.status(404).json({ error: 'Order or Agent not found' });
    return;
  }

  const now = new Date().toISOString();
  db.updateOrder(order.id, {
    status: 'agent_assigned',
    assignedAgentId: agent.id,
    assignedAgentName: agent.name,
    assignedAgentPhone: agent.phone,
    timeline: [
      ...order.timeline,
      {
        status: 'agent_assigned',
        timestamp: now,
        title: 'Manually Assigned by Campus Admin',
        description: `Admin assigned ${agent.name} for this delivery task.`,
      },
    ],
  });

  const task = db.getDeliveryTaskByOrderId(order.id);
  if (task) {
    db.updateDeliveryTask(task.id, {
      status: 'accepted',
      agentId: agent.id,
      agentName: agent.name,
      agentPhone: agent.phone,
      assignedAt: now,
    });
  }

  res.json({ success: true, message: `Assigned agent ${agent.name} to order ${order.id}` });
});

app.post('/api/admin/refund', requireRole(['admin']), (req: Request, res: Response) => {
  const { orderId, amount, reason } = req.body;
  const order = db.getOrderById(orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const refundAmount = Number(amount) || order.total;
  const student = db.getUserById(order.userId);
  if (student) {
    db.updateUser(student.id, {
      walletBalance: Math.round((student.walletBalance + refundAmount) * 100) / 100,
    });
  }

  db.updateOrder(order.id, {
    paymentStatus: 'refunded',
  });

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: order.userId,
    title: 'Refund Processed',
    message: `Admin approved a refund of ₹${refundAmount} for order ${order.id}. Added to your Campus Wallet. Note: ${reason || 'Customer resolution'}`,
    type: 'system',
    orderId: order.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, refundedAmount: refundAmount });
});

app.post('/api/admin/reset-demo-data', requireRole(['admin']), (_req: Request, res: Response) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Campus database reset to initial seed state.' });
});

/* -------------------------------------------------------------
   VITE MIDDLEWARE IN DEV OR STATIC SERVING IN PROD
------------------------------------------------------------- */
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusBites] Server running at http://localhost:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
