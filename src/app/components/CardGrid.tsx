import Card from "./Card";

export default function CardGrid() {
  const cardIds = [
    "c6399a22-cebf-4c1d-a23e-4c68f784ac1b", // Sol Ring
    "bc728618-0aa9-40d5-829a-47da9b743ce3", // Lightning Bolt
    "6cbbca60-6a4a-45eb-8266-3e4248bf130d", // Counterspell
    "59df2f8f-5dcd-4f5b-ba72-36e677f9406b", // Black Lotus
    "236ca9ff-319b-456b-a9f0-59ba9c4d6c3c", // Brainstorm
  ];

  return (
    <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
      {cardIds.map((id) => (
        <Card key={id} id={id} />
      ))}
    </div>
  );
}
