import { Metadata } from 'next';
import { Suspense } from 'react';
import { loadDecks } from '@/actions/deck/load-decks';
import { DecksListContainer } from '@/components/deck/DecksListContainer';
import { DecksListSkeleton } from '@/components/deck/DecksListSkeleton';
import { DeckSelectionProvider } from '@/context/DeckSelectionContext';

type Props = {
  params: Promise<{
    type: 'paper' | 'arena';
  }>;
};

export const metadata: Metadata = {
  title: 'Decks',
  description: 'View your decks.',
};

// Async component to load decks with suspense
async function DecksContent({ type }: { type: 'paper' | 'arena' }) {
  try {
    const decks = await loadDecks(type);

    return (
      <DeckSelectionProvider>
        <DecksListContainer decks={decks} type={type} />
      </DeckSelectionProvider>
    );
  } catch (error) {
    console.error('Error loading decks:', error);
    throw error;
  }
}

export default async function DecksPage({ params }: Props) {
  const { type } = await params;

  return (
    <main className="container mx-auto p-6">
      <Suspense fallback={<DecksListSkeleton />}>
        <DecksContent type={type} />
      </Suspense>
    </main>
  );
}
