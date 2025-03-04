import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSONCardRepository } from '@/app/repositories/JSONCardRepository';
import { Card } from '@/app/models/Card';
import * as cardService from '@/lib/cardService';

vi.mock('@/lib/cardService', () => {
  const mockCards = [
    { id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' },
    { id: '2', name: 'Card 2', oracle_text: 'Some other text', colors: ['B'], type_line: 'Instant' },
  ];

  return {
    loadCardsData: vi.fn().mockResolvedValue(mockCards),
  };
});

describe('JSONCardRepository', () => {
  let repository: JSONCardRepository;

  beforeEach(() => {
    repository = new JSONCardRepository();
    vi.clearAllMocks();
  });

  it('should return a card by ID if it exists', async () => {
    const card = await repository.getCardById('1');
    expect(card).toEqual({ id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' });
    expect(cardService.loadCardsData).toHaveBeenCalled();
  });

  it('should return null if a card with the given ID does not exist', async () => {
    const mockCards = [{ id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' }];
    (cardService.loadCardsData as any).mockResolvedValue(mockCards);
    const card = await repository.getCardById('3');
    expect(card).toBeNull();
    expect(cardService.loadCardsData).toHaveBeenCalled();
  });

  it('should return all cards', async () => {
    const allCards = await repository.getAllCards();
    expect(allCards).toEqual([
      { id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' },
      { id: '2', name: 'Card 2', oracle_text: 'Some other text', colors: ['B'], type_line: 'Instant' },
    ]);
    expect(cardService.loadCardsData).toHaveBeenCalled();
  });

  it('should handle errors when fetching cards', async () => {
    (cardService.loadCardsData as any).mockRejectedValue(new Error('Failed to load cards'));

    const allCards = await repository.getAllCards();
    expect(allCards).toEqual([]);
    expect(cardService.loadCardsData).toHaveBeenCalled();
  });
});
