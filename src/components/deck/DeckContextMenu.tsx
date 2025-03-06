import React, { useRef, useEffect } from 'react';
import { ContextMenu } from './ContextMenu';

interface DeckContextMenuProps {
  x: number;
  y: number;
  deckId: string;
  onClose: () => void;
}

export const DeckContextMenu: React.FC<DeckContextMenuProps> = ({
  x,
  y,
  deckId,
  onClose,
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <ContextMenu
      x={x}
      y={y}
      deckId={deckId}
      onClose={onClose}
      ref={contextMenuRef}
    />
  );
};
