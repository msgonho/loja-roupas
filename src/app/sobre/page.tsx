import Image from "next/image";
import Footer from "@/components/Footer";

const values = [
  ["Acabamento", "Peças com tecido, caimento e aplicação pensados para uso real."],
  ["Agilidade", "Briefing objetivo para reduzir retrabalho e acelerar orçamentos."],
  ["Escala", "Da unidade personalizada ao kit de equipe, evento ou marca."],
];

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase text-[var(--accent)]">Sobre a marca</p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-tight md:text-6xl">
              KromaLab Personalizados.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-neutral-600">
              Um laboratório de streetwear, brindes e uniformes para quem quer
              transformar ideia em produto com visual consistente.
            </p>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-md bg-neutral-100 md:min-h-[420px]">
            <Image
              src="/fundo_page_inicial.png"
              alt="Studio de personalização KromaLab"
              fill
              preload
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {values.map(([title, text]) => (
            <article key={title} className="rounded-md border border-neutral-200 bg-white p-5">
              <p className="text-xl font-black uppercase">{title}</p>
              <p className="mt-3 text-sm font-medium leading-6 text-neutral-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
