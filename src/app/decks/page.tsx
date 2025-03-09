import { DeckGrid } from '@/components/deck/DeckGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DeckSelectionProvider } from '@/context/DeckSelectionContext';
import { loadDecks } from '@/actions/deck/load-decks';

export default async function DecksPage() {
  const decks = await loadDecks();
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="re mb-4 flex items-center justify-between">
          <h1 className="flex items-center text-3xl font-bold">My Decks</h1>
          <div>
            <Button asChild>
              <Link href="/decks/new">Add Deck</Link>
            </Button>
          </div>
        </div>
        {decks.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">
              No decks found. Create your first deck!
            </p>
          </div>
        ) : (
          <DeckSelectionProvider>
            <DeckGrid decks={decks} />
          </DeckSelectionProvider>
        )}
      </div>
  );
}
