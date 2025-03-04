import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';
import { expect } from 'chai';
import { CardModalProvider, useCardModal } from '../../../src/app/contexts/CardModalContext';

vi.mock('../../../src/app/contexts/CardModalContext', () => {
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
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
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
    })));

    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    const cardElement = await screen.findByRole('button');
    fireEvent.click(cardElement);

    const { openModal } = useCardModal();

    await waitFor(() => {
      expect(openModal).to.have.been.calledWith('test-id');
    });
  });
});
