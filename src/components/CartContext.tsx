"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { currency } from "@/lib/products";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

type AddedItem = Omit<CartItem, "quantity">;

const STORAGE_KEY = "kromalab-cart";
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lastAddedItem, setLastAddedItem] = useState<AddedItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const savedCart = window.localStorage.getItem(STORAGE_KEY);

    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const [dismissAt, setDismissAt] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  function scheduleAutoDismiss() {
    setDismissAt(Date.now() + 2500);
    setFading(false);
  }

  useEffect(() => {
    if (dismissAt === null) return;

    const fadeTimer = window.setTimeout(() => setFading(true), 2000);
    const removeTimer = window.setTimeout(() => {
      setLastAddedItem(null);
      setDismissAt(null);
    }, 2500);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [dismissAt]);

  function addToCart(item: Omit<CartItem, "quantity">) {
    setLastAddedItem(item);
    scheduleAutoDismiss();

    setCart((previousCart) => {
      const existingItem = previousCart.find((product) => product.id === item.id);

      if (existingItem) {
        return previousCart.map((product) =>
          product.id === item.id
            ? { ...product, quantity: product.quantity + 1 }
            : product
        );
      }

      return [...previousCart, { ...item, quantity: 1 }];
    });
  }

  function updateQuantity(id: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((product) =>
        product.id === id ? { ...product, quantity } : product
      )
    );
  }

  function removeFromCart(id: number) {
    setCart((previousCart) => previousCart.filter((product) => product.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const totals = useMemo(() => {
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return { itemCount, subtotal };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount: totals.itemCount,
        subtotal: totals.subtotal,
      }}
    >
      {children}
      {lastAddedItem ? (
        <div className={`fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-md overflow-hidden rounded-lg border border-black/15 bg-white shadow-2xl transition-opacity duration-500 sm:left-auto sm:right-5 sm:top-24 sm:bottom-auto ${fading ? "opacity-0" : "opacity-100"}`}>
          <div className="flex items-start gap-4 p-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              <Image
                src={lastAddedItem.image}
                alt={lastAddedItem.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase text-[var(--accent)]">
                Item adicionado
              </p>
              <h2 className="mt-1 text-sm font-black uppercase leading-snug">
                {lastAddedItem.name}
              </h2>
              <p className="mt-1 text-sm font-bold text-neutral-600">
                {currency.format(lastAddedItem.price)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLastAddedItem(null)}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-lg font-black leading-none text-neutral-700 transition-colors hover:border-black hover:bg-black hover:text-white"
              aria-label="Fechar aviso de item adicionado"
            >
              x
            </button>
          </div>

          <div className="grid grid-cols-2 border-t border-black/10">
            <Link
              href="/checkout"
              onClick={() => setLastAddedItem(null)}
              className="focus-ring bg-black px-4 py-3 text-center text-xs font-black uppercase text-white transition-colors hover:bg-neutral-800"
            >
              Ver sacola
            </Link>
            <button
              type="button"
              onClick={() => setLastAddedItem(null)}
              className="focus-ring px-4 py-3 text-xs font-black uppercase text-neutral-800 transition-colors hover:bg-neutral-100"
            >
              Continuar
            </button>
          </div>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
