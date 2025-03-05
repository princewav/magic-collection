import { describe, it, expect, vi } from 'vitest';
import { loadCardsData } from '@/lib/cardService';
import * as fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock(import("path"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    join: vi.fn().mockReturnValue('mocked/path/to/card.example')

  }
})

describe('cardService', () => {
  it('should load cards data successfully', async () => {
    const mockCardData = '[{"id": "1", "name": "Test Card"}]';
    (fs.readFile as any).mockResolvedValue(mockCardData);
    // (path.join as any).mockReturnValue('mocked/path/to/card.example');

    const cards = await loadCardsData();
    expect(cards).toEqual([{ id: '1', name: 'Test Card' }]);
    expect(fs.readFile).toHaveBeenCalledWith('mocked/path/to/card.example', 'utf-8');
  });

  // it('should handle invalid JSON data', async () => {
  //   (fs.readFile as any).mockResolvedValue('Invalid JSON');
  //   // (path.join as any).mockReturnValue('mocked/path/to/card.example');

  //   await expect(loadCardsData()).rejects.toThrowError("Invalid JSON format in card data file.");
  //   expect(fs.readFile).toHaveBeenCalledWith('mocked/path/to/card.example', 'utf-8');
  // });

  // it('should handle file reading errors', async () => {
  //   (fs.readFile as any).mockRejectedValue(new Error('File not found'));
  //   // (path.join as any).mockReturnValue('mocked/path/to/card.example');

  //   const cards = await loadCardsData();
  //   expect(cards).toEqual([]);
  //   expect(fs.readFile).toHaveBeenCalledWith('mocked/path/to/card.example', 'utf-8');
  // });
});
