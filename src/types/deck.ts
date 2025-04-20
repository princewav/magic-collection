import { CardWithQuantity } from '@/types/card';

export type DeckCard = {
  quantity: number;
  name: string;
  cardId: string;
  set: string;
  setNumber: number;
};

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';
export type DeckInfo = {
  id: string;
  userId: string;
  name: string;
  imageUrl: string | null; // Keep as null if it doesn't exist
  colors: ManaColor[];
  format: string;
  description?: string;
  type: 'paper' | 'arena';
};
export type DBDeck = DeckInfo & {
  maindeck: DeckCard[];
  sideboard: DeckCard[];
  maybeboard: DeckCard[];
};

export type Deck = DeckInfo & {
  maindeck: CardWithQuantity[];
  sideboard: CardWithQuantity[];
  maybeboard: CardWithQuantity[];
};
