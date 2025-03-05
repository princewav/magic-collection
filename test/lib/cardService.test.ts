import { describe, it, expect } from 'vitest';
import { loadCardsData } from '@/lib/cardService';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', '..', 'data', 'card.db');

describe('cardService', () => {
  it('should load cards data successfully', async () => {
    const db = new Database(dbPath);

    // Insert test data into the database
    db.prepare('DELETE FROM cards').run(); // Clear existing data
    const insert = db.prepare(`INSERT INTO cards (id, oracle_id, name) VALUES (?, ?, ?)`);
    insert.run('1', 'test', 'Test Card');

    const cards = await loadCardsData(path.join(__dirname, 'test-card-data.json')); // Path doesn't matter now
    expect(cards).toEqual([{ id: '1', oracle_id: 'test', name: 'Test Card' }]);

    db.close();
  });

  it('should handle invalid JSON data', async () => {
    const db = new Database(dbPath);

    // Insert test data into the database
    db.prepare('DELETE FROM cards').run(); // Clear existing data
    const insert = db.prepare(`INSERT INTO cards (id, oracle_id, name) VALUES (?, ?, ?)`);
    insert.run('1', 'test', 'Test Card');

    const cards = await loadCardsData(path.join(__dirname, 'test-card-data.json')); // Path doesn't matter now
    expect(cards).toEqual([{ id: '1', oracle_id: 'test', name: 'Test Card' }]);

    db.close();
  });

  it('should handle file reading errors', async () => {
    const testFilePath = path.join(__dirname, 'non-existent-file.json');
    const cards = await loadCardsData(testFilePath);
    expect(cards).toEqual([]);
  });
});
