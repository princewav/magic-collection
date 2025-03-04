"use client";

import Card from "./Card";
import { JSONCardRepository } from "../repositories/JSONCardRepository";
import { cardData } from "../../lib/cardService";
import { useEffect, useState } from "react";

export default function CardGrid() {
  const [cardIds, setCardIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      const repository = new JSONCardRepository(await cardData());
      const allCards = await repository.getAllCards();
      const firstTenCardIds = allCards.slice(0, 10).map((card) => card.id);
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
