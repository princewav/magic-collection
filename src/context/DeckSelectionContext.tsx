'use client'

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from 'react';

interface DeckSelectionContextType {
  selectedDecks: string[];
  toggleDeckSelection: (deckId: string) => void;
  clearDeckSelection: () => void;
}

const DeckSelectionContext = createContext<
  DeckSelectionContextType | undefined
>(undefined);

interface DeckSelectionProviderProps {
  children: ReactNode;
}

export const DeckSelectionProvider: React.FC<DeckSelectionProviderProps> = ({
  children,
}) => {
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);

  const toggleDeckSelection = useCallback((deckId: string) => {
    setSelectedDecks((prevSelectedDecks) =>
      prevSelectedDecks.includes(deckId)
        ? prevSelectedDecks.filter((id) => id !== deckId)
        : [...prevSelectedDecks, deckId],
    );
  }, []);

  const clearDeckSelection = useCallback(() => {
    setSelectedDecks([]);
  }, []);

  const value: DeckSelectionContextType = {
    selectedDecks,
    toggleDeckSelection,
    clearDeckSelection,
  };

  return (
    <DeckSelectionContext.Provider value={value}>
      {children}
    </DeckSelectionContext.Provider>
  );
};

export const useDeckSelection = () => {
  const context = useContext(DeckSelectionContext);
  if (!context) {
    throw new Error(
      'useDeckSelection must be used within a DeckSelectionProvider',
    );
  }
  return context;
};
