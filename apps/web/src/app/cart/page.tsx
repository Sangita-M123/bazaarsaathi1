'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Wallet, CreditCard, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { useCommerceStore } from '@/store/useCommerceStore';

export default function CartPage() {
  const { cart, updateCartQty, clearCart } = useUiStore();
  const { availableBalance, recordOrder } = useCommerceStore();
  const [paymentMethod, setPaymentMethod] = useState<'GULLAK' | 'UPI_TEST'>('GULLAK');
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    const items = cart.map((c) => ({
      title: c.product.title,
      qty: c.quantity,
      price: c.product.price,
      size: c.size,
      sellerName: c.product.sellerName,
    }));
    const res = recordOrder(items, total, paymentMethod);
    setStatusMsg({ ok: res.ok, text: res.message });
    if (res.ok) clearCart();
  };

  if (statusMsg?.ok) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{statusMsg.text}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Need help after delivery? Each item connects directly to its Seller’s Help Center!
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
            Continue Shopping
          </Link>
          <Link href="/support" className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold">
            Seller Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <ShoppingBag className="h-6 w-6 text-orange-600" /> Your Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-white p-12 text-center">
          <p className="text-lg font-semibold text-slate-700">Aapka cart abhi khali hai</p>
          <Link href="/" className="mt-4 inline-block rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
              >
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-600">{item.product.sellerName}</p>
                  <p className="font-bold text-slate-900">{item.product.title}</p>
                  <p className="text-xs text-slate-500">Size: {item.size}</p>
                  <p className="mt-1 font-extrabold text-slate-900">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQty(item.product.id, item.size, item.quantity - 1)}
                    className="h-8 w-8 rounded-lg border font-bold"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQty(item.product.id, item.size, item.quantity + 1)}
                    className="h-8 w-8 rounded-lg border font-bold"
                  >
                    +
                  </button>
                  <button
                    onClick={() => updateCartQty(item.product.id, item.size, 0)}
                    className="ml-2 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Checkout Summary</h2>
            <div className="mt-4 flex justify-between border-b pb-3 text-sm">
              <span>Order Total</span>
              <span className="font-extrabold">₹{total.toLocaleString('en-IN')}</span>
            </div>

            <p className="mt-4 text-xs font-bold uppercase text-slate-500">Payment Method</p>
            <div className="mt-2 space-y-2">
              <button
                onClick={() => setPaymentMethod('GULLAK')}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs ${
                  paymentMethod === 'GULLAK' ? 'border-orange-600 bg-orange-50' : 'border-slate-200'
                }`}
              >
                <span className="flex items-center gap-2 font-bold">
                  <Wallet className="h-4 w-4 text-orange-600" /> Shopping Gullak
                </span>
                <span className="font-semibold text-slate-600">
                  Bal: ₹{availableBalance.toLocaleString('en-IN')}
                </span>
              </button>

              <button
                onClick={() => setPaymentMethod('UPI_TEST')}
                className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left text-xs font-bold ${
                  paymentMethod === 'UPI_TEST' ? 'border-orange-600 bg-orange-50' : 'border-slate-200'
                }`}
              >
                <CreditCard className="h-4 w-4 text-indigo-600" /> UPI / Card (Test Mode)
              </button>
            </div>

            {statusMsg && !statusMsg.ok && (
              <p className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700">
                {statusMsg.text}
              </p>
            )}

            <button
              onClick={handleCheckout}
              className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Confirm & Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}