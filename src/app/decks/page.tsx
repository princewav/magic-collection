// src/app/decks/page.tsx
import { prisma } from '@/lib/prisma';
import { DeckGrid } from '@/components/deck/DeckGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DeckSelectionProvider } from '@/context/DeckSelectionContext';
import { ManaColor } from '@/types/deck';

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
      colors: colors as ManaColor[],
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between re">
        <h1 className="flex items-center text-3xl font-bold">My Decks</h1>
        <div>
          <Button asChild>
            <Link href="/decks/new">Add Deck</Link>
          </Button>
        </div>
      </div>
      {transformedDecks.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-500">
            No decks found. Create your first deck!
          </p>
        </div>
      ) : (
        <DeckSelectionProvider>
          <DeckGrid decks={transformedDecks} />
        </DeckSelectionProvider>
      )}
    </div>
  );
}
