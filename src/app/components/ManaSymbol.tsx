interface ManaSymbolProps {
  symbol: string;
}

export default function ManaSymbol({ symbol }: ManaSymbolProps) {
  return (
    <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
      <div className="text-white">{symbol}</div>
    </button>
  );
}
