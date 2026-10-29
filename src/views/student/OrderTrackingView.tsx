import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  Bike,
  Store,
  Phone,
  FileText,
  Star,
  AlertCircle,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { CampusMapSimulation } from '../../components/CampusMapSimulation.tsx';
import { useCart } from '../../context/CartContext.tsx';

interface OrderTrackingViewProps {
  orderId: string;
  onBack: () => void;
  onOpenInvoice: (order: Order) => void;
  onOpenRate: (order: Order) => void;
  onOpenSupport: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orderId,
  onBack,
  onOpenInvoice,
  onOpenRate,
  onOpenSupport,
}) => {
  const { addItem } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [reorderedMsg, setReorderedMsg] = useState(false);

  const fetchOrder = () => {
    api.getOrder(orderId)
      .then((res) => setOrder(res.order))
      .catch((e) => console.error('Failed to load order:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // live polling for status progression
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs space-y-2">
        <Clock className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        <p>Loading real-time campus tracking for #{orderId}...</p>
      </div>
    );
  }

  const steps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'placed', label: 'Order Placed', icon: Clock },
    { status: 'accepted', label: 'Accepted', icon: Store },
    { status: 'preparing', label: 'Kitchen Preparing', icon: Sparkles },
    { status: 'ready_for_pickup', label: 'Ready for Pickup', icon: CheckCircle2 },
    { status: 'agent_assigned', label: 'Runner Assigned', icon: Bike },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (st: OrderStatus) => {
    switch (st) {
      case 'placed':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'agent_assigned':
        return 4;
      case 'out_for_delivery':
        return 5;
      case 'delivered':
        return 6;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const canCancel = ['placed', 'accepted'].includes(order.status);

  const handleCancelOrder = async () => {
    const reason = window.prompt(
      'Are you sure you want to cancel? Please specify the reason (refund will be processed to original payment method):',
      'Changed mind before preparation started'
    );
    if (!reason) return;

    setCancelling(true);
    setCancelError('');

    try {
      const res = await api.cancelOrder(order.id, reason);
      setOrder(res.order);
    } catch (e: any) {
      setCancelError(e.message || 'Cannot cancel order after cooking has started.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      // Reorder items
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
    setReorderedMsg(true);
    setTimeout(() => setReorderedMsg(false), 2000);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top back & Order ID */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Orders</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenInvoice(order)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Receipt</span>
          </button>

          <button
            onClick={onOpenSupport}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            Help / Support
          </button>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">Order #{order.id}</span>
              {order.orderType === 'scheduled' && (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                  Scheduled for {order.scheduledFor}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              From <strong className="text-slate-800">{order.canteenName}</strong> • {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* OTP Verification Pill */}
          {!isDelivered && !isCancelled && (
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] uppercase font-bold text-emerald-800">Delivery OTP:</span>
              <span className="font-mono text-base font-black tracking-widest text-emerald-700">
                {order.deliveryOtp}
              </span>
            </div>
          )}
        </div>

        {/* Live GPS Campus Radar Map */}
        <CampusMapSimulation
          canteenName={order.canteenName}
          dropBlock={order.deliveryAddress.block}
          agentName={order.assignedAgentName || 'Campus Runner'}
          status={order.status}
          etaMinutes={order.estimatedDeliveryMinutes}
        />

        {/* Cancel Error notice */}
        {cancelError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cancelError}</span>
          </div>
        )}

        {/* Cancel Order Action (allowed only before preparation starts) */}
        {canCancel && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800">Need to cancel?</p>
              <p className="text-[11px] text-slate-500">
                Allowed before the canteen starts cooking your meal.
              </p>
            </div>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-rose-800 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Order Cancelled & Refund Initiated</span>
            </p>
            <p className="text-rose-700">
              {order.cancelReason || 'Cancelled before kitchen preparation started.'}
            </p>
          </div>
        )}

        {/* Rate Order CTA if delivered */}
        {isDelivered && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>How was the food?</span>
              </p>
              <p className="text-[11px] text-amber-700">
                Rate this order to help improve campus canteen quality!
              </p>
            </div>
            <button
              onClick={() => onOpenRate(order)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              Rate Order
            </button>
          </div>
        )}

        {/* Stepper Progress */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Order Progress
          </h4>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((st, i) => {
              const isPast = currentIndex >= i;
              const isCurrent = currentIndex === i;
              const Icon = st.icon;

              return (
                <div key={st.status} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] transition-colors ${
                      isCurrent
                        ? 'bg-emerald-600 ring-4 ring-emerald-100 scale-110'
                        : isPast
                        ? 'bg-emerald-600'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-emerald-700' : isPast ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </p>
                    {isCurrent && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {order.timeline[order.timeline.length - 1]?.description || 'In progress...'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Agent Card if assigned */}
        {order.assignedAgentName && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Campus Runner</p>
                <p className="font-extrabold text-slate-900">{order.assignedAgentName}</p>
                <p className="text-slate-500">{order.assignedAgentPhone}</p>
              </div>
            </div>

            <a
              href={`tel:${order.assignedAgentPhone}`}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Call Delivery Runner"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Delivery Address Summary */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Campus Drop Location
          </p>
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{order.deliveryAddress.label} • {order.deliveryAddress.block}</span>
          </p>
          <p className="text-slate-600 pl-5">
            {order.deliveryAddress.room} {order.deliveryAddress.landmark && `(${order.deliveryAddress.landmark})`}
          </p>
        </div>

        {/* Items Summary */}
        <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900">Order Items ({order.items.length})</h4>
            <button
              onClick={handleReorder}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{reorderedMsg ? 'Added to Cart!' : 'Reorder Items'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-1.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">
                    {item.quantity}x {item.name}
                  </span>
                  {item.customizations?.size && (
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({item.customizations.size})
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-900">
                  ₹{item.unitPrice * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
            <span>Total Paid ({order.paymentMethod.toUpperCase()})</span>
            <span className="text-emerald-700">₹{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
