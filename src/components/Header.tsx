"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartContext";

const quoteHref = "/personalize#briefing-personalizacao";

const mainLinks = [
  { href: "/", label: "Início" },
  { href: "/colecao", label: "Coleção" },
  { href: "/lancamentos", label: "Lançamentos" },
  { href: "/atacado", label: "Atacado" },
];

const supportLinks = [
  { href: "/rastrear-pedido", label: "Rastrear pedido" },
  { href: "/guia-de-tamanhos", label: "Guia de tamanhos" },
  { href: "/trocas", label: "Trocas e devoluções" },
  { href: "/atendimento", label: "Atendimento" },
  { href: "/sobre", label: "Sobre a KromaLab" },
];

export default function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function linkClass(href: string) {
    const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

    return `rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-ring ${
      isActive
        ? "bg-neutral-100 text-black"
        : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
    }`;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/96 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[68px] lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-300 bg-white transition-colors hover:border-black hover:bg-neutral-100 lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={isMenuOpen}
            >
              <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
                <span className="h-0.5 rounded-full bg-black" />
                <span className="h-0.5 rounded-full bg-black" />
                <span className="h-0.5 rounded-full bg-black" />
              </span>
            </button>

            <Link href="/" className="focus-ring flex min-w-0 items-center rounded-md" aria-label="KromaLab">
              <Image
                src="/logo.png"
                alt="KromaLab"
                width={236}
                height={60}
                sizes="(min-width: 640px) 180px, 142px"
                className="h-8 w-auto sm:h-9"
                preload
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu principal">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={quoteHref}
              className="focus-ring hidden rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-bold text-neutral-900 transition-colors hover:border-black hover:bg-neutral-100 md:inline-flex"
            >
              Orçamento
            </Link>
            <Link
              href="/checkout"
              className="focus-ring inline-flex min-w-20 items-center justify-center rounded-md bg-black px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-neutral-800 sm:min-w-24 sm:px-4"
              aria-label={`Abrir sacola com ${itemCount} itens`}
            >
              Sacola ({itemCount})
            </Link>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[70] bg-black/40 transition-opacity ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-[80] h-dvh w-[min(92vw,390px)] border-r border-black/15 bg-white shadow-2xl transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu lateral da KromaLab"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-black/10 p-5">
            <Link href="/" onClick={closeMenu} className="focus-ring flex items-center rounded-md">
              <Image
                src="/logo.png"
                alt="KromaLab"
                width={236}
                height={60}
                sizes="180px"
                className="h-9 w-auto"
                preload
              />
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-lg font-black leading-none transition-colors hover:border-black hover:bg-black hover:text-white"
              aria-label="Fechar menu"
            >
              x
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Menu lateral">
            <Link
              href={quoteHref}
              onClick={closeMenu}
              className="focus-ring mb-5 flex rounded-md bg-black px-4 py-3 text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
            >
              Solicitar orçamento
            </Link>

            <p className="mb-3 text-xs font-black uppercase text-neutral-500">Comprar</p>
            <div className="grid gap-2">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="focus-ring rounded-md border border-neutral-200 px-4 py-3 text-sm font-bold text-neutral-800 transition-colors hover:border-black hover:bg-neutral-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="my-6 border-y border-black/10 py-5">
              <p className="text-xs font-black uppercase text-neutral-500">Atacado</p>
              <p className="mt-2 text-sm font-medium leading-6 text-neutral-700">
                Pedidos em volume têm formulário próprio, separado do orçamento personalizado.
              </p>
              <Link
                href="/atacado#orcamento-atacado"
                onClick={closeMenu}
                className="focus-ring mt-4 inline-flex rounded-md border border-neutral-300 px-4 py-3 text-xs font-black uppercase text-neutral-900 transition-colors hover:border-black hover:bg-neutral-100"
              >
                Orçar atacado
              </Link>
            </div>

            <p className="mb-3 text-xs font-black uppercase text-neutral-500">Suporte</p>
            <div className="grid gap-1">
              {supportLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="focus-ring rounded-md px-4 py-3 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="border-t border-black/10 bg-neutral-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-neutral-500">Sacola</p>
                <p className="text-sm font-bold text-neutral-900">{itemCount} itens no pedido</p>
              </div>
              <Link
                href="/checkout"
                onClick={closeMenu}
                className="focus-ring rounded-md bg-black px-4 py-3 text-xs font-black uppercase text-white transition-colors hover:bg-neutral-800"
              >
                Revisar
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
