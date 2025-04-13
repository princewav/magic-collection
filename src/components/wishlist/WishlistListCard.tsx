import { CardWithQuantity } from '@/types/card';
import { TextWithSymbols } from '@/components/card-modal/TextWithSymbols';
import Image from 'next/image';

interface WishlistListCardProps {
  card: CardWithQuantity;
  onClick: () => void;
}

export const WishlistListCard = ({ card, onClick }: WishlistListCardProps) => {
  return (
    <div
      data-role="card-row"
      onClick={onClick}
      className="hover:bg-secondary/10 bg-card flex cursor-pointer items-center justify-between overflow-x-auto rounded-xl border p-3 shadow-sm"
    >
      <div data-role="card-info" className="flex w-full items-center gap-3">
        <div
          data-role="card-quantity"
          className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold"
        >
          {card.quantity}x
        </div>
        {card.image_uris?.art_crop && (
          <Image
            src={card.image_uris.art_crop}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-sm object-cover"
          />
        )}
        <div className="flex w-full flex-col">
          <div data-role="row-1" className="col-span-">
            <span
              data-role="card-name"
              className="min-w-0 flex-1 truncate font-medium"
            >
              {card.name}
            </span>
          </div>
          <div data-role="row-2" className="flex items-center gap-2">
            <span
              data-role="card-set"
              className="text-muted-foreground font-mono text-sm"
            >
              [{card.set.toUpperCase()}]
            </span>
            {card.mana_cost && (
              <p className="flex items-center">
                <TextWithSymbols
                  text={card.mana_cost}
                  symbolSize={18}
                  symbolClassName="mx-0.5"
                />
              </p>
            )}
          </div>
        </div>
        {card.prices?.eur && (
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold">€{card.prices?.eur}</span>
            <span className="text-muted-foreground truncate text-sm">
              Tot. €
              {(parseFloat(card.prices?.eur || '0') * card.quantity).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
