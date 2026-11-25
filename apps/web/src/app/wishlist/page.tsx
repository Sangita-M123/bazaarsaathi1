'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { ProductCard } from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useUiStore();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <Heart className="h-6 w-6 fill-rose-500 text-rose-500" /> Your Saved Wishlist
      </h1>
      {wishlist.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-white p-12 text-center">
          <p className="text-slate-600">No items saved yet. Tap the heart icon or ask Voice Dukaandar!</p>
          <Link href="/" className="mt-4 inline-block rounded-xl bg-orange-600 px-5 py-2 text-sm font-bold text-white">
            Explore Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}