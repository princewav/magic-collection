'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, Loader2 } from 'lucide-react';
import { ManaColor } from '@/types/deck';
import { deckSchema } from '@/app/decks/new/validation';
import { COLOR_OPTIONS } from '@/lib/constants';
import { useState } from 'react';

interface DeckFormData {
  name: string;
  description?: string;
  format?: string | null;
  imageUrl?: string | null;
  colors: ManaColor[];
}

interface DeckFormProps {
  onSubmit: (data: DeckFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: DeckFormData;
  isEdit?: boolean;
}

export const DeckForm: React.FC<DeckFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isEdit = false,
}) => {
  const [selectedColors, setSelectedColors] = useState<ManaColor[]>(initialData?.colors || []);
  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      format: null,
      imageUrl: null,
      colors: [],
    },
  });

  const toggleColor = (color: ManaColor) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];

    setSelectedColors(newColors);
    form.setValue('colors', newColors as ManaColor[]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deck Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deck Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Deck" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your deck strategy..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="commander">Commander</SelectItem>
                      <SelectItem value="legacy">Legacy</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="pauper">Pauper</SelectItem>
                      <SelectItem value="pioneer">Pioneer</SelectItem>
                      <SelectItem value="brawl">Brawl</SelectItem>
                      <SelectItem value="historic">Historic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    URL for the deck cover image. Leave empty to use default.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="colors"
              render={() => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        type="button"
                        key={color.value}
                        onClick={() => toggleColor(color.value as ManaColor)}
                        className={`${color.bgClass} ${
                          color.textClass
                        } flex items-center gap-2 rounded-md border-2 px-4 py-2 ${
                          selectedColors.includes(color.value as ManaColor)
                            ? `${color.borderClass} border-2`
                            : 'border-transparent'
                        }`}
                      >
                        {selectedColors.includes(color.value as ManaColor) && (
                          <CheckIcon size={16} />
                        )}
                        {color.name}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  isEdit ? 'Update Deck' : 'Add Deck'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
