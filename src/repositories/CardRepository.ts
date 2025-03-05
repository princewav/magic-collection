import { Card } from "@/models/Card";

export interface CardRepository {
  getCardById(id: string): Promise<Card | null>;
  getAllCards(): Promise<Card[]>;
}
