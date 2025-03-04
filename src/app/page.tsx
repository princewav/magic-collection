import Filters from "./components/Filters";
import CardGrid from "./components/CardGrid";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="text-white min-h-screen p-4">
      <Navbar />
      <Filters />
      <CardGrid />
    </div>
  );
}

