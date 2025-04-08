import { pdfjs } from 'react-pdf';

/**
 * React-PDF Configuration
 */

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
