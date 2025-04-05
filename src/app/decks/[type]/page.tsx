import { Metadata } from 'next';
import { Suspense } from 'react';
import { loadDecks } from '@/actions/deck/load-decks';
import { DecksListContainer } from '@/components/deck/DecksListContainer';
import { DecksListSkeleton } from '@/components/deck/DecksListSkeleton';

type Props = {
  params: Promise<{
    type: 'paper' | 'arena';
  }>;
};

export const metadata: Metadata = {
  title: 'Decks',
  description: 'View your decks.',
};

export default async function DecksPage({ params }: Props) {
  const { type } = await params;
  const decks = await loadDecks(type);

  return (
    <Suspense fallback={<DecksListSkeleton />}>
      <DecksListContainer decks={decks} type={type} />
    </Suspense>
  );
}
