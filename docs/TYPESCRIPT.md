# TypeScript Guidelines for Next.js App Router

## Page Component Props

When creating page components in the Next.js App Router, always follow these typing patterns to ensure compatibility with Next.js type checking:

### Correct Pattern

```tsx
// Import our custom types
import { PageProps } from '@/types/next';

// Define your params type
interface MyPageParams {
  type: 'paper' | 'arena';
  // Add any other route params
}

// Use the PageProps generic to create a properly typed component
export default async function MyPage({ params, searchParams }: PageProps<MyPageParams>) {
  // Always await params and searchParams
  const { type } = await params;
  const resolvedSearchParams = await searchParams;

  // Use the resolved values
  // ...

  return (
    // ...
  );
}
```

### Common Pitfalls to Avoid

❌ **Don't define params without Promise type:**

```tsx
// WRONG
interface Props {
  params: { type: 'paper' | 'arena' };
  searchParams: { [key: string]: string | string[] | undefined };
}
```

✅ **Do use Promise types:**

```tsx
// CORRECT
interface Props {
  params: Promise<{ type: 'paper' | 'arena' }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

### Helpers and Utilities

Always use our custom utility types when working with page components:

- `PageProps<T>` - For typing page component props
- `NextPageWithProps<T>` - For typing the page component function itself

## Search Params Parsing

When parsing search parameters:

1. Always await the searchParams object
2. Define your parsing function to accept the resolved object type

```tsx
function parseFiltersFromParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): FilterResult {
  // Parse logic here
}

// Usage in component
export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const result = parseFiltersFromParams(resolvedSearchParams);
  // ...
}
```

## Type-Safe Route Parameters

For dynamic route segments like `[type]` or `[id]`, define an explicit type for the parameters:

```tsx
// For route: /collection/[type]/page.tsx
interface CollectionParams {
  type: 'paper' | 'arena';
}

export default async function CollectionPage({
  params,
}: PageProps<CollectionParams>) {
  const { type } = await params;
  // ...
}
```
