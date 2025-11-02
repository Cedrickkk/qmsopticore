import { PDFControls } from '@/components/document-viewer-controls';
import { PDFThumbnails } from '@/components/document-viewer-thumbnails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getConfidentialityBannerColor, getConfidentialityLabel } from '@/lib/confidentiality-status';
import '@/lib/pdfjs';
import { type Document as TDocument } from '@/types/document';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircleIcon, Eye, EyeOff, LoaderCircle, Shield } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { File } from 'react-pdf/dist/esm/shared/types.js';
import { toast } from 'sonner';

interface PDFPageState {
  numPages: number;
  currentPage: number;
  scale: number;
  isLoading: boolean;
  error: string | null;
}

interface PDFViewerWithSecurityProps {
  file: File;
  showThumbnails?: boolean;
  confidentiality_level: 'public' | 'internal' | 'confidential' | 'highly_confidential';
  auto_blur_after_seconds?: number;
  require_reauth_on_view?: boolean;
}

type PageProps = {
  document: TDocument;
};

export const PDFViewerWithSecurity = memo(function PDFViewerWithSecurityComponent({
  file,
  showThumbnails = false,
  confidentiality_level,
  auto_blur_after_seconds = 120,
  require_reauth_on_view = false,
}: PDFViewerWithSecurityProps) {
  const { document: documentProp } = usePage<PageProps>().props;
  const [pdfState, setPdfState] = useState<PDFPageState>({
    numPages: 0,
    currentPage: 1,
    scale: 0.8,
    isLoading: true,
    error: null,
  });

  const authSessionKey = `doc_auth_${documentProp.id}_${new Date().toDateString()}`;

  const getInitialBlurState = () => {
    if (!require_reauth_on_view) return false;

    const lastAuth = sessionStorage.getItem(authSessionKey);
    if (!lastAuth) return true;

    const authTime = parseInt(lastAuth);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    return authTime < fiveMinutesAgo;
  };

  const [isBlurred, setIsBlurred] = useState(getInitialBlurState());
  const [idleTime, setIdleTime] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    password: '',
  });

  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setPdfState(prev => ({
      ...prev,
      numPages,
      isLoading: false,
      error: null,
    }));
  }, []);

  const handleDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setPdfState(prev => ({
      ...prev,
      isLoading: false,
      error: error.message,
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPdfState(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(newPage, prev.numPages)),
    }));
    lastActivityRef.current = Date.now();
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setPdfState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale + delta)),
    }));
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!require_reauth_on_view) return;

    const checkAuth = () => {
      const lastAuth = sessionStorage.getItem(authSessionKey);
      if (!lastAuth) {
        setIsBlurred(true);
        return;
      }

      const authTime = parseInt(lastAuth);
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      if (authTime < fiveMinutesAgo) {
        setIsBlurred(true);
        sessionStorage.removeItem(authSessionKey);
      }
    };

    checkAuth();
  }, [authSessionKey, require_reauth_on_view]);

  useEffect(() => {
    if (confidentiality_level === 'public' || !auto_blur_after_seconds) return;

    const resetIdleTimer = () => {
      if (!isBlurred || (isBlurred && !require_reauth_on_view)) {
        lastActivityRef.current = Date.now();
        setIdleTime(0);
        warningShownRef.current = false;
        if (isBlurred && !require_reauth_on_view) {
          setIsBlurred(false);
        }
      }
    };

    const checkIdleTime = () => {
      if (isBlurred && require_reauth_on_view) {
        return;
      }

      const now = Date.now();
      const timeSinceLastActivity = Math.floor((now - lastActivityRef.current) / 1000);
      setIdleTime(timeSinceLastActivity);

      const timeUntilBlur = auto_blur_after_seconds - timeSinceLastActivity;
      if (timeUntilBlur === 5 && !warningShownRef.current) {
        warningShownRef.current = true;
        toast.custom(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          t => (
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 font-sans shadow-lg dark:border-amber-900 dark:bg-amber-900/30">
              <AlertCircleIcon className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Document will auto-blur in 5 seconds</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">Move your mouse or interact with the document to prevent auto-blur.</p>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
      }

      if (timeSinceLastActivity >= auto_blur_after_seconds) {
        setIsBlurred(true);
        warningShownRef.current = false;
        if (require_reauth_on_view) {
          sessionStorage.removeItem(authSessionKey);
        }
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'wheel'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer);
    });

    const interval = setInterval(checkIdleTime, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
      clearInterval(interval);
    };
  }, [auto_blur_after_seconds, confidentiality_level, isBlurred, require_reauth_on_view, authSessionKey]);

  const handleUnblur = (e: React.FormEvent) => {
    e.preventDefault();

    if (!require_reauth_on_view) {
      setIsBlurred(false);
      lastActivityRef.current = Date.now();
      setIdleTime(0);
      warningShownRef.current = false; // Reset warning flag
      return;
    }

    post(`/documents/${documentProp.id}/verify-access`, {
      onSuccess: () => {
        sessionStorage.setItem(authSessionKey, Date.now().toString());

        setIsBlurred(false);
        lastActivityRef.current = Date.now();
        setIdleTime(0);
        warningShownRef.current = false;
        reset('password');
      },
      preserveScroll: true,
    });
  };

  const securityProps =
    confidentiality_level !== 'public'
      ? {
          onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
          style: {
            userSelect: 'none' as const,
            WebkitUserSelect: 'none' as const,
            MozUserSelect: 'none' as const,
          },
        }
      : {};

  return (
    <div className="relative flex flex-col gap-4">
      {confidentiality_level !== 'public' && (
        <div className={`flex items-center gap-2 rounded-xs border px-4 py-2 text-sm ${getConfidentialityBannerColor(confidentiality_level)}`}>
          <Shield className="h-4 w-4" />
          <span className="font-medium">{getConfidentialityLabel(confidentiality_level)}</span>
          {auto_blur_after_seconds && !isBlurred && (
            <span className="ml-auto text-xs opacity-75">Auto-locks in {Math.max(0, auto_blur_after_seconds - idleTime)}s</span>
          )}
        </div>
      )}

      <div className="relative" {...securityProps}>
        {isBlurred && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xs bg-black/20 backdrop-blur-xl">
            <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <EyeOff className="text-muted-foreground h-5 w-5" />
                <h3 className="text-lg font-semibold">Document Locked</h3>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                {require_reauth_on_view
                  ? 'This document requires re-authentication. Please enter your password to continue viewing.'
                  : 'This document was automatically blurred due to inactivity. Click below to resume viewing.'}
              </p>

              <form onSubmit={handleUnblur} className="space-y-4">
                {require_reauth_on_view ? (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={e => setData('password', e.target.value)}
                      placeholder="Enter your password"
                      autoFocus
                      className="rounded-xs"
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                  </div>
                ) : null}

                <Button type="submit" className="w-full rounded-xs" disabled={processing}>
                  <Eye className="mr-2 h-4 w-4" />
                  {require_reauth_on_view ? 'Verify & Resume' : 'Resume Viewing'}
                </Button>
              </form>
            </div>
          </div>
        )}

        <Document
          className={`border-primary bg-primary/10 relative w-full overflow-hidden rounded-xs border shadow-sm ${isBlurred ? 'pointer-events-none' : ''}`}
          key={documentProp.status}
          file={file}
          loading={
            <div className="flex h-[70vh] items-center justify-center">
              <LoaderCircle className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          }
          error={
            <div className="flex h-[70vh] flex-col items-center justify-center gap-2">
              <p className="text-destructive font-medium">Failed to load PDF</p>
              {pdfState.error && <p className="text-muted-foreground text-sm">{pdfState.error}</p>}
            </div>
          }
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
        >
          <div className="relative flex h-[90vh] w-full items-center justify-center overflow-auto p-4">
            <div className="relative">
              <Page
                key={`page_${pdfState.currentPage}_${pdfState.scale}`}
                pageNumber={pdfState.currentPage}
                scale={pdfState.scale}
                className="mx-auto shadow-sm"
                renderTextLayer={confidentiality_level === 'public'}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex h-full items-center justify-center">
                    <LoaderCircle className="text-muted-foreground h-8 w-8 animate-spin" />
                  </div>
                }
              />
              {confidentiality_level !== 'public' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rotate-[-45deg] text-6xl font-bold text-red-500 opacity-10 select-none">
                    {getConfidentialityLabel(confidentiality_level)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Document>
      </div>

      {showThumbnails && pdfState.numPages > 0 && !isBlurred && (
        <Document file={file}>
          <PDFThumbnails numPages={pdfState.numPages} currentPage={pdfState.currentPage} onPageChange={handlePageChange} />
        </Document>
      )}

      {/* Controls*/}
      <PDFControls
        currentPage={pdfState.currentPage}
        numPages={pdfState.numPages}
        scale={pdfState.scale}
        onPageChange={handlePageChange}
        onZoom={handleZoom}
      />
    </div>
  );
});
