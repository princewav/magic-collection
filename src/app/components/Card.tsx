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

  console.log(`Card ${id} rendered`);

  return (
    <div
      className="bg-gray-700 rounded-md shadow-md cursor-pointer flex items-center justify-center p-2"
      onClick={() => {
        console.log(`Card ${id} clicked`);
        openModal(id);
      }}
    >
      {imageError ? (
        <div className="aspect-[223/310] w-52 flex items-center justify-center rounded-t-md">
          <span className="text-white text-sm">Image failed to load</span>
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={`Card ${id}`}
          className="rounded-t-md"
          width={223}
          height={310}
          onError={handleImageError}
        />
      )}
    </div>
  );
}
