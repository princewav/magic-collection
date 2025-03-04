export default function Filters() {
  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <div className="flex items-center space-x-2">
        <div className="bg-gray-700 rounded-md p-2 text-white">Power 7</div>
        <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
          X
        </button>
        {/* Mana symbols */}
        <div className="flex space-x-1">
          <div>[Mana Symbol 1]</div>
          <div>[Mana Symbol 2]</div>
          <div>[Mana Symbol 3]</div>
          <div>[Mana Symbol 4]</div>
          <div>[Mana Symbol 5]</div>
        </div>
        {/* Other filter options */}
        <div>[Filter Option 1]</div>
        <div>[Filter Option 2]</div>
      </div>
    </div>
  );
}
