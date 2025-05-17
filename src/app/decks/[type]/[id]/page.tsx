import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Filters } from '@/components/Filters';
import { DeckCardGrid } from '@/components/deck/DeckCardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { loadDeckById } from '@/actions/deck/load-decks';
import { CardModalProvider } from '@/context/CardModalContext';
import CardModal from '@/components/card-modal/CardModal';
import { Separator } from '@/components/ui/separator';
import { loadCollectionCardsByName } from '@/actions/deck/load-decks';
import { MissingCardsModal } from '@/components/deck/MissingCardsModal';
import { MissingCardsModalProvider } from '@/context/MissingCardsModalContext';
import { DeckContainer } from '@/components/deck/DeckContainer';
import { DeckSkeleton } from '@/components/deck/DeckSkeleton';
import { validateDeck } from '@/lib/deck-validator';

interface Props {
  params: Promise<{ id: string; type: 'paper' | 'arena' }>;
}

async function getCollectedQuantities(cardList: any[] | undefined) {
  const cardNames = cardList?.map((card) => card.name) || [];
  const collectedCards = await loadCollectionCardsByName(cardNames);

  return Object.values(
    collectedCards.reduce<Record<string, { name: string; quantity: number }>>(
      (acc, card) => {
        acc[card.name] = acc[card.name] || { name: card.name, quantity: 0 };
        acc[card.name].quantity += card.quantity;
        return acc;
      },
      {},
    ),
  );
}

export default async function DeckDetailPage({ params }: Props) {
  const { id, type } = await params;
  const deck = await loadDeckById(id);

  if (!deck) {
    return notFound();
  }

  const validationErrors = validateDeck(deck as any);

  const maindeckOwned = await getCollectedQuantities(deck?.maindeck);
  const sideboardOwned = await getCollectedQuantities(deck?.sideboard);

  return (
    <MissingCardsModalProvider>
      <Suspense fallback={<DeckSkeleton />}>
        <DeckContainer
          deck={deck}
          maindeckOwned={maindeckOwned}
          sideboardOwned={sideboardOwned}
          type={type}
          validationErrors={validationErrors}
        />
      </Suspense>
      <MissingCardsModal />
    </MissingCardsModalProvider>
  );
}
