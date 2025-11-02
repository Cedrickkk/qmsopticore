import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getConfidentialityConfig, type ConfidentialityType } from '@/lib/confidentiality-status';
import { Info } from 'lucide-react';

export type { ConfidentialityType as ConfidentialityLevel };

interface DocumentConfidentialityFieldProps {
  level: ConfidentialityType;
  onLevelChange: (level: ConfidentialityType) => void;
}

const confidentialityLevels: ConfidentialityType[] = ['public', 'internal', 'confidential', 'highly_confidential'];

export function DocumentConfidentialityField({ level, onLevelChange }: DocumentConfidentialityFieldProps) {
  const selectedConfig = getConfidentialityConfig(level);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="confidentiality">Confidentiality Level</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Set the security level for this document. Higher levels automatically enable additional protection features including screen
                  blurring and password re-authentication.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Select value={level} onValueChange={value => onLevelChange(value as ConfidentialityType)}>
          <SelectTrigger id="confidentiality" className="w-full rounded-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {confidentialityLevels.map(levelOption => {
              const config = getConfidentialityConfig(levelOption);
              return (
                <SelectItem key={levelOption} value={levelOption}>
                  <div className="flex items-center gap-2">
                    <span className={config.color.split(' ')[1]}>{config.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {selectedConfig && <p className="text-muted-foreground text-xs">{selectedConfig.description}</p>}
      </div>
    </div>
  );
}
