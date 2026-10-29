import React, { useState } from 'react';
import { X, MapPin, Check, Plus, Building, Home, BookOpen, Dumbbell } from 'lucide-react';
import { Address } from '../types/index.ts';

interface CampusLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  currentAddress: Address | null;
  onSelectAddress: (addr: Address) => void;
  onAddNewAddress: (addr: Partial<Address>) => Promise<void>;
}

export const CampusLocationModal: React.FC<CampusLocationModalProps> = ({
  isOpen,
  onClose,
  addresses,
  currentAddress,
  onSelectAddress,
  onAddNewAddress,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState('Hostel Room');
  const [block, setBlock] = useState('Aryabhatta Hostel Block B');
  const [room, setRoom] = useState('Room 304');
  const [landmark, setLandmark] = useState('');
  const [type, setType] = useState<Address['locationType']>('Hostel');

  if (!isOpen) return null;

  const getLocationIcon = (t: string) => {
    switch (t) {
      case 'Hostel':
        return <Home className="w-4 h-4 text-emerald-600" />;
      case 'Library':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'Sports':
        return <Dumbbell className="w-4 h-4 text-amber-600" />;
      default:
        return <Building className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddNewAddress({ label, block, room, landmark, locationType: type });
    setShowAdd(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Campus Delivery Location</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-slate-800">
          {showAdd ? (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Add Campus Location</span>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Campus Zone</label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Aryabhatta Hostel Block A">Aryabhatta Hostel Block A</option>
                  <option value="Aryabhatta Hostel Block B">Aryabhatta Hostel Block B</option>
                  <option value="Kalpana Chawla Girls Hostel">Kalpana Chawla Girls Hostel</option>
                  <option value="Central Library & Reading Pavilions">Central Library</option>
                  <option value="Ramanujan Academic Block">Ramanujan Academic Block</option>
                  <option value="Science & Technology Lab Complex">Science & Tech Complex</option>
                  <option value="Sports Arena & Gymnasium">Sports Arena</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Label (e.g. Lab 402)"
                  required
                  className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Room / Floor"
                  className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Nearby Landmark (e.g. Water cooler)"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs"
              />

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                Save & Set Location
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full p-3 rounded-2xl border border-dashed border-slate-300 text-slate-600 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Campus Room / Landmark</span>
            </button>
          )}

          <div className="space-y-2 pt-1">
            {addresses.map((addr) => {
              const isSelected = currentAddress?.id === addr.id;
              return (
                <button
                  key={addr.id}
                  onClick={() => {
                    onSelectAddress(addr);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getLocationIcon(addr.locationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{addr.label}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {addr.locationType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate">{addr.block}</p>
                    {addr.room && (
                      <p className="text-[11px] text-slate-500 truncate">
                        {addr.room} {addr.landmark && `• ${addr.landmark}`}
                      </p>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
