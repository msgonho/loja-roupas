"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◉" },
  { href: "/admin/produtos", label: "Produtos", icon: "▦" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "◈" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Auth check failed");
        return r.json();
      })
      .then((data) => {
        if (!data.authenticated) {
          router.replace("/admin/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE", credentials: "include" });
    router.replace("/admin/login");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101010]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    );
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebar = (
    <>
      <div className="border-b border-white/10 p-4">
        <Link href="/admin">
          <Image
            src="/kromalab-logo-transparent.png"
            alt="KromaLab Admin"
            width={236}
            height={60}
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>
        <p className="mt-1 text-xs font-bold text-neutral-500">Painel admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="grid gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-colors ${
                isActive(item.href)
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          ↗ Ver loja
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10"
        >
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#101010]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-[#0a0a0a] md:flex">
        {sidebar}
      </aside>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-4 py-3 md:hidden">
        <Link href="/admin">
          <Image
            src="/kromalab-logo-transparent.png"
            alt="KromaLab"
            width={236}
            height={60}
            className="h-7 w-auto brightness-0 invert"
          />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md border border-white/10 px-3 py-1.5 text-sm font-bold text-white"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-white/10 bg-[#0a0a0a] md:hidden">
            {sidebar}
          </aside>
        </>
      ) : null}

      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
