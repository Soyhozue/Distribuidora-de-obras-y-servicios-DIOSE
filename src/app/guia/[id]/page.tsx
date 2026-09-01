import { notFound } from "next/navigation";
import { getOrderById, getSiteSettings } from "@/lib/data";
import PrintGuia from "./PrintGuia";
import { getAdminSessionId } from "@/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function GuiaPage({ params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSessionId();
  if (!adminId) redirect("/admin/login");
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderById(id), getSiteSettings()]);
  if (!order) notFound();
  return (
    <PrintGuia
      order={order}
      sender={{ address: settings.address, phone: settings.phone }}
    />
  );
}
