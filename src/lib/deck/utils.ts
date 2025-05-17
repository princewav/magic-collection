import { CardWithQuantity } from '@/types/card';

export function calculateRarityTotals(
  cards: CardWithQuantity[],
): Record<string, number> {
  if (!cards || cards.length === 0) {
    return {};
  }
  return cards.reduce(
    (acc, card) => {
      const rarity = card.rarity?.toLowerCase() || 'common'; // Ensure rarity exists and default
      if (!acc[rarity]) {
        acc[rarity] = 0;
      }
      // Ensure quantity exists and default to 1 if not present
      acc[rarity] += card.quantity ?? 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function groupCardsByType(
  cards: CardWithQuantity[],
): Record<string, CardWithQuantity[]> {
  const groups: Record<string, CardWithQuantity[]> = {
    creature: [],
    planeswalker: [],
    instant: [],
    sorcery: [],
    artifact: [],
    enchantment: [],
    land: [],
    other: [],
  };

  if (!cards) {
    return groups;
  }

  cards.forEach((card) => {
    // Get the type line, considering both regular cards and cards with card_faces
    let typeLine = '';

    // For regular cards, use the card's type_line
    if (card.type_line) {
      typeLine = card.type_line;
    }
    // For reversible_card layouts or other multi-faced cards without a main type_line
    else if (card.card_faces && card.card_faces.length > 0) {
      // For reversible cards, prioritize the main face (usually the first face)
      // For adventure cards, the first face is the creature
      typeLine = card.card_faces[0].type_line || '';
    }

    const primaryType = typeLine.split(' — ')[0]?.trim().toLowerCase() || '';
    let groupAssigned = false;

    if (primaryType.includes('creature')) {
      groups.creature.push(card);
      groupAssigned = true;
    } else if (primaryType.includes('planeswalker')) {
      groups.planeswalker.push(card);
      groupAssigned = true;
    } else if (primaryType.includes('instant')) {
      groups.instant.push(card);
      groupAssigned = true;
    } else if (primaryType.includes('sorcery')) {
      groups.sorcery.push(card);
      groupAssigned = true;
    } else if (primaryType.includes('artifact')) {
      groups.artifact.push(card);
      groupAssigned = true;
    } else if (primaryType.includes('enchantment')) {
      groups.enchantment.push(card);
      groupAssigned = true;
    } else if (primaryType.includes('land')) {
      groups.land.push(card);
      groupAssigned = true;
    }

    if (!groupAssigned) {
      // Fallback for types not explicitly handled or if type_line is missing/malformed
      groups.other.push(card);
    }
  });

  // Optional: Remove empty groups if desired
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}
