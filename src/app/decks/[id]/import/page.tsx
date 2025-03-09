import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';
import { ImportForm } from '@/components/deck/ImportForm';

interface ImportDeckPageProps {
  params: Promise<{ id: string }>;
}

export default async function ImportDeckPage({ params }: ImportDeckPageProps) {
  const { id } = await params;
  const deck = await loadDeckById(id);

  if (!deck) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col p-4">
        <h1 className="mb-6 text-4xl font-bold">Deck Not Found</h1>
        <p>The requested deck could not be found.</p>
      </main>
    );
  }

  return (
    <div className="space-y-4 container mx-auto p-4">
      <DeckInfo deck={deck} />
      <ImportForm deckId={deck.id} />
    </div>
  );
}
