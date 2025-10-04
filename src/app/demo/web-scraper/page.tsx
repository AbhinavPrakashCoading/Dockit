/**
 * Visual Web Scraper Demo Page
 * Interactive demonstration of autonomous form scraping and analysis
 */

import { VisualWebScraperDemo } from '@/components/demo/VisualWebScraperDemo';

export const metadata = {
  title: 'Visual Web Scraper Demo | Dockit',
  description: 'Interactive demonstration of autonomous form scraping, field detection, and intelligent schema generation',
};

export default function VisualWebScraperDemoPage() {
  return <VisualWebScraperDemo />;
}