'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  GridIcon,
  ListIcon,
  MoonIcon,
  SunIcon,
  ComputerIcon,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type ThemeOption = 'light' | 'dark' | 'system';
type LayoutOption = 'grid' | 'list';

// Since we don't have the actual RadioGroup components yet, let's create a simpler approach
function RadioOption({
  id,
  checked,
  onChange,
  label,
  icon,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md border p-3 ${
        checked ? 'border-primary bg-primary/10' : 'border-muted'
      }`}
      onClick={onChange}
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          checked ? 'border-primary' : 'border-muted'
        }`}
      >
        {checked && <div className="bg-primary h-2.5 w-2.5 rounded-full"></div>}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    layout,
    setLayout,
    collectionType,
    setCollectionType,
  } = useSettings();
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your preferences for theme, layout, and collection type.
        </p>
      </div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Select your preferred color theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioOption
              id="theme-light"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
              label="Light"
              icon={<SunIcon className="h-4 w-4" />}
            />
            <RadioOption
              id="theme-dark"
              checked={theme === 'dark'}
              onChange={() => setTheme('dark')}
              label="Dark"
              icon={<MoonIcon className="h-4 w-4" />}
            />
            <RadioOption
              id="theme-system"
              checked={theme === 'system'}
              onChange={() => setTheme('system')}
              label="System"
              icon={<ComputerIcon className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Layout</CardTitle>
            <CardDescription>
              Choose your preferred layout for displaying cards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioOption
              id="layout-grid"
              checked={layout === 'grid'}
              onChange={() => setLayout('grid')}
              label="Grid"
              icon={<GridIcon className="h-4 w-4" />}
            />
            <RadioOption
              id="layout-list"
              checked={layout === 'list'}
              onChange={() => setLayout('list')}
              label="List"
              icon={<ListIcon className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        {/* Collection Type Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Type</CardTitle>
            <CardDescription>
              Select which type of collection you want to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collection-paper"
                  checked={
                    collectionType === 'paper' || collectionType === 'both'
                  }
                  onCheckedChange={(checked) => {
                    if (collectionType === 'arena' && checked) {
                      setCollectionType('both');
                    } else if (collectionType === 'both' && !checked) {
                      setCollectionType('arena');
                    } else if (collectionType === 'paper' && !checked) {
                      setCollectionType('arena');
                    } else if (collectionType === 'arena' && !checked) {
                      // Can't uncheck both, must have at least one selected
                      return;
                    } else {
                      setCollectionType('paper');
                    }
                  }}
                />
                <Label htmlFor="collection-paper" className="cursor-pointer">
                  Paper
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collection-arena"
                  checked={
                    collectionType === 'arena' || collectionType === 'both'
                  }
                  onCheckedChange={(checked) => {
                    if (collectionType === 'paper' && checked) {
                      setCollectionType('both');
                    } else if (collectionType === 'both' && !checked) {
                      setCollectionType('paper');
                    } else if (collectionType === 'arena' && !checked) {
                      setCollectionType('paper');
                    } else if (collectionType === 'paper' && !checked) {
                      // Can't uncheck both, must have at least one selected
                      return;
                    } else {
                      setCollectionType('arena');
                    }
                  }}
                />
                <Label htmlFor="collection-arena" className="cursor-pointer">
                  Arena
                </Label>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              You must select at least one collection type. Selecting both will
              display cards from both collections.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
