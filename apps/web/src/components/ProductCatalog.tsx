'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Sparkles, X, Mic, RotateCcw } from 'lucide-react';
import { productService, ProductSearchResponse } from '@/services/product.service';
import { ProductFilters } from '@/types';
import { useUiStore } from '@/store/useUiStore';
import { ProductCard } from './ProductCard';
import { ProductSkeletonGrid } from './ProductSkeleton';

const CATEGORIES = ['all', 'kurtas', 'kurtis', 'shirts', 'sarees', 'electronics'];
const COLORS = [
  { name: 'all', hex: 'transparent' },
  { name: 'blue', hex: '#2563eb' },
  { name: 'red', hex: '#dc2626' },
  { name: 'green', hex: '#16a34a' },
  { name: 'yellow', hex: '#eab308' },
  { name: 'black', hex: '#0f172a' },
];
const FABRICS = ['all', 'cotton', 'silk', 'linen'];
const SIZES = ['all', 'S', 'M', 'L', 'XL', 'FREE'];

export function ProductCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setVoiceOpen, easyMode } = useUiStore();

  // Derive filters directly from URL (single source of truth!)
  const filters: ProductFilters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    color: searchParams.get('color') || 'all',
    fabric: searchParams.get('fabric') || 'all',
    gender: searchParams.get('gender') || 'all',
    size: searchParams.get('size') || 'all',
    maxPrice: Number(searchParams.get('maxPrice')) || 30000,
    tryOnOnly: searchParams.get('tryOnOnly') === 'true',
    sortBy: (searchParams.get('sortBy') as ProductFilters['sortBy']) || 'relevance',
  };

  const [searchInput, setSearchInput] = useState(filters.q);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductSearchResponse | null>(null);

  const updateUrlFilters = useCallback(
    (patch: Partial<ProductFilters>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();
      if (next.q) params.set('q', next.q);
      if (next.category !== 'all') params.set('category', next.category);
      if (next.color !== 'all') params.set('color', next.color);
      if (next.fabric !== 'all') params.set('fabric', next.fabric);
      if (next.gender !== 'all') params.set('gender', next.gender);
      if (next.size !== 'all') params.set('size', next.size);
      if (next.maxPrice < 30000) params.set('maxPrice', String(next.maxPrice));
      if (next.tryOnOnly) params.set('tryOnOnly', 'true');
      if (next.sortBy !== 'relevance') params.set('sortBy', next.sortBy);

      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : '/', { scroll: false });
    },
    [filters, router]
  );

  // Sync local input when Voice Dukaandar changes URL `?q=`
  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  // 300ms Debounce on typing so slow networks aren't flooded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.q) {
        updateUrlFilters({ q: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.q, updateUrlFilters]);

  // Fetch products whenever URL filters change
  useEffect(() => {
    let active = true;
    setLoading(true);
    productService.search(filters).then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [searchParams.toString()]);

  const FilterControls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Smart Filters</h3>
        <button
          onClick={() => router.replace('/')}
          className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Virtual Try-On Toggle */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3">
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Sparkles className="h-4 w-4 text-orange-600" />
          Try-On Available Only
        </span>
        <input
          type="checkbox"
          checked={filters.tryOnOnly}
          onChange={(e) => updateUrlFilters({ tryOnOnly: e.target.checked })}
          className="h-4 w-4 accent-orange-600"
        />
      </label>

      {/* Category */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateUrlFilters({ category: cat })}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
                filters.category === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Color Swatches */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">Color</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => updateUrlFilters({ color: c.name })}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs capitalize transition ${
                filters.color === c.name
                  ? 'border-orange-600 bg-orange-50 font-semibold text-orange-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.name !== 'all' && (
                <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
              )}
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">Fabric</p>
        <div className="flex flex-wrap gap-1.5">
          {FABRICS.map((f) => (
            <button
              key={f}
              onClick={() => updateUrlFilters({ fabric: f })}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
                filters.fabric === f
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Size Chips */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">Size</p>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => updateUrlFilters({ size: s })}
              className={`min-w-[38px] rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                filters.size === s
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Slider */}
      <div>
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700">
          <span>Max Budget</span>
          <span className="text-orange-600">₹{filters.maxPrice.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min={500}
          max={30000}
          step={500}
          value={filters.maxPrice}
          onChange={(e) => updateUrlFilters({ maxPrice: Number(e.target.value) })}
          className="w-full accent-orange-600"
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Warm Hero Banner */}
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30">
              <Mic className="h-3.5 w-3.5" /> India’s First Voice-First Physical-Feel Marketplace
            </span>
            <h1 className={`mt-3 font-extrabold tracking-tight ${easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-4xl'}`}>
              Shop Like You’re Inside a Real Dukaan—Hands-Free!
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Ask our Hinglish <strong>Voice Dukaandar</strong> to find products, try clothes virtually before buying, save safely in your <strong>Shopping Gullak</strong>, and talk directly to the seller.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setVoiceOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-orange-600"
              >
                <Mic className="h-4 w-4" /> Start Voice Shopping
              </button>
              <button
                onClick={() => updateUrlFilters({ q: 'cotton', color: 'blue', maxPrice: 1500 })}
                className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                Try: “1500 ke andar blue cotton kurta”
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search + Sort Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search Hinglish or typos too (e.g. "coton", "neela kurta", "shaadi", "tv")...'
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          <select
            value={filters.sortBy}
            onChange={(e) => updateUrlFilters({ sortBy: e.target.value as ProductFilters['sortBy'] })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500"
          >
            <option value="relevance">Sort: Best Match</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block lg:self-start">
          <FilterControls />
        </aside>

        <div className="lg:col-span-3">
          {loading && !data ? (
            <ProductSkeletonGrid />
          ) : data && data.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-lg font-semibold text-slate-800">Koi product match nahi hua</p>
              <p className="mt-1 text-sm text-slate-500">
                Filters thoda relax karein ya Voice Dukaandar se puchein!
              </p>
              <button
                onClick={() => router.replace('/')}
                className="mt-4 rounded-xl bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {data?.items.length || 0} curated products</span>
                {loading && <span className="font-medium text-orange-600">Updating...</span>}
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data?.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="h-full w-80 overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <span className="font-bold text-slate-900">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterControls />
          </div>
        </div>
      )}
    </div>
  );
}