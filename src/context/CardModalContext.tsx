"use client";

import { createContext, useState, useContext, ReactNode } from 'react';

interface CardModalContextType {
  isOpen: boolean;
  cardId: string | null;
  openModal: (cardId: string) => void;
  closeModal: () => void;
}

const CardModalContext = createContext<CardModalContextType | undefined>(undefined);

interface CardModalProviderProps {
  children: ReactNode;
}

export function CardModalProvider({ children }: CardModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cardId, setCardId] = useState<string | null>(null);

  const openModal = (cardId: string) => {
    setCardId(cardId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setCardId(null);
    setIsOpen(false);
  };

  const value: CardModalContextType = {
    isOpen,
    cardId,
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
