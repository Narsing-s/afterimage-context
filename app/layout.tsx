import './globals.css';
import './nav-ribbon.css';
import './ui-polish.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Afterimage — Remember what your future self needs',
  description: 'A context-memory app that leaves future you the right clue at the right moment.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
