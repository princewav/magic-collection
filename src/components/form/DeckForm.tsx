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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, Loader2 } from 'lucide-react';
import { ManaColor } from '@/types/deck';
import { deckSchema } from '@/app/decks/new/validation';
import { COLOR_OPTIONS } from '@/lib/constants';
import { useState } from 'react';
import { CardWithQuantity } from '@/types/card';

interface DeckFormData {
  name: string;
  description?: string;
  format: string;
  imageUrl?: string | null;
  colors: ManaColor[];
  type: 'paper' | 'arena';
}

interface DeckFormProps {
  onSubmit: (data: DeckFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: DeckFormData;
  isEdit?: boolean;
  mainDeck?: CardWithQuantity[];
}

export const DeckForm: React.FC<DeckFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isEdit = false,
  mainDeck,
}) => {
  const [selectedColors, setSelectedColors] = useState<ManaColor[]>(
    initialData?.colors || [],
  );
  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      format: 'standard',
      imageUrl: null,
      colors: [],
      type: 'paper',
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

            <Separator className="my-6" />

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

            <Separator className="my-6" />

            <div className="flex items-center gap-20">
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a deck type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paper">Paper</SelectItem>
                        <SelectItem value="arena">Arena</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />

            <Tabs defaultValue="url" className="w-full">
              <TabsList>
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="card">Select from Deck</TabsTrigger>
              </TabsList>
              <TabsContent value="url">
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
                        URL for the deck cover image. Leave empty to use
                        default.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="card">
                {mainDeck ? (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Card</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const selectedCard = mainDeck.find(
                              (card) => card.id === value,
                            );
                            field.onChange(
                              selectedCard?.image_uris?.art_crop || '',
                            );
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a card" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mainDeck
                              .slice()
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((card) => (
                                <SelectItem key={card.id} value={card.id}>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={card.image_uris.art_crop}
                                      alt={card.name}
                                      className="h-6 w-6 object-cover"
                                    />
                                    <span>{card.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose a card from your main deck to use its image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No main deck available for selection
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

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

            <Separator className="my-6" />

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : isEdit ? (
                  'Update Deck'
                ) : (
                  'Add Deck'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
