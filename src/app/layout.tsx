import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tv, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

const geistSans = GeistSans({
  variable: '--font-geist-sans',
  // subsets: ['latin'], // GeistSans doesn't take subsets like Google Fonts
});

export const metadata: Metadata = {
  title: 'AniView',
  description: 'Stream your favorite anime online.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-md">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <Tv className="h-7 w-7 text-accent" />
                <h1 className="text-xl font-bold">AniView</h1>
              </Link>
              <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-auto">
                <Link href="/" className="text-foreground transition-colors hover:text-accent font-medium">
                  Nuevos Capítulos
                </Link>
                <Link
                  href="/directorio"
                  className="text-foreground transition-colors hover:text-accent font-medium"
                >
                  Directorio
                </Link>
              </nav>
              <div className="flex items-center gap-2 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar anime..."
                      className="pl-8 sm:w-[200px] md:w-[200px] lg:w-[250px] rounded-full h-9"
                    />
                  </div>
                </form>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              {children}
            </main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
