import ManaSymbol from "./ManaSymbol";

export default function Filters() {
  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md mb-3">
      <div className="flex items-center space-x-2 flex-wrap">
        {/* Search by name input */}
        <div className="m-1">
          <input
            type="text"
            placeholder="Search by name"
            className="bg-gray-700 text-white rounded-md p-1"
          />
        </div>
        {/* Mana symbols */}
        <div className="flex space-x-2 m-1">
          <ManaSymbol symbol="W" />
          <ManaSymbol symbol="U" />
          <ManaSymbol symbol="B" />
          <ManaSymbol symbol="R" />
          <ManaSymbol symbol="G" />
          <ManaSymbol symbol="C" />
          <ManaSymbol symbol="M" />
        </div>
        {/* Other filter options */}
        <div className="m-1">CMC</div>
        <div className="m-1">Type</div>
        <div className="m-1">Set</div>
      </div>
    </div>
  );
}
