import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User as UserIcon, Loader2, AlertCircle, CheckCircle2, Ticket } from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface AISupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  escalated?: boolean;
}

export const AISupportModal: React.FC<AISupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `Hello ${user ? user.name.split(' ')[0] : 'there'}! I am CampusBot, your college canteen support assistant. How can I help you today? Ask me about order tracking, canteen operating hours, cancellations, or campus delivery policies.`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (quickText?: string) => {
    const textToSend = quickText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!quickText) setInput('');
    setLoading(true);

    try {
      const res = await api.aiSupportAssistant(textToSend);
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: res.reply || 'Thank you for reaching out! A campus administrator has been notified.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        escalated: res.shouldEscalate,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          sender: 'bot',
          text: 'I apologize for the delay. The canteen helpdesk is reachable directly via campus extension #402.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold">CampusBot AI Concierge</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">Instant answers & admin escalation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick FAQ Chips */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
          {[
            'Can I cancel after preparation?',
            'Canteen timings',
            'Delivery fee policy',
            'Cold food refund',
          ].map((faq) => (
            <button
              key={faq}
              onClick={() => handleSend(faq)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-full font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 whitespace-nowrap transition-colors shrink-0"
            >
              {faq}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <div
                  className={`mt-1 text-[10px] flex items-center justify-end ${
                    m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  <span>{m.timestamp}</span>
                </div>

                {m.escalated && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-amber-700 font-bold text-[11px]">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Official Support Ticket Generated</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>CampusBot is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question or issue..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
