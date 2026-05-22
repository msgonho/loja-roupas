import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { launchProducts } from "@/lib/products";

const dropNotes = [
  "Modelagens com caimento amplo e acabamento discreto.",
  "Bases pensadas para uso diário, uniforme criativo e conteúdo de marca.",
  "Primeiros lotes com reposição conforme demanda.",
];

export default function LancamentosPage() {
  return (
    <main className="min-h-screen bg-[#111] text-white">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase text-[var(--citrus)]">Drop novo</p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-tight md:text-6xl">
              Lançamentos com cara de campanha.
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-neutral-300">
              Uma vitrine menor, com destaque visual e peças que acabaram de entrar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#drop"
                className="focus-ring rounded-md bg-white px-6 py-4 text-center text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200"
              >
                Ver drop
              </Link>
              <Link
                href="/colecao"
                className="focus-ring rounded-md border border-white/30 px-6 py-4 text-center text-sm font-black uppercase text-white transition-colors hover:bg-white hover:text-black"
              >
                Coleção completa
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-md bg-neutral-900 md:min-h-[520px]">
            <Image
              src="/moletom.png"
              alt="Moletom KromaLab lançamento"
              fill
              preload
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-md bg-black/72 p-4 backdrop-blur">
              <p className="text-sm font-black uppercase">Drop 01</p>
              <p className="mt-1 text-sm font-medium text-neutral-300">
                Moletom heavy, oversized tonal e base personalizável.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 text-black">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {dropNotes.map((note, index) => (
            <div key={note} className="rounded-md border border-neutral-200 p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-sm font-black text-neutral-700">
                {index + 1}
              </span>
              <p className="mt-4 text-sm font-bold leading-6 text-neutral-700">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <div id="drop" className="bg-[var(--background)] text-black">
        <ProductGrid
          products={launchProducts}
          eyebrow="Entradas recentes"
          title="Peças novas para comprar ou personalizar."
          description="Menos catálogo, mais lançamento: uma seleção enxuta para destacar novidade."
          variant="editorial"
        />
      </div>

      <section className="bg-white py-10 text-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black uppercase">Reposição inteligente</p>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-neutral-700">
              Gostou de um drop para sua equipe? Transforme a peça em uniforme
              ou coleção cápsula com variações de cor e logo.
            </p>
          </div>
          <Link
            href="/atacado#orcamento-atacado"
            className="focus-ring rounded-md bg-black px-5 py-3 text-center text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
          >
            Orçar atacado
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
