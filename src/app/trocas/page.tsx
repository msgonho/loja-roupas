import Footer from "@/components/Footer";

const policies = [
  ["7 dias", "Solicitação de troca ou devolução após o recebimento."],
  ["Sem uso", "Produto com embalagem, etiqueta e sem sinais de lavagem."],
  ["Personalizados", "Itens sob demanda passam por análise de produção."],
  ["Defeito", "Falha de fabricação tem atendimento prioritário."],
];

export default function TrocasPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-md border border-neutral-200 bg-white p-6 md:p-8">
            <p className="text-xs font-black uppercase text-[var(--accent)]">Pós-venda</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-tight md:text-6xl">
              Trocas e devoluções sem confusão.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-neutral-600">
              Regras claras para peça pronta, personalizado e pedido em atacado.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {policies.map(([title, text]) => (
              <article key={title} className="rounded-md border border-neutral-200 bg-white p-5">
                <p className="text-2xl font-black uppercase text-[var(--accent)]">{title}</p>
                <p className="mt-3 text-sm font-bold leading-6 text-neutral-700">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
