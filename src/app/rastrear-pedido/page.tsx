"use client";

import { useState } from "react";
import Footer from "@/components/Footer";

const timeline = [
  ["Pedido recebido", "Resumo salvo e aguardando confirmação."],
  ["Prova de arte", "Equipe revisa aplicação e arquivos."],
  ["Produção", "Peças em impressão, bordado ou separação."],
  ["Entrega", "Objeto enviado ou retirada combinada."],
];

export default function RastrearPedidoPage() {
  const [code, setCode] = useState("");
  const [searchedCode, setSearchedCode] = useState("");

  function searchOrder() {
    setSearchedCode(code.trim().toUpperCase());
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-neutral-200 bg-white p-6 md:p-8">
            <p className="text-xs font-black uppercase text-[var(--accent)]">Pedido</p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-tight md:text-5xl">
              Rastrear pedido
            </h1>
            <p className="mt-4 text-sm font-medium leading-6 text-neutral-600">
              Consulte o código recebido por e-mail ou WhatsApp. Nesta versão,
              o rastreio já está desenhado para conectar ao sistema de pedidos.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Ex: KR-123456"
                className="focus-ring min-w-0 flex-1 rounded-md border border-neutral-300 px-4 py-4 text-sm font-bold uppercase"
              />
              <button
                type="button"
                onClick={searchOrder}
                className="focus-ring rounded-md bg-black px-6 py-4 text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
              >
                Consultar
              </button>
            </div>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-6 md:p-8">
            <div className="flex flex-col gap-2 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-neutral-500">Status</p>
                <h2 className="text-2xl font-black uppercase">
                  {searchedCode || "Aguardando código"}
                </h2>
              </div>
              <span className="rounded-md bg-[var(--mint)] px-3 py-2 text-xs font-black uppercase">
                Demo pronta
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {timeline.map(([title, text], index) => (
                <div key={title} className="grid grid-cols-[40px_1fr] gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-black text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-black uppercase">{title}</p>
                    <p className="mt-1 text-sm font-medium leading-6 text-neutral-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
