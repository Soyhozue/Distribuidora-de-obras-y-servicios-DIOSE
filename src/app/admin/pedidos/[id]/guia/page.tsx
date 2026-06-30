import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/data";
import PrintGuia from "./PrintGuia";

export const revalidate = 0;

export default async function GuiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  return <PrintGuia order={order} />;
}
