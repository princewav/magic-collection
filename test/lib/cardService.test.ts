import { describe, it, expect } from 'vitest';
import { loadCardsData } from '@/lib/cardService';
import * as fs from 'fs/promises';
import path from 'path';

describe('cardService', () => {
  it('should load cards data successfully', async () => {
    const mockCardData = '[{"id": "1", "name": "Test Card", "oracle_id": "test"}]';
    const testFilePath = path.join(__dirname, 'test-card-data.json');
    await fs.writeFile(testFilePath, mockCardData);

    const cards = await loadCardsData(testFilePath);
    expect(cards).toEqual([{ id: '1', name: 'Test Card', oracle_id: 'test' }]);
  });

  it('should handle invalid JSON data', async () => {
    const mockCardData = '[{"id": "1", "name": "Test Card", "oracle_id": "test"}]';
    const testFilePath = path.join(__dirname, 'test-card-data.json');
    await fs.writeFile(testFilePath, mockCardData);

    const cards = await loadCardsData(testFilePath);
    expect(cards).toEqual([{ id: '1', name: 'Test Card', oracle_id: 'test' }]);
  });

  it('should handle file reading errors', async () => {
    const testFilePath = path.join(__dirname, 'non-existent-file.json');
    const cards = await loadCardsData(testFilePath);
    expect(cards).toEqual([]);
  });
});
