import React from 'react';

interface NumberSymbolProps {
  symbol: string;
  size?: number;
}

export const NumberSymbol: React.FC<NumberSymbolProps> = ({
  symbol,
  size = 20,
}) => {
  return (
    <span
      className="rounded-full bg-gray-300 text-center text-black flex items-center justify-center font-serif relative"
      style={{ height: size, width: size, fontSize: size * 1.2}}
    >
      <span className="absolute" style={{ bottom: -size * 0.255 }}>{symbol}</span>
    </span>
  );
};
