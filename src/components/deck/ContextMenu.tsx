import React, { forwardRef } from 'react';
import { CSSProperties } from 'react';
import { Edit, Copy, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteDecks } from '@/actions/delete-decks';

interface ContextMenuProps {
  x: number;
  y: number;
  deckId: string;
  onClose: () => void;
}

export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ x, y, deckId, onClose }, ref) => {
    const router = useRouter();

    const style: CSSProperties = {
      // Specify CSSProperties type
      position: 'fixed',
      top: y,
      left: x,
      zIndex: 10,
    };

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

    const handleDuplicate = () => {
      alert(`Duplicate deck ${deckId}`);
      onClose();
    };

    return (
      <div
        ref={ref}
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
  },
);
