import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface ThemeColors {
  [key: string]: string;
}

interface ThemeConfig {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

interface ThemeConfigs {
  [key: string]: ThemeConfig;
}

interface ThemeSelectorProps {
  themes: ThemeConfigs;
  selectedTheme: string;
  onChange: (theme: string) => void;
}

export function ThemeSelector({ themes, selectedTheme, onChange }: ThemeSelectorProps) {
  const handleThemeChange = (themeKey: string) => {
    onChange(themeKey);
  };

  if (!themes) {
    return (
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-2">
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Object.entries(themes).map(([themeId, theme]) => (
        <Button
          key={themeId}
          variant="outline"
          size="sm"
          type="button"
          onClick={() => handleThemeChange(themeId)}
          className={cn('h-9 w-full justify-start px-3', selectedTheme === themeId && 'border-primary bg-accent')}
          aria-label={`Select ${theme.name} theme`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.light.primary }} />
              <span className="text-xs font-medium">{theme.name}</span>
            </div>

            {selectedTheme === themeId && <Check className="text-primary h-3 w-3" />}
          </div>
        </Button>
      ))}
    </div>
  );
}
