import { prisma } from "@/lib/prisma";
import { DeckGrid } from "@/components/DeckGrid";

export default async function DecksPage() {
  const decks = await prisma.deck.findMany();

  // Transform the decks to match the DeckGrid component's expected props
  const transformedDecks = decks.map((deck) => {
    // Parse colors from JSON to array
    const colors = Array.isArray(deck.colors)
      ? deck.colors
      : JSON.parse(deck.colors as string);

    return {
      id: deck.id,
      name: deck.name,
      imageUrl: deck.imageUrl, // Keep as null if it doesn't exist
      colors: colors as string[],
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Decks</h1>
      {transformedDecks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No decks found. Create your first deck!
          </p>
        </div>
      ) : (
        <DeckGrid decks={transformedDecks} />
      )}
    </div>
  );
}
