"use client";

import Image from "next/image";
import { useCardModal } from "../contexts/CardModalContext";
import { useState, useEffect } from "react";

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
        setCardData(data);
      } catch (error: any) {
        console.error("Failed to fetch card ", error);
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

  let imageSrc = cardData?.image_uris?.normal || "";

  return (
    <div
      className="bg-gray-700 rounded-md shadow-md cursor-pointer flex flex-col items-center transition-transform transform hover:scale-105"
      onClick={() => {
        console.log(`Card ${id} clicked`);
        openModal(id);
      }}
    >
      <div className="relative w-full flex flex-col justify-center p-2">
        <div className="flex justify-center w-full mb-2 mt-1">
          <div className="flex space-x-3">
            <div className="w-2 h-2 transform rotate-45 bg-yellow-500"></div>
            <div className="w-2 h-2 transform rotate-45 bg-yellow-500"></div>
            <div className="w-2 h-2 transform rotate-45 bg-yellow-500"></div>
            <div className="w-2 h-2 transform rotate-45 bg-yellow-500"></div>
          </div>
        </div>
        {isLoading ? (
          <div className="aspect-[223/310] w-52 flex items-center justify-center rounded-t-md">
            <span className="text-white text-sm">Loading...</span>
          </div>
        ) : cardData === null ? (
          <div className="aspect-[223/310] w-52 flex items-center justify-center rounded-t-md">
            <span className="text-white text-sm">Card not found</span>
          </div>
        ) : imageError || !imageSrc ? (
          <div className="aspect-[223/310] w-52 flex items-center justify-center rounded-t-md">
            <span className="text-white text-sm">Image failed to load</span>
          </div>
        ) : (
          <Image
            src={imageSrc}
            alt={`Card ${cardData?.name || id}`}
            className="rounded-t-md rounded-xl"
            width={223}
            height={310}
            onError={handleImageError}
          />
        )}
      </div>
    </div>
  );
}
