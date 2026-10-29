import React from 'react';
import {
  Compass,
  ShoppingBag,
  Clock,
  User as UserIcon,
  Store,
  Layers,
  BarChart3,
  Bike,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOpenCart }) => {
  const { role } = useAuth();
  const { itemCount } = useCart();

  if (!role) return null;

  // Student Tabs
  const studentTabs = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'orders', label: 'My Orders', icon: Clock },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: itemCount },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  // Vendor Tabs
  const vendorTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Store },
    { id: 'live-orders', label: 'Live Orders', icon: Clock },
    { id: 'menu-manager', label: 'Menu', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Agent Tabs
  const agentTabs = [
    { id: 'tasks', label: 'Drops Feed', icon: Bike },
    { id: 'active', label: 'Active Task', icon: CheckCircle },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  // Admin Tabs
  const adminTabs = [
    { id: 'overview', label: 'KPIs', icon: BarChart3 },
    { id: 'all-orders', label: 'Campus Orders', icon: Clock },
    { id: 'canteens-fleet', label: 'Canteens & Fleet', icon: Store },
    { id: 'disputes', label: 'Support & Tickets', icon: MessageSquare },
  ];

  let currentTabs = studentTabs;
  if (role === 'canteen') currentTabs = vendorTabs;
  if (role === 'agent') currentTabs = agentTabs;
  if (role === 'admin') currentTabs = adminTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 sm:py-2 max-w-lg mx-auto sm:max-w-none shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {currentTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'cart') {
                  onOpenCart();
                } else {
                  onTabChange(tab.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-emerald-600 stroke-[2.5]' : ''
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">{tab.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
