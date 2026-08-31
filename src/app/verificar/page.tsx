import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificarClient from "./VerificarClient";

export const metadata = {
  title: "Confirmar correo",
};

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <VerificarClient token={token} />
      <Footer />
    </div>
  );
}
