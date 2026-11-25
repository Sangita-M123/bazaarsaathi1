'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Headphones, PhoneCall, ShieldAlert, Send, Store, PhoneOff, Mic } from 'lucide-react';
import { useCommerceStore } from '@/store/useCommerceStore';

function SupportWorkspace() {
  const searchParams = useSearchParams();
  const initialTicketId = searchParams.get('ticket');
  const { tickets, addTicketMessage, updateTicketStatus } = useCommerceStore();

  const [activeId, setActiveId] = useState(initialTicketId || tickets[0]?.id || '');
  const [msg, setMsg] = useState('');
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    if (initialTicketId) setActiveId(initialTicketId);
  }, [initialTicketId]);

  const activeTicket = tickets.find((t) => t.id === activeId) || tickets[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !activeTicket) return;
    const text = msg.trim();
    addTicketMessage(activeTicket.id, 'CUSTOMER', text);
    setMsg('');

    // Seller-Scoped AI response (connects to per-seller pgvector RAG in Phase 5)
    setTimeout(() => {
      if (activeTicket.status === 'AI_HANDLING') {
        const lower = text.toLowerCase();
        const isComplex = lower.includes('broken') || lower.includes('kharab') || lower.includes('refund') || lower.includes('call');
        if (isComplex) {
          addTicketMessage(
            activeTicket.id,
            'SELLER_AI',
            `Main samajh sakta hoon ye urgent issue hai. Main aapki request directly ${activeTicket.sellerName} ke Seller Desk par escalate kar raha hoon—aap chahein to upar "Request Seller Live Call" bhi dabaa sakte hain!`
          );
          updateTicketStatus(activeTicket.id, 'ESCALATED_TO_SELLER');
        } else {
          addTicketMessage(
            activeTicket.id,
            'SELLER_AI',
            `[${activeTicket.sellerName} Policy]: Humare products par 7-day easy replacement aur direct seller warranty support available hai. Agar problem continue ho to "Escalate to Seller" click karein!`
          );
        }
      } else if (activeTicket.status === 'ESCALATED_TO_SELLER') {
        addTicketMessage(
          activeTicket.id,
          'SELLER_HUMAN',
          `[${activeTicket.sellerName} Owner]: Ji namaste! Humne aapka ticket dekh liya hai, technician / replacement team aapko 2 ghante me update degi.`
        );
      } else if (activeTicket.status === 'ESCALATED_TO_PLATFORM') {
        addTicketMessage(
          activeTicket.id,
          'PLATFORM_ADMIN',
          `[BazaarSaathi Central Support]: Humne aapke aur ${activeTicket.sellerName} ke beech priority mediation start kar di hai. 100% Buyer Protection active hai.`
        );
      }
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          <Headphones className="h-7 w-7 text-indigo-600" /> Per-Seller Dedicated Help Center
        </h1>
        <p className="text-sm text-slate-600">
          Each seller resolves issues for their own products—with instant escalation to Seller Live Call or BazaarSaathi Central Support.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ticket List */}
        <div className="space-y-3">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                activeTicket?.id === t.id
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-bold text-indigo-700">
                  <Store className="h-3.5 w-3.5" /> {t.sellerName}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                  {t.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-900">{t.productTitle}</p>
            </button>
          ))}
        </div>

        {/* Active Ticket Chat + Escalation Controls */}
        {activeTicket && (
          <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-5 py-3.5">
              <div>
                <p className="text-sm font-extrabold text-slate-900">{activeTicket.sellerName}</p>
                <p className="text-xs text-slate-500">Product: {activeTicket.productTitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    updateTicketStatus(activeTicket.id, 'IN_LIVE_CALL');
                    setInCall(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Seller Live Call
                </button>
                <button
                  onClick={() => {
                    updateTicketStatus(activeTicket.id, 'ESCALATED_TO_PLATFORM');
                    addTicketMessage(
                      activeTicket.id,
                      'PLATFORM_ADMIN',
                      'Ticket escalated to BazaarSaathi Central Help Center. Senior mediator assigned!'
                    );
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  <ShieldAlert className="h-3.5 w-3.5" /> Escalate to Platform
                </button>
              </div>
            </div>

            {inCall && (
              <div className="flex items-center justify-between bg-emerald-900 px-5 py-3 text-white">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 animate-pulse text-emerald-300" />
                  <div>
                    <p className="text-xs font-bold">WebRTC Audio Call Connected with {activeTicket.sellerName}</p>
                    <p className="text-[11px] text-emerald-200">Peer-to-peer encrypted audio channel active</p>
                  </div>
                </div>
                <button
                  onClick={() => setInCall(false)}
                  className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold"
                >
                  <PhoneOff className="h-3.5 w-3.5" /> End Call
                </button>
              </div>
            )}

            <div className="h-80 space-y-3 overflow-y-auto p-5">
              {activeTicket.messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'CUSTOMER' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'CUSTOMER'
                        ? 'bg-slate-900 text-white'
                        : m.sender === 'PLATFORM_ADMIN'
                        ? 'border border-rose-200 bg-rose-50 text-rose-950'
                        : 'border border-indigo-100 bg-indigo-50 text-slate-800'
                    }`}
                  >
                    <p className="mb-0.5 text-[10px] font-bold uppercase opacity-60">{m.sender.replace('_', ' ')}</p>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
              <input
                type="text"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder='Ask about warranty, TV installation, return, or type "TV screen broken"...'
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading Help Center...</div>}>
      <SupportWorkspace />
    </Suspense>
  );
}