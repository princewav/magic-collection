import Filters from "./components/Filters";
import CardGrid from "./components/CardGrid";
import Navbar from "./components/Navbar";
import { CardModalProvider } from "./contexts/CardModalContext";

export default function Home() {
  return (
    <div className="text-white min-h-screen p-4">
      <Navbar />
      <Filters />
      <CardModalProvider>
        <CardGrid />
      </CardModalProvider>
    </div>
  );
}
