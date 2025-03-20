'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ManaColor } from '@/types/deck';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { wishlistSchema } from '@/app/wishlists/new/validation';
import { COLOR_OPTIONS } from '@/lib/constants';
import { z } from 'zod';
import { Wishlist } from '@/types/wishlist';
import { CheckIcon, Loader2 } from 'lucide-react';

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

        <FormField
          control={form.control}
          name="colors"
          render={() => (
            <FormItem>
              <FormLabel>Colors</FormLabel>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    variant={
                      selectedColors.includes(color.value as ManaColor)
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => toggleColor(color.value as ManaColor)}
                    className="p-2"
                  >
                    {selectedColors.includes(color.value as ManaColor) && (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">{color.name}</span>
                    <span
                      className={`mana-symbol ms ms-${color.value.toLowerCase()}`}
                    />
                  </Button>
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
