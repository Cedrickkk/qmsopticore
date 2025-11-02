import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getPriorityConfig, type PriorityType } from '@/lib/document-priority';
import { Info } from 'lucide-react';

export type { PriorityType as PriorityLevel };

interface DocumentPriorityFieldProps {
  priority: PriorityType;
  onPriorityChange: (priority: PriorityType) => void;
}

const priorityLevels: PriorityType[] = ['normal', 'high', 'urgent'];

export function DocumentPriorityField({ priority, onPriorityChange }: DocumentPriorityFieldProps) {
  const selectedConfig = getPriorityConfig(priority);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="priority">Priority Level</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Set the priority level for this document. Urgent and High priority documents will be highlighted for immediate attention.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Select value={priority} onValueChange={value => onPriorityChange(value as PriorityType)}>
          <SelectTrigger id="priority" className="w-full rounded-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityLevels.map(priorityOption => {
              const config = getPriorityConfig(priorityOption);
              const Icon = config.icon;
              return (
                <SelectItem key={priorityOption} value={priorityOption}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.iconColor}`} />
                    <span className={config.textColor}>{config.label}</span>
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
