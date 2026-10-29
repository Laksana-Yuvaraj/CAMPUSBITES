import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Bike, Store, Home, Compass, Shield } from 'lucide-react';

interface CampusMapSimulationProps {
  canteenName?: string;
  dropBlock?: string;
  agentName?: string;
  status: string; // 'placed' | 'accepted' | 'preparing' | 'ready_for_pickup' | 'agent_assigned' | 'out_for_delivery' | 'delivered'
  etaMinutes?: number;
}

export const CampusMapSimulation: React.FC<CampusMapSimulationProps> = ({
  canteenName = 'Aryabhatta Central Canteen',
  dropBlock = 'Aryabhatta Hostel Block B',
  agentName = 'Karan Mehra',
  status,
  etaMinutes = 10,
}) => {
  // Simulate animated agent progress along the pathway (0% to 100%)
  const [progress, setProgress] = useState(
    status === 'delivered' ? 100 : status === 'out_for_delivery' ? 55 : status === 'agent_assigned' ? 25 : 10
  );

  useEffect(() => {
    if (status === 'out_for_delivery') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) return 92;
          return prev + 2;
        });
      }, 1500);
      return () => clearInterval(interval);
    } else if (status === 'delivered') {
      setProgress(100);
    }
  }, [status]);

  // Coordinates on SVG canvas 400 x 200
  // Canteen: SAC (x: 60, y: 140)
  // Student Drop: Hostel/Block (x: 340, y: 60)
  // Pathway curved spline
  const canteenX = 65;
  const canteenY = 140;
  const dropX = 335;
  const dropY = 65;

  // Calculate current agent position along path based on progress
  const t = progress / 100;
  const agentX = Math.round((1 - t) * canteenX + t * dropX);
  const agentY = Math.round(
    (1 - t) * (1 - t) * canteenY + 2 * (1 - t) * t * 160 + t * t * dropY
  );

  return (
    <div className="w-full bg-slate-900 rounded-3xl p-4 text-white shadow-xl relative overflow-hidden border border-slate-800">
      {/* Background Campus Grid & Aesthetic Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Map Header */}
      <div className="relative z-10 flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Live Campus GPS Radar
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/90 px-2.5 py-1 rounded-full border border-slate-700">
          {status === 'delivered'
            ? 'Delivered'
            : status === 'out_for_delivery'
            ? `Arriving in ~${etaMinutes} mins`
            : status === 'ready_for_pickup'
            ? 'Ready at counter'
            : 'Kitchen preparing'}
        </span>
      </div>

      {/* Interactive Map Visual SVG */}
      <div className="relative w-full h-44 bg-slate-950/70 rounded-2xl border border-slate-800 p-2 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Campus Roads and pathways */}
          <path
            d="M 20 170 L 380 170"
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 190 20 L 190 180"
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 50 40 L 350 40"
            stroke="#1e293b"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Active Delivery Route Pathway (Green glowing spline) */}
          <path
            d={`M ${canteenX} ${canteenY} Q 200 160 ${dropX} ${dropY}`}
            stroke="#064e3b"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${canteenX} ${canteenY} Q 200 160 ${dropX} ${dropY}`}
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="6 4"
            strokeLinecap="round"
            fill="none"
            className="animate-pulse"
          />

          {/* Campus Landmarks */}
          {/* Central Library */}
          <rect x="160" y="80" width="60" height="32" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <text x="190" y="100" fill="#94a3b8" fontSize="8" fontWeight="600" textAnchor="middle">
            Central Library
          </text>

          {/* Academic Block */}
          <rect x="250" y="110" width="70" height="28" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <text x="285" y="128" fill="#94a3b8" fontSize="8" fontWeight="600" textAnchor="middle">
            Academic Quad
          </text>

          {/* Sports Complex */}
          <circle cx="80" cy="50" r="18" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <text x="80" y="53" fill="#94a3b8" fontSize="7" fontWeight="600" textAnchor="middle">
            Arena
          </text>

          {/* Canteen Origin Node */}
          <g transform={`translate(${canteenX}, ${canteenY})`}>
            <circle r="14" fill="#047857" />
            <circle r="8" fill="#10b981" />
            <circle r="3" fill="#ffffff" />
          </g>

          {/* Student Drop Node */}
          <g transform={`translate(${dropX}, ${dropY})`}>
            <circle r="14" fill="#1d4ed8" />
            <circle r="8" fill="#3b82f6" />
            <circle r="3" fill="#ffffff" />
          </g>

          {/* Animated Agent Moving Icon */}
          {(status === 'out_for_delivery' || status === 'agent_assigned') && (
            <g transform={`translate(${agentX}, ${agentY})`} className="transition-all duration-700 ease-out">
              <circle r="12" fill="#e11d48" className="animate-ping opacity-60" />
              <circle r="10" fill="#f43f5e" />
              <circle r="4" fill="#ffffff" />
            </g>
          )}
        </svg>

        {/* Canteen Label Callout */}
        <div
          className="absolute text-[10px] bg-slate-900/90 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/40 font-medium shadow-md flex items-center gap-1 pointer-events-none"
          style={{ left: `${canteenX - 10}px`, top: `${canteenY - 28}px` }}
        >
          <Store className="w-3 h-3 text-emerald-400" />
          <span className="truncate max-w-[110px]">{canteenName}</span>
        </div>

        {/* Drop Location Label Callout */}
        <div
          className="absolute text-[10px] bg-slate-900/90 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/40 font-medium shadow-md flex items-center gap-1 pointer-events-none"
          style={{ right: '16px', top: '14px' }}
        >
          <Home className="w-3 h-3 text-blue-400" />
          <span className="truncate max-w-[120px]">{dropBlock}</span>
        </div>

        {/* Agent Label Callout */}
        {status === 'out_for_delivery' && (
          <div
            className="absolute text-[10px] bg-rose-950/90 text-rose-200 px-2 py-0.5 rounded-md border border-rose-500/50 font-semibold shadow-md flex items-center gap-1 transition-all duration-700 pointer-events-none"
            style={{ left: `${agentX - 30}px`, top: `${agentY - 30}px` }}
          >
            <Bike className="w-3 h-3 text-rose-400" />
            <span>{agentName}</span>
          </div>
        )}
      </div>

      {/* Route Info Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>Campus Pathway Speed: ~18 km/h</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Restricted Campus Fleet</span>
        </div>
      </div>
    </div>
  );
};
