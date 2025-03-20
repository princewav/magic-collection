'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from 'react';

interface WishlistSelectionContextType {
  selectedWishlists: string[];
  toggleWishlistSelection: (wishlistId: string) => void;
  clearWishlistSelection: () => void;
}

const WishlistSelectionContext = createContext<
  WishlistSelectionContextType | undefined
>(undefined);

interface WishlistSelectionProviderProps {
  children: ReactNode;
}

export const WishlistSelectionProvider: React.FC<
  WishlistSelectionProviderProps
> = ({ children }) => {
  const [selectedWishlists, setSelectedWishlists] = useState<string[]>([]);

  const toggleWishlistSelection = useCallback((wishlistId: string) => {
    setSelectedWishlists((prevSelectedWishlists) =>
      prevSelectedWishlists.includes(wishlistId)
        ? prevSelectedWishlists.filter((id) => id !== wishlistId)
        : [...prevSelectedWishlists, wishlistId],
    );
  }, []);

  const clearWishlistSelection = useCallback(() => {
    setSelectedWishlists([]);
  }, []);

  const value: WishlistSelectionContextType = {
    selectedWishlists,
    toggleWishlistSelection,
    clearWishlistSelection,
  };

  return (
    <WishlistSelectionContext.Provider value={value}>
      {children}
    </WishlistSelectionContext.Provider>
  );
};

export const useWishlistSelection = () => {
  const context = useContext(WishlistSelectionContext);
  if (!context) {
    throw new Error(
      'useWishlistSelection must be used within a WishlistSelectionProvider',
    );
  }
  return context;
};
