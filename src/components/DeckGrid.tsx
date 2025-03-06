import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ManaSymbol } from "./ManaSymbol";

type DeckGridProps = {
  decks: {
    id: string;
    name: string;
    imageUrl: string | null;
    colors: string[];
  }[];
};

export const DeckGrid = ({ decks }: DeckGridProps) => {
  return (
    <div className="flex flex-wrap gap-6">
      {decks.map((deck) => (
        <Link
          href={`/decks/${deck.id}`}
          key={deck.id}
          className="bg-card hover:bg-card/90 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg border border-muted w-70 hover:scale-105"
        >
          <div className="h-48 relative">
            {deck.imageUrl ? (
              <Image
                src={deck.imageUrl}
                alt={deck.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="bg-muted h-full w-full flex items-center justify-center">
                <span className="text-muted-foreground">
                  No image available
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">{deck.name}</h3>
            <div className="flex gap-2 mt-2">
              {deck.colors.map((color, index) => (
                <ManaSymbol key={index} symbol={color} />
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

// Helper function to convert color names to hex codes

export default DeckGrid;
