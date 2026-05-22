import Link from "next/link";

const columns = [
  {
    title: "Comprar",
    links: [
      { href: "/lancamentos", label: "Lançamentos" },
      { href: "/colecao", label: "Coleção pronta" },
      { href: "/personalize#briefing-personalizacao", label: "Orçamento" },
      { href: "/atacado", label: "Atacado" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { href: "/rastrear-pedido", label: "Rastrear pedido" },
      { href: "/guia-de-tamanhos", label: "Guia de tamanhos" },
      { href: "/trocas", label: "Trocas e devoluções" },
      { href: "/atendimento", label: "Atendimento" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#101010] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-2xl font-black uppercase">KromaLab</p>
          <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-neutral-300">
            Streetwear, personalizados e kits em escala com atendimento direto
            e acabamento de produção.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-black uppercase text-neutral-400">{column.title}</p>
            <div className="mt-4 grid gap-3">
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="focus-ring rounded-md text-sm font-bold text-neutral-200 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs font-bold text-neutral-400">
        2026 KromaLab Personalizados. Checkout pronto para receber integração de pagamento.
      </div>
    </footer>
  );
}
