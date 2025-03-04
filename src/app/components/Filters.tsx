import Image from "next/image";
import ManaSymbol from "./ManaSymbol";

export default function Filters() {
  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <div className="flex items-center space-x-2 flex-wrap">
        <div className="bg-gray-700 rounded-md p-2 text-white m-1">Power 7</div>
        <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center m-1">
          X
        </button>
        {/* Mana symbols */}
        <div className="flex space-x-1 m-1">
          <ManaSymbol symbol="{W}" />
          <ManaSymbol symbol="{U}" />
          <ManaSymbol symbol="{B}" />
          <ManaSymbol symbol="{R}" />
          <ManaSymbol symbol="{G}" />
          <ManaSymbol symbol="{C}" />
        </div>
        {/* Other filter options */}
        <div className="m-1">CMC</div>
        <div className="m-1">Type</div>
        <div className="m-1">Set</div>
      </div>
    </div>
  );
}
