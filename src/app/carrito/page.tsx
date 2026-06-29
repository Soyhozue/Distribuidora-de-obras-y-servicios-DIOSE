import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getSiteSettings } from "@/lib/data";
import CartView from "./CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartView whatsapp={settings.whatsapp} />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
