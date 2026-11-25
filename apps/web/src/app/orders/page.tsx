'use client';

import Link from 'next/link';
import { Package, Headphones, Store } from 'lucide-react';
import { useCommerceStore } from '@/store/useCommerceStore';

export default function OrdersPage() {
  const { orders } = useCommerceStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
        <Package className="h-6 w-6 text-orange-600" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-white p-12 text-center">
          <p className="font-semibold text-slate-700">No orders placed yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-xs">
                <div>
                  <span className="font-extrabold text-slate-900">Order #{order.id}</span>
                  <span className="ml-3 text-slate-500">{order.placedAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-700">
                    CONFIRMED • {order.paymentMethod}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {item.title} × {item.qty} ({item.size})
                      </p>
                      <p className="flex items-center gap-1 text-slate-500">
                        <Store className="h-3 w-3" /> Seller: {item.sellerName}
                      </p>
                    </div>
                    <Link
                      href="/support"
                      className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <Headphones className="h-3.5 w-3.5" /> Seller Help
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}