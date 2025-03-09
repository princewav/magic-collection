'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deckSchema } from '@/app/decks/new/validation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { DeckForm } from '@/components/deck/DeckForm';
import { Deck } from '@/types/deck';
import { updateDeck } from '@/actions/deck/update-deck';

interface EditDeckClientProps {
  deck: Deck;
  id: string;
}

export function EditDeckClient({ deck, id }: EditDeckClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeckUpdate = async (values: z.infer<typeof deckSchema>) => {
    setIsSubmitting(true);
    try {
      await updateDeck(id, values);
      handleSuccess();
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Deck Updated', {
      description: 'Your deck has been updated successfully.',
    });
    router.push(`/decks/${id}`);
    router.refresh();
  };

  const handleError = (error: any) => {
    toast.error('Error', {
      description: error.message || 'Failed to update deck. Please try again.',
    });
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col p-4">
      <h1 className="mb-6 text-4xl font-bold">Edit Deck</h1>
      <DeckForm
        onSubmit={handleDeckUpdate}
        isSubmitting={isSubmitting}
        initialData={deck}
      />
      <div className="mt-4 flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </main>
  );
}
