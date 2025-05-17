import { z } from 'zod';
import { parseDeckList, ParsedCard } from '@/lib/deck/list-parser';
import { cardService } from '@/db/services/CardService';
import { deckService } from '@/db/services/DeckService';
import { Deck, DeckCard, ManaColor } from '@/types/deck';
import { CardWithQuantity } from '@/types/card';
import { loadCardsById } from '@/actions/card/load-cards';

type ImportDeckResult = {
  success: boolean;
  errors?: string[];
};

const importDeckSchema = z.object({
  cardList: z.string().min(1, 'Card list cannot be empty'),
});

async function convertNameToId(card: ParsedCard): Promise<DeckCard | null> {
  const cardData = await (card.set
    ? cardService.getByNameAndSet(card.name, card.set)
    : cardService.getByName(card.name));

  if (!cardData || cardData.length === 0) {
    console.error(`Card not found: ${card.name} (${card.set})`);
    return null;
  }

  // If we have multiple versions of the same card, prioritize the one with the lowest non-null EUR price
  let selectedCard = cardData[0];
  if (cardData.length > 1) {
    // Filter cards with non-null EUR prices
    const cardsWithPrices = cardData.filter((c) => c.prices?.eur !== null);

    if (cardsWithPrices.length > 0) {
      // Sort by EUR price (ascending) and take the first (cheapest)
      selectedCard = cardsWithPrices.sort((a, b) => {
        const priceA = parseFloat(a.prices.eur || '0');
        const priceB = parseFloat(b.prices.eur || '0');
        return priceA - priceB;
      })[0];
    }
  }

  // Convert setNumber to a number if it's coming from collector_number (which might be a string)
  const finalSetNumber =
    card.setNumber ||
    (selectedCard.collector_number
      ? parseInt(selectedCard.collector_number, 10)
      : 0);

  return {
    cardId: selectedCard.cardId,
    name: selectedCard.name,
    set: card.set || selectedCard.set,
    quantity: card.quantity,
    setNumber: finalSetNumber,
  };
}

export async function importDeckList(
  deckId: string,
  cardList: string,
): Promise<ImportDeckResult> {
  try {
    const { mainDeck, sideboard, errors } = parseDeckList(
      importDeckSchema.parse({ cardList }).cardList,
    );

    const convertDeckCards = async (deck: ParsedCard[]) => {
      return Promise.all(deck.map(convertNameToId)).then(
        (cards) => cards.filter(Boolean) as DeckCard[],
      );
    };

    const [mainDeckCards, sideboardCards] = await Promise.all([
      convertDeckCards(mainDeck),
      convertDeckCards(sideboard),
    ]);

    // Get all unique card IDs from both main deck and sideboard
    const allCardIds = [
      ...new Set([
        ...mainDeckCards.map((card) => card.cardId),
        ...sideboardCards.map((card) => card.cardId),
      ]),
    ];

    // Load full card details to get color identities
    const cardDetails = await loadCardsById(allCardIds);

    // Create a set to store unique colors
    const colorSet = new Set<ManaColor>();

    // Add colors from each card's color_identity
    cardDetails.forEach((card) => {
      if (card.color_identity) {
        card.color_identity.forEach((color) => {
          if (['W', 'U', 'B', 'R', 'G', 'C'].includes(color)) {
            colorSet.add(color as ManaColor);
          }
        });
      }
    });

    // Convert the set to an array and sort it
    const deckColors = Array.from(colorSet).sort();

    // Update the deck with both the cards and the detected colors
    await deckService.repo.update(deckId, {
      maindeck: mainDeckCards,
      sideboard: sideboardCards,
      colors: deckColors,
    });

    return { success: true, errors };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

export function generateDecklist(deck: Deck): string {
  const formatCard = (card: CardWithQuantity) => {
    return `${card.quantity} ${card.name} (${card.set.toUpperCase()})`;
  };

  const mainDeckList = deck.maindeck.map(formatCard).join('\n');
  const sideboardList = deck.sideboard.map(formatCard).join('\n');

  return `Deck\n${mainDeckList}\n\nSideboard\n${sideboardList}`;
}
