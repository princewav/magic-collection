import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';
import { expect } from 'chai';
import { CardModalProvider } from '../../../src/app/contexts/CardModalContext';

describe('Card Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays an error message when the API call fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('API Error'))));

    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).to.exist;
    });
  });

  it('displays a message when the image fails to load', async () => {
    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    // Mock the Image component's onError event
    const img = screen.getByRole('img');
    img.onerror = () => {
      console.log("Image error triggered");
    };

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Image failed to load')).to.exist;
    });
  });
});
