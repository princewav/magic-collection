// src/app/decks/new/page.tsx
'use client';

import { DeckForm } from '@/components/form/DeckForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deckSchema } from './validation';
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
      toast.success('Deck Created', {
        description: 'Your new deck has been created successfully.',
      });
      router.push(`/decks/${values.type}`);
      router.refresh();
    } catch (error: any) {
      console.error('Error creating deck:', error);
      toast.error('Error', {
        description:
          error.message || 'Failed to create deck. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col p-4">
      <h1 className="mb-6 text-xl font-bold">Create New Deck</h1>
      <DeckForm onSubmit={handleDeckCreation} isSubmitting={isSubmitting} />
    </main>
  );
}
