import { Card, Deck as PrismaDeck, DeckCard } from '@prisma/client';

// Original Prisma deck type with related deckCards
export type DeckWithDeckCards = PrismaDeck & {
  deckCards: (DeckCard & {
    card: Card;
  })[];
};

// Transformed card type with quantity
export type TransformedCard = Card & {
  quantity: number;
};

// Transformed deck type for frontend consumption
export type TransformedDeck = Omit<DeckWithDeckCards, 'deckCards'> & {
  cards: TransformedCard[];
  imageUrl?: string;
};

// This type represents what getDeckById returns
export type DeckByIdResult = TransformedDeck | null;

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';
export type Deck = {
  id: string;
  name: string;
  imageUrl: string | null; // Keep as null if it doesn't exist
  colors: ManaColor[];
  format?: string;
  description?: string;
};
