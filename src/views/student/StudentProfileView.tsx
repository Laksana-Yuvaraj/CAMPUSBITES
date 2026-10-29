import React from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  Wallet,
  LogOut,
  Building,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Address } from '../../types/index.ts';

interface StudentProfileViewProps {
  onOpenWallet: () => void;
  onOpenLocationModal: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  onOpenWallet,
  onOpenLocationModal,
}) => {
  const { user, logout, switchDemoUser, demoUsers } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-5 pb-24 text-slate-800">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-500">College verification & saved delivery details</p>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
        <img
          src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt={user.name}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-xs"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 truncate">{user.name}</h2>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              Verified Student
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ID: {user.collegeId}</span>
          </p>
          <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{user.email}</span>
          </p>
        </div>
      </div>

      {/* Campus Wallet Quick Card */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-600 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-200">Campus Wallet Balance</p>
          <p className="text-2xl font-black mt-0.5">₹{user.walletBalance}</p>
          <p className="text-[11px] text-emerald-100 mt-1">Instant 1-tap cafeteria ordering</p>
        </div>

        <button
          onClick={onOpenWallet}
          className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl text-xs font-extrabold shadow-sm transition-all"
        >
          Top Up +
        </button>
      </div>

      {/* Campus Details */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Campus Information
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Institution</span>
            <span className="font-bold text-slate-900">Apex Institute of Technology</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Hostel Residence</span>
            <span className="font-bold text-slate-900">{user.hostelOrDept || 'Aryabhatta Block B'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Room / Dorm</span>
            <span className="font-bold text-slate-900">{user.room || 'Room 304'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Phone Number</span>
            <span className="font-bold text-slate-900">{user.phone}</span>
          </div>
        </div>

        <button
          onClick={onOpenLocationModal}
          className="w-full mt-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Manage Saved Delivery Addresses</span>
        </button>
      </div>

      {/* Switch Persona Fast Picker */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Demo Role Switching
        </h3>
        <p className="text-xs text-slate-500">
          Test any role without logging in again:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {demoUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => switchDemoUser(u)}
              className={`p-2.5 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                user.id === u.id
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <img
                src={u.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={u.name}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <div className="truncate">
                <p className="truncate font-bold leading-tight">{u.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of CampusBites</span>
      </button>
    </div>
  );
};
