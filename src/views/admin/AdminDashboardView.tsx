import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BarChart3,
  Users,
  Store,
  Bike,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Tag,
  Search,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { Order, User, Canteen, SupportTicket, DeliveryTask } from '../../types/index.ts';

export const AdminDashboardView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-tabs: 'overview' | 'all-orders' | 'canteens-fleet' | 'disputes'
  const [adminTab, setAdminTab] = useState<'overview' | 'all-orders' | 'canteens-fleet' | 'disputes'>('overview');

  // Filters for orders table
  const [statusFilter, setStatusFilter] = useState('All');
  const [canteenFilter, setCanteenFilter] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Reassign agent modal
  const [selectedOrderForAgent, setSelectedOrderForAgent] = useState<Order | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Refund modal
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const loadAdminData = () => {
    Promise.all([
      api.getAdminAnalytics(),
      api.getOrders(),
      api.getDemoUsers(),
      api.getCanteens(),
      api.getSupportTickets(),
    ])
      .then(([aRes, oRes, uRes, cRes, tRes]) => {
        setAnalytics(aRes);
        setOrders(oRes.orders);
        setUsers(uRes.users);
        setCanteens(cRes.canteens);
        setTickets(tRes.tickets);
      })
      .catch((e) => console.error('Admin fetch failed:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResetSeed = async () => {
    if (!window.confirm('Reset all campus database data to clean demo state?')) return;
    try {
      await api.adminResetDemoData();
      alert('Campus database successfully reset to clean seed state!');
      loadAdminData();
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedOrderForAgent || !selectedAgentId) return;
    try {
      await api.adminAssignAgent(selectedOrderForAgent.id, selectedAgentId);
      setSelectedOrderForAgent(null);
      loadAdminData();
    } catch (e) {
      console.error('Failed to assign agent:', e);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedOrderForRefund) return;
    try {
      await api.adminRefund(selectedOrderForRefund.id, Number(refundAmount) || selectedOrderForRefund.total, refundReason);
      setSelectedOrderForRefund(null);
      setRefundAmount('');
      setRefundReason('');
      loadAdminData();
    } catch (e) {
      console.error('Failed to process refund:', e);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await api.updateSupportTicket(ticketId, { status: 'resolved' });
      loadAdminData();
    } catch (e) {
      console.error('Failed to resolve ticket:', e);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs space-y-2">
        <Clock className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        <p>Loading College Admin Console...</p>
      </div>
    );
  }

  const agents = users.filter((u) => u.role === 'agent');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (canteenFilter !== 'All' && o.canteenId !== canteenFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        o.canteenName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-24 text-slate-800">
      {/* Top Admin Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">College Canteen Administration</h1>
              <span className="text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
                Dean Student Welfare
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Apex Institute of Technology • Full-Campus Foodtech Control
            </p>
          </div>
        </div>

        <button
          onClick={handleResetSeed}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Campus KPIs & Heatmap', icon: BarChart3 },
          { id: 'all-orders', label: 'All Campus Orders', icon: Clock, count: orders.length },
          { id: 'canteens-fleet', label: 'Canteens & Fleet', icon: Store, count: canteens.length },
          { id: 'disputes', label: 'Disputes & Tickets', icon: MessageSquare, count: tickets.filter((t) => t.status === 'open').length },
        ].map((tab) => {
          const isActive = adminTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
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

      {/* TAB 1: OVERVIEW & HEATMAP */}
      {adminTab === 'overview' && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Campus Orders
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{analytics.kpis.totalOrders}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                {analytics.kpis.completedOrders} completed
              </p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Gross Campus Revenue
              </span>
              <p className="text-xl font-black text-emerald-700 mt-1">₹{analytics.kpis.totalRevenue}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Across 3 canteens</p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Avg Delivery Time
              </span>
              <p className="text-xl font-black text-blue-700 mt-1">
                {analytics.kpis.avgDeliveryMinutes} mins
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Canteen to hostel room</p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cancellation Rate
              </span>
              <p className="text-xl font-black text-rose-600 mt-1">
                {analytics.kpis.cancellationRate}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Pre-prep student cancels</p>
            </div>
          </div>

          {/* Peak Hours Heatmap Chart */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Campus Dining Peak-Hour Heatmap
                </h3>
                <p className="text-xs text-slate-500">Hourly order load distribution across campus</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                00:00 - 23:00 Hrs
              </span>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 pt-2">
              {analytics.hourlyHeatmap.map((h: any, i: number) => {
                const isLunch = i >= 12 && i <= 14;
                const isDinner = i >= 20 && i <= 22;
                const isNight = i >= 23 || i <= 2;
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      h.orders > 0 || isLunch || isDinner
                        ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <p className="text-[9px] font-mono">{h.hour}</p>
                    <p className="text-xs font-extrabold mt-0.5">
                      {h.orders > 0 ? h.orders : isLunch ? '5' : isDinner ? '4' : '0'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canteen Performance Breakdown */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Canteen Performance & Kitchen Load
            </h3>

            <div className="space-y-3">
              {analytics.canteenStats.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-extrabold text-slate-900">{c.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Rating: {c.rating} ★ • Active Rush Capacity: {c.rushCapacityPercent}%
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-emerald-800 text-sm">₹{c.revenue}</p>
                    <p className="text-[10px] text-slate-400">{c.ordersCount} orders processed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL CAMPUS ORDERS TABLE & ASSIGNMENT */}
      {adminTab === 'all-orders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap items-center gap-3 shadow-xs text-xs">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search Order ID, student, or canteen..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <select
              value={canteenFilter}
              onChange={(e) => setCanteenFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="All">All Canteens</option>
              {canteens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="agent_assigned">Agent Assigned</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Order</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Canteen</th>
                    <th className="p-3.5">Drop Block</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 font-mono">
                        #{o.id}
                        {o.orderType === 'scheduled' && (
                          <span className="block text-[9px] text-purple-700 font-sans font-semibold">
                            Scheduled: {o.scheduledFor}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{o.userName}</p>
                        <p className="text-[10px] text-slate-400">{o.userPhone}</p>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700 truncate max-w-[140px]">
                        {o.canteenName}
                      </td>
                      <td className="p-3.5 text-slate-600 truncate max-w-[140px]">
                        {o.deliveryAddress.block}
                      </td>
                      <td className="p-3.5 font-black text-slate-900">₹{o.total}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            o.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedOrderForAgent(o);
                              setSelectedAgentId(agents[0]?.id || '');
                            }}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors"
                            title="Assign or reassign delivery runner"
                          >
                            Assign Agent
                          </button>

                          <button
                            onClick={() => {
                              setSelectedOrderForRefund(o);
                              setRefundAmount(o.total.toString());
                            }}
                            className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[11px] font-bold transition-colors"
                            title="Process wallet refund"
                          >
                            Refund
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CANTEENS & FLEET */}
      {adminTab === 'canteens-fleet' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Campus Delivery Runner Fleet ({agents.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">{ag.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {ag.collegeId} • {ag.agentDetails?.vehicleType}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Location: {ag.agentDetails?.currentCampusLocation}</span>
                    <span className="font-bold text-emerald-700">Wallet: ₹{ag.walletBalance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              College Canteens ({canteens.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {canteens.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-12 h-12 rounded-2xl object-cover"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900">{c.name}</h4>
                      <p className="text-[11px] text-slate-500">{c.openingTime} - {c.closingTime}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">Rating: {c.rating} ★</span>
                    <span className="font-bold text-purple-700">Rush: {c.rushCapacityPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DISPUTES & SUPPORT TICKETS */}
      {adminTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Student Complaints & Escalations ({tickets.length})
              </h2>
              <p className="text-xs text-slate-500">AI-screened support tickets with draft resolutions</p>
            </div>
          </div>

          <div className="space-y-3">
            {tickets.map((tick) => (
              <div
                key={tick.id}
                className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">#{tick.id}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          tick.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tick.status}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        Priority: {tick.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{tick.subject}</h4>
                    <p className="text-slate-600 mt-0.5">{tick.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Submitted by {tick.userName} ({tick.userEmail}) • {new Date(tick.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {tick.aiDraftResponse && (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                    <p className="font-bold text-purple-900 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Gemini AI Drafted Resolution Note</span>
                    </p>
                    <p className="text-purple-800 text-[11px] italic leading-relaxed">
                      "{tick.aiDraftResponse}"
                    </p>
                  </div>
                )}

                {tick.status !== 'resolved' && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleResolveTicket(tick.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-xs"
                    >
                      Approve & Mark Resolved ✓
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Agent Assign Modal */}
      {selectedOrderForAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 border border-slate-100 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Assign Runner to Order #{selectedOrderForAgent.id}
              </h3>
              <button
                onClick={() => setSelectedOrderForAgent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              Canteen: <strong>{selectedOrderForAgent.canteenName}</strong> → Drop:{' '}
              <strong>{selectedOrderForAgent.deliveryAddress.block}</strong>
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Available Runner</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.agentDetails?.vehicleType} • {a.agentDetails?.currentCampusLocation})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAssignAgent}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              Confirm Runner Assignment
            </button>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {selectedOrderForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 border border-slate-100 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Credit Wallet Refund for #{selectedOrderForRefund.id}
              </h3>
              <button
                onClick={() => setSelectedOrderForRefund(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              Student: <strong>{selectedOrderForRefund.userName}</strong> • Order Total: ₹{selectedOrderForRefund.total}
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Refund Amount (₹ INR)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Reason / Notes</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Food arrived cold due to rain delay"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              onClick={handleProcessRefund}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-xl font-bold shadow-sm"
            >
              Approve & Credit to Campus Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
