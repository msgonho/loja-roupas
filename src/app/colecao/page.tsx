import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { products, readyProducts, customProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Coleção — KromaLab",
  description:
    "Catálogo completo de camisetas streetwear, moletons, personalizados e kits. Compre peças prontas ou solicite orçamento.",
};

const categories = [
  ["Todos", `${products.length} modelos`],
  ["Pronta entrega", `${readyProducts.length} peças`],
  ["Personalizáveis", `${customProducts.length} opções`],
  ["Atacado", "kits sob consulta"],
];

export default function ColecaoPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-black uppercase text-[var(--accent)]">Catálogo completo</p>
              <h1 className="mt-3 text-4xl font-black uppercase leading-tight md:text-6xl">
                Coleção pronta para montar sua sacola.
              </h1>
              <p className="mt-5 text-base font-medium leading-7 text-neutral-600">
                Aqui a experiência é de compra direta: material, estoque,
                tamanhos e produtos prontos ou personalizáveis no mesmo lugar.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map(([title, text]) => (
                <div key={title} className="rounded-md border border-neutral-200 bg-white p-4">
                  <p className="text-sm font-black uppercase">{title}</p>
                  <p className="mt-1 text-sm font-bold text-neutral-500">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-md bg-neutral-100 md:min-h-[420px]">
            <Image
              src="/personalize_1.png"
              alt="Camisetas personalizadas KromaLab"
              fill
              preload
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="max-w-2xl text-sm font-bold text-neutral-700">
            Precisa de grade, cor especial ou logo aplicado? Envie um briefing
            de personalização depois de escolher a base.
          </p>
          <Link
            href="/personalize#briefing-personalizacao"
            className="focus-ring rounded-md bg-black px-5 py-3 text-center text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
          >
            Orçar personalizado
          </Link>
        </div>
      </section>

      <ProductGrid
        products={products}
        eyebrow="Produtos"
        title="Catálogo KromaLab"
        description="Uma grade completa para decidir entre compra pronta, personalização e atacado."
      />

      <Footer />
    </main>
  );
}
