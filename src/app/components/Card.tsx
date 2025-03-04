"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

interface CardProps {
  id: string;
}

export default function Card({ id }: CardProps) {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    const fetchCardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.scryfall.com/cards/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Card not found.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCardData(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [id]);

  if (loading) {
    return <div className="bg-gray-700 rounded-md shadow-md p-4">Loading...</div>;
  }

  if (error) {
    return <div className="bg-gray-700 rounded-md shadow-md p-4">Error: {error}</div>;
  }

  if (!cardData) {
    return <div className="bg-gray-700 rounded-md shadow-md p-4">Card not found.</div>;
  }

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-gray-700 rounded-md shadow-md">
      {imageError ? (
        <div className="aspect-[223/310] bg-gray-800 flex items-center justify-center rounded-t-md">
          <span className="text-white text-sm">Image failed to load</span>
        </div>
      ) : (
        <Image
          src={cardData.image_uris?.normal || "https://via.placeholder.com/223x310"}
          alt={cardData.name}
          className="rounded-t-md"
          width={223}
          height={310}
          onError={handleImageError}
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold text-white">{cardData.name}</h2>
        <p className="text-gray-400">{cardData.mana_cost}</p>
        <p className="text-gray-300">{cardData.type_line}</p>
        <p className="text-gray-300">{cardData.oracle_text}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-white">{cardData.power}/{cardData.toughness}</p>
        </div>
      </div>
    </div>
  );
}
