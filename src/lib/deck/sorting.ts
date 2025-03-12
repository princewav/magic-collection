import { Card } from '@/types/card';
import { compose } from '../utils';

type SortDirection = 'asc' | 'desc';

function sortNumeric<T, K extends keyof T>(
  cards: T[],
  key: K,
  direction: SortDirection,
): T[] {
  return [...cards].sort((a, b) => {
    const valueA = a[key] as unknown as number;
    const valueB = b[key] as unknown as number;
    return direction === 'asc' ? valueA - valueB : valueB - valueA;
  });
}

function sortAlphabetic<T, K extends keyof T>(
  cards: T[],
  key: K,
  direction: SortDirection,
): T[] {
  return [...cards].sort((a, b) => {
    const valueA = a[key] as unknown as string;
    const valueB = b[key] as unknown as string;
    return direction === 'asc'
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });
}

function sortStringArrays<T, K extends keyof T>(
  cards: T[],
  key: K,
  direction: SortDirection,
): T[] {
  return [...cards].sort((a, b) => {
    const valueA = (a[key] as unknown as string[] || []).join('');
    const valueB = (b[key] as unknown as string[] || []).join('');
    return direction === 'asc'
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });
}

function sortLands<T extends { type_line: string }>(
  cards: T[],
  order: 'first' | 'last',
): T[] {
  return [...cards].sort((a, b) => {
    if (!a?.type_line || !b?.type_line) return 0;
    const isLandA = (a.type_line as unknown as string).toLowerCase().includes('land');
    const isLandB = (b.type_line as unknown as string).toLowerCase().includes('land');
    if (isLandA !== isLandB) return order === 'first' ? 1 : -1;
    return 0;
  });
}

// Factory functions che restituiscono funzioni di ordinamento
export const sort = {
  byQuantity:
    <T extends { quantity: number }>(direction: SortDirection) =>
    (cards: T[]): T[] =>
      sortNumeric(cards, 'quantity', direction),

  byName:
    <T extends { name: string }>(direction: SortDirection) =>
    (cards: T[]): T[] =>
      sortAlphabetic(cards, 'name', direction),

  bySet:
    <T extends { set: string }>(direction: SortDirection) =>
    (cards: T[]): T[] =>
      sortAlphabetic(cards, 'set', direction),

  bySetNumber:
    <T extends { setNumber: number }>(direction: SortDirection) =>
    (cards: T[]): T[] =>
      sortNumeric(cards, 'setNumber', direction),

  byColor:
    <T extends { colors: string[] }>(direction: SortDirection) =>
    (cards: T[]): T[] =>
      sortStringArrays(cards, 'colors', direction),

  byRarity:
    <T extends { rarity: string }>(direction: SortDirection) =>
    (cards: T[]): T[] =>
      sortAlphabetic(cards, 'rarity', direction),

  byManaCost:
    <T extends { cmc: number }>(direction: SortDirection) =>
    (cards: T[]): T[] =>
      sortNumeric(cards, 'cmc', direction),

  byCardType:
    <T extends { cardType: string }>(direction: SortDirection) =>
    (cards: T[]): T[] =>
      sortAlphabetic(cards, 'cardType', direction),

  landsLast:
    <T extends { type_line: string }>() =>
    (cards: T[]): T[] =>
      sortLands(cards, 'last'),

  landsFirst:
    <T extends { type_line: string }>() =>
    (cards: T[]): T[] =>
      sortLands(cards, 'first'),
};

export const defaultSort = compose<Card>(
  sort.landsLast(),
  sort.byColor('asc'),
  sort.byManaCost('asc'),
  sort.byName('asc'),
);
