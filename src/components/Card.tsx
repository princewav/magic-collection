'use client';

import { useCardModal } from '@/context/CardModalContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface CardProps {
  id: string;
}

export default function Card({ id }: CardProps) {
  const { openModal } = useCardModal();
  const [imageError, setImageError] = useState(false);
  const [cardData, setCardData] = useState<any>(null); // Use any for now, refine later
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.scryfall.com/cards/${id}`);
        if (!response.ok) {
          // If the response is not ok, throw an error
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Card ${id} fetch accepted`);
        console.log(data);
        setCardData(data);
      } catch (error: any) {
        console.error('Failed to fetch card ', error);
        setCardData(null); // Set cardData to null on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardData();
  }, [id]);

  const handleImageError = () => {
    setImageError(true);
  };

  let imageSrc = cardData?.image_uris?.normal || '';

  return (
    <div
      className="bg-foreground/10 flex transform cursor-pointer flex-col items-center rounded-md shadow-md transition-transform hover:scale-105"
      onClick={() => {
        console.log(`Card ${id} clicked`);
        openModal(id);
      }}
    >
      <div className="relative flex w-full flex-col justify-center p-2">
        <div className="mt-1 mb-2 flex w-full justify-center">
          <div className="flex space-x-3">
            <div className="h-2 w-2 rotate-45 transform bg-yellow-500"></div>
            <div className="h-2 w-2 rotate-45 transform bg-yellow-500"></div>
            <div className="h-2 w-2 rotate-45 transform bg-yellow-500"></div>
            <div className="h-2 w-2 rotate-45 transform bg-yellow-500"></div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex aspect-[223/310] w-52 items-center justify-center rounded-t-md">
            <span className="text-sm text-white">Loading...</span>
          </div>
        ) : cardData === null ? (
          <div className="flex aspect-[223/310] w-52 items-center justify-center rounded-t-md">
            <span className="text-sm text-white">Card not found</span>
          </div>
        ) : imageError || !imageSrc ? (
          <div className="flex aspect-[223/310] w-52 items-center justify-center rounded-t-md">
            <span className="text-sm text-white">Image failed to load</span>
          </div>
        ) : (
          <Image
            src={imageSrc}
            alt={`Card ${cardData?.name || id}`}
            className="rounded-xl rounded-t-md"
            width={223}
            height={310}
            onError={handleImageError}
          />
        )}
      </div>
    </div>
  );
}
