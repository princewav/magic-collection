import React from 'react';
import { cn } from '@/lib/utils';

interface NumberSymbolProps {
  symbol: string;
  size?: number;
  className?: string;
}

export const NumberSymbol: React.FC<NumberSymbolProps> = ({
  symbol,
  size = 20,
  className,
}) => {
  return (
    <span
      className={cn(`rounded-full bg-gray-300 text-center text-black flex items-center justify-center font-serif relative`, className)}
      style={{ height: size, width: size, fontSize: size * 1.1}}
    >
      <span className="absolute" style={{ bottom: -size * 0.25, left: size * 0.26 }}>{symbol}</span>
    </span>
  );
};
