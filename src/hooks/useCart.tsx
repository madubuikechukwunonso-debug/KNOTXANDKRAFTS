import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addItem = useCallback(
    (item: CartItem) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        let newItems: CartItem[];
        if (existing) {
          newItems = prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
        } else {
          newItems = [...prev, item];
        }
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
    },
    [],
  );

  const removeItem = useCallback(
    (productId: number) => {
      setItems((prev) => {
        const newItems = prev.filter((i) => i.productId !== productId);
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) => {
        const newItems = prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        );
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("cart");
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
