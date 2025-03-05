import React from "react";

import { Deck } from "./Deck";
interface DeckGridProps {
  decks: {
    id: string;
    name: string;
    imageUrl: string;
    colors: string[];
  }[];
}

export const DeckGrid: React.FC<DeckGridProps> = ({ decks }) => (
  <div className="flex flex-wrap gap-4">
    {decks.map((deck) => (
      <Deck
        key={deck.id}
        id={deck.id}
        name={deck.name}
        imageUrl={deck.imageUrl}
        colors={deck.colors}
      />
    ))}
  </div>
);
