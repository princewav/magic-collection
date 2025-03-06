// src/app/decks/new/page.tsx
"use client";

import { DeckForm } from "@/components/deck/DeckForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deckSchema } from "./validation";
import { z } from "zod";

interface NewDeckPageProps {}

export default function NewDeckPage({}: NewDeckPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting]= useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const handleDeckCreation = async (values: z.infer<typeof deckSchema>) => {
    setIsSubmitting(true);
    try {
      await createDeck(values);
      handleSuccess();
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createDeck = async (values: z.infer<typeof deckSchema>) => {
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
  };

  const handleSuccess = () => {
    toast.success("Deck Created", {
      description: "Your new deck has been created successfully.",
    });
    router.push("/decks");
    router.refresh();
  };

  const handleError = (error: any) => {
    console.error("Error creating deck:", error);
    toast.error("Error", {
      description: error.message || "Failed to create deck. Please try again.",
    });
  };

  return (
    <main className="flex flex-col p-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Create New Deck</h1>
      <DeckForm
        onSubmit={handleDeckCreation}
        isSubmitting={isSubmitting}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
      />
      <div className="flex gap-4 justify-end mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </main>
  );
}
