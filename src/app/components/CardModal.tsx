"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useCardModal } from "../contexts/CardModalContext";
import { X } from "lucide-react";

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
      console.log("CardModal useEffect - cardId or isOpen is false, returning");
      return;
    }

    const fetchCardData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching card data for ${cardId}`);
        const response = await fetch(
          `https://api.scryfall.com/cards/${cardId}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Card not found.");
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
        console.log("Clicked outside the modal, closing it");
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) {
    console.log("CardModal is not open, returning null");
    return null;
  }

  if (loading) {
    console.log("CardModal is loading");
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-700 rounded-md shadow-md p-4">Loading...</div>
      </div>
    );
  }

  if (error) {
    console.log("CardModal has an error");
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-700 rounded-md shadow-md p-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!cardData) {
    console.log("CardModal - card data not found");
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-700 rounded-md shadow-md p-4">
          Card not found.
        </div>
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div
        className="bg-gray-800 rounded-md shadow-md max-w-md w-full p-4"
        ref={modalRef}
      >
        <div className="p-4" id="modal-box">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 rounded-full h-6 w-6 flex items-center justify-center bg-gray-700"
          >
            <X size={16} />
          </button>
          <h2 className="text-xl font-bold text-white">{cardData.name}</h2>
          <p className="text-gray-400">{cardData.mana_cost}</p>
          <p className="text-gray-300">{cardData.type_line}</p>
          <p className="text-gray-300">{cardData.oracle_text}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-white">
              {cardData.power}/{cardData.toughness}
            </p>
          </div>
        </div>
        {imageError ? (
          <div className="aspect-[223/310] bg-gray-800 flex items-center justify-center rounded-t-md">
            <span className="text-white text-sm">Image failed to load</span>
          </div>
        ) : (
          <Image
            src={
              cardData.image_uris?.normal ||
              "https://via.placeholder.com/223x310"
            }
            alt={cardData.name}
            className="rounded-t-md"
            width={223}
            height={310}
            onError={handleImageError}
          />
        )}
      </div>
    </div>
  );
}
