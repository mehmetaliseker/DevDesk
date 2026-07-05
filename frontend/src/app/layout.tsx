import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevDesk',
  description: 'Open source customer support ticket management system'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
