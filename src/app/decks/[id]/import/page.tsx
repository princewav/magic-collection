import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';
import { ImportForm } from '@/components/deck/ImportForm';
import { importDeckList } from '@/actions/deck/import-list';

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

  async function handleImport(decklist: string) {
    'use server';
    try {
      const result = await importDeckList(id, decklist);
      return result;
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred' };
    }
  }

  return (
    <div className="space-y-4 container mx-auto p-4">
      <DeckInfo deck={deck} />
      <ImportForm deckId={deck.id} onImport={handleImport} />
    </div>
  );
}
