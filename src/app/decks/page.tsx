import { DeckGrid } from "@/components/DeckGrid";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decks",
  description: "View your card decks.",
};

const mockDecks = [
  {
    id: "4",
    name: "Deck 4",
    imageUrl: "https://via.placeholder.com/300x200",
    colors: ["red", "blue"],
  },
  {
    id: "4",
    name: "Deck 4",
    imageUrl: "https://via.placeholder.com/300x200",
    colors: ["red", "white"],
  },
];

export default async function DecksPage() {
  return (
    <main className="flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">My Decks</h1>
        <Button>Add Deck</Button>
      </div>
      <DeckGrid decks={mockDecks} />
    </main>
  );
}
