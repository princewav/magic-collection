# Database Structure and Methods Reference

This document provides a quick reference for common database services, repositories, and methods used in this project.

## Key Files

- **Database Connection & Initialization:** `src/db/db.ts`
  - Exports `DB` (the connected MongoDB `Db` instance).
  - Exports `RepoCls` as an alias for `MongoRepository`.
- **Card Service:** `src/db/services/CardService.ts`
  - Provides business logic for card operations.
  - Instance named `cardService`.
  - Exposes the underlying repository via `cardService.repo`.
- **Generic MongoDB Repository:** `src/db/repositories/MongoRepository.ts`
  - Provides basic CRUD operations for MongoDB collections.
  - Used by `CardService` (via `RepoCls` alias).

## Common Repository Methods (`cardService.repo.*`)

- `createMany(items: Omit<T, 'id'>[]): Promise<T[]>`: Inserts multiple documents into the collection.
- `dropCollection(): Promise<boolean>`: Deletes the entire collection. Use with caution!
- `get(ids: string[]): Promise<T[] | null>`: Fetches documents by their `_id`.
- `getAll(limit?: number): Promise<T[]>`: Fetches all documents, optionally limited.
- `findBy(selector: Filter<T>): Promise<T[]>`: Finds documents matching a specific filter.
- `delete(id: string): Promise<boolean>`: Deletes a single document by `_id`.
- `update(id: string, item: Partial<T>): Promise<T | null>`: Updates a single document by `_id`.

## Example Usage (from `populate-db.ts`)

```typescript
import { cardService } from '../services/CardService';
import logger from '@/lib/logger';

// ... fetch card data ...

// Drop the existing collection
await cardService.repo.dropCollection();
logger.debug('Existing cards collection dropped.');

// Insert new cards
const result = await cardService.repo.createMany(cards);
logger.debug('Cards collection populated successfully');
```
