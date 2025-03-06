import { Card, Deck, DeckCard } from "@prisma/client";

// Original Prisma deck type with related deckCards
export type DeckWithDeckCards = Deck & {
  deckCards: (DeckCard & {
    card: Card;
  })[];
};

// Transformed card type with quantity
export type TransformedCard = Card & {
    quantity: number;
};

// Transformed deck type for frontend consumption
export type TransformedDeck = Omit<DeckWithDeckCards, "deckCards"> & {
  cards: TransformedCard[];
  imageUrl?: string;
};

// This type represents what getDeckById returns
export type DeckByIdResult = TransformedDeck | null;

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';
