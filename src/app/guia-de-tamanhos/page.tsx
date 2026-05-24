import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Guia de Tamanhos — KromaLab",
  description:
    "Tabela de medidas para camisetas premium e oversized KromaLab. Compare comprimento e largura antes de comprar.",
};

const sizes = [
  ["P", "68 cm", "52 cm", "Oversized leve"],
  ["M", "71 cm", "55 cm", "Caimento solto"],
  ["G", "74 cm", "58 cm", "Street amplo"],
  ["GG", "77 cm", "61 cm", "Extra conforto"],
  ["XG", "80 cm", "64 cm", "Grade estendida"],
];

export default function GuiaDeTamanhosPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-md border border-neutral-200 bg-white p-6 md:p-8">
            <p className="text-xs font-black uppercase text-[var(--accent)]">Medidas</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-tight md:text-6xl">
              Guia de tamanhos
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-neutral-600">
              Medidas aproximadas para camiseta premium e oversized. Compare
              com uma peça que você já usa.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-md border border-neutral-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-black text-white">
                  <tr className="text-xs font-black uppercase">
                    <th className="p-4">Tamanho</th>
                    <th className="p-4">Comprimento</th>
                    <th className="p-4">Largura</th>
                    <th className="p-4">Indicação</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map(([size, height, width, fit]) => (
                    <tr key={size} className="border-b border-neutral-200 last:border-0">
                      <td className="p-4 text-lg font-black">{size}</td>
                      <td className="p-4 text-sm font-bold text-neutral-700">{height}</td>
                      <td className="p-4 text-sm font-bold text-neutral-700">{width}</td>
                      <td className="p-4 text-sm font-bold text-neutral-700">{fit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
