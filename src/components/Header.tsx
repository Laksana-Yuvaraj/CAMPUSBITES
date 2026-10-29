import React, { useState } from 'react';
import {
  UtensilsCrossed,
  MapPin,
  Wallet,
  Bell,
  User as UserIcon,
  ChevronDown,
  LogOut,
  Sparkles,
  ShieldCheck,
  Bike,
  Store,
  GraduationCap,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { UserRole } from '../types/index.ts';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenWalletModal: () => void;
  onOpenLocationModal: () => void;
  currentLocationLabel: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenWalletModal,
  onOpenLocationModal,
  currentLocationLabel,
}) => {
  const { user, role, demoUsers, switchDemoUser, logout, unreadCount } = useAuth();
  const { itemCount } = useCart();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'student':
        return { label: 'Student', icon: GraduationCap, bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'canteen':
        return { label: 'Canteen Vendor', icon: Store, bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'agent':
        return { label: 'Campus Runner', icon: Bike, bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'admin':
        return { label: 'Dean / Admin', icon: ShieldCheck, bg: 'bg-purple-100 text-purple-800 border-purple-300' };
    }
  };

  const currentBadge = role ? getRoleBadge(role) : null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Campus Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Campus<span className="text-emerald-600">Bites</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  Campus Foodtech
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none truncate max-w-[140px] sm:max-w-none">
                Apex Institute of Technology
              </p>
            </div>
          </div>

          {/* Location Picker (For Students) */}
          {role === 'student' && (
            <button
              onClick={onOpenLocationModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-left max-w-[220px]"
              title="Change Delivery Location"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deliver to</p>
                <p className="text-xs font-medium text-slate-800 truncate">{currentLocationLabel || 'Select Location'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>
          )}

          {/* Right Controls: Role Switcher, Wallet, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick 1-Click Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-all ${
                  currentBadge ? currentBadge.bg : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Switch Role Demo"
              >
                {currentBadge && <currentBadge.icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{currentBadge?.label || 'Select Role'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Switch Test Persona</p>
                      <p className="text-[11px] text-slate-500">Test all 4 campus portals instantly</p>
                    </div>
                    <button
                      onClick={() => setShowRoleMenu(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-1 space-y-1">
                    {demoUsers.map((u) => {
                      const b = getRoleBadge(u.role);
                      const isCurrent = user?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchDemoUser(u);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                            isCurrent ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={u.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${b.bg}`}>
                                  {b.label}
                                </span>
                                {u.canteenId && (
                                  <span className="text-[10px] text-slate-500 truncate">
                                    {u.canteenId === 'canteen-1' ? 'Central' : u.canteenId === 'canteen-2' ? 'Green Bistro' : 'Night Owl'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Balance (for students & agents) */}
            {(role === 'student' || role === 'agent') && (
              <button
                onClick={onOpenWalletModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                title="Campus Wallet"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>₹{user?.walletBalance ?? 0}</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="hidden sm:flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
