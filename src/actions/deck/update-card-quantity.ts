'use server';

import { deckService } from '@/db/services/DeckService';
import { revalidatePath } from 'next/cache';

type DeckSection = 'maindeck' | 'sideboard' | 'maybeboard';

export const updateCardQuantity = async (
  deckId: string,
  cardId: string,
  section: DeckSection = 'maindeck',
  change: 1 | -1,
) => {
  try {
    // Get current deck
    const decks = await deckService.repo.get([deckId]);
    if (!decks || decks.length === 0) {
      throw new Error(`Deck ${deckId} not found`);
    }

    const currentDeck = decks[0];
    const sectionCards = currentDeck[section] || [];

    // Find the card in the deck section
    const cardIndex = sectionCards.findIndex((card) => card.cardId === cardId);

    if (cardIndex === -1 && change === 1) {
      // Card doesn't exist in deck but we're adding it
      // This should not happen normally as we're only modifying existing cards
      throw new Error(`Card ${cardId} not found in deck ${deckId}`);
    } else if (cardIndex === -1) {
      // Card doesn't exist and we're trying to remove it - do nothing
      return currentDeck;
    }

    // Update the card quantity
    const updatedCards = [...sectionCards];
    const currentQuantity = updatedCards[cardIndex].quantity || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    if (newQuantity === 0) {
      // Remove the card if quantity is 0
      updatedCards.splice(cardIndex, 1);
    } else {
      updatedCards[cardIndex] = {
        ...updatedCards[cardIndex],
        quantity: newQuantity,
      };
    }

    // Update the deck with the new card list
    const updatedDeck = await deckService.repo.update(deckId, {
      [section]: updatedCards,
    });

    if (!updatedDeck) {
      throw new Error(`Failed to update deck ${deckId}`);
    }

    // Revalidate the deck page to show updated quantities
    revalidatePath(`/decks/${currentDeck.type}/${deckId}`);

    return updatedDeck;
  } catch (error) {
    console.error('Error updating card quantity:', error);
    throw new Error('Failed to update card quantity');
  }
};
