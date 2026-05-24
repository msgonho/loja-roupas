"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import type { Product } from "@/lib/products";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const router = useRouter();

  function add() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  }

  function buyNow() {
    add();
    router.push("/checkout");
  }

  return (
    <>
      <button
        type="button"
        onClick={buyNow}
        className="focus-ring rounded-md bg-black px-6 py-4 text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
      >
        Comprar agora
      </button>
      <button
        type="button"
        onClick={add}
        className="focus-ring rounded-md border border-neutral-300 px-6 py-4 text-sm font-black uppercase text-neutral-900 transition-colors hover:border-black hover:bg-neutral-100"
      >
        Adicionar à sacola
      </button>
    </>
  );
}
