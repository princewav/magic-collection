'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ManaColor } from '@/types/deck';
import { ManaSymbol } from '../ManaSymbol';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { wishlistSchema } from '@/app/wishlists/new/validation';
import { COLOR_OPTIONS } from '@/lib/constants';
import { z } from 'zod';
import { Wishlist } from '@/types/wishlist';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type WishlistFormData = z.infer<typeof wishlistSchema>;

export interface WishlistFormProps {
  onSubmit: (values: WishlistFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Wishlist;
  submitLabel?: string;
}

export const WishlistForm: React.FC<WishlistFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  submitLabel = 'Create Wishlist',
}) => {
  const form = useForm<WishlistFormData>({
    resolver: zodResolver(wishlistSchema),
    defaultValues: {
      name: '',
      colors: [],
      imageUrl: '',
    },
  });

  const [selectedColors, setSelectedColors] = useState<ManaColor[]>([]);

  useEffect(() => {
    if (initialData) {
      const colors = Array.isArray(initialData.colors)
        ? (initialData.colors as ManaColor[])
        : [];

      form.reset({
        name: initialData.name,
        colors,
        imageUrl: initialData.imageUrl ?? '',
      });

      setSelectedColors(colors);
    }
  }, [initialData, form]);

  useEffect(() => {
    form.setValue('colors', selectedColors as ManaColor[]);
  }, [selectedColors, form]);

  const toggleColor = (color: ManaColor) => {
    setSelectedColors((prev) => {
      const isSelected = prev.includes(color);
      return isSelected ? prev.filter((c) => c !== color) : [...prev, color];
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wishlist Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter wishlist name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="mb-2 font-semibold">Wishlist Image</h3>
        {initialData?.cards && initialData.cards.length > 0 ? (
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger className="cursor-pointer" value="url">
                URL
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="card">
                Select from Wishlist
              </TabsTrigger>
            </TabsList>
            <TabsContent value="url">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field: { value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter image URL"
                        {...fieldProps}
                        value={value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      URL for the wishlist cover image. Leave empty to use
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
                        const selectedCard = initialData.cards.find(
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
                        {initialData.cards
                          .slice()
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              <div className="flex items-center gap-2">
                                <img
                                  src={card.image_uris?.art_crop}
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
                      Choose a card from your wishlist to use its image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field: { value, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Cover Image URL (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter image URL"
                    {...fieldProps}
                    value={value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="colors"
          render={() => (
            <FormItem>
              <FormLabel>Colors</FormLabel>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => toggleColor(color.value as ManaColor)}
                    className={`flex size-7 items-center justify-center rounded-full p-1 transition-all ${
                      selectedColors.includes(color.value as ManaColor)
                        ? 'bg-primary/20 ring-primary ring-2'
                        : 'hover:bg-muted'
                    }`}
                    title={color.name}
                  >
                    <span className="sr-only">{color.name}</span>
                    <ManaSymbol symbol={color.value} size={27} />
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  );
};
