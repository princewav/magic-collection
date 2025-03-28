'use client';

import { Card } from '@/types/card';
import Image from 'next/image';
import { useCardModal } from '@/context/CardModalContext';

interface CardItemProps {
  card: Card;
  cardsList?: Card[];
}

export function CardItem({ card, cardsList }: CardItemProps) {
  const { openModal } = useCardModal();

  return (
    <div
      className="group relative aspect-[745/1040] w-full cursor-pointer overflow-hidden rounded-lg transition-transform duration-200 hover:scale-105"
      onClick={() => openModal(card, cardsList)}
    >
      <Image
        src={card.image_uris?.normal || '/card-back.jpg'}
        alt={card.name}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
      />
      <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 group-hover:opacity-20" />
    </div>
  );
}
