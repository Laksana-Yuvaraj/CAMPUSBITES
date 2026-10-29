import React from 'react';
import { X, Bell, CheckCheck, Clock, Bike, Store, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Notification } from '../types/index.ts';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const { notifications, markAllNotificationsRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'delivery':
        return <Bike className="w-4 h-4 text-rose-500" />;
      case 'canteen':
        return <Store className="w-4 h-4 text-amber-500" />;
      case 'order':
        return <Clock className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Campus Alerts</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No new campus notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.orderId && onSelectOrder) {
                    onSelectOrder(n.orderId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all text-xs ${
                  n.isRead
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-emerald-50/50 border-emerald-200 text-slate-900 font-medium'
                } ${n.orderId ? 'cursor-pointer hover:border-emerald-400' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="font-bold truncate text-slate-900">{n.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{n.message}</p>
                    {n.orderId && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                        View Order #{n.orderId} →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
