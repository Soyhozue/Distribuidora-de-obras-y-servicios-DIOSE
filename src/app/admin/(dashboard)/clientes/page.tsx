import { getCustomers } from "@/lib/data";
import ClientesManager from "./ClientesManager";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return <ClientesManager customers={customers} />;
}
