import { describe, it, expect } from 'vitest';
import { JSONCardRepository } from '../../src/app/repositories/JSONCardRepository';
import { Card } from '../../src/app/models/Card';

describe('JSONCardRepository', () => {
  const mockCards: Card[] = [
    { id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' } as Card,
    { id: '2', name: 'Card 2', oracle_text: 'Some other text', colors: ['B'], type_line: 'Instant' } as Card,
  ];

  it('should return a card by ID if it exists', async () => {
    const repository = new JSONCardRepository(mockCards);
    const card = await repository.getCardById('1');
    expect(card).toEqual(mockCards[0]);
  });

  it('should return null if a card with the given ID does not exist', async () => {
    const repository = new JSONCardRepository(mockCards);
    const card = await repository.getCardById('3');
    expect(card).toBeNull();
  });

  it('should return all cards', async () => {
    const repository = new JSONCardRepository(mockCards);
    const allCards = await repository.getAllCards();
    expect(allCards).toEqual(mockCards);
  });
});
