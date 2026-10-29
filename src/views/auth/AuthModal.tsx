import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Store,
  Bike,
  ShieldCheck,
  Mail,
  User as UserIcon,
  Phone,
  Building,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, demoUsers, switchDemoUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');

  // Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [collegeId, setCollegeId] = useState('');
  const [hostelOrDept, setHostelOrDept] = useState('Aryabhatta Hostel Block B');
  const [room, setRoom] = useState('Room 304');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Student college email domain rule check
    if (role === 'student' && !email.toLowerCase().endsWith('.edu.in')) {
      setError('Students must register with a valid college email domain (e.g., yourname@examplecollege.edu.in)');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email: email.trim(),
        phone: phone.trim() || '+91 98000 00000',
        role,
        collegeId: collegeId.trim(),
        hostelOrDept,
        room,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 text-xs">
        {/* Header */}
        <div className="p-5 bg-gradient-to-tr from-emerald-700 to-green-600 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-extrabold">CampusBites Authentication</h3>
            <p className="text-[11px] text-emerald-100">Apex Institute of Technology</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Fast Demo Switch Banner */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Click Test Personas</span>
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {demoUsers.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  switchDemoUser(u);
                  onClose();
                }}
                className="p-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition-all"
              >
                <p className="font-bold text-slate-900 truncate">{u.name.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-500 capitalize">{u.role}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              className={`pb-2 px-4 transition-colors border-b-2 ${
                !isRegister
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              className={`pb-2 px-4 transition-colors border-b-2 ${
                isRegister
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          {!isRegister ? (
            /* Sign In */
            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. aarav.sharma@examplecollege.edu.in"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="password123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold shadow-sm transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Register */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
              {/* Role selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Your Role</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'student', label: 'Student 🎓' },
                    { id: 'canteen', label: 'Canteen Vendor 🍳' },
                    { id: 'agent', label: 'Delivery Runner 🛵' },
                    { id: 'admin', label: 'College Admin 🛡️' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        role === r.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diya Sengupta"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  College Email {role === 'student' && <span className="text-emerald-700">(@examplecollege.edu.in)</span>}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. diya.s@examplecollege.edu.in"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">College Roll / ID</label>
                  <input
                    type="text"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    placeholder="EC2024-CS-099"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {role === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hostel Block</label>
                    <input
                      type="text"
                      value={hostelOrDept}
                      onChange={(e) => setHostelOrDept(e.target.value)}
                      placeholder="Aryabhatta Block B"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Room No.</label>
                    <input
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="Room 304"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold shadow-sm transition-all"
              >
                {loading ? 'Creating Account...' : 'Complete College Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
