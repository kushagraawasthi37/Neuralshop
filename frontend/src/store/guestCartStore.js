import { create } from "zustand";

const STORAGE_KEY = "neural-guest-cart";

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"items":[]}').items || [];
  } catch {
    return [];
  }
};

const persist = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
};

export const useGuestCartStore = create((set, get) => ({
  items: load(),

  addItem: (item) => {
    const { items } = get();
    const idx = items.findIndex(
      (i) => i.productId === item.productId && i.size === item.size,
    );
    const newItems =
      idx >= 0
        ? items.map((i, j) =>
            j === idx ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
        : [...items, item];
    persist(newItems);
    set({ items: newItems });
  },

  removeItem: (productId, size) => {
    const newItems = get().items.filter(
      (i) => !(i.productId === productId && i.size === size),
    );
    persist(newItems);
    set({ items: newItems });
  },

  updateItem: (productId, size, quantity) => {
    const { items } = get();
    const newItems =
      quantity === 0
        ? items.filter((i) => !(i.productId === productId && i.size === size))
        : items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity }
              : i,
          );
    persist(newItems);
    set({ items: newItems });
  },

  clear: () => {
    persist([]);
    set({ items: [] });
  },
}));
