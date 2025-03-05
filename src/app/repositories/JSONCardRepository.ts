import { Card } from "@/app/models/Card";
import { CardRepository } from "@/app/repositories/CardRepository";
import { loadCardsDataJSON } from "@/lib/cardService";
import { CARD_DATA_PATH } from "@/constants";

export class JSONCardRepository implements CardRepository {
  private cards: Card[] = [];

  async getCardById(id: string): Promise<Card | null> {
    if (this.cards.length === 0) {
      this.cards = await loadCardsDataJSON(CARD_DATA_PATH);
    }
    const card = this.cards.find((card) => card.id === id);
    return card || null;
  }

  async getAllCards(): Promise<Card[]> {
     if (this.cards.length === 0) {
      this.cards = await loadCardsDataJSON(CARD_DATA_PATH);
    }
    return this.cards;
  }
}
