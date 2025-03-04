import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';
import { expect } from 'chai';
import { CardModalProvider, useCardModal } from '../../../src/app/contexts/CardModalContext';

describe('Card Component - Modal Interaction', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the modal when the card is clicked', async () => {
    const openModalMock = vi.fn();

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

    const { container } = render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    // Mock the openModal function from the CardModalContext
    const cardComponent = container.querySelector('.bg-gray-700');

    // Ensure the cardComponent is found before proceeding
    expect(cardComponent).to.not.be.null;

    // Attach the mock function to the Card component's openModal function
    const { openModal } = useCardModal();
    vi.spyOn(useCardModal(), 'openModal').mockImplementation(openModalMock);

    // Simulate a click on the card
    fireEvent.click(cardComponent as Element);

    // Wait for the modal to open
    await waitFor(() => {
      expect(openModalMock).toHaveBeenCalledWith('test-id');
    });
  });
});
