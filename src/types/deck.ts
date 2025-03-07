export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';
export type Deck = {
  id: string;
  name: string;
  imageUrl: string | null; // Keep as null if it doesn't exist
  colors: ManaColor[];
  format?: string;
  description?: string;
  type: 'deck';
};
