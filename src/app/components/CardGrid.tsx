import Card from "./Card";

export default function CardGrid() {
  return (
    <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
      {/* Card grid content will go here */}
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
    </div>
  );
}
