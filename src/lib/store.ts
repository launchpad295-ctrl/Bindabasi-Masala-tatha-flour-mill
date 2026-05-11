import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, isCustom?: boolean, blendIngredients?: any[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, isCustom = false, blendIngredients) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === product.id && i.isCustom === isCustom);
          if (existingItem && !isCustom) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...product, quantity, isCustom, blendIngredients }],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      total: () => {
        return get().items.reduce((acc, item) => acc + item.basePrice * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

interface AuthStore {
  user: any | null;
  profile: any | null;
  loading: boolean;
  setUser: (user: any | null) => void;
  setProfile: (profile: any | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}));
