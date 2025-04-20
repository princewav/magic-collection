'use server';

import { collectionCardService } from '@/db/services/CollectionCardService';
import { Card, CollectionCard } from '@/types/card';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

type AddCardParams = {
  card: Card;
  quantity: number;
  collectionType: 'paper' | 'arena';
  condition?:
    | 'near_mint'
    | 'lightly_played'
    | 'moderately_played'
    | 'heavily_played'
    | 'damaged';
  foil?: 'normal' | 'foil' | 'etched';
  binderName?: string;
  binderType?: string;
  language?: string;
  purchasePrice?: number;
  purchasePriceCurrency?: string;
  misprint?: boolean;
  altered?: boolean;
};

export async function addCardToCollection({
  card,
  quantity,
  collectionType,
  condition = 'near_mint',
  foil = 'normal',
  binderName = 'Default',
  binderType = 'Default',
  language = 'en',
  purchasePrice = 0,
  purchasePriceCurrency = 'EUR',
  misprint = false,
  altered = false,
}: AddCardParams): Promise<CollectionCard> {
  try {
    // Get the current user's session
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const userId = session.user.id;

    // Check if the card already exists in the user's collection
    const existingCards =
      await collectionCardService.getByCardIdForSpecificUser(userId, [
        card.cardId,
      ]);

    const existingCard =
      existingCards && existingCards.length > 0
        ? existingCards.find(
            (c) =>
              c.cardId === card.cardId &&
              c.collectionType === collectionType &&
              c.foil === foil,
          )
        : null;

    // If card exists, update the quantity
    if (existingCard) {
      const updatedCard = await collectionCardService.repo.update(
        existingCard.id,
        {
          quantity: existingCard.quantity + quantity,
        },
      );

      if (!updatedCard) {
        throw new Error('Failed to update card quantity');
      }

      return updatedCard;
    }

    // Otherwise create a new collection card
    const newCard: Omit<CollectionCard, 'id'> = {
      userId: userId,
      cardId: card.cardId,
      name: card.name,
      setCode: card.set,
      setName: card.set_name,
      collectorNumber: card.collector_number,
      foil,
      rarity: card.rarity as any, // Convert string to enum
      quantity,
      collectionType,
      condition,
      binderName,
      binderType,
      language,
      purchasePrice,
      purchasePriceCurrency,
      misprint,
      altered,
      manaBoxId: '',
      scryfallId: card.cardId,
      imageUri: card.image_uris?.normal,
      dateAdded: new Date(),
    };

    const createdCard = await collectionCardService.repo.create(
      newCard as CollectionCard,
    );
    return createdCard;
  } catch (error) {
    console.error('Error adding card to collection:', error);
    throw new Error('Failed to add card to collection');
  }
}
