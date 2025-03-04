import Image from "next/image";

interface ManaSymbolProps {
  symbol: string;
}

export default function ManaSymbol({ symbol }: ManaSymbolProps) {
  let imageSrc = "";

  switch (symbol) {
    case "{W}":
      imageSrc = "/images/mana/white.svg";
      break;
    case "{U}":
      imageSrc = "/images/mana/blue.svg";
      break;
    case "{B}":
      imageSrc = "/images/mana/black.svg";
      break;
    case "{R}":
      imageSrc = "/images/mana/red.svg";
      break;
    case "{G}":
      imageSrc = "/images/mana/green.svg";
      break;
    case "{C}":
      imageSrc = "/images/mana/colorless.svg";
      break;
    case "{W/U}":
      imageSrc = "/images/mana/wu.svg";
      break;
    case "{W/B}":
      imageSrc = "/images/mana/wb.svg";
      break;
    case "{U/B}":
      imageSrc = "/images/mana/ub.svg";
      break;
    case "{U/R}":
      imageSrc = "/images/mana/ur.svg";
      break;
    case "{B/R}":
      imageSrc = "/images/mana/br.svg";
      break;
    case "{B/G}":
      imageSrc = "/images/mana/bg.svg";
      break;
    case "{R/G}":
      imageSrc = "/images/mana/rg.svg";
      break;
    case "{R/W}":
      imageSrc = "/images/mana/rw.svg";
      break;
    case "{G/W}":
      imageSrc = "/images/mana/gw.svg";
      break;
    case "{G/U}":
      imageSrc = "/images/mana/gu.svg";
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
