'use server'

import { Card } from "@/app/models/Card";
import { promises as fs } from 'fs';
import path from 'path';

export async function loadCardsData(filePath: string): Promise<Card[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    try {
      const cards: Card[] = JSON.parse(data);
      return cards;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      throw new Error("Invalid JSON format in card data file.");
    }
  } catch (error) {
    console.error("Error loading cards:", error);
    return [];
  }
}
