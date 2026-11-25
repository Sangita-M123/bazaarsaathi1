import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { VoiceDukaandar } from '@/components/VoiceDukaandar';
import { TryOnModal } from '@/components/TryOnModal';
import { Toast } from '@/components/Toast';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BazaarSaathi — Voice-First Indian Shopping with Try-On & Gullak',
  description: 'Experience physical shopkeeper warmth online with Hinglish Voice Dukaandar, Virtual Try-On, Shopping Gullak Wallet & Direct Seller Help.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <Navbar />
        <main className="pb-20">{children}</main>
          <Footer />
          <Toast />
        <VoiceDukaandar />
        <TryOnModal />
      </body>
    </html>
  );
}