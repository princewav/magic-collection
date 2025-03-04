"use client";

import { useEffect, useState } from "react";

interface CardProps {
  id: string;
}

export default function Card({ id }: CardProps) {
  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.scryfall.com/cards/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCardData(data);
      } catch (e: any) {
        setError(e.message);
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
    return <div className="bg-gray-700 rounded-md shadow-md p-4">No card data found.</div>;
  }

  return (
    <div className="bg-gray-700 rounded-md shadow-md">
      <img src={cardData.image_uris?.normal || "https://via.placeholder.com/223x310"} alt={cardData.name} className="rounded-t-md" />
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
