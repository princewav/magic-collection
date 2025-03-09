'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const importSchema = z.object({
  decklist: z.string().min(1, 'Decklist is required'),
});

type ImportFormValues = z.infer<typeof importSchema>;

interface ImportFormProps {
  deckId: string;
  onImport: (decklist: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
}

export const ImportForm: React.FC<ImportFormProps> = ({ deckId, onImport }) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      decklist: '',
    },
  });

  const onSubmit = (data: ImportFormValues) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await onImport(data.decklist);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="decklist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decklist</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste your decklist here..."
                  {...field}
                  className="min-h-[200px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Importing...' : 'Import Decklist'}
        </Button>
      </form>
    </Form>
  );
};
