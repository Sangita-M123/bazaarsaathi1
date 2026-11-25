import { apiFetch } from '@/lib/api-client';
import { MOCK_PRODUCTS } from '@/data/mockproduct';
import { Product, ProductFilters } from '@/types';

export interface ProductSearchResponse {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  facets: {
    colors: { value: string; count: number }[];
    fabrics: { value: string; count: number }[];
  };
  source: 'backend' | 'offline-fallback';
}

function normalizeBackendProduct(p: any): Product {
  return {
    id: p.id,
    sellerId: p.sellerId,
    sellerName: p.sellerShopName || p.seller?.shopName || 'Verified Seller',
    sellerPersona: p.seller?.supportPersona || 'Helpful Store Representative',
    title: p.title,
    slug: p.slug,
    description: p.description || '',
    category: p.category,
    brand: p.brand || 'BazaarSaathi',
    gender: p.gender || 'UNISEX',
    color: p.color || 'multi',
    fabric: p.fabric || undefined,
    sizes: p.sizes || ['FREE'],
    tags: p.tags || [],
    price: Math.round((p.pricePaise ?? p.price * 100) / 100),
    mrp: Math.round((p.mrpPaise ?? p.mrp * 100) / 100),
    stock: p.stock ?? 10,
    rating: p.rating ?? 4.5,
    reviewCount: p.reviewCount ?? 0,
    imageUrl: p.imageUrls?.[0] || p.imageUrl,
    tryOnSupported: Boolean(p.tryOnSupported),
    specs: p.attributes || p.specs,
  };
}

export const productService = {
  async search(filters: Partial<ProductFilters>, page = 1): Promise<ProductSearchResponse> {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters.color && filters.color !== 'all') params.set('color', filters.color);
    if (filters.fabric && filters.fabric !== 'all') params.set('fabric', filters.fabric);
    if (filters.gender && filters.gender !== 'all') params.set('gender', filters.gender);
    if (filters.size && filters.size !== 'all') params.set('size', filters.size);
    if (filters.maxPrice && filters.maxPrice < 30000) params.set('maxPrice', String(filters.maxPrice));
    if (filters.tryOnOnly) params.set('tryOnOnly', 'true');
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    params.set('page', String(page));

    try {
      const res = await apiFetch<{ success: boolean; data: any }>(`/products?${params.toString()}`);
      return {
        items: res.data.items.map(normalizeBackendProduct),
        pagination: res.data.pagination,
        facets: res.data.facets,
        source: 'backend',
      };
    } catch {
      // Resilient fallback only when Core API isn't running yet
      const filtered = MOCK_PRODUCTS.filter((p) => {
        if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
        if (filters.color && filters.color !== 'all' && p.color !== filters.color) return false;
        if (filters.fabric && filters.fabric !== 'all' && p.fabric !== filters.fabric) return false;
        if (filters.gender && filters.gender !== 'all' && p.gender !== filters.gender) return false;
        if (filters.size && filters.size !== 'all' && !p.sizes.includes(filters.size)) return false;
        if (filters.maxPrice && p.price > filters.maxPrice) return false;
        if (filters.tryOnOnly && !p.tryOnSupported) return false;
        if (filters.q) {
          const hay = `${p.title} ${p.description} ${p.color} ${p.fabric || ''} ${p.tags.join(' ')}`.toLowerCase();
          const q = filters.q.toLowerCase();
          if (!q.split(/\s+/).every((w) => hay.includes(w) || (w.length >= 4 && hay.includes(w.slice(0, -1))))) {
            return false;
          }
        }
        return true;
      });

      const colorCounts = new Map<string, number>();
      const fabricCounts = new Map<string, number>();
      filtered.forEach((p) => {
        colorCounts.set(p.color, (colorCounts.get(p.color) || 0) + 1);
        if (p.fabric) fabricCounts.set(p.fabric, (fabricCounts.get(p.fabric) || 0) + 1);
      });

      return {
        items: filtered,
        pagination: { page: 1, limit: 12, total: filtered.length, totalPages: 1 },
        facets: {
          colors: [...colorCounts.entries()].map(([value, count]) => ({ value, count })),
          fabrics: [...fabricCounts.entries()].map(([value, count]) => ({ value, count })),
        },
        source: 'offline-fallback',
      };
    }
  },

  async getBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>(`/products/${slug}`);
      return normalizeBackendProduct(res.data);
    } catch {
      return MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
    }
  },
};