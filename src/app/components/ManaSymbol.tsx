import Image from "next/image";

interface ManaSymbolProps {
  symbol: string;
}

export default function ManaSymbol({ symbol }: ManaSymbolProps) {
  let imageSrc = "";

  switch (symbol) {
    case "W":
      imageSrc = "/images/mana/white.svg";
      break;
    case "U":
      imageSrc = "/images/mana/blue.svg";
      break;
    case "B":
      imageSrc = "/images/mana/black.svg";
      break;
    case "R":
      imageSrc = "/images/mana/red.svg";
      break;
    case "G":
      imageSrc = "/images/mana/green.svg";
      break;
    case "C":
      imageSrc = "/images/mana/colorless.svg";
      break;
    case "M":
      imageSrc = "/images/mana/multicolor.svg";
      break;
    default:
      imageSrc = "/images/mana/unknown.svg"; // Provide a default image
  }

  if (symbol.length > 1) {
    const colors = symbol.split("");
    imageSrc = `/images/mana/${colors.sort().join("").toLowerCase()}.svg`; // Assuming you have combined images like "wb.svg"
  }

  return (
    <button className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
      <Image src={imageSrc} alt={symbol} width={24} height={24} />
    </button>
  );
}
