import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateAccountFormData } from '@/pages/accounts/create';
import { FlaskServiceApi } from '@/services/flask';
import { LoaderCircle, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SignatureValidationAlert } from './signature-validation-alert';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface SignatureUploadProps {
  signatures: File[];
  onChange: (files: File[]) => void;
  errors: Partial<Record<`signatures.${number}` | keyof CreateAccountFormData, string>>;
  disabled?: boolean;
  onValidated: () => void;
  onChanged: () => void;
}

export function SignatureUpload({ signatures, onChange, errors, disabled, onValidated, onChanged }: SignatureUploadProps) {
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const existingFiles = signatures || [];
    const uniqueNewFiles = newFiles.filter(newFile => !existingFiles.some(existingFile => existingFile.name === newFile.name));
    onChange([...existingFiles, ...uniqueNewFiles]);
    setIsValidated(false);
    onChanged();
  };

  const removeSignature = (name: string) => {
    const filteredSignatures = signatures?.filter(signature => signature.name !== name);
    onChange(filteredSignatures);
    setIsValidated(false);
  };

  const getSignatureError = (index: number) => {
    return errors[`signatures.${index}`];
  };

  const handleValidate = async () => {
    if (!signatures.length) {
      toast(
        <Alert variant="destructive">
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>No signatures to validate</AlertDescription>
        </Alert>
      );
      return;
    }

    setIsValidating(true);

    try {
      const formData = new FormData();
      signatures.forEach((signature, index) => {
        formData.append('signatures', signature, `signature_${index + 1}.png`);
      });

      const { isMatch, averageSimilarity, confidence, error } = await FlaskServiceApi.validateSignatures(formData);

      if (error) {
        toast(
          <Alert className="border-none p-0 font-sans">
            <AlertTitle>Signatures Validation Failed</AlertTitle>
            <AlertDescription className="text-muted-foreground text-sm">
              Please ensure all uploaded files are valid signature images (PNG, JPG, JPEG) with clear signatures.
            </AlertDescription>
          </Alert>
        );
      }

      if (isMatch) {
        setIsValidated(true);
        onValidated();
      }

      toast(<SignatureValidationAlert isMatch={isMatch} averageSimilarity={averageSimilarity} confidence={confidence} />);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertTitle className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-alert-circle"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Connection Error
          </AlertTitle>
          <AlertDescription>There was a problem connecting to signature service. Please try again.</AlertDescription>
        </Alert>
      );
      setIsValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="signatures">Signatures</Label>
      <Input
        id="signatures"
        multiple
        type="file"
        name="signatures"
        accept="image/png, image/jpg, image/jpeg"
        className="mt-1 block w-full"
        disabled={disabled || isValidated}
        onChange={handleFileChange}
      />
      <InputError message={errors.signatures} />
      {signatures?.map((file, index) => {
        const error = getSignatureError(index);
        return (
          <div className="ring-offset-background mt-1 space-y-1" key={file.name}>
            <div className="flex h-10 w-full items-center justify-between rounded-md bg-gray-100 px-3 py-2 text-sm">
              <p>{file.name}</p>
              {!isValidated && (
                <Button variant="ghost" size="icon" type="button" onClick={() => removeSignature(file.name)} className="cursor-pointer">
                  <X className="text-red-500" />
                </Button>
              )}
            </div>
            {error && <InputError message={error} />}
          </div>
        );
      })}
      {signatures.length === 7 && !isValidated && (
        <Button onClick={handleValidate} disabled={isValidating} variant="outline">
          {isValidating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Validate Signatures
        </Button>
      )}
    </div>
  );
}
