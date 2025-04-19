import { Badge } from '@/components/ui/badge';
import { statusConfig } from '@/pages/documents';

export default function StatusChange({ from, to }: { from: string | null; to: string | null }) {
  return (
    <div className="flex items-center space-x-2">
      {from && typeof from === 'string' && from in statusConfig ? (
        <Badge variant="outline" className="border-gray-200 text-gray-600">
          {statusConfig[from as keyof typeof statusConfig].label}
        </Badge>
      ) : (
        <Badge variant="outline" className="border-gray-200 text-gray-600">
          No Status
        </Badge>
      )}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3L14 8L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {to && typeof to === 'string' && to in statusConfig ? (
        <Badge variant={statusConfig[to as keyof typeof statusConfig].variant}>{statusConfig[to as keyof typeof statusConfig].label}</Badge>
      ) : (
        <Badge variant="outline" className="border-gray-200 text-gray-600">
          No Status
        </Badge>
      )}
    </div>
  );
}
