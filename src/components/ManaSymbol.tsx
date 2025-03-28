import React from 'react';

interface ManaSymbolProps {
  symbol: string;
  size?: number;
  className?: string;
}

export const ManaSymbol: React.FC<ManaSymbolProps> = ({
  symbol,
  size = 20,
  className,
}) => {
  const imageUrl = `/images/mana/${symbol}.svg`;

  return (
    <img
      src={imageUrl}
      alt={symbol}
      style={{ width: size, height: size }}
      title={symbol}
      className={className}
    />
  );
};
