'use server'

import { Card } from "@/app/models/Card";
import { CARD_DATA_PATH } from "@/constants";
import { promises as fs } from 'fs';
import path from 'path';

export async function loadCardsData(): Promise<Card[]> {
  try {
    const filePath = path.join(process.cwd(), CARD_DATA_PATH);
    const data = await fs.readFile(filePath, 'utf-8');
    const cards: Card[] = JSON.parse(data);
    return cards;
  } catch (error) {
    console.error("Error loading cards:", error);
    return [];
  }
}
