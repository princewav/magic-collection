/**
 * Next.js App Router type definitions
 * These are custom type definitions to ensure correct type checking across the app
 */

import { NextPage } from 'next';
import { Metadata } from 'next';

/**
 * Define the correct params and searchParams types for Next.js App Router pages
 * This ensures that all page components use the Promise-based params and searchParams
 */
export interface PageProps<
  T extends Record<string, string | string[]> = Record<
    string,
    string | string[]
  >,
  S extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> {
  params: Promise<T>;
  searchParams: Promise<S>;
}

/**
 * Utility type for defining Next.js Page components
 */
export type NextPageWithProps<
  T extends Record<string, string | string[]> = Record<
    string,
    string | string[]
  >,
  S extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> = (props: PageProps<T, S>) => Promise<React.ReactNode> | React.ReactNode;
