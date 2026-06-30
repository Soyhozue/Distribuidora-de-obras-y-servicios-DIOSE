import { getAllProducts } from "@/lib/data";
import InventoryManager from "./InventoryManager";

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const products = await getAllProducts();
  return <InventoryManager products={products} />;
}
