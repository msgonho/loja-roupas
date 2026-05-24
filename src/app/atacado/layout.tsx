import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atacado — KromaLab",
  description:
    "Pedidos em volume KromaLab: uniformes, brindes, kits e coleções cápsula com processo próprio de orçamento.",
};

export default function AtacadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
