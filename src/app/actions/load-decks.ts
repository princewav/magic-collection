"use server";

import { prisma } from "@/lib/prisma";

export async function getDeckById(id: string) {
  try {
    const deck = await prisma.deck.findUnique({
      where: {
        id,
      },
      include: {
        cards: true,
      },
    });

    return deck;
  } catch (error) {
    console.error("Error fetching deck:", error);
    return null;
  }
}

export async function getAllDecks() {
  try {
    const decks = await prisma.deck.findMany({
      include: {
        cards: true,
      },
    });

    return decks;
  } catch (error) {
    console.error("Error fetching decks:", error);
    return [];
  }
}
