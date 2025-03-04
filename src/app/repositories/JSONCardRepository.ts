import { Card } from "../models/Card";
import { CardRepository } from "./CardRepository";
import cardData from '../../../data/card.example';

export class JSONCardRepository implements CardRepository {
  private cards: Card[];

  constructor(cardData: Card[]) {
    this.cards = cardData;
  }

  async getCardById(id: string): Promise<Card | null> {
    const card = this.cards.find((card) => card.id === id);
    return card || null;
  }

  async getAllCards(): Promise<Card[]> {
    return this.cards;
  }
}

// Pre-load the card data from the JSON file
const cards: Card[] = cardData;

// Export a singleton instance of the repository with the pre-loaded data
export const cardRepository = new JSONCardRepository(cards);
