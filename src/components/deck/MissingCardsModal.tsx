'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Download as DownloadIcon, Heart } from 'lucide-react';
import {
  downloadMissingCards,
  getMissingCardsText,
} from '@/actions/deck/missing-cards';
import { CardWithQuantity } from '@/types/card';
import { useMissingCardsModal } from '@/context/MissingCardsModalContext';
import { useEffect, useState } from 'react';
import { getMissingCards } from '@/actions/deck/missing-cards';
import { createWishlistFromMissingCards } from '@/actions/wishlist/create-wishlist-from-missing-cards';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function MissingCardsModal() {
  const { isOpen, closeModal, deckId } = useMissingCardsModal();
  const [cards, setCards] = useState<CardWithQuantity[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && deckId) {
      setLoading(true);
      getMissingCards(deckId)
        .then((missingCards) => {
          const sortedCards = [...missingCards].sort((a, b) => {
            const priceA = a.prices.eur ? parseFloat(a.prices.eur) : 0;
            const priceB = b.prices.eur ? parseFloat(b.prices.eur) : 0;
            const totalA = priceA * a.quantity;
            const totalB = priceB * b.quantity;
            return totalB - totalA; // Sort descending
          });
          setCards(sortedCards);
        })
        .catch((error) => {
          console.error('Failed to load missing cards:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, deckId]);

  const totalMissing = cards.reduce((sum, card) => sum + card.quantity, 0);
  const totalPrice = cards.reduce((sum, card) => {
    const price = card.prices.eur ? parseFloat(card.prices.eur) : 0;
    return sum + price * card.quantity;
  }, 0);

  const handleCopy = async () => {
    if (!deckId) return;

    try {
      const text = await getMissingCardsText(deckId);
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy missing cards:', error);
    }
  };

  const handleDownload = async () => {
    if (!deckId) return;

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

  const handleCreateWishlist = async () => {
    if (!deckId) return;

    try {
      setLoading(true);
      await createWishlistFromMissingCards(deckId);
      toast.success('Wishlist created successfully');
      router.push('/wishlists');
      router.refresh();
      closeModal();
    } catch (error) {
      console.error('Failed to create wishlist:', error);
      toast.error('Failed to create wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-h-[500px] max-w-lg">
        <DialogHeader>
          <DialogTitle>Missing Cards ({totalMissing})</DialogTitle>
          <DialogDescription className="flex justify-between gap-2">
            <span className="text-muted-foreground text-sm">
              Total price: €{totalPrice.toFixed(2)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] space-y-3 overflow-y-auto">
          {loading ? (
            <p>Caricamento in corso...</p>
          ) : (
            cards.map((card, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 px-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={card.image_uris.art_crop}
                    alt={card.name}
                    className="h-10 w-10 object-cover"
                  />
                  <span>
                    {card.quantity}x {card.name}
                  </span>
                </div>
                {card.prices.eur && (
                  <div className="flex flex-col gap-2 text-right">
                    <span className="">€{card.prices.eur}</span>
                    {
                      <span className="text-muted-foreground text-xs leading-1">
                        Total: €
                        {(parseFloat(card.prices.eur) * card.quantity).toFixed(
                          2,
                        )}
                      </span>
                    }
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-around gap-2">
          <Button onClick={handleCopy} className="flex-1" disabled={loading}>
            <Copy className="h-4 w-4" />
            Copia
          </Button>
          <Button
            onClick={handleDownload}
            className="flex-1"
            disabled={loading}
          >
            <DownloadIcon className="h-4 w-4" />
            Scarica
          </Button>
          <Button
            onClick={handleCreateWishlist}
            className="flex-2"
            disabled={loading}
          >
            <Heart className="h-4 w-4" />
            Create Wishlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
