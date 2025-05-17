'use client';

import { useCardModal } from '@/context/CardModalContext';
import Image from 'next/image';
import { Card as CardType } from '@/types/card';
import { cn } from '@/lib/utils';
import { ChevronDown, Repeat } from 'lucide-react';
import { useState } from 'react';

interface CardProps {
  card: CardType & { quantity: number };
  collectedQuantity?: number;
  className?: string;
  onClick?: () => void;
}

const NoImageFallback = ({ card }: { card: CardType }) => (
  <div
    data-role="no-image-fallback"
    className="flex h-32 w-full flex-col items-center justify-center rounded-t-md bg-transparent"
  >
    <p
      data-role="card-name-fallback"
      className="text-center text-lg font-semibold"
    >
      {card.name}
    </p>
    <p data-role="no-image-text" className="text-sm text-gray-600">
      No image available
    </p>
    <p data-role="oracle-text-fallback" className="text-sm text-gray-600">
      Oracle: {card.oracle_text || 'N/A'}
    </p>
    <p data-role="power-toughness-fallback" className="text-sm text-gray-600">
      Power/Toughness: {card.power}/{card.toughness}
    </p>
  </div>
);

export function Card({
  card,
  collectedQuantity,
  className,
  onClick,
}: CardProps) {
  const { openModal } = useCardModal();
  const [faceIndex, setFaceIndex] = useState(0);

  // Check if this is a double-faced card with faces that have images
  const isReversibleWithFaces =
    (card.layout === 'reversible_card' ||
      card.layout === 'modal_dfc' ||
      card.layout === 'transform') &&
    !card.image_uris &&
    card.card_faces &&
    card.card_faces.length > 0 &&
    card.card_faces[0].image_uris !== undefined;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openModal(card);
    }
  };

  const toggleFace = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFaceIndex(faceIndex === 0 ? 1 : 0);
  };

  return (
    <div
      data-role="card-container"
      className={cn(
        'rounded-mdshadow-md relative flex h-full w-full transform cursor-pointer flex-col items-center justify-center transition-transform',
        className,
      )}
      onClick={handleClick}
    >
      {collectedQuantity !== undefined && (
        <div
          data-role="quantity-indicators"
          className="mb-2 flex w-full justify-center space-x-3 overflow-hidden"
        >
          {Array.from(
            { length: Math.min(collectedQuantity, card.quantity) },
            (_, i) => (
              <div
                data-role="collected-indicator"
                key={i}
                className="bg-accent h-2 w-2 rotate-45 transform"
              />
            ),
          )}
          {Array.from({ length: card.quantity - collectedQuantity }, (_, i) => (
            <div
              data-role="missing-indicator"
              key={i}
              className="h-2 w-2 rotate-45 transform bg-gray-500"
            />
          ))}
        </div>
      )}

      {isReversibleWithFaces && card.card_faces ? (
        <div className="relative">
          <Image
            src={
              card.card_faces[faceIndex].image_uris?.normal ??
              '/images/placeholder.webp'
            }
            alt={`Card ${card.card_faces[faceIndex].name}`}
            className="h-auto w-full rounded-xl"
            width={400}
            height={550}
            style={{ aspectRatio: '0.72', width: '100%', height: 'auto' }}
          />

          {/* Flip face button */}
          {card.card_faces.length > 1 && (
            <button
              onClick={toggleFace}
              className="absolute right-2 bottom-2 rounded-full bg-black/70 p-1 text-white hover:bg-black/90 cursor-pointer"
              aria-label="Flip card"
            >
              <Repeat className="h-5 w-5" />
            </button>
          )}
        </div>
      ) : card.image_uris?.normal ? (
        <Image
          src={card.image_uris.normal}
          alt={`Card ${card.name}`}
          className="h-auto w-full rounded-xl"
          width={400}
          height={550}
          style={{ aspectRatio: '0.72', width: '100%', height: 'auto' }}
        />
      ) : (
        <NoImageFallback card={card} />
      )}
    </div>
  );
}
