"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Deck name must be at least 3 characters long",
  }),
  description: z.string().optional().nullable(),
  format: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  colors: z.array(z.enum(["W", "U", "R", "B", "G", "C"])).default([]),
});

interface NewDeckPageProps {}

export default function NewDeckPage({}: NewDeckPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log("Submitting:", values);
    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Data:", errorData);
        throw new Error(errorData.message || "Failed to create deck");
      }

      toast.success("Deck Created", {
        description: "Your new deck has been created successfully.",
      });
      router.push("/decks");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating deck:", error);
      toast.error("Error", {
        description:
          error.message || "Failed to create deck. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const colorOptions = [
    {
      name: "White",
      value: "W",
      bgClass: "bg-amber-100",
      textClass: "text-amber-800",
      borderClass: "border-amber-300",
    },
    {
      name: "Blue",
      value: "U",
      bgClass: "bg-blue-100",
      textClass: "text-blue-800",
      borderClass: "border-blue-300",
    },
    {
      name: "Black",
      value: "B",
      bgClass: "bg-gray-800",
      textClass: "text-gray-100",
      borderClass: "border-gray-900",
    },
    {
      name: "Red",
      value: "R",
      bgClass: "bg-red-100",
      textClass: "text-red-800",
      borderClass: "border-red-300",
    },
    {
      name: "Green",
      value: "G",
      bgClass: "bg-green-100",
      textClass: "text-green-800",
      borderClass: "border-green-300",
    },
    {
      name: "Colorless",
      value: "C",
      bgClass: "bg-gray-100",
      textClass: "text-gray-800",
      borderClass: "border-gray-300",
    },
  ];

  return (
    <main className="flex flex-col p-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Create New Deck</h1>

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
                      {colorOptions.map((color) => (
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
    </main>
  );
}
