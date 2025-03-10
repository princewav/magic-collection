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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const importSchema = z.object({
  decklist: z.string().min(1, 'Decklist is required'),
});

type ImportFormValues = z.infer<typeof importSchema>;

interface ImportFormProps {
  deckId: string;
  onImport: (decklist: string) => Promise<{
    success: boolean;
    message?: string;
    errors?: string[];
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

  const onSubmit = async (data: ImportFormValues) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (!window.confirm('Are you sure? This action cannot be undone.')) return;

    setError(null);
    try {
      startTransition(async () => {
        const result = await onImport(data.decklist);
        if (result.success) {
          toast.success('Decklist imported successfully');
          if (result.errors?.length) {
            result.errors.forEach(error => {
              toast.error(error);
            });
          }
          router.push(`/decks/${deckId}`);
        } else {
          setError(result.message || 'Import failed');
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid deck list format';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form.getValues());
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
