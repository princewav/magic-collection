import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import Card from '@/components/Card';
import { CardModalProvider, useCardModal } from '@/context/CardModalContext';

vi.mock('@/context/CardModalContext', () => {
  const mockOpenModal = vi.fn();
  return {
    useCardModal: () => ({
      isOpen: false,
      cardId: null,
      openModal: mockOpenModal,
      closeModal: () => {},
    }),
    CardModalProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

describe('Card Component - Modal Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('opens the modal when the card is clicked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              name: 'Test Card',
              mana_cost: '{1}{W}',
              type_line: 'Creature — Human Soldier',
              oracle_text: 'Test oracle text',
              power: '1',
              toughness: '1',
              image_uris: {
                normal: 'http://example.com/image.jpg',
              },
            }),
        }),
      ),
    );

    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.to.exist;
    });

    const cardElement = screen.getByAltText('Card Test Card');
    fireEvent.click(cardElement);

    const { openModal } = useCardModal();
    await waitFor(() => {
      expect(vi.mocked(openModal)).toHaveBeenCalledWith('test-id');
    });
  });
});
