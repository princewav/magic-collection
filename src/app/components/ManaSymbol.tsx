import Image from "next/image";

interface ManaSymbolProps {
  symbol: string;
}

export default function ManaSymbol({ symbol }: ManaSymbolProps) {
  let imageSrc = "";
// add another case for multicolor mana ai!

  switch (symbol) {
    case "{W}":
      imageSrc = "/images/mana/white.svg";
      break;
    case "{U}":
      imageSrc = "/images/mana/blue.svg"; // Assuming you have a blue.svg
      break;
    case "{B}":
      imageSrc = "/images/mana/black.svg"; // Assuming you have a black.svg
      break;
    case "{R}":
      imageSrc = "/images/mana/red.svg"; // Assuming you have a red.svg
      break;
    case "{G}":
      imageSrc = "/images/mana/green.svg"; // Assuming you have a green.svg
      break;
    case "{C}":
      imageSrc = "/images/mana/colorless.svg"; // Assuming you have a colorless.svg
      break;
    default:
      imageSrc = "/images/mana/unknown.svg"; // Provide a default image
  }

  if (symbol.startsWith("{") && symbol.endsWith("}")) {
    const colors = symbol.slice(1, -1).split("");
    if (colors.length > 1) {
      imageSrc = `/images/mana/${colors.sort().join("").toLowerCase()}.svg`; // Assuming you have combined images like "wb.svg"
    }
  }

  return (
    <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
      <Image src={imageSrc} alt={symbol} width={24} height={24} />
    </button>
  );
}
