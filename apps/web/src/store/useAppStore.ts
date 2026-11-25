import { create } from 'zustand';
import { MOCK_PRODUCTS } from '@/data/mockproduct';
import { CartItem, Product, ProductFilters, SavingsGoal, SupportTicket, WalletTx } from '@/types';

const DEFAULT_FILTERS: ProductFilters = {
  q: '',
  category: 'all',
  color: 'all',
  fabric: 'all',
  gender: 'all',
  size: 'all',
  maxPrice: 30000,
  tryOnOnly: false,
  sortBy: 'relevance',
};

// Lightweight client-side fuzzy matcher (simulates our pg_trgm backend until connected)
function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (t.includes(q)) return true;

  // Common Hinglish / typo synonyms
  const synonyms: Record<string, string[]> = {
    neela: ['blue', 'indigo', 'sky'],
    laal: ['red', 'crimson'],
    peela: ['yellow', 'mustard'],
    hara: ['green', 'emerald'],
    kala: ['black'],
    coton: ['cotton'],
    kurthi: ['kurti', 'kurta'],
    sadi: ['saree'],
    shaadi: ['wedding', 'festive', 'silk'],
    mummy: ['saree', 'kurti', 'women'],
  };

  const words = q.split(/\s+/);
  return words.every((w) => {
    if (t.includes(w)) return true;
    const mapped = synonyms[w];
    if (mapped && mapped.some((m) => t.includes(m))) return true;
    // Allow 1-character typo tolerance for words >= 4 chars
    if (w.length >= 4 && t.includes(w.slice(0, -1))) return true;
    return false;
  });
}

interface AppState {
  products: Product[];
  filters: ProductFilters;
  viewingProduct: Product | null;
  tryOnModalProduct: Product | null;
  cart: CartItem[];
  wishlist: Product[];

  // Shopping Gullak Wallet
  walletAvailable: number;
  walletLocked: number;
  goals: SavingsGoal[];
  walletTransactions: WalletTx[];

  // Support Tickets
  tickets: SupportTicket[];

  // Actions
  setFilters: (partial: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setViewingProduct: (p: Product | null) => void;
  openTryOnModal: (p: Product | null) => void;

  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQty: (productId: string, size: string, qty: number) => void;
  toggleWishlist: (product: Product) => void;

  depositToWallet: (amount: number, note?: string) => void;
  withdrawFromWallet: (amount: number) => boolean;
  createGoal: (title: string, targetAmount: number) => void;
  allocateToGoal: (goalId: string, amount: number) => boolean;
  placeOrder: (paymentMethod: 'GULLAK' | 'UPI_SIMULATED', viaVoice?: boolean) => { ok: boolean; message: string };

  createOrGetTicket: (product: Product) => SupportTicket;
  sendTicketMessage: (ticketId: string, sender: 'CUSTOMER' | 'SELLER_AI' | 'SELLER_HUMAN' | 'PLATFORM_ADMIN', text: string) => void;
  escalateTicket: (ticketId: string, nextStatus: SupportTicket['status']) => void;
  getFilteredProducts: () => Product[];
}

export const useAppStore = create<AppState>((set, get) => ({
  products: MOCK_PRODUCTS,
  filters: DEFAULT_FILTERS,
  viewingProduct: null,
  tryOnModalProduct: null,
  cart: [],
  wishlist: [],

  walletAvailable: 3500,
  walletLocked: 15000,
  goals: [
    { id: 'g1', title: 'Diwali Smart TV Fund', targetAmount: 24999, savedAmount: 15000 },
    { id: 'g2', title: 'Festive Kurta & Saree Budget', targetAmount: 4000, savedAmount: 1500 },
  ],
  walletTransactions: [
    { id: 'tx1', type: 'DEPOSIT', amount: 18500, note: 'Added from UPI (Demo Bank)', timestamp: 'Today, 10:15 AM' },
    { id: 'tx2', type: 'GOAL_LOCK', amount: 15000, note: 'Locked into Diwali Smart TV Fund', timestamp: 'Today, 10:18 AM' },
  ],

  tickets: [
    {
      id: 'tkt-101',
      sellerId: 's3',
      sellerName: 'TechBharat Electronics',
      productTitle: 'VisionPro 43-inch 4K Ultra HD Smart LED TV',
      status: 'AI_HANDLING',
      messages: [
        {
          sender: 'SELLER_AI',
          text: 'Namaste! Main TechBharat Electronics ka dedicated AI assistant hoon. Aapke VisionPro 43" TV ke warranty, wall-mount installation, ya display issue me kaise madad karoon?',
          time: '10:30 AM',
        },
      ],
    },
  ],

  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setViewingProduct: (p) => set({ viewingProduct: p }),
  openTryOnModal: (p) => set({ tryOnModalProduct: p }),

  addToCart: (product, size) =>
    set((s) => {
      const chosenSize = size || product.sizes[0] || 'FREE';
      const existing = s.cart.find((i) => i.product.id === product.id && i.size === chosenSize);
      if (existing) {
        return {
          cart: s.cart.map((i) =>
            i.product.id === product.id && i.size === chosenSize
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { cart: [...s.cart, { product, quantity: 1, size: chosenSize }] };
    }),

  removeFromCart: (productId, size) =>
    set((s) => ({
      cart: s.cart.filter((i) => !(i.product.id === productId && i.size === size)),
    })),

  updateCartQty: (productId, size, qty) =>
    set((s) => ({
      cart:
        qty <= 0
          ? s.cart.filter((i) => !(i.product.id === productId && i.size === size))
          : s.cart.map((i) =>
              i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
            ),
    })),

  toggleWishlist: (product) =>
    set((s) => {
      const exists = s.wishlist.some((p) => p.id === product.id);
      return {
        wishlist: exists ? s.wishlist.filter((p) => p.id !== product.id) : [...s.wishlist, product],
      };
    }),

  depositToWallet: (amount, note = 'Added to Shopping Gullak') =>
    set((s) => ({
      walletAvailable: s.walletAvailable + amount,
      walletTransactions: [
        { id: `tx-${Date.now()}`, type: 'DEPOSIT', amount, note, timestamp: 'Just now' },
        ...s.walletTransactions,
      ],
    })),

  withdrawFromWallet: (amount) => {
    const s = get();
    if (amount <= 0 || amount > s.walletAvailable) return false;
    set({
      walletAvailable: s.walletAvailable - amount,
      walletTransactions: [
        {
          id: `tx-${Date.now()}`,
          type: 'WITHDRAW',
          amount,
          note: 'Withdrawn back to Source Bank Account (Demo)',
          timestamp: 'Just now',
        },
        ...s.walletTransactions,
      ],
    });
    return true;
  },

  createGoal: (title, targetAmount) =>
    set((s) => ({
      goals: [...s.goals, { id: `g-${Date.now()}`, title, targetAmount, savedAmount: 0 }],
    })),

  allocateToGoal: (goalId, amount) => {
    const s = get();
    if (amount <= 0 || amount > s.walletAvailable) return false;
    set({
      walletAvailable: s.walletAvailable - amount,
      walletLocked: s.walletLocked + amount,
      goals: s.goals.map((g) =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g
      ),
      walletTransactions: [
        { id: `tx-${Date.now()}`, type: 'GOAL_LOCK', amount, note: 'Locked into Gullak Goal', timestamp: 'Just now' },
        ...s.walletTransactions,
      ],
    });
    return true;
  },

  placeOrder: (paymentMethod, viaVoice = false) => {
    const s = get();
    if (s.cart.length === 0) return { ok: false, message: 'Aapka cart khali hai!' };
    const total = s.cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    if (paymentMethod === 'GULLAK') {
      if (s.walletAvailable < total) {
        return {
          ok: false,
          message: `Gullak balance ₹${s.walletAvailable} hai, order ₹${total} ka hai. Pehle Gullak me paise add karein!`,
        };
      }
      set({
        walletAvailable: s.walletAvailable - total,
        cart: [],
        walletTransactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'ORDER_DEBIT',
            amount: total,
            note: viaVoice ? 'Order placed via Voice Dukaandar' : 'Order paid via Shopping Gullak',
            timestamp: 'Just now',
          },
          ...s.walletTransactions,
        ],
      });
      return { ok: true, message: `Order ₹${total} ka Gullak se confirm ho gaya!` };
    }

    set({ cart: [] });
    return { ok: true, message: `Order ₹${total} ka UPI (Demo) se confirm ho gaya!` };
  },

  createOrGetTicket: (product) => {
    const s = get();
    const existing = s.tickets.find((t) => t.sellerId === product.sellerId);
    if (existing) return existing;

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      productTitle: product.title,
      status: 'AI_HANDLING',
      messages: [
        {
          sender: 'SELLER_AI',
          text: `Namaste! Main ${product.sellerName} ka dedicated assistant hoon (${product.sellerPersona}). "${product.title}" ke baare me koi bhi sawaal ya issue batayein!`,
          time: 'Just now',
        },
      ],
    };
    set({ tickets: [newTicket, ...s.tickets] });
    return newTicket;
  },

  sendTicketMessage: (ticketId, sender, text) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, messages: [...t.messages, { sender, text, time: 'Just now' }] }
          : t
      ),
    })),

  escalateTicket: (ticketId, nextStatus) =>
    set((s) => ({
      tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t)),
    })),

  getFilteredProducts: () => {
    const { products, filters } = get();
    let list = products.filter((p) => {
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.color !== 'all' && p.color !== filters.color) return false;
      if (filters.fabric !== 'all' && p.fabric !== filters.fabric) return false;
      if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
      if (filters.size !== 'all' && !p.sizes.includes(filters.size)) return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.tryOnOnly && !p.tryOnSupported) return false;
      if (filters.q) {
        const searchable = `${p.title} ${p.description} ${p.brand} ${p.color} ${p.fabric || ''} ${p.tags.join(' ')}`;
        if (!fuzzyMatch(searchable, filters.q)) return false;
      }
      return true;
    });

    if (filters.sortBy === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (filters.sortBy === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (filters.sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  },
}));