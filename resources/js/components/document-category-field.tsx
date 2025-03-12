import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DocumentCategory } from '@/types/document';

interface DocumentCategoryFieldProps {
  value: {
    id: number | null;
    name: string;
  };
  onChange: (category: { id: number | null; name: string }) => void;
  categories: DocumentCategory[];
  errors?: Record<string, string>;
}

export function DocumentCategoryField({ value, onChange, categories, errors }: DocumentCategoryFieldProps) {
  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(category => category.id === Number(categoryId));

    if (selectedCategory) {
      onChange({
        id: selectedCategory.id,
        name: selectedCategory.name,
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="category">Category</Label>
      <RadioGroup id="category" value={String(value.id)} onValueChange={handleCategoryChange} className="grid gap-4 pt-2">
        {categories.map(category => (
          <div key={category.id} className="flex items-center space-x-2">
            <RadioGroupItem value={String(category.id)} id={`category-${category.id}`} />
            <Label htmlFor={`category-${category.id}`} className="font-normal">
              {category.name}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <InputError message={errors?.['category.id'] || errors?.['category.name']} />
    </div>
  );
}
