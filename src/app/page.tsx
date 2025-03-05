import Navbar from "@/app/components/Navbar";
import Filters from "@/app/components/Filters";
import CardGrid from "@/app/components/CardGrid";
import CardModal from "@/app/components/CardModal";
import { CardModalProvider } from "@/app/contexts/CardModalContext";

export default async function Home() {
  return (
    <div className="text-white min-h-screen p-4">
      <Navbar />
      <Filters />
      <CardModalProvider>
        <CardGrid />
        <CardModal />
      </CardModalProvider>
    </div>
  );
}
