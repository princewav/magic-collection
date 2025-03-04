import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSONCardRepository } from '@/app/repositories/JSONCardRepository';
import { Card } from '@/app/models/Card';

global.fetch = vi.fn();

describe('JSONCardRepository', () => {
  let repository: JSONCardRepository;

  beforeEach(() => {
    repository = new JSONCardRepository();
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  it('should return a card by ID if it exists', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' }],
    });

    const card = await repository.getCardById('1');
    expect(card).toEqual({ id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' });
    expect(global.fetch).toHaveBeenCalledWith('/api/cards');
  });

  it('should return null if a card with the given ID does not exist', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' }],
    });
    const card = await repository.getCardById('3');
    expect(card).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/api/cards');
  });

  it('should return all cards', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' },
        { id: '2', name: 'Card 2', oracle_text: 'Some other text', colors: ['B'], type_line: 'Instant' },
      ],
    });

    const allCards = await repository.getAllCards();
    expect(allCards).toEqual([
      { id: '1', name: 'Card 1', oracle_text: 'Some text', colors: ['W'], type_line: 'Creature' },
      { id: '2', name: 'Card 2', oracle_text: 'Some other text', colors: ['B'], type_line: 'Instant' },
    ]);
    expect(global.fetch).toHaveBeenCalledWith('/api/cards');
  });

  it('should handle errors when fetching cards', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const allCards = await repository.getAllCards();
    expect(allCards).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith('/api/cards');
  });
});
