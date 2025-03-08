import React, { useRef, useEffect } from 'react';
import { CSSProperties } from 'react';
import { Edit, Copy, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteDecks } from '@/actions/deck/delete-decks';
import { duplicateDecks } from '@/actions/deck/duplicate-decks';

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
  const router = useRouter();

  const style: CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 10,
  };

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

  const handleEdit = () => {
    alert(`Edit deck ${deckId}`);
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this deck?');
    if (confirmed) {
      await deleteDecks([deckId]);
      router.refresh();
      onClose();
    }
  };

  const handleDuplicate = async () => {
    const confirmed = confirm('Are you sure you want to duplicate this deck?');
    if (confirmed) {
      await duplicateDecks([deckId]);
      router.refresh();
      onClose();
    }
  };

  return (
    <div
      ref={contextMenuRef}
      style={style}
      className="bg-card border-muted w-48 rounded-md border shadow-lg"
    >
      <ul className="py-2">
        <li
          className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 px-4 py-2 transition-colors"
          onClick={handleEdit}
        >
          <Edit size={16} />
          Edit
        </li>
        <li
          className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 px-4 py-2 transition-colors"
          onClick={handleDuplicate}
        >
          <Copy size={16} />
          Duplicate
        </li>
        <li
          className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 px-4 py-2 transition-colors"
          onClick={handleDelete}
        >
          <Trash size={16} />
          Delete
        </li>
      </ul>
    </div>
  );
};
