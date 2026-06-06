import React, { ReactNode } from 'react';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import AppLayoutContent from './AppLayoutContent';

export const metadata = {
  title: 'OnyxGoods | Village Roots, Urban Trust',
  description: 'OnyxGoods connects authentic village products directly with urban consumers. Sourced directly from rural Bangladeshi families and farmers. Pure, authentic, and fresh.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
      </head>
      <body>
        <LanguageProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </LanguageProvider>
      </body>
    </html>
  );
}
