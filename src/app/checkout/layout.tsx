import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — KromaLab",
  description:
    "Finalize seu pedido KromaLab: sacola, dados, entrega e pagamento em um fluxo limpo.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
