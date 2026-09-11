import './globals.css';
import './nav-ribbon.css';
import './ui-polish.css';
import './home-premium.css';
import './future-product.css';
import './welcome.css';
import './settings/settings.css';
import './pwa.css';
import type { Metadata } from 'next';
import FutureSelfLauncher from '../components/future-self-launcher';
import WelcomeGate from '../components/welcome-gate';
import FirstMemoryGuide from '../components/first-memory-guide';
import PwaRegister from '../components/pwa-register';

export const metadata: Metadata = {
  title: 'Afterimage — Remember what matters when it matters',
  description: 'A local-first contextual memory layer for your future self. Preserve decisions and resurface them when the right context returns.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  themeColor: '#090a0c'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<WelcomeGate /><FirstMemoryGuide /><FutureSelfLauncher /><PwaRegister /></body></html>;
}
