// src/components/deck/DeckForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ManaColor } from "@/types/deck";
import { deckSchema } from "@/app/decks/new/validation";
import { z } from "zod";
import { COLOR_OPTIONS } from "@/lib/constants";

interface DeckFormProps {
  onSubmit: (values: z.infer<typeof deckSchema>) => Promise<void>;
  isSubmitting: boolean;
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedColors: string[];
}

export const DeckForm: React.FC<DeckFormProps> = ({
  onSubmit,
  isSubmitting,
  setSelectedColors,
  selectedColors,
}) => {
  const form = useForm<z.infer<typeof deckSchema>>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: "",
      description: null,
      format: null,
      imageUrl: null,
      colors: [],
    },
  });

  const toggleColor = (color: ManaColor) => {
    setSelectedColors((prevColors) => {
      if (prevColors.includes(color)) {
        const newColors = prevColors.filter((c) => c !== color);
        form.setValue("colors", newColors as ManaColor[]);
        return newColors;
      } else {
        const newColors = [...prevColors, color];
        form.setValue("colors", newColors as ManaColor[]);
        return newColors;
      }
    });
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
                      value={field.value || ""}
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
                    defaultValue={field.value || ""}
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
                      value={field.value || ""}
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
                        } px-4 py-2 rounded-md border-2 flex items-center gap-2 ${
                          selectedColors.includes(color.value)
                            ? `${color.borderClass} border-2`
                            : "border-transparent"
                        }`}
                      >
                        {selectedColors.includes(color.value) && (
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

            <div className="flex gap-4 justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Deck"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
