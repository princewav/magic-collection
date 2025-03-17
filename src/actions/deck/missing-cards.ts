'use server';

import { loadCollectionCardsByName } from '@/actions/deck/load-decks';
import { deckService } from '@/db/services/DeckService';

// Define types to improve readability
type Card = { name: string; quantity: number };
type CollectionMap = Record<string, { name: string; quantity: number }>;
type MissingCardMap = Record<string, { name: string; missing: number }>;

// Helper function to process cards for a deck section
async function processCardSection(
  deckCards: Card[] | undefined,
): Promise<{ collectedQuantities: Card[] }> {
  const cardNames = deckCards?.map((card) => card.name) || [];
  const collectedCards = await loadCollectionCardsByName(cardNames);

  // Aggregate collected quantities
  const collectedQuantities = Object.values(
    collectedCards.reduce<CollectionMap>((acc, card) => {
      acc[card.name] = acc[card.name] || { name: card.name, quantity: 0 };
      acc[card.name].quantity += card.quantity;
      return acc;
    }, {}),
  );

  return { collectedQuantities };
}

// Calculate missing cards from a section
function calculateMissingFromSection(
  deckCards: Card[] | undefined,
  collectedMap: Map<string, number>,
): { name: string; missing: number }[] {
  return (deckCards || []).map((card) => ({
    name: card.name,
    missing: Math.max(0, card.quantity - (collectedMap.get(card.name) || 0)),
  }));
}

export async function getMissingCards(deckId: string) {
  // Get deck data
  const decks = await deckService.repo.get([deckId]);
  const deck = decks?.[0] || null;

  if (!deck) {
    throw new Error('Deck not found');
  }

  // Process maindeck and sideboard
  const { collectedQuantities: maindeckCollectedQuantities } =
    await processCardSection(deck.maindeck);
  const { collectedQuantities: sideboardCollectedQuantities } =
    await processCardSection(deck.sideboard);

  // Create a map of collected quantities for quick lookup
  const collectedMap = new Map<string, number>([
    ...maindeckCollectedQuantities.map(
      (c) => [c.name, c.quantity] as [string, number],
    ),
    ...sideboardCollectedQuantities.map(
      (c) => [c.name, c.quantity] as [string, number],
    ),
  ]);

  // Calculate missing cards for both sections
  const missingCardsList = [
    ...calculateMissingFromSection(deck.maindeck, collectedMap),
    ...calculateMissingFromSection(deck.sideboard, collectedMap),
  ];

  // Aggregate missing cards by name
  const missingCards = Object.values(
    missingCardsList.reduce<MissingCardMap>((acc, card) => {
      acc[card.name] = acc[card.name] || { ...card, missing: 0 };
      acc[card.name].missing += card.missing;
      return acc;
    }, {}),
  ).filter((card) => card.missing > 0);

  return missingCards;
}

function formatMissingCardsText(
  missingCards: { name: string; missing: number }[],
) {
  return missingCards.map((card) => `${card.name} x${card.missing}`).join('\n');
}

export async function downloadMissingCards(deckId: string) {
  try {
    const missingCards = await getMissingCards(deckId);
    const decks = await deckService.repo.get([deckId]);
    const deck = decks?.[0] || null;

    return {
      content: formatMissingCardsText(missingCards),
      filename: `Missing_${deck?.name.replace(' ', '_')}.txt`,
    };
  } catch (error) {
    throw new Error('Failed to generate missing cards list');
  }
}

export async function getMissingCardsText(deckId: string) {
  try {
    const missingCards = await getMissingCards(deckId);
    return formatMissingCardsText(missingCards);
  } catch (error) {
    throw new Error('Failed to get missing cards text');
  }
}
