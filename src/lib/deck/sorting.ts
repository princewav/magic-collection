export function sortCardsByQuantity<T extends { quantity: number }>(
  cards: T[],
  direction: 'asc' | 'desc',
) {
  return cards.sort((a, b) =>
    direction === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity,
  );
}
export function sortCardsByName<T extends { name: string }>(
  cards: T[],
  direction: 'asc' | 'desc',
) {
  return cards.sort((a, b) =>
    direction === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name),
  );
}
export function sortCardsBySet<T extends { set: string }>(
  cards: T[],
  direction: 'asc' | 'desc',
) {
  return cards.sort((a, b) =>
    direction === 'asc'
      ? a.set.localeCompare(b.set)
      : b.set.localeCompare(a.set),
  );
}
export function sortCardsBySetNumber<T extends { setNumber: number }>(
  cards: T[],
  direction: 'asc' | 'desc',
) {
  return cards.sort((a, b) =>
    direction === 'asc' ? a.setNumber - b.setNumber : b.setNumber - a.setNumber,
  );
}
export function sortCardsByColor<T extends { colors: string[] }>(
  cards: T[],
  direction: 'asc' | 'desc',
) {
  return cards.sort((a, b) =>
    direction === 'asc'
      ? a.colors.join('').localeCompare(b.colors.join(''))
      : b.colors.join('').localeCompare(a.colors.join('')),
  );
}
export function sortCardsByRarity<T extends { rarity: string }>(
  cards: T[],
  direction: 'asc' | 'desc',
) {
  return cards.sort((a, b) =>
    direction === 'asc'
      ? a.rarity.localeCompare(b.rarity)
      : b.rarity.localeCompare(a.rarity),
  );
}
export function sortCardsByManaCost<T extends { cmc: number }>(
  cards: T[],
  direction: 'asc' | 'desc',
) {
  return cards.sort((a, b) =>
    direction === 'asc' ? a.cmc - b.cmc : b.cmc - a.cmc,
  );
}
export function sortCardsByCardType<T extends { cardType: string }>(
  cards: T[],
  direction: 'asc' | 'desc',
) {
  return cards.sort((a, b) =>
    direction === 'asc'
      ? a.cardType.localeCompare(b.cardType)
      : b.cardType.localeCompare(a.cardType),
  );
}
