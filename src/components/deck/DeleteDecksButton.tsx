// src/components/deck/DeleteDecksButton.tsx
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useDeckSelection } from '@/context/DeckSelectionContext';
import { deleteDecks } from '@/actions/deck/delete-decks';

interface DeleteDecksButtonProps {
  deckCount: number;
}

async function deleteDecksAction(deckIds: string[]) {
  try {
    const result = await deleteDecks(deckIds);
    if (result?.error) {
      console.error('Failed to delete decks:', result.error);
      alert(result.error);
      return false;
    } else {
      alert('Decks deleted successfully!');
      return true;
    }
  } catch (error) {
    console.error('Error deleting decks:', error);
    alert('Failed to delete decks.');
    return false;
  }
}

export const DeleteDecksButton: React.FC<DeleteDecksButtonProps> = ({
  deckCount,
}) => {
  const { selectedDecks, clearDeckSelection } = useDeckSelection();

  const handleDeleteSelectedDecks = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete the selected decks?',
    );
    if (confirmed) {
      const success = await deleteDecksAction(selectedDecks);
      if (success) {
        clearDeckSelection();
      }
    }
  }, [selectedDecks]);
  return (
    <Button variant="destructive" onClick={handleDeleteSelectedDecks}>
      <Trash className="h-4 w-4" /> Delete Selected ({deckCount})
    </Button>
  );
};
