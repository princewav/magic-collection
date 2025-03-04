import { Card } from "../app/models/Card";
import { CardRepository } from "../app/repositories/CardRepository";
import { JSONCardRepository } from "../app/repositories/JSONCardRepository";

const cardRepository: CardRepository = new JSONCardRepository();

export const getCardById = async (id: string): Promise<Card | null> => {
  return cardRepository.getCardById(id);
};

export const getAllCards = async (): Promise<Card[]> => {
  return cardRepository.getAllCards();
};
