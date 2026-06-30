import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Cupones iniciales
  await prisma.coupon.upsert({
    where: { code: "DIOSE10" },
    update: {},
    create: { code: "DIOSE10", discount: 0.10, active: true },
  });
  await prisma.coupon.upsert({
    where: { code: "BIENVENIDA" },
    update: {},
    create: { code: "BIENVENIDA", discount: 0.05, active: true },
  });
  console.log("✓ Cupones creados");

  // Admin inicial
  const existing = await prisma.admin.findUnique({ where: { email: "admin@diose.mx" } });
  if (!existing) {
    const hashed = await bcrypt.hash("Diose2026!", 10);
    await prisma.admin.create({
      data: { name: "Administrador", email: "admin@diose.mx", password: hashed },
    });
    console.log("✓ Admin creado: admin@diose.mx / Diose2026!");
  } else {
    console.log("✓ Admin ya existe");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
