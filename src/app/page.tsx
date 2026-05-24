import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { launchProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "KromaLab Personalizados — Streetwear, Brindes e Uniformes",
  description:
    "Compre peças prontas, envie um briefing personalizado ou solicite atacado. Camisetas, moletons, brindes e kits com acabamento de produção.",
};

const quickLinks = [
  {
    title: "Comprar coleção",
    text: "Peças prontas, tamanhos disponíveis e envio pelo checkout.",
    href: "/colecao",
    label: "Ver produtos",
  },
  {
    title: "Orçar personalizado",
    text: "Briefing para camiseta, uniforme, brinde ou kit sob demanda.",
    href: "/personalize#briefing-personalizacao",
    label: "Montar briefing",
  },
  {
    title: "Atacado em volume",
    text: "Formulário próprio para lotes, eventos e equipes.",
    href: "/atacado#orcamento-atacado",
    label: "Orçar atacado",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="relative min-h-[calc(78svh-68px)] overflow-hidden bg-black text-white">
        <Image
          src="/fundo_page_inicial.png"
          alt="Studio KromaLab com peças personalizadas"
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative mx-auto flex min-h-[calc(78svh-68px)] max-w-7xl items-end px-4 pb-10 pt-24 sm:px-6 md:pb-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-normal text-neutral-200">
              Streetwear, brindes e uniformes
            </p>
            <h1 className="text-4xl font-black uppercase leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
              KromaLab
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-neutral-200 md:text-lg">
              Compre peças prontas, envie um briefing personalizado ou solicite
              atacado em um caminho claro para cada tipo de pedido.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/colecao"
                className="focus-ring rounded-md bg-white px-6 py-4 text-center text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200"
              >
                Comprar coleção
              </Link>
              <Link
                href="/personalize#briefing-personalizacao"
                className="focus-ring rounded-md border border-white/70 px-6 py-4 text-center text-sm font-black uppercase text-white transition-colors hover:bg-white hover:text-black"
              >
                Orçar personalizado
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {quickLinks.map((item) => (
            <article key={item.title} className="rounded-md border border-neutral-200 p-5">
              <h2 className="text-base font-black uppercase">{item.title}</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-neutral-600">{item.text}</p>
              <Link
                href={item.href}
                className="focus-ring mt-5 inline-flex rounded-md bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-900 transition-colors hover:bg-black hover:text-white"
              >
                {item.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <ProductGrid
        products={launchProducts.slice(0, 4)}
        eyebrow="Destaques"
        title="Peças para começar."
        description="Uma seleção curta da coleção para escolher rápido e seguir para a sacola ou briefing."
        variant="compact"
      />

      <Footer />
    </main>
  );
}
