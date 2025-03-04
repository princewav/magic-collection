import { Card } from "@/app/models/Card";
import { CardRepository } from "@/app/repositories/CardRepository";
import { CARD_DATA_PATH } from "@/constants";
import * as fs from 'fs/promises';
import path from 'path';

export class JSONCardRepository implements CardRepository {
  private cards: Card[];
  private isLoaded: boolean = false;

  constructor() {
    this.cards = [];
  }

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
    if (this.isLoaded) {
      return;
    }
    try {
      const filePath = path.join(process.cwd(), CARD_DATA_PATH);
      const data = await fs.readFile(filePath, 'utf-8');
      this.cards = JSON.parse(data);
      this.isLoaded = true;
    } catch (error) {
      console.error("Error loading cards:", error);
      this.cards = [];
      this.isLoaded = true;
    }
  }
}
