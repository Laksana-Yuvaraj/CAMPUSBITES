import React, { useState, useEffect } from 'react';
import {
  Bike,
  CheckCircle2,
  MapPin,
  Phone,
  DollarSign,
  TrendingUp,
  Clock,
  Navigation,
  ShieldCheck,
  AlertCircle,
  Camera,
  Check,
  Power,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { DeliveryTask } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { CampusMapSimulation } from '../../components/CampusMapSimulation.tsx';

export const AgentDashboardView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(user?.agentDetails?.isAvailable ?? true);
  const [currentLocation, setCurrentLocation] = useState(
    user?.agentDetails?.currentCampusLocation || 'Aryabhatta Quadrangle'
  );
  const [vehicle, setVehicle] = useState<'bicycle' | 'e-scooter' | 'walking'>(
    user?.agentDetails?.vehicleType || 'e-scooter'
  );

  // OTP dialog state for completing delivery
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [simulatedPhoto, setSimulatedPhoto] = useState(false);

  const loadTasks = () => {
    api.getDeliveries()
      .then((res) => setTasks(res.tasks))
      .catch((e) => console.error('Failed to load agent tasks:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 6000);
    return () => clearInterval(interval);
  }, []);

  const availableTasks = tasks.filter((t) => t.status === 'available');
  const activeTask = tasks.find((t) => (t.status === 'accepted' || t.status === 'picked_up') && t.agentId === user?.id) ||
    tasks.find((t) => (t.status === 'accepted' || t.status === 'picked_up')); // fallback to first active for testing

  const completedTasks = tasks.filter((t) => t.status === 'delivered');
  const dailyEarnings = completedTasks.reduce((sum, t) => sum + t.payout, 0);

  const handleAcceptTask = async (taskId: string) => {
    try {
      await api.acceptDelivery(taskId);
      await refreshUser();
      loadTasks();
    } catch (e: any) {
      alert(e.message || 'Failed to accept delivery task');
    }
  };

  const handlePickup = async (taskId: string) => {
    try {
      await api.pickupDelivery(taskId);
      loadTasks();
    } catch (e: any) {
      alert(e.message || 'Failed to mark picked up');
    }
  };

  const handleCompleteDelivery = async () => {
    if (!completingTaskId) return;
    setOtpError('');

    try {
      await api.completeDelivery(completingTaskId, otpInput.trim());
      setCompletingTaskId(null);
      setOtpInput('');
      setSimulatedPhoto(false);
      await refreshUser();
      loadTasks();
    } catch (e: any) {
      setOtpError(e.message || 'Incorrect delivery OTP');
    }
  };

  return (
    <div className="space-y-5 pb-24 text-slate-800">
      {/* Top Runner Status & Online Toggle */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900">{user?.name}</h1>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                  ID: {user?.collegeId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vehicle: <strong className="capitalize text-slate-700">{vehicle}</strong> • Rating: 4.9 ★
              </p>
            </div>
          </div>

          {/* Online/Offline Toggle Button */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto ${
              isOnline
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'Active (Online)' : 'Paused (Offline)'}</span>
          </button>
        </div>

        {/* Campus Location Bar & Vehicle Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none w-full"
            >
              <option value="Aryabhatta Quadrangle">Current: Aryabhatta Quadrangle</option>
              <option value="Student Activity Center">Current: Student Activity Center (SAC)</option>
              <option value="Central Library Ground">Current: Central Library Ground</option>
              <option value="Academic Block North Gate">Current: Academic Block North Gate</option>
              <option value="Sports Arena Junction">Current: Sports Arena Junction</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Vehicle Mode:</span>
            <div className="flex gap-1">
              {(['bicycle', 'e-scooter', 'walking'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVehicle(v)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                    vehicle === v
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Earnings Metrics */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Today Earnings
          </span>
          <p className="text-lg font-black text-emerald-700 mt-1">₹{dailyEarnings}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Wallet balance: ₹{user?.walletBalance}</p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Completed Drops
          </span>
          <p className="text-lg font-black text-slate-900 mt-1">{completedTasks.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">100% on-time</p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Run Distance
          </span>
          <p className="text-lg font-black text-blue-700 mt-1">520m</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Campus pathways</p>
        </div>
      </div>

      {/* ACTIVE TASK SECTION */}
      {activeTask && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Active Campus Task #{activeTask.orderId}
              </span>
            </div>
            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
              Payout: +₹{activeTask.payout}
            </span>
          </div>

          {/* Live Campus Route Radar */}
          <CampusMapSimulation
            canteenName={activeTask.canteenName}
            dropBlock={activeTask.dropBlock}
            agentName={user?.name || 'Agent'}
            status={activeTask.status === 'picked_up' ? 'out_for_delivery' : 'ready_for_pickup'}
            etaMinutes={8}
          />

          {/* Route details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
              <p className="text-[10px] text-slate-400 font-bold uppercase">1. Pickup From Canteen</p>
              <p className="font-bold text-white mt-0.5">{activeTask.canteenName}</p>
              <p className="text-slate-400 text-[11px]">{activeTask.canteenLocation}</p>
              <p className="text-emerald-400 text-[11px] font-semibold mt-1">
                Items: {activeTask.itemsSummary}
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
              <p className="text-[10px] text-slate-400 font-bold uppercase">2. Drop At Student Location</p>
              <p className="font-bold text-white mt-0.5">{activeTask.dropBlock}</p>
              <p className="text-slate-400 text-[11px]">
                {activeTask.dropRoom} • Landmark: {activeTask.dropLandmark}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700">
                <span className="text-slate-300 font-semibold">{activeTask.customerName}</span>
                <a
                  href={`tel:${activeTask.customerPhone}`}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold flex items-center gap-1 text-[11px]"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Student</span>
                </a>
              </div>
            </div>
          </div>

          {/* Status action buttons */}
          <div className="pt-2">
            {activeTask.status === 'accepted' ? (
              <button
                onClick={() => handlePickup(activeTask.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Picked Up from Canteen Counter</span>
              </button>
            ) : (
              <button
                onClick={() => setCompletingTaskId(activeTask.id)}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Arrived at Block • Complete Delivery with OTP</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* AVAILABLE DELIVERY TASKS FEED */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Available Delivery Tasks ({availableTasks.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Campus Runner Pool</span>
        </div>

        {availableTasks.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            No unclaimed tasks available right now. New campus orders appear here instantly!
          </div>
        ) : (
          <div className="space-y-3">
            {availableTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-white rounded-3xl border border-slate-200 hover:border-blue-400 shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        {task.canteenName}
                      </span>
                      {task.scheduledDeliveryTime && (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          Scheduled: {task.scheduledDeliveryTime}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Drop to: <strong className="text-slate-800">{task.dropBlock}</strong> ({task.dropRoom})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 inline-block">
                      +₹{task.payout}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">~{task.distanceMeters}m walk/ride</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-2xl">
                  <span>Items: </span>
                  <span className="font-semibold text-slate-700">{task.itemsSummary}</span>
                </div>

                <button
                  onClick={() => handleAcceptTask(task.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Bike className="w-4 h-4" />
                  <span>Accept Task (+₹{task.payout})</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Delivery OTP Dialog */}
      {completingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Verify Student Delivery OTP</h3>
              <button
                onClick={() => setCompletingTaskId(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Ask the student for their 4-digit verification OTP (displayed on their CampusBites screen).
            </p>

            {otpError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{otpError}</span>
              </p>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                4-Digit OTP Code
              </label>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="e.g. 4819"
                maxLength={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Proof of delivery photo toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">Proof of Delivery Photo</span>
              </div>
              <button
                type="button"
                onClick={() => setSimulatedPhoto(!simulatedPhoto)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
                  simulatedPhoto
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {simulatedPhoto ? 'Attached ✓' : 'Snap Photo'}
              </button>
            </div>

            <button
              onClick={handleCompleteDelivery}
              disabled={otpInput.length < 4}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              Verify OTP & Complete Delivery (+₹{activeTask?.payout})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
