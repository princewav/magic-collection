import { DeckGrid } from '@/components/deck/DeckGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DeckSelectionProvider } from '@/context/DeckSelectionContext';
import { loadDecks } from '@/actions/deck/load-decks';
import { Separator } from '@radix-ui/react-separator';

export default async function DecksPage() {
  const paperDecks = await loadDecks('paper');
  const arenaDecks = await loadDecks('arena');
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center font-bold">Decks</h1>
        <div>
          <Button asChild>
            <Link href="/decks/new">Add Deck</Link>
          </Button>
        </div>
      </div>
      <h2 className="mb-4 font-bold">Paper Decks</h2>
      {paperDecks.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-500">
            No paper decks found. Create your first deck!
          </p>
        </div>
      ) : (
        <DeckSelectionProvider>
          <DeckGrid decks={paperDecks} />
        </DeckSelectionProvider>
      )}
      <Separator className="my-10 h-1 bg-foreground/10" orientation="horizontal" />
      <h2 className="mb-4 font-bold">Arena Decks</h2>
      {arenaDecks.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-500">
            No arena decks found. Create your first deck!
          </p>
        </div>
      ) : (
        <DeckSelectionProvider>
          <DeckGrid decks={arenaDecks} />
        </DeckSelectionProvider>
      )}
    </div>
  );
}
