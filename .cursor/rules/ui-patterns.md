# UI Patterns

## Layout Switching

The application supports dynamic layout switching for card displays with the following pattern:

### Implementation Pattern

```typescript
const [isGridView, setIsGridView] = useState(true);

// Load layout preference
useEffect(() => {
  const savedLayout = localStorage.getItem('layoutKey');
  if (savedLayout) {
    setIsGridView(savedLayout === 'grid');
  }
}, []);

// Save layout preference
const toggleLayout = () => {
  const newLayout = !isGridView;
  setIsGridView(newLayout);
  localStorage.setItem('layoutKey', newLayout ? 'grid' : 'list');
};
```

### Components

1. Toggle Button

```tsx
<Button
  variant="outline"
  size="icon"
  onClick={toggleLayout}
  className="h-8 w-8"
  title={isGridView ? 'Switch to list view' : 'Switch to grid view'}
>
  {isGridView ? <List className="h-4 w-4" /> : <Grid2X2 className="h-4 w-4" />}
</Button>
```

2. Grid View

- Uses flex-wrap with responsive widths
- Card components maintain aspect ratio
- Supports hover effects and interactions

3. List View

- Compact representation of card data
- Shows: quantity, name, set code, mana value, colors
- Uses consistent spacing and alignment

### User Preferences

- Layout choice persists between sessions
- Each view type serves different use cases:
  - Grid: Visual browsing and card art focus
  - List: Quick scanning and data comparison

### Styling Constants

- Button sizes: h-8 w-8 (container), h-4 w-4 (icon)
- List item spacing: gap-3 for items, gap-2 for icons
- Background colors: bg-card for items, bg-background/80 for quantity badges
- Text styles: font-medium for card names, text-muted-foreground for secondary info
