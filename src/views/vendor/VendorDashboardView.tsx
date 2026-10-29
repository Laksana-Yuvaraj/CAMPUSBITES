import React, { useState, useEffect } from 'react';
import {
  Store,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  X,
  Flame,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Canteen, MenuItem, Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const VendorDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab: 'dashboard' | 'live-orders' | 'menu-manager' | 'analytics'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live-orders' | 'menu-manager' | 'analytics'>('dashboard');

  // Sub-filter inside live orders: 'pending' | 'preparing' | 'ready' | 'scheduled' | 'completed'
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'scheduled'>('pending');

  // Add / Edit Menu Item Modal State
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canteenId = user?.canteenId || 'canteen-1';

  const loadData = () => {
    Promise.all([
      api.getCanteen(canteenId),
      api.getMenu({ canteenId }),
      api.getOrders({ canteenId }),
    ])
      .then(([cRes, mRes, oRes]) => {
        setCanteen(cRes.canteen);
        setMenuItems(mRes.items);
        setOrders(oRes.orders);
      })
      .catch((e) => console.error('Failed to load vendor data:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [canteenId]);

  if (loading || !canteen) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs space-y-2">
        <Clock className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        <p>Loading Canteen Kitchen Dashboard...</p>
      </div>
    );
  }

  // KPIs
  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'placed');
  const preparingOrders = orders.filter((o) => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready_for_pickup');
  const scheduledOrders = orders.filter((o) => o.orderType === 'scheduled' && o.status !== 'delivered');
  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const lowStockItems = menuItems.filter((i) => i.stock <= 10 && i.isAvailable);

  // Status transition handlers
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      await api.updateOrderStatus(orderId, status, note);
      loadData();
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  // Toggle canteen open status
  const handleToggleOpen = async () => {
    try {
      const updated = await api.updateCanteen(canteen.id, { isOpen: !canteen.isOpen });
      setCanteen(updated.canteen);
    } catch (e) {
      console.error('Failed to toggle open:', e);
    }
  };

  // Update rush capacity slider
  const handleUpdateRushCapacity = async (val: number) => {
    try {
      const updated = await api.updateCanteen(canteen.id, { rushCapacityPercent: val });
      setCanteen(updated.canteen);
    } catch (e) {
      console.error('Failed to update rush:', e);
    }
  };

  // Menu item actions
  const handleToggleItemAvailability = async (item: MenuItem) => {
    try {
      await api.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      loadData();
    } catch (e) {
      console.error('Failed to toggle item availability:', e);
    }
  };

  const handleUpdateStock = async (item: MenuItem, newStock: number) => {
    try {
      await api.updateMenuItem(item.id, { stock: Math.max(0, newStock) });
      loadData();
    } catch (e) {
      console.error('Failed to update stock:', e);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Delete this item from canteen menu?')) return;
    try {
      await api.deleteMenuItem(itemId);
      loadData();
    } catch (e) {
      console.error('Failed to delete item:', e);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.price) return;

    try {
      if (editingItem.id) {
        await api.updateMenuItem(editingItem.id, editingItem);
      } else {
        await api.createMenuItem({
          ...editingItem,
          canteenId: canteen.id,
          image: editingItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (e) {
      console.error('Failed to save menu item:', e);
    }
  };

  return (
    <div className="space-y-5 pb-24 text-slate-800">
      {/* Header Profile & Live Toggles */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={canteen.image}
            alt={canteen.name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900">{canteen.name}</h1>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  canteen.isOpen
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {canteen.isOpen ? 'Accepting Orders' : 'Kitchen Closed'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating Hours: {canteen.openingTime} - {canteen.closingTime} • Rating: {canteen.rating} ★
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleOpen}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              canteen.isOpen
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {canteen.isOpen ? 'Pause Canteen Orders' : 'Open Canteen Now'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard & Queue', icon: Store, count: pendingOrders.length },
          { id: 'live-orders', label: 'All Kitchen Orders', icon: Clock, count: orders.length },
          { id: 'menu-manager', label: 'Menu Manager', icon: Layers, count: menuItems.length },
          { id: 'analytics', label: 'Kitchen Analytics', icon: BarChart3 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD & QUEUE */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Today Revenue
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">₹{todayRevenue}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Campus Settled</p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Approval
              </span>
              <p className="text-xl font-black text-amber-600 mt-1">{pendingOrders.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Needs kitchen action</p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cooking / Ready
              </span>
              <p className="text-xl font-black text-emerald-700 mt-1">
                {preparingOrders.length + readyOrders.length}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">In kitchen line</p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Scheduled Orders
              </span>
              <p className="text-xl font-black text-purple-700 mt-1">{scheduledOrders.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Timeline slots reserved</p>
            </div>
          </div>

          {/* Kitchen Rush Capacity Slider & Low Stock Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">
                  Kitchen Rush Capacity ({canteen.rushCapacityPercent}%)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    canteen.rushCapacityPercent > 75
                      ? 'bg-rose-100 text-rose-800'
                      : canteen.rushCapacityPercent > 40
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {canteen.rushCapacityPercent > 75
                    ? 'High Rush'
                    : canteen.rushCapacityPercent > 40
                    ? 'Moderate'
                    : 'Smooth Prep'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={canteen.rushCapacityPercent}
                onChange={(e) => handleUpdateRushCapacity(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Helps AI recommend optimal scheduled delivery slots to students during rush hours.
              </p>
            </div>

            {/* Low stock alerts */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Low Stock Inventory Alerts ({lowStockItems.length})</span>
              </div>
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-500">All menu items have healthy stock levels.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {lowStockItems.map((item) => (
                    <span
                      key={item.id}
                      className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl"
                    >
                      {item.name}: {item.stock} left
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Orders Immediate Queue */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              New Orders Needing Acceptance ({pendingOrders.length})
            </h2>

            {pendingOrders.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
                No new pending orders in queue.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-white rounded-3xl border-2 border-amber-300 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-extrabold text-slate-900">#{order.id}</span>
                        <p className="text-xs text-slate-600 font-semibold">
                          Student: {order.userName} ({order.userPhone})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          📍 {order.deliveryAddress.block}, {order.deliveryAddress.room}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">₹{order.total}</span>
                        <p className="text-[10px] text-emerald-700 font-bold uppercase">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-2xl text-xs space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="font-bold text-slate-800">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-slate-600">₹{item.unitPrice * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'accepted', 'Accepted by kitchen chef')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        Accept & Cook
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled', 'Canteen out of ingredients')}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ORDERS WITH STAGES */}
      {activeTab === 'live-orders' && (
        <div className="space-y-4">
          {/* Sub-filter chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: `Pending (${pendingOrders.length})` },
              { id: 'preparing', label: `Cooking (${preparingOrders.length})` },
              { id: 'ready', label: `Ready for Pickup (${readyOrders.length})` },
              { id: 'scheduled', label: `Scheduled Slots (${scheduledOrders.length})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setOrderFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  orderFilter === f.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {orders
              .filter((o) => {
                if (orderFilter === 'pending') return o.status === 'placed';
                if (orderFilter === 'preparing') return o.status === 'accepted' || o.status === 'preparing';
                if (orderFilter === 'ready') return o.status === 'ready_for_pickup';
                if (orderFilter === 'scheduled') return o.orderType === 'scheduled';
                return true;
              })
              .map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">#{order.id}</span>
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full">
                          Status: {order.status.replace(/_/g, ' ')}
                        </span>
                        {order.orderType === 'scheduled' && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            🕒 Slot: {order.scheduledFor}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {order.userName} • {order.deliveryAddress.block} ({order.deliveryAddress.room})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">₹{order.total}</span>
                      <p className="text-[10px] text-slate-400">OTP: {order.deliveryOtp}</p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="text-xs space-y-1">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-slate-700">
                        <span>
                          {it.quantity}x <strong>{it.name}</strong>
                          {it.customizations?.size && ` (${it.customizations.size})`}
                        </span>
                        <span>₹{it.unitPrice * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Workflow transition buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                    {order.status === 'placed' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'accepted', 'Accepted by kitchen')}
                        className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
                      >
                        Accept
                      </button>
                    )}

                    {(order.status === 'accepted' || order.status === 'preparing') && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            order.id,
                            'ready_for_pickup',
                            'Packed in container. Ready for delivery runner pickup.'
                          )
                        }
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                      >
                        Mark Ready for Pickup ✓
                      </button>
                    )}

                    {order.status === 'ready_for_pickup' && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        Waiting for Runner Fleet Pickup
                      </span>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                        Runner: {order.assignedAgentName || 'Assigned'} en route
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: MENU MANAGER */}
      {activeTab === 'menu-manager' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Canteen Menu Items ({menuItems.length})
              </h2>
              <p className="text-xs text-slate-500">Edit prices, toggle stock, or add special items</p>
            </div>

            <button
              onClick={() => {
                setEditingItem({
                  canteenId: canteen.id,
                  category: 'Lunch',
                  isVeg: true,
                  spiceLevel: 1,
                  calories: 400,
                  stock: 50,
                  isAvailable: true,
                  preparationTime: 12,
                });
                setIsModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">{item.category} • {item.calories} kcal</p>
                    <p className="text-xs font-black text-slate-900 mt-1">₹{item.price}</p>

                    {/* Stock adjustments */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-500 font-semibold">Stock:</span>
                      <button
                        onClick={() => handleUpdateStock(item, item.stock - 5)}
                        className="w-5 h-5 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-800">{item.stock}</span>
                      <button
                        onClick={() => handleUpdateStock(item, item.stock + 5)}
                        className="w-5 h-5 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleItemAvailability(item)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {item.isAvailable ? 'In Stock' : 'Sold Out'}
                  </button>

                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KITCHEN ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Completed Meals</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{completedOrders.length}</p>
              <p className="text-xs text-slate-500 mt-1">Delivered to hostels & departments</p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Average Kitchen Prep Time</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {canteen.avgPrepTimeMinutes} mins
              </p>
              <p className="text-xs text-slate-500 mt-1">Below target of 18 minutes</p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Campus Rating</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{canteen.rating} ★</p>
              <p className="text-xs text-slate-500 mt-1">Based on {canteen.ratingCount} student reviews</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Kitchen Peak Hours
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Lunch Hour Break (12:30 - 14:00)</span>
                <span className="font-extrabold text-rose-600">Peak Load (~55% volume)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Evening Chai & Snacks (16:30 - 18:00)</span>
                <span className="font-extrabold text-amber-600">Medium Load (~25% volume)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-slate-700">Late Night Study Shift (22:00 - 02:00)</span>
                <span className="font-extrabold text-emerald-600">High Volume (~20% volume)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingItem.id ? 'Edit Menu Item' : 'Add New Item to Menu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Paneer Tikka Wrap"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    required
                    min="5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingItem.category || 'Lunch'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Combos">Combos</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Ingredients and serving details..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingItem.stock ?? 50}
                    onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prep Mins</label>
                  <input
                    type="number"
                    value={editingItem.preparationTime ?? 12}
                    onChange={(e) => setEditingItem({ ...editingItem, preparationTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Calories</label>
                  <input
                    type="number"
                    value={editingItem.calories ?? 350}
                    onChange={(e) => setEditingItem({ ...editingItem, calories: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isVeg ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, isVeg: e.target.checked })}
                    className="accent-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-800">Vegetarian (Veg)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                    className="accent-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-800">Available Today</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold shadow-sm"
              >
                Save Menu Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
