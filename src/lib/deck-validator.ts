// src/lib/deck-validator.ts

interface Card {
  name: string;
  quantity: number;
  legalities: Record<string, string>; // e.g., { standard: 'legal', modern: 'banned' }
  type_line: string; // e.g., "Basic Land - Forest", "Creature - Goblin"
}

interface Deck {
  format: string;
  maindeck: Card[];
  sideboard: Card[];
}

export function validateDeck(deck: Deck): string[] {
  const errors: string[] = [];
  const deckFormat = deck.format?.toLowerCase();

  // 1. Format Legality
  const allCards = [...deck.maindeck, ...deck.sideboard];
  allCards.forEach((card) => {
    if (
      card.legalities &&
      deckFormat &&
      card.legalities[deckFormat] !== 'legal'
    ) {
      errors.push(`${card.name} is not legal in ${deck.format}.`);
    }
  });

  // 2. Mainboard Size
  const maindeckSize = deck.maindeck.reduce(
    (sum, card) => sum + card.quantity,
    0,
  );
  if (maindeckSize < 60) {
    errors.push(`Mainboard has ${maindeckSize} cards (minimum 60 allowed).`);
  }

  // 3. Sideboard Size
  const sideboardSize = deck.sideboard.reduce(
    (sum, card) => sum + card.quantity,
    0,
  );
  if (sideboardSize > 15) {
    errors.push(`Sideboard has ${sideboardSize} cards (maximum 15 allowed).`);
  }

  // 4. Card Copies (max 4 for non-basic lands)
  const cardCounts: Record<string, number> = {};
  allCards.forEach((card) => {
    // Assuming basic lands can be identified by "Basic Land" in their type_line
    if (
      !card.type_line ||
      !card.type_line.toLowerCase().includes('basic land')
    ) {
      cardCounts[card.name] = (cardCounts[card.name] || 0) + card.quantity;
    }
  });

  for (const cardName in cardCounts) {
    if (cardCounts[cardName] > 4) {
      errors.push(
        `Too many copies of ${cardName} (${cardCounts[cardName]} copies, maximum 4 allowed for non-basic lands).`,
      );
    }
  }

  return errors;
}
