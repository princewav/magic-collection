import { ManaSymbol } from "./ManaSymbol";

export function Filters() {
  return (
    <div className="bg-foreground/20 p-4 rounded-md shadow-md mb-3">
      <div className="flex items-center space-x-2 flex-wrap">
        {/* Search by name input */}
        <div className="m-1">
          <input
            type="text"
            placeholder="Search by name"
            className="rounded-md px-2 py-1 border border-foreground/30 outline-foreground/50"
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
