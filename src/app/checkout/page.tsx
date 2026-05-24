"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";
import { currency, products } from "@/lib/products";

const shippingOptions = [
  {
    id: "standard",
    title: "Entrega padrão",
    subtitle: "4 a 7 dias úteis após confirmação",
    price: 18.9,
  },
  {
    id: "express",
    title: "Entrega expressa",
    subtitle: "2 a 3 dias úteis para capitais",
    price: 34.9,
  },
  {
    id: "pickup",
    title: "Retirada combinada",
    subtitle: "Ideal para pedidos locais e atacado",
    price: 0,
  },
];

const paymentMethods = [
  { id: "pix", title: "Pix", subtitle: "Desconto Pix por produto" },
  { id: "card", title: "Cartão", subtitle: "Gateway pendente de integração" },
  { id: "quote", title: "Pedido assistido", subtitle: "Enviar resumo para atendimento" },
];

export default function CheckoutPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    subtotal,
  } = useCart();

  const [shippingMethod, setShippingMethod] = useState(shippingOptions[0].id);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [coupon, setCoupon] = useState("");
  const [customizationNote, setCustomizationNote] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    whatsapp: "",
    email: "",
    cep: "",
    city: "",
    address: "",
    bairro: "",
    complement: "",
    number: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cepLoading, setCepLoading] = useState(false);

  const lookupCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErrors((prev) => ({ ...prev, cep: "CEP não encontrado" }));
      } else {
        setCustomer((prev) => ({
          ...prev,
          address: data.logradouro || "",
          bairro: data.bairro || "",
          city: data.localidade ? `${data.localidade} / ${data.uf}` : prev.city,
        }));
        setErrors((prev) => ({ ...prev, cep: "" }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, cep: "Erro ao buscar CEP" }));
    }
    setCepLoading(false);
  }, []);

  const selectedShipping = useMemo(
    () =>
      shippingOptions.find((option) => option.id === shippingMethod) ??
      shippingOptions[0],
    [shippingMethod]
  );

  const shipping =
    itemCount === 0 || selectedShipping.id === "pickup" || subtotal >= 299
      ? 0
      : selectedShipping.price;
  const pixDiscount = useMemo(() => {
    if (paymentMethod !== "pix") return 0;
    return cart.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.id);
      const rate = product?.pixDiscount ?? 0.05;
      return acc + item.price * item.quantity * rate;
    }, 0);
  }, [paymentMethod, cart]);
  const couponDiscount = coupon.trim().toUpperCase() === "KROMA10" ? subtotal * 0.1 : 0;
  const total = Math.max(subtotal + shipping - pixDiscount - couponDiscount, 0);

  function validateCustomer() {
    const newErrors: Record<string, string> = {};

    if (!customer.name.trim()) {
      newErrors.name = "Preencha seu nome";
    }
    if (!customer.whatsapp.trim()) {
      newErrors.whatsapp = "Preencha o WhatsApp";
    }
    if (!customer.email.trim() || !customer.email.includes("@")) {
      newErrors.email = "Preencha um e-mail válido";
    }
    if (!customer.cep.trim()) {
      newErrors.cep = "Preencha o CEP";
    }
    if (!customer.address.trim()) {
      newErrors.address = "Preencha o endereço";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function finishOrder() {
    if (itemCount === 0) {
      return;
    }

    if (!validateCustomer()) {
      return;
    }

    const orderPayload = {
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      customer,
      shipping: { method: selectedShipping.title, price: shipping },
      payment: paymentMethod,
      subtotal,
      discount: pixDiscount + couponDiscount,
      total,
      note: customizationNote,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const order = await response.json();
      setOrderCode(order.id);
    } catch {
      const code = `KR-${Date.now().toString().slice(-6)}`;
      setOrderCode(code);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-black">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <p className="text-xs font-black uppercase text-[var(--accent)]">Checkout premium</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black uppercase leading-tight md:text-6xl">
                Sacola, pedido e pagamento em um fluxo limpo.
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-neutral-600">
                O checkout está preparado para receber a integração do gateway:
                itens, dados, entrega, pagamento e resumo já estão organizados.
              </p>
            </div>

            <div className="rounded-lg bg-[var(--mint)] p-5">
              <p className="text-sm font-black uppercase">Status do pedido</p>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-black uppercase">
                {["Sacola", "Dados", "Entrega", "Pagar"].map((step, index) => (
                  <span
                    key={step}
                    className={`rounded-lg px-2 py-3 ${
                      index === 0 || itemCount > 0
                        ? "bg-black text-white"
                        : "bg-white text-neutral-500"
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {cart.length === 0 ? (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-6 rounded-lg bg-white p-6 shadow-sm md:grid-cols-[1fr_0.8fr] md:p-8">
            <div>
              <p className="text-sm font-black uppercase text-[var(--accent)]">
                Sua sacola está vazia
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-tight md:text-5xl">
                Escolha uma peça para iniciar o pedido.
              </h2>
              <p className="mt-4 text-sm font-medium leading-6 text-neutral-600">
                A sacola salva os itens no navegador e volta pronta quando você
                retornar ao checkout.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/colecao"
                  className="focus-ring rounded-lg bg-black px-6 py-4 text-center text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
                >
                  Ver coleção
                </Link>
                <Link
                  href="/personalize#briefing-personalizacao"
                  className="focus-ring rounded-lg bg-[var(--accent-soft)] px-6 py-4 text-center text-sm font-black uppercase text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
                >
                  Orçar personalizado
                </Link>
              </div>
            </div>
            <div className="rounded-lg bg-neutral-100 p-5">
              <p className="text-sm font-black uppercase">O checkout já cobre</p>
              <ul className="mt-4 grid gap-3 text-sm font-bold text-neutral-700">
                <li>Sacola editável com quantidade e remoção</li>
                <li>Dados do cliente, entrega e observações</li>
                <li>Pix, cartão e pedido assistido como métodos</li>
                <li>Cupom, desconto e resumo final</li>
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
            <div className="grid gap-6">
              <section className="rounded-lg bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-neutral-500">Etapa 1</p>
                    <h2 className="text-2xl font-black uppercase">Sacola</h2>
                  </div>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="focus-ring rounded-lg border border-neutral-300 px-4 py-3 text-sm font-black uppercase text-neutral-700 transition-colors hover:border-black hover:bg-neutral-100"
                  >
                    Limpar sacola
                  </button>
                </div>

                <div className="mt-5 grid gap-5">
                  {cart.map((item) => {
                    const prod = products.find((p) => p.id === item.id);
                    const slug = prod?.slug;
                    return (
                    <article
                      key={item.id}
                      className="grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-[104px_1fr_auto]"
                    >
                      <Link href={slug ? `/produto/${slug}` : "#"} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100 block">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="104px"
                          className="object-cover"
                        />
                      </Link>

                      <div>
                        <Link href={slug ? `/produto/${slug}` : "#"} className="text-base font-black uppercase hover:underline">{item.name}</Link>
                        <p className="mt-1 text-sm font-bold text-neutral-600">
                          {currency.format(item.price)} un.
                        </p>
                        <div className="mt-4 inline-flex items-center rounded-lg border border-neutral-300">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="focus-ring h-10 w-10 rounded-l-lg text-lg font-black transition-colors hover:bg-neutral-100"
                            aria-label="Diminuir quantidade"
                          >
                            -
                          </button>
                          <span className="flex h-10 w-10 items-center justify-center border-x border-neutral-300 text-sm font-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="focus-ring h-10 w-10 rounded-r-lg text-lg font-black transition-colors hover:bg-neutral-100"
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <p className="text-lg font-black">
                          {currency.format(item.price * item.quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black uppercase text-red-500 transition-colors hover:bg-red-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          Remover
                        </button>
                      </div>
                    </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg bg-white p-5 shadow-sm md:p-6">
                <p className="text-xs font-black uppercase text-neutral-500">Etapa 2</p>
                <h2 className="mt-1 text-2xl font-black uppercase">Dados do cliente</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
                    Nome completo
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={customer.name}
                      onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                      className={`focus-ring rounded-lg border px-4 py-3 text-sm font-medium normal-case text-black ${errors.name ? "border-red-400" : "border-neutral-300"}`}
                      placeholder="Seu nome"
                    />
                    {errors.name ? <span className="text-xs font-bold normal-case text-red-500">{errors.name}</span> : null}
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
                    WhatsApp
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      value={customer.whatsapp}
                      onChange={(event) => setCustomer({ ...customer, whatsapp: event.target.value })}
                      className={`focus-ring rounded-lg border px-4 py-3 text-sm font-medium normal-case text-black ${errors.whatsapp ? "border-red-400" : "border-neutral-300"}`}
                      placeholder="(00) 00000-0000"
                    />
                    {errors.whatsapp ? <span className="text-xs font-bold normal-case text-red-500">{errors.whatsapp}</span> : null}
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700 md:col-span-2">
                    E-mail
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={customer.email}
                      onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                      className={`focus-ring rounded-lg border px-4 py-3 text-sm font-medium normal-case text-black ${errors.email ? "border-red-400" : "border-neutral-300"}`}
                      placeholder="voce@email.com"
                    />
                    {errors.email ? <span className="text-xs font-bold normal-case text-red-500">{errors.email}</span> : null}
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
                    CEP
                    <div className="relative">
                      <input
                        type="text"
                        required
                        autoComplete="postal-code"
                        value={customer.cep}
                        onChange={(event) => {
                          const val = event.target.value;
                          setCustomer({ ...customer, cep: val });
                          setErrors((prev) => ({ ...prev, cep: "" }));
                          if (val.replace(/\D/g, "").length === 8) lookupCep(val);
                        }}
                        onBlur={() => lookupCep(customer.cep)}
                        className={`focus-ring w-full rounded-lg border px-4 py-3 text-sm font-medium normal-case text-black ${errors.cep ? "border-red-400" : "border-neutral-300"}`}
                        placeholder="00000-000"
                      />
                      {cepLoading ? <span className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-black" /> : null}
                    </div>
                    {errors.cep ? <span className="text-xs font-bold normal-case text-red-500">{errors.cep}</span> : null}
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
                    Cidade e estado
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={customer.city}
                      onChange={(event) => setCustomer({ ...customer, city: event.target.value })}
                      className="focus-ring rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black bg-neutral-50"
                      placeholder="Preenchido pelo CEP"
                      readOnly
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
                    Rua / Logradouro
                    <input
                      type="text"
                      required
                      autoComplete="street-address"
                      value={customer.address}
                      onChange={(event) => setCustomer({ ...customer, address: event.target.value })}
                      className={`focus-ring rounded-lg border px-4 py-3 text-sm font-medium normal-case text-black bg-neutral-50 ${errors.address ? "border-red-400" : "border-neutral-300"}`}
                      placeholder="Preenchido pelo CEP"
                      readOnly
                    />
                    {errors.address ? <span className="text-xs font-bold normal-case text-red-500">{errors.address}</span> : null}
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
                    Bairro
                    <input
                      type="text"
                      value={customer.bairro}
                      onChange={(event) => setCustomer({ ...customer, bairro: event.target.value })}
                      className="focus-ring rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black bg-neutral-50"
                      placeholder="Preenchido pelo CEP"
                      readOnly
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
                    Número
                    <input
                      type="text"
                      required
                      value={customer.number}
                      onChange={(event) => setCustomer({ ...customer, number: event.target.value })}
                      className="focus-ring rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                      placeholder="123"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase text-neutral-700">
                    Complemento
                    <input
                      type="text"
                      value={customer.complement}
                      onChange={(event) => setCustomer({ ...customer, complement: event.target.value })}
                      className="focus-ring rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                      placeholder="Apto, bloco..."
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-lg bg-white p-5 shadow-sm md:p-6">
                <p className="text-xs font-black uppercase text-neutral-500">Etapa 3</p>
                <h2 className="mt-1 text-2xl font-black uppercase">Entrega e personalização</h2>
                <div className="mt-5 grid gap-3">
                  {shippingOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setShippingMethod(option.id)}
                      className={`focus-ring rounded-lg border p-4 text-left transition-colors ${
                        shippingMethod === option.id
                          ? "border-black bg-black text-white"
                          : "border-neutral-200 bg-white text-black hover:border-black"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-4">
                        <span>
                          <span className="block text-sm font-black uppercase">{option.title}</span>
                          <span className="mt-1 block text-sm font-medium opacity-75">
                            {option.subtitle}
                          </span>
                        </span>
                        <span className="text-sm font-black">
                          {option.price === 0 ? "Grátis" : currency.format(option.price)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <label className="mt-5 grid gap-2 text-sm font-black uppercase text-neutral-700">
                  Observações do pedido
                  <textarea
                    rows={4}
                    value={customizationNote}
                    onChange={(event) => setCustomizationNote(event.target.value)}
                    className="focus-ring resize-none rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                    placeholder="Tamanho, ajuste, prazo, presente, arte ou instrução para a equipe."
                  />
                </label>
              </section>

              <section className="rounded-lg bg-white p-5 shadow-sm md:p-6">
                <p className="text-xs font-black uppercase text-neutral-500">Etapa 4</p>
                <h2 className="mt-1 text-2xl font-black uppercase">Pagamento</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`focus-ring min-h-28 rounded-lg border p-4 text-left transition-colors ${
                        paymentMethod === method.id
                          ? "border-black bg-[var(--accent-soft)] text-black"
                          : "border-neutral-200 bg-white hover:border-black"
                      }`}
                    >
                      <span className="block text-sm font-black uppercase">{method.title}</span>
                      <span className="mt-2 block text-sm font-medium leading-5 text-neutral-600">
                        {method.subtitle}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-lg bg-neutral-100 p-4 text-sm font-medium leading-6 text-neutral-700">
                  A integração com gateway ainda não foi conectada. Quando ela
                  entrar, este bloco pode abrir Pix, cartão tokenizado ou link
                  de pagamento sem refazer o checkout.
                </div>
              </section>
            </div>

            <aside className="rounded-lg bg-white p-5 shadow-xl md:p-6 lg:sticky lg:top-24">
              <p className="text-xs font-black uppercase text-[var(--accent)]">Resumo</p>
              <h2 className="mt-1 text-2xl font-black uppercase">Pedido</h2>

              <div className="mt-5 grid gap-3 border-y border-black/10 py-5 text-sm font-bold">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Itens</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{currency.format(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">
                    {subtotal >= 299 ? "Frete grátis ativo" : selectedShipping.title}
                  </span>
                  <span>{shipping === 0 ? "Grátis" : currency.format(shipping)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Desconto Pix</span>
                  <span>- {currency.format(pixDiscount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Cupom</span>
                  <span>- {currency.format(couponDiscount)}</span>
                </div>
              </div>

              <label className="mt-5 grid gap-2 text-sm font-black uppercase text-neutral-700">
                Cupom
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value)}
                    className="focus-ring min-w-0 flex-1 rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium normal-case text-black"
                    placeholder="Ex: KROMA10"
                  />
                  <button
                    type="button"
                    className="focus-ring rounded-lg bg-neutral-100 px-4 py-3 text-sm font-black uppercase transition-colors hover:bg-neutral-200"
                  >
                    Aplicar
                  </button>
                </div>
              </label>

              <div className="mt-5 rounded-lg bg-[var(--mint)] p-4">
                <p className="text-sm font-black uppercase">Pedido assistido</p>
                <p className="mt-2 text-sm font-bold leading-6 text-neutral-700">
                  Para atacado e personalizados, a equipe pode revisar arte,
                  grade, prazo e entrega antes da cobrança.
                </p>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <span className="text-sm font-black uppercase text-neutral-500">Total</span>
                <span className="text-3xl font-black">{currency.format(total)}</span>
              </div>

              <button
                type="button"
                onClick={finishOrder}
                className="focus-ring mt-5 w-full rounded-lg bg-black px-5 py-4 text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
              >
                Continuar para pagamento
              </button>

              {orderCode ? (
                <div className="mt-4 rounded-lg bg-[var(--accent-soft)] p-4">
                  <p className="text-xs font-black uppercase text-[var(--accent)]">
                    Pedido gerado
                  </p>
                  <p className="mt-1 text-lg font-black">{orderCode}</p>
                </div>
              ) : null}

              {customizationNote ? (
                <p className="mt-4 rounded-lg bg-neutral-100 p-3 text-xs font-bold leading-5 text-neutral-600">
                  Observação salva: {customizationNote}
                </p>
              ) : null}
            </aside>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
