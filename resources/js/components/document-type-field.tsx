import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentType } from '@/types/document';

interface DocumentTypeFieldProps {
  value: {
    id: number | null;
    name: string;
  };
  onChange: (type: { id: number | null; name: string }) => void;
  types: DocumentType[];
  errors?: Record<string, string>;
}

export function DocumentTypeField({ value, onChange, types, errors }: DocumentTypeFieldProps) {
  const handleTypeChange = (name: string) => {
    const selectedType = types.find(type => type.name === name);
    onChange({
      id: selectedType?.id ?? null,
      name,
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="document-type">Document Type</Label>
      <Select value={value.name} onValueChange={handleTypeChange} name="document-type">
        <SelectTrigger id="document-type" className="mt-1 w-full" aria-label="Select document type">
          <SelectValue placeholder="Select a document type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {types.map(type => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <InputError message={errors?.['type.id'] || errors?.['type.name']} />
    </div>
  );
}
