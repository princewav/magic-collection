import Card from "./Card";

export default function CardGrid() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Card grid content will go here */}
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
    </div>
  );
}
