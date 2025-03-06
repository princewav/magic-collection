import Image from "next/image";
import { TransformedDeck } from "@/types/deck";

interface Props {
  deck: TransformedDeck;
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
    <div className="bg-foreground/10 rounded-md shadow-md p-4 mb-4">
      <div className="flex items-center space-x-4">
        <Image
          src={deck.imageUrl || '/placeholder-deck.jpg'}
          alt={deck.name}
          width={150}
          height={200}
          className="rounded-md"
        />
        <div>
          <h2 className="text-2xl font-semibold">{deck.name}</h2>
          <p className="text-gray-500">
            Colors: {Array.isArray(colors) && colors.length > 0 ? colors.join(", ") : "None"}
          </p>
          <p className="text-sm mt-2">Total cards: {deck.cards.reduce((acc, card) => acc + card.quantity, 0)}</p>
        </div>
      </div>
    </div>
  );
};
