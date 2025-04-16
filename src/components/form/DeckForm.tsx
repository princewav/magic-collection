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
import { useRouter } from 'next/navigation';

interface DeckFormData {
  name: string;
  decklist: string;
  description?: string;
  format: string;
  imageUrl?: string | null;
  type: 'paper' | 'arena';
}

interface DeckFormProps {
  onSubmit: (data: DeckFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: DeckFormData;
  isEdit?: boolean;
  mainDeck?: CardWithQuantity[];
  decklist?: string;
}

export const DeckForm: React.FC<DeckFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isEdit = false,
  mainDeck,
  decklist,
}) => {
  const router = useRouter();
  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: '',
      description: '',
      format: 'standard',
      imageUrl: null,
      type: 'paper',
      decklist: decklist || '',
      ...initialData,
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <CardTitle>Deck Details</CardTitle>
          </div>
          <div className="col-span-1">
            <CardTitle>Deck List</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
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

                {mainDeck ? (
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger className="cursor-pointer" value="url">
                        URL
                      </TabsTrigger>
                      <TabsTrigger className="cursor-pointer" value="card">
                        Select from Deck
                      </TabsTrigger>
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
                                          className="h-6 w-6 rounded-sm object-cover"
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
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-4">
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
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="decklist"
                  render={({ field }) => (
                    <FormItem className="mt-4 h-11/12">
                      <FormLabel>Deck List</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your decklist here..."
                          {...field}
                          className="h-full w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
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
