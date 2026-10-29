import React from 'react';
import { X, Printer, Download, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import { Order } from '../types/index.ts';

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Campus Cafeteria Tax Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg flex items-center gap-1 text-xs font-semibold"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          {/* Logo & Institute Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  CB
                </div>
                <span className="text-base font-extrabold text-slate-900">CampusBites</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Apex Institute of Technology</p>
              <p className="text-[11px] text-slate-500">Student Cafeteria Operations</p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                PAID INVOICE
              </span>
              <p className="font-mono font-bold text-slate-900 mt-1">#{order.id}</p>
              <p className="text-[10px] text-slate-500">
                {new Date(order.placedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Student & Vendor Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Billed To (Student)
              </p>
              <p className="font-bold text-slate-900">{order.userName}</p>
              <p className="text-slate-600">{order.userEmail}</p>
              <p className="text-slate-600">{order.userPhone}</p>
              <p className="text-slate-600 mt-1">
                📍 {order.deliveryAddress.block}, {order.deliveryAddress.room}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Canteen Vendor
              </p>
              <p className="font-bold text-slate-900">{order.canteenName}</p>
              <p className="text-slate-600">GSTIN: 07AACCA1234F1Z9</p>
              <p className="text-slate-600">FSSAI Lic: 10020011000492</p>
              <p className="text-slate-600 mt-1">
                Payment: {order.paymentMethod.toUpperCase()} (TXN: {order.transactionId.slice(-8)})
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1.5">
              <span className="col-span-7">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-right">Amount</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-xs py-1.5 border-b border-slate-100 items-center">
                <div className="col-span-7">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  {item.customizations?.size && (
                    <p className="text-[10px] text-slate-500">Size: {item.customizations.size}</p>
                  )}
                  {item.customizations?.extras && item.customizations.extras.length > 0 && (
                    <p className="text-[10px] text-slate-500">
                      Extras: {item.customizations.extras.join(', ')}
                    </p>
                  )}
                </div>
                <span className="col-span-2 text-center text-slate-700 font-semibold">{item.quantity}</span>
                <span className="col-span-3 text-right font-bold text-slate-900">
                  ₹{item.unitPrice * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Item Subtotal</span>
              <span className="font-semibold text-slate-900">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Campus Delivery Charge</span>
              <span className="font-semibold text-slate-900">
                {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>5% GST (Campus Food Concession)</span>
              <span className="font-semibold text-slate-900">₹{order.taxes}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Voucher Savings</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Paid</span>
              <span className="text-emerald-700">₹{order.total}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 text-center leading-relaxed">
            This is a computer-generated digital tax receipt for college campus canteen services.
            No physical signature is required. For disputes, refer to Campus Order ID #{order.id}.
          </div>
        </div>
      </div>
    </div>
  );
};
