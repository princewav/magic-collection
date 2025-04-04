'use client';
import React from 'react';
import { ManaSymbol } from '../ManaSymbol';

interface TextWithSymbolsProps {
  text: string;
  symbolSize: number;
  textClassName?: string;
  symbolClassName?: string;
}
export const TextWithSymbols: React.FC<TextWithSymbolsProps> = ({
  text,
  symbolSize,
  textClassName,
  symbolClassName,
}) => {
  // Split the text by mana symbols ({symbol})
  const parts = text.split(/({[^}]+})/);

  return (
    <>
      {parts.map((part, idx) => {
        const match = part.match(/{([^}]+)}/);
        if (match) {
          // Render ManaSymbol component for symbols
          const symbol = match[1];
          return (
            <ManaSymbol
              key={idx}
              symbol={symbol}
              size={symbolSize}
              className={symbolClassName}
            />
          );
        }
        // Render text part within a span
        return (
          <span key={idx} className={textClassName}>
            {part}
          </span>
        );
      })}
    </>
  );
};
