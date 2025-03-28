'use client';

import { useCardModal } from '@/context/CardModalContext';
import Image from 'next/image';
import { Card as CardType } from '@/types/card';
import { cn } from '@/lib/utils';
interface CardProps {
  card: CardType & { quantity: number };
  collectedQuantity?: number;
  className?: string;
}

export function Card({ card, collectedQuantity = 0, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-foreground/10 flex w-full transform cursor-pointer flex-col items-center rounded-md shadow-md transition-transform',
        className,
      )}
    >
      <div className="relative flex w-full flex-col justify-center p-2">
        <div className="mb-2 flex w-full justify-center">
          <div className="flex space-x-3">
            {Array.from(
              { length: Math.min(collectedQuantity, card.quantity) },
              (_, i) => (
                <div
                  key={i}
                  className="bg-accent h-2 w-2 rotate-45 transform"
                />
              ),
            )}
            {Array.from(
              { length: card.quantity - collectedQuantity },
              (_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rotate-45 transform bg-gray-500"
                />
              ),
            )}
          </div>
        </div>
        {card.image_uris?.normal ? (
          <Image
            src={card.image_uris.normal}
            alt={`Card ${card.name}`}
            className="h-auto w-full rounded-xl rounded-t-md"
            width={400}
            height={550}
            style={{ aspectRatio: '0.72', width: '100%', height: 'auto' }}
          />
        ) : (
          <div className="flex h-32 w-full flex-col items-center justify-center rounded-t-md bg-transparent">
            <p className="text-center text-lg font-semibold">{card.name}</p>
            <p className="text-sm text-gray-600">No image available</p>
            <p className="text-sm text-gray-600">
              Oracle: {card.oracle_text || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              Power/Toughness: {card.power}/{card.toughness}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
