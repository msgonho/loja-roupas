"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { currency, products as defaultProducts, type Product } from "@/lib/products";

type ProductGridProps = {
  products?: Product[];
  title?: string;
  eyebrow?: string;
  description?: string;
  variant?: "catalog" | "compact" | "editorial";
  showSizeSelector?: boolean;
};

export default function ProductGrid({
  products = defaultProducts,
  title,
  eyebrow,
  description,
  variant = "catalog",
  showSizeSelector = false,
}: ProductGridProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const isCompact = variant === "compact";
  const isEditorial = variant === "editorial";
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  function addProduct(product: Product, size?: string) {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  }

  function buyNow(product: Product, size?: string) {
    addProduct(product, size);
    router.push("/checkout");
  }

  function handleSizeClick(product: Product, size: string) {
    setSelectedSizes({ ...selectedSizes, [product.id]: size });
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  }

  return (
    <section className={isCompact ? "py-10" : "py-12"}>
      {(title || eyebrow || description) && (
        <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          {eyebrow ? (
            <p className="text-xs font-black uppercase text-[var(--accent)]">{eyebrow}</p>
          ) : null}
          {title ? (
            <h2 className="mt-2 max-w-3xl text-3xl font-black uppercase leading-tight md:text-5xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-neutral-600">
              {description}
            </p>
          ) : null}
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {products.map((product, index) => {
          const shouldFeature = isEditorial && index === 0;
          const quoteHref =
            product.badge === "Atacado"
              ? "/atacado#orcamento-atacado"
              : "/personalize#briefing-personalizacao";

          return (
            <article
              key={product.id}
              className={`group overflow-hidden rounded-md border border-neutral-200 bg-white transition-colors hover:border-neutral-400 ${
                shouldFeature ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden bg-neutral-100 ${
                  shouldFeature ? "aspect-[16/11]" : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes={
                    shouldFeature
                      ? "(min-width: 1024px) 50vw, 100vw"
                      : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  }
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute left-3 top-3 rounded-md bg-white/92 px-3 py-2 text-xs font-black uppercase text-black">
                  {product.badge}
                </div>
              </div>

              <div className="flex min-h-64 flex-col p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black uppercase leading-snug">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-neutral-500">{product.fit}</p>
                  </div>
                  <p className="shrink-0 text-base font-black">{currency.format(product.price)}</p>
                </div>

                <p className="mt-4 min-h-16 text-sm font-medium leading-6 text-neutral-600">
                  {product.description}
                </p>

                <p className="mt-3 text-xs font-bold uppercase text-neutral-500">
                  {product.material} · {product.stock}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeClick(product, size)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-black transition-colors ${
                        selectedSizes[product.id] === size
                          ? "border-black bg-black text-white"
                          : "border-neutral-200 text-neutral-700 hover:border-black hover:bg-neutral-100"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="mt-auto grid gap-2 pt-5">
                  {product.category === "custom" ? (
                    <Link
                      href={quoteHref}
                      className="focus-ring rounded-md bg-black px-4 py-3 text-center text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
                    >
                      {product.badge === "Atacado" ? "Orçar atacado" : "Orçar personalizado"}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => buyNow(product)}
                        className="focus-ring rounded-md bg-black px-4 py-3 text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
                      >
                        Comprar agora
                      </button>
                      <button
                        type="button"
                        onClick={() => addProduct(product)}
                        className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-black uppercase text-neutral-900 transition-colors hover:border-black hover:bg-neutral-100"
                      >
                        Adicionar à sacola
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
