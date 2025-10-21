/**
 * Schema Engine Demo Page
 * Interactive demonstration of autonomous schema discovery and fetching
 */

import { SchemaEngineDemo } from '@/components/demo/SchemaEngineDemo';

export const metadata = {
  title: 'Schema Engine Demo | Dockit',
  description: 'Interactive demonstration of autonomous schema discovery and real-time fetching from exam portals',
};

export default function SchemaEngineDemoPage() {
  return <SchemaEngineDemo />;
}