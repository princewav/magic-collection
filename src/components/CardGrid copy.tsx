import { loadCardsById } from '@/actions/load-cards';

import { ITEMS_PER_PAGE } from '@/lib/constants';
import Pagination from './Pagination';
import { DeckCard } from '@/types/deck';
import { Card } from '@/types/card';

interface Props {
  currentPage?: number;
  deckCards?: DeckCard[];
}
export async function CardGrid({ currentPage = 1, deckCards }: Props) {
  const cardIds: string[] = deckCards?.map((card) => card.id) ?? [];

  return (
    <div>
      {/* <Pagination totalPages={totalPages} currentPage={currentPage} /> */}
      <div className="flex flex-wrap gap-4">
        {/* {deckCards?.map((card) => (
          <Card key={card.id} id={card.id} />
        ))} */}
      </div>
    </div>
  );
}
