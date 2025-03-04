import Filters from "./components/Filters";
import CardGrid from "./components/CardGrid";
import Navbar from "./components/Navbar";
import { CardModalProvider } from "./contexts/CardModalContext";
import { getAllCards } from "@/lib/cardService";
import CardModal from "./components/CardModal";

async function getStaticProps() {
  const cardData = await getAllCards();
  return { props: { cardData } };
}

export default async function Home() {
  const cardData = await getAllCards();
  return (
    <div className="text-white min-h-screen p-4">
      <Navbar />
      <Filters />
      <CardModalProvider>
        <CardGrid cardData={cardData} />
        <CardModal />
      </CardModalProvider>
    </div>
  );
}
