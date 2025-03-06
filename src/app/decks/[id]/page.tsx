import { notFound } from "next/navigation";

import { Filters } from "@/components/Filters";
import { CardGrid } from "@/components/CardGrid";
import { DeckInfo } from "@/components/DeckInfo";
import { getDeckById } from "@/app/actions/load-decks";

interface Props {
  params: {
    id: string;
  };
}

export default async function DeckDetailPage({ params }: Props) {
  const { id } = params;
  const deck = await getDeckById(id);

  if (!deck) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <DeckInfo deck={deck} />
      <Filters />
      <CardGrid />
    </div>
  );
}
