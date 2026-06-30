import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecuperarClient from "./RecuperarClient";

export default async function RecuperarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <RecuperarClient token={token} />
      <Footer />
    </div>
  );
}
