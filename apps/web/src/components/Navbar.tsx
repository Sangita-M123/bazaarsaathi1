'use client';

import Link from 'next/link';
import { useUiStore } from '@/store/useUiStore';
import {
  ShoppingBag,
  Heart,
  Wallet,
  Mic,
  Headphones,
  Accessibility,
  Store,
  User,
} from 'lucide-react';

export function Navbar() {
  const { cart, wishlist, easyMode, toggleEasyMode, setVoiceOpen, user } = useUiStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Bazaar<span className="text-orange-600">Saathi</span>
            </span>
            <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
              Aapki Apni Dukaan • Voice & Try-On
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Accessibility Mode for Parents / Differently-abled */}
          <button
            onClick={toggleEasyMode}
            title="Toggle Elder & Accessibility Friendly View"
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              easyMode
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Accessibility className="h-4 w-4" />
            <span className="hidden md:inline">{easyMode ? 'Easy Mode: ON' : 'Easy Mode'}</span>
          </button>

          {/* Voice Dukaandar Trigger */}
          <button
            onClick={() => setVoiceOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            <Mic className="h-4 w-4 animate-pulse" />
            <span className="hidden sm:inline">Talk to Dukaandar</span>
          </button>

          <Link
            href="/gullak"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-orange-700"
          >
            <Wallet className="h-4 w-4 text-amber-600" />
            <span className="hidden lg:inline">Gullak</span>
          </Link>

          <Link
            href="/support"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-orange-700"
          >
            <Headphones className="h-4 w-4 text-indigo-600" />
            <span className="hidden lg:inline">Seller Help</span>
          </Link>

          <Link
            href="/wishlist"
            className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href={user ? '/seller' : '/login'}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{user ? user.name.split(' ')[0] : 'Sign In'}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}