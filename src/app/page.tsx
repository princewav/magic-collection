import Navbar from "@/app/components/Navbar";
import Filters from "@/app/components/Filters";
import CardGrid from "@/app/components/CardGrid";
import CardModal from "@/app/components/CardModal";
import { CardModalProvider } from "@/app/contexts/CardModalContext";
import { JSONCardRepository } from "@/app/repositories/JSONCardRepository";
import { SQLiteCardRepository } from "@/app/repositories/SQLiteCardRepository";
import { CARD_DATA_PATH } from "@/constants";

export default async function Home() {
  // Load data from JSON to SQLite
  const jsonRepo = new JSONCardRepository();
  const sqliteRepo = new SQLiteCardRepository();

  const cards = await jsonRepo.getAllCards();

  for (const card of cards) {
    const existingCard = await sqliteRepo.getCardById(card.id);
    if (!existingCard) {
      await sqliteRepo.insertCard(card);
    }
  }

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
