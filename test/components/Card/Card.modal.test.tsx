import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';
import { CardModalProvider } from '../../../src/app/contexts/CardModalContext';
import { expect } from 'chai';

describe('Card Component - Modal Interaction', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the modal when the card is clicked', async () => {
    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    const cardElement = screen.getByRole('img');
    fireEvent.click(cardElement);

    // Wait for the modal to be open
    await waitFor(() => {
      expect(screen.getByText('Loading...')).to.exist;
    });
  });

  it('closes the modal when the close button is clicked', async () => {
    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    const cardElement = screen.getByRole('img');
    fireEvent.click(cardElement);

    // Wait for the modal to be open
    await waitFor(() => {
      expect(screen.getByText('Loading...')).to.exist;
    });

    // Find the close button and click it
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    // Wait for the modal to close
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).to.not.exist;
    });
  });
});
