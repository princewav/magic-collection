'use client';

import { useCardModal } from '@/context/CardModalContext';
import Image from 'next/image';
import { Card as CardType } from '@/types/card';

interface CardProps {
  card: CardType & { quantity: number };
}

export function Card({ card }: CardProps) {
  const { openModal } = useCardModal();
  return (
    <div
      className="bg-foreground/10 flex transform cursor-pointer flex-col items-center rounded-md shadow-md transition-transform hover:scale-105"
      onClick={() => {
        openModal(card);
      }}
    >
      <div className="relative flex w-full flex-col justify-center p-2">
        <div className="mb-2 flex w-full justify-center">
          <div className="flex space-x-3">
            {Array.from({ length: card.quantity }, (_, i) => (
              <div
                key={i}
                className="h-2 w-2 rotate-45 transform bg-yellow-500"
              />
            ))}
          </div>
        </div>
        <Image
          src={card.image_uris.normal}
          alt={`Card ${card.name}`}
          className="rounded-xl rounded-t-md"
          width={223}
          height={310}
        />
      </div>
    </div>
  );
}

