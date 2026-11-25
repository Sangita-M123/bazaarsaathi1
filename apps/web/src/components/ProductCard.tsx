'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Sparkles, Star, Store } from 'lucide-react';
import { Product } from '@/types';
import { useUiStore } from '@/store/useUiStore';

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist, addToCart, setTryOnProduct, easyMode } = useUiStore();
  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
     <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
  <Link href={`/products/${product.slug}`} className="block h-full w-full">
    <div className="relative h-full w-full">
      <Image
        src={product.imageUrl}
        alt={product.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition duration-300 group-hover:scale-105"
      />
    </div>
  </Link>


        <button
          onClick={() => toggleWishlist(product)}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`}
          />
        </button>

        {product.tryOnSupported && (
          <button
            onClick={() => setTryOnProduct(product)}
            className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur transition hover:bg-orange-600"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Try On Me
          </button>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium text-orange-700">
            <Store className="h-3 w-3" /> {product.sellerName}
          </span>
          <span className="flex items-center gap-0.5 font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {product.rating}
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className={`line-clamp-2 font-semibold text-slate-900 hover:text-orange-600 ${
            easyMode ? 'text-lg' : 'text-sm'
          }`}
        >
          {product.title}
        </Link>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
          <span className="rounded bg-slate-100 px-2 py-0.5 capitalize">{product.color}</span>
          {product.fabric && (
            <span className="rounded bg-slate-100 px-2 py-0.5 capitalize">{product.fabric}</span>
          )}
          <span className="rounded bg-slate-100 px-2 py-0.5">
            Sizes: {product.sizes.slice(0, 3).join(', ')}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <span className={`font-bold text-slate-900 ${easyMode ? 'text-xl' : 'text-lg'}`}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="ml-1.5 text-xs text-slate-400 line-through">
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            className={`flex items-center gap-1.5 rounded-xl bg-slate-900 font-semibold text-white transition hover:bg-orange-600 ${
              easyMode ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-xs'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}