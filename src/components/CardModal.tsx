'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useCardModal } from '@/context/CardModalContext';
import { X } from 'lucide-react';

interface CardData {
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
}

export default function CardModal() {
  const { isOpen, card, closeModal } = useCardModal();
  const [imageError, setImageError] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) {
    return null;
  }

  if (!card) {
    return (
      <div className="bg-opacity-50 fixed top-0 left-0 flex h-full w-full items-center justify-center bg-gray-900">
        <div className="rounded-md bg-gray-700 p-4 text-lg shadow-md">
          Card not found.
        </div>
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
  };

  const powerToughness =
    card.power && card.toughness ? `${card.power} / ${card.toughness}` : null;

  return (
    <div className="bg-opacity-50 fixed top-0 left-0 flex h-full w-full items-center justify-center bg-gray-900 p-4">
      <div
        className="max-h-[90vh] w-full max-w-4xl rounded-md bg-gray-800 shadow-md"
        ref={modalRef}
      >
        <div className="relative p-4" id="modal-box">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-gray-500 hover:text-gray-300"
          >
            <X size={20} />
          </button>
          <div className="flex h-full">
            <div className="w-1/2 pr-4">
              {imageError ? (
                <div className="flex aspect-[223/310] items-center justify-center rounded-t-md bg-gray-800">
                  <span className="text-lg text-white">
                    Image failed to load
                  </span>
                </div>
              ) : (
                <Image
                  src={
                    card.image_uris?.normal ||
                    'https://via.placeholder.com/223x310'
                  }
                  alt={card.name}
                  className="h-full w-full rounded-t-md object-contain"
                  width={223}
                  height={310}
                  onError={handleImageError}
                />
              )}
            </div>
            <div className="flex w-1/2 flex-col justify-between">
              <div className="flex flex-col space-y-4">
                <h2 className="text-3xl font-bold text-white">
                  {card.name}
                </h2>
                <p className="text-xl text-gray-400">{card.mana_cost}</p>
                <p className="text-xl text-gray-300">{card.type_line}</p>
                <p className="text-xl text-gray-300">{card.oracle_text}</p>
              </div>
              {powerToughness && (
                <div className="mt-2 flex items-center justify-end">
                  <p className="text-3xl text-white">{powerToughness}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
