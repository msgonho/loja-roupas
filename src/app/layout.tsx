import type { Metadata } from "next";
import "./globals.css";

import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "KromaLab Personalizados",
  description:
    "Streetwear, camisetas personalizadas, brindes e pedidos em atacado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
