import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';

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
      <Textarea className="min-h-[300px]" placeholder="Paste your decklist here..." />
      <Button className="w-full">Import</Button>
    </div>
  );
}
