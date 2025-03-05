import Card from "./Card";
import { loadInitialCardIds } from "@/app/actions/load-card-ids";
import { populateDatabase } from "@/app/actions/populate-db";

export default async function CardGrid() {
  const cardIds = await loadInitialCardIds();

  const handlePopulateDatabase = async () => {
    "use server"; // Mark this function as a server action
    await populateDatabase();
  };

  return (
    <div>
      <button onClick={handlePopulateDatabase}>Populate Database</button>
      <div className="flex flex-wrap gap-4">
        {cardIds.map((id) => (
          <Card key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
