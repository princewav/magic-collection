"use client";

import Card from "./Card";
import { JSONCardRepository } from "../repositories/JSONCardRepository";
import { useEffect, useState } from "react";
import { Card as CardType } from "@/app/models/Card";

export default function CardGrid() {
  const [cardIds, setCardIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      const repository = new JSONCardRepository();
      const allCards = await repository.getAllCards();
      const firstTenCardIds = allCards.slice(0, 10).map((card: CardType) => card.id);
      setCardIds(firstTenCardIds);
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
