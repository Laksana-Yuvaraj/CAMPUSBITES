import React, { useState } from 'react';
import { X, Wallet, Plus, ShieldCheck, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [topupAmount, setTopupAmount] = useState<number>(200);
  const [simulatedAdded, setSimulatedAdded] = useState(false);

  if (!isOpen || !user) return null;

  const handleTopup = () => {
    // Top up simulation
    user.walletBalance += topupAmount;
    setSimulatedAdded(true);
    setTimeout(() => {
      setSimulatedAdded(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100">
        <div className="p-5 bg-gradient-to-tr from-emerald-700 to-green-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Campus Wallet</h3>
              <p className="text-[11px] text-emerald-100">Direct 1-tap payment at all canteens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-slate-800">
          {/* Balance Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Available Balance</p>
              <p className="text-2xl font-extrabold text-emerald-400">₹{user.walletBalance}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Linked to College ID: {user.collegeId}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Top up Simulator */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Quick Top Up (Sandbox)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    topupAmount === amt
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={handleTopup}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add ₹{topupAmount} to Campus Wallet</span>
            </button>

            {simulatedAdded && (
              <p className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>₹{topupAmount} credited successfully!</span>
              </p>
            )}
          </div>

          {/* Transaction benefits */}
          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-bold text-slate-900">Why use Campus Wallet?</p>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-500">
              <li>Instant 1-tap checkout with zero UPI gateway lag during lunch break.</li>
              <li>Instant full refunds on order cancellations before preparation.</li>
              <li>Eligible for exclusive ₹30 extra coupon discounts on exam nights.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
