import React from "react";

import { ManaSymbol } from "./ManaSymbol";

interface DeckProps {
  id: string;
  name: string;
  imageUrl: string;
  colors: string[];
}

export const Deck: React.FC<DeckProps> = ({ id, name, imageUrl, colors }) => (
  <div
    key={id}
    className="border rounded-md p-4 w-50 hover:scale-105 cursor-pointer hover:shadow-md transition-transform transform "
  >
    <img
      src={imageUrl}
      alt={name}
      className="w-full h-48 object-cover rounded-md mb-2"
    />
    <h3 className="text-lg font-semibold text-center">{name}</h3>
    <div className="flex space-x-1 absolute top-0 right-0 bg-background p-2 rounded-full">
      {colors.map((color) => (
        <ManaSymbol key={color} symbol={color} />
      ))}
    </div>
  </div>
);
