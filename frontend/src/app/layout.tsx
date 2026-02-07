import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { FlowgladProvider } from '@flowglad/nextjs';
import { AppHeader } from '@/components/AppHeader';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Block Marketplace',
  description: 'Modular AI-powered blocks with Flowglad billing',
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen font-sans`}>
        <FlowgladProvider
          requestConfig={{
            baseURL: apiBase,
            headers: {
              'X-User-Id': 'demo-user-1',
            },
          }}
        >
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 flex flex-col min-h-0">{children}</main>
          </div>
        </FlowgladProvider>
      </body>
    </html>
  );
}
