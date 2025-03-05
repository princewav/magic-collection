import { describe, it, expect, vi } from 'vitest';
import { loadCardsData } from '@/lib/cardService';
import * as fs from 'fs/promises';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('path', () => ({
  join: vi.fn().mockReturnValue('mocked/path/to/card.example'),
}));

describe('cardService', () => {
  it('should load cards data successfully', async () => {
    const mockCardData = '[{"id": "1", "name": "Test Card"}]';
    (fs.readFile as any).mockResolvedValue(mockCardData);

    const cards = await loadCardsData();
    expect(cards).toEqual([{ id: '1', name: 'Test Card' }]);
    expect(fs.readFile).toHaveBeenCalledWith('mocked/path/to/card.example', 'utf-8');
  });

  // it('should handle invalid JSON data', async () => {
  //   (fs.readFile as any).mockResolvedValue('Invalid JSON');
  //   await expect(loadCardsData()).rejects.toThrowError("Invalid JSON format in card data file.");
  //   expect(fs.readFile).toHaveBeenCalledWith('mocked/path/to/card.example', 'utf-8');
  // });

  // it('should handle file reading errors', async () => {
  //   (fs.readFile as any).mockRejectedValue(new Error('File not found'));
  //   const cards = await loadCardsData();
  //   expect(cards).toEqual([]);
  //   expect(fs.readFile).toHaveBeenCalledWith('mocked/path/to/card.example', 'utf-8');
  // });
});
