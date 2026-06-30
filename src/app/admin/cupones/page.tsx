import { prisma } from "@/lib/prisma";
import CuponesManager from "./CuponesManager";

export const revalidate = 0;

export default async function AdminCuponesPage() {
  const cupones = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return <CuponesManager cupones={cupones.map((c) => ({ ...c, discount: Number(c.discount) }))} />;
}
