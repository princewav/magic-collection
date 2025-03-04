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
  
// make the image centered with padding ai!
  return (
    <div className="bg-gray-700 rounded-md shadow-md cursor-pointer" onClick={() => openModal(id)}>
      {imageError ? (
        <div className="aspect-[223/310] bg-gray-800 flex items-center justify-center rounded-t-md">
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
