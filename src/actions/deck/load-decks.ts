import {
  DeckByIdResult,
  DeckWithDeckCards,
  TransformedDeck,
} from "@/types/deck";
import { prisma } from "@/lib/prisma";

export async function getDeckById(id: string): Promise<DeckByIdResult> {
  try {
    const deck = await prisma.deck.findUnique({
      where: {
        id,
      },
      include: {
        deckCards: {
          include: {
            card: true,
          },
        },
      },
    });
    if (!deck) return null;

    // Transform the data for easier frontend consumption
    const transformedDeck = {
      ...deck,
      cards: deck.deckCards.map((dc) => ({
        ...dc.card,
        quantity: dc.quantity,
      })),
    } as TransformedDeck;

    return transformedDeck;
  } catch (error) {
    console.error("Error fetching deck:", error);
    return null;
  }
}
