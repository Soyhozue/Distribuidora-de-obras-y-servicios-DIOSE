export type StockStatus = "EN_STOCK" | "STOCK_BAJO" | "AGOTADO";

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  unit?: string;
  weight?: number;
  stock: number;
  stockStatus: StockStatus;
  icon: "drill" | "saw" | "cement" | "hose" | "paint" | "wrench" | "cable" | "rod" | "fire";
  description?: string;
  specs?: Record<string, string>;
  featured?: boolean;
  images?: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    sku: "DCD778C2",
    name: "Taladro Percutor 20V MAX",
    brand: "DEWALT",
    category: "Herramientas",
    price: 2450,
    stock: 12,
    stockStatus: "EN_STOCK",
    icon: "drill",
    featured: true,
    description:
      "Taladro percutor inalámbrico con sistema FLEXVOLT ADVANTAGE, ideal para concreto y mampostería. Incluye batería 20V MAX 2.0 Ah y cargador rápido.",
    specs: { Voltaje: "20V MAX", RPM: "0 – 1,700", Chuck: "1/2\"", Peso: "1.85 kg" },
  },
  {
    id: "2",
    sku: "MIL-SC714",
    name: 'Sierra Circular 7-1/4"',
    brand: "MILWAUKEE",
    category: "Herramientas",
    price: 3800,
    stock: 8,
    stockStatus: "EN_STOCK",
    icon: "saw",
    featured: true,
  },
  {
    id: "3",
    sku: "HLM-C50",
    name: "Cemento Portland 50 kg",
    brand: "HOLCIM",
    category: "Materiales",
    price: 320,
    stock: 240,
    stockStatus: "EN_STOCK",
    icon: "cement",
    featured: true,
  },
  {
    id: "4",
    sku: "TRP-MR25",
    name: "Manguera Reforzada 25 m",
    brand: "TRUPER",
    category: "Plomería",
    price: 680,
    stock: 34,
    stockStatus: "EN_STOCK",
    icon: "hose",
    featured: true,
  },
  {
    id: "5",
    sku: "DCR-VR38",
    name: 'Varilla Corrugada 3/8"',
    brand: "DEACERO",
    category: "Materiales",
    price: 185,
    stock: 0,
    stockStatus: "AGOTADO",
    icon: "rod",
  },
  {
    id: "6",
    sku: "CMX-PI19",
    name: "Pintura Interior Blanco 19 L",
    brand: "COMEX",
    category: "Pintura",
    price: 890,
    stock: 18,
    stockStatus: "EN_STOCK",
    icon: "paint",
  },
  {
    id: "7",
    sku: "STN-LI12",
    name: 'Llave Inglesa 12"',
    brand: "STANLEY",
    category: "Herramientas",
    price: 340,
    stock: 26,
    stockStatus: "EN_STOCK",
    icon: "wrench",
  },
  {
    id: "8",
    sku: "CDX-THW12",
    name: "Cable THW 12 AWG",
    brand: "CONDUMEX",
    category: "Electricidad",
    price: 145,
    unit: "/m",
    stock: 500,
    stockStatus: "EN_STOCK",
    icon: "cable",
  },
];

export const CATEGORIES = [
  { name: "Herramientas", count: 45 },
  { name: "Materiales", count: 38 },
  { name: "Electricidad", count: 22 },
  { name: "Plomería", count: 17 },
  { name: "Pintura", count: 14 },
  { name: "Seguridad", count: 9 },
];

export const BRANDS = [
  { name: "DEWALT", count: 22 },
  { name: "MILWAUKEE", count: 18 },
  { name: "TRUPER", count: 15 },
  { name: "HOLCIM", count: 12 },
  { name: "STANLEY", count: 11 },
];
