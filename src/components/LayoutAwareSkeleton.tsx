'use client';

import { useSettings } from '@/context/SettingsContext';
import { CardGridSkeleton, CardListSkeleton } from './CardSkeletons';

export function LayoutAwareSkeleton() {
  const { layout } = useSettings();
  return layout === 'grid' ? <CardGridSkeleton /> : <CardListSkeleton />;
}
