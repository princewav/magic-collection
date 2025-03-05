"use client";

import Card from "./Card";
import { JSONCardRepository } from "../repositories/JSONCardRepository";
import { useEffect, useState } from "react";
import { Card as CardType } from "@/app/models/Card";
import { INITIAL_CARD_LOAD_COUNT } from "@/constants";

export default function CardGrid() {
  const [cardIds, setCardIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      const repository = new JSONCardRepository();
      const allCards = await repository.getAllCards();
      const firstCardIds = allCards
        .slice(0, INITIAL_CARD_LOAD_COUNT)
        .map((card: CardType) => card.id);
      setCardIds(firstCardIds);
    };

    loadCards();
  }, []);

  return (
    <div className="flex flex-wrap gap-4">
      {cardIds.map((id) => (
        <Card key={id} id={id} />
      ))}
    </div>
  );
}
