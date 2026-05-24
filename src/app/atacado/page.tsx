"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import Footer from "@/components/Footer";
import { WHATSAPP_NUMBER } from "@/lib/products";

const packs = [
  {
    name: "Equipe enxuta",
    range: "12 a 29 unidades",
    items: "Camisetas, moletons ou kits simples.",
  },
  {
    name: "Marca e evento",
    range: "30 a 99 unidades",
    items: "Grade variada, brindes e embalagem.",
  },
  {
    name: "Produção em escala",
    range: "100+ unidades",
    items: "Uniformes, coleção cápsula e campanhas.",
  },
];

const steps = [
  ["Briefing", "Você envia peça, quantidade, arte, prazo e destino."],
  ["Prova digital", "A equipe revisa aplicação, escala, técnica e cores."],
  ["Aprovação", "Tudo fica documentado antes de liberar a produção."],
  ["Entrega", "Pedido separado por grade, kit ou lote conforme combinado."],
];

export default function AtacadoPage() {
  function sendWholesaleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const message = [
      "NOVO PEDIDO DE ATACADO KROMALAB",
      "",
      `Nome: ${formData.get("name") || ""}`,
      `Empresa/projeto: ${formData.get("company") || ""}`,
      `WhatsApp: ${formData.get("whatsapp") || ""}`,
      `E-mail: ${formData.get("email") || ""}`,
      `Tipo de pedido: ${formData.get("orderType") || ""}`,
      `Quantidade estimada: ${formData.get("quantity") || ""}`,
      `Prazo desejado: ${formData.get("deadline") || ""}`,
      `Observações: ${formData.get("notes") || ""}`,
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase text-[var(--accent)]">
              Pedidos em atacado
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-tight md:text-6xl">
              Atacado KromaLab para pedidos em volume.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-neutral-600">
              Uniformes, brindes, kits e coleções cápsula com processo próprio:
              briefing, prova digital, aprovação e entrega combinada.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#orcamento-atacado"
                className="focus-ring rounded-md bg-black px-6 py-4 text-center text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
              >
                Solicitar orçamento
              </Link>
              <Link
                href="#processo"
                className="focus-ring rounded-md border border-neutral-300 px-6 py-4 text-center text-sm font-black uppercase text-neutral-900 transition-colors hover:border-black hover:bg-neutral-100"
              >
                Ver processo
              </Link>
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden rounded-md bg-neutral-100 md:min-h-[500px]">
            <Image
              src="/fundo_page_inicial.png"
              alt="Kit personalizado KromaLab para atacado"
              fill
              preload
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase text-[var(--accent)]">Faixas de pedido</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black uppercase leading-tight md:text-5xl">
            Escolha o volume antes de fechar detalhes.
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {packs.map((pack) => (
              <article key={pack.name} className="rounded-md border border-neutral-200 bg-white p-5">
                <p className="text-lg font-black uppercase">{pack.name}</p>
                <p className="mt-3 text-sm font-black text-[var(--accent)]">{pack.range}</p>
                <p className="mt-4 text-sm font-medium leading-6 text-neutral-600">{pack.items}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="processo" className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase text-[var(--accent)]">Fluxo comercial</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight md:text-4xl">
              Menos improviso, mais controle de produção.
            </h2>
            <p className="mt-4 text-sm font-medium leading-6 text-neutral-600">
              O atacado precisa ser claro antes do pagamento. Por isso esta
              página concentra volume, prazo, arte e aprovação em um pedido só.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {steps.map(([title, text], index) => (
              <article key={title} className="rounded-md border border-neutral-200 p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-black text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-black uppercase">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-neutral-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="orcamento-atacado" className="py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase text-[var(--accent)]">
              Orçamento de atacado
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight md:text-5xl">
              Envie o pedido em volume sem sair desta página.
            </h2>
            <p className="mt-5 text-base font-medium leading-7 text-neutral-600">
              Este formulário é separado da personalização individual para não
              misturar varejo, orçamento sob demanda e produção em escala.
            </p>
          </div>

          <form
            onSubmit={sendWholesaleRequest}
            className="grid gap-4 rounded-md border border-neutral-200 bg-white p-5 md:grid-cols-2 md:p-6"
          >
            <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
              Nome
              <input
                name="name"
                type="text"
                required
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                placeholder="Seu nome"
              />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
              Empresa ou projeto
              <input
                name="company"
                type="text"
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                placeholder="Nome da marca, equipe ou evento"
              />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
              WhatsApp
              <input
                name="whatsapp"
                type="tel"
                required
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                placeholder="(00) 00000-0000"
              />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
              E-mail
              <input
                name="email"
                type="email"
                required
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                placeholder="voce@email.com"
              />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
              Tipo de pedido
              <select
                name="orderType"
                className="focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold normal-case text-black"
              >
                <option>Uniformes</option>
                <option>Brindes</option>
                <option>Kit completo</option>
                <option>Coleção cápsula</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
              Quantidade estimada
              <input
                name="quantity"
                type="number"
                min="12"
                defaultValue="30"
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
              />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-2">
              Prazo desejado
              <input
                name="deadline"
                type="text"
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                placeholder="Ex: evento em 20/06"
              />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-2">
              Observações
              <textarea
                name="notes"
                rows={4}
                className="focus-ring resize-none rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                placeholder="Conte o produto, cores, arte, embalagem e destino do pedido."
              />
            </label>
            <button
              type="submit"
              className="focus-ring rounded-md bg-black px-5 py-4 text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800 md:col-span-2"
            >
              Enviar orçamento de atacado
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
