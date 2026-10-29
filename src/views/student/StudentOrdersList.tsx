import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, FileText, Star, RotateCcw, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';

interface StudentOrdersListProps {
  onSelectOrder: (order: Order) => void;
  onOpenInvoice: (order: Order) => void;
  onOpenRate: (order: Order) => void;
  onExplore: () => void;
}

export const StudentOrdersList: React.FC<StudentOrdersListProps> = ({
  onSelectOrder,
  onOpenInvoice,
  onOpenRate,
  onExplore,
}) => {
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderedId, setReorderedId] = useState<string | null>(null);

  useEffect(() => {
    api.getOrders()
      .then((res) => setOrders(res.orders))
      .catch((e) => console.error('Failed to load orders:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    order.items.forEach((item) => {
      addItem(
        {
          id: item.menuItemId,
          canteenId: order.canteenId,
          name: item.name,
          description: '',
          price: item.unitPrice,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          category: 'Lunch',
          isVeg: item.isVeg,
          spiceLevel: 1,
          calories: 350,
          stock: 50,
          isAvailable: true,
          preparationTime: 15,
        },
        order.canteenName,
        item.quantity,
        item.customizations
      );
    });
    setReorderedId(order.id);
    setTimeout(() => setReorderedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs space-y-2">
        <Clock className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        <p>Loading your campus orders...</p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="space-y-6 pb-24 text-slate-800">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">My Orders</h1>
        <p className="text-xs text-slate-500">Live order status, invoices, and reorders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3 shadow-xs">
          <ShoppingBag className="w-12 h-12 mx-auto opacity-30 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-700">No orders placed yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Order delicious breakfast, lunch thalis, or midnight Maggi from campus canteens.
          </p>
          <button
            onClick={onExplore}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            Explore Canteens Now
          </button>
        </div>
      ) : (
        <>
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  Active Live Orders ({activeOrders.length})
                </h2>
              </div>

              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="p-4 bg-white rounded-3xl border-2 border-emerald-500/50 hover:border-emerald-500 shadow-sm transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">#{order.id}</span>
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          {order.canteenName}
                        </p>
                      </div>

                      <span className="text-sm font-extrabold text-slate-900">₹{order.total}</span>
                    </div>

                    <div className="text-xs text-slate-500 line-clamp-1">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span>Track Live GPS Radar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        OTP: <strong className="text-slate-900">{order.deliveryOtp}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Orders Section */}
          {pastOrders.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Past Orders ({pastOrders.length})
              </h2>

              <div className="space-y-3">
                {pastOrders.map((order) => {
                  const isDelivered = order.status === 'delivered';
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <div
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="p-4 bg-white rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">#{order.id}</span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                isDelivered
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold mt-0.5">
                            {order.canteenName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(order.placedAt).toLocaleString()}
                          </p>
                        </div>

                        <span className="text-sm font-extrabold text-slate-900">₹{order.total}</span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenInvoice(order);
                            }}
                            className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>

                          {isDelivered && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenRate(order);
                              }}
                              className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 ml-2"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>Rate</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleReorder(order, e)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{reorderedId === order.id ? 'Added!' : 'Reorder'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
