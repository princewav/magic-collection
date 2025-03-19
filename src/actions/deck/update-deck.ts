'use server';

import { deckSchema } from '@/app/decks/new/validation';
import { z } from 'zod';
import { deckService } from '@/db/services/DeckService';
import { revalidatePath } from 'next/cache';
import { importDeckList } from './import-list';

export const updateDeck = async (
  id: string,
  values: z.infer<typeof deckSchema>,
) => {
  try {
    // Get current deck to check if name is being changed
    const currentDecks = await deckService.repo.get([id]);
    if (!currentDecks || currentDecks.length === 0) {
      throw new Error(`Deck ${id} not found`);
    }
    const currentDeck = currentDecks[0];

    let deckName = values.name;
    const { decklist, ...restOfValues } = values;

    // Only check for duplicate names if the name is being changed
    if (currentDeck.name !== values.name) {
      let existingDecks = await deckService.repo.findBy({
        name: deckName,
        id: { $ne: id }, // Exclude current deck
      });
      let count = 2;

      while (existingDecks.length > 0) {
        deckName = `${values.name} (${count})`;
        existingDecks = await deckService.repo.findBy({
          name: deckName,
          id: { $ne: id }, // Exclude current deck
        });
        count++;
      }
    }

    const deck = await deckService.repo.update(id, {
      ...restOfValues,
      name: deckName, // Use the unique deck name
      imageUrl: values.imageUrl ?? null,
      format: values.format ?? undefined,
    });

    if (!deck) {
      throw new Error(`Deck ${id} not found`);
    }

    // Update decklist if provided
    if (decklist) {
      const decklistResult = await importDeckList(deck.id, decklist);
      if (!decklistResult.success) {
        throw new Error('Failed to import decklist');
      }
    }

    revalidatePath(`/decks/${values.type}`);
    return deck;
  } catch (error) {
    console.error('Error updating deck:', error);
    throw new Error('Failed to update deck');
  }
};
