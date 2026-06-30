import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/data";
import PrintGuia from "./PrintGuia";
import { getAdminSessionId } from "@/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function GuiaPage({ params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSessionId();
  if (!adminId) redirect("/admin/login");
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  return <PrintGuia order={order} />;
}
