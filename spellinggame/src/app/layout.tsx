

import ClientLayout from './ClientLayout';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';

export const metadata = {
  title: 'Word Hunt Adventure',
  description: 'Learn to spell with fun!',
};

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  weight: ['400', '700'],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${fredoka.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
