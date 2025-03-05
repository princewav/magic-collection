import React from 'react';

import { ManaSymbol } from './ManaSymbol';

interface DeckProps {
  id: string;
  name: string;
  imageUrl: string;
  colors: string[];
}

export const Deck: React.FC<DeckProps> = ({
  id, name, imageUrl, colors,
}) => (
  <div key={id} className="border rounded-md p-4 w-50">
    <img
      src={imageUrl}
      alt={name}
      className="w-full h-48 object-cover rounded-md mb-2"
    />
    <div className="flex justify-between space-x-2 mb-2">
      <h3 className="text-lg font-semibold text-center">{name}</h3>
      <div className="flex space-x-1">
        {colors.map((color) => (
          <ManaSymbol key={color} symbol={color} />
        ))}
      </div>
    </div>
  </div>
);
