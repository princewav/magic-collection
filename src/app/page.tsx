import Filters from "./components/Filters";
import CardGrid from "./components/CardGrid";
import Navbar from "./components/Navbar";
import { CardModalProvider } from "./contexts/CardModalContext";
import CardModal from "./components/CardModal";
import { getAllCards } from "@/lib/cardService";

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
