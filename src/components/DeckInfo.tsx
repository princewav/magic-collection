import Image from "next/image";

interface Deck {
  id: string;
  name: string;
  imageUrl: string;
  colors: string[];
}

interface Props {
  deck: Deck;
}

export const DeckInfo = ({ deck }: Props) => {
  return (
    <div className="bg-foreground/10 rounded-md shadow-md p-4 mb-4">
      <div className="flex items-center space-x-4">
        <Image
          src={deck.imageUrl}
          alt={deck.name}
          width={150}
          height={200}
          className="rounded-md"
        />
        <div>
          <h2 className="text-2xl font-semibold">{deck.name}</h2>
          <p className="text-gray-500">Colors: {deck.colors.join(", ")}</p>
        </div>
      </div>
    </div>
  );
};
