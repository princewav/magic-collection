'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useTheme } from 'next-themes';

type ThemeOption = 'light' | 'dark' | 'system';
type LayoutOption = 'grid' | 'list';
type CollectionTypeOption = 'paper' | 'arena' | 'both';
type LanguageOption = 'en' | 'es' | 'fr' | 'de';

interface SettingsContextType {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  layout: LayoutOption;
  setLayout: (layout: LayoutOption) => void;
  collectionType: CollectionTypeOption;
  setCollectionType: (type: CollectionTypeOption) => void;
  language: LanguageOption;
  setLanguage: (language: LanguageOption) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const [theme, setThemeState] = useState<ThemeOption>('system');
  const [layout, setLayout] = useState<LayoutOption>('grid');
  const [collectionType, setCollectionType] =
    useState<CollectionTypeOption>('both');
  const [language, setLanguageState] = useState<LanguageOption>('en');

  // Initialize from localStorage on client side
  useEffect(() => {
    // Theme is handled by next-themes, just sync with its state
    setThemeState((nextTheme as ThemeOption) || 'system');

    // Load other settings from localStorage
    const savedLayout = localStorage.getItem('layout') as LayoutOption;
    if (savedLayout) setLayout(savedLayout);

    const savedCollectionType = localStorage.getItem(
      'collectionType',
    ) as CollectionTypeOption;
    if (savedCollectionType) setCollectionType(savedCollectionType);

    const savedLanguage = localStorage.getItem('language') as LanguageOption;
    if (savedLanguage) setLanguageState(savedLanguage);
  }, [nextTheme]);

  // Functions to update settings
  const setTheme = (newTheme: ThemeOption) => {
    setThemeState(newTheme);
    setNextTheme(newTheme);
  };

  const updateLayout = (newLayout: LayoutOption) => {
    setLayout(newLayout);
    localStorage.setItem('layout', newLayout);
  };

  const updateCollectionType = (newType: CollectionTypeOption) => {
    setCollectionType(newType);
    localStorage.setItem('collectionType', newType);
  };

  const updateLanguage = (newLanguage: LanguageOption) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        layout,
        setLayout: updateLayout,
        collectionType,
        setCollectionType: updateCollectionType,
        language,
        setLanguage: updateLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}
