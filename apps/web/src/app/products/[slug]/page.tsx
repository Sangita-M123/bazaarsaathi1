'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Headphones,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { useUiStore } from '@/store/useUiStore';
import { useCommerceStore } from '@/store/useCommerceStore';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { setViewingProduct, addToCart, toggleWishlist, wishlist, setTryOnProduct } = useUiStore();
  const { openOrCreateSellerTicket } = useCommerceStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    productService.getBySlug(slug).then((p) => {
      if (active) {
        setProduct(p);
        setSelectedSize(p?.sizes[0] || 'FREE');
        setViewingProduct(p); // Syncs with Voice Dukaandar!
        setLoading(false);
      }
    });
    return () => {
      active = false;
      setViewingProduct(null);
    };
  }, [slug, setViewingProduct]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-6 w-1/3 rounded bg-slate-200" />
            <div className="h-28 w-full rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-xl font-bold">Product not found</p>
        <button onClick={() => router.push('/')} className="mt-4 text-orange-600 underline">
          Back to Store
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.some((p) => p.id === product.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </button>

      <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
          <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
          {product.tryOnSupported && (
            <button
              onClick={() => setTryOnProduct(product)}
              className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-orange-600"
            >
              <Sparkles className="h-4 w-4 text-amber-300" /> Try On Me Virtually
            </button>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              <Store className="h-3.5 w-3.5" /> Sold by {product.sellerName}
            </span>
            <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {product.rating} ({product.reviewCount})
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">{product.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.description}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-base text-slate-400 line-through">
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Size Picker */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase text-slate-700">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                    selectedSize === size
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Specs Table */}
          {product.specs && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase text-slate-500">Product Highlights</p>
              <dl className="grid grid-cols-2 gap-y-2 text-xs">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-semibold text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                addToCart(product, selectedSize);
                router.push('/cart');
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-orange-700"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-semibold hover:bg-slate-50"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Seller-Specific Help Center CTA */}
          <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Direct Seller Help ({product.sellerName})
                </p>
                <p className="mt-1 text-xs text-indigo-700">
                  No generic platform bot! Ask {product.sellerName}’s dedicated AI or escalate to a live seller call.
                </p>
              </div>
              <button
                onClick={() => {
                  const ticketId = openOrCreateSellerTicket(product);
                  router.push(`/support?ticket=${ticketId}`);
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <Headphones className="h-3.5 w-3.5" /> Ask Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}