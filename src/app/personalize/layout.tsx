import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personalização — KromaLab",
  description:
    "Monte um briefing completo para camisetas, moletons, uniformes, brindes e kits personalizados KromaLab.",
};

export default function PersonalizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
