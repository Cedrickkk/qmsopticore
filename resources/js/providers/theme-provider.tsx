import { useAppearance } from '@/hooks/use-appearance';
import { createContext, useContext } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeContext = createContext<ReturnType<typeof useAppearance> | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { appearance, updateAppearance, currentTheme, themeConfigs, isLoading } = useAppearance();

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        updateAppearance,
        themeConfigs,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
