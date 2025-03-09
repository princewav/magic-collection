import Image from 'next/image';
import { Deck } from '@/types/deck';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Import } from 'lucide-react';

interface Props {
  deck: Deck;
}

export const DeckInfo = ({ deck }: Props) => {
  const getColors = () => {
    if (!deck.colors) return [];

    if (typeof deck.colors === 'string') {
      try {
        return JSON.parse(deck.colors as string);
      } catch {
        return [deck.colors];
      }
    }

    if (Array.isArray(deck.colors)) {
      return deck.colors;
    }

    return [];
  };

  const colors = getColors();
  return (
    <div className="bg-foreground/10 mb-4 flex items-center justify-between rounded-md p-4 shadow-md">
      <div className="flex items-center space-x-4">
        <Image
          src={deck.imageUrl || '/placeholder-deck.jpg'}
          alt={deck.name}
          width={150}
          height={100}
          className="rounded-md"
        />
        <div>
          <h2 className="text-2xl font-semibold">{deck.name}</h2>
          <p className="text-gray-500">
            Colors:{' '}
            {Array.isArray(colors) && colors.length > 0
              ? colors.join(', ')
              : 'None'}
          </p>
          <p className="mt-2 text-sm">Total cards: </p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between space-y-2">
        <Link href={`/decks/${deck.id}/edit`}>
          <Button className="w-30" variant="outline"><Edit/>Edit Deck</Button>
        </Link>
        <Link href={`/decks/${deck.id}/import`}>
          <Button className="w-full" variant="outline"><Import/>Import List</Button>
        </Link>
      </div>
    </div>
  );
};
