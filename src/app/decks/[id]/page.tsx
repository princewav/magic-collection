'use client';

import { DeckForm } from '@/components/deck/DeckForm';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deckSchema } from '@/app/decks/new/validation';
import { z } from 'zod';
import { createDeck } from '@/actions/deck/create-deck';

interface NewDeckPageProps {}

export default function NewDeckPage({}: NewDeckPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeckCreation = async (values: z.infer<typeof deckSchema>) => {
    setIsSubmitting(true);
    try {
      await createDeck(values);
      handleSuccess();
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Deck Created', {
      description: 'Your new deck has been created successfully.',
    });
    router.push('/decks');
    router.refresh();
  };

  const handleError = (error: any) => {
    console.error('Error creating deck:', error);
    toast.error('Error', {
      description: error.message || 'Failed to create deck. Please try again.',
    });
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col p-4">
      <h1 className="mb-6 text-4xl font-bold">Create New Deck</h1>
      <DeckForm onSubmit={handleDeckCreation} isSubmitting={isSubmitting} />
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
