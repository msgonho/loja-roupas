export type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  badge: string;
  category: "ready" | "drop" | "custom";
  fit: string;
  material: string;
  color: string;
  sizes: string[];
  description: string;
  stock: string;
  launch: boolean;
};

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const products: Product[] = [
  {
    id: 101,
    slug: "oversized-kromalab-black",
    name: "Oversized Kroma Black",
    price: 119.9,
    image: "/oversized.png",
    badge: "Best seller",
    category: "ready",
    fit: "Oversized",
    material: "Algodão premium 220g",
    color: "Preto",
    sizes: ["P", "M", "G", "GG"],
    description:
      "Camiseta pesada com logo tonal, caimento amplo e acabamento limpo para uso diário.",
    stock: "Pronta entrega",
    launch: true,
  },
  {
    id: 102,
    slug: "moletom-heavy-kromalab",
    name: "Moletom Heavy Kroma",
    price: 249.9,
    image: "/moletom.png",
    badge: "Novo drop",
    category: "drop",
    fit: "Relaxado",
    material: "Moletom 3 cabos",
    color: "Preto",
    sizes: ["P", "M", "G", "GG"],
    description:
      "Moletom estruturado, toque macio por dentro e aplicação discreta no peito.",
    stock: "Baixo estoque",
    launch: true,
  },
  {
    id: 103,
    slug: "tee-lash-designer",
    name: "Tee Lash Designer",
    price: 99.9,
    image: "/naosepreocupesoulashdesigner1.png",
    badge: "Profissões",
    category: "ready",
    fit: "Regular",
    material: "Algodão penteado",
    color: "Preto e rosé",
    sizes: ["P", "M", "G"],
    description:
      "Peça pronta para negócios criativos, studios de beleza e equipes pequenas.",
    stock: "Pronta entrega",
    launch: false,
  },
  {
    id: 104,
    slug: "personalize-sua-camiseta",
    name: "Camiseta Personalizada",
    price: 139.9,
    image: "/personalize_1.png",
    badge: "Sob demanda",
    category: "custom",
    fit: "A escolher",
    material: "Malha premium",
    color: "Preto ou branco",
    sizes: ["PP", "P", "M", "G", "GG"],
    description:
      "Base premium para sua arte, marca, uniforme, evento ou coleção cápsula.",
    stock: "Produção sob demanda",
    launch: true,
  },
  {
    id: 105,
    slug: "cargo-utility-dark",
    name: "Cargo Utility Dark",
    price: 189.9,
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=900",
    badge: "Utilitário",
    category: "ready",
    fit: "Reto",
    material: "Sarja leve",
    color: "Grafite",
    sizes: ["38", "40", "42", "44"],
    description:
      "Calça cargo para compor kits urbanos com camiseta oversized ou moletom.",
    stock: "Pronta entrega",
    launch: false,
  },
  {
    id: 106,
    slug: "kit-evento-kromalab",
    name: "Kit Evento KromaLab",
    price: 159.9,
    image: "/fundo_page_inicial.png",
    badge: "Atacado",
    category: "custom",
    fit: "Kit",
    material: "Camiseta, copo e sacochila",
    color: "Personalizável",
    sizes: ["10+", "30+", "50+"],
    description:
      "Combo de entrada para eventos, equipes, feiras e ações de marca.",
    stock: "Orçamento rápido",
    launch: false,
  },
];

export const shopProducts = products.filter((product) => product.category !== "custom");
export const launchProducts = shopProducts.filter((product) => product.launch);
export const readyProducts = products.filter((product) => product.category !== "custom");
export const customProducts = products.filter((product) => product.category === "custom");

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
