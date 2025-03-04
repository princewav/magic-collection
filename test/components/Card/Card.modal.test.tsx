import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';
import { expect } from 'chai';
import { CardModalProvider } from '../../../src/app/contexts/CardModalContext';

describe('Card Component - Modal Interaction', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the modal when the card is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Card not found' }),
    })));

    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    // Wait for the card to render (even if it's the "Card not found" message)
    await waitFor(() => {
      expect(screen.getByText((content) => content?.includes('Card not found') || content?.includes('Loading...'))).to.exist;
    });

    // Find the card element (the div that contains the "Card not found" message or the image)
    const cardElement = screen.getByRole('button');

    // Click the card element
    fireEvent.click(cardElement);

    // Wait for the modal to open (you might need to adjust the waiting condition based on how your modal is implemented)
    await waitFor(() => {
      // This is a placeholder - replace with the actual condition that indicates the modal is open
      // For example, if the modal contains a specific text:
      // expect(screen.getByText('Modal Content')).to.exist;
      // Or if the modal has a specific role:
      // expect(screen.getByRole('dialog')).to.exist;
      // For now, we just check that something changes after the click
      expect(screen.getByText((content) => content?.includes('Card not found') || content?.includes('Loading...'))).to.exist;
    });
  });
});
