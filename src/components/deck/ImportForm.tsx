'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import logger from '@/lib/logger';
import { Import } from 'lucide-react';
import { useParams } from 'next/navigation';

const importSchema = z.object({
  decklist: z.string().trim().min(1, 'Decklist is required'),
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
  const { type } = useParams();
  

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
        logger.warn('Importing decklist:', data.decklist);
        const result = await onImport(data.decklist);
        logger.info('Import result:', result);
        if (result.errors?.length) {
          result.errors.forEach((error) => {
            toast.error(error);
          });
        }
        if (result.success) {
          toast.success('Decklist imported successfully');
          router.push(`/decks/${type}/${deckId}`);
        } else {
          setError(result.errors?.[0] || 'Import failed');
        }
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid deck list format';
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
      <form onSubmit={handleSubmit}>
        <div className="flex flex-row items-center justify-between mb-4 mt-8">
          <h2 className="m-0 text-2xl font-semibold">Import Decklist</h2>
          <div>
            <Button type="submit" disabled={isPending} className="w-40">
              {isPending ? (
                'Importing...'
              ) : (
                <span className="flex items-center gap-1">
                  <Import />
                  Submit
                </span>
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <FormField
            control={form.control}
            name="decklist"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Paste your decklist here..."
                    {...field}
                    className="min-h-[180px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}
        </div>
      </form>
    </Form>
  );
};
