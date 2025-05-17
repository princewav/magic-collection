import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface SortField {
  field: string;
  order: 'asc' | 'desc';
}

export interface SortOption {
  value: string;
  label: string;
}

export const sortOptions: SortOption[] = [
  { value: 'cmc', label: 'CMC' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'colors', label: 'Color' },
];

// Client-side only wrapper to prevent hydration mismatch
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a simple placeholder during SSR and initial render
    return <div className="flex flex-wrap gap-2">{/* SSR placeholder */}</div>;
  }

  return <>{children}</>;
}

interface SortableSortFieldProps {
  field: SortField;
  index: number;
  onOrderChange: (field: string) => void;
  onRemove: (field: string) => void;
}

function SortableSortField({
  field,
  index,
  onOrderChange,
  onRemove,
}: SortableSortFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.field });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border p-2',
        isDragging && 'shadow-lg',
      )}
    >
      <button
        className="text-muted-foreground hover:text-foreground cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1">
        {sortOptions.find((opt) => opt.value === field.field)?.label}
      </span>
      <button
        className="text-muted-foreground hover:text-foreground"
        onClick={() => onOrderChange(field.field)}
      >
        {field.order === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </button>
      <button
        className="text-muted-foreground hover:text-foreground"
        onClick={() => onRemove(field.field)}
      >
        ×
      </button>
    </div>
  );
}

interface SortOptionsProps {
  sortFields: SortField[];
  onSortFieldChange: (field: string) => void;
  onRemoveSortField: (field: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function SortOptions({
  sortFields,
  onSortFieldChange,
  onRemoveSortField,
  onDragEnd,
}: SortOptionsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="grid grid-rows-[auto_1fr] gap-2">
      <h3 className="text-sm font-medium">Sort By</h3>
      <div className="grid grid-rows-[auto_auto]">
        {/* Active sort fields - wrapped in ClientOnly to prevent hydration issues */}
        <ClientOnly>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={sortFields.map((f) => f.field)}
              strategy={horizontalListSortingStrategy}
            >
              <div
                className={cn(
                  'flex flex-wrap gap-2',
                  sortFields.length > 0 && 'mb-2',
                )}
              >
                {sortFields.map((field, index) => (
                  <SortableSortField
                    key={field.field}
                    field={field}
                    index={index}
                    onOrderChange={onSortFieldChange}
                    onRemove={onRemoveSortField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ClientOnly>

        {/* Add sort field */}
        <div className="flex flex-wrap gap-2">
          {sortOptions
            .filter(
              (option) => !sortFields.some((f) => f.field === option.value),
            )
            .map((option) => (
              <Button
                key={option.value}
                variant="outline"
                onClick={() => onSortFieldChange(option.value)}
                className="h-7 px-1.5 text-xs md:h-8 md:px-2 md:text-sm"
              >
                {option.label}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
