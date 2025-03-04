import Card from "./Card";

export default function CardGrid() {
  const cardIds = [
    "c6399a22-cebf-4c1d-a23e-4c68f784ac1b", // Sol Ring
    "77c6fa74-5543-42ac-9ead-0e890b188e99", // Lightning Bolt
    // "6cbbca60-6a4a-45eb-8266-3e4248bf130d", // Counterspell
    // "59df2f8f-5dcd-4f5b-ba72-36e677f9406b", // Black Lotus
    // "236ca9ff-319b-456b-a9f0-59ba9c4d6c3c", // Brainstorm
  ];
  return (
    <div className="flex flex-wrap gap-4">
      {cardIds.map((id) => (
        <Card key={id} id={id} />
      ))}
    </div>
  );
}
