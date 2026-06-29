export type OrderStatus = "Confirmado" | "Entregado" | "Cancelado" | "Pendiente";

export type OrderSummary = {
  number: string;
  date: string;
  products: string;
  total: number;
  status: OrderStatus;
};

export const ORDERS: OrderSummary[] = [
  { number: "#2048", date: "28 Jun 2026", products: "Taladro Percutor · Cemento ×5 · Llave ×2", total: 5010, status: "Confirmado" },
  { number: "#2039", date: "15 Jun 2026", products: 'Sierra Circular 7-1/4"', total: 3800, status: "Entregado" },
  { number: "#2021", date: "03 Jun 2026", products: "Cable THW 12 AWG · Manguera 25m", total: 1505, status: "Entregado" },
  { number: "#1998", date: "12 May 2026", products: "Pintura Interior 19L ×2", total: 1780, status: "Cancelado" },
  { number: "#1987", date: "02 May 2026", products: "Cemento Portland ×10", total: 3200, status: "Entregado" },
];
