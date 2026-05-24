import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
      <body className={inter.variable}>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
