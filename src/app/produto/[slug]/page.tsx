import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import AddToCartButton from "./AddToCartButton";
import { currency } from "@/lib/products";
import { getProducts, getProductBySlug as getProductBySlugDynamic } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugDynamic(slug);

  if (!product) {
    return { title: "Produto não encontrado — KromaLab" };
  }

  return {
    title: `${product.name} — KromaLab`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugDynamic(slug);

  if (!product) {
    notFound();
  }

  const quoteHref =
    product.badge === "Atacado"
      ? "/atacado#orcamento-atacado"
      : "/personalize#briefing-personalizacao";

  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-2 lg:px-8">
          <div className="relative min-h-[400px] overflow-hidden rounded-md bg-neutral-100 md:min-h-[560px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              preload
              unoptimized={product.image.startsWith("data:")}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute left-3 top-3 rounded-md bg-white/92 px-3 py-2 text-xs font-black uppercase text-black">
              {product.badge}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <Link
              href="/colecao"
              className="focus-ring mb-4 inline-flex w-fit rounded-md text-xs font-black uppercase text-[var(--accent)] transition-colors hover:text-black"
            >
              ← Voltar à coleção
            </Link>

            <h1 className="text-4xl font-black uppercase leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-2 text-sm font-bold uppercase text-neutral-500">
              {product.fit} · {product.color}
            </p>

            <p className="mt-4 text-3xl font-black">
              {currency.format(product.price)}
            </p>

            <p className="mt-6 text-base font-medium leading-7 text-neutral-600">
              {product.description}
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <p className="text-xs font-black uppercase text-neutral-500">Material</p>
                <p className="mt-1 text-sm font-bold">{product.material}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-neutral-500">Estoque</p>
                <p className="mt-1 text-sm font-bold">{product.stock}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-neutral-500">Tamanhos</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-black text-neutral-700"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {product.category === "custom" ? (
                <Link
                  href={quoteHref}
                  className="focus-ring rounded-md bg-black px-6 py-4 text-center text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
                >
                  {product.badge === "Atacado" ? "Orçar atacado" : "Orçar personalizado"}
                </Link>
              ) : (
                <AddToCartButton product={product} />
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
