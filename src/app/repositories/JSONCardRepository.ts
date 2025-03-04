import { Card } from "../models/Card";
import { CardRepository } from "./CardRepository";

export class JSONCardRepository implements CardRepository {
  private cards: Card[];

  constructor(cards: Card[]) {
    this.cards = cards;
  }

  async getCardById(id: string): Promise<Card | null> {
    const card = this.cards.find((card) => card.id === id);
    return card || null;
  }

  async getAllCards(): Promise<Card[]> {
    return this.cards;
  }
}

