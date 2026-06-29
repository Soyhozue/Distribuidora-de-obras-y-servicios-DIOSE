import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getSessionUserId } from "@/lib/auth";
import { getUserAddresses, getUserById, getUserOrders } from "@/lib/data";
import AuthForms from "./AuthForms";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getSessionUserId();

  let content;
  if (!userId) {
    content = <AuthForms />;
  } else {
    const user = await getUserById(userId);
    if (!user) {
      content = <AuthForms />;
    } else {
      const [orders, addresses] = await Promise.all([getUserOrders(userId), getUserAddresses(userId)]);
      content = (
        <AccountClient
          user={{ name: user.name, email: user.email, phone: user.phone }}
          orders={orders}
          addresses={addresses}
        />
      );
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {content}
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
