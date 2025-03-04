"use client";

import Image from "next/image";
import { useCardModal } from "../contexts/CardModalContext";
import { useState } from "react";

interface CardProps {
  id: string;
}

export default function Card({ id }: CardProps) {
  const { openModal } = useCardModal();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageSrc = `https://api.scryfall.com/cards/${id}/?format=image`;

  return (
    <div
      className="bg-gray-700 rounded-md shadow-md cursor-pointer flex flex-col items-center transition-transform transform hover:scale-105"
      onClick={() => {
        console.log(`Card ${id} clicked`);
        openModal(id);
      }}
    >
      <div className="relative w-full flex flex-col justify-center p-2">
        <div className="flex justify-center w-full mb-2">
          <div className="flex space-x-3">
            <div className="w-2 h-2 transform rotate-45 bg-yellow-500"></div>
            <div className="w-2 h-2 transform rotate-45 bg-yellow-500"></div>
            <div className="w-2 h-2 transform rotate-45 bg-yellow-500"></div>
            <div className="w-2 h-2 transform rotate-45 bg-yellow-500"></div>
          </div>
        </div>
        {imageError ? (
          <div className="aspect-[223/310] w-52 flex items-center justify-center rounded-t-md">
            <span className="text-white text-sm">Image failed to load</span>
          </div>
        ) : (
          <Image
            src={imageSrc}
            alt={`Card ${id}`}
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
