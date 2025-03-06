// src/components/deck/DeckGrid.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ContextMenu } from './ContextMenu';
import { Deck } from '@/components/deck/Deck';
import { useDeckSelection } from '@/context/DeckSelectionContext';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useCallback } from 'react';
import { Deck as DeckType } from '@/types/deck';
import { deleteDecks } from '@/actions/delete-decks';

type DeckGridProps = {
  decks: DeckType[];
};

export const DeckGrid = ({ decks }: DeckGridProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    deckId: string;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const { selectedDecks, clearDeckSelection } = useDeckSelection();

  const handleContextMenu = (
    e: React.MouseEvent<Element, MouseEvent>,
    deckId: string,
  ) => {
    e.preventDefault(); // Prevent the default context menu
    setContextMenu({ x: e.clientX, y: e.clientY, deckId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Use useEffect to handle clicks outside the context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenu &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  const handleDeleteDecks = useCallback(
    async (deckIds: string[]) => {
      // TODO: Implement the actual API call to delete decks
      console.log('Deleting decks with IDs:', deckIds);
      try {
        const result = await deleteDecks(deckIds);
        if (result?.error) {
          // Handle error (e.g., display an error message)
          console.error('Failed to delete card:', result.error);
          alert(result.error);
          return;
        } else {
        }
        clearDeckSelection(); // Clear selected decks on successful deletion
        alert('Decks deleted successfully!');
      } catch (error) {
        // Handle error (e.g., display an error message)
        console.error('Error deleting decks:', error);
        alert('Failed to delete decks.');
      }
    },
    [clearDeckSelection],
  );

  const handleDeleteSelectedDecks = () => {
    if (window.confirm('Are you sure you want to delete the selected decks?')) {
      handleDeleteDecks(selectedDecks);
    }
  };

  return (
    <div className="relative flex flex-wrap gap-6">
      {selectedDecks.length > 0 && (
        <Button
          variant="destructive"
          onClick={handleDeleteSelectedDecks}
          className="absolute -top-25 right-0"
        >
          <Trash className="mr-2 h-4 w-4" /> Delete Selected (
          {selectedDecks.length})
        </Button>
      )}
      {decks.map((deck) => (
        <Deck key={deck.id} deck={deck} onContextMenu={handleContextMenu} />
      ))}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          deckId={contextMenu.deckId}
          onClose={closeContextMenu}
          ref={contextMenuRef}
        />
      )}
    </div>
  );
};
export default DeckGrid; // Exporting as default instead of named
