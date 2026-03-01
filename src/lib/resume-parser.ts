// Client-side PDF and DOCX text extraction
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    return extractFromPDF(file);
  } else if (ext === 'docx' || ext === 'doc') {
    return extractFromDOCX(file);
  } else if (ext === 'txt') {
    return file.text();
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

async function extractFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ');
    pages.push(text);
  }

  return pages.join('\n\n').trim();
}

async function extractFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}
