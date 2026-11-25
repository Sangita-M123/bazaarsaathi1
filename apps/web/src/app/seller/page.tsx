'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Store, FileText, PhoneCall, Upload, CheckCircle2 } from 'lucide-react';
import { useCommerceStore } from '@/store/useCommerceStore';

export default function SellerDashboardPage() {
  const { tickets, updateTicketStatus, addTicketMessage } = useCommerceStore();
  const [docs, setDocs] = useState([
    { id: 'd1', name: 'VisionPro_4K_TV_Warranty_Policy.pdf', type: 'WARRANTY', chunks: 24 },
    { id: 'd2', name: 'Jaipur_Vastra_Fabric_Care_Returns.pdf', type: 'RETURN_POLICY', chunks: 14 },
  ]);
  const [uploadedMsg, setUploadedMsg] = useState('');

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocs((d) => [
      { id: `d-${Date.now()}`, name: file.name, type: 'MANUAL', chunks: 18 },
      ...d,
    ]);
    setUploadedMsg(`"${file.name}" queued for S3 upload & pgvector RAG indexing!`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <Store className="h-7 w-7 text-orange-600" /> Seller Control & AI Support Desk
          </h1>
          <p className="text-sm text-slate-600">
            Manage your store’s private RAG knowledge base and answer escalated customer tickets & live calls.
          </p>
        </div>
        <Link
          href="/support"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
        >
          Open Customer Support View
        </Link>
      </div>

      {uploadedMsg && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {uploadedMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Per-Seller RAG Knowledge Docs */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Seller AI Knowledge Base (RAG)</h2>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600">
              <Upload className="h-3.5 w-3.5" /> Upload PDF
              <input type="file" accept=".pdf,.txt" onChange={handleDocUpload} className="hidden" />
            </label>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Strictly isolated per seller_id in pgvector so your AI answers using only your policies.
          </p>

          <div className="mt-4 space-y-3">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-2xl border bg-slate-50 p-3.5">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {doc.type} • {doc.chunks} vector chunks indexed
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Escalated Customer Tickets */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Incoming Customer Escalations</h2>
          <div className="mt-4 space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-indigo-700">{t.sellerName}</p>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    {t.status}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-900">{t.productTitle}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      updateTicketStatus(t.id, 'IN_LIVE_CALL');
                      addTicketMessage(
                        t.id,
                        'SELLER_HUMAN',
                        'Seller joined live! Namaste, hum aapka issue turant solve kar rahe hain.'
                      );
                    }}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <PhoneCall className="h-3.5 w-3.5" /> Join Live Call
                  </button>
                  <button
                    onClick={() => updateTicketStatus(t.id, 'RESOLVED')}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}