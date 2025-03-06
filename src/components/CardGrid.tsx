import Card from './Card';
import { loadCardIds } from '@/actions/load-card-ids';

import { ITEMS_PER_PAGE } from '@/lib/constants';
import Pagination from './Pagination';

interface Props {
  currentPage?: number;
  cardIds?: string[];
}
export async function CardGrid({ currentPage = 1, cardIds }: Props) {
  const fetchedCardIds = cardIds ?? (await loadCardIds(currentPage));
  // const cardIds: string[] = []

  const totalCardCount = await loadCardIds();

  const totalPages = Math.ceil(totalCardCount.length / ITEMS_PER_PAGE);

  return (
    <div>
      <Pagination totalPages={totalPages} currentPage={currentPage} />
      <div className="flex flex-wrap gap-4">
        {fetchedCardIds.map((id) => (
          <Card key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
