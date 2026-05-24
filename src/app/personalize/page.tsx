"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Footer from "@/components/Footer";
import { WHATSAPP_NUMBER } from "@/lib/products";

type QuoteItem = {
  id: number;
  category: string;
  product: string;
  color: string;
  size: string;
  quantity: number;
  position: string;
  technique: string;
  notes: string;
  artworkFile: string;
};

const categories = ["Vestuário", "Brindes", "Uniformes", "Kit completo"];
const productsByCategory: Record<string, string[]> = {
  Vestuário: ["Camiseta premium", "Oversized", "Moletom", "Dry fit", "Outro item"],
  Brindes: ["Copo térmico", "Caneta", "Sacochila", "Squeeze", "Outro brinde"],
  Uniformes: ["Camiseta equipe", "Moletom equipe", "Kit colaborador", "Outro uniforme"],
  "Kit completo": ["Camiseta + copo", "Camiseta + sacochila", "Evento completo", "Outro kit"],
};
const colors = ["Preto", "Branco", "Grafite", "Cru", "Colorido", "A definir"];
const sizes = ["PP", "P", "M", "G", "GG", "XG", "Grade variada"];
const positions = ["Peito", "Frente central", "Costas", "Manga", "Frente e costas", "A definir"];
const techniques = ["Silk", "DTF", "Bordado", "Laser", "Sublimação", "A definir"];

function createItem(id = 1): QuoteItem {
  return {
    id,
    category: "Vestuário",
    product: "Camiseta premium",
    color: "Preto",
    size: "M",
    quantity: 12,
    position: "Frente central",
    technique: "DTF",
    notes: "",
    artworkFile: "",
  };
}

export default function PersonalizePage() {
  const [items, setItems] = useState<QuoteItem[]>([createItem(1)]);
  const [contact, setContact] = useState({
    name: "",
    whatsapp: "",
    email: "",
    company: "",
  });
  const [urgency, setUrgency] = useState("Prazo flexível");

  const totalUnits = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  function updateItem<T extends keyof QuoteItem>(
    id: number,
    field: T,
    value: QuoteItem[T]
  ) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (field === "category") {
          const nextCategory = value as string;
          return {
            ...item,
            category: nextCategory,
            product: productsByCategory[nextCategory][0],
          };
        }

        return { ...item, [field]: value };
      })
    );
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, createItem(Date.now())]);
  }

  function removeItem(id: number) {
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((item) => item.id !== id)
    );
  }

  function sendQuote() {
    if (!contact.name || !contact.whatsapp || !contact.email) {
      alert("Preencha nome, WhatsApp e e-mail para enviar o briefing.");
      return;
    }

    const message = [
      "NOVO BRIEFING KROMALAB",
      "",
      `Cliente: ${contact.name}`,
      `Empresa/projeto: ${contact.company || "Não informado"}`,
      `WhatsApp: ${contact.whatsapp}`,
      `E-mail: ${contact.email}`,
      `Prazo: ${urgency}`,
      `Total estimado: ${totalUnits} unidades`,
      "",
      ...items.flatMap((item, index) => [
        `Item ${index + 1}: ${item.category}`,
        `Produto: ${item.product}`,
        `Cor: ${item.color}`,
        `Tamanho/grade: ${item.size}`,
        `Quantidade: ${item.quantity}`,
        `Posição: ${item.position}`,
        `Técnica: ${item.technique}`,
        `Arquivo: ${item.artworkFile || "Não anexado no site"}`,
        `Observações: ${item.notes || "Sem observações"}`,
        "",
      ]),
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
              Personalização
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-tight md:text-6xl">
              Monte um briefing pronto para orçar.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-neutral-600">
              Camisetas, moletons, uniformes, brindes e kits com campos para
              produto, grade, técnica, arte e prazo.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["24h", "retorno comercial"],
                ["12+", "unidades sugeridas"],
                ["1:1", "revisão de arte"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md border border-neutral-200 bg-white p-4">
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase text-neutral-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-md bg-neutral-100 md:min-h-[440px]">
            <Image
              src="/personalize_1.png"
              alt="Camisetas personalizadas KromaLab"
              fill
              preload
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="briefing-personalizacao" className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="grid gap-5">
            {items.map((item, index) => {
              const productOptions = productsByCategory[item.category];

              return (
                <section key={item.id} className="rounded-md border border-neutral-200 bg-white p-5 md:p-6">
                  <div className="flex flex-col gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-neutral-500">
                        Item {index + 1}
                      </p>
                      <h2 className="text-2xl font-black uppercase">
                        {item.category}
                      </h2>
                    </div>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-black uppercase text-neutral-600 transition-colors hover:border-black hover:bg-neutral-100"
                      >
                        Remover
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-12">
                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-4">
                      Categoria
                      <select
                        value={item.category}
                        onChange={(event) =>
                          updateItem(item.id, "category", event.target.value)
                        }
                        className="focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold normal-case text-black"
                      >
                        {categories.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-5">
                      Produto
                      <select
                        value={item.product}
                        onChange={(event) =>
                          updateItem(item.id, "product", event.target.value)
                        }
                        className="focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold normal-case text-black"
                      >
                        {productOptions.map((product) => (
                          <option key={product}>{product}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-3">
                      Quantidade
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "quantity",
                            Math.max(Number(event.target.value) || 1, 1)
                          )
                        }
                        className="focus-ring w-full min-w-0 rounded-md border border-neutral-300 px-4 py-3 text-sm font-bold text-black"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-3">
                      Cor
                      <select
                        value={item.color}
                        onChange={(event) =>
                          updateItem(item.id, "color", event.target.value)
                        }
                        className="focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold normal-case text-black"
                      >
                        {colors.map((color) => (
                          <option key={color}>{color}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-3">
                      Tamanho
                      <select
                        value={item.size}
                        onChange={(event) =>
                          updateItem(item.id, "size", event.target.value)
                        }
                        className="focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold normal-case text-black"
                      >
                        {sizes.map((size) => (
                          <option key={size}>{size}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-3">
                      Posição
                      <select
                        value={item.position}
                        onChange={(event) =>
                          updateItem(item.id, "position", event.target.value)
                        }
                        className="focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold normal-case text-black"
                      >
                        {positions.map((position) => (
                          <option key={position}>{position}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-3">
                      Técnica
                      <select
                        value={item.technique}
                        onChange={(event) =>
                          updateItem(item.id, "technique", event.target.value)
                        }
                        className="focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold normal-case text-black"
                      >
                        {techniques.map((technique) => (
                          <option key={technique}>{technique}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-5">
                      Arte
                      <span className="focus-ring flex min-h-28 cursor-pointer flex-col justify-center gap-3 rounded-md border border-dashed border-neutral-300 px-4 py-3 normal-case text-neutral-700 transition-colors hover:border-black sm:min-h-0 sm:flex-row sm:items-center sm:justify-between">
                        <span className="rounded-md bg-black px-3 py-2 text-xs font-black uppercase text-white">
                          Escolher arquivo
                        </span>
                        <span className="min-w-0 truncate text-sm font-bold">
                          {item.artworkFile || "Nenhum arquivo selecionado"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf,.ai,.eps,.svg"
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              "artworkFile",
                              event.target.files?.[0]?.name ?? ""
                            )
                          }
                          className="sr-only"
                        />
                      </span>
                    </label>

                    <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-7">
                      Observações
                      <textarea
                        rows={4}
                        value={item.notes}
                        onChange={(event) =>
                          updateItem(item.id, "notes", event.target.value)
                        }
                        className="focus-ring resize-none rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                        placeholder="Detalhes da arte, referências, cores especiais, embalagem ou prazo."
                      />
                    </label>
                  </div>
                </section>
              );
            })}

            <button
              type="button"
              onClick={addItem}
              className="focus-ring rounded-md border border-dashed border-black bg-white px-5 py-5 text-sm font-black uppercase transition-colors hover:bg-neutral-100"
            >
              Adicionar outro item
            </button>
          </div>

          <aside className="rounded-md border border-neutral-200 bg-white p-5 md:p-6 lg:sticky lg:top-24">
            <p className="text-xs font-black uppercase text-[var(--accent)]">Resumo do briefing</p>
            <h2 className="mt-1 text-2xl font-black uppercase">Solicitação</h2>

            <div className="mt-5 grid gap-3 rounded-md bg-[var(--mint)] p-4 text-sm font-bold text-neutral-800">
              <div className="flex justify-between">
                <span>Itens</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Unidades</span>
                <span>{totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo</span>
                <span>{totalUnits >= 30 ? "Atacado" : "Sob demanda"}</span>
              </div>
            </div>

            <label className="mt-5 grid gap-2 text-sm font-black uppercase text-neutral-700">
              Prazo
              <select
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
                className="focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold normal-case text-black"
              >
                <option>Prazo flexível</option>
                <option>Tenho uma data de evento</option>
                <option>Preciso com urgência</option>
              </select>
            </label>

            <div className="mt-5 grid gap-3">
              <input
                type="text"
                value={contact.name}
                onChange={(event) =>
                  setContact((current) => ({ ...current, name: event.target.value }))
                }
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium"
                placeholder="Nome completo"
              />
              <input
                type="text"
                value={contact.company}
                onChange={(event) =>
                  setContact((current) => ({ ...current, company: event.target.value }))
                }
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium"
                placeholder="Empresa ou projeto"
              />
              <input
                type="tel"
                value={contact.whatsapp}
                onChange={(event) =>
                  setContact((current) => ({ ...current, whatsapp: event.target.value }))
                }
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium"
                placeholder="WhatsApp com DDD"
              />
              <input
                type="email"
                value={contact.email}
                onChange={(event) =>
                  setContact((current) => ({ ...current, email: event.target.value }))
                }
                className="focus-ring rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium"
                placeholder="E-mail"
              />
            </div>

            <button
              type="button"
              onClick={sendQuote}
              className="focus-ring mt-5 w-full rounded-md bg-black px-5 py-4 text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
            >
              Enviar orçamento
            </button>

            <Link
              href="/atacado#orcamento-atacado"
              className="focus-ring mt-3 flex justify-center rounded-md border border-neutral-300 px-5 py-4 text-sm font-black uppercase text-neutral-900 transition-colors hover:border-black hover:bg-neutral-100"
            >
              Orçar atacado
            </Link>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
