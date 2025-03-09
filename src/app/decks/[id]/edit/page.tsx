import { loadDeckById } from '@/actions/deck/load-decks';
import { EditDeckClient } from './EditDeckClient';

interface EditDeckPageProps {
  params: { id: string };
}

export default async function EditDeckPage({
  params: { id },
}: EditDeckPageProps) {
  const deck = await loadDeckById(id);

  if (!deck) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col p-4">
        <h1 className="mb-6 text-4xl font-bold">Deck Not Found</h1>
        <p>The requested deck could not be found.</p>
      </main>
    );
  }

  return <EditDeckClient deck={deck} id={id} />;
}
