import { DeckGrid } from "@/components/DeckGrid";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decks",
  description: "View your card decks.",
};

const mockDecks = [
  {
    id: "40",
    name: "Izzet Wizards",
    imageUrl:
      "https://cards.scryfall.io/art_crop/front/0/4/04779a7e-b453-48b9-b392-6d6fd0b8d283.jpg?1686969766",
    colors: ["red", "blue"],
  },
  {
    id: "4",
    name: "Boros Convoke",
    imageUrl:
      "https://cards.scryfall.io/art_crop/front/7/8/7829c0ae-f72f-4195-ad43-775d7218565c.jpg?1738356154",
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
