'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { importDeckList } from '@/actions/deck/import-list';
import { toast } from 'sonner';

interface ImportFormProps {
  deckId: string;
}

export function ImportForm({ deckId }: ImportFormProps) {
  const [decklist, setDecklist] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await importDeckList(deckId, decklist);
        if (result.success) {
          toast.success('Decklist imported successfully');
          router.push(`/decks/${deckId}`);
        } else {
          setError(result.message || 'Import failed');
        }
      } catch (error) {
        setError('An unexpected error occurred');
      }
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
      {error && <p className="text-red-500">{error}</p>}
      <Textarea
        className="min-h-[300px] mb-4"
        placeholder="Paste your decklist here..."
        value={decklist}
        onChange={(e) => setDecklist(e.target.value)}
        disabled={isPending}
      />
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isPending || !decklist.trim()}
      >
        {isPending ? 'Importing...' : 'Import'}
      </Button>
    </form>
  );
}
