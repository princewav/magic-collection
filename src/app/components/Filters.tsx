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
          <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
            <div className="text-white">{'{W}'}</div>
          </button>
          <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
            <div className="text-white">{'{U}'}</div>
          </button>
          <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
            <div className="text-white">{'{B}'}</div>
          </button>
          <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
            <div className="text-white">{'{R}'}</div>
          </button>
          <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
            <div className="text-white">{'{G}'}</div>
          </button>
          <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
            <div className="text-white">{'{C}'}</div>
          </button>
        </div>
        {/* Other filter options */}
        <div className="m-1">CMC</div>
        <div className="m-1">Type</div>
        <div className="m-1">Set</div>
      </div>
    </div>
  );
}
