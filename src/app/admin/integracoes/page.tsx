"use client";

import { useState } from "react";
import AdminShell from "@/components/AdminShell";

const integrations = [
  {
    id: "nfe",
    name: "Nota Fiscal Eletrônica (NF-e)",
    description: "Emita notas fiscais automaticamente ao confirmar pedidos. Integre com sistemas como Nuvemfiscal, Bling, Tiny ERP ou Focus NFe.",
    icon: "📄",
    providers: [
      { name: "Bling", url: "https://www.bling.com.br", description: "ERP completo com emissão de NF-e, controle de estoque e financeiro." },
      { name: "Tiny ERP", url: "https://tiny.com.br", description: "Gestão simplificada com NF-e, NFC-e e integração com marketplaces." },
      { name: "Nuvemfiscal", url: "https://www.nuvemfiscal.com.br", description: "API de emissão fiscal com NF-e, NFS-e e NFC-e." },
      { name: "Focus NFe", url: "https://focusnfe.com.br", description: "API para emissão de documentos fiscais eletrônicos." },
    ],
  },
  {
    id: "erp",
    name: "ERP / Gestão",
    description: "Conecte com um sistema de gestão para sincronizar produtos, pedidos e financeiro.",
    icon: "📊",
    providers: [
      { name: "Bling", url: "https://www.bling.com.br", description: "ERP com controle financeiro, estoque e vendas multicanal." },
      { name: "Tiny ERP", url: "https://tiny.com.br", description: "ERP com foco em e-commerce e logística." },
      { name: "Conta Azul", url: "https://contaazul.com", description: "Gestão financeira e contábil para pequenas empresas." },
    ],
  },
  {
    id: "shipping",
    name: "Frete / Logística",
    description: "Calcule fretes automaticamente e gere etiquetas de envio.",
    icon: "🚚",
    providers: [
      { name: "Melhor Envio", url: "https://melhorenvio.com.br", description: "Cotação e etiqueta com Correios, Jadlog, LATAM Cargo e mais." },
      { name: "Frenet", url: "https://www.frenet.com.br", description: "Gateway de frete com múltiplas transportadoras." },
      { name: "Kangu", url: "https://www.kangu.com.br", description: "Plataforma de envio com pontos de coleta." },
    ],
  },
  {
    id: "payment",
    name: "Pagamento Online",
    description: "Aceite pagamentos via cartão, Pix e boleto diretamente no checkout.",
    icon: "💳",
    providers: [
      { name: "Mercado Pago", url: "https://www.mercadopago.com.br", description: "Pagamentos com Pix, cartão e boleto. Checkout transparente." },
      { name: "Stripe", url: "https://stripe.com/br", description: "Plataforma global de pagamentos com suporte a Pix e cartão." },
      { name: "PagSeguro", url: "https://pagseguro.uol.com.br", description: "Pagamentos online com checkout PagSeguro." },
    ],
  },
  {
    id: "analytics",
    name: "Analytics / Marketing",
    description: "Acompanhe tráfego, conversão e comportamento dos clientes.",
    icon: "📈",
    providers: [
      { name: "Google Analytics", url: "https://analytics.google.com", description: "Acompanhe visitas, origem do tráfego e conversão." },
      { name: "Meta Pixel", url: "https://business.facebook.com", description: "Rastreie conversões e crie públicos para anúncios." },
      { name: "Hotjar", url: "https://www.hotjar.com", description: "Mapas de calor e gravações de sessão." },
    ],
  },
];

export default function IntegracoesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-neutral-500">Sistema</p>
          <h1 className="mt-1 text-2xl font-black uppercase">Integrações</h1>
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-400">
        Conecte o KromaLab a serviços externos para nota fiscal, frete, pagamento e mais.
        Clique em uma integração para ver as opções disponíveis.
      </p>

      <div className="mt-6 grid gap-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="rounded-lg border border-white/10 bg-white/5 transition-colors hover:border-white/20">
            <button
              type="button"
              onClick={() => setExpanded(expanded === integration.id ? null : integration.id)}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <span className="text-2xl">{integration.icon}</span>
              <div className="flex-1">
                <h2 className="text-sm font-black uppercase text-white">{integration.name}</h2>
                <p className="mt-1 text-xs text-neutral-400">{integration.description}</p>
              </div>
              <span className={`text-neutral-500 transition-transform ${expanded === integration.id ? "rotate-180" : ""}`}>▼</span>
            </button>

            {expanded === integration.id ? (
              <div className="border-t border-white/10 p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {integration.providers.map((provider) => (
                    <div key={provider.name} className="rounded-md border border-white/10 bg-white/5 p-4">
                      <h3 className="text-sm font-black text-white">{provider.name}</h3>
                      <p className="mt-1 text-xs text-neutral-400">{provider.description}</p>
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
                      >
                        Acessar site →
                      </a>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-neutral-500">
                  Para integrar, crie uma conta no serviço desejado e obtenha a chave de API. Em seguida, adicione a chave nas Configurações do admin.
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
