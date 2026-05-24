import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rastrear Pedido — KromaLab",
  description:
    "Consulte o status do seu pedido KromaLab com o código recebido por e-mail ou WhatsApp.",
};

export default function RastrearPedidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
