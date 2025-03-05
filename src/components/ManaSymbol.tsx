import React from 'react';

interface ManaSymbolProps {
  symbol: string;
}

export const ManaSymbol: React.FC<ManaSymbolProps> = ({ symbol }) => {
  const imageUrl = `/images/mana/${symbol}.svg`; // Assuming images are in public/mana-symbols

  return (
    <img
      src={imageUrl}
      alt={symbol}
      className="w-6 h-6"
      title={symbol}
    />
  );
};
