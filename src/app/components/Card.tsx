export default function Card() {
  return (
    <div className="bg-gray-700 rounded-md shadow-md">
      <img src="https://via.placeholder.com/223x310" alt="Card Image" className="rounded-t-md" />
      <div className="p-4">
        <h2 className="text-xl font-bold text-white">Card Name</h2>
        <p className="text-gray-400">Mana Cost</p>
        <p className="text-gray-300">Creature Type</p>
        <p className="text-gray-300">Card Text</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-white">8/8</p>
        </div>
      </div>
    </div>
  );
}
