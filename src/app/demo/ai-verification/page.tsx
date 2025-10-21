import { Metadata } from 'next';
import { AIDocumentVerificationDemo } from '@/components/demo/AIDocumentVerificationDemo';

export const metadata: Metadata = {
  title: 'AI Document Verification Demo | Dockit',
  description: 'See our AI-powered document type verification system in action using OCR, Computer Vision, and ML',
};

export default function AIVerificationDemoPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <AIDocumentVerificationDemo />
    </main>
  );
}