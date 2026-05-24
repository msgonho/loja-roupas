"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/admin/estoque", label: "Estoque" },
    { href: "/admin/produtos", label: "Produtos" },
    { href: "/admin/integracoes", label: "Integrações" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      <nav className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-lg font-black uppercase">Admin KromaLab</span>
            </div>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-black uppercase transition-colors ${
                    pathname === item.href
                      ? "bg-white text-black"
                      : "text-white hover:bg-neutral-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
