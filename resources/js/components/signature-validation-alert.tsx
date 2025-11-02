import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface SignatureValidationAlertProps {
  isMatch: boolean;
  averageSimilarity: number;
  confidence: 'high' | 'medium' | 'low';
}

interface ValidationMetricProps {
  label: string;
  value: string;
  className?: string;
}

const ValidationMetric = ({ label, value, className }: ValidationMetricProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}:&nbsp;</span>
      <span className={cn('font-bold', className)}>{value}</span>
    </div>
  );
};

const getConfidenceColor = (confidence: string) => {
  return cn(confidence === 'high' && 'text-green-600', confidence === 'medium' && 'text-yellow-600', confidence === 'low' && 'text-red-600');
};

export function SignatureValidationAlert({ isMatch, averageSimilarity, confidence }: SignatureValidationAlertProps) {
  return (
    <Alert variant="destructive" className={cn('border-none p-0 font-sans', !isMatch && 'text-destructive')}>
      <AlertTitle>{isMatch ? 'Signatures Validation Successful' : 'Signatures Validation Failed'}</AlertTitle>
      <AlertDescription className="grid gap-1">
        <div className="text-muted-foreground mt-2 grid gap-1 text-xs">
          <ValidationMetric
            label="Similarity Score"
            value={`${averageSimilarity.toFixed(2)}%`}
            className={isMatch ? 'text-primary' : 'text-destructive'}
          />
          <ValidationMetric label="Confidence Level" value={confidence.toUpperCase()} className={getConfidenceColor(confidence)} />
        </div>
      </AlertDescription>
    </Alert>
  );
}
