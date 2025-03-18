'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import { CardWithQuantity } from '@/types/card';

interface MissingCardsModalContextType {
  isOpen: boolean;
  deckId: string | null;
  openModal: (deckId: string) => void;
  closeModal: () => void;
}

const MissingCardsModalContext = createContext<
  MissingCardsModalContextType | undefined
>(undefined);

interface MissingCardsModalProviderProps {
  children: ReactNode;
}

export function MissingCardsModalProvider({
  children,
}: MissingCardsModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deckId, setDeckId] = useState<string | null>(null);

  const openModal = (deckId: string) => {
    setDeckId(deckId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const value: MissingCardsModalContextType = {
    isOpen,
    deckId,
    openModal,
    closeModal,
  };

  return (
    <MissingCardsModalContext.Provider value={value}>
      {children}
    </MissingCardsModalContext.Provider>
  );
}

export function useMissingCardsModal() {
  const context = useContext(MissingCardsModalContext);
  if (!context) {
    throw new Error(
      'useMissingCardsModal must be used within a MissingCardsModalProvider',
    );
  }
  return context;
}
