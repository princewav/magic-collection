"use client";

import { Card } from '@/types/card';
import { createContext, useState, useContext, ReactNode } from 'react';

interface CardModalContextType {
  isOpen: boolean;
  card: Card | null;
  openModal: (card: Card) => void;
  closeModal: () => void;
}

const CardModalContext = createContext<CardModalContextType | undefined>(undefined);

interface CardModalProviderProps {
  children: ReactNode;
}

export function CardModalProvider({ children }: CardModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [card, setCard] = useState<Card | null>(null);

  const openModal = (card: Card) => {
    setCard(card);
    setIsOpen(true);
  };

  const closeModal = () => {
    setCard(null);
    setIsOpen(false);
  };

  const value: CardModalContextType = {
    isOpen,
    card,
    openModal,
    closeModal,
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
