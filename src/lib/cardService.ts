import { cardRepository } from "../app/repositories/JSONCardRepository";
import { Card } from "../app/models/Card";

export const getCardById = async (id: string): Promise<Card | null> => {
  return cardRepository.getCardById(id);
};

export const getAllCards = async (): Promise<Card[]> => {
  return cardRepository.getAllCards();
};
