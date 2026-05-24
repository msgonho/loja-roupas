import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Atendimento — KromaLab",
  description:
    "Canais de atendimento KromaLab: WhatsApp, e-mail e pós-venda para compras, pedidos e produção.",
};

const channels = [
  ["WhatsApp", "Pedidos, prazos, medidas, arte e orçamento assistido."],
  ["E-mail", "Envio de arquivos, referências e documentos de compra."],
  ["Pós-venda", "Trocas, acompanhamento e ajustes antes da produção."],
];

export default function AtendimentoPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-md border border-neutral-200 bg-white p-6 md:p-8">
            <p className="text-xs font-black uppercase text-[var(--accent)]">Fale conosco</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-tight md:text-6xl">
              Atendimento para compra, pedido e produção.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-neutral-600">
              Tire dúvidas antes de comprar, envie arquivos de arte ou acompanhe
              um pedido em andamento.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {channels.map(([title, text]) => (
              <article key={title} className="rounded-md border border-neutral-200 bg-white p-5">
                <p className="text-xl font-black uppercase">{title}</p>
                <p className="mt-3 text-sm font-medium leading-6 text-neutral-600">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-neutral-800">
              Para pedidos com arte, quantidade ou atacado, o briefing agiliza o retorno.
            </p>
            <Link
              href="/personalize#briefing-personalizacao"
              className="focus-ring rounded-md bg-black px-5 py-3 text-center text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
            >
              Abrir briefing
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
