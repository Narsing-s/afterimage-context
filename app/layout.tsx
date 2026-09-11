import './globals.css';
import './nav-ribbon.css';
import './ui-polish.css';
import './home-premium.css';
import './future-product.css';
import type { Metadata } from 'next';
import FutureSelfLauncher from '../components/future-self-launcher';

export const metadata: Metadata = {
  title: 'Afterimage — Remember what matters when it matters',
  description: 'A local-first contextual memory layer for your future self. Preserve decisions and resurface them when the right context returns.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<FutureSelfLauncher /></body></html>;
}
