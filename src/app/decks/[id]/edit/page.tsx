'use client';

import { DeckForm } from '@/components/deck/DeckForm';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deckSchema } from '@/app/decks/new/validation';
import { z } from 'zod';
import { loadDeckById } from '@/actions/deck/load-decks';

interface EditDeckPageProps {
  params: { id: string };
}

export default async function EditDeckPage({ params: { id } }: EditDeckPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const deck = await loadDeckById(id);

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

  const updateDeck = async (id: string, values: z.infer<typeof deckSchema>) => {
    const response = await fetch(`/api/decks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update deck');
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
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
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
