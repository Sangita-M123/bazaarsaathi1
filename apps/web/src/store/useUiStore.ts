import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

interface UiState {
  user: AuthUser | null;
  easyMode: boolean;
  voiceOpen: boolean;
  viewingProduct: Product | null;
  tryOnProduct: Product | null;
  cart: CartItem[];
  wishlist: Product[];
  toastMessage: string | null;

  setUser: (u: AuthUser | null) => void;
  toggleEasyMode: () => void;
  setVoiceOpen: (open: boolean) => void;
  setViewingProduct: (p: Product | null) => void;
  setTryOnProduct: (p: Product | null) => void;
  showToast: (msg: string) => void;
  addToCart: (product: Product, size?: string) => void;
  updateCartQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      user: null,
      easyMode: false,
      voiceOpen: false,
      viewingProduct: null,
      tryOnProduct: null,
      cart: [],
      wishlist: [],
      toastMessage: null,

      setUser: (user) => set({ user }),
      toggleEasyMode: () => set((s) => ({ easyMode: !s.easyMode })),
      setVoiceOpen: (voiceOpen) => set({ voiceOpen }),
      setViewingProduct: (viewingProduct) => set({ viewingProduct }),
      setTryOnProduct: (tryOnProduct) => set({ tryOnProduct }),

      showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => {
          if (get().toastMessage === msg) set({ toastMessage: null });
        }, 2600);
      },

      addToCart: (product, size) => {
        set((s) => {
          const chosen = size || product.sizes[0] || 'FREE';
          const existing = s.cart.find((i) => i.product.id === product.id && i.size === chosen);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.product.id === product.id && i.size === chosen
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { cart: [...s.cart, { product, quantity: 1, size: chosen }] };
        });
        get().showToast(`Added "${product.title}" to Cart`);
      },

      updateCartQty: (productId, size, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((i) => !(i.product.id === productId && i.size === size))
              : s.cart.map((i) =>
                  i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
                ),
        })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (product) => {
        const exists = get().wishlist.some((p) => p.id === product.id);
        set((s) => ({
          wishlist: exists ? s.wishlist.filter((p) => p.id !== product.id) : [...s.wishlist, product],
        }));
        get().showToast(exists ? 'Removed from Wishlist' : `Saved "${product.title}" to Wishlist`);
      },
    }),
    {
      name: 'bazaarsaathi-ui-storage',
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist, easyMode: s.easyMode }),
    }
  )
);