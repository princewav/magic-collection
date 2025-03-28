import { Metadata } from 'next';
import { Filters } from '@/components/Filters';
import CardModal from '@/components/CardModal';
import { CardModalProvider } from '@/context/CardModalContext';
import { CardsProvider } from '@/context/CardsContext';
import { CardGrid } from '@/components/CardGrid';
import { loadFilteredCards } from '@/actions/card/load-cards';

export const metadata: Metadata = {
  title: 'MTG Collection',
};

export default async function Page() {
  // Load initial data
  const { cards, total } = await loadFilteredCards({
    colors: [],
    cmcRange: [0, 10],
    rarities: [],
    sortFields: [],
  });

  return (
    <CardsProvider initialCards={cards} initialTotal={total}>
      <div className="min-h-screen px-4 pt-2 pb-4">
        <Filters className="mb-4" />
        <CardModalProvider>
          <CardGrid />
          <CardModal />
        </CardModalProvider>
      </div>
    </CardsProvider>
  );
}
