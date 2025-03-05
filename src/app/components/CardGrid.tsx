import Card from "./Card";
import { loadInitialCardIds } from "@/app/actions/load-card-ids";

export default async function CardGrid() {
  const cardIds = await loadInitialCardIds();

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {cardIds.map((id) => (
          <Card key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
