import React from "react";
import { expect, beforeEach, vi, describe, it } from "vitest";
import Card from "../../../src/app/components/Card";
import { render, screen, waitFor } from '@testing-library/react';


vi.mock("node-fetch");

const mockedFetch = vi.mocked(vi.fn());

describe("Card Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading state while fetching data", () => {
    mockedFetch.mockImplementation(() => new Promise(() => {}));
    render(<Card id="test-id" />);
    expect(screen.getByText("Loading...")).to.exist;
  });
});
