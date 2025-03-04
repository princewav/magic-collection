import React from 'react';
import { render, screen, expect, beforeEach, vi } from 'vitest';
import Card from '../../../../src/app/components/Card';

vi.mock('node-fetch');

const mockedFetch = vi.mocked(vi.fn());

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state while fetching data', () => {
    mockedFetch.mockImplementation(() => Promise.resolve({}));
    render(<Card id="test-id" />);
    expect(screen.getByText('Loading...')).to.exist;
  });
});
