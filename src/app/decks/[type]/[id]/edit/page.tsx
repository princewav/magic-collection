import { loadDeckById } from '@/actions/deck/load-decks';
import { EditDeckClient } from './EditDeckClient';
import { generateDecklist } from '@/actions/deck/import-list';

interface EditDeckPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDeckPage({
  params,
}: EditDeckPageProps) {
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
  
  const decklist = generateDecklist(deck);
  return <EditDeckClient deck={deck} id={id} decklist={decklist} />;
}
