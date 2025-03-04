import { Card } from "../models/Card";
import { CardRepository } from "./CardRepository";

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
