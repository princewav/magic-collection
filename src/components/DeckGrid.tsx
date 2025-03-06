import React from "react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <Link
          href={`/decks/${deck.id}`}
          key={deck.id}
          className="bg-card hover:bg-card/90 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
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
                <span
                  key={index}
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

// Helper function to convert color names to hex codes
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    W: "#F9FAF4", // White
    U: "#0E68AB", // Blue
    B: "#150B00", // Black
    R: "#D3202A", // Red
    G: "#00733E", // Green
    // Add more mappings as needed
  };

  return colorMap[color] || "#CCCCCC"; // Default gray if color not found
}

export default DeckGrid;
