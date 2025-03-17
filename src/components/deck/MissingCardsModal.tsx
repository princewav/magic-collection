import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Download as DownloadIcon } from 'lucide-react';
import { downloadMissingCards, getMissingCardsText } from '@/actions/deck/missing-cards';
import { getMissingCards } from '@/actions/deck/missing-cards';
import { CardWithQuantity } from '@/types/card';

interface MissingCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
  cards: CardWithQuantity[];
}

export function MissingCardsModal({ isOpen, onClose, deckId, cards }: MissingCardsModalProps) {
  if (!isOpen) return null;

  console.log(cards);

  const handleCopy = async () => {
    try {
      const text = await getMissingCardsText(deckId);
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy missing cards:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const { content, filename } = await downloadMissingCards(deckId);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download missing cards:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Missing Cards</DialogTitle>
        </DialogHeader>
        <div className='space-y-2 max-h-96 overflow-y-auto'>
          {cards.map((card, index) => (
            <div key={index} className='flex items-center gap-2'>
              <img src={card.image_uris.art_crop} alt={card.name} className='w-10 h-10 object-cover' />
              <span>{card.quantity}x {card.name}</span>
            </div>
          ))}
        </div>
        <div className='flex gap-2 mt-4 justify-around'>
          <Button onClick={handleCopy} className='flex-1'>
            <Copy className='mr-2 h-4 w-4' />
            Copy
          </Button>
          <Button onClick={handleDownload} className='flex-1'>
            <DownloadIcon className='mr-2 h-4 w-4' />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
