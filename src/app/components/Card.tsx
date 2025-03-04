"use client";

import Image from "next/image";
import { useCardModal } from "./contexts/CardModalContext";
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

  return (
    <div className="bg-gray-700 rounded-md shadow-md cursor-pointer" onClick={() => openModal(id)}>
        {imageError ? (
            <div className="aspect-[223/310] bg-gray-800 flex items-center justify-center rounded-t-md">
              <span className="text-white text-sm">Image failed to load</span>
            </div>
        ) : (
            <Image
                src={`https://cards.scryfall.io/normal/front/${id.substring(0, 1)}/${id.substring(0, 2)}/${id}.jpg?1562623085`}
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
