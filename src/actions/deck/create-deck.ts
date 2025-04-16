'use server';

import { deckSchema } from '@/app/decks/new/validation';
import { z } from 'zod';
import { deckService } from '@/db/services/DeckService';
import { revalidatePath } from 'next/cache';
import { importDeckList } from './import-list';

export const createDeck = async (values: z.infer<typeof deckSchema>) => {
  try {
    // Check for existing decks with the same name
    let deckName = values.name;
    let existingDecks = await deckService.repo.findBy({ name: deckName });
    let count = 2;

    while (existingDecks.length > 0) {
      deckName = `${values.name} (${count})`;
      existingDecks = await deckService.repo.findBy({ name: deckName });
      count++;
    }

    const deck = await deckService.repo.create({
      id: '',
      name: deckName, // Use the unique deck name
      type: values.type,
      imageUrl: values.imageUrl ?? null,
      format: values.format ?? undefined,
      colors: [],
      maindeck: [],
      sideboard: [],
      maybeboard: [],
    });
    if (values.decklist) {
      const decklist = await importDeckList(deck.id, values.decklist);
      if (!decklist.success) {
        throw new Error('Failed to import decklist');
      }
    }
    revalidatePath(`/decks/${values.type}`);
    return deck;
  } catch (error) {
    console.error('Error creating deck:', error);
    throw new Error('Failed to create deck');
  }
};
