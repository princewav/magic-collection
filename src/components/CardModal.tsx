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
  const { isOpen, cardId, closeModal } = useCardModal();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  console.log(`CardModal rendered, isOpen: ${isOpen}, cardId: ${cardId}`);

  useEffect(() => {
    if (!cardId || !isOpen) {
      console.log('CardModal useEffect - cardId or isOpen is false, returning');
      return;
    }

    const fetchCardData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching card data for ${cardId}`);
        const response = await fetch(
          `https://api.scryfall.com/cards/${cardId}`,
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Card not found.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCardData(data);
        console.log(`Card data fetched successfully for ${cardId}`);
      } catch (e) {
        setError((e as Error).message);
        console.error(`Error fetching card data for ${cardId}:`, e);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [cardId, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        console.log('Clicked outside the modal, closing it');
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
    console.log('CardModal is not open, returning null');
    return null;
  }

  if (loading) {
    console.log('CardModal is loading');
    return (
      <div className="bg-opacity-50 fixed top-0 left-0 flex h-full w-full items-center justify-center bg-gray-900">
        <div className="rounded-md bg-gray-700 p-4 text-lg shadow-md">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    console.log('CardModal has an error');
    return (
      <div className="bg-opacity-50 fixed top-0 left-0 flex h-full w-full items-center justify-center bg-gray-900">
        <div className="rounded-md bg-gray-700 p-4 text-lg shadow-md">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!cardData) {
    console.log('CardModal - card data not found');
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
    cardData.power && cardData.toughness
      ? `${cardData.power}/${cardData.toughness}`
      : null;

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
                    cardData.image_uris?.normal ||
                    'https://via.placeholder.com/223x310'
                  }
                  alt={cardData.name}
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
                  {cardData.name}
                </h2>
                <p className="text-xl text-gray-400">{cardData.mana_cost}</p>
                <p className="text-xl text-gray-300">{cardData.type_line}</p>
                <p className="text-xl text-gray-300">{cardData.oracle_text}</p>
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
