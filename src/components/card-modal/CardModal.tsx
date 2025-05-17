'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCardModal } from '@/context/CardModalContext';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { RaritySymbol } from './RaritySymbol';
import { TextWithSymbols } from './TextWithSymbols';
import { CardFace } from '@/types/card';

export default function CardModal() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);
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
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const hasMultipleFaces = card?.card_faces && card.card_faces.length > 1;
  const isDoubleFaced =
    card?.layout === 'reversible_card' ||
    card?.layout === 'modal_dfc' ||
    card?.layout === 'transform';

  const currentFace = hasMultipleFaces
    ? card?.card_faces?.[selectedFaceIndex] || null
    : card;

  const getCardImageUrl = () => {
    if (!card) return '/images/placeholder.webp';

    if (hasMultipleFaces && (!card.image_uris || isDoubleFaced)) {
      return (
        card.card_faces?.[selectedFaceIndex]?.image_uris?.normal ||
        '/images/placeholder.webp'
      );
    }

    return card.image_uris?.normal || '/images/placeholder.webp';
  };

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

  // Close modal when pathname changes (page navigation)
  useEffect(() => {
    // Only check for pathname changes after initial render
    if (
      previousPathnameRef.current !== null &&
      previousPathnameRef.current !== pathname &&
      isOpen
    ) {
      closeModal();
    }

    previousPathnameRef.current = pathname;
  }, [pathname, closeModal, isOpen]);

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
      document.body.classList.add('overflow-hidden');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
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

  return (
    <div className="bg-opacity-50 bg-background/90 fixed top-0 left-0 flex h-full w-full items-start justify-center p-4 md:items-center">
      <div
        className="border-border/70 bg-sidebar relative max-h-[90vh] w-full max-w-4xl overflow-auto overscroll-contain rounded-2xl border-2 p-6 px-2 shadow-2xl md:px-10"
        ref={modalRef}
      >
        {hasPrevCard && (
          <button
            onClick={goToPrevCard}
            className="bg-foreground/30 text-background hover:bg-foreground/50 active:bg-foreground/70 absolute top-80 left-4 z-10 flex size-8 transform cursor-pointer items-center justify-center rounded-full border transition-all duration-300 md:top-1/2 md:-translate-y-1/2"
            aria-label="Previous card"
          >
            <ChevronLeft
              size={24}
              strokeWidth={4}
              className="absolute right-1"
            />
          </button>
        )}

        {hasNextCard && (
          <button
            onClick={goToNextCard}
            className="bg-foreground/30 text-background hover:bg-foreground/50 active:bg-foreground/70 absolute top-80 right-4 z-10 flex size-8 transform cursor-pointer items-center justify-center rounded-full border transition-all duration-300 md:top-1/2 md:-translate-y-1/2"
            aria-label="Next card"
          >
            <ChevronRight
              size={24}
              strokeWidth={4}
              className="absolute left-1"
            />
          </button>
        )}

        <button
          onClick={closeModal}
          className="bg-foreground/30 text-background hover:bg-foreground/50 active:bg-foreground/70 absolute top-4 right-4 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
        >
          <X size={20} strokeWidth={4} />
        </button>

        {/* Modal Box */}
        <div
          className="relative flex h-full flex-col p-4 md:flex-row"
          id="modal-box"
        >
          <div className="md:justify-left mb-6 flex items-center justify-center md:mb-0 md:w-1/2 md:pr-4">
            {imageError ? (
              <div className="flex aspect-[223/310] items-center justify-center rounded-md bg-gray-800">
                <span className="text-lg text-white">Image failed to load</span>
              </div>
            ) : (
              <div className="relative flex h-[300px] w-[223px] items-center justify-center overflow-hidden rounded-3xl md:h-[500px] md:w-[360px]">
                <Image
                  src={getCardImageUrl()}
                  alt={currentFace?.name || 'Card image'}
                  fill
                  priority
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center center',
                  }}
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between md:w-1/2">
            <div className="flex flex-col space-y-1">
              {hasMultipleFaces && card?.card_faces && (
                <div className="mb-4 flex justify-center space-x-2">
                  {card.card_faces.map((face, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFaceIndex(index)}
                      className={`rounded-lg px-4 py-2 transition-all duration-300 ${
                        selectedFaceIndex === index
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {face.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-row justify-between md:flex-col md:space-y-1">
                <h2 className="p-2 pb-0 text-left text-xl font-bold normal-case md:text-2xl">
                  {currentFace?.name}
                </h2>
                {currentFace?.mana_cost && (
                  <p className="flex flex-row rounded-2xl p-2">
                    <span className="flex flex-row space-x-0.5">
                      <TextWithSymbols
                        text={currentFace.mana_cost}
                        symbolSize={20}
                      />
                    </span>
                  </p>
                )}
              </div>
              <div className="bg-background/20 text-md flex items-center justify-between rounded-2xl p-2 text-center font-semibold md:text-xl">
                <span>{currentFace?.type_line}</span>
                <RaritySymbol card={card} />
              </div>
              {currentFace?.oracle_text && (
                <div className="bg-background/20 rounded-2xl p-2 text-sm md:text-lg">
                  {currentFace.oracle_text
                    .split('\n')
                    .map((line, index, arr) => (
                      <React.Fragment key={index}>
                        <div className="inline-block">
                          <TextWithSymbols
                            text={line}
                            symbolSize={17}
                            symbolClassName="mx-0.5 inline-block align-middle"
                          />
                        </div>
                        {index < arr.length - 1 && <p className="my-3" />}
                      </React.Fragment>
                    ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col">
              <div className="bg-background/20 flex flex-wrap items-center justify-center gap-2 rounded-2xl p-2 md:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-400/50 transition-all duration-300 hover:bg-purple-300/40"
                  onClick={() =>
                    window.open(
                      `https://scryfall.com/search?q=!"${encodeURIComponent(card?.name || '')}"`,
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
                  className="bg-blue-600/50 transition-all duration-300 hover:bg-blue-500/50"
                  onClick={() =>
                    window.open(
                      `https://www.cardmarket.com/en/Magic/Products/Search?searchString=${encodeURIComponent(card?.name || '')}`,
                      '_blank',
                    )
                  }
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  View on Cardmarket
                </Button>
              </div>
              <div className="text-md flex flex-row items-center justify-between p-2 md:text-xl">
                <p>{card?.set_name}</p>
                {currentFace?.power != null &&
                  currentFace?.toughness != null && (
                    <div className="flex items-center justify-end">
                      <p>{`${currentFace?.power} / ${currentFace?.toughness}`}</p>
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
