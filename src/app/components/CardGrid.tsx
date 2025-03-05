"use client";

import Card from "./Card";
import { useEffect, useState } from "react";
import { loadInitialCardIds } from "@/app/actions/load-card-ids";

export default function CardGrid() {
  const [cardIds, setCardIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      const initialCardIds = await loadInitialCardIds();
      setCardIds(initialCardIds);
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
