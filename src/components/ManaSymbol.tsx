import React from 'react';
import { cn } from '@/lib/utils';

interface ManaSymbolProps {
  symbol: string;
  size?: number;
  className?: string;
}

export const ManaSymbol: React.FC<ManaSymbolProps> = ({
  symbol,
  size,
  className,
}) => {
  const formattedSymbol = symbol.toLowerCase().replace(/\//g, '');
  const imageUrl = `/images/mana/${formattedSymbol}.svg`;

  return (
    <img 
      src={imageUrl}
      alt={symbol}
      style={size ? { width: size, height: size } : undefined}
      title={symbol}
      className={cn('size-4 md:size-5', className)}
    />
  );
};
