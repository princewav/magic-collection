import { Card } from "@/app/models/Card";
import { CardRepository } from "@/app/repositories/CardRepository";
import { loadCardsData } from "@/lib/cardService";
import { CARD_DATA_PATH } from "@/constants";

export class JSONCardRepository implements CardRepository {
  private cards: Card[] = [];

  async getCardById(id: string): Promise<Card | null> {
    await this.loadCards();
    const card = this.cards.find((card) => card.id === id);
    return card || null;
  }

  async getAllCards(): Promise<Card[]> {
    await this.loadCards();
    return this.cards;
  }

  private async loadCards() {
    if (this.cards.length > 0) {
      return;
    }
    try {
      this.cards = await loadCardsData(CARD_DATA_PATH);
    } catch (error) {
      console.error("Error loading cards:", error);
      this.cards = [];
    }
  }
}
