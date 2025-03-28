'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useCardModal } from '@/context/CardModalContext';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ManaSymbol } from './ManaSymbol';
import { NumberSymbol } from './NumberSymbol';
import React from 'react';

interface CardData {
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
}

export default function CardModal() {
  const {
    isOpen,
    card,
    closeModal,
    goToNextCard,
    goToPrevCard,
    hasNextCard,
    hasPrevCard,
  } = useCardModal();
  const [imageError, setImageError] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowRight':
          if (hasNextCard) {
            goToNextCard();
          }
          break;
        case 'ArrowLeft':
          if (hasPrevCard) {
            goToPrevCard();
          }
          break;
        case 'Escape':
          closeModal();
          break;
        default:
          break;
      }
    },
    [isOpen, hasNextCard, hasPrevCard, goToNextCard, goToPrevCard, closeModal],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  if (!card) {
    return (
      <div className="bg-opacity-50 bg-background/90 fixed top-0 left-0 flex h-full w-full items-center justify-center">
        <div className="rounded-md bg-gray-700 p-4 text-lg shadow-md">
          Card not found.
        </div>
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
  };

  const powerToughness =
    card.power !== null && card.toughness !== null
      ? `${card.power} / ${card.toughness}`
      : null;

  return (
    <div className="bg-opacity-50 bg-background/90 fixed top-0 left-0 flex h-full w-full items-center justify-center p-4">
      <div
        className="bg-sidebar relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-md p-6 shadow-md"
        ref={modalRef}
      >
        {hasPrevCard && (
          <button
            onClick={goToPrevCard}
            className="bg-background/70 text-muted-foreground hover:text-foreground hover:bg-background/90 absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full transition-all duration-300"
            aria-label="Previous card"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {hasNextCard && (
          <button
            onClick={goToNextCard}
            className="bg-background/70 text-muted-foreground hover:text-foreground hover:bg-background/90 absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full transition-all duration-300"
            aria-label="Next card"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div className="relative p-4" id="modal-box">
          <button
            onClick={closeModal}
            className="bg-background text-muted-foreground hover:text-foreground absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
          >
            <X size={20} strokeWidth={4} />
          </button>
          <div className="flex h-full flex-col md:flex-row">
            <div className="justify-left flex items-center md:w-1/2 md:pr-4">
              {imageError ? (
                <div className="flex aspect-[223/310] items-center justify-center rounded-md bg-gray-800">
                  <span className="text-lg text-white">
                    Image failed to load
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center overflow-hidden rounded-3xl">
                  <div className="relative h-[500px] w-[360px] flex-shrink-0">
                    <Image
                      src={
                        card.image_uris?.normal ||
                        'https://via.placeholder.com/223x310'
                      }
                      alt={card.name}
                      className="rounded-md"
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      priority
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'center center',
                      }}
                      onError={handleImageError}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex w-1/2 flex-col justify-between">
              <div className="flex flex-col space-y-2">
                <h2 className="p-4 pb-0 text-3xl font-bold text-white">
                  {card.name}
                </h2>
                {card.mana_cost && (
                  <p className="p-b flex flex-row rounded-2xl p-4 text-xl text-gray-400">
                    {card.mana_cost?.split('//').map((part, index) => (
                      <span key={index} className="flex flex-row space-x-0.5">
                        {part.match(/{(.*?)}/g)?.map((match, idx) => {
                          const symbol = match[1];
                            return (
                              <ManaSymbol key={idx} symbol={symbol} size={25} />
                            );
                         
                        })}
                        {index < card.mana_cost.split('//').length - 1 && (
                          <span className="w-8 text-center">//</span>
                        )}
                      </span>
                    ))}
                  </p>
                )}
                <p className="bg-background/20 rounded-2xl p-2 text-center text-xl text-gray-300 flex justify-between items-center">
                  {card.type_line}
                  <div className="flex justify-center">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full transition-all md:size-7 `}
                      title={
                        card.rarity === 'common'
                          ? 'Common'
                          : card.rarity === 'uncommon'
                            ? 'Uncommon'
                            : card.rarity === 'rare'
                              ? 'Rare'
                              : 'Mythic Rare'
                      }
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold shadow-sm md:text-base ${
                          card.rarity === 'common'
                            ? 'bg-gradient-to-br from-gray-100 to-gray-300 text-gray-700'
                            : card.rarity === 'uncommon'
                              ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black'
                              : card.rarity === 'rare'
                                ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-black'
                                : 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                        }`}
                      >
                        {card.rarity.charAt(0).toUpperCase()}
                      </span>
                    </span>
                  </div>
                </p>
                {card.oracle_text && (
                  <div className="bg-background/20 rounded-2xl p-2 text-xl text-gray-300">
                    {card.oracle_text.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        <div className="inline-block">
                          {line.split(/({[^}]+})/).map((part, idx) => {
                            const match = part.match(/{([^}]+)}/);
                            if (match) {
                              const symbol = match[1];
                              
                                return (
                                  <ManaSymbol
                                    key={idx}
                                    symbol={symbol}
                                    size={20}
                                    className="mx-0.5 inline-block align-middle"
                                  />
                                );
                              
                            }
                            return (
                              <span key={idx} className="inline">
                                {part}
                              </span>
                            );
                          })}
                        </div>
                        {index < card.oracle_text.split('\n').length - 1 && (
                          <p className="my-3" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
                <div className="bg-background/20 flex items-center justify-center gap-2 rounded-2xl p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-purple-400/50 text-white transition-all duration-300 hover:bg-purple-300/40"
                    onClick={() =>
                      window.open(
                        `https://scryfall.com/search?q=!"${encodeURIComponent(card.name)}"`,
                        '_blank',
                      )
                    }
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    View on Scryfall
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-600/50 text-white transition-all duration-300 hover:bg-blue-500/50"
                    onClick={() =>
                      window.open(
                        `https://www.cardmarket.com/en/Magic/Products/Search?searchString=${encodeURIComponent(card.name)}`,
                        '_blank',
                      )
                    }
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    View on Cardmarket
                  </Button>
                </div>
              </div>
              <div className="flex flex-row items-center justify-between">
                <p className="text-white">{card.set_name}</p>
                {powerToughness && (
                  <div className="mt-2 flex items-center justify-end">
                    <p className="text-3xl text-white">{powerToughness}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
