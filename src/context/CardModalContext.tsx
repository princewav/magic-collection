'use client';

import { Card } from '@/types/card';
import { createContext, useState, useContext, ReactNode } from 'react';

interface CardModalContextType {
  isOpen: boolean;
  card: Card | null;
  openModal: (card: Card, cardsList?: Card[]) => void;
  closeModal: () => void;
  goToNextCard: () => void;
  goToPrevCard: () => void;
  hasNextCard: boolean;
  hasPrevCard: boolean;
}

const CardModalContext = createContext<CardModalContextType | undefined>(
  undefined,
);

interface CardModalProviderProps {
  children: ReactNode;
}

export function CardModalProvider({ children }: CardModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [currentCardsList, setCurrentCardsList] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(-1);

  const openModal = (card: Card, cardsList?: Card[]) => {
    setCard(card);
    setIsOpen(true);

    if (cardsList && cardsList.length > 0) {
      setCurrentCardsList(cardsList);
      const index = cardsList.findIndex((c) => c.id === card.id);
      setCurrentCardIndex(index >= 0 ? index : 0);
    } else {
      // If no list provided, create a singleton list with just this card
      setCurrentCardsList([card]);
      setCurrentCardIndex(0);
    }
  };

  const closeModal = () => {
    setCard(null);
    setIsOpen(false);
    setCurrentCardsList([]);
    setCurrentCardIndex(-1);
  };

  const goToNextCard = () => {
    if (currentCardIndex < currentCardsList.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      setCard(currentCardsList[nextIndex]);
    }
  };

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      setCurrentCardIndex(prevIndex);
      setCard(currentCardsList[prevIndex]);
    }
  };

  const hasNextCard = currentCardIndex < currentCardsList.length - 1;
  const hasPrevCard = currentCardIndex > 0;

  const value: CardModalContextType = {
    isOpen,
    card,
    openModal,
    closeModal,
    goToNextCard,
    goToPrevCard,
    hasNextCard,
    hasPrevCard,
  };

  return (
    <CardModalContext.Provider value={value}>
      {children}
    </CardModalContext.Provider>
  );
}

export function useCardModal() {
  const context = useContext(CardModalContext);
  if (!context) {
    throw new Error('useCardModal must be used within a CardModalProvider');
  }
  return context;
}
